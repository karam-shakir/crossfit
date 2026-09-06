import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planToday, groupCell, groupsForDept, statusMatrix, buildManual, KICKOFF_MARKER, reminderMarker, thanksMarker } from '../src/engine.ts';
import { processIncoming, matchFiles } from '../src/inbox.ts';
import { addDays, diffDays, formatArabic } from '../src/dates.ts';
import { parseDate } from '../src/excel.ts';
import { hashPassword, verifyPassword } from '../src/auth.ts';
import type { Config, State, Templates } from '../src/types.ts';
import { defaultSettings, emptyState } from '../src/store.ts';
import fs from 'node:fs';

const templates: Templates = JSON.parse(fs.readFileSync(new URL('../data/templates.json', import.meta.url), 'utf8'));

function makeConfig(): Config {
  return {
    program: { name: 'وثائق الجودة', academicYear: '1447هـ', semester: 'الفصل الثاني', startDate: '2026-02-01' },
    departments: [
      { id: 'CYS', name: 'قسم الأمن السيبراني', head: { name: 'د. أحمد', email: 'cys@x.edu', phone: '0501234567' }, active: true },
      { id: 'DS', name: 'قسم علم البيانات', head: { name: 'د. سارة', email: 'ds@x.edu' }, active: true },
    ],
    files: [
      { id: '2-7-1', number: '2-7-1', name: 'خطة تحسين البرنامج', phase: 'المرحلة الأولى', deadline: '2026-02-20', keywords: ['خطة تحسين'] },
      { id: '7-2-1', number: '7-2-1', name: 'الخطة التشغيلية للبرنامج', phase: 'المرحلة الأولى', deadline: '2026-02-28', keywords: ['الخطة التشغيلية'] },
      { id: '2-7-2', number: '2-7-2', name: 'تقرير خطة تحسين البرنامج', phase: 'المرحلة الثانية', deadline: '2026-04-05', keywords: ['تقرير خطة تحسين'] },
      { id: '3-2', number: '3-2', name: 'توصيفات المقررات المحدثة', phase: 'المرحلة الثانية', deadline: '2026-04-05', keywords: ['توصيفات المقررات'] },
    ],
    settings: { ...defaultSettings(), sendDays: [0, 1, 2, 3, 4, 5, 6] },
  };
}
const opt = (today: string) => ({ today, viceDeanEmail: 'vd@x.edu' });
const kicked = (): State => ({ ...emptyState(), sentMarkers: { [KICKOFF_MARKER]: 'x' } });
const sub = (deptId: string, fileId: string, submittedAt: string) => ({ id: 's_' + fileId + deptId, deptId, fileId, submittedAt, source: 'manual' as const, reviewStatus: 'pending' as const, createdAt: 'x' });

test('لا رسائل قبل تاريخ البداية', () => {
  assert.equal(planToday(makeConfig(), emptyState(), templates, opt('2026-01-15')).length, 0);
});

test('رسالة الانطلاق لكل الأقسام يوم البداية وتحتوي الجدول الزمني بالمراحل', () => {
  const plan = planToday(makeConfig(), emptyState(), templates, opt('2026-02-01'));
  const kick = plan.filter((p) => p.kind === 'kickoff');
  assert.equal(kick.length, 2);
  assert.equal(kick[0].marker, KICKOFF_MARKER);
  assert.match(kick[0].body, /■ المرحلة الأولى/);
  assert.match(kick[0].body, /الجمعة 20 فبراير 2026/);
  assert.match(kick[0].body, /\(2-7-1\) خطة تحسين البرنامج/);
  assert.equal(kick[0].recipients.email, 'cys@x.edu');
  assert.equal(kick[0].recipients.phone, '0501234567');
  // لا تتكرر
  assert.equal(planToday(makeConfig(), kicked(), templates, opt('2026-02-02')).filter((p) => p.kind === 'kickoff').length, 0);
});

test('تذكير واحد لكل قسم لكل موعد قبل أسبوعين، بالوثائق الناقصة فقط', () => {
  const cfg = makeConfig();
  const state = kicked();
  assert.equal(planToday(cfg, state, templates, opt('2026-03-21')).filter((p) => p.kind === 'reminder').length, 0);
  // 2026-04-05 - 14 = 2026-03-22 (موعد يضم وثيقتين)
  const plan = planToday(cfg, state, templates, opt('2026-03-22')).filter((p) => p.kind === 'reminder');
  assert.equal(plan.length, 2);
  assert.equal(plan[0].deadline, '2026-04-05');
  assert.deepEqual(plan[0].fileIds, ['2-7-2', '3-2']);
  assert.match(plan[0].subject, /المرحلة الثانية/);
  assert.match(plan[0].subject, /متبقي 14 يوماً/);
  assert.match(plan[0].body, /1\. \(2-7-2\) تقرير خطة تحسين البرنامج\n2\. \(3-2\) توصيفات المقررات المحدثة/);
  assert.equal(plan[0].marker, reminderMarker('2026-04-05', 14, 'CYS'));
  // قسم سلّم وثيقة واحدة: يُذكَّر بالناقصة فقط، وقسم أكمل: لا يُذكَّر
  state.submissions.push(sub('CYS', '2-7-2', '2026-03-10'), sub('DS', '2-7-2', '2026-03-10'), sub('DS', '3-2', '2026-03-11'));
  state.sentMarkers[thanksMarker('2026-04-05', 'DS')] = 'x';
  const plan2 = planToday(cfg, state, templates, opt('2026-03-22')).filter((p) => p.kind === 'reminder');
  assert.equal(plan2.length, 1);
  assert.equal(plan2[0].deptId, 'CYS');
  assert.deepEqual(plan2[0].fileIds, ['3-2']);
});

test('التذكير الفائت يُعوَّض قبل الموعد ولا يُرسل بعده', () => {
  const cfg = makeConfig();
  assert.equal(planToday(cfg, kicked(), templates, opt('2026-02-15')).filter((p) => p.kind === 'reminder' && p.deadline === '2026-02-20').length, 2);
  assert.equal(planToday(cfg, kicked(), templates, opt('2026-02-21')).filter((p) => p.kind === 'reminder' && p.deadline === '2026-02-20').length, 0);
});

test('الشكر عند اكتمال تسليم وثائق الموعد قبل انتهائه فقط، ومرة واحدة', () => {
  const cfg = makeConfig();
  const state = kicked();
  state.submissions.push(sub('CYS', '2-7-2', '2026-03-20')); // جزئي
  assert.equal(planToday(cfg, state, templates, opt('2026-03-21')).filter((p) => p.kind === 'thanks').length, 0);
  state.submissions.push(sub('CYS', '3-2', '2026-03-25')); // اكتمل قبل الموعد
  const plan = planToday(cfg, state, templates, opt('2026-03-26'));
  const thanks = plan.filter((p) => p.kind === 'thanks');
  assert.equal(thanks.length, 1);
  assert.equal(thanks[0].deptId, 'CYS');
  assert.equal(thanks[0].marker, thanksMarker('2026-04-05', 'CYS'));
  assert.match(thanks[0].body, /الأربعاء 25 مارس 2026/);
  assert.match(thanks[0].body, /سيتم مراجعة الملفات المستلمة/);
  assert.equal(plan.filter((p) => p.kind === 'reminder' && p.deptId === 'CYS').length, 0);
  state.sentMarkers[thanksMarker('2026-04-05', 'CYS')] = 'x';
  assert.equal(planToday(cfg, state, templates, opt('2026-03-27')).filter((p) => p.kind === 'thanks').length, 0);
  // اكتمال بعد الموعد: لا شكر، وإشعار استلام فقط إن فُعِّل
  state.submissions.push(sub('DS', '2-7-2', '2026-04-01'), sub('DS', '3-2', '2026-04-07'));
  assert.equal(planToday(cfg, state, templates, opt('2026-04-08')).filter((p) => p.kind === 'thanks' || p.kind === 'late_ack').length, 0);
  cfg.settings.acknowledgeLate = true;
  const late = planToday(cfg, state, templates, opt('2026-04-08')).filter((p) => p.kind === 'late_ack');
  assert.equal(late.length, 1);
  assert.equal(late[0].deptId, 'DS');
});

test('تقرير الوكيل يوم الموعد بحالة كل قسم والوثائق الناقصة', () => {
  const cfg = makeConfig();
  const state = kicked();
  state.submissions.push(sub('CYS', '2-7-2', '2026-03-20'));
  const rep = planToday(cfg, state, templates, opt('2026-04-05')).filter((p) => p.kind === 'report');
  assert.equal(rep.length, 3); // ثلاثة مواعيد انقضت/حلّت ولم تُرسل تقاريرها
  const r = rep.find((x) => x.deadline === '2026-04-05')!;
  assert.equal(r.recipients.email, 'vd@x.edu');
  assert.match(r.body, /قسم الأمن السيبراني: 🔶 تسليم جزئي \(1\/2\) - الناقص: 3-2/);
  assert.match(r.body, /قسم علم البيانات: ⏳ لم يتم التسليم بعد \(0\/2\)/);
  assert.match(r.body, /1\/4 وثيقة مستلمة/);
});

test('تنبيه التأخر بعد الموعد عند التفعيل', () => {
  const cfg = makeConfig();
  cfg.settings.overdueNoticeEnabled = true;
  const state = kicked();
  state.submissions.push(sub('CYS', '2-7-1', '2026-02-10'));
  const od = planToday(cfg, state, templates, opt('2026-02-21')).filter((p) => p.kind === 'overdue');
  assert.deepEqual(od.map((p) => p.deptId), ['DS']);
});

test('الإيقاف المؤقت وأيام الإرسال', () => {
  const cfg = makeConfig();
  cfg.settings.paused = true;
  assert.equal(planToday(cfg, emptyState(), templates, opt('2026-02-01')).length, 0);
  assert.equal(planToday(cfg, emptyState(), templates, { ...opt('2026-02-01'), force: true }).length, 2);
  cfg.settings.paused = false;
  cfg.settings.sendDays = [0, 1, 2, 3, 4];
  assert.equal(planToday(cfg, emptyState(), templates, opt('2026-02-06')).length, 0); // الجمعة
  assert.equal(planToday(cfg, emptyState(), templates, opt('2026-02-08')).filter((p) => p.kind === 'kickoff').length, 2); // الأحد
});

test('حالة خلية الموعد ومصفوفة الحالة', () => {
  const cfg = makeConfig();
  const state = emptyState();
  const d = cfg.departments[0];
  const g = groupsForDept(cfg, d).find((x) => x.deadline === '2026-04-05')!;
  assert.equal(groupCell(cfg, state, d, g, '2026-03-01').status, 'pending');
  assert.equal(groupCell(cfg, state, d, g, '2026-03-25').status, 'due_soon');
  assert.equal(groupCell(cfg, state, d, g, '2026-04-06').status, 'overdue');
  state.submissions.push(sub('CYS', '2-7-2', '2026-04-01'));
  assert.equal(groupCell(cfg, state, d, g, '2026-04-06').status, 'partial');
  state.submissions.push(sub('CYS', '3-2', '2026-04-04'));
  const c = groupCell(cfg, state, d, g, '2026-04-06');
  assert.equal(c.status, 'complete_early');
  assert.equal(c.lastSubmittedAt, '2026-04-04');
  assert.equal(statusMatrix(cfg, state, '2026-04-06').length, 2 * 3);
});

test('الرسائل اليدوية: تذكير بالناقص وشكر بالمستلم', () => {
  const cfg = makeConfig();
  const state = emptyState();
  state.submissions.push(sub('CYS', '2-7-2', '2026-03-20'));
  const rem = buildManual(cfg, state, templates, 'reminder', 'CYS', '2026-04-05', '2026-03-21', 'vd@x.edu')!;
  assert.deepEqual(rem.fileIds, ['3-2']);
  const th = buildManual(cfg, state, templates, 'thanks', 'CYS', '2026-04-05', '2026-03-21', 'vd@x.edu')!;
  assert.deepEqual(th.fileIds, ['2-7-2']);
  assert.equal(buildManual(cfg, state, templates, 'thanks', 'DS', '2026-04-05', '2026-03-21', 'vd@x.edu'), undefined);
});

test('رصد التسليم من البريد برقم الوثيقة أو الكلمات، وعدة وثائق في رسالة واحدة', () => {
  const cfg = makeConfig();
  assert.deepEqual(matchFiles(cfg, 'تسليم وثائق المرحلة الثانية', ['2-7-2 تقرير خطة التحسين.docx', '3-2_Course_Specs.zip']).map((f) => f.id).sort(), ['2-7-2', '3-2']);
  assert.deepEqual(matchFiles(cfg, 'الخطة التشغيلية للبرنامج', []).map((f) => f.id), ['7-2-1']);
  assert.equal(matchFiles(cfg, 'اجتماع', []).length, 0);
  // 2-7-1 يجب ألا يطابق 2-7-2 أو 12-7-1
  assert.deepEqual(matchFiles(cfg, 'مرفق', ['12-7-1.pdf']).map((f) => f.id), []);
  const state = emptyState();
  const item = processIncoming(cfg, state, { from: 'CYS@x.edu', subject: 'تسليم', attachments: ['2-7-2.pdf', '3-2.pdf'], date: '2026-03-28' });
  assert.equal(item.handled, true);
  assert.equal(state.submissions.length, 2);
  assert.equal(state.submissions[0].source, 'email');
  const other = processIncoming(cfg, state, { from: 'someone@x.edu', subject: '2-7-1', attachments: [] });
  assert.equal(other.handled, false);
  assert.equal(state.submissions.length, 2);
});

test('أدوات التواريخ والتحليل وكلمات المرور', () => {
  assert.equal(addDays('2026-04-05', -14), '2026-03-22');
  assert.equal(diffDays('2026-03-22', '2026-04-05'), 14);
  assert.equal(formatArabic('2026-09-03'), 'الخميس 3 سبتمبر 2026');
  assert.equal(parseDate('20/2/2026'), '2026-02-20');
  assert.equal(parseDate('2026-02-20'), '2026-02-20');
  const h = hashPassword('secret123');
  assert.equal(verifyPassword('secret123', h), true);
  assert.equal(verifyPassword('wrong', h), false);
});
