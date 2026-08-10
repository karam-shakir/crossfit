// ═══════════════════════════════════════════════════════════════
// مكتبة برمجة الكروسفيت المشتركة — مصدر واحد للحقيقة
// تُستخدم في app/api/wod/generate و app/api/wod/generate-week
// لضمان توافق تمارين الأكسسوار والتهدئة مع تمرين القوة والـ WOD
// ═══════════════════════════════════════════════════════════════

export interface CFExercise {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'strength' | 'olympic' | 'gymnastics' | 'cardio' | 'wod';
}

export const EXERCISES: CFExercise[] = [
  { id: 'back-squat',        nameEn: 'Back Squat',        nameAr: 'القرفصاء الخلفية',    category: 'strength'   },
  { id: 'front-squat',       nameEn: 'Front Squat',       nameAr: 'القرفصاء الأمامية',    category: 'strength'   },
  { id: 'air-squat',         nameEn: 'Air Squat',         nameAr: 'القرفصاء الهوائية',    category: 'gymnastics' },
  { id: 'deadlift',          nameEn: 'Deadlift',          nameAr: 'الرفعة الميتة',        category: 'strength'   },
  { id: 'power-clean',       nameEn: 'Power Clean',       nameAr: 'النظيفة القوية',       category: 'olympic'    },
  { id: 'clean-and-jerk',    nameEn: 'Clean & Jerk',      nameAr: 'النظيفة والدفع',       category: 'olympic'    },
  { id: 'snatch',            nameEn: 'Snatch',            nameAr: 'الخطف',                category: 'olympic'    },
  { id: 'overhead-squat',    nameEn: 'Overhead Squat',    nameAr: 'القرفصاء فوق الرأس',  category: 'strength'   },
  { id: 'shoulder-press',    nameEn: 'Shoulder Press',    nameAr: 'الضغط فوق الرأس',     category: 'strength'   },
  { id: 'push-press',        nameEn: 'Push Press',        nameAr: 'الدفع بالساقين',       category: 'strength'   },
  { id: 'thruster',          nameEn: 'Thruster',          nameAr: 'الثراستر',             category: 'wod'        },
  { id: 'pull-up',           nameEn: 'Pull Up',           nameAr: 'العقلة',              category: 'gymnastics' },
  { id: 'kipping-pull-up',   nameEn: 'Kipping Pull Up',   nameAr: 'العقلة الكيبينج',     category: 'gymnastics' },
  { id: 'muscle-up',         nameEn: 'Muscle Up',         nameAr: 'الماسل أب',           category: 'gymnastics' },
  { id: 'handstand-pushup',  nameEn: 'Handstand Push Up', nameAr: 'الضغط على اليدين',    category: 'gymnastics' },
  { id: 'handstand-walk',    nameEn: 'Handstand Walk',    nameAr: 'المشي على اليدين',    category: 'gymnastics' },
  { id: 'toes-to-bar',       nameEn: 'Toes to Bar',       nameAr: 'الأصابع للعارضة',     category: 'gymnastics' },
  { id: 'double-under',      nameEn: 'Double Under',      nameAr: 'القفز المزدوج',       category: 'cardio'     },
  { id: 'box-jump',          nameEn: 'Box Jump',          nameAr: 'القفز على الصندوق',   category: 'wod'        },
  { id: 'burpee',            nameEn: 'Burpee',            nameAr: 'البيربي',             category: 'cardio'     },
  { id: 'wall-ball',         nameEn: 'Wall Ball',         nameAr: 'كرة الحائط',          category: 'wod'        },
  { id: 'kettle-bell-swing', nameEn: 'Kettlebell Swing',  nameAr: 'هزة الكيتل بيل',      category: 'wod'        },
  { id: 'row',               nameEn: 'Row',               nameAr: 'التجديف',             category: 'cardio'     },
  { id: 'run',               nameEn: 'Run',               nameAr: 'الجري',               category: 'cardio'     },
  { id: 'push-up',           nameEn: 'Push Up',           nameAr: 'الضغط',               category: 'gymnastics' },
  { id: 'sit-up',            nameEn: 'Sit Up',            nameAr: 'الجلوس',              category: 'gymnastics' },
  { id: 'rope-climb',        nameEn: 'Rope Climb',        nameAr: 'تسلق الحبل',          category: 'gymnastics' },
];

export function getCalisthenicsExercises(): CFExercise[] {
  return EXERCISES.filter(e =>
    e.category === 'gymnastics' ||
    ['run', 'double-under', 'burpee', 'box-jump'].includes(e.id)
  );
}

// ═══ أنماط الحركة الأساسية وتوافق الأكسسوار/التهدئة ═══

export type MovementPattern = 'squat' | 'hinge' | 'push' | 'pull' | 'olympic';

export const PATTERN_LABELS_AR: Record<MovementPattern, string> = {
  squat: 'القرفصاء (Squat)', hinge: 'الرفعة (Hinge)', push: 'الدفع (Push)', pull: 'السحب (Pull)', olympic: 'الأولمبي (Olympic)',
};

export const PATTERN_ACCESSORY_MAP: Record<MovementPattern, { targetsAr: string; suggestedIds: string[]; rationale: string }> = {
  squat:   { targetsAr: 'الصدر + الكتف الأمامي + الترايسبس',        suggestedIds: ['push-up'],            rationale: 'يوم القرفصاء يستهدف الأرجل والجذع بالكامل — الأكسسوار يوازن بتحميل الجزء العلوي الدافع الذي لم يعمل' },
  hinge:   { targetsAr: 'الصدر + الكتف + الترايسبس',                 suggestedIds: ['push-up'],            rationale: 'الرفعة الميتة تستنزف السلسلة الخلفية (ظهر/مؤخرة/أوتار) — الأكسسوار يوازن بالدفع الأمامي' },
  push:    { targetsAr: 'الظهر + البايسبس + الجذع',                  suggestedIds: ['pull-up', 'sit-up'],  rationale: 'يوم الدفع (ضغط/كتف) يحتاج موازنة فورية بالسحب لحماية توازن مفصل الكتف من الإصابة' },
  pull:    { targetsAr: 'الصدر + الترايسبس + الجذع',                 suggestedIds: ['push-up', 'sit-up'],  rationale: 'يوم السحب (عقلة/تجديف) يوازَن بالدفع حتى لا تتغلب عضلات السحب على الدفع بشكل مزمن' },
  olympic: { targetsAr: 'الجذع + استقرار الكتف + الكاحل',            suggestedIds: ['sit-up'],             rationale: 'الحركات الأولمبية (خطف/نظيفة) تحتاج استقرار جذع ومفاصل لا تحميلاً عضلياً إضافياً ثقيلاً بعدها' },
};

export const PATTERN_COOLDOWN_MAP: Record<MovementPattern, { targetsAr: string; rationale: string }> = {
  squat:   { targetsAr: 'الرباعية (Quad) + عضلة الورك القابضة (Hip Flexor) + المؤخرة (Glute)', rationale: 'القرفصاء يستنزف هذه العضلات مباشرة — الإطالة تسرّع الاسترداد' },
  hinge:   { targetsAr: 'أوتار الركبة (Hamstring) + أسفل الظهر (Low Back) + المؤخرة (Glute)',  rationale: 'الرفعة الميتة تعتمد كلياً على هذه السلسلة الخلفية' },
  push:    { targetsAr: 'الصدر (Chest) + الكتف الأمامي (Front Delt) + الترايسبس (Triceps)',    rationale: 'تخفيف التوتر المتراكم من حركات الدفع فوق الرأس والأفقي' },
  pull:    { targetsAr: 'الظهر العريض (Lat) + البايسبس (Bicep) + الكتف الخلفي (Rear Delt)',     rationale: 'تخفيف توتر السحب المتكرر وحماية المرفق والكتف' },
  olympic: { targetsAr: 'الورك (Hip) + الكاحل (Ankle) + الكتف (Shoulder) — Mobility',           rationale: 'الحركات الانفجارية تحتاج تحرير مفصلي لا إطالة عضلية عميقة فقط' },
};

// ملاحظة: القرفصاء والرفعة المميتة كانتا تشتركان بنفس المجموعة العريضة سابقاً،
// ما جعل "hinge" لا يُختار عملياً أبداً (القرفصاء يسبقها دوماً في priority القديم)
// رغم أن الرفعة المميتة تُستنزف فيها عضلات مختلفة تماماً (خلفية) عن القرفصاء (أمامية)
const PATTERN_TO_BROAD_GROUP: Record<MovementPattern, string> = {
  squat: 'الأرجل — القرفصاء (Squat)',
  hinge: 'الخلفية — الرفعة المميتة (Hinge)',
  push: 'الكتف/الدفع',
  pull: 'الظهر/السحب',
  olympic: 'الأولمبي/الجسم الكامل',
};

const PATTERN_ROTATION: MovementPattern[] = ['squat', 'pull', 'push', 'hinge', 'olympic'];

/**
 * يقترح نمط القوة التالي بأولوية مزدوجة:
 * 1) المجموعات المُهملة فعلياً في الأسبوع الماضي (كما كان)
 * 2) بين المرشحين المتبقين: الأقل استخداماً هذا الأسبوع تحديداً (usageCount)
 * هذا يمنع هيمنة نمط واحد (القرفصاء/السحب) على حساب بقية الأنماط —
 * الاعتماد القديم على "أول عنصر غير آخر نمط مستخدم" كان يُرجع 'squat' فعلياً
 * في كل مرة تقريباً (لأنه أول عنصر في PATTERN_ROTATION)، فيُحرم push/hinge/olympic
 * من الظهور إلا نادراً جداً.
 */
export function suggestPattern(
  undertrainedGroups: string[],
  avoid?: MovementPattern,
  usageCount?: Partial<Record<MovementPattern, number>>
): MovementPattern {
  const candidates = PATTERN_ROTATION.filter(p => p !== avoid);
  const prioritized = candidates.filter(p => undertrainedGroups.includes(PATTERN_TO_BROAD_GROUP[p]));
  const pool = prioritized.length ? prioritized : candidates;

  const counts = usageCount || {};
  let best = pool[0];
  let bestCount = counts[best] ?? 0;
  for (const p of pool) {
    const c = counts[p] ?? 0;
    if (c < bestCount) { best = p; bestCount = c; }
  }
  return best;
}

/** يبني تسلسل أنماط لعدد من الأيام النشطة (بدون تكرار متتالٍ)، بأولوية للمجموعات المُهملة ثم توزيع عادل بين كل الأنماط الخمسة */
export function buildPatternSequence(activeDaysCount: number, undertrainedGroups: string[]): MovementPattern[] {
  const seq: MovementPattern[] = [];
  let last: MovementPattern | undefined;
  const remaining = [...undertrainedGroups];
  const usageCount: Partial<Record<MovementPattern, number>> = {};
  for (let i = 0; i < activeDaysCount; i++) {
    const next = suggestPattern(remaining, last, usageCount);
    seq.push(next);
    usageCount[next] = (usageCount[next] ?? 0) + 1;
    const group = PATTERN_TO_BROAD_GROUP[next];
    const idx = remaining.indexOf(group);
    if (idx >= 0) remaining.splice(idx, 1);
    last = next;
  }
  return seq;
}

export const PATTERN_STRENGTH_MAP: Record<MovementPattern, { idsAr: string; note: string }> = {
  squat:   { idsAr: 'back-squat / front-squat / overhead-squat',   note: '' },
  hinge:   { idsAr: 'deadlift حصراً',                                note: 'هذا النمط مختلف تماماً عن السحب (Pull) — يستهدف أوتار الركبة/أسفل الظهر/المؤخرة لا الظهر العريض/البايسبس، فتأكد أن الأكسسوار والتهدئة يعكسان ذلك' },
  push:    { idsAr: 'shoulder-press / push-press',                  note: '' },
  pull:    { idsAr: 'power-clean أو snatch (سحب انفجاري علوي)',      note: 'لا تستخدم deadlift كتمرين قوة رئيسي هنا — deadlift ينتمي لنمط "الرفعة" (Hinge) حصراً؛ الميتكون يمكن أن يستثمر pull-up/toes-to-bar بكثافة' },
  olympic: { idsAr: 'snatch / clean-and-jerk بتقنية عالية ووزن معتدل (70-80%)', note: 'التركيز على المسار لا الحمل الأقصى' },
};

/** يبني نص إرشادي لتمرين القوة بالبار الصحيح لهذا النمط — يمنع الخلط الشائع بين "الرفعة" (Hinge) و"السحب" (Pull) */
export function strengthGuidanceFor(pattern: MovementPattern): string {
  const s = PATTERN_STRENGTH_MAP[pattern];
  return `تمرين القوة بالبار لهذا النمط: ${s.idsAr}${s.note ? ` — ${s.note}` : ''}`;
}

export function accessoryGuidanceFor(pattern: MovementPattern): string {
  const a = PATTERN_ACCESSORY_MAP[pattern];
  return `الأكسسوار يجب أن يستهدف: ${a.targetsAr} (استخدم ${a.suggestedIds.join(' و ')} أو ما يعادلهما) — السبب: ${a.rationale}`;
}

export function cooldownGuidanceFor(pattern: MovementPattern): string {
  const c = PATTERN_COOLDOWN_MAP[pattern];
  return `التهدئة يجب أن تستهدف: ${c.targetsAr} — السبب: ${c.rationale}`;
}

// ═══ تمارين البنشمارك المعروفة (Hero / Girl WODs) ═══

export interface BenchmarkMovement { exerciseId: string; reps: string; distance?: string; notes?: string; }
export interface BenchmarkWod {
  key: string; nameAr: string; nameEn: string; kind: 'hero' | 'girl';
  type: string; duration?: number; rounds: number | null;
  movements: BenchmarkMovement[];
  cooldownTargetsAr: string;
  scalingNote: string;
}

export const BENCHMARKS: Record<string, BenchmarkWod> = {
  fran: {
    key: 'fran', nameAr: 'فران', nameEn: 'Fran', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [
      { exerciseId: 'thruster', reps: '21-15-9', notes: '43كجم Rx رجال، 30كجم نساء' },
      { exerciseId: 'pull-up',  reps: '21-15-9', notes: 'Kipping مسموح' },
    ],
    cooldownTargetsAr: 'الكتف الأمامي + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن فارغ أو 20كجم + Banded Pull-up/Ring Row',
  },
  cindy: {
    key: 'cindy', nameAr: 'سيندي', nameEn: 'Cindy', kind: 'girl', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '5' },
      { exerciseId: 'push-up',  reps: '10' },
      { exerciseId: 'air-squat', reps: '15' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + الرباعية',
    scalingNote: 'مبتدئ: Ring Row بدل العقلة، ضغط على الركبتين',
  },
  grace: {
    key: 'grace', nameAr: 'غريس', nameEn: 'Grace', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [{ exerciseId: 'clean-and-jerk', reps: '30', notes: '61كجم Rx رجال، 43كجم نساء' }],
    cooldownTargetsAr: 'أسفل الظهر + الكتف فوق الرأس + الرسغين',
    scalingNote: 'مبتدئ: بار فارغ 20كجم أو Dumbbell خفيف',
  },
  diane: {
    key: 'diane', nameAr: 'ديان', nameEn: 'Diane', kind: 'girl', type: 'للوقت', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'deadlift',         reps: '21-15-9', notes: '102كجم Rx رجال، 70كجم نساء' },
      { exerciseId: 'handstand-pushup', reps: '21-15-9' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + أوتار الركبة + الكتف',
    scalingNote: 'مبتدئ: وزن معتدل + Pike Push-up بدل HSPU الحر',
  },
  helen: {
    key: 'helen', nameAr: 'هيلين', nameEn: 'Helen', kind: 'girl', type: 'للوقت', duration: 12, rounds: 3,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'kettle-bell-swing', reps: '21', notes: '24كجم رجال، 16كجم نساء' },
      { exerciseId: 'pull-up',           reps: '12' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الكتف الخلفي + قبضة اليد',
    scalingNote: 'مبتدئ: مشي سريع بدل الجري + كيتل بيل أخف',
  },
  annie: {
    key: 'annie', nameAr: 'آني', nameEn: 'Annie', kind: 'girl', type: 'للوقت', duration: 15, rounds: null,
    movements: [
      { exerciseId: 'double-under', reps: '50-40-30-20-10' },
      { exerciseId: 'sit-up',       reps: '50-40-30-20-10' },
    ],
    cooldownTargetsAr: 'الكاحل + الجذع + أسفل الظهر',
    scalingNote: 'مبتدئ: قفز مفرد (Single-under) ×2 بدل المزدوج',
  },
  karen: {
    key: 'karen', nameAr: 'كارين', nameEn: 'Karen', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [{ exerciseId: 'wall-ball', reps: '150', notes: '9كجم لهدف 3م رجال، 6كجم لهدف 2.75م نساء' }],
    cooldownTargetsAr: 'الكتف الأمامي + الرباعية + أسفل الظهر',
    scalingNote: 'مبتدئ: كرة أخف ووزن أقل من 150 تكرار (100 مثلاً)',
  },
  dt: {
    key: 'dt', nameAr: 'دي تي', nameEn: 'DT', kind: 'hero', type: 'للوقت', duration: 12, rounds: 5,
    movements: [
      { exerciseId: 'deadlift',    reps: '12', notes: '70كجم Rx' },
      { exerciseId: 'power-clean', reps: '9',  notes: 'بديل Hang Power Clean — نفس الوزن' },
      { exerciseId: 'push-press',  reps: '6',  notes: 'بديل Push Jerk — نفس الوزن' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف فوق الرأس + الساعد',
    scalingNote: 'مبتدئ: 40-50كجم مع تقنية نظيفة',
  },
  murph: {
    key: 'murph', nameAr: 'مورف', nameEn: 'Murph', kind: 'hero', type: 'للوقت', duration: 45, rounds: null,
    movements: [
      { exerciseId: 'run',      reps: '', distance: '1.6كم', notes: 'ميل واحد' },
      { exerciseId: 'pull-up',  reps: '100' },
      { exerciseId: 'push-up', reps: '200' },
      { exerciseId: 'air-squat', reps: '300' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم', notes: 'ميل واحد' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'يمكن تقسيم التكرارات على طريقة Cindy: 20 جولة من 5 عقلة/10 ضغط/15 قرفصاء بين الجريين — مبتدئ: نصف الكمية (Half Murph)',
  },
  angie: {
    key: 'angie', nameAr: 'آنجي', nameEn: 'Angie', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '100' },
      { exerciseId: 'push-up',  reps: '100' },
      { exerciseId: 'sit-up',   reps: '100' },
      { exerciseId: 'air-squat', reps: '100' },
    ],
    cooldownTargetsAr: 'كامل الجسم — الكتف + الصدر + الجذع + الرباعية',
    scalingNote: 'مبتدئ: 50 تكرار من كل حركة بدل 100',
  },
};

export const BENCHMARK_OPTIONS = Object.values(BENCHMARKS).map(b => ({ key: b.key, label: `${b.nameAr} (${b.nameEn})`, kind: b.kind }));

// دورة التدريج (Periodization) انتقلت إلى lib/periodization.ts لتكون مشتركة بين
// الكروسفت والجيم بدل تكرارها في كل قسم — يُعاد تصديرها هنا للتوافق الخلفي
// مع مسارات الكروسفت التي تستورد هذه الأسماء من هذا الملف
export type { CyclePhase } from './periodization';
export {
  CYCLE_ORDER, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO,
  computeNextCyclePhase, getRpeGuidance,
} from './periodization';
import type { CyclePhase as _CyclePhase } from './periodization';
import { CYCLE_PHASE_INFO as _CYCLE_PHASE_INFO } from './periodization';

// مرجع الذروة (100%) لكل حركة رئيسية — نفس أرقام الجدول الثابت القديم (مستوى "نخبة")
// حتى تبقى قيم "الذروة" مطابقة لما كان مُستخدَماً سابقاً، مع اشتقاق بقية المستويات والمراحل منها بدل تثبيتها
const PEAK_REFERENCE: Record<string, { nameAr: string; eliteMale: number }> = {
  'back-squat':        { nameAr: 'قرفصاء خلفية', eliteMale: 115 },
  'deadlift':          { nameAr: 'رفعة ميتة',     eliteMale: 150 },
  'clean-and-jerk':    { nameAr: 'نظيفة ودفع',   eliteMale: 100 },
  'snatch':            { nameAr: 'خطف',           eliteMale: 85 },
  'thruster':          { nameAr: 'ثراستر',        eliteMale: 65 },
  'wall-ball':         { nameAr: 'كرة الحائط',    eliteMale: 9 },
  'kettle-bell-swing': { nameAr: 'هزة كيتل بيل',  eliteMale: 32 },
};
// نسب المستويات مشتقة من الجدول الأصلي (Back Squat: مبتدئ 50 / متوسط 75 / متقدم 95 / نخبة 115)
const LEVEL_FACTORS: Record<'beginner' | 'intermediate' | 'advanced' | 'elite', number> = {
  beginner: 50 / 115, intermediate: 75 / 115, advanced: 95 / 115, elite: 1,
};
// نفس معامل الفرق بين الجنسين المستخدم في قسم الجيم (lib/gym) — اتساق عبر المنصة بدل رقم جديد مُخترَع
const FEMALE_FACTOR = 0.65;

/** جدول أوزان مرجعي (رجال/نساء × 4 مستويات) مُدرَّج حسب مرحلة الدورة الحالية — يستبدل الجدول الثابت القديم الذي لم يكن يتغير أبداً بين الأسابيع */
export function getWeightStandardsTable(phase: _CyclePhase): string {
  const mult = _CYCLE_PHASE_INFO[phase].multiplier;
  const roundTo25 = (n: number) => Math.round(n / 2.5) * 2.5;
  const rows = Object.entries(PEAK_REFERENCE).map(([id, ref]) => {
    const cells = (['beginner', 'intermediate', 'advanced', 'elite'] as const).map(lvl => {
      const male = roundTo25(ref.eliteMale * LEVEL_FACTORS[lvl] * mult);
      const female = roundTo25(male * FEMALE_FACTOR);
      return `${lvl}: ${male}كجم♂/${female}كجم♀`;
    });
    return `${ref.nameAr} (${id}): ${cells.join(' | ')}`;
  });
  return rows.join('\n');
}

/** يبني نص إرشادي كامل لبنشمارك محدد يُدرج في البرومت — أو '' إن لم يوجد */
export function getBenchmarkGuidance(key: string): string {
  const b = BENCHMARKS[key];
  if (!b) return '';
  const movesTxt = b.movements.map(m => `- ${m.exerciseId}${m.distance ? ` (${m.distance})` : ''}: ${m.reps} ${m.notes ? `[${m.notes}]` : ''}`).join('\n');
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 اليوم بنشمارك محدد إجباري: ${b.nameAr} (${b.nameEn}) — ${b.kind === 'hero' ? 'Hero WOD' : 'Girl WOD'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
يجب إعادة إنتاج هذا التمرين بالضبط بحركاته وتكراراته الرسمية — لا تخترع نسخة مختلفة:
النوع: ${b.type} | ${b.rounds ? `الجولات: ${b.rounds}` : ''} ${b.duration ? `| تايم كاب/مدة تقديرية: ${b.duration} دقيقة` : ''}
الحركات الرسمية:
${movesTxt}
ملاحظة القياس: ${b.scalingNote}
⚠️ قاعدة خاصة ببنشمارك: هذا اليوم benchmark كامل بذاته — strength = [] فارغ تماماً (لا قوة إضافية قبله)، accessory = [] فارغ تماماً (البنشمارك هو التحفيز الكامل لليوم)
التهدئة يجب أن تستهدف: ${b.cooldownTargetsAr}
العنوان يجب أن يتضمن اسم البنشمارك "${b.nameAr}" بوضوح`;
}

// ═══ ميزانية وقت الحصة الجماعية ═══

export function getClassTimeBudget(classDuration: number): string {
  const table: Record<number, string> = {
    45: 'إحماء 8 دقائق → قوة 10 دقائق (تمرين مركب واحد فقط) → ميتكون 12-15 دقيقة → أكسسوار: تخطاه أو تمرين واحد سريع → تهدئة 5 دقائق. المجموع ≈ 45 دقيقة — الجلسة مضغوطة، لا وقت للفائض',
    60: 'إحماء 10 دقائق → قوة 15 دقيقة (تمرينان compound) → ميتكون 15-20 دقيقة → أكسسوار 8 دقائق (2 تمرين) → تهدئة 7 دقائق. المجموع ≈ 60 دقيقة — الصيغة الكلاسيكية القياسية',
    75: 'إحماء 10 دقائق → قوة 20 دقيقة → ميتكون 18-22 دقيقة → أكسسوار 10 دقائق (2-3 تمارين) → تهدئة 8 دقائق. المجموع ≈ 75 دقيقة',
    90: 'إحماء 12 دقيقة → قوة 25 دقيقة (مساحة لتقنية أولمبية أعمق) → ميتكون 20-25 دقيقة → أكسسوار 12 دقيقة (3 تمارين) → تهدئة 10 دقائق. المجموع ≈ 90 دقيقة — جلسة كاملة بلا استعجال',
  };
  return table[classDuration] || table[60];
}

export function getEquipmentGuidance(note: string): string {
  if (!note?.trim()) return '';
  return `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🛠️ قيد معدات اليوم (التزم به بدقة)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${note.trim()}\nكيّف اختيار التمارين والقوة والميتكون بالكامل حول هذا القيد — لا تضع تمريناً يحتاج معدات غير متاحة.`;
}

export function getRxFocusGuidance(focus: string): string {
  if (focus === 'rx') return 'الجمهور اليوم متمرس نسبياً — اجعل نسخة Advanced/Elite قريبة جداً من الحمل الرسمي RX، ولا تخفف نسخة Intermediate كثيراً.';
  if (focus === 'scaled') return 'غالبية الحضور اليوم مبتدئون — ركّز الشرح والتفصيل على نسخة Beginner/Intermediate بأوزان محافظة وبدائل حركية آمنة (Ring Row بدل عقلة، ضغط على الركبة، KB بدل بار)، ونسخة Advanced/Elite اختيارية فقط لمن يطلبها المدرب.';
  return '';
}
