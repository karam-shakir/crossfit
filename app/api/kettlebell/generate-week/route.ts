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

  const prompt = `أنت مدرب Kettlebell Athletics محترف ومعتمد من IUKL (الاتحاد الدولي لرياضة الكيتل بيل).

**مهمتك:** توليد خطة تدريب Kettlebell لـ ${days} أيام بدءاً من ${startDate} بمستوى: ${difficulty}

**أنواع الجلسات المتاحة:**
- biathlon: Jerk + Snatch (المسابقة الكلاسيكية)
- jerk: Long Cycle Jerk فقط
- snatch: Snatch فقط
- longcycle: Long Cycle (Clean + Jerk)
- strength: تدريب قوة بالكيتل بيل

**قواعد البرمجة:**
- 3 جلسات تدريب فعلي في الأسبوع كحد أقصى
- باقي الأيام: راحة أو راحة نشطة
- تنويع بين Jerk وSnatch وLong Cycle
- التدرج في الحجم والشدة على مدار الأسبوع
- لا يومين متتاليين بنفس الشدة

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
      "eventType": "biathlon | jerk | snatch | longcycle | strength",
      "focus": "التحمل | القوة | التقنية | السرعة",
      "difficulty": "${difficulty}",
      "coachNote": "ملاحظة المدرب",
      "breathingPattern": "وصف نمط التنفس",
      "warmup": {
        "duration": "10 دقائق",
        "movements": ["حركة 1", "حركة 2"]
      },
      "mainWork": [
        {
          "exercise": "Jerk",
          "exerciseAr": "الجيرك",
          "sets": 5,
          "reps": 10,
          "weight": "16 كجم",
          "restBetweenSets": "2 دقيقة",
          "targetRPM": 8,
          "technique": "نصيحة تقنية"
        }
      ],
      "techniqueNotes": ["ملاحظة تقنية 1", "ملاحظة تقنية 2"],
      "progressionNote": "كيفية التطور في المرحلة التالية"
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع",
  "weeklyVolume": "خفيف | متوسط | ثقيل"
}

**ملاحظات مهمة:**
- أيام الراحة: isRest: true، mainWork: []، warmup.movements: []
- الأوزان القياسية: مبتدئ 8-12 كجم، متوسط 16-20 كجم، متقدم 24-28 كجم، نخبة 32 كجم+
- RPM المرجعية: مبتدئ 6-8، متوسط 8-10، متقدم 10-12، نخبة 12-14`;

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
