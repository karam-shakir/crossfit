import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAllCalisthenicsSessions } from '@/lib/db';

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
  } = body;

  // جلب آخر 4 جلسات Calisthenics للسياق التاريخي
  const allCalis = await getAllCalisthenicsSessions();
  const recentCalis = allCalis
    .filter((s: any) => date ? s.date < date : true)
    .slice(0, 4)
    .map((s: any) => ({
      date: s.date,
      sessionType: s.sessionType || s.sessionData?.sessionType,
      focus: s.sessionData?.focus || s.focus,
      title: s.sessionData?.title || s.title,
      mainExercises: (s.sessionData?.mainWork?.exercises || []).map((e: any) => e.nameEn || e.name).filter(Boolean).slice(0, 4).join(', '),
    }));
  const recentContext = recentCalis.length > 0
    ? `\n**الجلسات السابقة (نوّع التركيز العضلي والنوع — تجنب نفس التمارين مباشرة):**\n${JSON.stringify(recentCalis, null, 2)}\n`
    : '';

  const SESSION_TYPES: Record<string, string> = {
    strength:  'قوة — بناء القوة المطلقة بحركات الوزن الذاتي',
    skills:    'مهارات — تطوير مهارات جمناستيكية (وقوف على يدين، ليفر، بلانش)',
    endurance: 'تحمل — عدد تكرارات عالٍ وراحة قصيرة',
    mixed:     'مختلط — مزيج من القوة والمهارات والتحمل',
    hiit:      'HIIT — تدريب متقطع عالي الكثافة بحركات وزن الجسم',
  };

  const prompt = `أنت مدرب Calisthenics محترف بخبرة أكثر من 10 سنوات، متخصص في Gymnastics Strength Training (GST) وStreet Workout التنافسي. تبرمج بأسلوب علمي يجمع بين تطوير المهارات وبناء القوة الوظيفية وتحسين التحمل.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
═══════════════════════════════

**Calisthenics — الحركات المتاحة حسب الفئة:**
▶ الضغط (Push): Push-up, Pike Push-up, Dips, Handstand Push-up, Diamond Push-up, Archer Push-up
▶ السحب (Pull): Pull-up, Chin-up, Muscle-up, Australian Pull-up, Front Lever Row, Typewriter Pull-up
▶ الجوهر (Core): L-sit, Tuck L-sit, Dragon Flag, Hollow Body, V-up, Hanging Knee Raise, Toes-to-Bar
▶ الأرجل (Legs): Pistol Squat, Shrimp Squat, Nordic Curl, Bulgarian Split Squat, Box Jump, Burpee
▶ المهارات (Skills): Handstand, Planche Lean, Frog Stand, Front Lever, Back Lever, Human Flag

**جدول التدرج للمهارات الرئيسية:**
Handstand: Wall Hold (30ث) → Kick-up (5 تكرارات) → Free HS (5ث) → HS Walk (5م)
Muscle-up: Chest-to-Bar Pull-up (5) → Negative MU → Band-Assisted MU → Strict MU → Kipping MU
Front Lever: Tuck (10ث) → Advanced Tuck (8ث) → One Leg (5ث) → Straddle (3ث) → Full (2ث)
Planche: Frog Stand (30ث) → Tuck Planche (5ث) → Advanced Tuck (3ث) → Straddle (2ث)

${recentContext}
**الجلسة المطلوبة:**
- نوع الجلسة: ${sessionType} → ${SESSION_TYPES[sessionType] || sessionType}
- مستوى الصعوبة: ${difficulty}
- التركيز: ${focus}
- التاريخ: ${date || 'اليوم'}

**فلسفة الإحماء لـ Calisthenics:**
- حركات مفصلية (3 دقائق): رقبة، كتف، معصم، ورك، ركبة، كاحل
- تفعيل عضلي (4 دقائق): Scapular Pull-ups، Wall Slides، Hip Circles، Hollow Body hold خفيف
- رفع درجة الحرارة (3 دقائق): Jumping Jacks، Inchworm، Bear Crawl

**قواعد البرمجة:**
- القوة: 4-5 مجموعات × 3-6 تكرارات، راحة 90-120 ث بين المجموعات
- المهارات: 5-8 مجموعات × إمساك 3-10 ث أو 2-5 تكرارات، راحة 60-90 ث
- التحمل: تكرارات 10-20، راحة 30-45 ث
- HIIT: فترات 20-40 ث عمل × 10-20 ث راحة

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان الجلسة بالعربي — احترافي ومُلهم",
  "sessionType": "${sessionType}",
  "difficulty": "${difficulty}",
  "focus": "${focus}",
  "totalDuration": 60,
  "equipment": ["عارضة سحب", "أرضية مستوية"],
  "warmup": {
    "duration": 10,
    "exercises": [
      {
        "name": "دوائر الكتف",
        "nameEn": "Shoulder Circles",
        "sets": 1,
        "reps": "20 دورة × كل اتجاه",
        "rest": "بدون",
        "notes": "بطيء وواعٍ — تنشيط المفصل الكتفي"
      },
      {
        "name": "Scapular Pull-ups",
        "nameEn": "Scapular Pull-ups",
        "sets": 2,
        "reps": "8",
        "rest": "30 ث",
        "notes": "فعّل لوح الكتف — الجسم مستقيم"
      },
      {
        "name": "Hollow Body خفيف",
        "nameEn": "Easy Hollow Body",
        "sets": 2,
        "reps": "20 ث",
        "rest": "30 ث",
        "notes": "أسفل الظهر ملتصق بالأرض — تنشيط الوسط"
      }
    ]
  },
  "skillWork": {
    "title": "عمل المهارات — تطوير الحركات التقنية",
    "duration": 12,
    "exercises": [
      {
        "name": "وقوف على الجدار",
        "nameEn": "Wall Handstand",
        "type": "hold",
        "sets": 5,
        "target": "20-30 ث",
        "rest": "60 ث",
        "progression": "الخطوة التالية: Free Handstand Kick-up",
        "regression": "Pike Hold بزاوية 90 درجة للمبتدئين"
      }
    ]
  },
  "mainWork": {
    "title": "عنوان العمل الرئيسي",
    "format": "وصف تنسيق الجلسة",
    "duration": 25,
    "exercises": [
      {
        "name": "عقلة صارمة",
        "nameEn": "Strict Pull-up",
        "sets": 4,
        "reps": "5-8",
        "rest": "90 ث",
        "tempo": "2-1-3-0",
        "cues": "كتفيك مضغوطان لأسفل — صدرك للعارضة — لا تتأرجح",
        "scaling": {
          "easier": "Band-Assisted Pull-up أو Australian Pull-up",
          "harder": "Weighted Pull-up أو Archer Pull-up"
        }
      }
    ]
  },
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
        "notes": "scaling للمبتدئين وللمتقدمين"
      }
    ],
    "scoreType": "كيف يُحسب النتيجة — جولات أو وقت"
  },
  "cooldown": {
    "duration": 8,
    "stretches": [
      {
        "name": "تمطيط الصدر والكتفين",
        "duration": "60 ث",
        "focus": "عضلات الضغط — صدر وأمام الكتف"
      },
      {
        "name": "تمطيط الظهر العلوي",
        "duration": "60 ث",
        "focus": "عضلات السحب — Lats والظهر العلوي"
      },
      {
        "name": "تمطيط الرسغ والساعد",
        "duration": "45 ث × كل يد",
        "focus": "تعافي الرسغ من حمل وزن الجسم"
      }
    ]
  },
  "weeklyPlacement": "متى تُدرج هذه الجلسة بالأسبوع وما قبلها وبعدها",
  "progressionPath": "خطة التطور على 4 أسابيع قادمة — محددة وعملية",
  "nutritionTips": "توصيات غذائية مخصصة لهذا النوع من التدريب",
  "coachNote": "ملاحظة شاملة: هدف الجلسة، كيف تعرف أنك أديت بشكل جيد، الأخطاء الشائعة"
}

**قواعد مهمة:**
- mainWork: يجب أن يكون object بـ {title, format, duration, exercises:[]} وليس array من blocks
- في كل تمرين: اذكر scaling أسهل وأصعب في كل تمرين
- skillWork: ضعها دائماً حتى في جلسات غير skills — حتى 5 دقائق من المهارات مفيدة
- جميع التمارين وزن الجسم فقط — لا أثقال حديدية

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
