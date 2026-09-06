/** تنفيذ دورة الأتمتة: تخطيط -> إرسال -> تسجيل -> حفظ الحالة */
import { env } from './config.ts';
import { deliver } from './channels/index.ts';
import { planToday } from './engine.ts';
import { loadConfig, loadState, loadTemplates, saveState } from './store.ts';
import { nowIso, todayInTz } from './dates.ts';
import type { MessageLog, PlannedMessage, State } from './types.ts';

export interface TickResult {
  today: string;
  planned: number;
  logs: MessageLog[];
}

/** هل نجحت أي قناة (أو كانت تجربة/معلّقة يدوياً) بحيث نعتبر الحدث "مُعالجاً" ولا نكرره */
function considerHandled(logs: MessageLog[]): boolean {
  return logs.some((l) => l.status === 'sent' || l.status === 'dry_run' || l.status === 'manual_pending');
}

export async function executePlan(plan: PlannedMessage[], state: State, opt: { dryRun: boolean; only?: MessageLog['channel'][] }): Promise<MessageLog[]> {
  const cfg = loadConfig();
  const all: MessageLog[] = [];
  for (const msg of plan) {
    const logs = await deliver(msg, { channels: cfg.settings.channels, dryRun: opt.dryRun, only: opt.only });
    all.push(...logs);
    if (considerHandled(logs)) {
      if (msg.marker) state.sentMarkers[msg.marker] = nowIso();
    }
  }
  state.messages.push(...all);
  if (state.messages.length > 5000) state.messages = state.messages.slice(-5000);
  return all;
}

export async function runTick(opts: { force?: boolean; dryRun?: boolean } = {}): Promise<TickResult> {
  const cfg = loadConfig();
  const state = loadState();
  const t = loadTemplates();
  const today = todayInTz(env.tz);
  const plan = planToday(cfg, state, t, { today, viceDeanEmail: env.viceDeanEmail, force: opts.force });
  const logs = await executePlan(plan, state, { dryRun: opts.dryRun ?? env.dryRun });
  state.lastTickAt = nowIso();
  saveState(state);
  return { today, planned: plan.length, logs };
}

export function previewTick(force = false): { today: string; plan: PlannedMessage[]; paused: boolean } {
  const cfg = loadConfig();
  const state = loadState();
  const t = loadTemplates();
  const today = todayInTz(env.tz);
  return { today, paused: cfg.settings.paused, plan: planToday(cfg, state, t, { today, viceDeanEmail: env.viceDeanEmail, force }) };
}
