import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getAllKettlebellSessions } from '@/lib/db';
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
    fromDate, days = 5,
    difficulty = 'متوسط',
    coachFocus = 'balanced',    // biathlon / snatch / longcycle / strength / conditioning / balanced
    specialNotes = '',
    intensityBias = 'balanced', // heavy / moderate / light / balanced
    restDays = -1,
    priorityEvent = '',         // حدث البطولة القادمة: biathlon / snatch / longcycle
  } = body;

  const startDate = fromDate || todaySA();

  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }

  // جلب آخر 6 جلسات Kettlebell للسياق التاريخي
  const allKB = await getAllKettlebellSessions();
  const recentKB = allKB
    .filter((s: any) => s.date < startDate)
    .slice(0, 6)
    .map((s: any) => ({
      date: s.date,
      eventType: s.eventType || s.sessionData?.eventType,
      focus: s.sessionData?.focus || s.focus,
      volume: s.sessionData?.weeklyVolume,
    }));
  const recentContext = recentKB.length > 0
    ? `\n**الأسابيع السابقة — نوّع الأحداث وابنِ على الحجم السابق تدريجياً:**\n${JSON.stringify(recentKB, null, 2)}\n`
    : '';

  const prompt = `أنت مدرب Kettlebell Sport محترف معتمد (IUKL/WAKSC). فلسفتك: القوة + التقنية + التنفس = بطل Kettlebell. تصمم أسابيع تدريبية متكاملة تخدم جميع المستويات في نفس الجلسة مع تركيز حقيقي على بناء القوة العضلية والحركات الوظيفية.

═══════════════════════════════
النادي: مجموعة المطانيخ Kettlebell
الجمهور: مبتدئون إلى نخبة (18-40 سنة)
المستوى العام: ${difficulty}
التركيز الأسبوعي: ${coachFocus === 'biathlon' ? '🔔 أسبوع ثنائي الحدث — Jerk + Snatch بحجم عالٍ' : coachFocus === 'snatch' ? '⚡ أسبوع الخطف — Snatch فقط بتقنية عالية' : coachFocus === 'longcycle' ? '🔄 أسبوع Clean & Jerk — حجم ثقيل' : coachFocus === 'strength' ? '💪 أسبوع قوة — Deadlift/Press/Squat ثقيل' : coachFocus === 'conditioning' ? '🔥 أسبوع تكييف — دوائر GPP عالية الشدة' : 'متوازن — توزيع كلاسيكي'}
${priorityEvent ? `حدث الأولوية القادم: ${priorityEvent} — ركّز عليه أكثر` : ''}
تحيّز الشدة: ${intensityBias === 'heavy' ? 'ثقيل' : intensityBias === 'light' ? 'خفيف' : intensityBias === 'moderate' ? 'متوسط' : 'متوازن'}
${restDays >= 0 ? `أيام الراحة: ${restDays} أيام (تحديد المدرب)` : 'أيام الراحة: الذكاء الاصطناعي يقرر'}
${specialNotes ? `\n📌 تعليمات المدرب الخاصة:\n${specialNotes}` : ''}
الفلسفة: الوزن يحترم التقنية — التقنية تصنع القوة — القوة تصنع البطل
المدة: ${days} أيام من ${startDate}
المستويات: مبتدئ / متوسط / متقدم / نخبة — ولّد الأربعة في كل تمرين
═══════════════════════════════

**أنواع الجلسات:**
▶ biathlon: Jerk (أداتان) + Snatch — الحدث التنافسي الكلاسيكي + كتلة قوة
▶ snatch: Snatch فقط — تقنية + حجم + strength مكمّلة
▶ longcycle: Clean & Jerk — القوة الكاملة + Strength Block ثقيل
▶ strength: قوة وظيفية بالكيتل بيل (Deadlift, Press, Squat, Carry)
▶ conditioning: GPP — دوائر مختلطة + TGU + Swing
▶ rest: راحة كاملة أو mobility + تمطيط الرسغ والكتف

**══ 4 مستويات في كل جلسة ══**

| المستوى | الوزن الحدث | Jerk RPM | Snatch RPM | LC RPM |
|---------|------------|----------|------------|--------|
| مبتدئ | 8-12كجم | 6-8 | 8-10 | 5-6 |
| متوسط | 16كجم | 8-10 | 10-12 | 6-8 |
| متقدم | 20-24كجم | 10-12 | 12-14 | 8-10 |
| نخبة | 28-32كجم | 12-14+ | 14-16+ | 10-12+ |

| القوة | مبتدئ | متوسط | متقدم | نخبة |
|-------|-------|-------|-------|------|
| KB Deadlift | 2×16كجم | 2×24كجم | 2×32كجم | 2×40كجم |
| KB Press | 12كجم | 16كجم | 20-24كجم | 28-32كجم |
| KB Swing | 12-16كجم | 20-24كجم | 28-32كجم | 32-40كجم |
| Goblet Squat | 12-16كجم | 20-24كجم | 28-32كجم | 36-40كجم |

**فلسفة التوزيع الأسبوعي:**
يوم STRENGTH HEAVY: كتلة قوة ثقيلة (Deadlift/Press/Squat) + حدث خفيف
يوم SPORT WORK: الحدث الرئيسي + strength خفيفة
يوم TECHNIQUE: أوزان خفيفة، تركيز على الجودة والتنفس
يوم REST: راحة كاملة أو تمطيط رسغ وكتف + foam roll

${recentContext}
**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان احترافي يعكس الحدث والهدف",
      "eventType": "biathlon | snatch | longcycle | strength | conditioning | rest",
      "focus": "القوة | التحمل | التقنية | السرعة | التعافي",
      "difficulty": "جميع المستويات",
      "coachNote": "هدف الجلسة + الاستراتيجية + النقطة الأهم لهذه الجلسة",
      "breathingPattern": "دورة التنفس الكاملة: متى تشهق، متى تزفر، الإيقاع الأمثل لهذا الحدث",
      "warmup": {
        "duration": 12,
        "movements": [
          {
            "name": "Wrist Circles & Flexion",
            "sets": "2",
            "reps": "20 دورة + 10 ث ثبات",
            "notes": "إلزامي — يمنع إصابة الرسغ",
            "levels": {
              "beginner": "دوائر بطيئة فقط",
              "intermediate": "دوائر + ضغط خفيف على الرسغ",
              "advanced": "Bottom-up Hold 15 ث بوزن 12كجم",
              "elite": "نفس المتقدم + Wrist Roller"
            }
          }
        ]
      },
      "strengthBlock": {
        "description": "كتلة القوة الوظيفية — تأتي قبل الحدث دائماً",
        "exercises": [
          {
            "name": "KB Deadlift",
            "scheme": "4×5",
            "levels": {
              "beginner":     { "weight": "2×16كجم", "rest": "90 ث", "cue": "Hinge — ظهر مستقيم" },
              "intermediate": { "weight": "2×24كجم", "rest": "90 ث", "cue": "ضغط الوسط قبل الرفع" },
              "advanced":     { "weight": "2×32كجم", "rest": "120 ث", "cue": "Brace 360 درجة" },
              "elite":        { "weight": "2×40كجم+", "rest": "120 ث", "cue": "انفجار + تحكم في النزول" }
            },
            "coachNote": "لماذا هذا التمرين في هذا التوقيت"
          }
        ]
      },
      "mainWork": [
        {
          "exercise": "Long Cycle",
          "exerciseAr": "Long Cycle — Clean & Jerk",
          "sets": 4,
          "reps": "4 دقائق",
          "restBetweenSets": "3 دقائق",
          "levels": {
            "beginner":     { "weight": "12كجم", "rpm": "6 RPM", "totalLifts": "24 رفعة/مجموعة", "cue": "تأكد من الوقوف الكامل قبل الـ Jerk" },
            "intermediate": { "weight": "16كجم", "rpm": "8 RPM", "totalLifts": "32 رفعة/مجموعة", "cue": "Rack Position مريح — رسغ محايد" },
            "advanced":     { "weight": "24كجم", "rpm": "10 RPM", "totalLifts": "40 رفعة/مجموعة", "cue": "Dip صغير وانفجاري — لا تنزل عميقاً" },
            "elite":        { "weight": "32كجم", "rpm": "12 RPM", "totalLifts": "48 رفعة/مجموعة", "cue": "وتيرة ثابتة من الثانية 1 إلى الأخيرة" }
          },
          "technique": "نقطة تقنية مهمة لهذا الحدث تحديداً"
        }
      ],
      "techniqueNotes": [
        "نقطة تقنية 1 لهذه الجلسة",
        "الخطأ الشائع وكيف تتجنبه",
        "نصيحة للمستوى المتقدم"
      ],
      "progressionNote": "في الأسبوع القادم: ماذا تزيد؟ المدة؟ الوزن؟ الـ RPM؟",
      "cooldown": {
        "duration": 10,
        "movements": [
          { "name": "Forearm & Wrist Stretch", "duration": "90 ث × كل يد", "notes": "ضغط على راحة اليد للخلف" },
          { "name": "Shoulder Cross-body Stretch", "duration": "60 ث × كل كتف", "notes": "الدلتا الخلفي — يُهمل دائماً" },
          { "name": "Deep Breathing", "duration": "2 دقيقة", "notes": "تنشيط الجهاز العصبي الباراسمباثاوي" }
        ]
      }
    }
  ],
  "weekSummary": "فلسفة الأسبوع: التوزيع، الهدف التراكمي، كيف تتكامل الجلسات",
  "weeklyVolume": "خفيف | متوسط | ثقيل"
}

**قواعد صارمة:**
- كل تمرين في strengthBlock وكل حدث في mainWork له levels بـ 4 مستويات
- strengthBlock قبل mainWork في كل جلسة نشطة
- الأوزان أرقام حقيقية محددة، ليس "حسب مستواك"
- RPM واقعي ومدروس — لا مبالغة
- أيام الراحة: isRest: true وكل المصفوفات فارغة
- لا يومَي حدث ثقيل متتاليَين

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

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

    const result = parseAiJson(jsonText, 'sessions');
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
