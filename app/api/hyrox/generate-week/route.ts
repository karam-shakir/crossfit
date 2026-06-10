import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

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
  const { fromDate, days = 5, difficulty = 'متوسط' } = body;

  const startDate = fromDate || new Date().toISOString().split('T')[0];

  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }

  const prompt = `أنت مدرب Hyrox محترف متخصص في بناء خطط تدريبية أسبوعية لسباقات Hyrox. تعمل بفلسفة التدريج المنهجي: كل جلسة تبني على السابقة، والأسبوع مُصمَّم كوحدة متكاملة لا مجرد أيام عشوائية.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
المدة: ${days} أيام من ${startDate}
المستوى: ${difficulty}
═══════════════════════════════

**أنواع الجلسات وتعريفها:**
▶ simulation: محاكاة كاملة — 8 محطات + جري بين كل محطة (بأوزان مخففة 70-80%)
▶ strength: تدريب محطات مكثف — 3-5 محطات بأوزان 90-100% مع تكرارات أكثر
▶ running: جري متقطع — intervals + تمرين cardio + محطة أو اثنتان خفيفتان
▶ rest: راحة كاملة أو تعافٍ نشط (mobility + stretching)

**توزيع الأسبوع الاحترافي:**
يوم 1: جلسة قوة المحطات (strength) — ثقيل وبطيء
يوم 2: راحة نشطة (jogging خفيف 20 دقيقة + تمطيط)
يوم 3: محاكاة كاملة (simulation) — وزن كامل بإيقاع تنافسي
يوم 4: راحة كاملة — تعافٍ إلزامي
يوم 5: جري متقطع (running) — intervals + zone 2

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

**جدول الأوزان المرجعية:**
| المحطة | Men Open | Women Open | Simulation (70%) |
|--------|----------|------------|-----------------|
| Sled Push | 102كجم | 72كجم | 70-72كجم / 50كجم |
| Sled Pull | 78كجم | 53كجم | 55كجم / 37كجم |
| Farmers Carry | 2×24كجم | 2×16كجم | 2×20كجم / 2×12كجم |
| Sandbag Lunges | 20كجم | 10كجم | 15كجم / 8كجم |
| Wall Balls | 6كجم/9م | 4كجم/9م | 6كجم / 4كجم |

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان الجلسة — احترافي ومحدد",
      "sessionType": "simulation | strength | running | rest",
      "difficulty": "${difficulty}",
      "totalDuration": 75,
      "coachNote": "ملاحظة المدرب: هدف الجلسة، استراتيجية الأداء، النقاط التقنية الأهم",
      "warmup": {
        "duration": 15,
        "exercises": [
          { "name": "دوائر الكتف", "nameEn": "Shoulder Circles", "duration": "90 ث", "notes": "تنشيط قبل SkiErg" },
          { "name": "تفعيل الكفل", "nameEn": "Glute Bridge", "duration": "15 تكرار", "notes": "تنشيط قبل Sled Push" },
          { "name": "جري تدريجي", "nameEn": "Progressive Jog", "duration": "400م", "notes": "60% → 80% من الأقصى" }
        ]
      },
      "stations": [
        {
          "number": 1,
          "name": "سكي إرج",
          "nameEn": "SkiErg",
          "runBefore": "1 كيلومتر",
          "target": "1000م",
          "weight": "وزن الجسم",
          "targetTime": "مبتدئ: 5:30 | متوسط: 4:30 | متقدم: 3:45",
          "tips": "اسحب بالجسم كله — ابدأ بالورك ثم الذراعين"
        }
      ],
      "cooldown": {
        "duration": 10,
        "exercises": [
          { "name": "مشي هادئ", "nameEn": "Easy Walk", "duration": "3 دقائق", "notes": "خفّف معدل القلب" },
          { "name": "تمطيط الوتر العرقوبي", "nameEn": "Hamstring Stretch", "duration": "60 ث × كل ساق", "notes": "الأكثر توتراً بعد الجري" }
        ]
      },
      "targetTimes": {
        "elite": "65 دقيقة",
        "advanced": "80 دقيقة",
        "intermediate": "95 دقيقة",
        "beginner": "110 دقيقة"
      },
      "nutrition": { "pre": "نصيحة تغذية قبل الجلسة", "post": "نصيحة تغذية بعد الجلسة" },
      "recoveryTips": ["نصيحة تعافٍ محددة 1", "نصيحة تعافٍ محددة 2"]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع، الهدف، كيف تبني الجلسات على بعضها",
  "weeklyLoad": "خفيف | متوسط | ثقيل"
}

**ملاحظات مهمة:**
- totalDuration يجب أن يكون رقماً بالدقائق
- أيام الراحة: isRest: true، stations: []، warmup.exercises: []، cooldown.exercises: []
- كل جلسة فعلية تحتوي على إحماء + محطات + تهدئة
- جلسات strength: 3-5 محطات فقط بأوزان مرتفعة (بدون جري كامل)
- جلسات running: جري متقطع + محطتان خفيفتان فقط
- أوزان simulation: 70-80% من الأوزان الرسمية
- اذكر scaling للمبتدئين في tips كل محطة`;

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
