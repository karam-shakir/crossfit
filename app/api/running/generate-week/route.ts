import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getRunningProfile, getRunningSessions, getMemberById, upsertRunningSession, deleteRunningSessionsByMember } from '@/lib/db';
import { todaySA } from '@/lib/timezone';
import { parseAiJson } from '@/lib/aiJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      • زيادة الحجم الأسبوعي بحد أقصى 10% كل أسبوع
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
      • الحجم معتدل — الجودة أهم من الكمية
      • أسبوع السباق: خفف الحجم 40% وحافظ على الحدة`;
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
      • تدريب المعدة على التغذية إجباري في كل جري طويل
      • أسابيع استشفاء (خفض 30%) كل 3-4 أسابيع`;
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
  const { memberId, fromDate, override } = body;
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ مناطق الإيقاع (Pace Zones)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPaceGuidance(effective.best5kTime)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 هيكل الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getWeekStructure(effective.daysPerWeek)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 جلسات الأسبوع السابق (${lastWeekKm ? `~${lastWeekKm.toFixed(0)} كم` : 'لا يوجد'})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recentTraining.length ? recentTraining.map(s => `• ${s.date} | ${s.type} | ${s.km ? s.km + ' كم' : ''} | ${s.title}`).join('\n') : 'لا توجد جلسات سابقة — هذا أول أسبوع. ابدأ محافظاً بحجم منخفض'}
${lastWeekKm ? `\n⚠️ قاعدة 10%: حجم هذا الأسبوع لا يتجاوز ${(lastWeekKm * 1.1).toFixed(0)} كم` : ''}

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
2. قاعدة 10%: لا تزد الحجم الأسبوعي أكثر من 10% عن الأسبوع السابق
3. Long Run = 30-40% من حجم الأسبوع الكلي كحد أقصى
4. كل جلسة: إحماء (مشي + جري خفيف + Drills) ← الجزء الرئيسي ← تهدئة (جري خفيف + إطالات)
5. Strides (انطلاقات 20 ث): أضفها نهاية جلسات Easy مرة أو مرتين أسبوعياً للمستويات متوسط فما فوق
6. خصائص المستوى:
   - مبتدئ: قد يحتاج فترات مشي/جري متناوبة، أحجام صغيرة (15-25 كم/أسبوع)
   - متوسط: جري متواصل مريح، 25-45 كم/أسبوع
   - متقدم: جلسات جودة منظمة، 45-70 كم/أسبوع
   - نخبة: أحجام عالية وجودة مزدوجة، 70+ كم/أسبوع
7. السطح: البرنامج موجه لـ${surfaceAr} — كيّف التمارين (التريدميل: ميل 1% يعوض مقاومة الهواء)
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
  "weekSummary": "ملخص الأسبوع: الحجم الكلي بالكيلومترات وتوزيع الشدة وفلسفة هذا الأسبوع",
  "progressionNote": "خطة الأسبوع القادم: كيف يتقدم العداء (زيادة الحجم أو الشدة أو المسافة)"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ كل segment: 4 مستويات كاملة (beginner/intermediate/advanced/elite) مع pace+target+rest+cue
✅ الـ cue تعليمة تقنية جري محددة (إيقاع الخطوة، وضعية الجسم، التنفس) — ليس كلاماً عاماً
✅ الإحماء يشمل Drills حقيقية بأسمائها (High Knees, A-Skip, Strides...)
✅ totalDistanceKm واقعي لكل جلسة ومجموع الأسبوع يحترم قاعدة 10%
✅ runType: Easy | Tempo | Intervals | Long | Recovery | Hills | Fartlek | Rest
✅ intensity: Easy | Moderate | Hard | Rest
✅ أيام الراحة: isRest:true وsegments:[] وwarmup:[] وcooldown:[]
✅ عدد segments في الجلسة: 1-3 (مثال: Tempo قد يكون segment واحد، جلسة مركبة قد تحوي تكرارات + تلال)
✅ الـ notes نصائح عملية (ترطيب، نوم، تغذية قبل/بعد الجري)
✅ coachNote تحفيزية ومحددة لهذا اليوم وهذا العداء
✅ راعِ حرارة الطقس في السعودية — انصح بالجري فجراً أو مساءً في الملاحظات

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده. لا تشرح. لا تعلق.`;

  const maxTokens = Math.min(32000, Math.max(16000, effective.daysPerWeek * 3000));

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

    return NextResponse.json({ ...result, memberId, fromDate: startDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
