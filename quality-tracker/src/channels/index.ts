import { channelConfigured, env } from '../config.ts';
import type { Channel, MessageLog, PlannedMessage, Settings } from '../types.ts';
import { sendEmail } from './email.ts';
import { sendTeamsWebhook, teamsDeepLink } from './teams.ts';
import { sendWhatsApp, whatsappLink } from './whatsapp.ts';
import { newId } from '../store.ts';
import { nowIso } from '../dates.ts';

export interface DeliveryOptions {
  channels: Settings['channels'];
  dryRun: boolean;
  /** إجبار قناة معينة فقط (للإرسال اليدوي) */
  only?: Channel[];
}

function log(msg: PlannedMessage, channel: Channel, to: string, status: MessageLog['status'], extra: Partial<MessageLog> = {}): MessageLog {
  return { id: newId('m_'), at: nowIso(), kind: msg.kind, channel, deptId: msg.deptId, deadline: msg.deadline, fileIds: msg.fileIds, to, subject: msg.subject, body: msg.body, status, ...extra };
}

/** إرسال رسالة واحدة عبر كل القنوات المفعّلة والمتاحة، وإرجاع سجل لكل محاولة */
export async function deliver(msg: PlannedMessage, opt: DeliveryOptions): Promise<MessageLog[]> {
  const logs: MessageLog[] = [];
  const want = (c: Channel) => opt.channels[c] && (!opt.only || opt.only.includes(c));
  const r = msg.recipients;

  // البريد الإلكتروني
  if (want('email') && r.email) {
    if (opt.dryRun) logs.push(log(msg, 'email', r.email, 'dry_run'));
    else if (!channelConfigured.email()) logs.push(log(msg, 'email', r.email, 'failed', { error: 'إعدادات SMTP غير مكتملة' }));
    else {
      try {
        await sendEmail(r.email, msg.subject, msg.body, r.cc);
        logs.push(log(msg, 'email', r.email, 'sent'));
      } catch (e: any) {
        logs.push(log(msg, 'email', r.email, 'failed', { error: String(e?.message || e) }));
      }
    }
  }

  // Teams
  if (want('teams') && (r.teamsWebhook || r.teamsEmail)) {
    const manualLink = r.teamsEmail ? teamsDeepLink(r.teamsEmail, msg.subject, msg.body) : undefined;
    const to = r.teamsEmail || 'webhook';
    if (opt.dryRun) logs.push(log(msg, 'teams', to, 'dry_run', { manualLink }));
    else if (!r.teamsWebhook) logs.push(log(msg, 'teams', to, 'manual_pending', { manualLink, error: 'لا يوجد Webhook للقسم - متاح رابط إرسال يدوي' }));
    else {
      try {
        await sendTeamsWebhook(r.teamsWebhook, msg.subject, msg.body);
        logs.push(log(msg, 'teams', to, 'sent', { manualLink }));
      } catch (e: any) {
        logs.push(log(msg, 'teams', to, 'failed', { error: String(e?.message || e), manualLink }));
      }
    }
  }

  // WhatsApp
  if (want('whatsapp') && r.phone) {
    const manualLink = whatsappLink(r.phone, msg.subject, msg.body);
    if (opt.dryRun) logs.push(log(msg, 'whatsapp', r.phone, 'dry_run', { manualLink }));
    else if (!channelConfigured.whatsapp()) logs.push(log(msg, 'whatsapp', r.phone, 'manual_pending', { manualLink, error: 'مزود WhatsApp غير مُعد - متاح رابط إرسال يدوي' }));
    else {
      try {
        await sendWhatsApp(r.phone, msg.subject, msg.body);
        logs.push(log(msg, 'whatsapp', r.phone, 'sent', { manualLink }));
      } catch (e: any) {
        logs.push(log(msg, 'whatsapp', r.phone, 'failed', { error: String(e?.message || e), manualLink }));
      }
    }
  }

  if (!logs.length) logs.push(log(msg, 'email', r.email || '-', 'skipped', { error: 'لا توجد قناة مفعّلة أو بيانات اتصال للمستلم' }));
  return logs;
}

export const isDryRun = () => env.dryRun;
