import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getWods, getLatestWodCycleMeta } from '@/lib/db';
import {
  EXERCISES, getCalisthenicsExercises, MovementPattern, CyclePhase, PartnerFormat,
  suggestPattern, accessoryGuidanceFor, cooldownGuidanceFor, strengthGuidanceFor, warmupGuidanceFor,
  getBenchmarkGuidance, getClassTimeBudget, getEquipmentGuidance, getRxFocusGuidance,
  computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO, getRpeGuidance, getWeightStandardsTable,
  suggestPartnerFormat, partnerFormatGuidanceFor, PARTNER_SESSION_COHERENCE_GUIDANCE, PARTNER_FORMAT_LABELS_AR,
} from '@/lib/crossfitProgramming';
import { parseAiJson } from '@/lib/aiJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PATTERN_KEYS: MovementPattern[] = ['squat', 'hinge', 'push', 'pull', 'olympic'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
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
    const allEx = [...(w.strength || []), ...(w.metcon || [])].map((e: any) => e.exerciseId);
    const muscles: string[] = [];
    if (allEx.some(id => ['back-squat','front-squat','overhead-squat'].includes(id))) muscles.push('الأرجل — القرفصاء (Squat)');
    if (allEx.some(id => ['deadlift'].includes(id))) muscles.push('الخلفية — الرفعة المميتة (Hinge)');
    if (allEx.some(id => ['power-clean','clean-and-jerk','snatch'].includes(id))) muscles.push('الأولمبي/الجسم الكامل');
    if (allEx.some(id => ['pull-up','kipping-pull-up','muscle-up','rope-climb'].includes(id))) muscles.push('الظهر/السحب');
    if (allEx.some(id => ['shoulder-press','push-press','handstand-pushup'].includes(id))) muscles.push('الكتف/الدفع');
    if (allEx.some(id => ['thruster','wall-ball'].includes(id))) muscles.push('الجسم الكامل');
    if (allEx.some(id => ['row','run','double-under','burpee'].includes(id))) muscles.push('القلب/التحمل');
    const hasHeavyStrength = (w.strength || []).length >= 2;
    const intensity = hasHeavyStrength ? 'ثقيلة' : (w.metcon || []).length >= 4 ? 'تحمل' : 'متوسطة';
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
  // هذا يمنع أن يقترح تمرين يوم واحد وزناً "ذروة" في أسبوع مفروض عليه تفريغ من التوليد الأسبوعي
  const latestCycleMeta = await getLatestWodCycleMeta(date || todaySA());

  // ═══ تحديد نمط القوة الفعلي بشكل حتمي (وليس تخميناً من الذكاء الاصطناعي) ═══
  // نتجنب تكرار نمط الأمس ونوزّع الاستخدام بعدالة عبر آخر 7 أيام — نفس منطق التسلسل الأسبوعي (buildPatternSequence)
  // لكن مطبَّقاً هنا على التوليد اليومي المنفرد أيضاً، الذي كان يفتقده سابقاً فينتج تكراراً متتالياً لنفس النمط.
  // rotationOffset = cycleIndex الحالي (نفس ما يستخدمه المسار الأسبوعي) لمنع "القرفصاء" من احتكار الفوز بالتعادل دائماً
  const lastWod = last7Wods[0]; // الأحدث زمنياً قبل تاريخ اليوم المطلوب (last7Wods مرتّبة تنازلياً)
  const patternUsageCount: Partial<Record<MovementPattern, number>> = {};
  for (const w of last7Wods) {
    const p = (w as any).pattern as MovementPattern | undefined;
    if (p) patternUsageCount[p] = (patternUsageCount[p] ?? 0) + 1;
  }
  const coachPattern = PATTERN_KEYS.includes(strengthPattern as MovementPattern) ? (strengthPattern as MovementPattern) : null;
  const effectivePattern: MovementPattern = coachPattern || suggestPattern(undertrained, (lastWod as any)?.pattern, patternUsageCount, latestCycleMeta?.cycleIndex ?? 0);
  const patternIsForced = !!coachPattern;

  // ═══ تمارين الأكسسوار/الإحماء المُستخدمة في آخر جلسة — تُمرَّر كقائمة تجنّب لضمان تنوّع فعلي بدل تكرار نفس الاختيار كل مرة ═══
  const lastAccessoryIds: string[] = ((lastWod as any)?.accessory || []).map((e: any) => e.exerciseId).filter(Boolean);
  const lastWarmupIds: string[] = ((lastWod as any)?.warmup || []).map((e: any) => e.exerciseId).filter(Boolean);

  const validPhases: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];
  const dailyForcePhase: CyclePhase | undefined = validPhases.includes(cyclePhaseOverride)
    ? (cyclePhaseOverride as CyclePhase)
    : (sessionType === 'deload' ? 'deload' : undefined);
  const cyclePhase: CyclePhase = dailyForcePhase
    ?? latestCycleMeta?.cyclePhase
    ?? computeNextCyclePhase(null).phase; // لا توجد دورة مخزّنة بعد — ابدأ من التأسيس

  const benchmarkGuidance = wodMode === 'crossfit' && benchmarkName ? getBenchmarkGuidance(benchmarkName) : '';
  const isBenchmarkDay = !!benchmarkGuidance;

  // ═══ يوم البارتنر — طبقة صيغة فوق نمط اليوم العادي، لا يُفعَّل في أيام البنشمارك الثابتة ═══
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
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "إيقاع هادئ — تنشيط الدورة الدموية"},
    {"exerciseId": "push-up", "reps": "10", "weight": "", "distance": "", "time": "", "notes": "بطيء — تفعيل الكتف والصدر"},
    {"exerciseId": "sit-up", "reps": "15", "weight": "", "distance": "", "time": "", "notes": "تفعيل العضلة الوسطى"}
  ],
  "strength": [
    {"exerciseId": "pull-up", "reps": "5×3", "weight": "", "distance": "", "time": "", "notes": "Strict فقط — توقف 3 ث في الأعلى، متوسط: Banded، متقدم: Weighted BW"},
    {"exerciseId": "handstand-pushup", "reps": "4×5", "weight": "", "distance": "", "time": "", "notes": "Strict HSPU — متوسط: Pike Push-up، نخبة: Freestanding HSPU"}
  ],
  "metcon": [
    {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "Kipping مسموح — لا تصل للفشل الكامل"},
    {"exerciseId": "push-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "صدر للأرض في كل تكرار"},
    {"exerciseId": "burpee", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "استمر في الحركة — لا توقف"}
  ],
  "cooldown": [
    {"exerciseId": "sit-up", "reps": "10", "weight": "", "distance": "", "time": "45 ث", "notes": "تمطيط الصدر والكتفين — أمسك 45 ث"}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs التمارين المتاحة أعلاه
- weight يبقى فارغاً دائماً (وزن الجسم)
- الإحماء: 3-4 تمارين ديناميكية تُهيئ للعمل الرئيسي
- القوة/Skill: 2-3 تمارين مهارية عالية الجودة
- الميتكون: 3-5 تمارين مكثفة 7-20 دقيقة
- في كل notes: اذكر scaling للمبتدئين وللمتقدمين
- التهدئة: 2-3 تمطيطات للعضلات الأكثر استخداماً

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
- طابع الجلسة: ${sessionType === 'heavy' ? '🔴 يوم ثقيل — قوة compound ثقيلة 80-90% 1RM + ميتكون قصير 8-12 دق (نظام Phosphagen/Glycolytic)' : sessionType === 'skill' ? '🎯 يوم تقنية — Olympic Lifting أو Gymnastics skill + ميتكون خفيف' : sessionType === 'cardio' ? '🫀 يوم تحمل — ميتكون طويل 20+ دقيقة (نظام Oxidative)، أوزان خفيفة، معدل قلب مرتفع مستدام' : sessionType === 'deload' ? '🔄 يوم تفريغ — 60-70% شدة، تقنية، لا إجهاد' : '⚖️ متوازن — CrossFit كلاسيكي قوة + ميتكون'}
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
${cooldownGuidanceFor(effectivePattern)}

**📈 مرحلة دورة التدريج الحالية — استخدم أوزان هذه المرحلة حرفياً، لا أوزاناً من ذاكرتك:**
المرحلة: ${CYCLE_PHASE_LABELS_AR[cyclePhase]} (${CYCLE_PHASE_INFO[cyclePhase].pctLabel}) — ${CYCLE_PHASE_INFO[cyclePhase].description}
${getRpeGuidance(cyclePhase)}
${getWeightStandardsTable(cyclePhase)}
${isPartnerDay && partnerFormat ? `\n**${partnerFormatGuidanceFor(partnerFormat)}**\n${PARTNER_SESSION_COHERENCE_GUIDANCE}` : ''}` : ''}

**فلسفة البرمجة الاحترافية:**
✦ استخدم تحليل الأسبوع أعلاه لتحديد شدة اليوم والمجموعات المستهدفة
✦ الإحماء (3 مراحل إجبارية): (1) عام — رفع معدل القلب 2-3 دقائق (row/run خفيف) (2) خاص — طبّق قاعدة الإحماء الخاص لنمط اليوم أعلاه حرفياً (تفعيل + تحرير مفصلي بدون حمل) (3) تحضير المهارة — مجموعة تحضيرية خفيفة من حركة القوة الرئيسية بنسبة 40-50%
✦ استخدم فقط IDs موجودة في قائمة التمارين أعلاه — أي ID غير موجود في القائمة (حتى لو منطقياً كـ "PVC pass-through" أو "banded distraction") يُستبعد تلقائياً من الإحماء الناتج، فلا تخترع IDs جديدة
✦ القوة: compound movements بالبار (barbell) بنسب تتناسب مع شدة الأسبوع ونمط اليوم المحدد أعلاه
✦ الميتكون — اختر نوعاً يناسب نظام الطاقة المطلوب:
   - زمن أقل من 5 دقائق (AMRAP قصير أو For Time بأثقال ثقيلة): نظام Phosphagen/Glycolytic — شدة قصوى
   - زمن 5-15 دقيقة: النظام الأكثر شيوعاً في CrossFit — Glycolytic (21-15-9 كلاسيكي، Chipper متوسط)
   - زمن 15-30+ دقيقة: نظام Oxidative — AMRAP طويل أو أعداد جولات كثيرة، أثقال أخف
   - "Hero/Benchmark": تنسيقات معروفة (لا تخترع بديلاً إن طُلب بنشمارك محدد أعلاه)
   - "Chipper": تسلسل من 5-7 تمارين يُنجز مرة واحدة بدون تكرار الجولة
   - "EMOM": x تمارين في كل دقيقة لـ 10-20 دقيقة — استخدمه لضبط الإيقاع وليس للحد الأقصى
${!isBenchmarkDay ? `✦ ⚠️ لا تجعل الميتكون معاكساً بالكامل لنمط اليوم (${effectivePattern}) — أدرج حركة واحدة على الأقل من نفس النمط ضمن الميتكون. الأكسسوار وحده مسؤول عن الموازنة الكاملة بالنمط المعاكس، لا الميتكون أيضاً` : ''}
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
  "notes": "ملاحظات تفصيلية: كيف تُقسّم الجهد، متى تتنفس، معايير الحركة (Movement Standards) للحركات الرئيسية",
  "theme": "الرابط التدريبي بين القوة والميتكون ونظام الطاقة المستهدف",
  "targetTimes": {
    "beginner": "25-30 دقيقة",
    "intermediate": "18-22 دقيقة",
    "advanced": "14-17 دقيقة",
    "elite": "10-13 دقيقة"
  },
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "هادئ جداً — إيقاع المحادثة (عام)"},
    {"exerciseId": "air-squat", "reps": "15", "weight": "", "distance": "", "time": "", "notes": "تفعيل نمط القرفصاء بدون حمل (خاص)"}
  ],
  "strength": [
    {
      "exerciseId": "back-squat",
      "reps": "5×5",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "ركز على العمق الكامل — ركبتيك تتبعان أصابع قدميك",
      "levels": {
        "beginner":     {"weight": "50كجم", "reps": "5×4", "cue": "عمق موازٍ — ظهر مستقيم"},
        "intermediate": {"weight": "70كجم", "reps": "5×5", "cue": "عمق كامل — ركبة وفق القدم"},
        "advanced":     {"weight": "90كجم", "reps": "5×5", "cue": "سرعة في الصعود — حزام"},
        "elite":        {"weight": "110كجم+", "reps": "5×5", "cue": "Pause Squat 2ث — انفجاري للأعلى"}
      }
    }
  ],
  "metcon": [
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
  ],
  "accessory": [
    {
      "exerciseId": "push-up",
      "reps": "3×15",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "تمرين مكمّل — طبّق قاعدة توافق الأكسسوار أعلاه بدقة، واشرح هنا لماذا هذه العضلة تحديداً مُهملة اليوم",
      "levels": {
        "beginner":     {"weight": "", "reps": "3×10", "cue": "ركبتين على الأرض مسموح"},
        "intermediate": {"weight": "", "reps": "3×15", "cue": "صدر للأرض في كل تكرار"},
        "advanced":     {"weight": "", "reps": "3×20", "cue": "بطيء في النزول — 3 ث"},
        "elite":        {"weight": "", "reps": "3×25", "cue": "Ring Push-up للصعوبة"}
      }
    }
  ],
  "cooldown": [
    {"exerciseId": "run", "reps": "", "weight": "", "distance": "400م", "time": "", "notes": "مشي هادئ 2 دقيقة — خفّف معدل القلب تدريجياً"},
    {"exerciseId": "sit-up", "reps": "", "weight": "", "distance": "", "time": "60 ث", "notes": "طبّق قاعدة توافق التهدئة أعلاه — اشرح هنا سبب اختيار هذه الإطالة تحديداً لعضلات اليوم"}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs من القائمة أعلاه
${isBenchmarkDay ? '- اليوم بنشمارك: strength = [] وaccessory = [] إجبارياً — الميتكون هو البنشمارك المحدد أعلاه حرفياً بحركاته وتكراراته الرسمية فقط' : `- تمارين القوة (strength) يجب أن تكون بالبار حصراً (back-squat, front-squat, deadlift, power-clean, clean-and-jerk, snatch, overhead-squat, shoulder-press, push-press, thruster) وتنتمي لنمط ${effectivePattern} تحديداً — لا تضع pull-up أو handstand-pushup في القوة`}
- كل تمرين في strength وmetcon يجب أن يحتوي على حقل "levels" بالمستويات الأربعة مع الوزن والتكرارات والنصيحة
- الإحماء والتهدئة: بدون levels (تُضاف في notes فقط)
- الإحماء: 3-4 تمارين بالمراحل الثلاث (عام → خاص → تحضير المهارة)
${isBenchmarkDay ? '' : '- القوة: 1-3 تمارين barbell compound حسب ميزانية الوقت أعلاه'}
- الميتكون: 3-5 تمارين مكثفة، مدتها متوافقة مع نظام الطاقة المستهدف
- targetTimes: أوقات واقعية لإنهاء الميتكون لكل مستوى
${isBenchmarkDay ? '- الأكسسوار: مصفوفة فارغة [] — البنشمارك هو كامل التحفيز' : '- الأكسسوار: 1-3 تمارين حسب ميزانية الوقت — طبّق قاعدة التوافق أعلاه بدقة صارمة ولا تخرج عنها، واذكر السبب في notes'}
- التهدئة: 2-3 إطالات ثابتة (static stretches) — طبّق قاعدة توافق التهدئة أعلاه بدقة صارمة، واذكر السبب في notes
- إن كان اليوم Olympic (snatch/clean-and-jerk/power-clean)، اذكر في notes ملاحظة أمان عن تقنية الإفلات (bail-out) عند الفشل
${isPartnerDay ? `- 🤝 يوم بارتنر: العنوان (title وtitleEn) يجب أن يتضمن كلمة "بارتنر"/"Partner" بوضوح — طبّق قاعدة تماسك يوم البارتنر أعلاه حرفياً على كل قسم (إحماء/ميتكون/تهدئة)، والقوة تبقى فردية بلا تغيير` : ''}

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const prompt = wodMode === 'calisthenics' ? calisthenicsPrompt : crossfitPrompt;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const generated = parseAiJson(jsonText);
    const validIds = new Set(EXERCISES.map(e => e.id));

    const validateSection = (items: any[]) =>
      (items || []).filter((item: any) => item && validIds.has(item.exerciseId)).map((item: any) => ({
        ...item,
        exerciseId: item.exerciseId,
        reps: item.reps || '',
        weight: item.weight || '',
        distance: item.distance || '',
        time: item.time || '',
        notes: item.notes || '',
        levels: item.levels || null,
      }));

    const wodData = {
      date: date || todaySA(),
      title:   generated.title   || (wodMode === 'calisthenics' ? 'تمرين Calisthenics' : 'تمرين يومي'),
      titleEn: generated.titleEn || '',
      type: generated.type || 'للوقت',
      isCalisthenics: wodMode === 'calisthenics',
      duration: generated.duration ?? 20,
      rounds: generated.rounds ?? null,
      notes: generated.notes || '',
      aiTheme: generated.theme || '',
      pattern: wodMode === 'crossfit' && !isBenchmarkDay ? effectivePattern : undefined,
      isPartnerWod: isPartnerDay,
      partnerFormat: isPartnerDay ? (partnerFormat ?? undefined) : undefined,
      targetTimes: generated.targetTimes || null,
      warmup: validateSection(generated.warmup),
      strength: isBenchmarkDay ? [] : validateSection(generated.strength),
      metcon: validateSection(generated.metcon),
      accessory: isBenchmarkDay ? [] : validateSection(generated.accessory || []),
      cooldown: validateSection(generated.cooldown),
    };

    return NextResponse.json({
      wod: wodData,
      theme: generated.theme,
      effectivePattern: wodMode === 'crossfit' ? effectivePattern : null,
      cyclePhase: wodMode === 'crossfit' ? cyclePhase : null,
      cyclePhaseLabel: wodMode === 'crossfit' ? CYCLE_PHASE_LABELS_AR[cyclePhase] : null,
      isPartnerWod: isPartnerDay,
      partnerFormatLabel: isPartnerDay && partnerFormat ? PARTNER_FORMAT_LABELS_AR[partnerFormat] : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
