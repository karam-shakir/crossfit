import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAllHyroxSessions } from '@/lib/db';

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

  // جلب آخر 4 جلسات Hyrox للسياق التاريخي
  const allHyrox = await getAllHyroxSessions();
  const recentHyrox = allHyrox
    .filter((s: any) => date ? s.date < date : true)
    .slice(0, 4)
    .map((s: any) => ({
      date: s.date,
      sessionType: s.sessionType || s.sessionData?.sessionType,
      title: s.sessionData?.title || s.title,
      stations: (s.sessionData?.stations || []).map((st: any) => st.nameEn || st.name).join(', '),
    }));
  const recentContext = recentHyrox.length > 0
    ? `\n**الجلسات السابقة (تجنب تكرار نفس نوع الجلسة مباشرة — نوّع المحطات والتركيز):**\n${JSON.stringify(recentHyrox, null, 2)}\n`
    : '';

  const prompt = `أنت مدرب Hyrox محترف ومعتمد على المستوى الدولي، بخبرة في تدريب الرياضيين للمشاركة في سباقات Hyrox. تعرف الرياضة من الداخل — أوزان المحطات الرسمية، الأوقات المستهدفة، والاستراتيجية الصحيحة لكل مستوى.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit — غالبيتهم رجال (18-40 سنة)، أوزان Men Open كـ RX مع scaling للنساء
═══════════════════════════════

**Hyrox — المواصفات الرسمية للسباق:**
8 جولات، كل جولة = 1 كيلومتر جري + محطة:
  1. SkiErg — 1000م (مستمر بدون توقف)
  2. Sled Push — 50م (ذهاباً وإياباً)
  3. Sled Pull — 50م (بحبل)
  4. Burpee Broad Jump — 80م (القفز عريض مع البيربي)
  5. Rowing — 1000م (مستمر)
  6. Farmers Carry — 200م (حمل كيتل بيل في كلتا اليدين)
  7. Sandbag Lunges — 100م (مشي بالطعن مع الكيس الرملي)
  8. Wall Balls — 100 تكرار (رمي الكرة للحائط)

**جدول الأوزان الرسمية لكل فئة:**
| المحطة | Men Pro | Men Open | Women Pro | Women Open |
|--------|---------|----------|-----------|------------|
| Sled Push | 152كجم | 102كجم | 102كجم | 72كجم |
| Sled Pull | 103كجم | 78كجم | 78كجم | 53كجم |
| Farmers Carry | 2×32كجم | 2×24كجم | 2×24كجم | 2×16كجم |
| Sandbag Lunges | 30كجم | 20كجم | 20كجم | 10كجم |
| Wall Balls | 9كجم/9م | 6كجم/9م | 6كجم/9م | 4كجم/9م |
| Kettlebell (Doubles) | 2×32كجم | 2×24كجم | 2×24كجم | 2×16كجم |

**أوقات الإنجاز المرجعية لسباق كامل:**
- النخبة العالمية: 60-70 دقيقة
- المتقدم: 75-90 دقيقة
- المتوسط: 90-105 دقيقة
- المبتدئ: 105-120 دقيقة

${recentContext}
**الجلسة المطلوبة:**
- نوع الجلسة: ${sessionType}
  * full = محاكاة سباق كامل (8 محطات + 8 جولات جري)
  * simulation = محاكاة بأوزان مخففة (70% من الرسمية)
  * strength = تدريب محطات فقط (3-4 محطات مع أوزان مرتفعة، بدون جري)
  * running = جري متقطع + 2 محطات فقط
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}

**الإحماء الاحترافي لـ Hyrox (15-20 دقيقة):**
- تنشيط الكتف للـ SkiErg: band pull-apart، shoulder circles، scapular depression
- تنشيط الورك للـ Sled: hip hinge، glute activation، lateral band walk
- تنشيط الساق للجري: leg swing، calf raise، high knees تدريجية
- ارفع معدل القلب تدريجياً: ابدأ 60% → 70% → 80%

**قاعدة Hyrox الذهبية:** لا تتوقف عند المحطة — الحركة البطيئة المستمرة أفضل من التوقف للراحة.

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان جلسة Hyrox احترافي ومحفز",
  "sessionType": "${sessionType}",
  "difficulty": "${difficulty}",
  "totalDuration": 90,
  "warmup": {
    "duration": 15,
    "exercises": [
      {"name": "دوائر الكتف", "nameEn": "Shoulder Circles", "duration": "90 ث", "notes": "تنشيط الكتف قبل SkiErg — 10 للأمام + 10 للخلف"},
      {"name": "تفعيل الورك الجانبي", "nameEn": "Lateral Band Walk", "duration": "2×20 خطوة", "notes": "تنشيط الأوتار الخلفية والكفل قبل Sled"},
      {"name": "جري تدريجي", "nameEn": "Progressive Run", "duration": "400م", "notes": "60% → 80% — ارفع الإيقاع تدريجياً"},
      {"name": "تمطيط الوتر العرقوبي الديناميكي", "nameEn": "Dynamic Hamstring Stretch", "duration": "10 × كل ساق", "notes": "استعداد لـ Sandbag Lunges وRowing"}
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
      "targetTime": "مبتدئ: 5:30 | متوسط: 4:30 | متقدم: 3:45 | نخبة: 3:15",
      "tips": "اسحب بالجسم كله — ابدأ بالورك ثم الذراعين، نفَس مع كل سحبة، لا تنحني للأمام كثيراً",
      "scaling": "مبتدئ: 700م بدلاً من 1000م"
    }
  ],
  "cooldown": {
    "duration": 12,
    "exercises": [
      {"name": "مشي هادئ", "nameEn": "Easy Walk", "duration": "3 دقائق", "notes": "خفّف معدل القلب تدريجياً"},
      {"name": "تمطيط الوتر العرقوبي", "nameEn": "Hamstring Stretch", "duration": "60 ث × كل ساق", "notes": "الأكثر توتراً بعد الجري والـ Sled"},
      {"name": "تمطيط الصدر والكتفين", "nameEn": "Chest & Shoulder Stretch", "duration": "60 ث", "notes": "للـ SkiErg والـ Rowing"},
      {"name": "تمطيط الرباعية", "nameEn": "Quad Stretch", "duration": "60 ث × كل ساق", "notes": "بعد Wall Balls والـ Lunges"}
    ]
  },
  "targetTimes": {
    "elite": "65-70 دقيقة",
    "advanced": "80-90 دقيقة",
    "intermediate": "95-105 دقيقة",
    "beginner": "110-120 دقيقة"
  },
  "nutritionBefore": "2-3 ساعات قبل: وجبة كربوهيدرات معقدة + بروتين خفيف. 30 دقيقة قبل: موزة أو تمرة + ماء. لا دهون قبل التمرين مباشرة.",
  "nutritionAfter": "خلال 30 دقيقة: بروتين سريع (شيك أو بيض) + كربوهيدرات بسيطة. ملح وإلكتروليتات لتعويض العرق. 1.5L ماء على الأقل بعد الجلسة.",
  "coachNote": "ملاحظة شاملة من المدرب: استراتيجية الجلسة، النقاط التقنية الأهم، الأخطاء الشائعة وكيف تتجنبها",
  "nextSessionRecommendation": "توصية محددة للجلسة القادمة بناءً على هذه الجلسة — ماذا تعمل بعد يومين من التعافي"
}

**قواعد مهمة:**
- totalDuration يجب أن يكون رقماً (بالدقائق) وليس نصاً
- ضع جميع محطات Hyrox الثمانية في stations[] مرتبة 1-8
- لكل محطة: اذكر الوزن حسب الفئة (Open/Pro) والـ scaling للمبتدئين
- الإحماء: 4 تمارين تغطي الكتف + الورك + القلب والأوعية
- التهدئة: 4 تمارين تمطيط للمناطق الأكثر إجهاداً

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
