import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getWods } from '@/lib/db';
import {
  EXERCISES, MovementPattern, PATTERN_LABELS_AR,
  buildPatternSequence, accessoryGuidanceFor, cooldownGuidanceFor,
  getBenchmarkGuidance, getClassTimeBudget, getEquipmentGuidance, getRxFocusGuidance,
} from '@/lib/crossfitProgramming';
import { parseAiJson } from '@/lib/aiJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
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
    if (allEx.some((id: string) => ['back-squat','front-squat','overhead-squat','deadlift'].includes(id))) muscles.push('الساق/السلسلة الخلفية');
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
  const undertrained = ['الساق/السلسلة الخلفية','الأولمبي/الجسم الكامل','الظهر/السحب','الكتف/الدفع','الجسم الكامل','القلب/التحمل']
    .filter(m => !allRecentMuscles.includes(m));

  const exerciseList = EXERCISES.map(e => `${e.id} | ${e.nameEn} | ${e.category}`).join('\n');

  // ═══ تسلسل حتمي لأنماط القوة عبر أيام الكروسفيت النشطة (لضمان تنوع + توافق أكسسوار/تهدئة حقيقي) ═══
  const estimatedRestDays = restDaysCount >= 0 ? restDaysCount : Math.max(1, Math.round(days * 0.2));
  const estimatedNonCrossfitDays = (weekMode === 'mixed' ? calisthenicsDays : 0) + (hyroxMode ? 1 : 0);
  const activeCrossfitDays = Math.max(1, days - estimatedRestDays - estimatedNonCrossfitDays);
  const patternSequence = buildPatternSequence(activeCrossfitDays, undertrained);
  const patternLegend = (Object.keys(PATTERN_LABELS_AR) as MovementPattern[])
    .map(p => `- ${PATTERN_LABELS_AR[p]}: ${accessoryGuidanceFor(p)} | ${cooldownGuidanceFor(p)}`)
    .join('\n');

  const isBenchmarkWeek = !!(benchmarkName && benchmarkDate);
  const benchmarkGuidance = isBenchmarkWeek ? getBenchmarkGuidance(benchmarkName) : '';

  const recentContext = `
**═══ تحليل الأسبوع الماضي (آخر 7 أيام قبل بداية هذه الخطة) ═══**
عدد الجلسات: ${recentWodsRaw.length} جلسات
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
- تمارين القوة (strength): يجب أن تكون بالبار حصراً (back-squat, deadlift, front-squat, overhead-squat, power-clean, clean-and-jerk, snatch, shoulder-press, push-press, thruster)
- الميتكون: يجمع تمارين الحديد مع cardio وgymnastics — مسموح بـ pull-up وtoes-to-bar ودبل أندر وair-squat في الميتكون فقط
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
يوم DELOAD/REST (~${Math.max(1, Math.round(days * 0.25))} مرة): راحة كاملة أو تعافٍ نشط خفيف

**══ 🔗 تسلسل أنماط القوة الحتمي عبر أيام الكروسفيت النشطة (إجباري — يضمن توافق الأكسسوار والتهدئة) ══**

طبّق هذا الترتيب على أيام الكروسفيت العادية بالتتابع (اليوم الأول من أيام الكروسفيت = النمط الأول، الثاني = الثاني، وهكذا) — تجاهل أيام الراحة/Hyrox/Calisthenics تماماً عند العد ولا تكسر الترتيب بسببها:
${patternSequence.map((p, i) => `${i + 1}. ${PATTERN_LABELS_AR[p]}`).join('\n')}
${isBenchmarkWeek ? `(باستثناء يوم البنشمارك بتاريخ ${benchmarkDate} — لا يأخذ رقماً من هذا التسلسل)` : ''}

**دليل التوافق لكل نمط (طبّقه حرفياً على اليوم الذي يحمل هذا النمط):**
${patternLegend}

مبدأ التنوع الإضافي:
- تنوع الميتكون: AMRAP → للوقت → EMOM → للوقت → AMRAP (لا تكرر نفس الصيغة يومين متتاليين)

${programmingRules}

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})${isBenchmarkWeek && d.date === benchmarkDate ? '  ← 🏆 يوم البنشمارك المفروض' : ''}`).join('\n')}

**══ معايير الأوزان الدقيقة لكل مستوى ══**
Back Squat: مبتدئ 50كجم | متوسط 75كجم | متقدم 95كجم | نخبة 115كجم
Deadlift: مبتدئ 60كجم | متوسط 90كجم | متقدم 120كجم | نخبة 150كجم
Clean & Jerk: مبتدئ 35كجم | متوسط 55كجم | متقدم 80كجم | نخبة 100كجم
Snatch: مبتدئ 25كجم | متوسط 45كجم | متقدم 65كجم | نخبة 85كجم
Thruster: مبتدئ 30كجم | متوسط 43كجم | متقدم 55كجم | نخبة 65كجم
Wall Ball: مبتدئ 6كجم | متوسط 9كجم | متقدم 9كجم | نخبة 9كجم Rx
KB Swing: مبتدئ 16كجم | متوسط 24كجم | متقدم 28كجم | نخبة 32كجم

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
        { "exerciseId": "run",    "reps": "", "weight": "", "distance": "400م", "notes": "مشي هادئ 2 دقيقة — خفّف معدل القلب تدريجياً" },
        { "exerciseId": "sit-up", "reps": "", "weight": "", "time": "60 ث",     "notes": "طبّق دليل التوافق أعلاه حسب نمط اليوم — اذكر السبب هنا" }
      ]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع الحمل، مراحل التدرج، الهدف الرئيسي لهذا الأسبوع تحديداً، وكيف بُني على أساس الأسبوع الماضي",
  "recoveryTips": ["نصيحة تعافٍ محددة وعملية 1", "نصيحة 2", "نصيحة 3"],
  "nutritionNote": "توصية غذائية مرتبطة بحجم التدريب هذا الأسبوع — كارب وبروتين وتوقيت"
}

**قواعد صارمة:**
- استخدم exerciseId من القائمة فقط — لا تخترع IDs
- كل تمرين في strength وmetcon يجب أن يحتوي على حقل "levels" بالمستويات الأربعة (beginner/intermediate/advanced/elite) مع weight وreps وcue
- weight في levels: الوزن المحدد لهذا المستوى فقط (مثال: "75كجم") — وليس نص طويل
- cue في levels: نصيحة تقنية قصيرة للمستوى
- الإحماء والتهدئة: بدون levels
- كل تمرين في accessory يجب أن يحتوي على levels بالمستويات الأربعة
- الأكسسوار والتهدئة في كل يوم كروسفيت عادي: يجب أن يطابقا دليل التوافق الخاص بنمط ذلك اليوم في التسلسل أعلاه بدقة صارمة — لا اجتهاد حر
- يوم البنشمارك (إن وُجد): strength = [] وaccessory = [] إجبارياً، والميتكون هو حركات البنشمارك الرسمية فقط
- أيام الراحة: isRest: true وكل المصفوفات فارغة []
- لا تكرر نمط الميتكون في يومين متتاليين (AMRAP/للوقت/EMOM يتناوبان)
- الإحماء: 3-4 تمارين — الأول عام (رفع نبض) ثم خاص (تفعيل نمط اليوم بدون حمل)
- كل يوم نشاط: strength لا يقل عن تمرينَين compound (إلا يوم البنشمارك)

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  const maxTokens = Math.min(32000, Math.max(16000, days * 1000));

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = parseAiJson(jsonText, 'wods');
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
