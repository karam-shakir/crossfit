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

  const prompt = `أنت مدرب Hyrox محترف متخصص في برمجة تدريبات Hyrox الأسبوعية.

**مهمتك:** توليد خطة تدريب Hyrox لـ ${days} أيام بدءاً من ${startDate} بمستوى: ${difficulty}

**قواعد البرمجة:**
- 2-3 جلسات تدريب فعلي في الأسبوع (simulation / strength / running)
- باقي الأيام: راحة أو راحة نشطة
- تنويع بين أنواع الجلسات: simulation محاكاة كاملة، strength قوة المحطات، running جري + مقاطع
- التدرج في الشدة: لا يومين متتاليين بنفس الشدة العالية

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان الجلسة",
      "sessionType": "simulation | strength | running | rest",
      "difficulty": "${difficulty}",
      "totalDuration": 60,
      "coachNote": "ملاحظة المدرب",
      "warmup": {
        "duration": "10 دقائق",
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "duration": "2 دقيقة", "notes": "ملاحظة" }
        ]
      },
      "stations": [
        {
          "number": 1,
          "name": "Ski Erg",
          "nameEn": "Ski Erg",
          "runBefore": "1 كم",
          "target": "1000م",
          "weight": "وزن الجسم",
          "targetTime": "4:30 دقيقة",
          "tips": "نصيحة تقنية"
        }
      ],
      "targetTimes": {
        "elite": "60 دقيقة",
        "advanced": "75 دقيقة",
        "intermediate": "90 دقيقة",
        "beginner": "105 دقيقة"
      },
      "nutrition": { "pre": "نصيحة قبل", "post": "نصيحة بعد" },
      "recoveryTips": ["نصيحة 1", "نصيحة 2"]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع",
  "weeklyLoad": "خفيف | متوسط | ثقيل"
}

**ملاحظات مهمة:**
- أيام الراحة: isRest: true، stations: []، warmup.exercises: []
- محطات Hyrox الثمانية: Ski Erg, Sled Push, Sled Pull, Burpee Broad Jump, Rowing, Farmers Carry, Sandbag Lunges, Wall Balls
- كل جولة كاملة = 1 كم جري + محطة
- جلسات القوة تركز على 3-4 محطات فقط مع أوزان مرتفعة`;

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
