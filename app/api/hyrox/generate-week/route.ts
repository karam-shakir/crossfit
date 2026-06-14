import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getAllHyroxSessions } from '@/lib/db';

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
  const { fromDate, days = 5 } = body;

  const startDate = fromDate || todaySA();

  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }

  // جلب آخر 6 جلسات Hyrox للسياق التاريخي
  const allHyrox = await getAllHyroxSessions();
  const recentHyrox = allHyrox
    .filter((s: any) => s.date < startDate)
    .slice(0, 6)
    .map((s: any) => ({
      date: s.date,
      sessionType: s.sessionType || s.sessionData?.sessionType,
      title: s.sessionData?.title || s.title,
      load: s.sessionData?.weeklyLoad || s.sessionData?.difficulty,
    }));
  const recentContext = recentHyrox.length > 0
    ? `\n**الأسابيع السابقة — تجنب تكرار نفس التوزيع وانتبه للحمل التراكمي:**\n${JSON.stringify(recentHyrox, null, 2)}\n`
    : '';

  const prompt = `أنت مدرب HYROX محترف معتمد ومبرمج أسابيع تدريبية لبطولات HYROX. فلسفتك الأساسية: القوة الوظيفية أولاً — كل جلسة تخدم جميع المستويات مع أهداف وأوزان مختلفة لكل مستوى.

═══════════════════════════════
النادي: مجموعة المطانيخ HYROX
الجمهور: مبتدئون إلى نخبة، رجال ونساء (18-40 سنة)
الفلسفة: القوة الوظيفية + التحمل + الكفاءة = HYROX Champion
المدة: ${days} أيام من ${startDate}
المستويات: مبتدئ / متوسط / متقدم / نخبة — ولّد الأربعة في كل تمرين
═══════════════════════════════

**أنواع الجلسات:**
▶ strength: كتلة قوة وظيفية ثقيلة (Deadlift/Squat/Press) + 2-3 محطات بأوزان 90-100%
▶ simulation: محاكاة سباق — 5-8 محطات + جري بأوزان 70-80% + strength خفيفة في البداية
▶ running: intervals + Zone 2 + تقنية الجري + محطة واحدة خفيفة
▶ rest: راحة كاملة أو mobility + foam roll

${recentContext}
**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

**══ الأوزان الرسمية وتعديلات كل مستوى ══**
| المحطة | مبتدئ (50%) | متوسط (75%) | متقدم (90%) | نخبة (100%) |
|--------|------------|------------|------------|------------|
| Sled Push | 51كجم | 77كجم | 92كجم | 102كجم |
| Sled Pull | 51كجم | 77كجم | 92كجم | 102كجم |
| Farmers Carry | 2×16كجم | 2×24كجم | 2×29كجم | 2×32كجم |
| Sandbag Lunges | 10كجم/50م | 15كجم/100م | 18كجم/150م | 20كجم/200م |
| Wall Balls | 4كجم/30 | 6كجم/70 | 6كجم/100 | 6كجم/100 Rx |

**أوزان كتلة القوة:**
| التمرين | مبتدئ | متوسط | متقدم | نخبة |
|---------|-------|-------|-------|------|
| Deadlift | 50كجم | 80كجم | 110كجم | 140كجم |
| Back Squat | 40كجم | 70كجم | 95كجم | 120كجم |
| Farmer Carry Walk | 2×16كجم | 2×24كجم | 2×32كجم | 2×40كجم |

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان احترافي يعكس محاور الجلسة",
      "sessionType": "strength | simulation | running | rest",
      "difficulty": "جميع المستويات",
      "totalDuration": 75,
      "coachNote": "هدف الجلسة + استراتيجية + النقطة التقنية الأهم",
      "strengthBlock": {
        "description": "لماذا هذه القوة قبل المحطات",
        "exercises": [
          {
            "name": "Deadlift",
            "scheme": "4×5",
            "levels": {
              "beginner":     { "weight": "50كجم", "rest": "90 ث", "cue": "ظهر مستقيم — رقبة محايدة" },
              "intermediate": { "weight": "80كجم", "rest": "120 ث", "cue": "Brace قبل الرفع — نفَس عميق" },
              "advanced":     { "weight": "110كجم", "rest": "150 ث", "cue": "ادفع الأرض — لا تشد الظهر" },
              "elite":        { "weight": "140كجم+", "rest": "180 ث", "cue": "قوة انفجارية مع تحكم في النزول" }
            }
          }
        ]
      },
      "warmup": {
        "duration": 12,
        "exercises": [
          { "name": "جري تدريجي", "duration": "400م", "notes": "60% → 80% — تنشيط تدريجي" }
        ]
      },
      "stations": [
        {
          "number": 1,
          "name": "Ski Erg",
          "runBefore": "1000م",
          "levels": {
            "beginner":     { "distance": "300م", "weight": "", "targetPace": "2:30/500م", "scaling": "إيقاع ثابت — لا sprint" },
            "intermediate": { "distance": "500م", "weight": "", "targetPace": "2:05/500م", "scaling": "" },
            "advanced":     { "distance": "500م", "weight": "", "targetPace": "1:55/500م", "scaling": "" },
            "elite":        { "distance": "500م", "weight": "", "targetPace": "1:45/500م", "scaling": "Hip-drive dominant" }
          },
          "technique": "نقطة تقنية مهمة",
          "tips": "استراتيجية المحطة"
        }
      ],
      "cooldown": {
        "duration": 10,
        "exercises": [
          { "name": "مشي هادئ", "duration": "3 دقائق", "notes": "تخفيض معدل القلب" },
          { "name": "Hamstring Stretch", "duration": "60 ث كل ساق", "notes": "ضروري بعد الجري والـ Sled" }
        ]
      },
      "targetTimes": {
        "beginner": "لا يهم — إنهاء سليم",
        "intermediate": "حدد وقتاً محدداً",
        "advanced": "حدد وقتاً محدداً",
        "elite": "حدد وقتاً تنافسياً"
      },
      "nutrition": { "pre": "نصيحة تغذية قبل", "post": "نصيحة تغذية بعد" }
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع، التدرج، الهدف الرئيسي",
  "weeklyLoad": "خفيف | متوسط | ثقيل"
}

**قواعد صارمة:**
- strengthBlock يأتي قبل stations في كل جلسة نشطة (حتى simulation)
- كل محطة وكل تمرين قوة لها levels بـ 4 مستويات
- totalDuration رقم بالدقائق
- أيام الراحة: isRest: true، stations: []، strengthBlock: {}، warmup.exercises: []
- simulation: 5-6 محطات + strengthBlock خفيف
- strength: 3-4 محطات فقط + strengthBlock ثقيل
- running: محطة واحدة فقط (SkiErg أو Row) + strengthBlock خفيف + تركيز على الجري

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
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
