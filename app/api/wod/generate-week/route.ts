import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { todaySA } from '@/lib/timezone';
import { getWods, getLatestWodCycleMeta, upsertWodCycleMeta } from '@/lib/db';
import {
  EXERCISES, MovementPattern, PATTERN_LABELS_AR, CyclePhase, PartnerFormat,
  buildPatternSequence, accessoryGuidanceFor, cooldownGuidanceFor, strengthGuidanceFor, warmupGuidanceFor, metconGuidanceFor,
  getBenchmarkGuidance, getClassTimeBudget, getEquipmentGuidance, getRxFocusGuidance,
  computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO, getRpeGuidance, getWeightStandardsTable,
  suggestPartnerFormat, partnerFormatGuidanceFor, PARTNER_SESSION_COHERENCE_GUIDANCE, PARTNER_FORMAT_LABELS_AR,
  heavyDaySpacingGuidance,
} from '@/lib/crossfitProgramming';
import { parseAiJson } from '@/lib/aiJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// يمنح Vercel وقتاً كافياً لتوليد استجابات طويلة قبل قطع الاتصال
export const maxDuration = 300;

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const {
    fromDate, days = 7, weekMode = 'crossfit', calisthenicsDays = 1,
    difficulty = 'متوسط',
    coachFocus = '',        // تركيز المدرب: strength / cardio / technique / balanced
    restDaysCount = -1,     // -1 = auto (الـ AI يقرر), 0-7 = manual
    forbidExercises = [],   // تمارين يجب تجنبها
    forceExercises = [],    // تمارين يجب إدراجها هذا الأسبوع
    intensityBias = 'balanced', // heavy / moderate / light / balanced
    specialNotes = '',      // تعليمات خاصة من المدرب للـ AI
    hyroxMode = false,      // إدراج يوم Hyrox
    targetAudience = 'all', // all / beginners / advanced
    classDuration = 60,     // 45 / 60 / 75 / 90 — مدة الحصة اليومية بالدقائق
    equipmentNote = '',     // قيد معدات حر لكامل الأسبوع
    rxFocus = 'balanced',   // rx / scaled / balanced
    benchmarkName = '',     // بنشمارك محدد (fran, cindy, ...)
    benchmarkDate = '',     // التاريخ الذي يُفرض فيه البنشمارك
    cyclePhaseOverride = 'auto', // auto / foundation / build / peak / deload — فرض مرحلة دورة تدريج محددة
    partnerDaysCount = -1,  // -1 = auto (الـ AI يقرر 0 أو 1)، 0 = بدون بارتنر، N = عدد أيام بارتنر مطلوب صراحة
  } = body;

  const startDate = fromDate || todaySA();

  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push({
      date: d.toISOString().split('T')[0],
      dayName: DAY_NAMES[d.getDay()] || '',
    });
  }

  // Get recent WODs for context + تحليل المجموعات العضلية (نفس منطق التوليد اليومي لضمان استمرارية البرمجة)
  const allWods = await getWods();
  const recentWodsRaw = allWods
    .filter(w => w.date < startDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const recentWods = recentWodsRaw.map(w => ({
    date: w.date, title: w.title, type: w.type,
    strength: (w.strength || []).map((e: any) => e.exerciseId).join(', '),
    metcon: (w.metcon || []).map((e: any) => e.exerciseId).join(', '),
  }));

  const muscleGroupLog: { date: string; muscles: string[]; intensity: string }[] = [];
  for (const w of recentWodsRaw) {
    const allEx = [...(w.strength || []), ...(w.metcon || [])].map((e: any) => e.exerciseId);
    const muscles: string[] = [];
    if (allEx.some((id: string) => ['back-squat','front-squat','overhead-squat'].includes(id))) muscles.push('الأرجل — القرفصاء (Squat)');
    if (allEx.some((id: string) => ['deadlift'].includes(id))) muscles.push('الخلفية — الرفعة المميتة (Hinge)');
    if (allEx.some((id: string) => ['power-clean','clean-and-jerk','snatch'].includes(id))) muscles.push('الأولمبي/الجسم الكامل');
    if (allEx.some((id: string) => ['pull-up','kipping-pull-up','muscle-up','rope-climb'].includes(id))) muscles.push('الظهر/السحب');
    if (allEx.some((id: string) => ['shoulder-press','push-press','handstand-pushup'].includes(id))) muscles.push('الكتف/الدفع');
    if (allEx.some((id: string) => ['thruster','wall-ball'].includes(id))) muscles.push('الجسم الكامل');
    if (allEx.some((id: string) => ['row','run','double-under','burpee'].includes(id))) muscles.push('القلب/التحمل');
    const hasHeavyStrength = (w.strength || []).length >= 2;
    const intensity = hasHeavyStrength ? 'ثقيلة' : (w.metcon || []).length >= 4 ? 'تحمل' : 'متوسطة';
    muscleGroupLog.push({ date: w.date, muscles, intensity });
  }
  const allRecentMuscles = muscleGroupLog.flatMap(d => d.muscles);
  const muscleFreq: Record<string, number> = {};
  allRecentMuscles.forEach(m => { muscleFreq[m] = (muscleFreq[m] || 0) + 1; });
  const overtrained = Object.entries(muscleFreq).filter(([, v]) => v >= 2).map(([k]) => k);
  const undertrained = ['الأرجل — القرفصاء (Squat)','الخلفية — الرفعة المميتة (Hinge)','الأولمبي/الجسم الكامل','الظهر/السحب','الكتف/الدفع','الجسم الكامل','القلب/التحمل']
    .filter(m => !allRecentMuscles.includes(m));

  // ═══ تتبّع الإجهاد التراكمي (نفس منطق مسار اليوم الواحد — كان مفقوداً هنا رغم أن هذا المسار يولّد أسبوعاً كاملاً دفعة واحدة) ═══
  const sessionCount = recentWodsRaw.length;
  const heavyCount = muscleGroupLog.filter(d => d.intensity === 'ثقيلة').length;
  let weekIntensity: string;
  let intensityRecommendation: string;
  if (sessionCount >= 5 || heavyCount >= 3) {
    weekIntensity = 'ثقيل';
    intensityRecommendation = 'الأسبوع الماضي كان ثقيلاً — لا تجعل هذا الأسبوع ثقيلاً بنفس الدرجة إلا إذا كانت مرحلة الدورة "ذروة"، وإلا استخدم أوزان مرحلة الدورة كما هي دون رفعها يدوياً';
  } else if (sessionCount >= 3 || heavyCount >= 1) {
    weekIntensity = 'متوسط';
    intensityRecommendation = 'الأسبوع الماضي متوسط — التزم بأحمال مرحلة الدورة الحالية كما هي';
  } else {
    weekIntensity = 'خفيف';
    intensityRecommendation = 'الأسبوع الماضي خفيف نسبياً (قلة جلسات أو راحة) — الجسم جاهز، يمكن الالتزام الكامل بأحمال مرحلة الدورة دون تخفيف إضافي';
  }

  // ═══ دورة التدريج (Periodization) — تقدّم تلقائي عبر 4 أسابيع (تأسيس→بناء→ذروة→تفريغ) بدل تكرار نفس الوزن كل أسبوع ═══
  const latestCycleMeta = await getLatestWodCycleMeta(startDate);
  const validPhases: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];
  const forcePhase: CyclePhase | undefined = validPhases.includes(cyclePhaseOverride)
    ? (cyclePhaseOverride as CyclePhase)
    : (coachFocus === 'deload' ? 'deload' : undefined); // توافق خلفي مع خيار "أسبوع تفريغ" القديم في coachFocus
  const { phase: cyclePhase, cycleIndex: newCycleIndex, autoDeloadTriggered } =
    computeNextCyclePhase(latestCycleMeta?.cycleIndex ?? null, forcePhase);

  const exerciseList = EXERCISES.map(e => `${e.id} | ${e.nameEn} | ${e.category}`).join('\n');

  // ═══ تسلسل حتمي لأنماط القوة عبر أيام الكروسفيت النشطة (لضمان تنوع + توافق أكسسوار/تهدئة حقيقي) ═══
  // الحد الأدنى رُفع من 1 إلى 2 ليوماً راحة لأي أسبوع 6+ أيام — 1 يوم راحة فقط من 7 كان يترك
  // (كما رُصد فعلياً في الإنتاج) 4 أيام تدريب متتالية بلا توقف في نصف الأسبوع الآخر، طموح جداً
  // لجمهور نادٍ عام غير تنافسي. هذا يُوحِّد الرقم أيضاً مع صيغة "يوم DELOAD/REST" أدناه في فلسفة التوزيع
  // التي كانت تفترض ضمناً ~2 يوم بينما هذا الحساب كان يفترض 1 — التناقض بينهما هو ما سمح للنموذج باختيار الأقل
  const estimatedRestDays = restDaysCount >= 0 ? restDaysCount : Math.max(days >= 6 ? 2 : 1, Math.round(days * 0.25));
  const estimatedNonCrossfitDays = (weekMode === 'mixed' ? calisthenicsDays : 0) + (hyroxMode ? 1 : 0);
  const activeCrossfitDays = Math.max(1, days - estimatedRestDays - estimatedNonCrossfitDays);
  // newCycleIndex كـ rotationOffset — يمنع نمطاً واحداً (القرفصاء) من احتكار "اليوم الإضافي"
  // في كل أسبوع من 6+ أيام نشطة؛ الفائز بالتعادل يتغيّر مع تقدّم رقم الدورة أسبوعياً
  const patternSequence = buildPatternSequence(activeCrossfitDays, undertrained, newCycleIndex);

  // ═══ تجميع الأكسسوار/الإحماء المُستخدَمَين مؤخراً لكل نمط — يُمرَّر كقائمة تجنّب حتى لا يتكرر نفس التمرين
  // بحرفيته عبر أسابيع متتالية بنفس النمط (المشكلة المرصودة فعلياً: نفس تمرينَي الأكسسوار طوال أسبوعين كاملين) ═══
  const patternRecentAccessory: Partial<Record<MovementPattern, string[]>> = {};
  const patternRecentWarmup: Partial<Record<MovementPattern, string[]>> = {};
  const patternRecentMetcon: Partial<Record<MovementPattern, string[]>> = {};
  for (const w of recentWodsRaw) {
    const p = (w as any).pattern as MovementPattern | undefined;
    if (!p) continue;
    const accIds = ((w as any).accessory || []).map((e: any) => e.exerciseId).filter(Boolean);
    const warmIds = ((w as any).warmup || []).map((e: any) => e.exerciseId).filter(Boolean);
    const metconIds = ((w as any).metcon || []).map((e: any) => e.exerciseId).filter(Boolean);
    if (accIds.length) patternRecentAccessory[p] = [...(patternRecentAccessory[p] || []), ...accIds];
    if (warmIds.length) patternRecentWarmup[p] = [...(patternRecentWarmup[p] || []), ...warmIds];
    if (metconIds.length) patternRecentMetcon[p] = [...(patternRecentMetcon[p] || []), ...metconIds];
  }

  const patternLegend = (Object.keys(PATTERN_LABELS_AR) as MovementPattern[])
    .map(p => `- ${PATTERN_LABELS_AR[p]}:\n  ${warmupGuidanceFor(p, patternRecentWarmup[p] || [])}\n  ${accessoryGuidanceFor(p, patternRecentAccessory[p] || [])}\n  ${cooldownGuidanceFor(p)}\n  ${metconGuidanceFor(p, patternRecentMetcon[p] || [])}`)
    .join('\n');

  const isBenchmarkWeek = !!(benchmarkName && benchmarkDate);
  const benchmarkGuidance = isBenchmarkWeek ? getBenchmarkGuidance(benchmarkName) : '';

  const recentContext = `
**═══ تحليل الأسبوع الماضي (آخر 7 أيام قبل بداية هذه الخطة) ═══**
عدد الجلسات: ${recentWodsRaw.length} جلسات
شدة الأسبوع الماضي: ${weekIntensity} — ${intensityRecommendation}
المجموعات العضلية التي تدربت كثيراً (تجنب الإفراط فيها مجدداً):
${overtrained.length ? overtrained.map(m => `- ${m}`).join('\n') : '- لا يوجد إجهاد تراكمي واضح'}
المجموعات العضلية المُهمَلة (أعطها أولوية أعلى في بداية هذه الخطة):
${undertrained.length ? undertrained.map(m => `- ${m}`).join('\n') : '- جميع المجموعات تدربت بشكل متوازن'}
سجل الجلسات التفصيلي:
${muscleGroupLog.map(d => `${d.date}: [${d.muscles.join(' + ')}] — شدة: ${d.intensity}`).join('\n') || 'لا توجد جلسات سابقة — هذا أسبوع تأسيسي'}
`;

  // Build list of dates already computed above (reused variable name kept for clarity in prompt below)

  // Build programming rules based on weekMode
  const programmingRules = weekMode === 'mixed'
    ? `**قواعد البرمجة — أسبوع مختلط CrossFit + Calisthenics:**
- خصص ${calisthenicsDays === 2 ? 'يومَين' : 'يوماً واحداً'} كاملاً لـ Calisthenics (وزن الجسم البحت) من أصل الأيام المطلوبة
- باقي الأيام: CrossFit كلاسيكي + يوم راحة أو راحة نشطة
- أيام Calisthenics: اجعل نوع اليوم "تدريب" وضع isCalisthenics: true
  - strength: تمارين وزن الجسم فقط (pull-up, push-up, muscle-up, handstand-pushup, rope-climb)
  - metcon: circuit من وزن الجسم (burpee, box-jump, double-under, sit-up, toes-to-bar, pull-up, push-up)
  - notes: اذكر أن هذا يوم Calisthenics
  - aiTheme: "Calisthenics — وزن الجسم كامل"
- لا تضع أي أوزان حديد في أيام Calisthenics
- وزّع أيام Calisthenics على مدار الأسبوع بشكل متوازن (ليست يومين متتاليين)
- لا تكرر نفس التمارين في يومين متتاليين
- اجعل القوة والميتكون مترابطَين في أيام CrossFit
- أيام الراحة: warmup وstrength وmetcon وcooldown = مصفوفات فارغة []`
    : `**قواعد البرمجة — CrossFit${hyroxMode ? ' + Hyrox' : ' كامل'}:**
${hyroxMode ? '- أدرج يوماً واحداً مخصصاً لـ Hyrox (run + row + sled push + burpee broad jump) — يوم Hyrox يكون بعد يوم راحة\n- باقي الأيام CrossFit كلاسيكي\n' : '- هذا أسبوع CrossFit خالص — لا يوم Calisthenics ولا يوم Hyrox ولا Kettlebell\n'}
- كل يوم نشاط هو CrossFit كلاسيكي: قوة بالبار + ميتكون مع أوزان
- تمارين القوة (strength): يجب أن تكون بالبار حصراً (back-squat, deadlift, romanian-deadlift, sumo-deadlift, front-squat, overhead-squat, power-clean, hang-power-clean, clean-and-jerk, snatch, hang-power-snatch, shoulder-press, push-press, bench-press, split-jerk, bent-over-row, pendlay-row, good-morning, hip-thrust, thruster) — حسب دليل اختيار تمرين القوة لكل نمط أدناه
- الميتكون: يجمع تمارين الحديد (بار/دمبل/كيتل بيل) مع gymnastics وcardio بحرية — لا يقتصر على قائمة ضيقة، استخدم أي تمرين من القائمة أعلاه يناسب نظام الطاقة المستهدف ونمط اليوم
- وزّع الأيام: HEAVY (1-2 مرة) + MEDIUM (2-3 مرة) + SKILL (مرة) + REST (1-2 مرة)
- يوم SKILL: تقنية أولمبية (snatch, clean) أو جمناستيكس (muscle-up, handstand) — مع ميتكون قصير
- لا تكرر نفس التمارين في يومين متتاليين
- اجعل القوة والميتكون مترابطَين (نفس مجموعة العضلات أو نفس الحركة)
- أيام الراحة: isRest: true وكل المصفوفات فارغة []`;

  const prompt = `أنت رئيس مدربي CrossFit (Head Coach) بشهادة CF-L3، تبرمج أسابيع الحصص الجماعية على مستوى CompTrain وPRVN Athletics. فلسفتك: القوة الوظيفية أولاً، وكل جلسة تخدم جميع المستويات في آن واحد مع أوزان وscaling واضحة. أنت تقرأ سجل تدريب الأسبوع الماضي بعناية وتبني عليه — لا تبرمج بمعزل عن التاريخ.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: ${targetAudience === 'beginners' ? 'مبتدئون — مستوى 1 و2 فقط' : targetAudience === 'advanced' ? 'متقدمون — مستوى 3 و4 (نخبة)' : 'رجال ونساء (18-40 سنة)، 4 مستويات'}
الفلسفة: تمرين واحد لجميع المستويات — مبتدئ يتعلم، نخبة يتحدى
الخطة: ${weekMode === 'mixed' ? `${days} أيام مختلطة CrossFit + ${calisthenicsDays === 2 ? 'يومان' : 'يوم'} Calisthenics${hyroxMode ? ' + يوم Hyrox' : ''}` : hyroxMode ? `${days} أيام CrossFit مع يوم Hyrox` : `${days} أيام CrossFit خالص`}
المدة: ${days} ${days === 1 ? 'يوم' : 'أيام'} من ${startDate} حتى ${dates[dates.length - 1]?.date || ''}
مدة الحصة اليومية: ${classDuration} دقيقة
المستوى العام: ${difficulty}
${getRxFocusGuidance(rxFocus)}
التركيز الأسبوعي (من المدرب): ${coachFocus === 'strength' ? '💪 أسبوع قوة — زد الأحمال الثقيلة، قلل الميتكون الطويل' : coachFocus === 'cardio' ? '🫀 أسبوع تحمل — ميتكون طويل ومتعدد الجولات، قلل أوزان القوة' : coachFocus === 'technique' ? '🎯 أسبوع تقنية — يومان SKILL على الأقل، أوزان خفيفة، تركيز على التقنية الأولمبية' : coachFocus === 'deload' ? '🔄 أسبوع تفريغ — شدة 60-70%، أوزان خفيفة، مدة أقصر' : 'متوازن'}
التحيّز في الشدة: ${intensityBias === 'heavy' ? 'ثقيل — أيام HEAVY أكثر (3-4 أيام)' : intensityBias === 'moderate' ? 'متوسط — تجنب الثقيل الزائد والخفيف الزائد' : intensityBias === 'light' ? 'خفيف — تعافٍ، أوزان منخفضة' : 'متوازن كلاسيكي'}
${restDaysCount >= 0 ? `أيام الراحة: ${restDaysCount} أيام محددة من المدرب` : 'أيام الراحة: الذكاء الاصطناعي يقرر حسب التوزيع المثالي'}
═══════════════════════════════
${forceExercises.length > 0 ? `\n⚡ تمارين مطلوب إدراجها هذا الأسبوع (أولوية قصوى):\n${forceExercises.join(', ')}\n` : ''}${forbidExercises.length > 0 ? `\n🚫 تمارين محظورة هذا الأسبوع (لا تضعها أبداً):\n${forbidExercises.join(', ')}\n` : ''}${specialNotes ? `\n📌 تعليمات خاصة من المدرب (اتبعها بدقة):\n${specialNotes}\n` : ''}${getEquipmentGuidance(equipmentNote)}
${benchmarkGuidance ? `\n${benchmarkGuidance}\n⚠️ هذا البنشمارك يُفرض حصراً على تاريخ ${benchmarkDate} — باقي الأيام تسير بالتسلسل العادي أدناه` : ''}

**التمارين المتاحة (استخدم IDs هذه حصراً):**
${exerciseList}

**الأسبوع الماضي بالتفصيل (اقرأه جيداً وابنِ عليه — لا تكرر نفس التمارين والمجموعات العضلية في يومين متتاليين):**
${recentContext}
${JSON.stringify(recentWods, null, 2)}

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات → rounds = العدد، duration = التايم كاب
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = المجموعات، duration = الوقت التقديري
- duration رقم دائماً، rounds قد يكون null

**⏱️ ميزانية وقت الحصة اليومية (${classDuration} دقيقة):**
${getClassTimeBudget(classDuration)}

**══ فلسفة توزيع الأسبوع الاحترافية ══**

يوم HEAVY   (~${Math.max(1, Math.round(days * 0.2))} مرة): قوة compound ثقيلة (80-90% 1RM) + ميتكون قصير (8-12 دقيقة — نظام Phosphagen/Glycolytic)
يوم MEDIUM  (~${Math.max(2, Math.round(days * 0.35))} مرة): قوة أوليمبية أو تحمل (65-75%) + ميتكون متوسط (12-18 دقيقة — Glycolytic)
يوم SKILL   (~${Math.max(1, Math.round(days * 0.15))} مرة): جمناستيكس + تقنية + ميتكون مختلط
يوم DELOAD/REST (~${estimatedRestDays} مرة): راحة كاملة أو تعافٍ نشط خفيف

⚠️ قاعدة توزيع إجبارية: لا تضع أكثر من 3 أيام تدريب متتالية بدون يوم راحة واحد على الأقل بينها. وزّع أيام الراحة عبر الأسبوع (مثلاً منتصف الأسبوع ونهايته) بدل تجميعها في نصف واحد فقط — الجمهور هنا أعضاء نادٍ عاديون لا رياضيون تنافسيون، فتكديس التدريب طموح زائد لهم.

${heavyDaySpacingGuidance()}

**══ 🔗 تسلسل أنماط القوة الحتمي عبر أيام الكروسفيت النشطة (إجباري — يضمن توافق الأكسسوار والتهدئة) ══**

طبّق هذا الترتيب على أيام الكروسفيت العادية بالتتابع (اليوم الأول من أيام الكروسفيت = النمط الأول، الثاني = الثاني، وهكذا) — تجاهل أيام الراحة/Hyrox/Calisthenics تماماً عند العد ولا تكسر الترتيب بسببها:
${patternSequence.map((p, i) => `${i + 1}. ${PATTERN_LABELS_AR[p]}`).join('\n')}
${isBenchmarkWeek ? `(باستثناء يوم البنشمارك بتاريخ ${benchmarkDate} — لا يأخذ رقماً من هذا التسلسل)` : ''}
${(() => {
  // تحقّق فعلي: هل يقع القرفصاء والرفعة بفارق نمط واحد بينهما في هذا التسلسل تحديداً؟ (المسافة = 2)
  // هذا يجعل قاعدة تباعد الثقل أعلاه ملموسة برقم اليوم الفعلي بدل نص عام قد يُتجاهل
  const squatIdx = patternSequence.map((p, i) => p === 'squat' ? i : -1).filter(i => i >= 0);
  const hingeIdx = patternSequence.map((p, i) => p === 'hinge' ? i : -1).filter(i => i >= 0);
  const flags: string[] = [];
  for (const si of squatIdx) for (const hi of hingeIdx) {
    if (Math.abs(si - hi) === 2) {
      const [a, b] = si < hi ? [si, hi] : [hi, si];
      flags.push(`اليوم رقم ${a + 1} (${PATTERN_LABELS_AR[patternSequence[a]]}) واليوم رقم ${b + 1} (${PATTERN_LABELS_AR[patternSequence[b]]}) بفارق يوم نشط واحد فقط بينهما — طبّق قاعدة تباعد الثقل أعلاه إن لم يكن بينهما يوم راحة فعلي في التقويم النهائي.`);
    }
  }
  return flags.length ? `\n🔍 رُصد فعلياً في هذا التسلسل: ${flags.join(' ')}` : '';
})()}

**دليل التوافق لكل نمط (طبّقه حرفياً على اليوم الذي يحمل هذا النمط):**
${patternLegend}

⚠️ قاعدة تنوّع إجبارية: إذا تكرر نفس النمط أكثر من مرة في هذا الأسبوع (مثال: القرفصاء يومَين)، لا يجوز أن يستخدم اليومان نفس تمرين الأكسسوار أو نفس تمرين التفعيل الخاص في الإحماء أو نفس اسم الإطالة في التهدئة — اختر بديلاً مختلفاً من القائمة المتاحة لكل يوم.

**دليل اختيار تمرين القوة بالبار لكل نمط (إجباري — لا تخلط بين الأنماط، خصوصاً الرفعة والسحب):**
${(Object.keys(PATTERN_LABELS_AR) as MovementPattern[]).map(p => `- ${PATTERN_LABELS_AR[p]}: ${strengthGuidanceFor(p)}`).join('\n')}

مبدأ التنوع الإضافي:
- تنوع الميتكون: AMRAP → للوقت → EMOM → للوقت → AMRAP (لا تكرر نفس الصيغة يومين متتاليين)

⚠️ قاعدة الميتكون الإجبارية — لا تجعل الميتكون معاكساً بالكامل لنمط اليوم: طبّق سطر "الميتكون يجب أن يتضمن..." المذكور لكل نمط ضمن دليل التوافق أعلاه حرفياً (يذكر معرّفات محددة مقترحة لكل نمط). الأكسسوار وحده هو المسؤول عن "الموازنة الكاملة" بالنمط المعاكس — إن كرّرت نفس منطق التعويض في الميتكون أيضاً، يصبح اليوم يحمل اسم نمط لا يُدرّبه فعلياً (رُصد هذا حرفياً في يوم دفع سابق: القوة فقط كانت دفعاً، والميتكون بالكامل تقريباً سحباً).

**══ 🤝 يوم/أيام البارتنر هذا الأسبوع ══**
${partnerDaysCount === 0
  ? 'لا تدرج أي يوم بارتنر هذا الأسبوع — كل الأيام فردية.'
  : `${partnerDaysCount > 0
      ? `أدرج بالضبط ${partnerDaysCount} ${partnerDaysCount === 1 ? 'يوماً واحداً' : 'أيام'} بصيغة بارتنر هذا الأسبوع (اختر أنسب يوم/أيام من الأيام النشطة العادية — لا يُضاف يوم جديد، بل يُعاد تنسيق يوم موجود أصلاً في التسلسل).`
      : 'يمكنك اختيارياً جعل يوم واحد من أيام هذا الأسبوع بصيغة بارتنر إن رأيت أن ذلك يحسّن تنوّع الأسبوع والجانب الاجتماعي للحصة — ليس إلزامياً، فقط عند وجود يوم مناسب (لا يوم HEAVY تقني حساس).'}

دليل اختيار صيغة البارتنر حسب نمط اليوم المُختار (طبّقه حرفياً):
${(Object.keys(PATTERN_LABELS_AR) as MovementPattern[]).map(p => `- ${PATTERN_LABELS_AR[p]}: ${partnerFormatGuidanceFor(suggestPartnerFormat(p))}`).join('\n')}
${PARTNER_SESSION_COHERENCE_GUIDANCE}
في JSON اليوم المختار: أضف "isPartnerWod": true و"partnerFormat" بمفتاح الصيغة المستخدمة (you_go_i_go / synchro / shared_reps / relay_carry)، وباقي الأيام: "isPartnerWod": false بلا حقل partnerFormat.`}

${programmingRules}

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})${isBenchmarkWeek && d.date === benchmarkDate ? '  ← 🏆 يوم البنشمارك المفروض' : ''}`).join('\n')}

**══ 📈 مرحلة دورة التدريج الحالية (إجباري — استخدم أوزان هذه المرحلة حرفياً، لا تخترع أرقاماً ثابتة) ══**
${autoDeloadTriggered ? '⚠️ فُرض هذا كأسبوع تفريغ تلقائياً — مرّت 4 أسابيع متتالية منذ آخر تفريغ حقيقي، والجسم يحتاج تعافياً إجبارياً بغض النظر عن أي طلب آخر.\n' : ''}المرحلة: ${CYCLE_PHASE_LABELS_AR[cyclePhase]} (${CYCLE_PHASE_INFO[cyclePhase].pctLabel}) — ${CYCLE_PHASE_INFO[cyclePhase].description}
${getRpeGuidance(cyclePhase)}
${cyclePhase === 'deload' ? '⚠️ في أسبوع التفريغ: لا يوجد يوم HEAVY إطلاقاً هذا الأسبوع مهما قال توزيع الأيام أعلاه — كل الأيام النشطة MEDIUM أو أخف، وميزانية الميتكون أقصر من المعتاد.' : ''}

جدول الأوزان المرجعي لهذه المرحلة تحديداً (رجال♂ / نساء♀ لكل مستوى — الجمهور مختلط):
${getWeightStandardsTable(cyclePhase)}
${latestCycleMeta?.progressionNote ? `\n🗒️ توصيتك أنت (المدرب الذكي) من الأسبوع الماضي — طبّقها فعلياً الآن ولا تتجاهلها:\n${latestCycleMeta.progressionNote}` : ''}

أرجع JSON بهذا التنسيق (بدون أي نص خارجه):
{
  "wods": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "title": "عنوان احترافي بالعربية يعكس الحركة الرئيسية والهدف",
      "titleEn": "Professional English title — e.g. 'Heavy Front Squat + Anterior Chain MetCon'",
      "type": "للوقت | AMRAP | قوة | تدريب | راحة | راحة نشطة",
      "duration": 20,
      "rounds": null,
      "notes": "استراتيجية الجلسة: كيف يُقسّم المتدرب طاقته، ما هو الهدف الزمني لكل مستوى، معايير الحركة الأساسية",
      "aiTheme": "الرابط الفيزيولوجي والحركي بين القوة والميتكون هذا اليوم + نمط القوة المستخدم",
      "isRest": false,
      "isCalisthenics": false,
      "isPartnerWod": false,
      "partnerFormat": "",
      "warmup": [
        { "exerciseId": "run", "reps": "400م", "weight": "", "notes": "عام — 60% إيقاع" },
        { "exerciseId": "air-squat", "reps": "15", "weight": "", "notes": "خاص — تفعيل نمط اليوم بدون حمل" }
      ],
      "strength": [
        {
          "exerciseId": "back-squat",
          "reps": "5×4",
          "weight": "",
          "notes": "عمق كامل — ركبة فوق القدم — راحة 2-3 دقيقة",
          "levels": {
            "beginner":     {"weight": "50كجم",  "reps": "5×4", "cue": "عمق موازٍ — ظهر مستقيم"},
            "intermediate": {"weight": "75كجم",  "reps": "5×4", "cue": "عمق كامل — ركبة وفق القدم"},
            "advanced":     {"weight": "95كجم",  "reps": "5×4", "cue": "سرعة في الصعود — حزام"},
            "elite":        {"weight": "115كجم", "reps": "5×4", "cue": "Pause 2ث في الأسفل"}
          }
        }
      ],
      "metcon": [
        {
          "exerciseId": "thruster",
          "reps": "21-15-9",
          "weight": "",
          "notes": "قسّم: 12-9 ثم 8-7 ثم لا توقف في الـ 9",
          "levels": {
            "beginner":     {"weight": "30كجم", "reps": "21-15-9", "cue": "توقف عند الحاجة — لا تصل للفشل"},
            "intermediate": {"weight": "43كجم", "reps": "21-15-9", "cue": "قسّم بذكاء — إيقاع ثابت"},
            "advanced":     {"weight": "55كجم", "reps": "21-15-9", "cue": "Unbroken الـ 9 الأخيرة"},
            "elite":        {"weight": "65كجم", "reps": "21-15-9", "cue": "Unbroken كامل — سرعة"}
          }
        },
        {
          "exerciseId": "pull-up",
          "reps": "21-15-9",
          "weight": "",
          "notes": "مجموعات صغيرة — لا تصل للفشل الكامل",
          "levels": {
            "beginner":     {"weight": "", "reps": "21-15-9", "cue": "Banded Pull-up أو Ring Row"},
            "intermediate": {"weight": "", "reps": "21-15-9", "cue": "Kipping مسموح"},
            "advanced":     {"weight": "", "reps": "21-15-9", "cue": "Butterfly للسرعة"},
            "elite":        {"weight": "", "reps": "21-15-9", "cue": "Chest-to-Bar"}
          }
        }
      ],
      "accessory": [
        {
          "exerciseId": "push-up",
          "reps": "3×15",
          "weight": "",
          "notes": "طبّق دليل التوافق أعلاه حسب نمط اليوم — اذكر السبب هنا",
          "levels": {
            "beginner":     {"weight": "", "reps": "3×10", "cue": "ركبتين على الأرض مسموح"},
            "intermediate": {"weight": "", "reps": "3×15", "cue": "صدر للأرض في كل تكرار"},
            "advanced":     {"weight": "", "reps": "3×20", "cue": "بطيء في النزول — 3 ث"},
            "elite":        {"weight": "", "reps": "3×25", "cue": "Ring Push-up للصعوبة"}
          }
        }
      ],
      "cooldown": [
        { "exerciseId": "sit-up",  "reps": "", "weight": "", "time": "60 ث", "notes": "طبّق دليل التوافق أعلاه حسب نمط اليوم — اذكر السبب هنا" },
        { "exerciseId": "pull-up", "reps": "", "weight": "", "time": "45 ث", "notes": "إطالة ثابتة ثانية من دليل التوافق — اذكر المنطقة المستهدفة" }
      ]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع الحمل، مرحلة الدورة الحالية (${CYCLE_PHASE_LABELS_AR[cyclePhase]})، الهدف الرئيسي لهذا الأسبوع تحديداً، وكيف بُني على أساس الأسبوع الماضي",
  "recoveryTips": ["نصيحة تعافٍ محددة وعملية 1", "نصيحة 2", "نصيحة 3"],
  "nutritionNote": "توصية غذائية مرتبطة بحجم التدريب هذا الأسبوع — كارب وبروتين وتوقيت",
  "progressionNote": "توجيه محدد وقابل للتنفيذ حرفياً للأسبوع القادم (مرحلة ${cyclePhase === 'deload' ? CYCLE_PHASE_LABELS_AR['foundation'] : 'الدورة التالية'}) — اسم الحركة والاتجاه الدقيق (مثال: 'في القرفصاء زد إلى 80% الأسبوع القادم' وليس كلاماً عاماً) — هذا النص سيُقرأ حرفياً عند توليد الأسبوع القادم"
}

**قواعد صارمة:**
- استخدم exerciseId من القائمة فقط — لا تخترع IDs
- كل تمرين في strength وmetcon يجب أن يحتوي على حقل "levels" بالمستويات الأربعة (beginner/intermediate/advanced/elite) مع weight وreps وcue
- weight في levels: الوزن المحدد لهذا المستوى فقط (مثال: "75كجم") — وليس نص طويل
- cue في levels: نصيحة تقنية قصيرة للمستوى
- الإحماء والتهدئة: بدون levels
- كل تمرين في accessory يجب أن يحتوي على levels بالمستويات الأربعة
- الأكسسوار والتهدئة في كل يوم كروسفيت عادي: يجب أن يطابقا دليل التوافق الخاص بنمط ذلك اليوم في التسلسل أعلاه بدقة صارمة — لا اجتهاد حر
- التهدئة (الإطالات): 2-3 إطالات ثابتة (static stretches) فقط في كل يوم — ممنوع أي عنصر لخفض النبض أو تهدئة القلب (مشي/جري/تجديف هادئ) — كل عنصر إطالة عضلية ثابتة فعلية بمدة زمنية في حقل time
- يوم البنشمارك (إن وُجد): strength = [] وaccessory = [] إجبارياً، والميتكون هو حركات البنشمارك الرسمية فقط
- أيام الراحة: isRest: true وكل المصفوفات فارغة []
- لا تكرر نمط الميتكون في يومين متتاليين (AMRAP/للوقت/EMOM يتناوبان)
- الإحماء: 3-4 تمارين — الأول عام (رفع نبض بـ row/run) ثم خاص — طبّق دليل التوافق أعلاه لنمط ذلك اليوم بدقة (تمرين تفعيل + ذكر منطقة المرونة المستهدفة في notes)، ولا تستخدم نفس تمرين التفعيل الخاص في يومين من نفس النمط ضمن الأسبوع
- كل يوم نشاط: strength لا يقل عن تمرينَين compound (إلا يوم البنشمارك)
- استخدم أوزان جدول "مرحلة دورة التدريج" أعلاه حرفياً حسب المستوى والجنس — لا تستخدم أوزان من ذاكرتك أو من أسابيع سابقة
- progressionNote يجب أن يكون توجيهاً رقمياً محدداً (اسم حركة + نسبة/وزن دقيق) قابلاً للتنفيذ الحرفي الأسبوع القادم
- يوم البارتنر (إن وُجد): العنوان (title وtitleEn) يجب أن يتضمن "بارتنر"/"Partner"، والقوة تبقى فردية بلا تغيير، وطبّق قاعدة تماسك يوم البارتنر أعلاه على كل قسم

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  // الحد الأقصى للتوكنز مرتبط بحجم المحتوى الفعلي لكل يوم — التحسينات الأخيرة (إرشادات مرونة الإحماء،
  // بدائل الأكسسوار، أسماء إطالات التهدئة) رفعت حجم كل يوم بشكل ملموس. القيمة القديمة (1000 توكن/يوم)
  // كانت تُنتج قطعاً فعلياً في منتصف JSON عند 7 أيام (يوم كامل ≈ 3700-4000 توكن) — رُصد ذلك مباشرة عبر
  // تفقّد استجابة API الخام في الإنتاج: أسبوع من 7 أيام توقف عند اليوم الرابع تقريباً وفقد اليوم السابع
  // بالكامل مع weekSummary/progressionNote/recoveryTips (تُقرأ لاحقاً عند توليد الأسبوع القادم)
  const maxTokens = Math.min(32000, Math.max(16000, days * 4000));

  try {
    // البث (stream) إجباري هنا — الحد الأقصى للتوكنز (حتى 32000) قد يستغرق أكثر من 10 دقائق نظرياً،
    // وواجهة Anthropic البرمجية ترفض طلبات create() العادية بهذا الحجم وتطلب البث صراحة
    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    const message = await stream.finalMessage();

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = parseAiJson(jsonText, 'wods');

    // ═══ وسم كل يوم نشط بنمطه الفعلي بشكل حتمي من التسلسل المحسوب مسبقاً (لا نثق بذكر النمط الحر داخل نص aiTheme) —
    // هذا يبني تاريخاً موثوقاً لحقل pattern على كل WOD محفوظ، تعتمد عليه أسابيع لاحقة (وحتى التوليد اليومي المنفرد)
    // لمعرفة آخر نمط استُخدم وتجنّب تكراره أو تكرار نفس الأكسسوار/الإحماء الخاص به ═══
    const HYROX_RE = /hyrox/i;
    const VALID_PARTNER_FORMATS: PartnerFormat[] = ['you_go_i_go', 'synchro', 'shared_reps', 'relay_carry'];
    let patternIdx = 0;
    if (Array.isArray(result.wods)) {
      result.wods = result.wods.map((day: any) => {
        const isBenchmarkDayHere = isBenchmarkWeek && day.date === benchmarkDate;
        const isHyroxDayHere = hyroxMode && !day.isRest && !day.isCalisthenics && HYROX_RE.test(`${day.title || ''} ${day.aiTheme || ''}`);
        const skip = day.isRest || day.isCalisthenics || isBenchmarkDayHere || isHyroxDayHere;
        if (skip) return { ...day, isPartnerWod: false, partnerFormat: undefined };
        const pattern = patternSequence[patternIdx] ?? patternSequence[patternSequence.length - 1];
        patternIdx++;
        // تصحيح صيغة البارتنر إن اختار النموذج مفتاحاً غير صالح أو نسيه رغم isPartnerWod:true —
        // نفس منهج وسم النمط: لا نثق بحقل حر من النموذج دون تحقق
        const isPartnerWod = !!day.isPartnerWod;
        const partnerFormat: PartnerFormat | undefined = isPartnerWod
          ? (VALID_PARTNER_FORMATS.includes(day.partnerFormat) ? day.partnerFormat : suggestPartnerFormat(pattern))
          : undefined;
        return { ...day, pattern, isPartnerWod, partnerFormat };
      });
    }

    // احفظ حالة الدورة لهذا الأسبوع — تُقرأ تلقائياً عند توليد الأسبوع القادم لضمان تقدّم حقيقي بدل تكرار نفس الوزن
    await upsertWodCycleMeta({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      weekStartDate: startDate,
      cyclePhase,
      cycleIndex: newCycleIndex,
      weeklyIntensityLabel: weekIntensity,
      weekSummary: result.weekSummary || '',
      progressionNote: result.progressionNote || '',
      wasAutoDeload: autoDeloadTriggered,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ...result,
      cyclePhase,
      cyclePhaseLabel: CYCLE_PHASE_LABELS_AR[cyclePhase],
      autoDeloadTriggered,
      weekIntensity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
