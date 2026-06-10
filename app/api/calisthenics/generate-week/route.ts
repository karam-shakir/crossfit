import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAllCalisthenicsSessions } from '@/lib/db';

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

  // جلب آخر 6 جلسات Calisthenics للسياق التاريخي
  const allCalis = await getAllCalisthenicsSessions();
  const recentCalis = allCalis
    .filter((s: any) => s.date < startDate)
    .slice(0, 6)
    .map((s: any) => ({
      date: s.date,
      sessionType: s.sessionType || s.sessionData?.sessionType,
      focus: s.sessionData?.focus || s.focus,
      weeklyFocus: s.sessionData?.weeklyFocus,
    }));
  const recentContext = recentCalis.length > 0
    ? `\n**الأسابيع السابقة — تطوّر على نفس المهارات وتجنب الإجهاد المتراكم:**\n${JSON.stringify(recentCalis, null, 2)}\n`
    : '';

  const prompt = `أنت مدرب Calisthenics محترف متخصص في GST (Gymnastics Strength Training) وتصميم الخطط الأسبوعية الاحترافية. تعرف كيف توزع القوة والمهارات والتحمل عبر الأسبوع لتحقيق تطور مستمر دون إرهاق أو إصابة.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit — غالبيتهم رجال (18-40 سنة)، مستوى متوسط إلى متقدم
المدة: ${days} أيام من ${startDate}
المستوى: ${difficulty}
═══════════════════════════════

**أنواع الجلسات:**
▶ strength: قوة وزن الجسم (Pull-up, Dips, HSPU, Pistol Squat) — مجموعات ثقيلة × تكرارات منخفضة
▶ skills: مهارات جمناستيكية (Handstand, Planche, Front Lever, Muscle-up) — جودة لا كمية
▶ endurance: تحمل (تكرارات عالية، EMOM، دوائر) — ضغط على القلب والأوعية
▶ mixed: مختلط (قوة + مهارات + تحمل) — الجلسة الأكثر شمولاً
▶ hiit: تدريب متقطع عالي الكثافة (Tabata، intervals) — حرق وقوة متفجرة

**فلسفة التوزيع الاحترافي للأسبوع:**
يوم 1 (قوة الجزء العلوي): Pull + Push بحجم عالٍ
يوم 2: راحة كاملة أو active recovery (مشي + تمطيط)
يوم 3 (مهارات): Handstand + Front Lever + Core — جودة مطلقة
يوم 4 (تحمل/HIIT): تكرارات عالية أو circuits
يوم 5: راحة نشطة (mobility + light movement)
يوم 6 (مختلط): قوة + مهارة + cardio
يوم 7: راحة كاملة — إلزامية

**جدول التدرج الأسبوعي:**
جلسة قوة بعد جلسة قوة: زد تكرار واحد أو مجموعة واحدة
جلسة مهارات: ابقَ على نفس الهدف لأسبوعين قبل الرفع
مهارة جديدة: ابدأ من أسهل regression حتى تُتقن 3×10 ث قبل التطور

${recentContext}
**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان الجلسة — واضح ومحدد",
      "sessionType": "strength | skills | endurance | mixed | hiit",
      "focus": "الجزء العلوي | الجزء السفلي | كامل الجسم | المهارات",
      "difficulty": "${difficulty}",
      "totalDuration": 60,
      "equipment": ["عارضة سحب", "أرضية"],
      "coachNote": "هدف الجلسة + الاستراتيجية + ما تركز عليه اليوم",
      "warmup": {
        "duration": 10,
        "exercises": [
          { "name": "دوائر الكتف", "nameEn": "Shoulder Circles", "sets": 1, "reps": "20 × كل اتجاه", "rest": "بدون", "notes": "تنشيط مفصلي" },
          { "name": "Scapular Pull-ups", "nameEn": "Scapular Pull-ups", "sets": 2, "reps": "8", "rest": "30 ث", "notes": "تفعيل لوح الكتف" },
          { "name": "Hollow Body", "nameEn": "Hollow Body Hold", "sets": 2, "reps": "20 ث", "rest": "30 ث", "notes": "تنشيط الوسط" }
        ]
      },
      "skillWork": {
        "title": "عمل المهارة — جودة قبل الكمية",
        "duration": 12,
        "exercises": [
          { "name": "اسم المهارة", "nameEn": "Skill Name", "sets": 5, "hold": "10-15 ث", "rest": "60 ث", "notes": "تقنية مهمة", "regression": "نسخة أسهل للمبتدئين", "progression": "الخطوة التالية" }
        ]
      },
      "mainWork": {
        "title": "عنوان العمل الرئيسي",
        "format": "وصف التنسيق والأسلوب",
        "duration": 25,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "sets": 4, "reps": "6-8", "rest": "90 ث", "notes": "نقطة تقنية", "regression": "نسخة أسهل", "progression": "نسخة أصعب" }
        ]
      },
      "metcon": {
        "format": "AMRAP | للوقت | EMOM | تابطا",
        "duration": 10,
        "timecap": 12,
        "exercises": [
          { "name": "اسم التمرين", "nameEn": "Exercise Name", "reps": "10", "notes": "scaling للمستويات" }
        ]
      },
      "cooldown": {
        "duration": 8,
        "stretches": [
          { "name": "اسم التمطيط", "duration": "60 ث", "focus": "المنطقة المستهدفة" }
        ]
      },
      "progressionNote": "كيفية التطور في الأسبوع القادم — محدد وعملي"
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع، الهدف التراكمي، كيف تتكامل الجلسات",
  "weeklyFocus": "مهارة الأسبوع أو التركيز الرئيسي (مثال: هذا الأسبوع نطور الـ Handstand)"
}

**ملاحظات مهمة:**
- أيام الراحة: isRest: true، mainWork.exercises: []، warmup.exercises: []، cooldown.stretches: []
- جميع التمارين بوزن الجسم فقط — لا أثقال حديدية
- skillWork: اجعله حاضراً في كل جلسة (حتى 5-8 دقائق مفيدة)
- cooldown: إلزامي في كل جلسة — تمطيط الصدر + الظهر + الرسغ
- في كل تمرين: regression للمبتدئين وprogression للمتقدمين
- لا يومين قوة متتاليين — احترم التعافي العضلي`;

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
