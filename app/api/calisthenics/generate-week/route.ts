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

  const prompt = `أنت مدرب Calisthenics محترف بخبرة تزيد عن 10 سنوات في برمجة تمارين وزن الجسم والجمناستيكس.

**مهمتك:** توليد خطة تدريب Calisthenics أسبوعية لـ ${days} أيام بدءاً من ${startDate} بمستوى: ${difficulty}

**أنواع الجلسات المتاحة:**
- strength: قوة وزن الجسم (pull-up progressions, push-up progressions, dips, pistol squat)
- skills: مهارات جمناستيكية (handstand, planche, front lever, muscle-up)
- endurance: تحمل (تكرارات عالية، دوائر، EMOM)
- mixed: مختلط (قوة + مهارات + تحمل)
- hiit: تدريب متقطع عالي الكثافة بحركات وزن الجسم

**قواعد البرمجة:**
- 4 جلسات تدريب أسبوعياً كحد أقصى
- لا يومين قوة متتاليين
- يوم مهارات بعد كل يومين قوة/تحمل
- باقي الأيام: راحة نشطة أو راحة كاملة

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
      "sessionType": "strength | skills | endurance | mixed | hiit",
      "focus": "الجزء العلوي | الجزء السفلي | كامل الجسم | المهارات",
      "difficulty": "${difficulty}",
      "totalDuration": 60,
      "equipment": ["المعدات المطلوبة"],
      "coachNote": "ملاحظة المدرب",
      "warmup": {
        "duration": 10,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "sets": 2, "reps": "10", "rest": "30 ث", "notes": "" }
        ]
      },
      "skillWork": {
        "title": "عنوان عمل المهارة",
        "duration": 10,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "sets": 3, "hold": "10 ث", "rest": "60 ث", "notes": "", "regression": "نسخة مبسطة", "progression": "نسخة متقدمة" }
        ]
      },
      "mainWork": {
        "title": "عنوان العمل الرئيسي",
        "format": "وصف التنسيق",
        "duration": 30,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "sets": 4, "reps": "8-10", "rest": "90 ث", "notes": "", "regression": "نسخة مبسطة", "progression": "نسخة متقدمة" }
        ]
      },
      "metcon": {
        "format": "AMRAP | للوقت | EMOM | تابطا",
        "duration": 10,
        "timecap": 12,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "reps": "10" }
        ]
      },
      "progressionNote": "كيفية التطور في المرحلة التالية"
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع",
  "weeklyFocus": "وصف التركيز الأسبوعي"
}

**ملاحظات مهمة:**
- أيام الراحة: isRest: true، mainWork.exercises: []، warmup.exercises: []
- skillWork وmetcon اختياريان — ضعهما فقط إذا كانا مناسبين لنوع الجلسة
- جميع التمارين بوزن الجسم فقط — لا حديد ولا أثقال
- حركات Calisthenics: pull-up, chin-up, muscle-up, push-up, dips, handstand push-up, L-sit, front lever, back lever, planche, pistol squat, nordic curl, dragon flag`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 10000,
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
