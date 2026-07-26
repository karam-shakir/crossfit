import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getAllKettlebellSessions } from '@/lib/db';
import { parseAiJson } from '@/lib/aiJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function analyzeWeekIntensity(sessions: any[]) {
  const last7 = sessions.slice(0, 7);
  const count = last7.length;

  // تتبع تفصيلي لكل جلسة: الحدث + حجم التدريب + القوة
  const sessionLog: { date: string; event: string; sets: number; strengthEx: string[] }[] = [];
  last7.forEach(s => {
    const event = s.eventType || (s.mainWork?.[0]?.eventType) || 'غير محدد';
    const sets = (s.mainWork || []).reduce((acc: number, w: any) => acc + (parseInt(w.sets) || 0), 0);
    const strengthEx = (s.strengthBlock?.exercises || []).map((ex: any) => ex.name).filter(Boolean);
    sessionLog.push({ date: s.date, event, sets, strengthEx });
  });

  // الأحداث المستخدمة مؤخراً
  const eventsUsed = Array.from(new Set(sessionLog.map(s => s.event).filter(e => e !== 'غير محدد')));
  // الأحداث الغائبة (فرصة لاستهدافها)
  const allEvents = ['biathlon', 'long-cycle', 'snatch', 'strength', 'conditioning'];
  const missingEvents = allEvents.filter(e => !eventsUsed.includes(e));
  // قوة القوة: هل كانت الجلسات السابقة تحتوي قوة وظيفية؟
  const sessionsWithStrength = sessionLog.filter(s => s.strengthEx.length > 0).length;
  const recentStrength = Array.from(new Set(sessionLog.flatMap(s => s.strengthEx)));

  // حجم التدريب الكلي هذا الأسبوع
  const totalSets = sessionLog.reduce((acc, s) => acc + s.sets, 0);

  let label: string;
  let recommendation: string;
  if (count >= 5 || totalSets >= 20) {
    label = 'ثقيل';
    recommendation = `أسبوع ثقيل جداً (${count} جلسات، ${totalSets} مجموعة إجمالية) — اجعل هذه جلسة Deload أو تقنية خفيفة. لا جلسات Long Cycle أو Biathlon الثقيلة اليوم.`;
  } else if (count >= 3 || totalSets >= 10) {
    label = 'متوسط';
    recommendation = `أسبوع متوسط (${count} جلسات) — يمكن جلسة متوسطة. ${sessionsWithStrength < 2 ? 'لاحظ أن القوة الوظيفية كانت قليلة هذا الأسبوع، أضف strengthBlock ثقيل اليوم.' : 'القوة كانت كافية، ركز على الحدث الرئيسي.'}`;
  } else {
    label = 'خفيف';
    recommendation = `أسبوع خفيف (${count} جلسات فقط) — الجسم جاهز. اجعلها جلسة ثقيلة بحجم عالٍ وstrengthBlock قوي.`;
  }

  return { label, recommendation, eventsUsed, missingEvents, recentStrength, sessionLog, totalSets };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, eventType } = body;

  const allSessions = await getAllKettlebellSessions();
  const recentSessions = allSessions
    .filter(s => date ? s.date < date : true)
    .slice(0, 7);

  const weekAnalysis = analyzeWeekIntensity(recentSessions);

  const recentSummary = recentSessions.slice(0, 5).map(s => ({
    date: s.date,
    eventType: s.eventType,
    mainWork: (s.mainWork || []).map((w: any) => `${w.name || w.eventType}: ${w.sets || ''}×${w.reps || w.duration || ''}`).join(' | '),
  }));

  const prompt = `أنت مدرب Kettlebell Sport محترف معتمد (IUKL/WAKSC). فلسفتك: Kettlebell Sport = قوة + تقنية + تنفس + استدامة. مهمتك: تصميم جلسة واحدة تخدم جميع المستويات، مع تركيز حقيقي على بناء القوة العضلية والحركات الوظيفية.

═══════════════════════════════
النادي: مجموعة المطانيخ Kettlebell
الجمهور: مبتدئون → نخبة
الفلسفة: الوزن يحترم التقنية — التقنية تصنع القوة
═══════════════════════════════

**═══ تحليل الأسبوع الماضي ═══**
عدد الجلسات في آخر 7 أيام: ${recentSessions.length}
شدة الأسبوع: ${weekAnalysis.label}
توصية اليوم: ${weekAnalysis.recommendation}

الأحداث المُدرَّبة مؤخراً (قلّل منها):
${weekAnalysis.eventsUsed.length ? weekAnalysis.eventsUsed.map((e: string) => `- ${e}`).join('\n') : '- لا توجد بيانات'}

الأحداث الغائبة (استهدفها اليوم بأولوية):
${weekAnalysis.missingEvents.length ? weekAnalysis.missingEvents.map((e: string) => `- ${e}`).join('\n') : '- جميع الأحداث تدربت مؤخراً'}

تمارين القوة الأخيرة (تجنب التكرار):
${weekAnalysis.recentStrength.length ? weekAnalysis.recentStrength.map((e: string) => `- ${e}`).join('\n') : '- لم تُدرَّب قوة وظيفية مؤخراً — أضفها اليوم'}

سجل الجلسات:
${weekAnalysis.sessionLog.map((s: any) => `${s.date}: حدث [${s.event}] | ${s.sets} مجموعة | قوة: [${s.strengthEx.join(', ') || 'لا'}]`).join('\n') || 'لا توجد جلسات'}

الجلسات الأخيرة (تجنب التكرار):
${JSON.stringify(recentSummary, null, 2)}

**الجلسة المطلوبة:**
الحدث: ${eventType || 'حسب التحليل'}
المستويات: ولّد جميع المستويات الأربعة (beginner/intermediate/advanced/elite) في كل تمرين
${date ? `التاريخ: ${date}` : ''}

**══ أحداث Kettlebell Sport ══**

| الحدث | الوصف |
|-------|-------|
| Biathlon | Snatch + Jerk — الحدث الملكي |
| Long Cycle | Clean & Jerk = الأصعب والأكثر شمولاً |
| Snatch | الخطف — حدث اليد الواحدة |
| Strength | تمارين قوة وظيفية بالكيتل بيل |
| Conditioning | GPP — التكييف العام |

**══ أوزان التنافس حسب المستوى ══**

| المستوى | Biathlon/Snatch | Long Cycle | RPM المستهدف |
|---------|----------------|------------|--------------|
| مبتدئ | 12-16كجم | 12-16كجم | 6-8 RPM |
| متوسط | 16-20كجم | 16-20كجم | 8-10 RPM |
| متقدم | 20-24كجم | 20-24كجم | 10-12 RPM |
| نخبة | 24-32كجم | 24-32كجم | 12-14 RPM |

**══ مبادئ البرمجة ══**

1. **القوة الوظيفية أولاً:**
   - ابدأ بكتلة قوة وظيفية (Strength Block)
   - Deadlift + Press + Row + Squat بأوزان حقيقية
   - هذه الكتلة تميز برنامجنا عن برامج التحمل فقط

2. **العمل الرئيسي (الحدث):**
   - Sets × Reps أو Duration × RPM لكل مستوى
   - راحة محددة بين المجموعات
   - تنفس: الشهيق في الصعود، الزفير في النزول (للـ Jerk عكس ذلك)

3. **Grip Work:**
   - العمل على قبضة اليد في نهاية كل جلسة
   - بار توقف (Dead hang) + Open Hand Farmer Carry

4. **الانتقالات:**
   - مبتدئ: استراحة بين كل مجموعة
   - نخبة: لا توقف في الـ 10 دقائق

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان احترافي (مثال: Long Cycle القوة — جلسة حجم عالٍ)",
  "eventType": "biathlon | long-cycle | snatch | strength | conditioning",
  "totalDuration": 55,
  "weekIntensity": "${weekAnalysis.label}",
  "warmup": {
    "duration": 10,
    "description": "لماذا هذا الإحماء لهذا الحدث تحديداً",
    "movements": [
      {
        "name": "Arm Circle & Wrist Prep",
        "duration": "2 دقيقة",
        "notes": "تحضير مفصل الرسغ — أهم شيء في Kettlebell Sport",
        "levels": {
          "beginner": "دوائر بطيئة 30 ث للأمام + 30 ث للخلف",
          "intermediate": "دوائر + ضغط على الرسغ بالوزن خفيف",
          "advanced": "نفس + Single KB Bottom-up Hold 20 ث",
          "elite": "نفس + Wrist Flexion مع مقاومة الشريك"
        }
      }
    ]
  },
  "strengthBlock": {
    "duration": 18,
    "description": "كتلة القوة الوظيفية — أساس أداء Kettlebell Sport",
    "exercises": [
      {
        "name": "KB Deadlift",
        "scheme": "4×6",
        "levels": {
          "beginner":     { "weight": "2×16كجم", "rest": "90 ث", "cue": "Hinge من الورك — ظهر مستقيم طوال الوقت" },
          "intermediate": { "weight": "2×24كجم", "rest": "90 ث", "cue": "ضغط الوسط بقوة قبل الرفع" },
          "advanced":     { "weight": "2×32كجم", "rest": "120 ث", "cue": "Brace + Push floor away — لا تشد الظهر" },
          "elite":        { "weight": "2×40كجم+", "rest": "120 ث", "cue": "قوة انفجارية مع تحكم تام في النزول" }
        },
        "coachNote": "الرفعة الميتة بالكيتل بيل = أساس Long Cycle وBiathlon — من يهملها يعاني في الدقيقتين الأخيرتين"
      }
    ]
  },
  "mainWork": [
    {
      "eventType": "long-cycle",
      "name": "Long Cycle — Clean & Jerk",
      "structure": "4 مجموعات × 3 دقائق",
      "levels": {
        "beginner":     { "weight": "16كجم", "rpm": "6 RPM", "sets": "3×3 دقائق", "rest": "3 دقائق بين المجموعات", "cue": "Clean أولاً — تأكد من الوقوف الكامل قبل Jerk" },
        "intermediate": { "weight": "20كجم", "rpm": "8 RPM", "sets": "4×3 دقائق", "rest": "2 دقيقة بين المجموعات", "cue": "Rack Position مريح — لا تشل يدك في الـ Rack" },
        "advanced":     { "weight": "24كجم", "rpm": "10 RPM", "sets": "4×4 دقائق", "rest": "90 ث بين المجموعات", "cue": "Breathing cycle: شهيق في الـ Clean، زفيران في الـ Jerk" },
        "elite":        { "weight": "32كجم", "rpm": "12 RPM", "sets": "2×6 دقائق", "rest": "3 دقائق بين المجموعتين", "cue": "الوتيرة ثابتة من الثانية 1 إلى الأخيرة — لا acceleration ولا deceleration" }
      },
      "breathingPattern": "شهيق عند الصعود (Clean) → زفير عند Fixation → شهيق صغير عند النزول → زفير قوي عند الـ Rack",
      "techniqueNotes": [
        "Clean: ابدأ بـ Backswing → Hinge → Explosion → Pull → Catch في Rack",
        "Jerk: من الـ Rack → Dip بطيء (5-7سم) → Drive انفجاري → Punch overhead → Stand → Return",
        "النزول: تحكم — لا تدع الوزن يشد كتفك"
      ]
    }
  ],
  "gripWork": {
    "duration": 8,
    "exercises": [
      { "name": "Dead Hang", "duration": "3×20 ث", "notes": "Open hand — الإمساك الكامل يضعف التعافي" },
      { "name": "Open Hand Farmer Carry", "distance": "2×30م", "weight": "16-20كجم", "notes": "راحة بين اليدين لا الإمساك الكامل" }
    ]
  },
  "cooldown": [
    { "name": "Lat Stretch على العارضة", "duration": "60 ث", "notes": "فرد كامل للظهر" },
    { "name": "Shoulder Cross Stretch", "duration": "45 ث لكل جانب", "notes": "تمطيط الدلتا الخلفي" },
    { "name": "Hip Flexor Lunge Stretch", "duration": "60 ث لكل جانب", "notes": "بعد Long Cycle ضروري" }
  ],
  "techniqueNotes": [
    "ملاحظة تقنية مهمة مخصصة لهذه الجلسة"
  ],
  "breathingPattern": "وصف دورة التنفس الكاملة لهذا الحدث",
  "coachNote": "نصيحة ذهبية لهذه الجلسة تحديداً",
  "progressionNote": "كيف يتقدم إلى الأسبوع القادم — ما الذي يجب تحسينه"
}

**قواعد صارمة:**
- كل تمرين في strengthBlock وكل حدث في mainWork يجب أن يحتوي على levels بـ 4 مستويات
- الأوزان أرقام حقيقية محددة (kg) — لا "حسب مستواك"
- RPM واقعي قابل للتحقق — لا تبالغ
- تجنب هذه الأحداث الأخيرة: ${weekAnalysis.eventsUsed.slice(0,5).join(', ') || 'لا شيء'}
- strengthBlock قبل mainWork دائماً

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const generated = parseAiJson(jsonText);

    const result = {
      date: date || todaySA(),
      type: 'kettlebell',
      title: generated.title || 'جلسة Kettlebell',
      eventType: generated.eventType || eventType || 'long-cycle',
      totalDuration: generated.totalDuration ?? 55,
      weekIntensity: generated.weekIntensity || weekAnalysis.label,
      warmup: generated.warmup || {},
      strengthBlock: generated.strengthBlock || {},
      mainWork: generated.mainWork || [],
      gripWork: generated.gripWork || {},
      cooldown: generated.cooldown || [],
      techniqueNotes: generated.techniqueNotes || [],
      breathingPattern: generated.breathingPattern || '',
      coachNote: generated.coachNote || '',
      progressionNote: generated.progressionNote || '',
    };

    return NextResponse.json({ wod: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
