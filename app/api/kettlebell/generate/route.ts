import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAllKettlebellSessions } from '@/lib/db';

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

  // جلب آخر 4 جلسات Kettlebell للسياق التاريخي
  const allKB = await getAllKettlebellSessions();
  const recentKB = allKB
    .filter((s: any) => date ? s.date < date : true)
    .slice(0, 4)
    .map((s: any) => ({
      date: s.date,
      eventType: s.eventType || s.sessionData?.eventType,
      title: s.sessionData?.title || s.title,
      exercises: (s.sessionData?.mainWork || []).map((e: any) => e.exercise || e.movement).filter(Boolean).join(', '),
      focus: s.sessionData?.focus || s.focus,
    }));
  const recentContext = recentKB.length > 0
    ? `\n**الجلسات السابقة (نوّع الحدث والتركيز — تجنب نفس الحدث مرتين متتاليتين):**\n${JSON.stringify(recentKB, null, 2)}\n`
    : '';

  const prompt = `أنت مدرب Kettlebell Athletics محترف ومعتمد من IUKL (الاتحاد الدولي لرياضة الكيتل بيل)، بخبرة في تدريب الرياضيين على المستوى التنافسي. تعرف الفارق بين Girevoy Sport (GS) وHardstyle، وتبرمج بدقة علمية.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
═══════════════════════════════

**Kettlebell Athletics — الأحداث الرسمية:**
▶ Biathlon: Jerk ثم Snatch، كل حدث 10 دقائق متواصلة، أداة واحدة أو زوج
▶ Long Cycle: Clean + Jerk بكيتل بيلَين، 10 دقائق متواصلة
▶ Snatch: انتزاع بيد واحدة، تبادل اليد مرة واحدة فقط، 10 دقائق
▶ Strength: تدريب قوة تقليدي بالكيتل بيل (Deadlift, Squat, Press, Swing)
▶ Conditioning: دوائر تدريبية لتحسين التحمل والقوة المتفجرة

**جدول الأوزان القياسية (IUKL):**
| الفئة | مبتدئ | متوسط | متقدم | Rank I | CMS | MS |
|-------|-------|-------|-------|--------|-----|-----|
| الوزن | 8-12كجم | 16كجم | 20-24كجم | 24كجم | 28كجم | 32كجم |

**جدول RPM المرجعي (IUKL Official):**
| المستوى | Jerk RPM | Snatch RPM | Long Cycle RPM |
|---------|----------|------------|----------------|
| مبتدئ | 6-8 | 8-10 | 5-6 |
| متوسط | 8-10 | 10-12 | 6-8 |
| متقدم (Rank I) | 10-12 | 12-14 | 8-10 |
| CMS | 12-14 | 14-16 | 10-12 |
| MS (ماستر) | 14+ | 16+ | 12+ |

${recentContext}
**الجلسة المطلوبة:**
- نوع الحدث: ${eventType}
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}

**فلسفة الإحماء لـ Kettlebell:**
- تدوير المعصمَين والكوعَين والكتفَين: 15-20 دورة لكل اتجاه
- Halo بوزن خفيف: تنشيط حزام الكتف
- Deadlift بوزن خفيف: تفعيل السلسلة الخلفية
- Swing هادئ: ربط الورك والظهر

**قاعدة الإمساك في Girevoy Sport:**
- Open hand: الإمساك بالأصابع فقط (ليس راحة اليد) لتقليل إرهاق الرسغ
- قفازات اختياريات للمنافسة
- تبديل اليد في Snatch: مرة واحدة فقط خلال الـ 10 دقائق

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان الجلسة بالعربي — احترافي ومحدد",
  "eventType": "${eventType}",
  "difficulty": "${difficulty}",
  "totalDuration": 60,
  "warmup": {
    "duration": 15,
    "movements": [
      {"name": "تدوير المعصم والكوع", "nameEn": "Wrist & Elbow Circles", "sets": "2", "reps": "20 دورة", "notes": "لكل اتجاه — يمين ويسار — تنشيط إلزامي قبل أي تمرين KB"},
      {"name": "هالو بالكيتل بيل", "nameEn": "KB Halo", "sets": "2", "reps": "10 × كل اتجاه", "notes": "وزن خفيف (8-12كجم) — تنشيط حزام الكتف"},
      {"name": "سوينج هادئ", "nameEn": "Easy Swing", "sets": "3", "reps": "10", "notes": "70% من الطاقة — ربط الورك والظهر وتصحيح التوقيت"},
      {"name": "رفع ميت خفيف", "nameEn": "Light Deadlift", "sets": "2", "reps": "8", "notes": "تفعيل السلسلة الخلفية — ظهر مستقيم"}
    ]
  },
  "mainWork": [
    {
      "exercise": "Jerk",
      "exerciseAr": "الجيرك",
      "weight": "مبتدئ: 16كجم | متوسط: 24كجم | متقدم: 32كجم",
      "sets": 5,
      "reps": "10 دقائق متواصلة",
      "restBetweenSets": "5 دقائق",
      "targetRPM": "مبتدئ: 6-8 | متوسط: 10-12 | متقدم: 14+",
      "technique": "الانتقال السلس من Rack إلى Lockout — ادفع بقوة الساقين — تثبيت كامل في الأعلى قبل العودة"
    }
  ],
  "gripwork": {
    "note": "استخدم open hand grip — أصابع فقط بدون راحة اليد — قلّل ضغط الإمساك لتأجيل الإرهاق",
    "exercises": [
      {"name": "Dead Hang", "sets": "3", "reps": "30-45 ث"},
      {"name": "تقوية الأصابع", "sets": "2", "reps": "20 عصر"}
    ]
  },
  "cooldown": [
    {"name": "تمطيط الساعد والرسغ", "duration": "90 ث × كل يد", "focus": "تعافي الرسغ من الضغط التراكمي"},
    {"name": "تمطيط الكتف والصدر", "duration": "60 ث", "focus": "إرخاء حزام الكتف بعد الجيرك"},
    {"name": "Child's Pose", "duration": "90 ث", "focus": "إطالة الظهر السفلي والورك"},
    {"name": "تنفس عميق", "duration": "2 دقيقة", "focus": "خفض معدل القلب وإعادة التوازن"}
  ],
  "techniqueNotes": [
    "نقطة تقنية 1 — محددة وعملية لهذا الحدث",
    "نقطة تقنية 2 — الخطأ الشائع وكيف تتجنبه",
    "نقطة تقنية 3 — نصيحة من المدرب المحترف"
  ],
  "breathingPattern": "وصف دقيق لنمط التنفس: متى تشهق، متى تزفر، وكيف تحافظ على إيقاع منتظم طوال الـ 10 دقائق",
  "coachNote": "ملاحظة شاملة من المدرب: هدف الجلسة، كيف تعرف أنك على المسار الصحيح، علامات الأداء الجيد",
  "progressionNote": "في الجلسة القادمة: كيف تزيد الوزن أو RPM أو المدة — التدرج الصحيح والآمن"
}

**قواعد مهمة:**
- totalDuration يجب أن يكون رقماً بالدقائق
- mainWork: مصفوفة مباشرة من التمارين (بدون block wrapper)
- كل تمرين في mainWork يحتوي على: exercise, exerciseAr, weight, sets, reps, restBetweenSets, targetRPM, technique
- الأوزان: اذكر 3 مستويات دائماً (مبتدئ | متوسط | متقدم)
- RPM: اذكر range لكل مستوى
- الإحماء: ركز على المعصم والكتف والسلسلة الخلفية

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
