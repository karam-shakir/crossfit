import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getGymProfile, getGymSessions, getMemberById, upsertGymSession, deleteGymSessionsByMember } from '@/lib/db';
import { todaySA } from '@/lib/timezone';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

const GOAL_LABELS: Record<string, string> = {
  weight_loss:    'خسارة الوزن — تمارين دائرية، كارديو، راحة قصيرة',
  muscle_gain:    'بناء العضلة — أحمال ثقيلة، مجموعات عالية، بروتين كافٍ',
  strength:       'القوة — compound ثقيلة، مجموعات قليلة، راحة طويلة',
  general_fitness:'لياقة عامة — تنويع التمارين، تحمل + قوة',
  body_recomp:    'إعادة تشكيل الجسم — قوة + كارديو متوازن',
};

const SPLIT_BY_DAYS: Record<number, string> = {
  3: 'Full Body (كامل الجسم) — 3 أيام',
  4: 'Upper / Lower — يومان أعلى + يومان أسفل',
  5: 'Push / Pull / Legs — PPL',
  6: 'Push / Pull / Legs × 2 — PPL مزدوج',
};

function buildDates(fromDate: string, days: number) {
  const result: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(fromDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    result.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }
  return result;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { memberId, fromDate } = body;

  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const startDate = fromDate || todaySA();
  const member = await getMemberById(memberId);
  const profile = await getGymProfile(memberId);

  if (!profile) return NextResponse.json({ error: 'العضو لا يملك بروفايل تدريبي — اطلب منه تعبئة البروفايل أولاً' }, { status: 400 });

  const dates = buildDates(startDate, profile.daysPerWeek + Math.floor(profile.daysPerWeek / 3));
  const recentSessions = await getGymSessions(memberId);
  const last4 = recentSessions.slice(0, 4).map(s => ({
    date: s.date, split: s.splitType, focus: s.focus,
    exercises: s.exercises.map(e => e.nameEn).join(', '),
  }));

  const prompt = `أنت مدرب لياقة بدنية محترف ومبرمج بطولات، متخصص في أجهزة Technogym وتدريب الصالات الرياضية. مهمتك تصميم جدول أسبوعي مخصص لمتدرب محدد بناءً على بروفايله الشخصي.

═══════════════════════════════
الصالة: مجموعة المطانيخ — قسم الجيم
الأجهزة: Technogym (كاملة)
═══════════════════════════════

**بروفايل المتدرب:**
الاسم: ${member?.nameAr || 'المتدرب'}
الهدف: ${GOAL_LABELS[profile.goal] || profile.goal}
المستوى الحالي: ${profile.level === 'beginner' ? 'مبتدئ' : profile.level === 'intermediate' ? 'متوسط' : profile.level === 'advanced' ? 'متقدم' : 'محترف'}
العمر: ${profile.age ? profile.age + ' سنة' : 'غير محدد'}
الوزن: ${profile.weight ? profile.weight + ' كجم' : 'غير محدد'}
الطول: ${profile.height ? profile.height + ' سم' : 'غير محدد'}
أيام التدريب: ${profile.daysPerWeek} أيام/أسبوع
مناطق التركيز: ${profile.focusAreas.length ? profile.focusAreas.join(' + ') : 'كامل الجسم'}
${profile.limitations ? `قيود/إصابات: ${profile.limitations}` : ''}

**نوع التقسيم المناسب:**
${SPLIT_BY_DAYS[profile.daysPerWeek] || SPLIT_BY_DAYS[3]}

**تحليل آخر الجلسات (تجنّب تكرار نفس التمارين والمجموعات العضلية):**
${last4.length ? JSON.stringify(last4, null, 2) : 'لا توجد جلسات سابقة — هذا أول جدول للمتدرب'}

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

**أجهزة Technogym المتاحة والتمارين:**

🏋️ القوة الحرة:
- barbell-squat | Back Squat | الساق الكاملة
- barbell-deadlift | Deadlift | الخلفية الكاملة
- barbell-bench | Bench Press | الصدر
- barbell-row | Bent Over Row | الظهر
- barbell-ohp | Overhead Press | الكتفين
- smith-squat | Smith Machine Squat | الساق
- smith-bench | Smith Machine Bench | الصدر
- dumbbell-curl | Dumbbell Curl | البايسبس
- dumbbell-extension | Dumbbell Tricep Extension | الترايسبس
- dumbbell-lateral | Lateral Raise | الكتف الجانبي
- dumbbell-fly | Dumbbell Fly | الصدر
- dumbbell-row | Single Arm Row | الظهر

💪 أجهزة Technogym:
- leg-press | Leg Press | الساق الأمامية
- leg-extension | Leg Extension | الرباعية
- leg-curl | Leg Curl | الخلفية الفخذ
- hack-squat | Hack Squat | الساق
- hip-thrust | Hip Thrust Machine | المؤخرة
- calf-raise | Calf Raise Machine | الساق السفلى
- lat-pulldown | Lat Pulldown | الظهر العلوي
- seated-row | Seated Cable Row | الظهر الأوسط
- cable-row | Cable Row | الظهر
- chest-press | Chest Press Machine | الصدر
- pec-deck | Pec Deck | الصدر الداخلي
- cable-fly | Cable Crossover | الصدر
- shoulder-press | Shoulder Press Machine | الكتف
- cable-lateral | Cable Lateral Raise | الكتف الجانبي
- rear-delt | Rear Delt Machine | الكتف الخلفي
- bicep-machine | Bicep Curl Machine | البايسبس
- tricep-pushdown | Tricep Pushdown | الترايسبس
- tricep-overhead | Overhead Cable Tricep | الترايسبس
- ab-crunch | Ab Crunch Machine | البطن
- cable-crunch | Cable Crunch | البطن
- back-extension | Back Extension | أسفل الظهر
- hip-abduction | Hip Abduction | الورك الخارجي
- hip-adduction | Hip Adduction | الورك الداخلي

🏃 الكارديو:
- treadmill | Treadmill | القلب والتحمل
- bike | Stationary Bike | القلب والتحمل
- elliptical | Elliptical | القلب والتحمل
- rower | Rowing Machine | كامل الجسم

**══ فلسفة البرمجة ══**

اعتمد على:
1. **Progressive Overload**: زيادة الحمل تدريجياً عبر الأسبوع
2. **مبدأ SRA** (Stimulus-Recovery-Adaptation): لا تكرر نفس المجموعة العضلية يومين متتاليين
3. **تناوب الشدة**: ثقيل → متوسط → خفيف → ثقيل
4. **الهدف أولاً**: ${GOAL_LABELS[profile.goal]}

**══ معايير الأوزان لكل مستوى ══**

Leg Press: مبتدئ 60كجم | متوسط 100كجم | متقدم 150كجم | محترف 200كجم+
Bench Press: مبتدئ 30كجم | متوسط 60كجم | متقدم 90كجم | محترف 120كجم+
Lat Pulldown: مبتدئ 30كجم | متوسط 50كجم | متقدم 70كجم | محترف 90كجم+
Shoulder Press: مبتدئ 20كجم | متوسط 40كجم | متقدم 60كجم | محترف 80كجم+
Deadlift: مبتدئ 40كجم | متوسط 80كجم | متقدم 120كجم | محترف 160كجم+
Seated Row: مبتدئ 30كجم | متوسط 50كجم | متقدم 70كجم | محترف 90كجم+

أرجع JSON بهذا التنسيق فقط بدون أي نص خارجه:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "splitType": "Push | Pull | Legs | Upper | Lower | Full Body | Rest",
      "title": "عنوان يوم التمرين",
      "focus": "الصدر والكتف والترايسبس",
      "isRest": false,
      "duration": 60,
      "warmup": [
        "5 دقائق على التريدميل بسرعة 6 كم/ساعة — تنشيط القلب",
        "Arm Circles 30 ث — تفعيل الكتف"
      ],
      "exercises": [
        {
          "machineId": "chest-press",
          "nameAr": "جهاز ضغط الصدر",
          "nameEn": "Chest Press Machine",
          "muscleGroup": "الصدر",
          "sets": 4,
          "notes": "كوع بزاوية 90 درجة — ظهر ملاصق للكرسي",
          "levels": {
            "beginner":     {"weight": "30كجم", "reps": "12",  "rest": "60 ث",  "cue": "حركة بطيئة — 3 ث نزول"},
            "intermediate": {"weight": "50كجم", "reps": "10",  "rest": "75 ث",  "cue": "اضغط الصدر في الأعلى"},
            "advanced":     {"weight": "70كجم", "reps": "8",   "rest": "90 ث",  "cue": "Drop Set في المجموعة الأخيرة"},
            "elite":        {"weight": "90كجم", "reps": "6",   "rest": "120 ث", "cue": "Pause 1ث عند أقل نقطة"}
          }
        }
      ],
      "cooldown": [
        "تمطيط الصدر على إطار الباب — 45 ث",
        "Cross-body shoulder stretch — 30 ث لكل جانب"
      ],
      "coachNote": "نصيحة مخصصة لهذا اليوم تحديداً",
      "notes": "ملاحظات الجلسة — الهدف الزمني والاستراتيجية"
    }
  ],
  "weekSummary": "ملخص الأسبوع وفلسفة التوزيع",
  "progressionNote": "كيف يتقدم المتدرب الأسبوع القادم — ما الذي يزيده"
}

**قواعد صارمة:**
- استخدم machineId من القائمة فقط
- كل تمرين يجب أن يحتوي على levels بالمستويات الأربعة مع weight + reps + rest + cue
- أيام الراحة: isRest: true وexercises: [] وwarmup: [] وcooldown: []
- الإحماء: 2-3 عناصر نصية (string) وليس objects
- التهدئة: 2-3 إطالات نصية مرتبطة بعضلات اليوم
- عدد التمارين لكل جلسة: 4-6 تمارين حسب الـ split
- لا تكرر نفس التمارين التي ظهرت في الجلسات السابقة
- راعِ القيود والإصابات: ${profile.limitations || 'لا يوجد'}
- الهدف الرئيسي: ${GOAL_LABELS[profile.goal]}

أرجع JSON فقط بدون أي نص قبله أو بعده.`;

  const maxTokens = Math.min(32000, Math.max(16000, profile.daysPerWeek * 3500));

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    let result: any;
    try {
      result = JSON.parse(jsonText);
    } catch {
      // JSON was truncated — try to salvage complete sessions array
      const match = jsonText.match(/"sessions"\s*:\s*(\[[\s\S]*)/);
      if (!match) throw new Error('فشل تحليل JSON — حاول مرة أخرى');
      let arr = match[1];
      // Find last complete object ending with }
      const lastBrace = arr.lastIndexOf('},');
      if (lastBrace === -1) throw new Error('لم يكتمل توليد الجدول — حاول مرة أخرى');
      arr = arr.slice(0, lastBrace + 1) + ']';
      result = { sessions: JSON.parse(arr) };
    }

    // حفظ الجلسات في قاعدة البيانات
    const toDate = dates[dates.length - 1].date;
    await deleteGymSessionsByMember(memberId, startDate, toDate);

    for (const s of result.sessions || []) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      await upsertGymSession({
        ...s,
        id,
        memberId,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ...result, memberId, fromDate: startDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
