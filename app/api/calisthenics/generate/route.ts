import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    date,
    difficulty   = 'متوسط',
    sessionType  = 'strength',
    focus        = 'كامل الجسم',
    mixCrossfit  = false,
  } = body;

  const SESSION_TYPES: Record<string, string> = {
    strength:    'قوة — بناء القوة المطلقة بحركات الوزن الذاتي',
    skills:      'مهارات — تطوير مهارات جمناستيكية (وقوف على يدين، ليفر، بلانش)',
    endurance:   'تحمل — عدد تكرارات عالٍ وراحة قصيرة',
    mixed:       'مختلط — مزيج من القوة والمهارات والتحمل',
    hiit:        'HIIT — تدريب متقطع عالي الكثافة بحركات وزن الجسم',
    crossfit_mix: 'مختلط مع CrossFit — يدمج حركات الكاليسثينكس مع حديد CrossFit',
  };

  const prompt = `أنت مدرب Calisthenics محترف بخبرة تزيد عن 10 سنوات، متخصص في برمجة تمارين وزن الجسم والجمناستيكس.

**معلومات عن Calisthenics:**
رياضة تعتمد على وزن الجسم فقط لبناء القوة والمهارات والتحمل، تشمل:
- حركات الضغط العلوي: Push-up, Pike Push-up, Handstand Push-up, Dips
- حركات السحب: Pull-up, Chin-up, Muscle-up, Front Lever, Back Lever
- حركات القلب/الجوهر: L-sit, Dragon Flag, Hollow Body, Planche Lean
- حركات الأرجل: Pistol Squat, Shrimp Squat, Nordic Curl, Jumping Squat
- المهارات: Handstand, Human Flag, Planche, Front Lever, Back Lever

**تفاصيل الجلسة المطلوبة:**
- نوع الجلسة: ${sessionType} → ${SESSION_TYPES[sessionType] || sessionType}
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}
${mixCrossfit ? '- ملاحظة: اجعل الميتكون مختلطاً مع تمارين CrossFit (barbell/kettlebell)' : ''}

**قواعد البرمجة:**
- الإحماء: حركات مفصلية + تنشيط عضلي تدريجي
- العمل الرئيسي: حسب نوع الجلسة
- كل تمرين يجب أن يحتوي على: نسخة مبسطة للمبتدئين ونسخة متقدمة
- الراحة: 60-120 ث بين المجموعات للقوة، 30-45 ث للتحمل
- التقدم: اذكر كيف يتطور التمرين في المرحلة التالية

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان الجلسة بالعربي",
  "sessionType": "${sessionType}",
  "difficulty": "${difficulty}",
  "focus": "${focus}",
  "totalDuration": 60,
  "equipment": ["المعدات المطلوبة — مثل: عارضة سحب، حلقات، أرضية"],
  "warmup": {
    "duration": 10,
    "exercises": [
      {
        "name": "اسم التمرين بالعربي",
        "nameEn": "Exercise name",
        "sets": 2,
        "reps": "10-15",
        "rest": "30 ث",
        "notes": "ملاحظة تقنية"
      }
    ]
  },
  "skillWork": {
    "title": "العمل على المهارة (إذا وجدت)",
    "duration": 10,
    "exercises": [
      {
        "name": "اسم المهارة",
        "nameEn": "Skill name",
        "type": "hold | reps | wall-assisted | band-assisted",
        "sets": 4,
        "target": "5-10 ث أو 3-5 تكرارات",
        "rest": "90 ث",
        "progression": "الخطوة التالية للتطور",
        "regression": "نسخة أسهل للمبتدئين"
      }
    ]
  },
  "mainWork": [
    {
      "block": "اسم الكتلة (مثل: تمرين القوة العلوي)",
      "type": "strength | superset | circuit | amrap | emom",
      "duration": 15,
      "exercises": [
        {
          "name": "اسم التمرين بالعربي",
          "nameEn": "Exercise name",
          "sets": 4,
          "reps": "6-8",
          "rest": "90 ث",
          "tempo": "3-1-2-0",
          "cues": "نقاط تقنية أساسية",
          "scaling": {
            "easier": "نسخة أسهل للمبتدئين",
            "harder": "نسخة أصعب للمتقدمين"
          }
        }
      ]
    }
  ],
  "metcon": {
    "title": "الميتكون — التكييف القلبي",
    "format": "AMRAP | For Time | EMOM | Rounds",
    "duration": 10,
    "rounds": null,
    "timecap": 12,
    "exercises": [
      {
        "name": "اسم التمرين",
        "nameEn": "Exercise name",
        "reps": "10",
        "notes": ""
      }
    ],
    "scoreType": "كيف يُحسب النتيجة"
  },
  "cooldown": {
    "duration": 8,
    "stretches": [
      {
        "name": "اسم التمطيط",
        "duration": "45 ث",
        "focus": "المنطقة المستهدفة"
      }
    ]
  },
  "weeklyPlacement": "متى تُدرج هذه الجلسة في الأسبوع (مثل: يوم A/B، بعد الراحة)",
  "progressionPath": "كيف تتطور في الأسابيع القادمة",
  "nutritionTips": "نصائح غذائية مختصرة لدعم هذا النوع من التدريب",
  "coachNote": "ملاحظة شاملة من المدرب للجلسة"
}

أرجع JSON فقط.`;

  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-8',
      max_tokens: 10000,
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
