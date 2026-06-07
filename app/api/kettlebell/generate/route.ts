import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // أي عضو مسجّل دخوله يستطيع توليد جلسة Kettlebell
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    date,
    difficulty = 'متوسط',
    eventType  = 'biathlon',
    focus      = 'التحمل',
  } = body;

  const prompt = `أنت مدرب Kettlebell Athletics محترف ومعتمد دولياً من IUKL (الاتحاد الدولي لرفع الكيتل بيل).

**معلومات عن Kettlebell Athletics (رياضة الجيرك):**
- رياضة قوة وتحمل تنافسية باستخدام الكيتل بيل
- الأحداث الرئيسية:
  * Biathlon (ثنائي): Jerk + Snatch بكيتل بيل واحدة أو ثنائية، 10 دقائق لكل حدث
  * Long Cycle (دورة طويلة): Clean + Jerk بكيتل بيلَين، 10 دقائق
  * Snatch (انتزاع): Snatch بكيتل بيل واحدة، 10 دقائق
- الأوزان القياسية: 8، 12، 16، 20، 24، 28، 32 كجم

**المطلوب:**
- نوع الحدث: ${eventType} (biathlon | long_cycle | snatch | strength | conditioning)
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان الجلسة بالعربي",
  "eventType": "${eventType}",
  "difficulty": "${difficulty}",
  "totalDuration": "المدة الكلية",
  "warmup": {
    "duration": "10-15 دقيقة",
    "movements": [
      {"name": "اسم الحركة بالعربي", "nameEn": "English", "sets": "المجموعات", "reps": "التكرارات", "notes": "ملاحظة"}
    ]
  },
  "mainWork": [
    {
      "block": "اسم الكتلة التدريبية",
      "movement": "اسم الحركة بالعربي",
      "movementEn": "Movement name in English",
      "weight": "الوزن المقترح",
      "sets": "المجموعات",
      "reps": "التكرارات أو الوقت",
      "tempo": "إيقاع الحركة",
      "restBetweenSets": "الراحة بين المجموعات",
      "technique": "نقاط تقنية مهمة",
      "targetRPM": "الهدف: عدد التكرارات في الدقيقة إذا كان للوقت"
    }
  ],
  "gripwork": {
    "note": "أسلوب الإمساك والتعامل مع التعب في الرسغ",
    "exercises": [
      {"name": "تمرين التقوية", "sets": "المجموعات", "reps": "التكرارات"}
    ]
  },
  "cooldown": [
    {"name": "تمرين التهدئة", "duration": "الوقت", "focus": "التركيز"}
  ],
  "techniqueNotes":   ["نقطة تقنية 1", "نقطة تقنية 2", "نقطة تقنية 3"],
  "breathingPattern": "نمط التنفس الصحيح خلال الحركة",
  "weeklyPlan": {
    "sessionsPerWeek": "عدد الجلسات الأسبوعية المقترحة",
    "placement":       "متى تُدرج هذا التمرين في الأسبوع مع CrossFit",
    "avoidAfter":      "ما الذي يجب تجنبه قبل هذه الجلسة"
  },
  "coachNote":       "ملاحظة المدرب الشاملة للجلسة",
  "progressionNote": "كيف تتطور في الجلسات القادمة"
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
