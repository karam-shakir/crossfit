import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getAllCalisthenicsSessions } from '@/lib/db';
import { parseAiJson } from '@/lib/aiJson';

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
  const {
    fromDate, days = 5,
    coachFocus = 'balanced',    // strength / skills / endurance / mixed / balanced
    skillFocus = '',            // handstand / muscle-up / front-lever / back-lever / planche
    specialNotes = '',
    intensityBias = 'balanced',
    restDays = -1,
    difficulty = 'متوسط',
  } = body;

  const startDate = fromDate || todaySA();

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

  const prompt = `أنت مدرب Calisthenics وGST (Gymnastics Strength Training) محترف. فلسفتك: القوة الوظيفية الحقيقية تُبنى بوزن الجسم — التدرج هو الأداة والتقنية هي الهدف. تصمم خططاً أسبوعية تخدم جميع المستويات في نفس الجلسة.

═══════════════════════════════
النادي: مجموعة المطانيخ Calisthenics
الجمهور: مبتدئون إلى نخبة (18-40 سنة)
المستوى العام: ${difficulty}
التركيز الأسبوعي: ${coachFocus === 'strength' ? '💪 أسبوع قوة — Pull/Push/Dips ثقيل بوزن إضافي' : coachFocus === 'skills' ? '🎯 أسبوع مهارات — تقنية Handstand/Muscle-up/Lever' : coachFocus === 'endurance' ? '🔥 أسبوع تحمل — circuits عالية التكرار، EMOM' : coachFocus === 'mixed' ? '⚡ أسبوع مختلط — قوة + مهارة + تحمل' : 'متوازن — توزيع كلاسيكي'}
${skillFocus ? `مهارة الأولوية هذا الأسبوع: ${skillFocus} — أدرجها في كل جلسة مناسبة كـ skill work` : ''}
${restDays >= 0 ? `أيام الراحة: ${restDays} أيام (تحديد المدرب)` : 'أيام الراحة: الذكاء الاصطناعي يقرر'}
تحيّز الشدة: ${intensityBias === 'heavy' ? 'ثقيل — وزن إضافي أعلى' : intensityBias === 'light' ? 'خفيف — تعاف ومرونة' : intensityBias === 'moderate' ? 'متوسط' : 'متوازن'}
${specialNotes ? `\n📌 تعليمات المدرب:\n${specialNotes}` : ''}
الفلسفة: من Negative Pull-up إلى Muscle-up — كل شيء مبني على الأساس
المدة: ${days} أيام من ${startDate}
المستويات: مبتدئ / متوسط / متقدم / نخبة — كل تمرين يخدمهم جميعاً
═══════════════════════════════

**أنواع الجلسات:**
▶ strength: قوة عضلية (Pull-up, Push-up, Dips, HSPU) — 4-6 تكرارات × 4-5 مجموعات + weighted للمتقدمين
▶ skills: مهارات (Handstand, Front Lever, Muscle-up) — جودة مطلقة + progressions
▶ endurance: تحمل عضلي (circuits عالية التكرار، EMOM)
▶ mixed: قوة + مهارة + cardio جسماني
▶ rest: راحة كاملة أو mobility + foam roll

**══ 4 مستويات في كل جلسة ══**
مبتدئ: Band مساعدة / Negative / تكرار منخفض
متوسط: وزن الجسم Strict
متقدم: وزن إضافي (+5 إلى +15كجم) أو حركة أصعب (Ring)
نخبة: وزن ثقيل (+20كجم) أو حركة الأعلى مستوى (Muscle-up / HSPU Strict / Pistol Loaded)

**فلسفة توزيع الأسبوع:**
يوم PULL: سحب ثقيل (Pull-up / Muscle-up) + Skill حركات الظهر
يوم PUSH: دفع ثقيل (HSPU / Ring Push-up / Planche) + Core قوي
يوم SKILL: 45 دقيقة تقنية بحتة — لا إرهاق، فقط جودة
يوم REST/MOBILITY: تعافٍ نشط أو راحة كاملة
لا يومين Pull أو Push متتاليَين

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
      "title": "عنوان احترافي يعكس الهدف الرئيسي",
      "sessionType": "strength | skills | endurance | mixed | rest",
      "focus": "Pull | Push | Core | Full Body | Skills | Recovery",
      "difficulty": "جميع المستويات",
      "totalDuration": 60,
      "coachNote": "هدف الجلسة + الاستراتيجية + النقطة التقنية الأهم",
      "warmup": {
        "duration": 10,
        "exercises": [
          {
            "name": "Scapular Pull-ups",
            "sets": 2, "reps": "10",
            "rest": "30 ث",
            "notes": "تفعيل لوح الكتف — ضروري قبل كل جلسة سحب",
            "levels": {
              "beginner": "Dead Hang 20 ث × 3",
              "intermediate": "Scapular Pull-ups × 10",
              "advanced": "Scapular Pull-ups + Slow Negative × 5",
              "elite": "نفس المتقدم + False Grip Hold 10 ث"
            }
          }
        ]
      },
      "skillWork": {
        "title": "مهارة اليوم — جودة لا كمية",
        "duration": 12,
        "exercises": [
          {
            "name": "Handstand Hold",
            "sets": 6, "hold": "10-20 ث",
            "rest": "60 ث",
            "notes": "الجسم خط مستقيم — بطن محكم",
            "levels": {
              "beginner": "Wall Handstand — وجه للحائط، 10 ث",
              "intermediate": "Wall Handstand — ظهر للحائط، 15 ث",
              "advanced": "Free Handstand 5-10 ث أو Kick-up × 10",
              "elite": "Free Handstand 20 ث+ أو Handstand Walk 3م"
            },
            "regression": "Pike Hold على الأرض — ابدأ هنا",
            "progression": "Handstand Push-up Negative"
          }
        ]
      },
      "mainWork": {
        "title": "القوة الرئيسية",
        "format": "4 مجموعات × 5 تكرارات — راحة 2 دقيقة",
        "duration": 25,
        "exercises": [
          {
            "name": "Pull-up",
            "sets": 5, "reps": "4-6",
            "rest": "120 ث",
            "notes": "Strict فقط — لا kipping في القوة",
            "levels": {
              "beginner": "Band مساعدة 20كجم × 5×5 أو Negative 5×3 ث",
              "intermediate": "Strict Pull-up وزن الجسم × 5×5",
              "advanced": "+10كجم حزام × 5×4 — Pause 1 ث في الأعلى",
              "elite": "+20كجم حزام × 4×3 — Tempo 2-1-3"
            },
            "regression": "Jumping Pull-up مع Negative بطيء",
            "progression": "Muscle-up Negatives"
          }
        ]
      },
      "metcon": {
        "format": "AMRAP 10 دقائق",
        "duration": 10,
        "timecap": 10,
        "exercises": [
          {
            "name": "Push-up",
            "reps": "10",
            "notes": "مبتدئ: Knee | متوسط: Strict | متقدم: Ring Push-up | نخبة: Archer Push-up"
          }
        ]
      },
      "cooldown": {
        "duration": 8,
        "stretches": [
          { "name": "Lat Doorway Stretch", "duration": "60 ث", "focus": "Lat + Shoulder Flexion" },
          { "name": "Wrist Flexion & Extension", "duration": "45 ث", "focus": "الرسغ — ضروري في Calisthenics" }
        ]
      },
      "progressionNote": "للأسبوع القادم: زد تكراراً واحداً أو مجموعة واحدة أو قلل المساعدة"
    }
  ],
  "weekSummary": "فلسفة الأسبوع: التوزيع، الهدف، كيف تتكامل الجلسات",
  "weeklyFocus": "مهارة الأسبوع أو التركيز الرئيسي"
}

**قواعد صارمة:**
- كل تمرين في mainWork وskillWork له levels بـ 4 مستويات
- الوزن الإضافي للمتقدمين والنخبة: حزام ثقل أو صدرية — لا أثقال حديد أخرى
- لا يومين Pull أو Push متتاليَين
- أيام الراحة: isRest: true وكل المصفوفات فارغة
- skillWork في كل جلسة (حتى 8-10 دقائق مفيدة)
- cooldown: ضروري — تمطيط الرسغ والكتف والـ Lat

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = parseAiJson(jsonText, 'sessions');

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
