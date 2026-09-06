/**
 * محرك الأتمتة - دوال نقية (بدون إرسال فعلي) تُنتج قائمة الرسائل المطلوب إرسالها اليوم.
 * الوثائق تُجمَّع حسب الموعد النهائي: رسالة واحدة لكل قسم لكل موعد.
 */
import type { Config, Department, PlannedMessage, RequiredFile, State, Submission, Templates } from './types.ts';
import { addDays, dayOfWeek, diffDays, formatArabic, isValidDate } from './dates.ts';
import { baseVars, deadlineGroups, filesForDepartment, render, withSignature } from './templates.ts';

export type GroupStatus = 'complete_early' | 'complete_late' | 'partial' | 'pending' | 'due_soon' | 'overdue' | 'not_applicable';

export interface Group { deadline: string; phase: string; files: RequiredFile[] }

export interface GroupCell {
  deptId: string;
  deadline: string;
  phase: string;
  status: GroupStatus;
  total: number;
  submitted: number;
  /** آخر تاريخ تسليم ضمن المجموعة */
  lastSubmittedAt?: string;
  daysLeft: number;
  reminderSent: boolean;
  thanksSent: boolean;
  files: { id: string; submission?: Submission }[];
}

export const KICKOFF_MARKER = 'kickoff';
export const reminderMarker = (deadline: string, offset: number, deptId: string) => `reminder:${deadline}:${offset}:${deptId}`;
export const overdueMarker = (deadline: string, deptId: string) => `overdue:${deadline}:${deptId}`;
export const thanksMarker = (deadline: string, deptId: string) => `thanks:${deadline}:${deptId}`;
export const lateAckMarker = (deadline: string, deptId: string) => `late_ack:${deadline}:${deptId}`;
export const reportMarker = (deadline: string) => `report:${deadline}`;

export function findSubmission(state: State, deptId: string, fileId: string): Submission | undefined {
  return state.submissions.find((s) => s.deptId === deptId && s.fileId === fileId);
}

const activeDepts = (cfg: Config) => cfg.departments.filter((d) => d.active !== false);

/** مجموعات الموعد الخاصة بقسم معين (الوثائق المطلوبة منه فقط) */
export function groupsForDept(cfg: Config, dept: Department): Group[] {
  return deadlineGroups(filesForDepartment(cfg, dept));
}

export function groupCell(cfg: Config, state: State, dept: Department, group: Group, today: string): GroupCell {
  const files = group.files.map((f) => ({ id: f.id, submission: findSubmission(state, dept.id, f.id) }));
  const subs = files.filter((f) => f.submission).map((f) => f.submission!);
  const daysLeft = diffDays(today, group.deadline);
  const lastSubmittedAt = subs.length ? subs.map((s) => s.submittedAt).sort().at(-1) : undefined;
  const maxOffset = Math.max(...cfg.settings.reminderOffsetsDays, 0);
  let status: GroupStatus;
  if (!files.length) status = 'not_applicable';
  else if (subs.length === files.length) status = lastSubmittedAt! <= group.deadline ? 'complete_early' : 'complete_late';
  else if (subs.length > 0) status = 'partial';
  else if (daysLeft < 0) status = 'overdue';
  else if (daysLeft <= maxOffset) status = 'due_soon';
  else status = 'pending';
  return {
    deptId: dept.id, deadline: group.deadline, phase: group.phase, status, total: files.length, submitted: subs.length, lastSubmittedAt, daysLeft,
    reminderSent: cfg.settings.reminderOffsetsDays.some((o) => Boolean(state.sentMarkers[reminderMarker(group.deadline, o, dept.id)])),
    thanksSent: Boolean(state.sentMarkers[thanksMarker(group.deadline, dept.id)] || state.sentMarkers[lateAckMarker(group.deadline, dept.id)]),
    files,
  };
}

/** مصفوفة الحالة: الأقسام × المواعيد */
export function statusMatrix(cfg: Config, state: State, today: string): GroupCell[] {
  const cells: GroupCell[] = [];
  for (const d of cfg.departments) {
    const own = new Map(groupsForDept(cfg, d).map((g) => [g.deadline, g]));
    for (const g of deadlineGroups(cfg.files)) {
      const mine = own.get(g.deadline);
      cells.push(mine ? groupCell(cfg, state, d, mine, today) : { deptId: d.id, deadline: g.deadline, phase: g.phase, status: 'not_applicable', total: 0, submitted: 0, daysLeft: diffDays(today, g.deadline), reminderSent: false, thanksSent: false, files: [] });
    }
  }
  return cells;
}

function recipientsOf(cfg: Config, dept: Department, viceDeanEmail: string): PlannedMessage['recipients'] {
  const cc = [...(dept.cc || [])];
  if (cfg.settings.ccViceDean && viceDeanEmail) cc.push(viceDeanEmail);
  return {
    email: dept.head.email || undefined,
    cc: cc.length ? cc : undefined,
    phone: dept.head.phone || undefined,
    teamsWebhook: dept.head.teamsWebhook || undefined,
    teamsEmail: dept.head.teamsEmail || dept.head.email || undefined,
  };
}

/** جدول حالة الأقسام لموعد معين (يُستخدم في تقرير الوكيل) */
export function statusTableText(cfg: Config, state: State, group: Group, today: string): string {
  const lines: string[] = [];
  for (const d of activeDepts(cfg)) {
    const mine = groupsForDept(cfg, d).find((g) => g.deadline === group.deadline);
    if (!mine) { lines.push(`• ${d.name}: — غير مطلوب`); continue; }
    const c = groupCell(cfg, state, d, mine, today);
    const missing = mine.files.filter((f) => !findSubmission(state, d.id, f.id)).map((f) => f.number && f.number !== '—' ? f.number : f.name);
    const label =
      c.status === 'complete_early' ? `✅ اكتمل التسليم (${c.submitted}/${c.total}) بتاريخ ${formatArabic(c.lastSubmittedAt!)} - قبل الموعد`
      : c.status === 'complete_late' ? `⚠️ اكتمل التسليم (${c.submitted}/${c.total}) بتاريخ ${formatArabic(c.lastSubmittedAt!)} - بعد الموعد`
      : c.status === 'partial' ? `🔶 تسليم جزئي (${c.submitted}/${c.total}) - الناقص: ${missing.join('، ')}`
      : c.status === 'overdue' ? `❌ لم يتم التسليم (0/${c.total}) - متأخر`
      : `⏳ لم يتم التسليم بعد (0/${c.total})`;
    lines.push(`• ${d.name}: ${label}`);
  }
  return lines.join('\n');
}

export function overallSummaryText(cfg: Config, state: State, today: string): string {
  const lines: string[] = [];
  for (const g of deadlineGroups(cfg.files)) {
    let total = 0, done = 0;
    for (const d of activeDepts(cfg)) {
      const mine = groupsForDept(cfg, d).find((x) => x.deadline === g.deadline);
      if (!mine) continue;
      const c = groupCell(cfg, state, d, mine, today);
      total += c.total; done += c.submitted;
    }
    lines.push(`• ${formatArabic(g.deadline)}${g.phase ? ` (${g.phase})` : ''}: ${done}/${total} وثيقة مستلمة من جميع الأقسام`);
  }
  return lines.join('\n');
}

export interface PlanOptions {
  today: string;
  viceDeanEmail: string;
  /** تجاهل قيود اليوم/الإيقاف (للتشغيل اليدوي) */
  force?: boolean;
}

/** الرسائل التي يجب إرسالها اليوم وفق القواعد */
export function planToday(cfg: Config, state: State, t: Templates, opt: PlanOptions): PlannedMessage[] {
  const { today, viceDeanEmail } = opt;
  const out: PlannedMessage[] = [];
  const s = cfg.settings;
  if (s.paused && !opt.force) return out;
  if (!opt.force && s.sendDays.length && !s.sendDays.includes(dayOfWeek(today))) return out;
  const depts = activeDepts(cfg);
  const sent = (m: string) => Boolean(state.sentMarkers[m]);

  // 1) رسالة الانطلاق - في يوم بداية العمل (أو أول تشغيل بعده إن لم تُرسل)
  if (s.kickoffEnabled && isValidDate(cfg.program.startDate) && today >= cfg.program.startDate && !sent(KICKOFF_MARKER)) {
    for (const d of depts) {
      const vars = baseVars(cfg, d, undefined, today);
      out.push({ kind: 'kickoff', deptId: d.id, marker: KICKOFF_MARKER, subject: render(t.kickoff.subject, vars), body: withSignature(render(t.kickoff.body, vars), t), recipients: recipientsOf(cfg, d, viceDeanEmail) });
    }
  }

  for (const d of depts) {
    for (const g of groupsForDept(cfg, d)) {
      if (!isValidDate(g.deadline)) continue;
      const missing = g.files.filter((f) => !findSubmission(state, d.id, f.id));
      const received = g.files.filter((f) => findSubmission(state, d.id, f.id));

      // 2) التذكير قبل الموعد (افتراضياً أسبوعان) بالوثائق الناقصة - مع تعويض الأيام الفائتة قبل الموعد
      for (const offset of s.reminderOffsetsDays) {
        const reminderDate = addDays(g.deadline, -offset);
        if (today < reminderDate || today > g.deadline || !missing.length) continue;
        const marker = reminderMarker(g.deadline, offset, d.id);
        if (sent(marker)) continue;
        const vars = baseVars(cfg, d, { ...g, files: missing }, today);
        out.push({ kind: 'reminder', deptId: d.id, deadline: g.deadline, fileIds: missing.map((f) => f.id), marker, subject: render(t.reminder.subject, vars), body: withSignature(render(t.reminder.body, vars), t), recipients: recipientsOf(cfg, d, viceDeanEmail) });
      }

      // 3) الشكر عند اكتمال تسليم وثائق الموعد قبل انتهائه (أو إشعار استلام إن اكتمل بعده)
      if (!missing.length && received.length) {
        const last = received.map((f) => findSubmission(state, d.id, f.id)!.submittedAt).sort().at(-1)!;
        const early = last <= g.deadline;
        const marker = early ? thanksMarker(g.deadline, d.id) : lateAckMarker(g.deadline, d.id);
        const enabled = early ? s.thanksEnabled : s.acknowledgeLate;
        if (enabled && !sent(thanksMarker(g.deadline, d.id)) && !sent(lateAckMarker(g.deadline, d.id))) {
          const tpl = early ? t.thanks : t.late_ack;
          const vars = { ...baseVars(cfg, d, g, today), submittedAt: last, submittedAtArabic: formatArabic(last) };
          out.push({ kind: early ? 'thanks' : 'late_ack', deptId: d.id, deadline: g.deadline, fileIds: g.files.map((f) => f.id), marker, subject: render(tpl.subject, vars), body: withSignature(render(tpl.body, vars), t), recipients: recipientsOf(cfg, d, viceDeanEmail) });
        }
      }

      // 4) تنبيه التأخر (اختياري) بعد انقضاء الموعد للوثائق الناقصة
      if (s.overdueNoticeEnabled && today > g.deadline && missing.length && !sent(overdueMarker(g.deadline, d.id))) {
        const vars = baseVars(cfg, d, { ...g, files: missing }, today);
        out.push({ kind: 'overdue', deptId: d.id, deadline: g.deadline, fileIds: missing.map((f) => f.id), marker: overdueMarker(g.deadline, d.id), subject: render(t.overdue.subject, vars), body: withSignature(render(t.overdue.body, vars), t), recipients: recipientsOf(cfg, d, viceDeanEmail) });
      }
    }
  }

  // 5) تقرير الوكيل في يوم كل موعد نهائي (أو أول تشغيل بعده)
  if (s.reportToViceDean && viceDeanEmail) {
    for (const g of deadlineGroups(cfg.files)) {
      if (!isValidDate(g.deadline) || today < g.deadline || sent(reportMarker(g.deadline))) continue;
      const vars = { ...baseVars(cfg, undefined, g, today), statusTable: statusTableText(cfg, state, g, today), overallSummary: overallSummaryText(cfg, state, today) };
      out.push({ kind: 'report', deadline: g.deadline, fileIds: g.files.map((f) => f.id), marker: reportMarker(g.deadline), subject: render(t.report.subject, vars), body: withSignature(render(t.report.body, vars), t), recipients: { email: viceDeanEmail } });
    }
  }

  return out;
}

/** بناء رسالة يدوية (من لوحة المتابعة) لقسم وموعد محددين */
export function buildManual(cfg: Config, state: State, t: Templates, kind: 'reminder' | 'kickoff' | 'overdue' | 'thanks', deptId: string, deadline: string | undefined, today: string, viceDeanEmail: string): PlannedMessage | undefined {
  const d = cfg.departments.find((x) => x.id === deptId);
  if (!d) return undefined;
  const recipients = recipientsOf(cfg, d, viceDeanEmail);
  if (kind === 'kickoff') {
    const vars = baseVars(cfg, d, undefined, today);
    return { kind, deptId: d.id, subject: render(t.kickoff.subject, vars), body: withSignature(render(t.kickoff.body, vars), t), recipients };
  }
  const g = groupsForDept(cfg, d).find((x) => x.deadline === deadline);
  if (!g) return undefined;
  const missing = g.files.filter((f) => !findSubmission(state, d.id, f.id));
  const received = g.files.filter((f) => findSubmission(state, d.id, f.id));
  const files = kind === 'thanks' ? received : missing.length ? missing : g.files;
  if (!files.length) return undefined;
  const last = received.map((f) => findSubmission(state, d.id, f.id)!.submittedAt).sort().at(-1) || today;
  const vars = { ...baseVars(cfg, d, { ...g, files }, today), submittedAt: last, submittedAtArabic: formatArabic(last) };
  const tpl = t[kind];
  return { kind, deptId: d.id, deadline: g.deadline, fileIds: files.map((f) => f.id), subject: render(tpl.subject, vars), body: withSignature(render(tpl.body, vars), t), recipients };
}
