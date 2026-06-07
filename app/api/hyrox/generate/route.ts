import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // أي عضو مسجّل دخوله يستطيع توليد جلسة Hyrox
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    date,
    difficulty   = 'متوسط',
    focus        = 'كامل',
    sessionType  = 'full',
  } = body;

  const prompt = `أنت مدرب Hyrox محترف ومتخصص في برمجة تمارين Hyrox على مستوى عالمي.

**معلومات عن Hyrox:**
Hyrox هي رياضة لياقة بدنية تنافسية تتكون من:
- 8 جولات، كل جولة: 1 كيلومتر جري + محطة تمرين
- المحطات بالترتيب:
  1. SkiErg — 1000م
  2. Sled Push — 50م
  3. Sled Pull — 50م
  4. Burpee Broad Jump — 80م
  5. Row — 1000م
  6. Farmers Carry — 200م
  7. Sandbag Lunges — 100م
  8. Wall Balls — 100 تكرار

**طلبك:**
- نوع الجلسة: ${sessionType} (full=كامل، simulation=محاكاة بأوزان أقل، strength=محطات قوة فقط، running=جري فقط)
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان جلسة Hyrox",
  "sessionType": "${sessionType}",
  "difficulty": "${difficulty}",
  "totalDuration": "المدة الكلية المتوقعة بالدقائق",
  "warmup": {
    "duration": "15 دقيقة",
    "exercises": [
      {"name": "اسم التمرين بالعربي", "nameEn": "English name", "duration": "الوقت أو التكرار", "notes": "ملاحظة"}
    ]
  },
  "stations": [
    {
      "number": 1,
      "name": "اسم المحطة بالعربي",
      "nameEn": "Station name in English",
      "runBefore": "1 كيلومتر",
      "target": "الهدف (مسافة أو تكرار)",
      "weight": "الوزن المقترح",
      "targetTime": "الوقت المستهدف",
      "tips": "نصيحة تقنية مهمة",
      "scaling": "بديل للمبتدئين"
    }
  ],
  "cooldown": {
    "duration": "10 دقيقة",
    "exercises": [
      {"name": "تمرين التهدئة", "duration": "الوقت"}
    ]
  },
  "targetTimes": {
    "elite":        "وقت النخبة",
    "advanced":     "وقت المتقدم",
    "intermediate": "وقت المتوسط",
    "beginner":     "وقت المبتدئ"
  },
  "nutritionBefore":           "ما تأكله قبل التمرين",
  "nutritionAfter":            "ما تأكله بعد التمرين",
  "coachNote":                 "ملاحظة المدرب الشاملة",
  "nextSessionRecommendation": "توصية للجلسة القادمة بناءً على هذه"
}

أرجع JSON فقط.`;

  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-8',
      max_tokens: 8000,
      messages:   [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/,     '').replace(/\n?```$/,  '').trim();

    const result = JSON.parse(jsonText);
    return NextResponse.json({
      session: result,
      date:    date || new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
