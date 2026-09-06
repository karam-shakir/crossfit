/** استيراد/تصدير Excel: قالب للبيانات، استيراد الأقسام والملفات والجدول الزمني، وتصدير تقرير الحالة */
import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs';
import type { Config, Department, RequiredFile, State } from './types.ts';
import { loadConfig, loadState, saveConfig, saveState, newId } from './store.ts';
import { formatArabic, isValidDate, nowIso, todayInTz } from './dates.ts';
import { findSubmission, groupCell, groupsForDept } from './engine.ts';
import { deadlineGroups } from './templates.ts';
import { env } from './config.ts';

// أسماء الأعمدة المقبولة (عربي/إنجليزي) لكل حقل
const ALIASES: Record<string, string[]> = {
  deptId: ['رمز القسم', 'كود القسم', 'id', 'dept id', 'code'],
  deptName: ['القسم', 'اسم القسم', 'department', 'dept'],
  headName: ['رئيس القسم', 'اسم رئيس القسم', 'head', 'head name'],
  email: ['البريد', 'البريد الإلكتروني', 'البريد الالكتروني', 'الايميل', 'email', 'e-mail'],
  phone: ['الجوال', 'رقم الجوال', 'الواتساب', 'رقم الواتساب', 'whatsapp', 'phone', 'mobile'],
  teamsEmail: ['بريد teams', 'teams', 'teams email'],
  teamsWebhook: ['teams webhook', 'رابط teams', 'webhook'],
  cc: ['نسخة إلى', 'نسخة الى', 'cc', 'منسق الجودة'],
  fileId: ['رمز الملف', 'كود الملف', 'file id', 'id', 'code'],
  fileName: ['الملف', 'اسم الملف', 'الملف المطلوب', 'الوثيقة', 'الوثيقة / المتطلب', 'file', 'file name', 'document'],
  number: ['رقم الوثيقة', 'م', 'م / التصنيف', 'number', 'doc no', 'no'],
  phase: ['المرحلة', 'المرحلة الزمنية', 'phase', 'stage'],
  responsible: ['مسؤولية التنفيذ', 'المسؤول', 'responsible', 'owner'],
  description: ['الوصف', 'وصف', 'description', 'notes', 'ملاحظات'],
  deadline: ['موعد التسليم', 'الموعد النهائي', 'التاريخ النهائي', 'تاريخ التسليم', 'تاريخ المرحلة الزمنية', 'deadline', 'due', 'due date'],
  keywords: ['الكلمات المفتاحية', 'كلمات مفتاحية', 'keywords'],
  departments: ['الأقسام المعنية', 'الاقسام المعنية', 'departments'],
  submittedAt: ['تاريخ التسليم الفعلي', 'تاريخ الاستلام', 'submitted', 'submitted at', 'received'],
};

const normHeader = (s: string) => s.toString().trim().toLowerCase().replace(/\s+/g, ' ');

function headerMap(row: ExcelJS.Row): Record<string, number> {
  const map: Record<string, number> = {};
  row.eachCell((cell, col) => {
    const h = normHeader(cell.text || '');
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (map[field] === undefined && aliases.some((a) => normHeader(a) === h)) map[field] = col;
    }
  });
  return map;
}

function cellText(row: ExcelJS.Row, col?: number): string {
  if (!col) return '';
  const c = row.getCell(col);
  if (c.value instanceof Date) return c.value.toISOString().slice(0, 10);
  if (c.value && typeof c.value === 'object' && 'text' in (c.value as any)) return String((c.value as any).text).trim();
  return (c.text || '').toString().trim();
}

/** تحويل أي صيغة تاريخ شائعة إلى YYYY-MM-DD */
export function parseDate(s: string): string | undefined {
  if (!s) return undefined;
  if (isValidDate(s)) return s;
  const m = (s as string).match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/); // dd/mm/yyyy
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

const slug = (s: string, i: number) => s.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase() || `ITEM_${i + 1}`;

function findSheet(wb: ExcelJS.Workbook, names: string[]): ExcelJS.Worksheet | undefined {
  return wb.worksheets.find((ws) => names.some((n) => normHeader(ws.name).includes(normHeader(n))));
}

export interface ImportResult { departments: number; files: number; submissions: number; settings: number; warnings: string[] }

/** استيراد ملف Excel: يُحدّث الأقسام/الملفات الموجودة بنفس الرمز أو الاسم ويضيف الجديدة */
export async function importExcel(file: string, opts: { replace?: boolean } = {}): Promise<ImportResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const cfg = loadConfig();
  const state = loadState();
  const res: ImportResult = { departments: 0, files: 0, submissions: 0, settings: 0, warnings: [] };

  const deptSheet = findSheet(wb, ['الأقسام', 'الاقسام', 'departments', 'contacts']);
  if (deptSheet) {
    const map = headerMap(deptSheet.getRow(1));
    if (map.deptName === undefined) res.warnings.push(`ورقة "${deptSheet.name}": لم يُعثر على عمود اسم القسم`);
    else {
      const imported: Department[] = [];
      deptSheet.eachRow((row, n) => {
        if (n === 1) return;
        const name = cellText(row, map.deptName);
        if (!name) return;
        const existing = cfg.departments.find((d) => d.name === name || (map.deptId && d.id === cellText(row, map.deptId)));
        const id = cellText(row, map.deptId) || existing?.id || slug(name, imported.length);
        const ccRaw = cellText(row, map.cc);
        const d: Department = {
          id, name, shortName: existing?.shortName || name.replace(/^قسم\s+/, ''),
          head: {
            name: cellText(row, map.headName) || existing?.head.name || `رئيس ${name}`,
            email: cellText(row, map.email) || existing?.head.email || '',
            phone: cellText(row, map.phone) || existing?.head.phone || '',
            teamsEmail: cellText(row, map.teamsEmail) || existing?.head.teamsEmail || '',
            teamsWebhook: cellText(row, map.teamsWebhook) || existing?.head.teamsWebhook || '',
          },
          cc: ccRaw ? ccRaw.split(/[;,، ]+/).filter(Boolean) : existing?.cc || [],
          active: existing?.active ?? true,
        };
        imported.push(d);
      });
      if (opts.replace) cfg.departments = imported;
      else for (const d of imported) {
        const i = cfg.departments.findIndex((x) => x.id === d.id);
        if (i >= 0) cfg.departments[i] = d; else cfg.departments.push(d);
      }
      res.departments = imported.length;
    }
  }

  const fileSheet = findSheet(wb, ['الملفات', 'الجدول الزمني', 'files', 'schedule', 'timeline']);
  if (fileSheet) {
    const map = headerMap(fileSheet.getRow(1));
    if (map.fileName === undefined || map.deadline === undefined) res.warnings.push(`ورقة "${fileSheet.name}": يلزم عمودا اسم الملف وموعد التسليم`);
    else {
      const imported: RequiredFile[] = [];
      fileSheet.eachRow((row, n) => {
        if (n === 1) return;
        const name = cellText(row, map.fileName);
        if (!name) return;
        const deadline = parseDate(cellText(row, map.deadline));
        if (!deadline) { res.warnings.push(`صف ${n}: تاريخ غير صالح للملف "${name}"`); return; }
        const number = cellText(row, map.number) || undefined;
        const existing = cfg.files.find((f) => f.name === name || (map.fileId && f.id === cellText(row, map.fileId)) || (number && f.number === number));
        const id = cellText(row, map.fileId) || existing?.id || number || `F${String(imported.length + 1).padStart(2, '0')}`;
        const kw = cellText(row, map.keywords);
        const deps = cellText(row, map.departments);
        imported.push({
          id, number: number || existing?.number, name, phase: cellText(row, map.phase) || existing?.phase, responsible: cellText(row, map.responsible) || existing?.responsible,
          description: cellText(row, map.description) || existing?.description, deadline,
          keywords: kw ? kw.split(/[;,،]+/).map((s) => s.trim()).filter(Boolean) : existing?.keywords || [name],
          departments: deps && !/^(all|الكل|جميع)/i.test(deps) ? deps.split(/[;,،]+/).map((s) => s.trim()).filter(Boolean) : undefined,
        });
      });
      if (opts.replace) cfg.files = imported;
      else for (const f of imported) {
        const i = cfg.files.findIndex((x) => x.id === f.id);
        if (i >= 0) cfg.files[i] = f; else cfg.files.push(f);
      }
      res.files = imported.length;
    }
  }

  const subSheet = findSheet(wb, ['التسليمات', 'submissions']);
  if (subSheet) {
    const map = headerMap(subSheet.getRow(1));
    subSheet.eachRow((row, n) => {
      if (n === 1) return;
      const dName = cellText(row, map.deptName) || cellText(row, map.deptId);
      const fName = cellText(row, map.fileName) || cellText(row, map.fileId);
      const date = parseDate(cellText(row, map.submittedAt) || cellText(row, map.deadline));
      const d = cfg.departments.find((x) => x.id === dName || x.name === dName);
      const fNum = cellText(row, map.number);
      const f = cfg.files.find((x) => x.id === fName || x.name === fName || (fNum && (x.number === fNum || x.id === fNum)));
      if (!d || !f || !date) { if (dName || fName) res.warnings.push(`تسليمات صف ${n}: تعذر المطابقة (${dName} / ${fName})`); return; }
      if (state.submissions.some((s) => s.deptId === d.id && s.fileId === f.id)) return;
      state.submissions.push({ id: newId('s_'), deptId: d.id, fileId: f.id, submittedAt: date, source: 'manual', note: 'مستورد من Excel', reviewStatus: 'pending', createdAt: nowIso() });
      res.submissions++;
    });
  }

  const setSheet = findSheet(wb, ['الإعدادات', 'الاعدادات', 'settings']);
  if (setSheet) {
    setSheet.eachRow((row) => {
      const key = normHeader(cellText(row, 1));
      const val = cellText(row, 2);
      if (!key || !val) return;
      const set = (fn: () => void) => { fn(); res.settings++; };
      if (/بداية|start/.test(key)) { const d = parseDate(val); if (d) set(() => (cfg.program.startDate = d)); }
      else if (/اسم البرنامج|program/.test(key)) set(() => (cfg.program.name = val));
      else if (/العام|year/.test(key)) set(() => (cfg.program.academicYear = val));
      else if (/الفصل|semester/.test(key)) set(() => (cfg.program.semester = val));
      else if (/تذكير|reminder/.test(key)) set(() => (cfg.settings.reminderOffsetsDays = val.split(/[;,،\s]+/).map(Number).filter((n) => n > 0)));
      else if (/ساعة|hour/.test(key)) set(() => (cfg.settings.sendHour = Number(val) || 8));
    });
  }

  saveConfig(cfg);
  saveState(state);
  return res;
}

function styleHeader(ws: ExcelJS.Worksheet) {
  ws.views = [{ rightToLeft: true, state: 'frozen', ySplit: 1 }];
  const h = ws.getRow(1);
  h.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  h.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  h.height = 28;
}

/** إنشاء قالب Excel لتعبئة بيانات الأقسام والملفات والجدول الزمني */
export async function createTemplate(out: string): Promise<string> {
  const cfg = loadConfig();
  const wb = new ExcelJS.Workbook();
  const d = wb.addWorksheet('الأقسام');
  d.columns = [
    { header: 'رمز القسم', key: 'id', width: 12 }, { header: 'القسم', key: 'name', width: 42 }, { header: 'اسم رئيس القسم', key: 'head', width: 32 },
    { header: 'البريد الإلكتروني', key: 'email', width: 32 }, { header: 'رقم الواتساب', key: 'phone', width: 18 },
    { header: 'بريد Teams', key: 'teams', width: 30 }, { header: 'Teams Webhook', key: 'webhook', width: 40 }, { header: 'نسخة إلى', key: 'cc', width: 30 },
  ];
  for (const x of cfg.departments) d.addRow({ id: x.id, name: x.name, head: x.head.name, email: x.head.email, phone: x.head.phone, teams: x.head.teamsEmail, webhook: x.head.teamsWebhook, cc: (x.cc || []).join('; ') });
  styleHeader(d);

  const f = wb.addWorksheet('الملفات');
  f.columns = [
    { header: 'رمز الملف', key: 'id', width: 12 }, { header: 'رقم الوثيقة', key: 'number', width: 12 }, { header: 'المرحلة', key: 'phase', width: 40 }, { header: 'الوثيقة', key: 'name', width: 45 },
    { header: 'مسؤولية التنفيذ', key: 'resp', width: 30 }, { header: 'الوصف', key: 'desc', width: 45 },
    { header: 'الموعد النهائي', key: 'deadline', width: 16 }, { header: 'الكلمات المفتاحية', key: 'kw', width: 35 }, { header: 'الأقسام المعنية', key: 'deps', width: 25 },
  ];
  for (const x of cfg.files) f.addRow({ id: x.id, number: x.number, phase: x.phase, name: x.name, resp: x.responsible, desc: x.description, deadline: x.deadline, kw: (x.keywords || []).join('; '), deps: (x.departments || []).join('; ') || 'الكل' });
  styleHeader(f);

  const s = wb.addWorksheet('التسليمات');
  s.columns = [{ header: 'القسم', key: 'd', width: 42 }, { header: 'رقم الوثيقة', key: 'n', width: 12 }, { header: 'الوثيقة', key: 'f', width: 45 }, { header: 'تاريخ التسليم الفعلي', key: 'at', width: 20 }];
  styleHeader(s);

  const st = wb.addWorksheet('الإعدادات');
  st.columns = [{ header: 'الإعداد', key: 'k', width: 30 }, { header: 'القيمة', key: 'v', width: 40 }];
  st.addRows([
    { k: 'تاريخ بداية العمل', v: cfg.program.startDate }, { k: 'اسم البرنامج', v: cfg.program.name },
    { k: 'العام الجامعي', v: cfg.program.academicYear }, { k: 'الفصل الدراسي', v: cfg.program.semester },
    { k: 'أيام التذكير قبل الموعد', v: cfg.settings.reminderOffsetsDays.join(', ') }, { k: 'ساعة الإرسال', v: String(cfg.settings.sendHour) },
  ]);
  styleHeader(st);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  await wb.xlsx.writeFile(out);
  return out;
}

const FILL = { early: 'FFC6EFCE', late: 'FFFFEB9C', missing: 'FFF2F2F2', overdue: 'FFFFC7CE', na: 'FFEEEEEE' };

function fileState(cfg: Config, state: State, deptId: string, fileId: string, deadline: string, today: string): { label: string; fill: string; date?: string } {
  const sub = findSubmission(state, deptId, fileId);
  if (sub) return sub.submittedAt <= deadline ? { label: 'تم التسليم (قبل الموعد)', fill: FILL.early, date: sub.submittedAt } : { label: 'تم التسليم (بعد الموعد)', fill: FILL.late, date: sub.submittedAt };
  return today > deadline ? { label: 'لم يُسلّم - متأخر', fill: FILL.overdue } : { label: 'لم يُسلّم بعد', fill: FILL.missing };
}

/** تصدير تقرير الحالة: مصفوفة الوثائق × الأقسام + نموذج متابعة لكل قسم + سجل الرسائل */
export async function exportStatus(out: string): Promise<string> {
  const cfg = loadConfig();
  const state = loadState();
  const today = todayInTz(env.tz);
  const wb = new ExcelJS.Workbook();

  // 1) المصفوفة العامة
  const ws = wb.addWorksheet('حالة التسليم');
  ws.columns = [{ header: 'المرحلة', width: 34 }, { header: 'رقم الوثيقة', width: 12 }, { header: 'الوثيقة', width: 48 }, { header: 'الموعد النهائي', width: 22 }, ...cfg.departments.map((d) => ({ header: d.shortName || d.name, width: 26 }))];
  for (const g of deadlineGroups(cfg.files)) {
    for (const f of g.files) {
      const row = ws.addRow([g.phase, f.number || '', f.name, formatArabic(g.deadline), ...cfg.departments.map((d) => {
        if (!groupsForDept(cfg, d).some((x) => x.files.some((y) => y.id === f.id))) return 'غير مطلوب';
        const st = fileState(cfg, state, d.id, f.id, f.deadline, today);
        return st.date ? `${st.label}\n${st.date}` : st.label;
      })]);
      cfg.departments.forEach((d, i) => {
        const cell = row.getCell(i + 5);
        const applicable = groupsForDept(cfg, d).some((x) => x.files.some((y) => y.id === f.id));
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: applicable ? fileState(cfg, state, d.id, f.id, f.deadline, today).fill : FILL.na } };
        cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      });
      row.height = 32;
    }
  }
  styleHeader(ws);

  // 2) نموذج متابعة تسليم وثائق الجودة لكل قسم (بنفس تنسيق نموذج الوكالة)
  for (const d of cfg.departments) {
    const sheet = wb.addWorksheet((d.shortName || d.name).slice(0, 28).replace(/[\[\]\*\?\/\\:]/g, ' '));
    sheet.addRow(['نموذج متابعة تسليم وثائق الجودة للبرامج الأكاديمية وفقاً للجدول الزمني']).font = { bold: true, size: 14 };
    sheet.addRow([`القسم: ${d.name}`]);
    sheet.addRow([`رئيس القسم: ${d.head.name}`]);
    sheet.addRow([`تاريخ التقرير: ${formatArabic(today)}`]);
    sheet.addRow([]);
    const header = sheet.addRow(['تاريخ المرحلة الزمنية', 'رقم الوثيقة', 'الوثيقة', 'مسؤولية التنفيذ', 'تم التسليم', 'تاريخ التسليم', 'الملاحظات']);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    sheet.columns = [{ width: 30 }, { width: 12 }, { width: 50 }, { width: 30 }, { width: 14 }, { width: 16 }, { width: 40 }];
    for (const g of groupsForDept(cfg, d)) {
      for (const f of g.files) {
        const sub = findSubmission(state, d.id, f.id);
        const st = fileState(cfg, state, d.id, f.id, f.deadline, today);
        const row = sheet.addRow([`${g.phase ? g.phase + '\n' : ''}${formatArabic(g.deadline)}`, f.number || '', f.name, f.responsible || '', sub ? '✓' : '✗', sub?.submittedAt || '', sub?.note || (sub ? '' : st.label)]);
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: st.fill } };
        row.alignment = { wrapText: true, vertical: 'middle' };
      }
    }
    const c = groupsForDept(cfg, d).map((g) => groupCell(cfg, state, d, g, today));
    const total = c.reduce((a, x) => a + x.total, 0), done = c.reduce((a, x) => a + x.submitted, 0);
    sheet.addRow([]);
    sheet.addRow([`الإجمالي: ${done} من ${total} وثيقة (${total ? Math.round((done / total) * 100) : 0}%)`]).font = { bold: true };
    sheet.views = [{ rightToLeft: true }];
  }

  // 3) سجل الرسائل
  const ml = wb.addWorksheet('سجل الرسائل');
  ml.columns = [
    { header: 'التاريخ والوقت', width: 22 }, { header: 'النوع', width: 12 }, { header: 'القناة', width: 12 }, { header: 'القسم', width: 40 },
    { header: 'الموعد', width: 14 }, { header: 'إلى', width: 30 }, { header: 'الحالة', width: 14 }, { header: 'العنوان', width: 50 }, { header: 'خطأ', width: 40 },
  ];
  for (const m of [...state.messages].reverse()) {
    ml.addRow([m.at.replace('T', ' ').slice(0, 19), m.kind, m.channel, cfg.departments.find((d) => d.id === m.deptId)?.name || '', m.deadline || '', m.to, m.status, m.subject, m.error || '']);
  }
  styleHeader(ml);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  await wb.xlsx.writeFile(out);
  return out;
}
