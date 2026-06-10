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

  const prompt = `أنت مدرب Kettlebell Athletics محترف ومعتمد من IUKL، متخصص في بناء الخطط الأسبوعية بأسلوب التدرج المنهجي. تعرف كيف توزع الحجم والشدة عبر الأسبوع لتحقيق أقصى تكيّف مع أدنى خطر إصابة.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
المدة: ${days} أيام من ${startDate}
المستوى: ${difficulty}
═══════════════════════════════

**أنواع الجلسات:**
▶ biathlon: Jerk (أداتان) + Snatch (أداة واحدة) — الحدث التنافسي الكلاسيكي
▶ snatch: Snatch فقط — تحسين التقنية والتحمل الخاص
▶ longcycle: Clean + Jerk (أداتان) — القوة والتنسيق
▶ strength: تدريب قوة KB (Swing, Deadlift, Press, Squat) — بناء الأساس
▶ conditioning: دوائر تدريبية (Swing + Goblet Squat + Turkish Get-Up)

**فلسفة توزيع الأسبوع:**
يوم 1 (حجم عالٍ): مجموعات طويلة بوزن خفيف نسبياً — بناء التحمل
يوم 2: راحة نشطة — تمطيط خاص للمعصم والكتف (إلزامي!)
يوم 3 (شدة عالية): مجموعات قصيرة بوزن أثقل — بناء القوة والسرعة
يوم 4: راحة كاملة — لا تدريب
يوم 5 (تقنية): أوزان خفيفة بتركيز على الشكل — quality over quantity

**جدول الأوزان والـ RPM المرجعي:**
| المستوى | الوزن | Jerk RPM | Snatch RPM | LC RPM |
|---------|-------|----------|------------|--------|
| مبتدئ | 8-12كجم | 6-8 | 8-10 | 5-6 |
| متوسط | 16كجم | 8-10 | 10-12 | 6-8 |
| متقدم | 20-24كجم | 10-12 | 12-14 | 8-10 |
| نخبة | 28-32كجم | 12+ | 14+ | 10+ |

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "isRest": false,
      "title": "عنوان الجلسة — محدد ومعبّر",
      "eventType": "biathlon | snatch | longcycle | strength | conditioning",
      "focus": "التحمل | القوة | التقنية | السرعة | التكييف",
      "difficulty": "${difficulty}",
      "coachNote": "هدف الجلسة + الاستراتيجية + ما تركز عليه اليوم",
      "breathingPattern": "نمط التنفس المقترح: متى تشهق، متى تزفر، الإيقاع الأمثل",
      "warmup": {
        "duration": 12,
        "movements": [
          {"name": "تدوير المعصم", "nameEn": "Wrist Circles", "sets": "2", "reps": "20 دورة", "notes": "إلزامي — يمنع إصابة الرسغ"},
          {"name": "Halo", "nameEn": "KB Halo", "sets": "2", "reps": "8 × كل اتجاه", "notes": "8-12كجم — تنشيط الكتف"},
          {"name": "سوينج خفيف", "nameEn": "Easy Swing", "sets": "2", "reps": "10", "notes": "تفعيل السلسلة الخلفية"}
        ]
      },
      "mainWork": [
        {
          "exercise": "Jerk",
          "exerciseAr": "الجيرك",
          "sets": 5,
          "reps": "5 دقائق",
          "weight": "مبتدئ: 16كجم | متوسط: 24كجم | متقدم: 32كجم",
          "restBetweenSets": "3 دقائق",
          "targetRPM": "مبتدئ: 8 | متوسط: 10 | متقدم: 12",
          "technique": "تثبيت كامل في الأعلى — استرح في Rack — ادفع بالساقين"
        }
      ],
      "techniqueNotes": [
        "نقطة تقنية محددة 1 لهذا الحدث",
        "الخطأ الشائع وكيف تتجنبه",
        "نصيحة متقدمة للمستوى الأعلى"
      ],
      "progressionNote": "في الأسبوع القادم: زد المدة بـ 1-2 دقيقة أو الوزن بمستوى واحد",
      "cooldown": {
        "duration": 10,
        "movements": [
          {"name": "تمطيط الساعد والرسغ", "duration": "90 ث × كل يد"},
          {"name": "تمطيط الكتف", "duration": "60 ث × كل كتف"},
          {"name": "تنفس عميق", "duration": "2 دقيقة"}
        ]
      }
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع، كيف تتكامل الجلسات، والهدف التراكمي",
  "weeklyVolume": "خفيف | متوسط | ثقيل"
}

**ملاحظات مهمة:**
- أيام الراحة: isRest: true، mainWork: []، warmup.movements: []
- mainWork: مصفوفة مباشرة (بدون block wrapper)
- كل تمرين: exercise, exerciseAr, sets, reps, weight, restBetweenSets, targetRPM, technique
- الأوزان: دائماً اذكر 3 مستويات (مبتدئ | متوسط | متقدم)
- لا يومين متتاليين بنفس الشدة العالية
- يوم الراحة النشطة يشمل تمطيط المعصم والكتف حصراً`;

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
