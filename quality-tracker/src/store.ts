import fs from 'node:fs';
import path from 'node:path';
import { env } from './config.ts';
import type { Config, State, Templates } from './types.ts';

const CONFIG_FILE = 'config.json';
const STATE_FILE = 'state.json';
const TEMPLATES_FILE = 'templates.json';

function filePath(name: string) {
  return path.join(env.dataDir, name);
}

function readJson<T>(name: string, fallback?: T): T {
  const p = filePath(name);
  if (!fs.existsSync(p)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`الملف غير موجود: ${p}`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
}

function writeJson(name: string, data: unknown) {
  const p = filePath(name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

export const emptyState = (): State => ({ sentMarkers: {}, submissions: [], messages: [], inbox: [] });

export const defaultSettings = (): Config['settings'] => ({
  paused: false,
  reminderOffsetsDays: [14],
  channels: { email: true, teams: true, whatsapp: true },
  sendHour: 8,
  kickoffEnabled: true,
  thanksEnabled: true,
  acknowledgeLate: false,
  overdueNoticeEnabled: false,
  reportToViceDean: true,
  ccViceDean: false,
  sendDays: [0, 1, 2, 3, 4],
});

export function loadConfig(): Config {
  const cfg = readJson<Config>(CONFIG_FILE);
  cfg.settings = { ...defaultSettings(), ...(cfg.settings || {}) };
  cfg.departments = (cfg.departments || []).map((d) => ({ active: true, ...d }));
  cfg.files = cfg.files || [];
  return cfg;
}

export function saveConfig(cfg: Config) {
  writeJson(CONFIG_FILE, cfg);
}

export function loadState(): State {
  const s = readJson<State>(STATE_FILE, emptyState());
  return { ...emptyState(), ...s };
}

export function saveState(state: State) {
  writeJson(STATE_FILE, state);
}

export function loadTemplates(): Templates {
  return readJson<Templates>(TEMPLATES_FILE);
}

export function saveTemplates(t: Templates) {
  writeJson(TEMPLATES_FILE, t);
}

export function newId(prefix = ''): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
