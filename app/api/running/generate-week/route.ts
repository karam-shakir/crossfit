import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getRunningProfile, getRunningSessions, getMemberById, upsertRunningSession, deleteRunningSessionsByMember, getLatestRunningWeekMeta, upsertRunningWeekMeta } from '@/lib/db';
import { todaySA } from '@/lib/timezone';
import { parseAiJson } from '@/lib/aiJson';
import { CyclePhase, computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO } from '@/lib/periodization';
import {
  getRaceTaperInfo, classifyRunningWeekIntensity, INJURY_PREVENTION_GUIDANCE, RUNNING_PHASE_VOLUME_RULE,
  computeNextWalkRunStage, getWalkRunStageGuidance, SENIOR_LEVEL_TO_INITIAL_STAGE, SENIOR_SAFETY_GUIDANCE,
} from '@/lib/runningProgramming';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// يمنح Vercel وقتاً كافياً لتوليد استجابات طويلة قبل قطع الاتصال
export const maxDuration = 300;

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

function getWeekStructure(days: number): string {
  switch (days) {
    case 3: return `هيكل 3 أيام — الأساس الذهبي للمبتدئ والمشغول:
      يوم 1: Easy Run (جري سهل) — بناء القاعدة الهوائية
      يوم 2: جلسة جودة (Intervals أو Tempo حسب الهدف)
      يوم 3: Long Run (الجري الطويل) — أطول مسافة بإيقاع مريح
      + راحة كاملة أو مشي خفيف بين الجلسات`;
    case 4: return `هيكل 4 أيام — توازن مثالي:
      يوم 1: Easy Run — استرداد نشط وبناء القاعدة
      يوم 2: Intervals (تكرارات سرعة) — VO2max
      يوم 3: Tempo Run (جري إيقاعي) — رفع العتبة اللاهوائية
      يوم 4: Long Run — التحمل الأساسي
      وزّع أيام الراحة بحيث لا تتتالى جلستا الجودة (Intervals/Tempo)`;
    case 5: return `هيكل 5 أيام — للعداء الجاد:
      يوم 1: Easy Run
      يوم 2: Intervals — سرعة قصوى
      يوم 3: Recovery Run (جري استرداد قصير جداً وبطيء)
      يوم 4: Tempo Run — العتبة
      يوم 5: Long Run — الأطول
      80% من الكيلومترات بإيقاع سهل — قاعدة 80/20 الصارمة`;
    case 6: return `هيكل 6 أيام — للمتقدم والنخبة:
      يوم 1: Easy Run
      يوم 2: Intervals — VO2max
      يوم 3: Recovery Run
      يوم 4: Tempo أو Hills (تلال) — قوة وعتبة
      يوم 5: Easy Run + Strides (انطلاقات قصيرة)
      يوم 6: Long Run (قد يتضمن Fast Finish)
      يوم راحة واحد إجباري — الاسترداد يصنع التقدم`;
    default: return 'هيكل 3 أيام: سهل + جودة + طويل';
  }
}

function getGoalProtocol(goal: string): string {
  switch (goal) {
    case 'general_endurance': return `بروتوكول التحمل العام:
      • 80% جري سهل (محادثة ممكنة) + 20% جودة
      • Long Run = 30-40% من حجم الأسبوع
      • الهدف: بناء قاعدة هوائية صلبة بدون إصابات`;
    case 'fat_burn': return `بروتوكول حرق الدهون:
      • جري سهل طويل بمنطقة Zone 2 (60-70% من أقصى نبض) — أفضل منطقة لأكسدة الدهون
      • جلسة HIIT واحدة أسبوعياً (تكرارات قصيرة) لرفع EPOC
      • أضف مشي سريع 10 دقائق بعد كل جلسة
      • النصائح الغذائية في الملاحظات: عجز سعرات معتدل + بروتين كافٍ`;
    case 'race_5k': return `بروتوكول سباق 5 كم:
      • Intervals قصيرة وسريعة: 400م-1000م بإيقاع السباق أو أسرع
      • Tempo: 20 دقيقة بإيقاع أبطأ من سباق 5كم بـ 15-20 ث/كم
      • الحجم معتدل — الجودة أهم من الكمية`;
    case 'race_10k': return `بروتوكول سباق 10 كم:
      • Intervals متوسطة: 800م-1600م بإيقاع سباق 5-10كم
      • Tempo أطول: 25-35 دقيقة بإيقاع العتبة
      • Long Run يصل 12-16 كم
      • التركيز: الجمع بين السرعة والتحمل`;
    case 'half_marathon': return `بروتوكول نصف الماراثون (21.1 كم):
      • Long Run تدريجي يصل 16-19 كم — العمود الفقري للبرنامج
      • Tempo بإيقاع نصف الماراثون المستهدف: 30-45 دقيقة
      • Intervals أطول: 1600م-3200م
      • تدرّب على التغذية أثناء الجري الطويل (ماء + جل كل 45 دقيقة)`;
    case 'marathon': return `بروتوكول الماراثون (42.2 كم):
      • Long Run هو الملك: يتدرج حتى 30-34 كم
      • Marathon Pace segments داخل الجري الطويل
      • حجم أسبوعي عالٍ بإيقاع سهل غالباً
      • تدريب المعدة على التغذية إجباري في كل جري طويل`;
    case 'speed': return `بروتوكول السرعة القصوى:
      • تكرارات قصيرة انفجارية: 100م-400م بجهد 90-95%
      • راحات طويلة كاملة بين التكرارات (1:3 إلى 1:5 عمل:راحة)
      • Hill Sprints: 8-10 ث انطلاقات على تلة — قوة وميكانيكا
      • Drills إجبارية في الإحماء: A-skip, B-skip, High Knees
      • حجم منخفض — الجودة القصوى فقط`;
    default: return 'بروتوكول تحمل عام: 80/20';
  }
}

function getPaceGuidance(best5k?: string): string {
  if (best5k && /^\d{1,2}:\d{2}$/.test(best5k)) {
    const [m, s] = best5k.split(':').map(Number);
    const totalSec = m * 60 + s;
    const pacePerKm = totalSec / 5;
    const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
    return `⏱️ مناطق الإيقاع محسوبة من أفضل زمن 5كم (${best5k}):
      • إيقاع سباق 5كم: ${fmt(pacePerKm)}/كم
      • Interval Pace (VO2max): ${fmt(pacePerKm * 0.97)}/كم أو أسرع قليلاً
      • Tempo/Threshold Pace: ${fmt(pacePerKm * 1.06)}/كم
      • Marathon Pace تقديري: ${fmt(pacePerKm * 1.15)}/كم
      • Easy Pace: ${fmt(pacePerKm * 1.30)} – ${fmt(pacePerKm * 1.45)}/كم
      • Recovery Pace: أبطأ من ${fmt(pacePerKm * 1.45)}/كم
      استخدم هذه الأرقام كأساس لمستوى هذا العداء تحديداً، وقدّم المستويات الأخرى حولها.`;
  }
  return `⏱️ لا يوجد زمن 5كم مسجل — استخدم مناطق الجهد بدلاً من الإيقاعات:
      • Easy: جهد 4-5/10 — محادثة كاملة ممكنة
      • Tempo: جهد 7/10 — جمل قصيرة فقط
      • Interval: جهد 8-9/10 — كلمات مقطعة
      • Recovery: جهد 3/10 — أبطأ ما يمكن دون مشي
      واذكر إيقاعات تقديرية لكل مستوى (مبتدئ 7:30-8:30/كم سهل، متوسط 6:30-7:30، متقدم 5:30-6:30، نخبة 4:30-5:30)`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { memberId, fromDate, override, cyclePhaseOverride = 'auto', walkRunStageOverride } = body;
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const startDate = fromDate || todaySA();
  const member = await getMemberById(memberId);
  const profile = await getRunningProfile(memberId);

  // دمج بروفايل العضو مع تعديلات المدرب (override يأخذ الأولوية)
  const effective = {
    goal: 'general_endurance',
    level: 'beginner',
    daysPerWeek: 3,
    gender: 'male',
    surface: 'mixed',
    currentWeeklyKm: undefined as number | undefined,
    best5kTime: '',
    best10kTime: '',
    targetRaceDate: '',
    limitations: '',
    weight: undefined as number | undefined,
    height: undefined as number | undefined,
    age: undefined as number | undefined,
    ...((profile || {}) as object),
    ...(override || {}),
  };

  const isSenior = effective.goal === 'senior_walk_run';
  // سلامة إجبارية: 3 أيام نشطة كحد أقصى لبرنامج كبار السن بغض النظر عن أي اختيار آخر
  if (isSenior && effective.daysPerWeek > 3) effective.daysPerWeek = 3;

  const restDays = effective.daysPerWeek <= 3 ? 4 : effective.daysPerWeek <= 4 ? 3 : effective.daysPerWeek === 5 ? 2 : 1;
  const totalDays = effective.daysPerWeek + restDays;
  const dates = buildDates(startDate, totalDays);

  const recentSessions = await getRunningSessions(memberId);
  const recentTraining = recentSessions.slice(0, 7).map(s => ({
    date: s.date,
    type: s.runType,
    km: s.totalDistanceKm,
    title: s.title,
  }));
  const lastWeekKm = recentSessions.slice(0, 7).reduce((n, s) => n + (s.totalDistanceKm || 0), 0);

  const gender = effective.gender || 'male';
  const levelAr = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'نخبة' }[effective.level as string] || 'مبتدئ';
  const surfaceAr = { treadmill: 'تريدميل (سير كهربائي)', outdoor: 'خارجي (شوارع/ممشى)', track: 'مضمار', mixed: 'مختلط' }[effective.surface as string] || 'مختلط';

  const previousMeta = await getLatestRunningWeekMeta(memberId, startDate);

  const maxTokens = Math.min(32000, Math.max(16000, effective.daysPerWeek * 3000));

  // ═══════════════════════════════════════════════════════════════
  // مسار كبار السن — برنامج مشي/جري تدريجي آمن (Couch-to-5K)، منفصل تماماً
  // عن منطق السباقات: لا إيقاعات، لا دورة تدريج قوة، بل مرحلة واحدة تتقدم
  // ببطء وأمان كل أسبوعين، تُتابَع وتُخزَّن لكل عضو تحديداً.
  // ═══════════════════════════════════════════════════════════════
  if (isSenior) {
    const initialStage = SENIOR_LEVEL_TO_INITIAL_STAGE[effective.level as string] ?? 0;
    const forceStage = typeof walkRunStageOverride === 'number' && walkRunStageOverride >= 0 ? walkRunStageOverride : undefined;
    const { stage, weeksAtStage, justAdvanced } = computeNextWalkRunStage(
      previousMeta?.runWalkStage ?? null,
      previousMeta?.weeksAtStage ?? null,
      initialStage,
      forceStage
    );
    const stageInfo = getWalkRunStageGuidance(stage);

    const seniorPrompt = `أنت مدرب صحة ولياقة متخصص في برامج المشي والجري الآمنة لكبار السن والمبتدئين تماماً، بمنهجية معتمدة طبياً (على غرار Couch-to-5K). هدفك الوحيد: تحسين الصحة العامة والحركة اليومية لهذا العضو بأمان تام — لا سرعة، لا سباقات، لا أرقام قياسية. الثقة والاستمرارية أهم من أي تقدّم سريع.

╔══════════════════════════════════════════════╗
║   نادي مجموعة المطانيخ — برنامج المشي والجري الصحي   ║
╚══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 بروفايل العضو
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم: ${member?.nameAr || 'العضو'}
الجنس: ${gender === 'female' ? 'أنثى' : 'ذكر'}
العمر: ${effective.age ? effective.age + ' سنة' : 'غير محدد — اسأل المدرب إن لزم'}
الوزن: ${effective.weight ? effective.weight + ' كجم' : 'غير محدد'}
مستوى الحركة الحالي: ${levelAr}
أيام النشاط: ${effective.daysPerWeek} أيام/أسبوع (بحد أقصى إجباري 3 — بينها راحة كاملة دائماً)
القيود والإصابات: ${effective.limitations || 'لا توجد قيود مذكورة — اسأل عنها إن أمكن'}
${override?.specialInstructions ? `\n📌 تعليمات خاصة من المدرب (أولوية قصوى):\n${override.specialInstructions}` : ''}

${SENIOR_SAFETY_GUIDANCE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 مرحلة البرنامج الحالية لهذا العضو تحديداً (إجباري — لا تتجاوزها)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
المرحلة ${stageInfo.stage}: ${stageInfo.nameAr}
البنية: ${stageInfo.structureAr}
المدة الكلية للجلسة: ${stageInfo.totalMinutes}
${stageInfo.notesAr ? `ملاحظة: ${stageInfo.notesAr}` : ''}
${justAdvanced ? `🎉 هذا العضو تخطى للتو من المرحلة السابقة إلى هذه المرحلة بعد أسبوعين ناجحين — امتدحه صراحة في coachNote واذكر هذا الإنجاز بالتحديد` : `هذا الأسبوع الثاني على نفس المرحلة تقريباً (أسبوع ${weeksAtStage} من أسبوعين) — لا ترفع المرحلة بنفسك، النظام سيرفعها تلقائياً عند اكتمال أسبوعين`}
لا تخترع بنية مختلفة — طبّق البنية أعلاه حرفياً على كل الجلسات النشطة هذا الأسبوع (فروقات طفيفة فقط بين الأيام إن لزم، مثل تبديل الترتيب أو المسار).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 الأيام المطلوبة لهذا الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dates.map(d => `• ${d.date} — ${d.dayName}`).join('\n')}

وزّع ${effective.daysPerWeek} أيام نشطة (WalkRun) و${totalDays - effective.daysPerWeek} أيام راحة كاملة — يوم راحة واحد على الأقل بين كل يومين نشطين، لا استثناء.

${recentTraining.length ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 جلسات الأسابيع الماضية\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${recentTraining.map(s => `• ${s.date} | ${s.type} | ${s.title}`).join('\n')}` : ''}

أرجع JSON بالتنسيق التالي فقط، بدون أي نص قبله أو بعده:

{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "الاثنين",
      "runType": "WalkRun",
      "title": "مشي وجري — المرحلة ${stageInfo.stage}",
      "focus": "بناء عادة الحركة والصحة القلبية بأمان",
      "intensity": "Easy",
      "isRest": false,
      "duration": 25,
      "totalDistanceKm": 2.5,
      "notes": "نصيحة عملية: اشرب ماء قبل الجلسة بنصف ساعة، احمل جوالك للطوارئ، ولا تتردد بالتوقف إن شعرت بأي انزعاج",
      "warmup": [
        "مشي بطيء 5 دقائق — تحضير المفاصل والقلب تدريجياً",
        "دوران الكاحلين والركبتين 10 مرات كل اتجاه"
      ],
      "segments": [
        {
          "name": "البنية الأساسية لهذه المرحلة",
          "type": "walk-run",
          "description": "طبّق بنية المرحلة أعلاه حرفياً هنا",
          "levels": {
            "beginner":     {"pace": "جهد يسمح بجملة كاملة أثناء الحديث", "target": "طبّق بنية المرحلة هنا نصاً", "rest": "كما في البنية", "cue": "تنفّس طبيعي — لا تحبس النفس"},
            "intermediate": {"pace": "جهد يسمح بجملة كاملة أثناء الحديث", "target": "طبّق بنية المرحلة هنا نصاً", "rest": "كما في البنية", "cue": "تنفّس طبيعي — لا تحبس النفس"},
            "advanced":     {"pace": "جهد يسمح بجملة كاملة أثناء الحديث", "target": "طبّق بنية المرحلة هنا نصاً", "rest": "كما في البنية", "cue": "تنفّس طبيعي — لا تحبس النفس"},
            "elite":        {"pace": "جهد يسمح بجملة كاملة أثناء الحديث", "target": "طبّق بنية المرحلة هنا نصاً", "rest": "كما في البنية", "cue": "تنفّس طبيعي — لا تحبس النفس"}
          }
        }
      ],
      "cooldown": [
        "مشي بطيء جداً 5 دقائق — تهدئة القلب تدريجياً",
        "إطالة خفيفة للسمانة والفخذ — 20 ث لكل جانب فقط، بلا شد قوي"
      ],
      "coachNote": "نصيحة تحفيزية دافئة ومحددة لهذا اليوم ولهذا العضو تحديداً"
    },
    {
      "date": "YYYY-MM-DD",
      "dayName": "الثلاثاء",
      "runType": "Rest",
      "title": "راحة كاملة",
      "focus": "استرداد",
      "intensity": "Rest",
      "isRest": true,
      "duration": 0,
      "totalDistanceKm": 0,
      "notes": "الراحة جزء أساسي من الصحة — يمكن المشي الخفيف جداً إن رغبت لكن بلا التزام",
      "warmup": [],
      "segments": [],
      "cooldown": [],
      "coachNote": "استرح جيداً — جسمك يبني القوة والتحمل في أيام الراحة أيضاً"
    }
  ],
  "weekSummary": "ملخص ودود وبسيط عن هذا الأسبوع: المرحلة الحالية وما الذي سيشعر به العضو",
  "progressionNote": "ملاحظة داخلية للمدرب عن التقدّم — لا تُعرض بلغة معقدة"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ المستويات الأربعة (beginner/intermediate/advanced/elite) يجب أن تكون متطابقة تماماً في كل segment — هذا العضو له مسار واحد فقط تحدده مرحلته أعلاه، لا فرق بين المستويات هنا إطلاقاً
✅ لا ذكر لأي إيقاع بالدقيقة/كم أو نبض مستهدف — جهد "يسمح بالحديث بجملة كاملة" فقط (Talk Test)
✅ runType: WalkRun | Rest فقط — لا Intervals ولا Tempo ولا Hills ولا Fartlek إطلاقاً
✅ intensity: Easy | Rest فقط
✅ لا تزد المدة أو الشدة عن بنية المرحلة أعلاه مهما بدت البيانات القديمة متقدمة
✅ أيام الراحة: isRest:true وsegments:[] وwarmup:[] وcooldown:[]
✅ الإحماء والتهدئة أطول نسبياً من برامج الجري العادية (مفاصل كبار السن تحتاج وقتاً أطول)
✅ notes ونصائح ودودة، بسيطة، بلا مصطلحات تقنية معقدة
✅ اذكر تذكيراً بالسلامة (توقف عند الألم، ترطيب، تجنب الحر) في يوم واحد على الأقل هذا الأسبوع

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده.`;

    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: seniorPrompt }],
      });

      let jsonText = '';
      for (const block of message.content) {
        if (block.type === 'text') { jsonText = block.text.trim(); break; }
      }

      const result = parseAiJson(jsonText, 'sessions');

      const toDate = dates[dates.length - 1].date;
      await deleteRunningSessionsByMember(memberId, startDate, toDate);
      for (const s of result.sessions || []) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        await upsertRunningSession({ ...s, id, memberId, createdAt: new Date().toISOString() });
      }

      const metaId = Date.now().toString(36) + Math.random().toString(36).slice(2);
      await upsertRunningWeekMeta({
        id: metaId,
        memberId,
        weekStartDate: startDate,
        weekSummary: result.weekSummary || '',
        progressionNote: result.progressionNote || '',
        runWalkStage: stage,
        weeksAtStage,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ...result,
        memberId,
        fromDate: startDate,
        mode: 'senior',
        stage,
        stageLabel: `${stageInfo.stage}. ${stageInfo.nameAr}`,
        justAdvanced,
        weeksAtStage,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // المسار العادي (أهداف السباقات/التحمل/حرق الدهون/السرعة)
  // ═══════════════════════════════════════════════════════════════

  const weekIntensity = classifyRunningWeekIntensity(recentSessions.slice(0, 7));
  const raceTaper = getRaceTaperInfo(effective.targetRaceDate, startDate, effective.goal);

  const validPhases: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];
  const forcePhase: CyclePhase | undefined = !raceTaper && validPhases.includes(cyclePhaseOverride)
    ? (cyclePhaseOverride as CyclePhase)
    : undefined;
  const cycleResult = raceTaper
    ? null
    : computeNextCyclePhase(previousMeta?.cycleIndex ?? null, forcePhase);
  const cyclePhase = cycleResult?.phase;
  const autoDeloadTriggered = cycleResult?.autoDeloadTriggered ?? false;

  const volumeGuidanceBlock = raceTaper
    ? `**══ 🏁 تخفيف ما قبل السباق (Taper) — إجباري ══**
${raceTaper.phaseLabel} — متبقٍ ${raceTaper.weeksUntilRace} ${raceTaper.weeksUntilRace === 1 ? 'أسبوع' : 'أسابيع'} على السباق
احسب حجم هذا الأسبوع كـ ${Math.round(raceTaper.volumeMultiplier * 100)}% تقريباً من حجم الأسبوع الماضي (${lastWeekKm ? lastWeekKm.toFixed(0) + ' كم' : 'غير معروف — قدّر بحذر'}) — تجاهل قاعدة نمو الـ10% تماماً هذا الأسبوع، هذا أسبوع تخفيف لا نمو.
${raceTaper.guidance}`
    : `**══ 📈 مرحلة دورة التدريج الحالية لهذا العداء ══**
${autoDeloadTriggered ? '⚠️ فُرض هذا كأسبوع تفريغ تلقائياً — مرّت 4 أسابيع متتالية منذ آخر تفريغ لهذا العداء تحديداً.\n' : ''}المرحلة: ${cyclePhase ? CYCLE_PHASE_LABELS_AR[cyclePhase] : ''}
${cyclePhase ? RUNNING_PHASE_VOLUME_RULE[cyclePhase] : ''}
${lastWeekKm ? `(حجم الأسبوع الماضي: ~${lastWeekKm.toFixed(0)} كم — طبّق القاعدة أعلاه عليه، لا القاعدة العامة 10% بمعزل عن المرحلة)` : ''}`;

  const recentContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 جلسات الأسبوع السابق (${lastWeekKm ? `~${lastWeekKm.toFixed(0)} كم` : 'لا يوجد'})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
شدة الأسبوع الماضي (من نوع الجلسات لا الكيلومترات فقط): ${weekIntensity.label} — ${weekIntensity.qualityCount} جلسة جودة
${weekIntensity.recommendation}
${recentTraining.length ? recentTraining.map(s => `• ${s.date} | ${s.type} | ${s.km ? s.km + ' كم' : ''} | ${s.title}`).join('\n') : 'لا توجد جلسات سابقة — هذا أول أسبوع. ابدأ محافظاً بحجم منخفض'}
${previousMeta?.progressionNote ? `\n🗒️ توصيتك أنت (المدرب الذكي) من الأسبوع الماضي — طبّقها فعلياً الآن:\n${previousMeta.progressionNote}` : ''}
`;

  const prompt = `أنت مدرب جري معتمد (UESCA/RRCA) وخبير فسيولوجيا تدريب التحمل بمستوى نخبوي. مهمتك تصميم برنامج جري أسبوعي متكامل ومخصص بالكامل لهذا العداء.

╔══════════════════════════════════════════════╗
║      نادي مجموعة المطانيخ — قسم العدّائين     ║
╚══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 بروفايل العداء الكامل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم: ${member?.nameAr || 'العداء'}
الجنس: ${gender === 'female' ? 'أنثى' : 'ذكر'}
العمر: ${effective.age ? effective.age + ' سنة' : 'غير محدد'}
الوزن: ${effective.weight ? effective.weight + ' كجم' : 'غير محدد'}
الطول: ${effective.height ? effective.height + ' سم' : 'غير محدد'}
المستوى: ${levelAr}
الهدف: ${effective.goal}
أيام الجري: ${effective.daysPerWeek} أيام/أسبوع
الحجم الحالي: ${effective.currentWeeklyKm ? effective.currentWeeklyKm + ' كم/أسبوع' : 'غير محدد'}
أفضل زمن 5كم: ${effective.best5kTime || 'غير مسجل'}
أفضل زمن 10كم: ${effective.best10kTime || 'غير مسجل'}
السطح المفضل: ${surfaceAr}
${effective.targetRaceDate ? `🏁 سباق مستهدف بتاريخ: ${effective.targetRaceDate} — صمّم الأسبوع ضمن خطة تحضير له` : ''}
القيود والإصابات: ${effective.limitations || 'لا توجد قيود'}
${override?.specialInstructions ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 تعليمات خاصة من المدرب (أولوية قصوى)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${override.specialInstructions}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 بروتوكول الهدف
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getGoalProtocol(effective.goal)}

${volumeGuidanceBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ مناطق الإيقاع (Pace Zones)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPaceGuidance(effective.best5kTime)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 هيكل الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getWeekStructure(effective.daysPerWeek)}
${recentContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 الأيام المطلوبة لهذا الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dates.map(d => `• ${d.date} — ${d.dayName}`).join('\n')}

وزّع ${effective.daysPerWeek} أيام جري و${restDays} أيام راحة بذكاء:
• لا تضع جلستي جودة (Intervals/Tempo/Hills) متتاليتين أبداً
• Long Run يسبقه أو يليه يوم راحة أو Easy
• آخر يوم قبل Long Run لا يكون Intervals

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 مبادئ البرمجة الصارمة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. قاعدة 80/20: 80% من الحجم الأسبوعي إيقاع سهل — لا استثناء
2. Long Run = 30-40% من حجم الأسبوع الكلي كحد أقصى
3. كل جلسة: إحماء (مشي + جري خفيف + Drills) ← الجزء الرئيسي ← تهدئة (جري خفيف + إطالات)
4. Strides (انطلاقات 20 ث): أضفها نهاية جلسات Easy مرة أو مرتين أسبوعياً للمستويات متوسط فما فوق
5. خصائص المستوى:
   - مبتدئ: قد يحتاج فترات مشي/جري متناوبة، أحجام صغيرة (15-25 كم/أسبوع)
   - متوسط: جري متواصل مريح، 25-45 كم/أسبوع
   - متقدم: جلسات جودة منظمة، 45-70 كم/أسبوع
   - نخبة: أحجام عالية وجودة مزدوجة، 70+ كم/أسبوع
6. السطح: البرنامج موجه لـ${surfaceAr} — كيّف التمارين (التريدميل: ميل 1% يعوض مقاومة الهواء)
7. وقاية الإصابات: ${INJURY_PREVENTION_GUIDANCE}
${effective.limitations ? `8. ⚠️ قيود صارمة: ${effective.limitations} — كيّف البرنامج بالكامل حولها` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 التنسيق المطلوب (JSON فقط)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أرجع JSON بالتنسيق التالي فقط، بدون أي نص قبله أو بعده:

{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "الاثنين",
      "runType": "Intervals",
      "title": "تكرارات 400م — سرعة VO2max",
      "focus": "رفع السقف الهوائي والسرعة القصوى",
      "intensity": "Hard",
      "isRest": false,
      "duration": 50,
      "totalDistanceKm": 7.5,
      "notes": "جلسة الجودة الأولى هذا الأسبوع — النوم الجيد الليلة السابقة مهم. اشرب ماء قبلها بساعتين.",
      "warmup": [
        "5 دقائق مشي سريع ثم 10 دقائق جري خفيف جداً — رفع حرارة الجسم تدريجياً",
        "High Knees ركبة عالية 2 × 20 متر — تفعيل الوركين",
        "Butt Kicks كعب للمؤخرة 2 × 20 متر — تفعيل أوتار الركبة",
        "A-Skip 2 × 20 متر — ميكانيكا الجري",
        "4 انطلاقات Strides تصاعدية 60م — تحضير الجهاز العصبي للسرعة"
      ],
      "segments": [
        {
          "name": "تكرارات 400 متر",
          "type": "interval",
          "description": "المجهود الرئيسي — تكرارات بإيقاع أسرع من سباق 5كم",
          "levels": {
            "beginner":     {"pace": "جهد 8/10", "target": "5 × 400م", "rest": "راحة مشي 90 ث", "cue": "لا تنطلق بأقصى سرعة في أول تكرار — آخر تكرار يجب أن يكون بنفس زمن الأول"},
            "intermediate": {"pace": "5:45/كم",  "target": "6 × 400م", "rest": "جري خفيف 200م", "cue": "حافظ على كتفين مرتخيين وذراعين 90 درجة — الإيقاع ثابت في كل تكرار"},
            "advanced":     {"pace": "4:50/كم",  "target": "8 × 400م", "rest": "جري خفيف 200م (60 ث)", "cue": "ركّز على دوران الخطوة السريع 180 خطوة/دقيقة — لا تمدّ الخطوة أمام الجسم"},
            "elite":        {"pace": "4:00/كم",  "target": "10 × 400م", "rest": "جري 200م (45 ث)", "cue": "آخر تكرارين بإيقاع سباق 3كم — تحكم كامل في التنفس 2:2"}
          }
        }
      ],
      "cooldown": [
        "10 دقائق جري خفيف جداً — التخلص من اللاكتات تدريجياً",
        "إطالة سمانة على الحائط — 45 ث لكل ساق",
        "إطالة أوتار الركبة واقفاً — 30 ث لكل ساق",
        "إطالة الرباعية — امسك القدم خلفك — 30 ث لكل ساق",
        "تنفس عميق 5 مرات — استرخاء كامل"
      ],
      "coachNote": "أول جلسة سرعة في البرنامج! الانضباط في الراحات بين التكرارات هو سر الجلسة — لا تختصرها ولا تطيلها."
    },
    {
      "date": "YYYY-MM-DD",
      "dayName": "الثلاثاء",
      "runType": "Rest",
      "title": "راحة واستشفاء",
      "focus": "استرداد",
      "intensity": "Rest",
      "isRest": true,
      "duration": 0,
      "totalDistanceKm": 0,
      "notes": "بعد جلسة السرعة، جسمك يبني التكيّفات اليوم. مشي خفيف 15-20 دقيقة يسرّع الاسترداد. رطّب جيداً.",
      "warmup": [],
      "segments": [],
      "cooldown": [],
      "coachNote": "الراحة تدريب — العداؤون الذين لا يستريحون هم من يُصابون. استمتع بيومك."
    }
  ],
  "weekSummary": "ملخص الأسبوع: الحجم الكلي بالكيلومترات وتوزيع الشدة وفلسفة هذا الأسبوع، ومرحلة الدورة/التخفيف الحالية إن وُجدت",
  "progressionNote": "خطة الأسبوع القادم: كيف يتقدم العداء (زيادة الحجم أو الشدة أو المسافة) — رقمياً ومحدداً، هذا النص سيُقرأ حرفياً الأسبوع القادم"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ كل segment: 4 مستويات كاملة (beginner/intermediate/advanced/elite) مع pace+target+rest+cue
✅ الـ cue تعليمة تقنية جري محددة (إيقاع الخطوة، وضعية الجسم، التنفس) — ليس كلاماً عاماً
✅ الإحماء يشمل Drills حقيقية بأسمائها (High Knees, A-Skip, Strides...)
✅ totalDistanceKm واقعي لكل جلسة، ومجموع الأسبوع يطبّق قاعدة الحجم أعلاه (تخفيف أو دورة) لا قاعدة 10% المعزولة
✅ runType: Easy | Tempo | Intervals | Long | Recovery | Hills | Fartlek | Rest
✅ intensity: Easy | Moderate | Hard | Rest
${raceTaper?.isRaceWeek || cyclePhase === 'deload' ? '✅ هذا أسبوع تخفيف/تفريغ: لا Intervals ولا Tempo ولا Hills إطلاقاً — Easy/Recovery فقط' : ''}
✅ أيام الراحة: isRest:true وsegments:[] وwarmup:[] وcooldown:[]
✅ عدد segments في الجلسة: 1-3 (مثال: Tempo قد يكون segment واحد، جلسة مركبة قد تحوي تكرارات + تلال)
✅ الـ notes نصائح عملية (ترطيب، نوم، تغذية قبل/بعد الجري) — أضف نصيحة وقاية الإصابات في يوم Easy واحد على الأقل
✅ coachNote تحفيزية ومحددة لهذا اليوم وهذا العداء
✅ راعِ حرارة الطقس في السعودية — انصح بالجري فجراً أو مساءً في الملاحظات
✅ progressionNote يجب أن يكون رقمياً ومحدداً (زيادة كم أو تغيير نوع جلسة محدد) — هذا النص سيُقرأ حرفياً الأسبوع القادم

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده. لا تشرح. لا تعلق.`;

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

    const result = parseAiJson(jsonText, 'sessions');

    const toDate = dates[dates.length - 1].date;
    await deleteRunningSessionsByMember(memberId, startDate, toDate);

    for (const s of result.sessions || []) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      await upsertRunningSession({ ...s, id, memberId, createdAt: new Date().toISOString() });
    }

    // احفظ استمرارية الأسبوع — أثناء التخفيف نُبقي مرحلة الدورة كما هي (لا تُستهلك بأسبوع تخفيف)
    const metaId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    await upsertRunningWeekMeta({
      id: metaId,
      memberId,
      weekStartDate: startDate,
      weekSummary: result.weekSummary || '',
      progressionNote: result.progressionNote || '',
      cyclePhase: raceTaper ? previousMeta?.cyclePhase : cyclePhase,
      cycleIndex: raceTaper ? previousMeta?.cycleIndex : cycleResult?.cycleIndex,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ...result,
      memberId,
      fromDate: startDate,
      mode: raceTaper ? 'taper' : 'cycle',
      taperInfo: raceTaper,
      cyclePhase: cyclePhase || null,
      cyclePhaseLabel: cyclePhase ? CYCLE_PHASE_LABELS_AR[cyclePhase] : null,
      autoDeloadTriggered,
      weekIntensity: weekIntensity.label,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
