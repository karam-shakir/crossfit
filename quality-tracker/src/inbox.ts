/**
 * رصد التسليم تلقائياً من صندوق الوارد:
 * أي رسالة واردة من بريد رئيس قسم (أو من ضمن CC القسم) تُطابق كلمات ملف مطلوب
 * في العنوان أو أسماء المرفقات تُسجَّل كتسليم، ثم تُرسل رسالة الشكر في الدورة التالية.
 */
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { env } from './config.ts';
import { loadConfig, loadState, newId, saveState } from './store.ts';
import { nowIso, todayInTz } from './dates.ts';
import type { Config, InboxItem, RequiredFile, State } from './types.ts';
import { findSubmission } from './engine.ts';

const norm = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

/** مطابقة الوثائق: برقم الوثيقة (مثل 2-7-1) في اسم المرفق أو العنوان، أو بالكلمات المفتاحية. قد تُطابق عدة وثائق في رسالة واحدة */
export function matchFiles(cfg: Config, subject: string, attachments: string[]): RequiredFile[] {
  const hay = norm([subject, ...attachments].join(' | '));
  const rawHay = [subject, ...attachments].join(' | ');
  const found = new Set<RequiredFile>();
  for (const f of cfg.files) {
    if (f.number && f.number !== '—') {
      const re = new RegExp(`(^|[^0-9])${f.number.replace(/-/g, '[-_.]')}(?![0-9-])`);
      if (re.test(rawHay)) found.add(f);
    }
    if ((f.keywords || []).some((k) => norm(k) && hay.includes(norm(k)))) found.add(f);
  }
  // إذا تطابقت كلمة عامة مع عدة وثائق يفوز التطابق الأطول (الأكثر تحديداً) لكل كلمة
  return [...found];
}

export function findDeptByEmail(cfg: Config, from: string) {
  const e = from.toLowerCase();
  return cfg.departments.find((d) => d.head.email?.toLowerCase() === e || (d.cc || []).some((c) => c.toLowerCase() === e));
}

/** معالجة رسالة واحدة (مفصولة عن IMAP لتسهيل الاختبار) */
export function processIncoming(cfg: Config, state: State, mail: { from: string; subject: string; attachments: string[]; messageId?: string; date?: string }): InboxItem {
  const dept = findDeptByEmail(cfg, mail.from);
  const files = dept ? matchFiles(cfg, mail.subject, mail.attachments) : [];
  const item: InboxItem = {
    id: newId('in_'), at: nowIso(), from: mail.from, subject: mail.subject, attachments: mail.attachments,
    deptId: dept?.id, matchedFileIds: files.map((f) => f.id), messageId: mail.messageId, handled: false,
  };
  if (dept && files.length) {
    for (const file of files) {
      if (findSubmission(state, dept.id, file.id)) continue;
      state.submissions.push({
        id: newId('s_'), deptId: dept.id, fileId: file.id,
        submittedAt: mail.date || todayInTz(env.tz), source: 'email',
        evidence: `بريد: "${mail.subject}"${mail.attachments.length ? ' | مرفقات: ' + mail.attachments.join(', ') : ''}`,
        reviewStatus: 'pending', createdAt: nowIso(),
      });
    }
    item.handled = true;
  }
  state.inbox.unshift(item);
  if (state.inbox.length > 500) state.inbox = state.inbox.slice(0, 500);
  return item;
}

export async function checkInbox(): Promise<{ scanned: number; matched: number }> {
  if (!env.imap.host || !env.imap.user || !env.imap.pass) throw new Error('إعدادات IMAP غير مكتملة');
  const cfg = loadConfig();
  const state = loadState();
  const client = new ImapFlow({
    host: env.imap.host, port: env.imap.port, secure: env.imap.secure,
    auth: { user: env.imap.user, pass: env.imap.pass }, logger: false,
  });
  let scanned = 0, matched = 0;
  await client.connect();
  try {
    const lock = await client.getMailboxLock(env.imap.mailbox);
    try {
      const since = state.lastInboxCheckAt ? new Date(Date.parse(state.lastInboxCheckAt) - 86_400_000) : new Date(Date.parse(cfg.program.startDate + 'T00:00:00Z') || Date.now() - 30 * 86_400_000);
      const seen = new Set(state.inbox.map((i) => i.messageId).filter(Boolean));
      for await (const msg of client.fetch({ since }, { envelope: true, source: true })) {
        const mid = msg.envelope?.messageId;
        if (mid && seen.has(mid)) continue;
        scanned++;
        const parsed = await simpleParser(msg.source!);
        const from = parsed.from?.value?.[0]?.address || '';
        if (!findDeptByEmail(cfg, from)) continue;
        const attachments = (parsed.attachments || []).map((a) => a.filename || '').filter(Boolean);
        const date = parsed.date ? todayInTz(env.tz, parsed.date) : undefined;
        const item = processIncoming(cfg, state, { from, subject: parsed.subject || '', attachments, messageId: mid, date });
        if (item.handled) matched++;
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
  state.lastInboxCheckAt = nowIso();
  saveState(state);
  return { scanned, matched };
}
