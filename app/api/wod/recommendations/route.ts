import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getWods } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { fromDate, days = 7 } = body;

  // Get last 14 WODs for context
  const allWods = await getWods();
  const startDate = fromDate || new Date().toISOString().split('T')[0];
  const recentWods = allWods
    .filter(w => w.date <= startDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const wodSummary = recentWods.map(w => ({
    date: w.date,
    title: w.title,
    type: w.type,
    strengthExercises: w.strength?.map((e: any) => e.exerciseId).join(', ') || '',
    metconExercises: w.metcon?.map((e: any) => e.exerciseId).join(', ') || '',
  }));

  const prompt = `أنت مبرمج CrossFit محترف على مستوى CompTrain وPRVN Athletics.

لديك سجل التمارين الـ 14 يوم الماضية لمجموعة CrossFit:
${JSON.stringify(wodSummary, null, 2)}

مهمتك: وضع خطة أسبوعية ذكية للـ ${days} أيام القادمة ابتداءً من ${startDate}.

**قواعد البرمجة الاحترافية:**
- لا تكرر نفس مجموعة العضلات يومين متتاليين
- بعد كل 2-3 أيام تمرين مكثف، يجب يوم راحة أو active recovery
- وزّع الهايروكس بمعدل مرة كل أسبوع أو أسبوعين
- الكيتل بيل أثليتكس (رياضة الجيرك والسناتش بالكيتل بيل) مرة كل أسبوع
- أيام القوة الثقيلة لا تتكرر أكثر من مرتين في الأسبوع

**الأنواع المتاحة:**
- crossfit: تمرين CrossFit عادي (strength + metcon)
- hyrox: تمرين هايروكس (SkiErg, Sled Push/Pull, Row, Burpee Broad Jump, Farmers Carry, Sandbag Lunges, Wall Balls + 1km runs)
- kettlebell: كيتل بيل أثليتكس (Jerk, Snatch, Long Cycle - تمرين تنافسي)
- rest: راحة تامة
- active_recovery: راحة نشطة خفيفة (مشي، تمطيط، يوغا)

أرجع JSON بهذا التنسيق بالضبط:
{
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم بالعربي",
      "type": "crossfit | hyrox | kettlebell | rest | active_recovery",
      "title": "عنوان مختصر للتمرين أو اليوم",
      "focus": "ما هو محور التمرين",
      "reason": "لماذا هذا النوع في هذا اليوم",
      "intensity": "خفيف | متوسط | مرتفع | راحة",
      "aiInsight": "نصيحة أو ملاحظة ذكية خاصة بهذا اليوم",
      "muscleGroups": ["العضلات المستهدفة"],
      "recommendedTime": "الوقت المقترح للتدريب"
    }
  ],
  "weekSummary": "ملخص الأسبوع وفلسفة البرمجة",
  "recoveryTips": ["نصائح التعافي للأسبوع"],
  "nutritionNote": "ملاحظة تغذوية مهمة للأسبوع"
}

أرجع JSON فقط بدون أي نص خارجه.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
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
