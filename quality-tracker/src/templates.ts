import type { Config, Department, RequiredFile, Templates } from './types.ts';
import { diffDays, formatArabic } from './dates.ts';

export type Vars = Record<string, string | number | undefined>;

/** استبدال {{name}} بالقيم، مع إزالة الأسطر الفارغة الزائدة */
export function render(tpl: string, vars: Vars): string {
  return tpl
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (vars[k] === undefined || vars[k] === null ? '' : String(vars[k])))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function filesForDepartment(cfg: Config, dept: Department): RequiredFile[] {
  return cfg.files.filter((f) => !f.departments || f.departments.length === 0 || f.departments.includes(dept.id));
}

/** سطر وصف وثيقة: (2-7-1) خطة تحسين البرنامج - مسؤولية التنفيذ: ... */
export function fileLine(f: RequiredFile): string {
  const num = f.number && f.number !== '—' ? `(${f.number}) ` : '';
  const resp = f.responsible ? ` — مسؤولية التنفيذ: ${f.responsible}` : '';
  return `${num}${f.name}${resp}`;
}

export function fileListText(files: RequiredFile[]): string {
  return files.map((f, i) => `${i + 1}. ${fileLine(f)}`).join('\n');
}

/** مجموعات الوثائق حسب الموعد النهائي (مرتبة زمنياً) */
export function deadlineGroups(files: RequiredFile[]): { deadline: string; phase: string; files: RequiredFile[] }[] {
  const map = new Map<string, RequiredFile[]>();
  for (const f of files) map.set(f.deadline, [...(map.get(f.deadline) || []), f]);
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([deadline, fs]) => ({ deadline, phase: fs.find((f) => f.phase)?.phase || '', files: fs }));
}

/** الجدول الزمني الكامل للقسم: المرحلة ← الموعد ← الوثائق */
export function scheduleText(cfg: Config, dept: Department): string {
  const groups = deadlineGroups(filesForDepartment(cfg, dept));
  const out: string[] = [];
  let lastPhase = '';
  for (const g of groups) {
    if (g.phase && g.phase !== lastPhase) { out.push(`\n■ ${g.phase}`); lastPhase = g.phase; }
    out.push(`▸ الموعد النهائي: ${formatArabic(g.deadline)}`);
    out.push(...g.files.map((f) => `   • ${fileLine(f)}`));
  }
  return out.join('\n').trim();
}

export function baseVars(cfg: Config, dept?: Department, group?: { deadline: string; phase: string; files: RequiredFile[] }, today?: string): Vars {
  const v: Vars = {
    programName: cfg.program.name,
    academicYear: cfg.program.academicYear,
    semester: cfg.program.semester,
    startDate: cfg.program.startDate,
    startDateArabic: formatArabic(cfg.program.startDate),
    today,
    todayArabic: today ? formatArabic(today) : undefined,
  };
  if (dept) {
    v.headName = dept.head.name;
    v.deptName = dept.name;
    v.deptShortName = dept.shortName || dept.name;
    v.schedule = scheduleText(cfg, dept);
  }
  if (group) {
    v.phase = group.phase || `الوثائق المستحقة يوم ${formatArabic(group.deadline)}`;
    v.deadline = group.deadline;
    v.deadlineArabic = formatArabic(group.deadline);
    v.fileList = fileListText(group.files);
    v.fileCount = group.files.length;
    v.fileName = group.files.map((f) => f.name).join('، ');
    if (today) v.daysLeft = Math.max(0, diffDays(today, group.deadline));
  }
  return v;
}

export function withSignature(body: string, t: Templates): string {
  return t.signature ? `${body}\n\n${t.signature}` : body;
}
