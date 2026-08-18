// ═══════════════════════════════════════════════════════════════
// منطق بناء برومت وتحقق التوليد اليومي للـ WOD — مشترك بين كل مزوّدي الذكاء الاصطناعي
// (Claude في app/api/wod/generate، وGPT في app/api/wod/generate-gpt)
//
// استُخرج هذا من app/api/wod/generate/route.ts عند إضافة مسار GPT الموازي — بلا هذا الاستخراج
// كان سيتكرر نفس المنطق الضخم (تحليل الأسبوع، تدوير الأنماط، محظورات دمج الحركات، تدوير التحفيز،
// بناء البرومت الكامل بقسميه) في مسارين منفصلين، وأي تصحيح مستقبلي (كما حدث مراراً هذه الجلسة)
// كان سيحتاج تطبيقه مرتين مع خطر انحراف بينهما. الجزء الوحيد الخاص بكل مزوّد هو استدعاء الـ API
// نفسه (شكل الطلب/الاستجابة يختلف بين Anthropic وOpenAI) — كل ما عداه مطابق تماماً بغض النظر
// عن أي نموذج يُستخدم، بما يضمن تمريناً قابلاً للمقارنة العادلة بين المزوّدين بنفس الإعدادات.
// ═══════════════════════════════════════════════════════════════

import { getWods, getLatestWodCycleMeta } from '@/lib/db';
import {
  EXERCISES, getCalisthenicsExercises, MovementPattern, CyclePhase, PartnerFormat, PATTERN_LABELS_AR,
  suggestPattern, accessoryGuidanceFor, cooldownGuidanceFor, strengthGuidanceFor, warmupGuidanceFor, metconGuidanceFor, BARBELL_STRENGTH_IDS,
  getBenchmarkGuidance, getClassTimeBudget, getEquipmentGuidance, getRxFocusGuidance,
  computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO, getRpeGuidance, getWeightStandardsTable,
  suggestPartnerFormat, partnerFormatGuidanceFor, PARTNER_SESSION_COHERENCE_GUIDANCE, PARTNER_FORMAT_LABELS_AR,
  HEAVY_BY_DEFAULT_PATTERNS,
  movementBlacklistGuidance, stripRule1Violations, stripRule3Violations, detectRule2HeavyOverlap,
  StimulusType, suggestStimulusType, stimulusGuidanceFor,
  metconStimulusMixGuidance, metconRepLoadGuidance, metconTimeCapGuidance, detectMetconStimulusImbalance,
} from '@/lib/crossfitProgramming';
import { parseAiJson } from '@/lib/aiJson';
import { flattenMovements, sanitizeLevels } from '@/lib/wodBlocks';
import { todaySA } from '@/lib/timezone';

const PATTERN_KEYS: MovementPattern[] = ['squat', 'hinge', 'push', 'pull', 'olympic'];

export interface DailyWodContext {
  prompt: string;
  date: string;
  wodMode: string;
  isBenchmarkDay: boolean;
  effectivePattern: MovementPattern;
  effectiveStimulus: StimulusType;
  cyclePhase: CyclePhase;
  isPartnerDay: boolean;
  partnerFormat: PartnerFormat | null;
}

/** يجمع سياق الأسبوع الماضي ودورة التدريج ونمط اليوم/نوع التحفيز، ويبني نص البرومت الكامل — لا يتصل بأي مزوّد ذكاء اصطناعي */
export async function buildDailyWodContext(body: any): Promise<DailyWodContext> {
  const {
    date, focus, difficulty = 'متوسط', wodMode = 'crossfit',
    sessionType = 'balanced',    // heavy / skill / cardio / deload / balanced
    metconFormat = '',           // AMRAP / للوقت / EMOM / بالجولات / Chipper / ''
    strengthPattern = '',        // squat / hinge / push / pull / olympic / ''
    forbidExercises = [] as string[],
    forceExercise = '',
    specialNotes = '',
    targetDuration = 0,
    classDuration = 60,          // 45 / 60 / 75 / 90 — مدة الحصة الكاملة بالدقائق
    equipmentNote = '',          // قيد معدات حر (مثال: بار واحد فقط اليوم)
    rxFocus = 'balanced',        // rx / scaled / balanced
    benchmarkName = '',          // مفتاح بنشمارك من BENCHMARKS (fran, cindy, ...)
    cyclePhaseOverride = 'auto', // auto / foundation / build / peak / deload — فرض مرحلة دورة تدريج ليوم هذا التمرين فقط
    partnerMode = false,         // true = اجعل هذا اليوم جلسة بارتنر متماسكة من الإحماء حتى التهدئة
  } = body;

  const CALISTHENICS_EXERCISES = getCalisthenicsExercises();

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn}) [${e.category}]`).join('\n');
  const calisExerciseList = CALISTHENICS_EXERCISES.map(e => `- ${e.id} (${e.nameEn}) [${e.category}]`).join('\n');

  const allWods = await getWods();
  const last7Wods = allWods
    .filter(w => date ? w.date < date : true)
    .slice(0, 7);

  // تحليل المجموعات العضلية المُدرَّبة في آخر 7 أيام
  const muscleGroupLog: { date: string; muscles: string[]; intensity: string }[] = [];
  for (const w of last7Wods) {
    const strengthMoves = flattenMovements(w.strength);
    const metconMoves = flattenMovements(w.metcon);
    const allEx = [...strengthMoves, ...metconMoves].map((e: any) => e.exerciseId);
    const muscles: string[] = [];
    if (allEx.some(id => ['back-squat','front-squat','overhead-squat'].includes(id))) muscles.push('الأرجل — القرفصاء (Squat)');
    if (allEx.some(id => ['deadlift'].includes(id))) muscles.push('الخلفية — الرفعة المميتة (Hinge)');
    if (allEx.some(id => ['power-clean','clean-and-jerk','snatch'].includes(id))) muscles.push('الأولمبي/الجسم الكامل');
    if (allEx.some(id => ['pull-up','kipping-pull-up','muscle-up','rope-climb'].includes(id))) muscles.push('الظهر/السحب');
    if (allEx.some(id => ['shoulder-press','push-press','handstand-pushup'].includes(id))) muscles.push('الكتف/الدفع');
    if (allEx.some(id => ['thruster','wall-ball'].includes(id))) muscles.push('الجسم الكامل');
    if (allEx.some(id => ['row','run','double-under','burpee'].includes(id))) muscles.push('القلب/التحمل');
    const hasHeavyStrength = strengthMoves.length >= 2;
    const intensity = hasHeavyStrength ? 'ثقيلة' : metconMoves.length >= 4 ? 'تحمل' : 'متوسطة';
    muscleGroupLog.push({ date: w.date, muscles, intensity });
  }

  const sessionCount = last7Wods.length;
  const heavyCount = muscleGroupLog.filter(d => d.intensity === 'ثقيلة').length;
  let weekIntensity: string;
  let intensityRecommendation: string;
  if (sessionCount >= 5 || heavyCount >= 3) {
    weekIntensity = 'ثقيل';
    intensityRecommendation = 'الأسبوع كان ثقيلاً — اجعل هذه الجلسة متوسطة أو خفيفة للتعافي، ركز على التقنية والحجم لا على الحد الأقصى';
  } else if (sessionCount >= 3 || heavyCount >= 1) {
    weekIntensity = 'متوسط';
    intensityRecommendation = 'الأسبوع متوسط — يمكن جلسة ثقيلة إلى متوسطة، تأكد من استهداف مجموعات عضلية مختلفة عن السابق';
  } else {
    weekIntensity = 'خفيف';
    intensityRecommendation = 'الأسبوع خفيف — الجسم جاهز تماماً، اجعلها جلسة ثقيلة وطموحة';
  }

  const allRecentMuscles = muscleGroupLog.flatMap(d => d.muscles);
  const muscleFreq: Record<string, number> = {};
  allRecentMuscles.forEach(m => { muscleFreq[m] = (muscleFreq[m] || 0) + 1; });
  const overtrained = Object.entries(muscleFreq).filter(([, v]) => v >= 2).map(([k]) => k);
  const undertrained = ['الأرجل — القرفصاء (Squat)','الخلفية — الرفعة المميتة (Hinge)','الأولمبي/الجسم الكامل','الظهر/السحب','الكتف/الدفع','الجسم الكامل','القلب/التحمل']
    .filter(m => !allRecentMuscles.includes(m));

  const recentContext = `
**═══ تحليل الأسبوع الماضي (آخر 7 أيام) ═══**
عدد الجلسات: ${sessionCount} جلسات
شدة الأسبوع: ${weekIntensity}
توصية اليوم: ${intensityRecommendation}

المجموعات العضلية التي تدربت كثيراً (تجنبها أو قللها):
${overtrained.length ? overtrained.map(m => `- ${m}`).join('\n') : '- لا يوجد إجهاد تراكمي'}

المجموعات العضلية المُهمَلة (استهدفها اليوم بأولوية):
${undertrained.length ? undertrained.map(m => `- ${m}`).join('\n') : '- جميع المجموعات تدربت بشكل متوازن'}

سجل الجلسات التفصيلي:
${muscleGroupLog.map(d => `${d.date}: [${d.muscles.join(' + ')}] — شدة: ${d.intensity}`).join('\n') || 'لا توجد جلسات سابقة'}
`;

  // ═══ مرحلة دورة التدريج الحالية — قراءة فقط (المسار الأسبوعي هو من يملك الدورة ويحدّثها) ═══
  const latestCycleMeta = await getLatestWodCycleMeta(date || todaySA());

  // ═══ تحديد نمط القوة الفعلي بشكل حتمي (وليس تخميناً من الذكاء الاصطناعي) ═══
  const lastWod = last7Wods[0];
  const patternUsageCount: Partial<Record<MovementPattern, number>> = {};
  for (const w of last7Wods) {
    const p = (w as any).pattern as MovementPattern | undefined;
    if (p) patternUsageCount[p] = (patternUsageCount[p] ?? 0) + 1;
  }
  const coachPattern = PATTERN_KEYS.includes(strengthPattern as MovementPattern) ? (strengthPattern as MovementPattern) : null;
  const effectivePattern: MovementPattern = coachPattern || suggestPattern(undertrained, (lastWod as any)?.pattern, patternUsageCount, latestCycleMeta?.cycleIndex ?? 0);
  const patternIsForced = !!coachPattern;

  const lastAccessoryIds: string[] = flattenMovements((lastWod as any)?.accessory).map(e => e.exerciseId).filter(Boolean);
  const lastWarmupIds: string[] = flattenMovements((lastWod as any)?.warmup).map(e => e.exerciseId).filter(Boolean);
  const lastCooldownIds: string[] = flattenMovements((lastWod as any)?.cooldown).map(e => e.exerciseId).filter(Boolean);

  const targetDate = date || todaySA();
  const yesterday = new Date(targetDate + 'T00:00:00');
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const lastPattern = (lastWod as any)?.pattern as MovementPattern | undefined;
  const lastMetconIds: string[] = flattenMovements(lastPattern === effectivePattern ? (lastWod as any)?.metcon : []).map(e => e.exerciseId).filter(Boolean);
  const isBackToBackHeavyDay =
    (lastWod as any)?.date === yesterdayStr &&
    lastPattern && HEAVY_BY_DEFAULT_PATTERNS.includes(lastPattern) &&
    HEAVY_BY_DEFAULT_PATTERNS.includes(effectivePattern) &&
    lastPattern !== effectivePattern;

  const validPhases: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];
  const dailyForcePhase: CyclePhase | undefined = validPhases.includes(cyclePhaseOverride)
    ? (cyclePhaseOverride as CyclePhase)
    : (sessionType === 'deload' ? 'deload' : undefined);
  const cyclePhase: CyclePhase = dailyForcePhase
    ?? latestCycleMeta?.cyclePhase
    ?? computeNextCyclePhase(null).phase;

  // ═══ نوع التحفيز الفعلي (قاعدة ٤ من محظورات دمج الحركات) — محور مستقل عن النمط أعلاه ═══
  const stimulusUsageCount: Partial<Record<StimulusType, number>> = {};
  for (const w of last7Wods) {
    const s = (w as any).stimulusType as StimulusType | undefined;
    if (s) stimulusUsageCount[s] = (stimulusUsageCount[s] ?? 0) + 1;
  }
  const effectiveStimulus: StimulusType = suggestStimulusType(
    (lastWod as any)?.stimulusType, stimulusUsageCount, latestCycleMeta?.cycleIndex ?? 0, cyclePhase
  );

  const benchmarkGuidance = wodMode === 'crossfit' && benchmarkName ? getBenchmarkGuidance(benchmarkName) : '';
  const isBenchmarkDay = !!benchmarkGuidance;

  const isPartnerDay = wodMode === 'crossfit' && partnerMode && !isBenchmarkDay;
  const partnerFormat: PartnerFormat | null = isPartnerDay ? suggestPartnerFormat(effectivePattern) : null;

  const calisthenicsPrompt = `أنت مدرب Calisthenics محترف بخبرة أكثر من 10 سنوات، متخصص في برمجة تمارين وزن الجسم والجمناستيكس على المستوى التنافسي. أسلوبك يشبه أفضل مدربي Street Workout وGymnastics Strength Training (GST).

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: غالبيتهم رجال (18-40 سنة) — مع وجود نساء
الأوزان: مبنية على معايير الرجال — مع ذكر scaling للنساء في الـ notes
═══════════════════════════════

**تفاصيل الجلسة:**
- نوع الجلسة: Calisthenics — وزن الجسم البحت
- الصعوبة: ${difficulty}
- طابع الجلسة: ${sessionType === 'heavy' ? 'يوم قوة — weighted calisthenics، مجموعات قصيرة 3-5 reps' : sessionType === 'skill' ? 'يوم مهارة — Handstand/Muscle-up/Lever تقنية عالية' : sessionType === 'cardio' ? 'يوم تحمل — circuit عالية التكرار، لا توقف' : sessionType === 'deload' ? 'يوم تفريغ — 60-70%، تمطيط، mobility' : 'متوازن'}
${focus ? `- التركيز: ${focus}` : '- التركيز: كامل الجسم'}
${metconFormat ? `- صيغة الميتكون: ${metconFormat}` : ''}
${forceExercise ? `\n⚡ تمرين مطلوب: ${forceExercise}` : ''}
${forbidExercises.length ? `\n🚫 محظور: ${forbidExercises.join(', ')}` : ''}
${specialNotes ? `\n📌 تعليمات المدرب: ${specialNotes}` : ''}
${date ? `- التاريخ: ${date}` : ''}

**التمارين المتاحة (وزن الجسم فقط — استخدم IDs هذه حصراً):**
${calisExerciseList}
${recentContext}
**فلسفة البرمجة الاحترافية:**
- الإحماء: تنشيط مفصلي تدريجي + تفعيل عضلي (shoulder circles، hip circles، inchworm، scapular pull-ups)
- القوة / Skill Work: تمارين تقنية مهارية بمجموعات قصيرة عالية الجودة (Strict Pull-up، HSPU، Muscle-up Progression)
- الميتكون: circuit مكثف يرفع معدل ضربات القلب، تمارين تدفق بدون توقف
- التهدئة: تمطيط إيزومتري عميق للعضلات الأكثر استخداماً

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق
- "تدريب" (Skill) → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً

**مستويات الصعوبة في الأوزان والتمارين:**
- مبتدئ: تمارين مساعدة (band pull-up, knee push-up, negative pull-up)
- متوسط: تمارين كاملة (strict pull-up, push-up, dips)
- متقدم: تمارين مركبة (muscle-up, handstand push-up, toes-to-bar)
- نخبة: تمارين مهارية متقدمة (strict HSPU, kipping muscle-up, rope climb)

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان التمرين بالعربية — يوم Calisthenics",
  "type": "للوقت | AMRAP | تدريب",
  "duration": 20,
  "rounds": null,
  "notes": "ملاحظات تفصيلية للمتدربين تشمل: استراتيجية الجلسة، كيفية تقسيم التكرارات، نقاط الأمان",
  "theme": "الفكرة المحورية للجلسة (مثال: بناء قوة السحب مع تحمل وزن الجسم)",
  "warmup": [
    {"format": "", "scoreType": "", "movements": [
      {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "إيقاع هادئ — تنشيط الدورة الدموية"},
      {"exerciseId": "push-up", "reps": "10", "weight": "", "distance": "", "time": "", "notes": "بطيء — تفعيل الكتف والصدر"},
      {"exerciseId": "sit-up", "reps": "15", "weight": "", "distance": "", "time": "", "notes": "تفعيل العضلة الوسطى"}
    ]}
  ],
  "strength": [
    {"format": "3 SETS", "scoreType": "", "movements": [
      {"exerciseId": "pull-up", "reps": "5", "weight": "", "distance": "", "time": "", "notes": "Strict فقط — توقف 3 ث في الأعلى، متوسط: Banded، متقدم: Weighted BW"},
      {"exerciseId": "handstand-pushup", "reps": "5", "weight": "", "distance": "", "time": "", "notes": "Strict HSPU — متوسط: Pike Push-up، نخبة: Freestanding HSPU"}
    ]}
  ],
  "metcon": [
    {"format": "FOR TIME", "scoreType": "Time", "movements": [
      {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "Kipping مسموح — لا تصل للفشل الكامل"},
      {"exerciseId": "push-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "صدر للأرض في كل تكرار"},
      {"exerciseId": "burpee", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "استمر في الحركة — لا توقف"}
    ]}
  ],
  "cooldown": [
    {"format": "", "scoreType": "", "movements": [
      {"exerciseId": "sit-up", "reps": "10", "weight": "", "distance": "", "time": "45 ث", "notes": "تمطيط الصدر والكتفين — أمسك 45 ث"}
    ]}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs التمارين المتاحة أعلاه
- weight يبقى فارغاً دائماً (وزن الجسم)
- **كل قسم مصفوفة بلوكات لا مصفوفة تمارين مباشرة** — كل بلوك: {"format": "...", "scoreType": "...", "movements": [...]}
- الإحماء: بلوك واحد، 3-4 تمارين ديناميكية تُهيئ للعمل الرئيسي
- القوة/Skill: بلوك واحد، 2-3 تمارين مهارية عالية الجودة
- الميتكون: بلوك واحد، 3-5 تمارين مكثفة 7-20 دقيقة
- في كل notes: اذكر scaling للمبتدئين وللمتقدمين
- التهدئة: بلوك واحد، 2-3 تمطيطات للعضلات الأكثر استخداماً

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const crossfitPrompt = `أنت رئيس مدربي CrossFit (Head Coach) بشهادة CF-L3 وخبرة أكثر من 12 سنة في برمجة الحصص الجماعية اليومية على مستوى CompTrain وPRVN Athletics. تفهم فسيولوجيا التدريب بعمق: أنظمة الطاقة الثلاثة (Phosphagen — انفجاري تحت 10 ثوان، Glycolytic — 10 ثانية إلى 3 دقائق، Oxidative — أكثر من 3 دقائق)، ومبدأ CrossFit الأساسي: "حركات وظيفية متعددة المفاصل، متنوعة باستمرار، بشدة عالية نسبية".

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: رجال ونساء (18-40 سنة) — حصة جماعية (Class) وليست تدريباً فردياً
الأوزان: استخدم جدول مرحلة الدورة أدناه — يحتوي أوزان الرجال والنساء لكل مستوى
مدة الحصة الكاملة: ${classDuration} دقيقة
${getRxFocusGuidance(rxFocus)}
═══════════════════════════════

**تفاصيل التمرين المطلوب:**
- الصعوبة: ${difficulty}
- طابع الجلسة: ${sessionType === 'heavy' ? '🔴 يوم ثقيل — قوة compound ثقيلة 80-90% 1RM (مدة/حمل الميتكون: التزم حرفياً بنوع تحفيز اليوم أدناه، لا برقم منفصل هنا)' : sessionType === 'skill' ? '🎯 يوم تقنية — Olympic Lifting أو Gymnastics skill + ميتكون خفيف' : sessionType === 'cardio' ? '🫀 يوم تحمل — التزم بنوع تحفيز اليوم أدناه لمدة/حمل الميتكون، لا برقم منفصل هنا' : sessionType === 'deload' ? '🔄 يوم تفريغ — 60-70% شدة، تقنية، لا إجهاد' : '⚖️ متوازن — CrossFit كلاسيكي قوة + ميتكون'}
${focus ? `- التركيز العضلي: ${focus}` : ''}
${!isBenchmarkDay ? `- نمط القوة ${patternIsForced ? 'المطلوب من المدرب' : 'المقترح آلياً بناءً على تحليل الأسبوع'}: **${effectivePattern.toUpperCase()}** ${patternIsForced ? '' : '(الأكثر إهمالاً هذا الأسبوع)'}` : ''}
${metconFormat ? `- صيغة الميتكون المطلوبة: ${metconFormat}` : ''}
${targetDuration ? `- المدة المرغوبة للميتكون: ${targetDuration} دقيقة (التزم بها)` : ''}
${forceExercise ? `\n⚡ تمرين مطلوب إدراجه بالضرورة: ${forceExercise}` : ''}
${forbidExercises.length ? `\n🚫 تمارين محظورة اليوم (لا تضعها): ${forbidExercises.join(', ')}` : ''}
${specialNotes ? `\n📌 تعليمات خاصة من المدرب (أولوية قصوى):\n${specialNotes}` : ''}
${date ? `- التاريخ: ${date}` : ''}
${getEquipmentGuidance(equipmentNote)}
${benchmarkGuidance}

**قائمة التمارين المتاحة (استخدم ID المطابق حصراً):**
${exerciseList}
${recentContext}
**⏱️ ميزانية وقت الحصة (${classDuration} دقيقة) — التزم بتوزيع الوقت هذا:**
${getClassTimeBudget(classDuration)}

${!isBenchmarkDay ? `**💪 ${strengthGuidanceFor(effectivePattern)}**

**🔆 قاعدة المرحلة الخاصة من الإحماء لنمط اليوم (${effectivePattern}) — إجبارية:**
${warmupGuidanceFor(effectivePattern, lastWarmupIds)}

**🔗 قاعدة توافق الأكسسوار مع نمط اليوم (${effectivePattern}) — إجبارية:**
${accessoryGuidanceFor(effectivePattern, lastAccessoryIds)}

**🧘 قاعدة توافق التهدئة مع نمط اليوم (${effectivePattern}) — إجبارية:**
${cooldownGuidanceFor(effectivePattern, lastCooldownIds)}

**📈 مرحلة دورة التدريج الحالية — استخدم أوزان هذه المرحلة حرفياً لتمرين القوة الرئيسي، لا أوزاناً من ذاكرتك. لحركات الميتكون المُحمَّلة: استخدم هذا الجدول كمرجع 1RM أساسي ثم طبّق "قانون التحميل حسب التكرارات" (خطوة ٣ أعلاه) بدل نسخ وزن القوة مباشرة:**
المرحلة: ${CYCLE_PHASE_LABELS_AR[cyclePhase]} (${CYCLE_PHASE_INFO[cyclePhase].pctLabel}) — ${CYCLE_PHASE_INFO[cyclePhase].description}
${getRpeGuidance(cyclePhase)}
${getWeightStandardsTable(cyclePhase)}
${isPartnerDay && partnerFormat ? `\n**${partnerFormatGuidanceFor(partnerFormat)}**\n${PARTNER_SESSION_COHERENCE_GUIDANCE}` : ''}
${isBackToBackHeavyDay ? `\n**⚠️ قاعدة شدة إجبارية — تباعد أيام الثقل:** أمس (${yesterdayStr}) كان يوم ${PATTERN_LABELS_AR[lastPattern as MovementPattern]} (نمط ثقيل بطبيعته)، واليوم نمط ${PATTERN_LABELS_AR[effectivePattern]} (ثقيل بطبيعته أيضاً) بلا يوم راحة بينهما. خفّف شدة اليوم صراحة إلى MEDIUM: RPE 6-7 بدل 7-8، وأوزان أقل بـ5-10% من جدول المرحلة أعلاه لتمرين القوة تحديداً — واذكر السبب حرفياً في notes ("خُفِّف الحمل لأن أمس كان يوم ثقيل بلا راحة").` : ''}` : ''}

**فلسفة البرمجة الاحترافية:**
✦ استخدم تحليل الأسبوع أعلاه لتحديد شدة اليوم والمجموعات المستهدفة
✦ الإحماء — ٣ بلوكات إجبارية بالضبط بهذا الترتيب (كل بلوك له format خاص به، لا قائمة مسطّحة):
   (١) بلوك عام: format فارغ أو زمني بسيط (مثال: "2:00")، حركة كارديو خفيفة واحدة فقط (row/bike/run) — رفع نبض بحت، بلا تمارين أخرى
   (٢) بلوك خاص مؤقّت: format = "AMRAP x N MIN" (N بين 4-6)، 3-5 حركات من قاعدة الإحماء الخاص لنمط اليوم أعلاه (تفعيل + تحرير مفصلي بدون حمل)
   (٣) بلوك تحضير المهارة: format = "1-2 SETS" أو "EVERY X:XX (N SETS)" — **حدّد أولاً أي حركة في جلسة اليوم (القوة أم الميتكون) هي الأعقد تقنياً**، ورشّح لها هذا البلوك تحديداً لا حركة القوة دائماً بشكل تلقائي. إن كانت تلك الحركة مركّبة (مثال: DB Thruster = Front Squat position + Push Press)، فكّكها لمكوّناتها كحركات منفصلة بأوزان/تكرارات خفيفة بدل تكرار الحركة نفسها لايت — هذا تدريب عصبي-عضلي للمسار الحركي قبل تحميله، لا مجرد تسخين
✦ استخدم فقط IDs موجودة في قائمة التمارين أعلاه — أي ID غير موجود في القائمة يُستبعد تلقائياً من الإحماء الناتج، فلا تخترع IDs جديدة (مثال صحيح موجود فعلياً: pvc-pass-through)
✦ القوة: compound movements بالبار (barbell) بنسب تتناسب مع شدة الأسبوع ونمط اليوم المحدد أعلاه — بلوك واحد، format بترميز فترات صريح (مثال: "EVERY 2:30 (4 SETS)" أو "5 SETS")، وscoreType واضح ("Heaviest Weight" أو "Weight"). إن كانت الجلسة تصاعدية الشدة، اذكر ذلك في executionNote للحركة نفسها (مثال: "Start @ RPE 6 and Build into RPE 8/9") بدل RPE ثابت لكل المجموعات
✦ الميتكون — نوعه ("Hero/Benchmark" تنسيقات معروفة لا تخترع بديلاً إن طُلب بنشمارك محدد أعلاه، "Chipper" تسلسل 5-7 تمارين مرة واحدة، "EMOM" لضبط الإيقاع لا الحد الأقصى) يُختار بما يخدم مدة/نظام الطاقة المحدَّدين في "نوع تحفيز اليوم" أدناه — لا تختر مدة أو نظام طاقة يعارضهما
${!isBenchmarkDay ? `✦ ⚠️ **قاعدة توافق الميتكون مع نمط اليوم (${effectivePattern}) — إجبارية:**\n${metconGuidanceFor(effectivePattern, lastMetconIds)} — الأكسسوار أيضاً يعزّز نفس مجموعة عضلات نمط اليوم من زاوية مختلفة (راجع قاعدة توافق الأكسسوار أعلاه)، لا يعوّض بنمط معاكس` : ''}
${!isBenchmarkDay ? `\n${movementBlacklistGuidance(effectivePattern)}\n\n${stimulusGuidanceFor(effectiveStimulus)}\n\n${metconStimulusMixGuidance()}\n\n${metconRepLoadGuidance()}\n\n${metconTimeCapGuidance()}` : ''}
✦ الميتكون بلوك واحد عادة، format = صيغة الميتكون حرفياً ("FOR TIME" أو "AMRAP x N MIN" أو "EMOM x N MIN"). لا يلزم أن تكون التكرارات متطابقة بين كل الحركات — سلّم غير متماثل مسموح ومرغَّب أحياناً (مثال: حركة أولى 10-15-20-25-30 مقابل حركة ثانية بالتوازي 15-25-35-45) إن كان يخدم توازن الحمل بين الحركتين. عند وجود بنشمارك RX رسمي محدد الأوزان، اذكر الوزن الدقيق في حقل weight لا نطاقاً عاماً
✦ التهدئة: تمطيط هادئ للمجموعات العضلية المُستنزفة اليوم حسب القاعدة أعلاه

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات محددة → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً صحيحاً

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان التمرين اليومي بالعربية — احترافي ومُلهم",
  "titleEn": "Daily workout title in English — professional and inspiring",
  "type": "للوقت | AMRAP | قوة | تدريب",
  "duration": 20,
  "rounds": 5,
  ${isPartnerDay ? `"isPartnerWod": true,\n  "partnerFormat": "${partnerFormat}",` : ''}
  "notes": "ملاحظات تفصيلية: كيف تُقسّم الجهد، إيقاع التنفس المحدد أعلاه في نوع تحفيز اليوم (طبّقه حرفياً)، معايير الحركة (Movement Standards) للحركات الرئيسية",
  "theme": "الرابط التدريبي بين القوة والميتكون ونظام الطاقة المستهدف",
  "targetTimes": {
    "beginner": "25-30 دقيقة",
    "intermediate": "18-22 دقيقة",
    "advanced": "14-17 دقيقة",
    "elite": "10-13 دقيقة"
  },
  "warmup": [
    {"format": "2:00", "scoreType": "", "movements": [
      {"exerciseId": "row", "reps": "", "weight": "", "distance": "", "time": "2:00", "notes": "هادئ جداً — رفع نبض بحت (عام)"}
    ]},
    {"format": "AMRAP x 5 MIN", "scoreType": "", "movements": [
      {"exerciseId": "air-squat", "reps": "8", "weight": "", "distance": "", "time": "", "notes": "تفعيل نمط القرفصاء بدون حمل"},
      {"exerciseId": "pvc-pass-through", "reps": "8", "weight": "", "distance": "", "time": "", "notes": "تحرير الكتف"}
    ]},
    {"format": "1-2 SETS", "scoreType": "", "movements": [
      {"exerciseId": "back-squat", "reps": "3", "weight": "", "distance": "", "time": "", "executionNote": "بار فارغ", "notes": "تحضير مسار حركة القوة الرئيسية قبل التحميل"}
    ]}
  ],
  "strength": [
    {"format": "EVERY 2:30 (4 SETS)", "scoreType": "Heaviest Weight", "movements": [
      {
        "exerciseId": "back-squat",
        "reps": "5",
        "weight": "",
        "distance": "",
        "time": "",
        "executionNote": "Start @ RPE 6 and Build into RPE 8/9",
        "notes": "ركز على العمق الكامل — ركبتيك تتبعان أصابع قدميك",
        "levels": {
          "beginner":     {"weight": "50كجم", "reps": "5", "cue": "عمق موازٍ — ظهر مستقيم"},
          "intermediate": {"weight": "70كجم", "reps": "5", "cue": "عمق كامل — ركبة وفق القدم"},
          "advanced":     {"weight": "90كجم", "reps": "5", "cue": "سرعة في الصعود — حزام"},
          "elite":        {"weight": "110كجم+", "reps": "5", "cue": "Pause Squat 2ث — انفجاري للأعلى"}
        }
      }
    ]}
  ],
  "metcon": [
    {"format": "FOR TIME", "scoreType": "Time", "movements": [
      {
        "exerciseId": "thruster",
        "reps": "21-15-9",
        "weight": "",
        "distance": "",
        "time": "",
        "notes": "قسّمها: 15-6 ثم 9-6 ثم 5-4 — معيار الحركة: أسفل من موازٍ ثم قفل الأذرع كاملاً فوق الرأس",
        "levels": {
          "beginner":     {"weight": "30كجم", "reps": "21-15-9", "cue": "Push Press بدل Thruster عند الإرهاق"},
          "intermediate": {"weight": "43كجم", "reps": "21-15-9", "cue": "حافظ على إيقاعك — لا تتوقف طويلاً"},
          "advanced":     {"weight": "55كجم", "reps": "21-15-9", "cue": "Unbroken أول جولة"},
          "elite":        {"weight": "65كجم", "reps": "21-15-9", "cue": "Squat Clean into Thruster للأول"}
        }
      },
      {
        "exerciseId": "pull-up",
        "reps": "21-15-9",
        "weight": "",
        "distance": "",
        "time": "",
        "notes": "قسّم التكرارات — لا تصل للفشل الكامل — معيار الحركة: ذقن فوق العارضة",
        "levels": {
          "beginner":     {"weight": "", "reps": "21-15-9", "cue": "Banded Pull-up أو Ring Row"},
          "intermediate": {"weight": "", "reps": "21-15-9", "cue": "Kipping مسموح — مجموعات صغيرة"},
          "advanced":     {"weight": "", "reps": "21-15-9", "cue": "Butterfly للسرعة"},
          "elite":        {"weight": "", "reps": "21-15-9", "cue": "Chest-to-Bar — Unbroken أكثر ما يمكن"}
        }
      }
    ]}
  ],
  "accessory": [
    {"format": "3 SETS", "scoreType": "", "movements": [
      {
        "exerciseId": "push-up",
        "reps": "15",
        "weight": "",
        "distance": "",
        "time": "",
        "notes": "تمرين مكمّل — طبّق قاعدة توافق الأكسسوار أعلاه بدقة، واشرح هنا من أي زاوية مختلفة يعزّز هذا التمرين نفس مجموعة عضلات نمط اليوم",
        "levels": {
          "beginner":     {"weight": "", "reps": "10", "cue": "ركبتين على الأرض مسموح"},
          "intermediate": {"weight": "", "reps": "15", "cue": "صدر للأرض في كل تكرار"},
          "advanced":     {"weight": "", "reps": "20", "cue": "بطيء في النزول — 3 ث"},
          "elite":        {"weight": "", "reps": "25", "cue": "Ring Push-up للصعوبة"}
        }
      }
    ]}
  ],
  "cooldown": [
    {"format": "", "scoreType": "", "movements": [
      {"exerciseId": "standing-quad-stretch", "reps": "", "weight": "", "distance": "", "time": "60 ث", "notes": "طبّق قاعدة توافق التهدئة أعلاه — استخدم exerciseId الإطالة نفسه من القائمة، لا تمريناً بديلاً — اشرح هنا سبب اختيار هذه الإطالة تحديداً لعضلات اليوم"},
      {"exerciseId": "kneeling-hip-flexor-stretch", "reps": "", "weight": "", "distance": "", "time": "45 ث", "notes": "إطالة ثابتة ثانية من دليل التوافق — اذكر المنطقة المستهدفة"}
    ]}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs من القائمة أعلاه
${isBenchmarkDay ? '- اليوم بنشمارك: strength = [] وaccessory = [] إجبارياً — الميتكون هو البنشمارك المحدد أعلاه حرفياً بحركاته وتكراراته الرسمية فقط' : `- تمارين القوة (strength) يجب أن تكون بالبار حصراً (${BARBELL_STRENGTH_IDS.join(', ')}) وتنتمي لنمط ${effectivePattern} تحديداً حسب دليل اختيار تمرين القوة أعلاه — لا تضع pull-up أو handstand-pushup في القوة`}
- كل حركة في strength وmetcon يجب أن تحتوي على حقل "levels" بالمستويات الأربعة مع الوزن والتكرارات والنصيحة
- كل حركة في accessory يجب أن تحتوي على حقل "levels" بالمستويات الأربعة أيضاً
- الإحماء والتهدئة: بدون levels (تُضاف في notes فقط)
- **كل قسم (warmup/strength/metcon/accessory/cooldown) مصفوفة بلوكات، لا مصفوفة تمارين مباشرة** — كل بلوك: {"format": "...", "scoreType": "...", "movements": [...]}. حتى لو بلوك واحد فقط في القسم، يبقى داخل مصفوفة بلوكات
- الإحماء: ٣ بلوكات بالضبط بالترتيب المحدد أعلاه (عام زمني → خاص AMRAP → تحضير المهارة) — البلوك الأول حركة واحدة دائماً، الثاني 3-5 حركات، الثالث 1-3 حركات (أكثر من واحدة فقط إن كانت حركة تحضير المهارة مركّبة وتحتاج تفكيكاً)
${isBenchmarkDay ? '' : '- القوة: بلوك واحد، 1-3 حركات barbell compound حسب ميزانية الوقت أعلاه، format بترميز فترات صريح'}
- الميتكون: بلوك واحد عادة (أو بلوكين لو الصيغة تتطلب جزأين منفصلين)، 3-5 حركات مكثفة، مدتها متوافقة مع نظام الطاقة المستهدف
- targetTimes: أوقات واقعية لإنهاء الميتكون لكل مستوى
${isBenchmarkDay ? '- الأكسسوار: مصفوفة بلوكات فارغة [] — البنشمارك هو كامل التحفيز' : '- الأكسسوار: بلوك واحد، 1-3 حركات حسب ميزانية الوقت — طبّق قاعدة التوافق أعلاه بدقة صارمة ولا تخرج عنها، واذكر السبب في notes'}
- التهدئة (الإطالات): بلوك واحد بلا format خاص، 2-3 إطالات ثابتة (static stretches) فقط — لا تضع أي عنصر لخفض النبض أو تهدئة القلب (ممنوع: مشي/جري/تجديف خفيف "لخفض النبض") — كل عنصر يجب أن يكون إطالة عضلية ثابتة فعلية بمدة زمنية في حقل time. **استخدم دائماً exerciseId الإطالة المخصص من قاعدة التوافق أعلاه حرفياً — لا تستخدم تمريناً بديلاً غير مطابق (ممنوع مثلاً استخدام sit-up أو pull-up كبديل لإطالة اسمها مختلف)**، واذكر السبب في notes
- إن كان اليوم Olympic (snatch/clean-and-jerk/power-clean)، اذكر في notes ملاحظة أمان عن تقنية الإفلات (bail-out) عند الفشل
${isPartnerDay ? `- 🤝 يوم بارتنر: العنوان (title وtitleEn) يجب أن يتضمن كلمة "بارتنر"/"Partner" بوضوح — طبّق قاعدة تماسك يوم البارتنر أعلاه حرفياً على كل قسم (إحماء/ميتكون/تهدئة)، والقوة تبقى فردية بلا تغيير` : ''}

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const prompt = wodMode === 'calisthenics' ? calisthenicsPrompt : crossfitPrompt;

  return {
    prompt,
    date: date || todaySA(),
    wodMode,
    isBenchmarkDay,
    effectivePattern,
    effectiveStimulus,
    cyclePhase,
    isPartnerDay,
    partnerFormat,
  };
}

/** يحلّل استجابة JSON الخام من أي مزوّد، يطبّق التحقق من صحة IDs ومحظورات دمج الحركات (قاعدتا ١ و٣ صارمتان،
 * قاعدة ٢ رصد فقط)، ويبني جسم استجابة API الجاهز للإرجاع — لا يتصل بأي مزوّد ذكاء اصطناعي */
export function processDailyWodResult(rawText: string, ctx: DailyWodContext) {
  const generated = parseAiJson(rawText);
  const validIds = new Set(EXERCISES.map(e => e.id));

  const validateMovement = (item: any) => ({
    exerciseId: item.exerciseId,
    reps: item.reps || '',
    weight: item.weight || '',
    distance: item.distance || '',
    time: item.time || '',
    notes: item.notes || '',
    executionNote: item.executionNote || '',
    levels: sanitizeLevels(item.levels),
  });

  const validateSection = (blocks: any[]) =>
    (blocks || [])
      .map((block: any) => ({
        format: typeof block?.format === 'string' ? block.format : '',
        scoreType: block?.scoreType || '',
        movements: (block?.movements || []).filter((m: any) => m && validIds.has(m.exerciseId)).map(validateMovement),
      }))
      .filter((block: any) => block.movements.length > 0);

  // ═══ محظورات دمج الحركات — تحقق صارم بعد التوليد (قاعدتا ١ و٣ فقط) ═══
  let strengthBlocks = ctx.isBenchmarkDay ? [] : validateSection(generated.strength);
  let metconBlocks = validateSection(generated.metcon);
  const blacklistWarnings: string[] = [];
  if (ctx.wodMode === 'crossfit' && !ctx.isBenchmarkDay) {
    const rule1 = stripRule1Violations(strengthBlocks);
    strengthBlocks = rule1.blocks;
    const rule3 = stripRule3Violations(metconBlocks);
    metconBlocks = rule3.blocks;
    blacklistWarnings.push(...rule1.warnings, ...rule3.warnings);
    blacklistWarnings.push(...detectRule2HeavyOverlap(
      strengthBlocks.flatMap(b => b.movements.map((m: any) => m.exerciseId)),
      metconBlocks.flatMap(b => b.movements.map((m: any) => m.exerciseId)),
    ));
    blacklistWarnings.push(...detectMetconStimulusImbalance(
      metconBlocks.flatMap(b => b.movements.map((m: any) => m.exerciseId)),
    ));
    if (blacklistWarnings.length) console.warn(`[generate/wod ${ctx.date}]`, blacklistWarnings.join(' | '));
  }

  const wodData = {
    date: ctx.date,
    title:   generated.title   || (ctx.wodMode === 'calisthenics' ? 'تمرين Calisthenics' : 'تمرين يومي'),
    titleEn: generated.titleEn || '',
    type: generated.type || 'للوقت',
    isCalisthenics: ctx.wodMode === 'calisthenics',
    duration: generated.duration ?? 20,
    rounds: generated.rounds ?? null,
    notes: generated.notes || '',
    aiTheme: generated.theme || '',
    pattern: ctx.wodMode === 'crossfit' && !ctx.isBenchmarkDay ? ctx.effectivePattern : undefined,
    stimulusType: ctx.wodMode === 'crossfit' && !ctx.isBenchmarkDay ? ctx.effectiveStimulus : undefined,
    isPartnerWod: ctx.isPartnerDay,
    partnerFormat: ctx.isPartnerDay ? (ctx.partnerFormat ?? undefined) : undefined,
    targetTimes: generated.targetTimes || null,
    warmup: validateSection(generated.warmup),
    strength: strengthBlocks,
    metcon: metconBlocks,
    accessory: ctx.isBenchmarkDay ? [] : validateSection(generated.accessory || []),
    cooldown: validateSection(generated.cooldown),
  };

  return {
    wod: wodData,
    theme: generated.theme,
    effectivePattern: ctx.wodMode === 'crossfit' ? ctx.effectivePattern : null,
    cyclePhase: ctx.wodMode === 'crossfit' ? ctx.cyclePhase : null,
    cyclePhaseLabel: ctx.wodMode === 'crossfit' ? CYCLE_PHASE_LABELS_AR[ctx.cyclePhase] : null,
    isPartnerWod: ctx.isPartnerDay,
    partnerFormatLabel: ctx.isPartnerDay && ctx.partnerFormat ? PARTNER_FORMAT_LABELS_AR[ctx.partnerFormat] : null,
    blacklistWarnings,
  };
}
