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

function buildDates(fromDate: string, count: number) {
  const result: { date: string; dayName: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(fromDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    result.push({ date: d.toISOString().split('T')[0], dayName: DAY_NAMES[d.getDay()] || '' });
  }
  return result;
}

function getSplitPlan(days: number): string {
  switch (days) {
    case 3: return `تقسيم Full Body — 3 جلسات كامل الجسم:
      يوم A (ثقيل): Squat محور + Bench + Row + Shoulder + Bicep
      يوم B (متوسط): Deadlift محور + Press + Pulldown + Lateral + Tricep
      يوم C (خفيف/Volume): Leg Press + Cable work + Isolation + Core`;
    case 4: return `تقسيم Upper / Lower — يومان أعلى + يومان أسفل:
      Upper A (ثقيل — قوة): Bench ثقيل + Row + OHP + Pulldown + Arms
      Lower A (ثقيل — قوة): Squat/Hack Squat ثقيل + RDL + Leg Curl + Calf
      Upper B (حجم — Volume): Inc Press + Chest Fly + Cable Row + Lateral + Arms
      Lower B (حجم — Volume): Leg Press عالي + Leg Extension + Hip Thrust + Abductor`;
    case 5: return `تقسيم Push / Pull / Legs — PPL كلاسيكي:
      Push: Chest Press + Inc Press + Fly + Shoulder Press + Lateral + Tricep x2
      Pull: Lat Pulldown + Seated Row + Cable Row + Bicep x2 + Rear Delt + Shrugs
      Legs: Squat/Hack + Leg Press + Leg Curl + Leg Ext + Hip Thrust + Calf + Abductor
      Upper (تعويض): Chest Cable + Row + Lateral + Arms
      Core/Cardio: تمارين البطن + HIIT أو Steady-state`;
    case 6: return `تقسيم PPL مزدوج — Push A/B + Pull A/B + Legs A/B:
      Push A (قوة — ثقيل): Bench ثقيل 4-6 reps + OHP + Dips/Tricep Heavy
      Push B (حجم — خفيف): Inc Press + Pec Deck + Cable Fly + Lateral + Tricep Volume
      Pull A (قوة — ثقيل): Barbell Row + Weighted Pulldown + Shrugs + Bicep Heavy
      Pull B (حجم — خفيف): Seated Row + Cable Row + Rear Delt + Bicep Volume
      Legs A (رباعية محور): Squat/Hack Squat ثقيل + Leg Press + Leg Ext + Calf
      Legs B (ورك وخلفية محور): Deadlift/RDL + Leg Curl + Hip Thrust + Abductor`;
    default: return 'Full Body — 3 جلسات';
  }
}

function getGoalProtocol(goal: string): string {
  switch (goal) {
    case 'weight_loss': return `بروتوكول خسارة الوزن:
      • الحجم: 15-20 مجموعة/عضلة/أسبوع
      • الشدة: 12-20 تكرار، راحة 30-60 ث
      • الكارديو: 10-15 دقيقة HIIT أو 20 دقيقة Steady-state في نهاية الجلسة
      • الأسلوب: Supersets و Circuits لرفع معدل القلب
      • الوزن: 60-70% من 1RM — التركيز على حرق السعرات
      • أضف 5-10 دقيقة كارديو في نهاية كل جلسة`;
    case 'muscle_gain': return `بروتوكول بناء العضلة (Hypertrophy):
      • الحجم: 12-20 مجموعة/عضلة/أسبوع
      • الشدة: 8-12 تكرار، راحة 60-90 ث
      • الأسلوب: Progressive Overload صارم، Mind-Muscle Connection
      • الوزن: 65-80% من 1RM — رسالة ميكانيكية عالية
      • التقنية: Tempo 3-1-2 (3 ث نزول - 1 ث توقف - 2 ث صعود)
      • المجموعات: 3-5 مجموعات لكل تمرين`;
    case 'strength': return `بروتوكول القوة (Strength):
      • الحجم: 10-15 مجموعة/عضلة/أسبوع
      • الشدة: 3-6 تكرار، راحة 2-4 دقائق
      • الأسلوب: الحركات المركبة أولاً، شدة عالية 80-95% 1RM
      • ركّز على: Squat + Deadlift + Bench + Row + OHP
      • Warm-up Sets: 50% × 5, 70% × 3, 85% × 1 قبل العمل الفعلي
      • كل أسبوع: زد الوزن 2.5-5 كجم على الحركات الرئيسية`;
    case 'body_recomp': return `بروتوكول إعادة التشكيل:
      • الحجم: 12-16 مجموعة/عضلة/أسبوع
      • الشدة: 8-15 تكرار، راحة 60-75 ث
      • الأسلوب: تنويع بين compound و isolation
      • وزن البدن: كافٍ لحافز عضلي مع عجز سعرات معتدل
      • أضف 10 دقيقة كارديو خفيف في نهاية جلسات الساق
      • قياس: التقدم بالصور والقياسات لا الميزان فقط`;
    case 'general_fitness': return `بروتوكول اللياقة العامة:
      • الحجم: 10-15 مجموعة/عضلة/أسبوع
      • الشدة: 10-15 تكرار، راحة 45-75 ث
      • الأسلوب: تنويع شامل، حركات متعددة المفاصل
      • الكارديو: 10-15 دقيقة في نهاية الجلسة
      • التنويع: غيّر التمارين كل أسبوع لمنع الملل
      • الهدف: لياقة قلبية + قوة + مرونة`;
    default: return 'بروتوكول لياقة عامة: 10-15 reps, 60-75 ث راحة';
  }
}

function getWeightStandards(gender: string, weight?: number): string {
  const bw = weight || (gender === 'female' ? 65 : 80);
  const isFemale = gender === 'female';
  const f = isFemale ? 0.65 : 1;

  return `جدول أوزان مرجعية (${isFemale ? 'أنثى' : 'ذكر'} — وزن الجسم ${bw}كجم):

┌─────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ التمرين             │ مبتدئ        │ متوسط        │ متقدم        │ محترف        │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Leg Press           │ ${Math.round(50*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(160*f)}كجم       │ ${Math.round(220*f)}كجم+      │
│ Hack Squat          │ ${Math.round(30*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Barbell Squat       │ ${Math.round(40*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Leg Extension       │ ${Math.round(25*f)}كجم        │ ${Math.round(45*f)}كجم        │ ${Math.round(65*f)}كجم        │ ${Math.round(85*f)}كجم+       │
│ Leg Curl            │ ${Math.round(20*f)}كجم        │ ${Math.round(40*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(70*f)}كجم+       │
│ Hip Thrust          │ ${Math.round(30*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(140*f)}كجم+      │
│ Bench Press         │ ${Math.round(30*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(80*f)}كجم        │ ${Math.round(110*f)}كجم+      │
│ Chest Press M.      │ ${Math.round(25*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(75*f)}كجم        │ ${Math.round(100*f)}كجم+      │
│ Incline Press       │ ${Math.round(25*f)}كجم        │ ${Math.round(45*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(95*f)}كجم+       │
│ Lat Pulldown        │ ${Math.round(30*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(90*f)}كجم+       │
│ Seated Row          │ ${Math.round(30*f)}كجم        │ ${Math.round(50*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(90*f)}كجم+       │
│ Barbell Row         │ ${Math.round(35*f)}كجم        │ ${Math.round(60*f)}كجم        │ ${Math.round(85*f)}كجم        │ ${Math.round(115*f)}كجم+      │
│ Shoulder Press M.   │ ${Math.round(20*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(75*f)}كجم+       │
│ OHP (Barbell)       │ ${Math.round(20*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(55*f)}كجم        │ ${Math.round(70*f)}كجم+       │
│ Deadlift            │ ${Math.round(50*f)}كجم        │ ${Math.round(90*f)}كجم        │ ${Math.round(130*f)}كجم       │ ${Math.round(170*f)}كجم+      │
│ Cable Lateral       │ ${Math.round(5*f)}كجم         │ ${Math.round(10*f)}كجم        │ ${Math.round(15*f)}كجم        │ ${Math.round(20*f)}كجم+       │
│ Bicep Machine       │ ${Math.round(15*f)}كجم        │ ${Math.round(25*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(45*f)}كجم+       │
│ Tricep Pushdown     │ ${Math.round(15*f)}كجم        │ ${Math.round(25*f)}كجم        │ ${Math.round(35*f)}كجم        │ ${Math.round(45*f)}كجم+       │
│ Calf Raise          │ ${Math.round(40*f)}كجم        │ ${Math.round(70*f)}كجم        │ ${Math.round(100*f)}كجم       │ ${Math.round(130*f)}كجم+      │
└─────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘`;
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
  if (!profile) return NextResponse.json({ error: 'العضو لا يملك بروفايل تدريبي' }, { status: 400 });

  // إجمالي أيام الأسبوع: أيام التمرين + أيام الراحة المناسبة
  const restDays = profile.daysPerWeek <= 3 ? 4 : profile.daysPerWeek <= 4 ? 3 : profile.daysPerWeek === 5 ? 2 : 1;
  const totalDays = profile.daysPerWeek + restDays;
  const dates = buildDates(startDate, totalDays);

  const recentSessions = await getGymSessions(memberId);
  const recentTraining = recentSessions.slice(0, 6).map(s => ({
    date: s.date,
    split: s.splitType,
    exercises: s.exercises.slice(0, 5).map(e => e.nameEn).join(', '),
  }));

  const gender = (profile as any).gender || 'male';
  const levelAr = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'محترف' }[profile.level] || 'متوسط';
  const bmi = profile.weight && profile.height ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : null;

  const prompt = `أنت خبير برمجة تدريبية معتمد (CSCS, NSCA) ومتخصص في أجهزة Technogym وتدريب الصالات الرياضية بمستوى احترافي عالٍ. مهمتك تصميم برنامج تدريبي أسبوعي متكامل ومخصص بالكامل لهذا المتدرب.

╔══════════════════════════════════════════════╗
║       صالة مجموعة المطانيخ — قسم الجيم      ║
║              أجهزة Technogym الكاملة         ║
╚══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 بروفايل المتدرب الكامل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم: ${member?.nameAr || 'المتدرب'}
الجنس: ${gender === 'female' ? 'أنثى' : 'ذكر'}
العمر: ${profile.age ? profile.age + ' سنة' : 'غير محدد'}
الوزن: ${profile.weight ? profile.weight + ' كجم' : 'غير محدد'}
الطول: ${profile.height ? profile.height + ' سم' : 'غير محدد'}
${bmi ? `BMI: ${bmi}` : ''}
المستوى: ${levelAr}
سنوات الخبرة: ${(profile as any).experienceYears ? (profile as any).experienceYears + ' سنوات' : 'غير محدد'}
الهدف الرئيسي: ${profile.goal}
أيام التدريب: ${profile.daysPerWeek} أيام/أسبوع
مناطق التركيز: ${profile.focusAreas?.length ? profile.focusAreas.join(' + ') : 'كامل الجسم'}
القيود والإصابات: ${profile.limitations || 'لا توجد قيود'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 بروتوكول الهدف
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getGoalProtocol(profile.goal)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 هيكل الأسبوع التدريبي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getSplitPlan(profile.daysPerWeek)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 جلسات الأسبوع السابق (تجنّب التكرار)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recentTraining.length ? recentTraining.map(s => `• ${s.date} | ${s.split} | ${s.exercises}`).join('\n') : 'لا توجد جلسات سابقة — هذا أول أسبوع تدريبي للعضو'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 الأيام المطلوبة لهذا الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dates.map(d => `• ${d.date} — ${d.dayName}`).join('\n')}

وزّع ${profile.daysPerWeek} أيام تمرين و${restDays} أيام راحة على هذه الأيام بذكاء (مثلاً: لا تضع يومي تمرين ثقيل متتاليين بدون راحة)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏋️ قائمة أجهزة وتمارين Technogym الكاملة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🦵 الساق والورك:
leg-press | Leg Press Machine | الرباعية والمؤخرة
leg-extension | Leg Extension | الرباعية (أمام الفخذ)
leg-curl | Lying Leg Curl | بايسبس الفخذ (خلف الفخذ)
hack-squat | Hack Squat Machine | الساق الكاملة - محور الرباعية
hip-thrust | Hip Thrust Machine | المؤخرة (Glutes)
calf-raise | Seated/Standing Calf Raise | الساق السفلى (Calves)
hip-abduction | Hip Abduction Machine | الورك الخارجي (Glutes Med)
hip-adduction | Hip Adduction Machine | الداخلي الفخذ
back-extension | Back Extension Machine | أسفل الظهر والمؤخرة
smith-squat | Smith Machine Squat | الساق الكاملة

🏆 القوة الحرة (Barbell):
barbell-squat | Back Squat | الساق الكاملة - ملك التمارين
barbell-deadlift | Conventional Deadlift | الخلفية الكاملة + أسفل الظهر
barbell-bench | Flat Bench Press | الصدر + الترايسبس + الأمامي الكتف
barbell-row | Bent Over Barbell Row | الظهر الكامل
barbell-ohp | Overhead Press (OHP) | الكتفين الكاملة

🏠 الصدر:
chest-press | Chest Press Machine | الصدر الكامل
pec-deck | Pec Deck / Butterfly | الصدر الداخلي والعلوي
cable-fly | Cable Crossover Fly | الصدر السفلي/الداخلي
smith-bench | Smith Machine Bench | الصدر + تنويع الزاوية
dumbbell-fly | Dumbbell Chest Fly | الصدر (إطالة كاملة)

🔙 الظهر:
lat-pulldown | Lat Pulldown (Wide Grip) | الظهر العلوي العريض
seated-row | Seated Cable Row (Close Grip) | الظهر الأوسط والسمك
cable-row | Cable Row (Wide Grip) | الظهر الأوسط والكتف الخلفي
dumbbell-row | Single Arm Dumbbell Row | الظهر الجانبي

🎯 الكتفين:
shoulder-press | Shoulder Press Machine | الكتفين الكاملة
cable-lateral | Cable Lateral Raise | الكتف الجانبي (Medial Delt)
rear-delt | Rear Delt Machine / Pec Deck Reverse | الكتف الخلفي (Posterior Delt)
dumbbell-lateral | Dumbbell Lateral Raise | الكتف الجانبي

💪 الذراعين:
bicep-machine | Bicep Curl Machine (Preacher) | البايسبس (ذروة العضلة)
tricep-pushdown | Tricep Rope Pushdown | الترايسبس (الرأس الجانبي)
tricep-overhead | Overhead Cable Tricep Extension | الترايسبس (الرأس الطويل)
dumbbell-curl | Dumbbell Alternating Curl | البايسبس + Brachialis
dumbbell-extension | Dumbbell Overhead Tricep Ext. | الترايسبس (كامل)

🔥 البطن والجذع:
ab-crunch | Ab Crunch Machine | البطن العلوي
cable-crunch | Cable Crunch | البطن الكامل (أفضل تحميل)

🏃 الكارديو:
treadmill | Treadmill | قلب وأوعية — HIIT أو Steady-state
bike | Stationary Bike | قلب — أقل ضغطاً على المفاصل
elliptical | Elliptical Cross-trainer | كارديو كامل الجسم
rower | Rowing Machine | كارديو + ظهر + ذراعين

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ جدول الأوزان المرجعية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getWeightStandards(gender, profile.weight)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 مبادئ البرمجة الاحترافية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Progressive Overload: ابدأ بوزن يسمح بـ 2-3 تكرارات احتياطية (RIR)، اقترح زيادة محددة للأسبوع القادم
2. SRA Principle: Stimulus → Recovery → Adaptation — لا تكرر نفس المجموعة العضلية قبل 48 ساعة
3. تناوب الشدة: Heavy (85%+ 1RM) → Moderate (70-80%) → Light/Volume (60-70%)
4. Mind-Muscle Connection: في كل cue أكد على الإحساس بالعضلة المستهدفة
5. تدرج الجلسة: إحماء عام → تفعيل → compound ثقيل → isolation → تهدئة
6. الكميات الأسبوعية الموصى بها:
   - كل عضلة رئيسية: 10-20 مجموعة/أسبوع
   - العضلات المستهدفة خصيصاً: 15-20 مجموعة
   - العضلات المساعدة: 8-12 مجموعة
7. خصائص المستوى:
   - مبتدئ: 3 مجموعات/تمرين، 12-15 reps، حركات بسيطة وآمنة، تعليم الحركة
   - متوسط: 3-4 مجموعات/تمرين، 8-12 reps، تنويع في التمارين، بدء الأوزان الحرة
   - متقدم: 4-5 مجموعات/تمرين، 6-10 reps، تقنيات متقدمة (drop sets, supersets)
   - محترف: 4-5 مجموعات/تمرين، 4-8 reps ثقيل، تدوير الشدة، volume عالي
${profile.limitations ? `\n8. ⚠️ قيود صارمة: ${profile.limitations} — لا تضع أي تمرين يضغط على هذه المناطق` : ''}
${profile.focusAreas?.length ? `\n9. 🎯 تضخيم التركيز على: ${profile.focusAreas.join(' + ')} — زد حجم هذه العضلات بـ 20-30% عن الباقي` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 هيكل الإحماء المطلوب (5-7 عناصر)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. إحماء قلبي عام: 3-5 دقائق تريدميل/دراجة بشدة خفيفة
2. تفعيل ديناميكي: حركات تفعّل العضلات المستهدفة في هذا اليوم
3. إطالة ديناميكية: Hip circles, Arm swings, Leg swings حسب اليوم
4. مجموعات تحضيرية: للحركة الرئيسية بـ 50% ثم 70% من وزن العمل
اكتب كل عنصر كنص وصفي واضح بالعربية

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧘 هيكل التهدئة المطلوب (4-6 عناصر)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. إطالة العضلات العاملة في هذا اليوم (30-60 ث لكل جانب)
2. تمارين التنفس العميق والاسترخاء
3. Foam Rolling للعضلات المجهدة إذا متاح
4. ملاحظة المدة لكل إطالة
اكتب كل عنصر كنص وصفي مع المدة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 التنسيق المطلوب (JSON فقط)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أرجع JSON بالتنسيق التالي فقط، بدون أي نص قبله أو بعده:

{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "الاثنين",
      "splitType": "Push",
      "title": "تمرين الدفع — الصدر والكتف والترايسبس",
      "focus": "الصدر الكامل + الكتف الأمامي + الترايسبس",
      "intensity": "Heavy",
      "isRest": false,
      "duration": 65,
      "notes": "جلسة ثقيلة — ركّز على الأوزان القصوى مع الحفاظ على الشكل الصحيح. هدف اليوم: تجاوز وزن الأسبوع الماضي بـ 2.5 كجم على Bench Press",
      "warmup": [
        "5 دقائق تريدميل بسرعة 6 كم/ساعة — تنشيط القلب وتدفئة الجسم",
        "Arm Circles كبير 10 دورة لكل اتجاه — تفعيل مفصل الكتف",
        "Band Pull-Apart 15 تكرار — تفعيل الكتف الخلفي لتوازن المفصل",
        "Bench Press مجموعة خفيفة 50% من وزن العمل × 10 — تحضير عصبي عضلي",
        "Bench Press مجموعة متوسطة 70% من وزن العمل × 5 — تأهيل للوزن الكامل"
      ],
      "exercises": [
        {
          "machineId": "barbell-bench",
          "nameAr": "ضغط الصدر بالبار (Bench Press)",
          "nameEn": "Barbell Flat Bench Press",
          "muscleGroup": "الصدر الكامل + الكتف الأمامي + الترايسبس",
          "sets": 4,
          "notes": "الظهر مقوّس طبيعياً — القدمان مثبتتان على الأرض — البار ينزل إلى منتصف الصدر",
          "levels": {
            "beginner":     {"weight": "30كجم", "reps": "10-12", "rest": "90 ث", "cue": "نزّل البار ببطء 3 ث — احسّ بإطالة الصدر — ادفع بقوة مع الزفير"},
            "intermediate": {"weight": "55كجم", "reps": "8-10",  "rest": "90 ث", "cue": "اضغط الصدر في أعلى نقطة ثانية واحدة — قدم القفص الصدري نحو البار"},
            "advanced":     {"weight": "80كجم", "reps": "6-8",   "rest": "2 دق", "cue": "Leg Drive — ادفع الأرض بقدميك لرفع الوزن — Drop Set في المجموعة الأخيرة"},
            "elite":        {"weight": "105كجم","reps": "4-6",   "rest": "3 دق", "cue": "Pause Bench — ثانية توقف كاملة على الصدر — انفجر للأعلى بأقصى قوة"}
          }
        }
      ],
      "cooldown": [
        "تمطيط الصدر على إطار الباب — يدان على مستوى الكتف، تقدّم بجسمك للأمام — 45 ث",
        "Cross-body Shoulder Stretch — اشحب ذراعك أمام الصدر بالذراع الأخرى — 30 ث لكل جانب",
        "تمطيط الترايسبس — ذراع خلف الرأس، اشحب الكوع بالأخرى — 30 ث لكل جانب",
        "تنفس عميق — 5 أنفاس عميقة بطيئة لإعادة معدل القلب للطبيعي"
      ],
      "coachNote": "ممتاز! اليوم هو تمرين الدفع الثقيل للأسبوع. حاول زيادة 2.5 كجم على Bench Press عن جلستك الأخيرة. إذا أنهيت المجموعة بـ 3 تكرارات احتياطية أو أكثر — الوزن خفيف، زده."
    },
    {
      "date": "YYYY-MM-DD",
      "dayName": "الثلاثاء",
      "splitType": "Rest",
      "title": "يوم الراحة الفعّالة",
      "focus": "استرداد",
      "intensity": "Rest",
      "isRest": true,
      "duration": 0,
      "notes": "يوم الراحة لا يعني الخمول — تمشية خفيفة 20 دقيقة تسريع الاسترداد. اشرب 2-3 لتر ماء واهتم بالنوم.",
      "warmup": [],
      "exercises": [],
      "cooldown": [],
      "coachNote": "الراحة جزء من البرنامج — العضلات تنمو خلالها لا خلال التمرين. استرح واهتم بالتغذية والنوم."
    }
  ],
  "weekSummary": "ملخص الأسبوع: توزيع المجموعات العضلية وفلسفة التدريب هذا الأسبوع",
  "progressionNote": "خطة الأسبوع القادم: ما الذي يزيده المتدرب وكيف يتقدم"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ استخدم machineId من القائمة أعلاه حرفياً بدون تعديل
✅ كل تمرين: 4 مستويات كاملة (beginner/intermediate/advanced/elite) مع weight+reps+rest+cue
✅ الـ cue يجب أن يكون تعليمة تقنية محددة ومفيدة، وليس كلاماً عاماً
✅ الإحماء والتهدئة: نصوص عربية واضحة (strings) — ليس objects
✅ عدد التمارين: ${profile.daysPerWeek <= 3 ? '5-7' : profile.daysPerWeek <= 4 ? '5-6' : '4-6'} تمارين/جلسة
✅ أيام الراحة: isRest:true وexercises:[] وwarmup:[] وcooldown:[]
✅ لا تكرر تمرين ظهر في تمارين الأسبوع السابق إلا إذا لم يكن هناك بديل
✅ الـ notes في يوم الراحة تكون نصائح عملية (تغذية، نوم، استرداد)
✅ coachNote يجب أن تكون تحفيزية ومحددة لهذا اليوم وهذا المتدرب
✅ intensity لكل جلسة: Heavy | Moderate | Light | Cardio | Rest
✅ وزّع أيام التمرين بشكل منطقي — لا يومان ثقيلان على نفس العضلة متتاليان

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده. لا تشرح. لا تعلق.`;

  const maxTokens = Math.min(32000, Math.max(18000, profile.daysPerWeek * 3500));

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
      const match = jsonText.match(/"sessions"\s*:\s*(\[[\s\S]*)/);
      if (!match) throw new Error('فشل تحليل JSON — حاول مرة أخرى');
      let arr = match[1];
      const lastBrace = arr.lastIndexOf('},');
      if (lastBrace === -1) throw new Error('لم يكتمل توليد الجدول — حاول مرة أخرى');
      arr = arr.slice(0, lastBrace + 1) + ']';
      result = { sessions: JSON.parse(arr) };
    }

    const toDate = dates[dates.length - 1].date;
    await deleteGymSessionsByMember(memberId, startDate, toDate);

    for (const s of result.sessions || []) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      await upsertGymSession({ ...s, id, memberId, createdAt: new Date().toISOString() });
    }

    return NextResponse.json({ ...result, memberId, fromDate: startDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
