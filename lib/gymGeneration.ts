// ═══════════════════════════════════════════════════════════════
// منطق بناء برومت وتحقق التوليد الأسبوعي لقسم الجيم — مشترك بين كل مزوّدي الذكاء الاصطناعي
// (Claude في app/api/gym/generate-week، وGPT في app/api/gym/generate-week-gpt)
//
// استُخرج هذا من app/api/gym/generate-week/route.ts عند إضافة مسار GPT الموازي — بنفس السبب
// الذي دفع لاستخراج lib/wodDailyGeneration.ts وlib/wodWeeklyGeneration.ts لقسم الكروسفت: بدون هذا
// الاستخراج كان سيتكرر نفس المنطق الضخم (بروتوكولات الأهداف، جدول الأوزان، تحليل الاستمرارية
// والركود/التجاوز، بناء البرومت الكامل) في مسارين منفصلين. الجزء الوحيد الخاص بكل مزوّد هو استدعاء
// الـ API نفسه — كل ما عداه مطابق تماماً بغض النظر عن أي نموذج يُستخدم.
// ═══════════════════════════════════════════════════════════════

import {
  getGymProfile, getGymSessions, getMemberById, upsertGymSession, deleteGymSessionsByMember,
  getLatestGymWeekMeta, upsertGymWeekMeta, getGymExerciseLogs, getGymCatalog, GymCatalogExercise,
} from '@/lib/db';
import { todaySA } from '@/lib/timezone';
import { parseAiJson } from '@/lib/aiJson';
import { CyclePhase, computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO, getRpeGuidance, estimateOneRepMax } from '@/lib/periodization';

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

function buildDates(fromDate: string, count: number) {
  const result: { date: string; dayName: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(fromDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    result.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }
  return result;
}

// كتالوج أجهزة/تمارين الجيم — يُبنى من lib/db.ts (GymCatalogExercise) القابلة للتعديل من لوحة التحكم بلا نشر كود جديد
const CATEGORY_LABELS_AR: Record<string, string> = {
  legs: '🦵 الساق والورك',
  'free-weight': '🏆 القوة الحرة (الأوزان الحرة)',
  chest: '🏠 الصدر',
  back: '🔙 الظهر',
  shoulders: '🎯 الكتفين',
  arms: '💪 الذراعين',
  core: '🔥 البطن والجذع',
  cardio: '🏃 الكارديو',
};
const CATEGORY_ORDER = ['legs', 'free-weight', 'chest', 'back', 'shoulders', 'arms', 'core', 'cardio'];

function buildCatalogText(catalog: GymCatalogExercise[]): string {
  return CATEGORY_ORDER
    .map(cat => {
      const items = catalog.filter(e => e.category === cat);
      if (!items.length) return '';
      const lines = items.map(e => `${e.id} | ${e.nameEn} | ${e.muscleGroup}`).join('\n');
      return `${CATEGORY_LABELS_AR[cat]}:\n${lines}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function getSplitPlan(days: number): string {
  switch (days) {
    case 3: return `تقسيم Full Body — 3 جلسات كامل الجسم:
      يوم A (ثقيل): Squat محور + Bench + Row + Shoulder + Bicep
      يوم B (متوسط): Deadlift محور + Press + Pulldown + Lateral + Tricep
      يوم C (خفيف/Volume): Leg Press + Cable work + Isolation + Core`;
    // تقسيم كبار السن — لا "يوم ثقيل"، الثلاث جلسات بنفس الشدة الخفيفة/المعتدلة تماماً، توزيع جسم كامل
    case 0: return `تقسيم Full Body لكبار السن — 3 جلسات متطابقة الشدة (لا يوم ثقيل ولا يوم خفيف، كلها معتدلة):
      كل جلسة: تمرين رجل واحد (آلة مسنودة) + تمرين صدر (آلة) + تمرين ظهر (سحب مسنود) + تمرين كتف (آلة) + تمرين بطن/جذع خفيف + كارديو منخفض التأثير 10 دقائق
      نوّع التمارين المحددة بين الجلسات الثلاث لتغطية كل الجسم عبر الأسبوع دون تكرار نفس الجهاز يومين متتاليين`;
    case 4: return `تقسيم Upper / Lower — يومان أعلى + يومان أسفل:
      Upper A (ثقيل — قوة): Bench ثقيل + Row + OHP + Pulldown + Arms
      Lower A (ثقيل — قوة): Squat/Hack Squat ثقيل + RDL + Leg Curl + Calf
      Upper B (حجم — Volume): Inc Press + Chest Fly + Cable Row + Lateral + Arms
      Lower B (حجم — Volume): Leg Press عالي + Leg Extension + Hip Thrust + Abductor`;
    case 5: return `تقسيم Push / Pull / Legs — PPL كلاسيكي:
      Push: Chest Press + Inc Press + Fly + Shoulder Press + Lateral + Tricep x2
      Pull: Lat Pulldown + Seated Row + Cable Row + Bicep x2 + Rear Delt + Shrugs
      Legs: Squat/Hack + Leg Press + Leg Curl + Leg Ext + Hip Thrust + Calf + Abductor
      Upper (تعويض): Chest Cable + Row + Lateral + Arms
      Core/Cardio: تمارين البطن + HIIT أو Steady-state`;
    case 6: return `تقسيم PPL مزدوج — Push A/B + Pull A/B + Legs A/B:
      Push A (قوة — ثقيل): Bench ثقيل 4-6 reps + OHP + Dips/Tricep Heavy
      Push B (حجم — خفيف): Inc Press + Pec Deck + Cable Fly + Lateral + Tricep Volume
      Pull A (قوة — ثقيل): Barbell Row + Weighted Pulldown + Shrugs + Bicep Heavy
      Pull B (حجم — خفيف): Seated Row + Cable Row + Rear Delt + Bicep Volume
      Legs A (رباعية محور): Squat/Hack Squat ثقيل + Leg Press + Leg Ext + Calf
      Legs B (ورك وخلفية محور): Deadlift/RDL + Leg Curl + Hip Thrust + Abductor`;
    default: return 'Full Body — 3 جلسات';
  }
}

function getGoalProtocol(goal: string): string {
  switch (goal) {
    case 'weight_loss': return `بروتوكول خسارة الوزن:
      • الحجم: 15-20 مجموعة/عضلة/أسبوع
      • الشدة: 12-20 تكرار، راحة 30-60 ث
      • الكارديو: 10-15 دقيقة HIIT أو 20 دقيقة Steady-state في نهاية الجلسة
      • الأسلوب: Supersets و Circuits لرفع معدل القلب
      • الوزن: 60-70% من 1RM — التركيز على حرق السعرات
      • أضف 5-10 دقيقة كارديو في نهاية كل جلسة`;
    case 'muscle_gain': return `بروتوكول بناء العضلة (Hypertrophy):
      • الحجم: 12-20 مجموعة/عضلة/أسبوع
      • الشدة: 8-12 تكرار، راحة 60-90 ث
      • الأسلوب: Progressive Overload صارم، Mind-Muscle Connection
      • الوزن: 65-80% من 1RM — رسالة ميكانيكية عالية
      • التقنية: Tempo 3-1-2 (3 ث نزول - 1 ث توقف - 2 ث صعود)
      • المجموعات: 3-5 مجموعات لكل تمرين`;
    case 'strength': return `بروتوكول القوة (Strength):
      • الحجم: 10-15 مجموعة/عضلة/أسبوع
      • الشدة: 3-6 تكرار، راحة 2-4 دقائق
      • الأسلوب: الحركات المركبة أولاً، شدة عالية 80-95% 1RM
      • ركّز على: Squat + Deadlift + Bench + Row + OHP
      • Warm-up Sets: 50% × 5, 70% × 3, 85% × 1 قبل العمل الفعلي
      • كل أسبوع: زد الوزن 2.5-5 كجم على الحركات الرئيسية`;
    case 'body_recomp': return `بروتوكول إعادة التشكيل:
      • الحجم: 12-16 مجموعة/عضلة/أسبوع
      • الشدة: 8-15 تكرار، راحة 60-75 ث
      • الأسلوب: تنويع بين compound و isolation
      • وزن البدن: كافٍ لحافز عضلي مع عجز سعرات معتدل
      • أضف 10 دقيقة كارديو خفيف في نهاية جلسات الساق
      • قياس: التقدم بالصور والقياسات لا الميزان فقط`;
    case 'general_fitness': return `بروتوكول اللياقة العامة:
      • الحجم: 10-15 مجموعة/عضلة/أسبوع
      • الشدة: 10-15 تكرار، راحة 45-75 ث
      • الأسلوب: تنويع شامل، حركات متعددة المفاصل
      • الكارديو: 10-15 دقيقة في نهاية الجلسة
      • التنويع: غيّر التمارين كل أسبوع لمنع الملل
      • الهدف: لياقة قلبية + قوة + مرونة`;
    case 'senior_fitness': return `بروتوكول لياقة وقوة آمنة لكبار السن (لا تصاعد أرقام، الأمان أولاً):
      • الحجم: 6-10 مجموعات/عضلة/أسبوع فقط — لا أحمال تدريب شبابية
      • الشدة: 12-20 تكراراً دائماً، راحة 90 ث-2 دقيقة بين كل مجموعة (وليس أقل، حتى لو الوزن خفيف)
      • 2-3 مجموعات فقط لكل تمرين — لا 4-5
      • لا Supersets ولا Circuits ولا أي أسلوب يرفع معدل القلب بسرعة
      • الوزن: يبدأ خفيفاً جداً ويُرفع فقط إذا أنهى العضو المجموعة بسهولة تامة مرتين متتاليتين — لا جدول أوزان مرجعي ثابت هنا، اعتمد على "جهد مريح" (RPE 4-6 كحد أقصى)
      • الكارديو: مشي على التريدميل أو دراجة أو إليبتيكال فقط، 10-15 دقيقة بشدة يمكن فيها التحدث بجملة كاملة`;
    default: return 'بروتوكول لياقة عامة: 10-15 reps, 60-75 ث راحة';
  }
}

// إرشادات سلامة كبار السن — نفس فلسفة SENIOR_SAFETY_GUIDANCE في قسم الجري (lib/runningProgramming.ts)
// لكن مخصصة لتدريب المقاومة: لا اختبار 1RM، تفضيل الأجهزة المسنودة على الأوزان الحرة، زفير مع الجهد
// (بدل حبس النفس — خطر ارتفاع ضغط دم حاد)، وتجنّب انثناء العمود الفقري الحمّال (اعتبار كثافة العظام)
const SENIOR_GYM_SAFETY_GUIDANCE = `
⚠️ إرشادات سلامة إجبارية — لا استثناء:
1. استشارة الطبيب: إن كان للعضو تاريخ قلبي أو ضغط دم أو سكري أو هشاشة عظام أو جراحة مفصل حديثة، افترض أنه استشار الطبيب مسبقاً — لا تصمم برنامجاً كأنه شاب سليم.
2. علامات توقف فورية (اذكرها في notes أول أسبوع): ألم صدر، دوخة، ضيق تنفس غير معتاد، ألم مفصل حاد ولا يزول — التوقف الفوري ومراجعة الطبيب.
3. ممنوع تماماً: اختبار 1RM، أي رفعة قريبة من أقصى جهد، أي حركة انفجارية/بالستية (لا قفز، لا رميات، لا سرعة قصوى).
4. فضّل الأجهزة المسنودة (Machine) على الأوزان الحرة القائمة — استقرار أفضل وخطر سقوط أقل. تجنّب Barbell Squat/Deadlift/Bench/Row/OHP القائمة تماماً إلا إن ذكر المدرب خبرة سابقة صريحة.
5. التنفس: زفير مع الجهد (رفع الوزن)، شهيق مع العودة — ممنوع حبس النفس (خطر ارتفاع ضغط الدم الحاد عند كبار السن تحديداً).
6. تجنّب انثناء العمود الفقري تحت حمل (لا Weighted Sit-up، لا Back Extension بحمل ثقيل) — اعتبار كثافة العظام.
7. إحماء أطول من المعتاد (8-10 دقائق بدل 5) — الأنسجة الضامة تحتاج وقتاً أطول للاستعداد.
8. راحة كاملة يوماً بين كل جلستين — لا جلستان متتاليتان مهما كانت الرغبة.`;

// أهداف تهدئة/موازنة حسب نوع يوم التقسيم — إجباري تطبيقه على تهدئة كل يوم حسب splitType الخاص به،
// نفس فكرة PATTERN_COOLDOWN_MAP في قسم الكروسفت لكن بمفاتيح تقسيم الجيم (نفس مفاتيح ALL_SPLITS أدناه)
const SPLIT_MUSCLE_TARGET_MAP: Record<string, string> = {
  Push:  'الصدر (Chest) + الكتف الأمامي (Front Delt) + الترايسبس (Triceps)',
  Pull:  'الظهر العريض (Lat) + البايسبس (Bicep) + الكتف الخلفي (Rear Delt)',
  Legs:  'الرباعية (Quad) + أوتار الركبة (Hamstring) + المؤخرة (Glute) + الساق (Calf)',
  Upper: 'الصدر + الظهر + الكتفين + الذراعين — الجزء العلوي كاملاً',
  Lower: 'الأرجل والورك كاملاً — رباعية + خلفية + مؤخرة + ساق',
  Full:  'كامل الجسم — لا تركيز عضلي واحد، وزّع التهدئة على أكثر ما استُخدم اليوم',
};

// f يجمع بين معامل الجنس (0.65 للإناث — نفس معامل قسم الكروسفت للاتساق) ومعامل مرحلة الدورة الحالية،
// حتى لا يبقى الجدول ثابتاً كل أسبوع بغض النظر عن أين نحن في دورة التدريج
function getWeightStandards(gender: string, weight: number | undefined, phaseMultiplier: number): string {
  const bw = weight || (gender === 'female' ? 65 : 80);
  const isFemale = gender === 'female';
  const f = (isFemale ? 0.65 : 1) * phaseMultiplier;

  return `جدول أوزان مرجعية (${isFemale ? 'أنثى' : 'ذكر'} — وزن الجسم ${bw}كجم):

┌─────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ التمرين             │ مبتدئ        │ متوسط        │ متقدم        │ محترف        │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Leg Press           │ ${Math.round(50*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(160*f)}كجم       │ ${Math.round(220*f)}كجم+      │
│ Hack Squat          │ ${Math.round(30*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Barbell Squat       │ ${Math.round(40*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Leg Extension       │ ${Math.round(25*f)}كجم        │ ${Math.round(45*f)}كجم        │ ${Math.round(65*f)}كجم        │ ${Math.round(85*f)}كجم+       │
│ Leg Curl            │ ${Math.round(20*f)}كجم        │ ${Math.round(40*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(70*f)}كجم+       │
│ Hip Thrust          │ ${Math.round(30*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Bench Press         │ ${Math.round(30*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(80*f)}كجم        │ ${Math.round(110*f)}كجم+      │
│ Chest Press M.      │ ${Math.round(25*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(75*f)}كجم        │ ${Math.round(100*f)}كجم+      │
│ Incline Press       │ ${Math.round(25*f)}كجم        │ ${Math.round(45*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(95*f)}كجم+       │
│ Lat Pulldown        │ ${Math.round(30*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(90*f)}كجم+       │
│ Seated Row          │ ${Math.round(30*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(90*f)}كجم+       │
│ Barbell Row         │ ${Math.round(35*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(85*f)}كجم        │ ${Math.round(115*f)}كجم+      │
│ Shoulder Press M.   │ ${Math.round(20*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(75*f)}كجم+       │
│ OHP (Barbell)       │ ${Math.round(20*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(70*f)}كجم+       │
│ Deadlift            │ ${Math.round(50*f)}كجم        │ ${Math.round(90*f)}كجم        │ ${Math.round(130*f)}كجم       │ ${Math.round(170*f)}كجم+      │
│ Cable Lateral       │ ${Math.round(5*f)}كجم         │ ${Math.round(10*f)}كجم        │ ${Math.round(15*f)}كجم        │ ${Math.round(20*f)}كجم+       │
│ Bicep Machine       │ ${Math.round(15*f)}كجم        │ ${Math.round(25*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(45*f)}كجم+       │
│ Tricep Pushdown     │ ${Math.round(15*f)}كجم        │ ${Math.round(25*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(45*f)}كجم+       │
│ Calf Raise          │ ${Math.round(40*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(130*f)}كجم+      │
└─────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘`;
}

export interface GymWeekContext {
  prompt: string;
  memberId: string;
  startDate: string;
  dates: { date: string; dayName: string }[];
  cyclePhase: CyclePhase;
  newCycleIndex: number;
  autoDeloadTriggered: boolean;
  estimatedOneRM: Record<string, number>;
  maxTokens: number;
  catalog: GymCatalogExercise[];
}

/** يجمع بروفايل العضو وسجله وكتالوج الجيم، ويبني نص البرومت الكامل — لا يتصل بأي مزوّد ذكاء اصطناعي */
export async function buildGymWeekContext(body: any): Promise<GymWeekContext> {
  const { memberId, fromDate, override, cyclePhaseOverride = 'auto' } = body;
  if (!memberId) throw new Error('memberId مطلوب');

  const startDate = fromDate || todaySA();
  const member = await getMemberById(memberId);
  const profile = await getGymProfile(memberId);
  const gymCatalog = await getGymCatalog();

  // دمج بروفايل العضو مع تعديلات المدرب (override يأخذ الأولوية)
  const effective = {
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 3,
    gender: 'male',
    focusAreas: [] as string[],
    limitations: '',
    weight: undefined as number | undefined,
    height: undefined as number | undefined,
    age: undefined as number | undefined,
    experienceYears: undefined as string | undefined,
    ...((profile || {}) as object),
    ...(override || {}),
  };

  // ═══ برنامج كبار السن (senior_fitness) — حد صارم من الخادم نفسه، نفس فلسفة senior_walk_run
  // في قسم الجري: لا يتجاوز 3 أيام نشطة أسبوعياً بغض النظر عن أي إعداد آخر ═══
  const isSenior = effective.goal === 'senior_fitness';
  if (isSenior && effective.daysPerWeek > 3) effective.daysPerWeek = 3;

  // لكبار السن: استبعد فئة "القوة الحرة" (Barbell Squat/Deadlift/Bench/Row/OHP القائمة) من قائمة
  // المرشحين نفسها — قيد مفروض بالكود لا نصاً في البرومبت فقط، لأن السلامة هنا لا تحتمل مخاطرة
  // اعتماد كامل على التزام النموذج بالتعليمات. الكتالوج الكامل يبقى مصدر التحقق في processGymWeekResult
  const catalogForPrompt = isSenior ? gymCatalog.filter(e => e.category !== 'free-weight') : gymCatalog;
  const catalogText = buildCatalogText(catalogForPrompt);

  // إجمالي أيام الأسبوع: أيام التمرين + أيام الراحة المناسبة
  const restDays = effective.daysPerWeek <= 3 ? 4 : effective.daysPerWeek <= 4 ? 3 : effective.daysPerWeek === 5 ? 2 : 1;
  const totalDays = effective.daysPerWeek + restDays;
  const dates = buildDates(startDate, totalDays);

  const recentSessions = await getGymSessions(memberId);
  const currentLevel = (effective.level || 'beginner') as 'beginner' | 'intermediate' | 'advanced' | 'elite';

  // سجل الإنجاز الفعلي (اختياري من العضو) — إن وُجد يحل محل الوزن المقترح كأساس حقيقي للتصاعد
  const exerciseLogs = await getGymExerciseLogs(memberId);
  const logsByKey: Record<string, any> = {};
  exerciseLogs.forEach(l => { logsByKey[`${l.date}__${l.machineId}`] = l; });

  // سجل تفصيلي بالأوزان — فعلية إن سُجِّلت، وإلا مقترحة عند مستوى المتدرب الحالي (احتياط متوافق مع من لا يسجّل)
  const recentTraining = recentSessions.slice(0, 6).map(s => ({
    date: s.date,
    split: s.splitType,
    exercises: (s.exercises || []).slice(0, 6).map(e => {
      const log = logsByKey[`${s.date}__${e.machineId}`];
      if (log) return `${e.nameEn} (فعلي: ${log.actualWeight} × ${log.actualReps}${log.comparison !== 'same' ? ` — ${log.comparison === 'more' ? 'أعلى من المقترح' : 'أقل من المقترح'}` : ''})`;
      const lvl = e.levels?.[currentLevel];
      return `${e.nameEn}${lvl?.weight ? ` (مقترح غير مُسجَّل: ${lvl.weight} × ${lvl.reps})` : ''}`;
    }).join(', '),
  }));

  // تحليل ركود/تجاوز لكل جهاز بناءً على آخر 3-4 تسجيلات فعلية — حتمي بالكود لا تخميناً من الـ AI
  const logsByMachine: Record<string, any[]> = {};
  exerciseLogs.forEach(l => { (logsByMachine[l.machineId] ||= []).push(l); });
  const parseNum = (s: string) => { const m = (s || '').match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };

  const plateauedMachines: string[] = [];
  const exceedingMachines: string[] = [];
  Object.entries(logsByMachine).forEach(([machineId, machineLogs]) => {
    // الأحدث 3 تسجيلات مرتبة تصاعدياً بالتاريخ (الأقدم أولاً ← الأحدث أخيراً)
    const recent3 = [...machineLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).reverse();
    if (recent3.length < 3) return;
    const values = recent3.map(l => parseNum(l.actualWeight)).filter((v): v is number => v !== null);
    if (values.length < 3) return;
    // ركود: الوزن الفعلي في آخر تسجيل ليس أعلى من أقدم تسجيل ضمن آخر 3 — لا تصاعد حقيقي
    if (values[values.length - 1] <= values[0]) plateauedMachines.push(machineId);
    // تجاوز: العضو رفع أعلى من المقترح في تسجيلين من آخر 3 على الأقل
    if (recent3.filter(l => l.comparison === 'more').length >= 2) exceedingMachines.push(machineId);
  });

  // تقدير 1RM شخصي فعلي لكل جهاز (معادلة Epley من أفضل أداء ضمن آخر 3 تسجيلات) —
  // يحل محل شريحة السكان العامة الثابتة حين تتوفر بيانات حقيقية لهذا العضو تحديداً
  const estimatedOneRM: Record<string, number> = {};
  Object.entries(logsByMachine).forEach(([machineId, machineLogs]) => {
    const recentEstimates = [...machineLogs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map(l => {
        const w = parseNum(l.actualWeight);
        const r = parseNum(l.actualReps);
        return w && r ? estimateOneRepMax(w, r) : null;
      })
      .filter((v): v is number => v !== null);
    if (recentEstimates.length > 0) estimatedOneRM[machineId] = Math.round(Math.max(...recentEstimates));
  });

  // تحليل توزيع أنماط التقسيم (Split) على آخر أسبوعين — يكشف الإهمال والتراكم الفعليين، وليس تخميناً
  const last14 = recentSessions.slice(0, 14);
  const splitFreq: Record<string, number> = {};
  last14.forEach(s => {
    if (s.isRest) return;
    const key = (s.splitType || '').split(' ')[0] || 'Full';
    splitFreq[key] = (splitFreq[key] || 0) + 1;
  });
  const ALL_SPLITS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'];
  const neglectedSplits = ALL_SPLITS.filter(s => !splitFreq[s]);
  const dominantSplits = Object.entries(splitFreq).filter(([, v]) => v >= 4).map(([k]) => k);
  const trainedSessionsCount = last14.filter(s => !s.isRest).length;

  // استمرارية البرمجة: هل هذا استكمال لبرنامج قائم أم بداية جديدة؟ واقرأ توصية الأسبوع الماضي من نفس المدرب الذكي
  const isContinuation = trainedSessionsCount >= 3;
  const previousMeta = await getLatestGymWeekMeta(memberId, startDate);

  // ═══ دورة تدريج شخصية لهذا العضو تحديداً (تأسيس→بناء→ذروة→تفريغ) — تقدّم تلقائي بين الأسابيع ═══
  // بعكس الكروسفت (نادٍ واحد، دورة واحدة)، هنا كل عضو له دورته الخاصة لأن جدول gym_week_meta مفتاحه memberId
  const validGymPhases: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];
  const gymForcePhase: CyclePhase | undefined = validGymPhases.includes(cyclePhaseOverride)
    ? (cyclePhaseOverride as CyclePhase)
    : undefined;
  const { phase: cyclePhase, cycleIndex: newCycleIndex, autoDeloadTriggered } =
    computeNextCyclePhase(previousMeta?.cycleIndex ?? null, gymForcePhase);
  const isDeloadWeek = cyclePhase === 'deload';

  const continuityContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 تحليل الأسبوعين الماضيين (${trainedSessionsCount} جلسة تدريب فعلية)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isContinuation ? 'هذا استكمال لبرنامج قائم — ابنِ على الأوزان والتقدم الفعلي المسجل أدناه، لا تبدأ من الصفر' : 'هذا برنامج جديد أو متقطع — ابدأ بأسبوع تأسيسي محافظ يبني الثقة بالتقنية'}

توزيع أنماط التقسيم (Split) الفعلي:
${Object.keys(splitFreq).length ? Object.entries(splitFreq).map(([k, v]) => `- ${k}: ${v} جلسة`).join('\n') : '- لا توجد جلسات سابقة'}
${neglectedSplits.length ? `\n⚠️ أنماط مُهملة تماماً (أعطها أولوية هذا الأسبوع): ${neglectedSplits.join(', ')}` : ''}
${dominantSplits.length ? `\n⚠️ أنماط مُفرطة التكرار (قلّل حصتها أو نوّع تمارينها): ${dominantSplits.join(', ')}` : ''}

سجل الجلسات الأخيرة (فعلي إن سُجِّل، وإلا مقترح عند مستوى "${currentLevel}" كاحتياط):
${recentTraining.length ? recentTraining.map(s => `${s.date} | ${s.split} | ${s.exercises}`).join('\n') : 'لا توجد جلسات سابقة'}
${(plateauedMachines.length || exceedingMachines.length) ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 تحليل الالتزام الفعلي (محسوب من تسجيلات العضو الحقيقية)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isDeloadWeek ? '⚠️ هذا أسبوع تفريغ — تجاهل إشارات الركود/التجاوز أدناه تماماً هذا الأسبوع فقط (لا تُخفّض ولا ترفع بناءً عليها)، عُد لتطبيقها ابتداءً من الأسبوع القادم:\n' : ''}${plateauedMachines.length ? `⚠️ ركود مؤكد (لا تصاعد حقيقي في آخر 3 تسجيلات): ${plateauedMachines.join(', ')}${isDeloadWeek ? '' : '\n→ الأرجح أن العضو لا يدفع لـRPE كافٍ (أقل من 7) أو خطأ تقني — لهذه التمارين تحديداً: خفّف الوزن 10% هذا الأسبوع أو غيّر نطاق التكرارات بدل تكرار نفس الرقم'}` : ''}
${exceedingMachines.length ? `✅ تجاوز مستمر للمقترح (رفع أعلى من المطلوب مرتين على الأقل من آخر 3): ${exceedingMachines.join(', ')}${isDeloadWeek ? '' : '\n→ هذا يعني العضو كان يتدرب دون RPE 7 على هذه التمارين — ارفع الوزن الأساسي ليصل RPE 8-9 على المجموعة الأخيرة، واذكر صراحة في coachNote اقتراح ترقية المستوى'}` : ''}` : ''}
${Object.keys(estimatedOneRM).length ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 تقديرات قوة قصوى فعلية (1RM مُقدَّر من سجل هذا العضو تحديداً — Epley)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
للأجهزة التالية توجد بيانات أداء حقيقية لهذا العضو — استخدم هذا الرقم كأساس حساب وزن مستوى "${currentLevel}" تحديداً بدل شريحة المستوى العامة في الجدول المرجعي أدناه (احسبه كنسبة من بروتوكول الهدف مضروبة في نسبة مرحلة الدورة ${CYCLE_PHASE_INFO[cyclePhase].pctLabel}):
${Object.entries(estimatedOneRM).map(([id, orm]) => `- ${id}: 1RM مُقدَّر ≈ ${orm}كجم`).join('\n')}
لأي جهاز آخر غير مذكور هنا: لا توجد بيانات كافية — استخدم الجدول المرجعي العام لكل المستويات كما هو.` : ''}
${previousMeta ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗒️ توصيتك أنت (المدرب الذكي) من الأسبوع الماضي — يجب المتابعة عليها اليوم
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ملخص الأسبوع الماضي: ${previousMeta.weekSummary}
خطة التقدم التي وضعتها: ${previousMeta.progressionNote}
✅ نفّذ هذه الخطة فعلياً الآن (مثال: إن قلت "زد 2.5كجم على القرفصاء" فطبّقها في هذا الأسبوع على الوزن المسجل أعلاه)` : ''}
`;

  const gender = effective.gender || 'male';
  const levelAr = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'محترف' }[effective.level as string] || 'متوسط';
  const bmi = effective.weight && effective.height ? (effective.weight / ((effective.height / 100) ** 2)).toFixed(1) : null;

  const prompt = `أنت خبير برمجة تدريبية معتمد (CSCS, NSCA) ومتخصص في تدريب صالات الجيم بمستوى احترافي عالٍ — البرنامج مبني على أجهزة ومعدات قياسية متوفرة في أي صالة تجارية عادية، لا يفترض علامة تجارية معينة. مهمتك تصميم برنامج تدريبي أسبوعي متكامل ومخصص بالكامل لهذا المتدرب.

╔══════════════════════════════════════════════╗
║       صالة مجموعة المطانيخ — قسم الجيم      ║
║         يصلح لأي صالة جيم قياسية             ║
╚══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 بروفايل المتدرب الكامل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم: ${member?.nameAr || 'المتدرب'}
الجنس: ${gender === 'female' ? 'أنثى' : 'ذكر'}
العمر: ${effective.age ? effective.age + ' سنة' : 'غير محدد'}
الوزن: ${effective.weight ? effective.weight + ' كجم' : 'غير محدد'}
الطول: ${effective.height ? effective.height + ' سم' : 'غير محدد'}
${bmi ? `BMI: ${bmi}` : ''}
المستوى: ${levelAr}
سنوات الخبرة: ${effective.experienceYears ? effective.experienceYears + ' سنوات' : 'غير محدد'}
الهدف الرئيسي: ${effective.goal}
أيام التدريب: ${effective.daysPerWeek} أيام/أسبوع
مناطق التركيز: ${effective.focusAreas?.length ? effective.focusAreas.join(' + ') : 'كامل الجسم'}
القيود والإصابات: ${effective.limitations || 'لا توجد قيود'}
${override?.specialInstructions ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 تعليمات خاصة من المدرب (أولوية قصوى)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${override.specialInstructions}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 بروتوكول الهدف
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getGoalProtocol(effective.goal)}
${isSenior ? `
${SENIOR_GYM_SAFETY_GUIDANCE}

⛔ هذا العضو ضمن برنامج كبار السن — تجاهل تماماً أي رقم تصاعد أو نسبة 1RM أو "جدول الأوزان المرجعية" الوارد لاحقاً في هذا البرومبت (مصمَّم لمتدربين شباب أصحاء، غير آمن هنا). التزم فقط ببروتوكول الهدف وإرشادات السلامة أعلاه — جهد مريح (RPE 4-6) دائماً، بلا استثناء مهما اقترحت مرحلة دورة التدريج أدناه.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 مرحلة دورة التدريج الشخصية لهذا العضو (إجباري)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${autoDeloadTriggered ? '⚠️ فُرض هذا كأسبوع تفريغ تلقائياً لهذا العضو تحديداً — مرّت 4 أسابيع متتالية منذ آخر تفريغ له، وجسمه يحتاج تعافياً بغض النظر عن أي إشارة تجاوز مسجّلة.\n' : ''}المرحلة: ${CYCLE_PHASE_LABELS_AR[cyclePhase]} (${CYCLE_PHASE_INFO[cyclePhase].pctLabel}) — ${CYCLE_PHASE_INFO[cyclePhase].description}
${getRpeGuidance(cyclePhase)}
${isDeloadWeek ? '⚠️ في أسبوع التفريغ لهذا العضو: كل الجلسات Light أو Moderate فقط — لا توجد جلسة Heavy واحدة هذا الأسبوع مهما اقترح بروتوكول الهدف أو تحليل الالتزام أعلاه.' : ''}
جدول الأوزان المرجعية أدناه مُدرَّج بالفعل حسب هذه المرحلة — لا تُعدِّله يدوياً بنسبة إضافية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 هيكل الأسبوع التدريبي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getSplitPlan(isSenior ? 0 : effective.daysPerWeek)}

${continuityContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 الأيام المطلوبة لهذا الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dates.map(d => `• ${d.date} — ${d.dayName}`).join('\n')}

وزّع ${effective.daysPerWeek} أيام تمرين و${restDays} أيام راحة على هذه الأيام بذكاء (مثلاً: لا تضع يومي تمرين ثقيل متتاليين بدون راحة)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏋️ قائمة أجهزة وتمارين الجيم المتوفرة (معدّات صالة قياسية)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${catalogText}

${isSenior ? '' : `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ جدول الأوزان المرجعية (مُدرَّج حسب مرحلة الدورة أعلاه)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getWeightStandards(gender, effective.weight, CYCLE_PHASE_INFO[cyclePhase].multiplier)}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 مبادئ البرمجة الاحترافية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Progressive Overload الحقيقي: ${isDeloadWeek ? 'هذا أسبوع تفريغ — لا تصاعد هذا الأسبوع إطلاقاً، الأولوية للتعافي' : isContinuation ? 'استخدم الأوزان الفعلية المسجلة في سجل الجلسات الأخيرة أعلاه (أو تقديرات 1RM أعلاه إن وُجدت) كنقطة انطلاق — زد 2.5-5% على التمارين المركبة التي تكررت بنجاح، ولا تعد لجدول أوزان المستوى العام كأنه أول أسبوع' : 'ابدأ بوزن يسمح بـ 2-3 تكرارات احتياطية (RIR) — أي RPE 6-7 (نفس نسبة مرحلة التأسيس)، اقترح زيادة محددة للأسبوع القادم'}
2. SRA Principle: Stimulus → Recovery → Adaptation — لا تكرر نفس المجموعة العضلية قبل 48 ساعة
3. تناوب الشدة حسب نوع اليوم — طبّق نسبة مرحلة الدورة أعلاه على كل: Heavy (85%+ 1RM) → Moderate (70-80%) → Light/Volume (60-70%)
4. Mind-Muscle Connection: في كل cue أكد على الإحساس بالعضلة المستهدفة
5. تدرج الجلسة: إحماء عام → تفعيل → compound ثقيل → isolation → تهدئة
6. الكميات الأسبوعية الموصى بها:
   - كل عضلة رئيسية: 10-20 مجموعة/أسبوع
   - العضلات المستهدفة خصيصاً: 15-20 مجموعة
   - العضلات المساعدة: 8-12 مجموعة
7. خصائص المستوى:
   - مبتدئ: 3 مجموعات/تمرين، 12-15 reps، حركات بسيطة وآمنة، تعليم الحركة
   - متوسط: 3-4 مجموعات/تمرين، 8-12 reps، تنويع في التمارين، بدء الأوزان الحرة
   - متقدم: 4-5 مجموعات/تمرين، 6-10 reps، تقنيات متقدمة (drop sets, supersets)
   - محترف: 4-5 مجموعات/تمرين، 4-8 reps ثقيل، تدوير الشدة، volume عالي
${effective.limitations ? `\n8. ⚠️ قيود صارمة: ${effective.limitations} — لا تضع أي تمرين يضغط على هذه المناطق` : ''}
${effective.focusAreas?.length ? `\n9. 🎯 تضخيم التركيز على: ${effective.focusAreas.join(' + ')} — زد حجم هذه العضلات بـ 20-30% عن الباقي` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 هيكل الإحماء المطلوب (5-7 عناصر)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. إحماء قلبي عام: 3-5 دقائق تريدميل/دراجة بشدة خفيفة
2. تفعيل ديناميكي: حركات تفعّل العضلات المستهدفة في هذا اليوم
3. إطالة ديناميكية: Hip circles, Arm swings, Leg swings حسب اليوم
4. مجموعات تحضيرية: للحركة الرئيسية بـ 50% ثم 70% من وزن العمل
اكتب كل عنصر كنص وصفي واضح بالعربية

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧘 هيكل التهدئة المطلوب (4-6 عناصر)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. إطالة العضلات العاملة في هذا اليوم تحديداً — إجباري تطبيق الخريطة التالية حسب splitType كل جلسة (لا تُخمِّن):
${Object.entries(SPLIT_MUSCLE_TARGET_MAP).map(([k, v]) => `   - ${k}: ${v}`).join('\n')}
2. تمارين التنفس العميق والاسترخاء
3. Foam Rolling للعضلات المجهدة إذا متاح
4. ملاحظة المدة لكل إطالة
اكتب كل عنصر كنص وصفي مع المدة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 التنسيق المطلوب (JSON فقط)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أرجع JSON بالتنسيق التالي فقط، بدون أي نص قبله أو بعده:

{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "الاثنين",
      "splitType": "Push",
      "title": "تمرين الدفع — الصدر والكتف والترايسبس",
      "focus": "الصدر الكامل + الكتف الأمامي + الترايسبس",
      "intensity": "Heavy",
      "isRest": false,
      "duration": 65,
      "notes": "جلسة ثقيلة — ركّز على الأوزان القصوى مع الحفاظ على الشكل الصحيح. هدف اليوم: تجاوز وزن الأسبوع الماضي بـ 2.5 كجم على Bench Press",
      "warmup": [
        "5 دقائق تريدميل بسرعة 6 كم/ساعة — تنشيط القلب وتدفئة الجسم",
        "Arm Circles كبير 10 دورة لكل اتجاه — تفعيل مفصل الكتف",
        "Band Pull-Apart 15 تكرار — تفعيل الكتف الخلفي لتوازن المفصل",
        "Bench Press مجموعة خفيفة 50% من وزن العمل × 10 — تحضير عصبي عضلي",
        "Bench Press مجموعة متوسطة 70% من وزن العمل × 5 — تأهيل للوزن الكامل"
      ],
      "exercises": [
        {
          "machineId": "barbell-bench",
          "nameAr": "ضغط الصدر بالبار (Bench Press)",
          "nameEn": "Barbell Flat Bench Press",
          "muscleGroup": "الصدر الكامل + الكتف الأمامي + الترايسبس",
          "sets": 4,
          "notes": "الظهر مقوّس طبيعياً — القدمان مثبتتان على الأرض — البار ينزل إلى منتصف الصدر",
          "levels": {
            "beginner":     {"weight": "30كجم", "reps": "10-12", "rest": "90 ث", "cue": "نزّل البار ببطء 3 ث — احسّ بإطالة الصدر — ادفع بقوة مع الزفير"},
            "intermediate": {"weight": "55كجم", "reps": "8-10",  "rest": "90 ث", "cue": "اضغط الصدر في أعلى نقطة ثانية واحدة — قدم القفص الصدري نحو البار"},
            "advanced":     {"weight": "80كجم", "reps": "6-8",   "rest": "2 دق", "cue": "Leg Drive — ادفع الأرض بقدميك لرفع الوزن — Drop Set في المجموعة الأخيرة"},
            "elite":        {"weight": "105كجم","reps": "4-6",   "rest": "3 دق", "cue": "Pause Bench — ثانية توقف كاملة على الصدر — انفجر للأعلى بأقصى قوة"}
          }
        }
      ],
      "cooldown": [
        "تمطيط الصدر على إطار الباب — يدان على مستوى الكتف، تقدّم بجسمك للأمام — 45 ث",
        "Cross-body Shoulder Stretch — اشحب ذراعك أمام الصدر بالذراع الأخرى — 30 ث لكل جانب",
        "تمطيط الترايسبس — ذراع خلف الرأس، اشحب الكوع بالأخرى — 30 ث لكل جانب",
        "تنفس عميق — 5 أنفاس عميقة بطيئة لإعادة معدل القلب للطبيعي"
      ],
      "coachNote": "ممتاز! اليوم هو تمرين الدفع الثقيل للأسبوع. حاول زيادة 2.5 كجم على Bench Press عن جلستك الأخيرة. إذا أنهيت المجموعة بـ 3 تكرارات احتياطية أو أكثر — الوزن خفيف، زده."
    },
    {
      "date": "YYYY-MM-DD",
      "dayName": "الثلاثاء",
      "splitType": "Rest",
      "title": "يوم الراحة الفعّالة",
      "focus": "استرداد",
      "intensity": "Rest",
      "isRest": true,
      "duration": 0,
      "notes": "يوم الراحة لا يعني الخمول — تمشية خفيفة 20 دقيقة تسريع الاسترداد. اشرب 2-3 لتر ماء واهتم بالنوم.",
      "warmup": [],
      "exercises": [],
      "cooldown": [],
      "coachNote": "الراحة جزء من البرنامج — العضلات تنمو خلالها لا خلال التمرين. استرح واهتم بالتغذية والنوم."
    }
  ],
  "weekSummary": "ملخص الأسبوع: مرحلة الدورة الحالية (${CYCLE_PHASE_LABELS_AR[cyclePhase]})، توزيع المجموعات العضلية، وكيف يبني هذا الأسبوع على الأسبوع الماضي تحديداً (اذكر ما تغيّر ولماذا)",
  "progressionNote": "خطة محددة وقابلة للتنفيذ للأسبوع القادم — اسم التمرين + الزيادة الدقيقة (مثال: 'زد Back Squat من 75كجم إلى 80كجم' وليس كلاماً عاماً مثل 'زد الأوزان تدريجياً') — هذا النص سيُقرأ حرفياً الأسبوع القادم لمتابعته"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ استخدم machineId من القائمة أعلاه حرفياً بدون تعديل
✅ كل تمرين: 4 مستويات كاملة (beginner/intermediate/advanced/elite) مع weight+reps+rest+cue
✅ الـ cue يجب أن يكون تعليمة تقنية محددة ومفيدة، وليس كلاماً عاماً
✅ الإحماء والتهدئة: نصوص عربية واضحة (strings) — ليس objects
✅ عدد التمارين: ${effective.daysPerWeek <= 3 ? '5-7' : effective.daysPerWeek <= 4 ? '5-6' : '4-6'} تمارين/جلسة
✅ أيام الراحة: isRest:true وexercises:[] وwarmup:[] وcooldown:[]
✅ لا تكرر تمرين ظهر في تمارين الأسبوع السابق إلا إذا لم يكن هناك بديل
✅ الـ notes في يوم الراحة تكون نصائح عملية (تغذية، نوم، استرداد)
✅ coachNote يجب أن تكون تحفيزية ومحددة لهذا اليوم وهذا المتدرب
✅ intensity لكل جلسة: Heavy | Moderate | Light | Cardio | Rest
✅ وزّع أيام التمرين بشكل منطقي — لا يومان ثقيلان على نفس العضلة متتاليان
${isSenior
  ? `✅ برنامج كبار السن — قواعد إضافية إجبارية: intensity لكل الجلسات النشطة يجب أن تكون "Light" أو "Moderate" فقط — ممنوع تماماً "Heavy" مهما كانت مرحلة الدورة. reps لكل مستوى بين 12-20 دائماً بلا استثناء. لا جدول أوزان مرجعي — ابدأ بأوزان خفيفة جداً واذكر في progressionNote زيادة صغيرة جداً (1-2.5كجم) فقط إن أنهى العضو الأسبوع الماضي بسهولة تامة`
  : '✅ استخدم أوزان جدول "مرحلة دورة التدريج" أعلاه حرفياً — لا تستخدم أوزان من ذاكرتك أو من أسابيع سابقة'}
${isDeloadWeek && !isSenior ? '✅ أسبوع تفريغ: intensity لكل الجلسات النشطة يجب أن تكون Light أو Moderate فقط — ولا سجل واحد "Heavy" هذا الأسبوع' : ''}
${neglectedSplits.length ? `✅ أعطِ أولوية حقيقية للأنماط المُهملة المذكورة أعلاه (${neglectedSplits.join(', ')}) — خصص لها يوماً كاملاً هذا الأسبوع إن أمكن` : ''}
${!isDeloadWeek && plateauedMachines.length ? `✅ طبّق تعليمات الركود أعلاه حرفياً على: ${plateauedMachines.join(', ')} — لا تكرر نفس الوزن دون تغيير` : ''}
${!isDeloadWeek && exceedingMachines.length ? `✅ طبّق تعليمات التجاوز أعلاه حرفياً على: ${exceedingMachines.join(', ')} — واذكر اقتراح الترقية في coachNote` : ''}
✅ progressionNote يجب أن يكون توجيهاً رقمياً محدداً (اسم تمرين + وزن دقيق) قابلاً للتنفيذ الحرفي الأسبوع القادم — لا نصائح عامة، وإن وُجد تحليل التزام فعلي أعلاه فاستشهد به تحديداً

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده. لا تشرح. لا تعلق.`;

  const maxTokens = Math.min(32000, Math.max(18000, effective.daysPerWeek * 3500));

  return { prompt, memberId, startDate, dates, cyclePhase, newCycleIndex, autoDeloadTriggered, estimatedOneRM, maxTokens, catalog: gymCatalog };
}

// أحياناً (لوحظ من Claude تحديداً عند تمارين الكارديو ضمن exercises كإليبتيكال/دراجة) يُرجع النموذج
// حقل reps نصياً مثل "10 دقائق" بدل رقم/نطاق رقمي — يكسر افتراض أن reps دائماً رقمي (خصوصاً قاعدة
// "12-20 دائماً" الصارمة في بروتوكول كبار السن). نستخرج الرقم فقط ونتجاهل وحدة القياس النصية.
const REPS_NUMERIC_RE = /^\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?$/;
function normalizeReps(reps: unknown): unknown {
  if (typeof reps !== 'string') return reps;
  const trimmed = reps.trim();
  if (REPS_NUMERIC_RE.test(trimmed)) return trimmed;
  const m = trimmed.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
  if (!m) return reps;
  return m[2] ? `${m[1]}-${m[2]}` : m[1];
}

/** يحلّل استجابة JSON الخام من أي مزوّد، يحفظ الجلسات وملخص الأسبوع، ويبني جسم استجابة API الجاهز للإرجاع.
 * يتحقق أيضاً من أن كل machineId ورد فعلياً من الكتالوج — بعكس قسم الكروسفت، الجيم كان يحفظ أي machineId
 * يقترحه النموذج مباشرة بلا أي تحقق (البرومبت يطلب الالتزام بالكتالوج، لكن لا ضمان برمجي). لو "هلوس"
 * النموذج معرّفاً غير موجود، كان يُحفظ ويكسر عرض رابط الفيديو والبيانات المرتبطة به بصمت — الآن يُحذف
 * ويُسجَّل تحذيراً بدل ذلك، بنفس منطق validIds المستخدم في lib/wodDailyGeneration.ts */
export async function processGymWeekResult(rawText: string, ctx: GymWeekContext) {
  const result = parseAiJson(rawText, 'sessions');

  const validIds = new Set(ctx.catalog.map(e => e.id));
  const warnings: string[] = [];
  for (const s of result.sessions || []) {
    if (!Array.isArray(s.exercises)) continue;
    const before = s.exercises.length;
    const invalidIds = s.exercises.filter((e: any) => !e || !validIds.has(e.machineId)).map((e: any) => e?.machineId || '؟');
    s.exercises = s.exercises.filter((e: any) => e && validIds.has(e.machineId));
    if (invalidIds.length) {
      const msg = `⚠️ ${s.date}: حُذفت ${invalidIds.length} من ${before} تمارين بمعرّفات غير موجودة في الكتالوج (${invalidIds.join('، ')})`;
      warnings.push(msg);
      console.warn(`[gym/generate-week ${ctx.memberId}]`, msg);
    }

    for (const e of s.exercises) {
      if (!e?.levels) continue;
      for (const lvl of Object.values(e.levels) as any[]) {
        if (lvl) lvl.reps = normalizeReps(lvl.reps);
      }
    }
  }

  const toDate = ctx.dates[ctx.dates.length - 1].date;
  await deleteGymSessionsByMember(ctx.memberId, ctx.startDate, toDate);

  for (const s of result.sessions || []) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    await upsertGymSession({ ...s, id, memberId: ctx.memberId, createdAt: new Date().toISOString() });
  }

  // احفظ ملخص وخطة التقدم ومرحلة الدورة لهذا الأسبوع — تُقرأ تلقائياً عند توليد الأسبوع القادم لهذا العضو
  // نحفظ دائماً (وليس فقط عند وجود weekSummary/progressionNote) لأن cyclePhase/cycleIndex يجب أن يتقدما كل أسبوع بغض النظر
  const metaId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  await upsertGymWeekMeta({
    id: metaId,
    memberId: ctx.memberId,
    weekStartDate: ctx.startDate,
    weekSummary: result.weekSummary || '',
    progressionNote: result.progressionNote || '',
    cyclePhase: ctx.cyclePhase,
    cycleIndex: ctx.newCycleIndex,
    createdAt: new Date().toISOString(),
  });

  return {
    ...result,
    memberId: ctx.memberId,
    fromDate: ctx.startDate,
    cyclePhase: ctx.cyclePhase,
    cyclePhaseLabel: CYCLE_PHASE_LABELS_AR[ctx.cyclePhase],
    autoDeloadTriggered: ctx.autoDeloadTriggered,
    estimatedOneRM: ctx.estimatedOneRM,
    warnings,
  };
}
