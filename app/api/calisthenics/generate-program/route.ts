import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getCalisthenicsProfile, getCaliProgramSessions, getMemberById, upsertCaliProgramSession, deleteCaliProgramSessionsByMember } from '@/lib/db';
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

function getWeekStructure(days: number, hasSkillGoals: boolean): string {
  switch (days) {
    case 3: return `هيكل 3 أيام — Full Body × 3:
      يوم A: دفع محور (Push) + سحب مساعد + كور
      يوم B: سحب محور (Pull) + أرجل + كور
      يوم C: أرجل محور + دفع وسحب خفيف + كور
      ${hasSkillGoals ? '+ تدريب المهارة المستهدفة 10-15 دقيقة أول كل جلسة (الجهاز العصبي نشيط)' : ''}`;
    case 4: return `هيكل 4 أيام — Upper / Lower:
      Upper A (قوة): تدرجات صعبة، تكرارات منخفضة
      Lower A: أرجل بوزن الجسم + بليومتركس
      Upper B (حجم): تكرارات أعلى وتنويع زوايا
      Lower B + Core: أرجل أحادية + جذع مكثف
      ${hasSkillGoals ? '+ Skill Work أول جلستي Upper' : ''}`;
    case 5: return `هيكل 5 أيام — Push / Pull / Legs / Skills / Core:
      يوم 1: Push (دفع) — ضغط وديبس وتدرجاتها
      يوم 2: Pull (سحب) — عقلة وصفوف وتدرجاتها
      يوم 3: Legs — سكوات وتدرجات أحادية وبليومتركس
      يوم 4: ${hasSkillGoals ? 'Skills — يوم كامل للمهارات المستهدفة' : 'Upper Volume — حجم إضافي'}
      يوم 5: Core + Conditioning — جذع وتكييف`;
    case 6: return `هيكل 6 أيام — PPL × 2:
      Push A (قوة) / Pull A (قوة) / Legs A
      Push B (حجم) / Pull B (حجم) / Legs B + Core
      ${hasSkillGoals ? '+ Skill Work موزع على 3-4 جلسات (أول الجلسة دائماً)' : ''}
      يوم راحة واحد إجباري`;
    default: return 'Full Body × 3';
  }
}

function getGoalProtocol(goal: string): string {
  switch (goal) {
    case 'strength': return `بروتوكول القوة بوزن الجسم:
      • تدرجات صعبة (Hard Progressions) بتكرارات منخفضة: 3-6 تكرار
      • راحة طويلة: 2-3 دقائق بين المجموعات
      • مبدأ التدرج: عندما يصل المتدرب 3×8 في تدرج، انتقل للتدرج الأصعب
      • ثبات إيزومتري (Isometric Holds) في المواضع الصعبة
      • أمثلة تدرجات: ضغط عادي → أرشر → عقلة يد واحدة مساعدة`;
    case 'skills': return `بروتوكول المهارات:
      • تدريب المهارة أول الجلسة دائماً — الجهاز العصبي طازج
      • Greasing the Groove: تكرارات قليلة عالية الجودة، لا إجهاد
      • ثبات تراكمي: مجموع 60-90 ثانية ثبات للمهارة بمجموعات قصيرة
      • قوة داعمة بعد المهارة: تمارين تخدم المهارة مباشرة
      • الصبر: المهارات تحتاج شهور — الجودة قبل الكمية دائماً`;
    case 'muscle_gain': return `بروتوكول البناء العضلي بوزن الجسم:
      • نطاق 8-15 تكرار — اختر تدرجاً يفشل فيه المتدرب ضمن هذا النطاق
      • Tempo بطيء: 3-1-2 (3ث نزول - 1ث توقف - 2ث صعود) — زيادة الزمن تحت التوتر
      • حجم عالٍ: 12-20 مجموعة لكل نمط حركة أسبوعياً
      • تقنيات التكثيف: Drop sets بالانتقال لتدرج أسهل عند الفشل
      • راحة 60-90 ثانية`;
    case 'endurance': return `بروتوكول التحمل العضلي:
      • تكرارات عالية: 15-30+ بتدرجات متوسطة
      • Circuits و EMOM و AMRAP — راحة قصيرة 30-45 ث
      • تكييف قلبي مدمج: Burpees, Mountain Climbers, Jump Squats
      • حجم الجلسة أعلى ومدة أطول
      • تتبع الأرقام: هدف كل أسبوع زيادة التكرارات الكلية`;
    case 'fat_burn': return `بروتوكول حرق الدهون:
      • دوائر متكاملة Full Body Circuits — عضلات كبيرة ومركبة
      • HIIT بوزن الجسم: 40ث عمل / 20ث راحة
      • كثافة عالية: قلّل الراحات تدريجياً أسبوعاً بعد أسبوع
      • أنهِ كل جلسة بـ Finisher: 4-5 دقائق Tabata
      • نصائح غذائية في الملاحظات: عجز سعرات + بروتين 1.6-2.2 جم/كجم`;
    default: return 'بروتوكول قوة عام';
  }
}

function getCalibration(p: any): string {
  const rows: string[] = [];
  if (p.maxPushups !== undefined && p.maxPushups !== '') rows.push(`• أقصى ضغط متواصل: ${p.maxPushups} تكرار`);
  if (p.maxPullups !== undefined && p.maxPullups !== '') rows.push(`• أقصى عقلة متواصلة: ${p.maxPullups} تكرار`);
  if (p.maxDips !== undefined && p.maxDips !== '') rows.push(`• أقصى ديبس متواصل: ${p.maxDips} تكرار`);
  if (p.plankSeconds) rows.push(`• أقصى بلانك: ${p.plankSeconds} ثانية`);
  if (!rows.length) return 'لا توجد أرقام مسجلة — ابدأ بتدرجات محافظة واذكر في الملاحظات أن يسجل المتدرب أرقامه';
  return rows.join('\n') + `

استخدم هذه الأرقام لمعايرة البرنامج بدقة:
• مجموعات العمل = 40-60% من الأقصى للقوة، 60-80% للتحمل
• إن كانت العقلة 0-2: استخدم تدرجات مساعدة (Negatives, Band-assisted, Australian Rows)
• إن كان الضغط 30+: انتقل لتدرجات أصعب (Archer, Decline, Pseudo Planche)`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { memberId, fromDate, override } = body;
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const startDate = fromDate || todaySA();
  const member = await getMemberById(memberId);
  const profile = await getCalisthenicsProfile(memberId);

  const effective = {
    goal: 'strength',
    level: 'beginner',
    daysPerWeek: 3,
    gender: 'male',
    skillGoals: [] as string[],
    equipment: [] as string[],
    maxPushups: undefined as number | undefined,
    maxPullups: undefined as number | undefined,
    maxDips: undefined as number | undefined,
    plankSeconds: undefined as number | undefined,
    limitations: '',
    weight: undefined as number | undefined,
    age: undefined as number | undefined,
    ...((profile || {}) as object),
    ...(override || {}),
  };

  const restDays = effective.daysPerWeek <= 3 ? 4 : effective.daysPerWeek <= 4 ? 3 : effective.daysPerWeek === 5 ? 2 : 1;
  const totalDays = effective.daysPerWeek + restDays;
  const dates = buildDates(startDate, totalDays);

  const recentSessions = await getCaliProgramSessions(memberId);
  const recentTraining = recentSessions.slice(0, 7).map(s => ({
    date: s.date,
    type: s.sessionType,
    exercises: (s.exercises || []).slice(0, 5).map((e: any) => e.nameEn).join(', '),
  }));

  const levelAr = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'نخبة' }[effective.level as string] || 'مبتدئ';
  const equipmentList = effective.equipment?.length ? effective.equipment.join('، ') : 'الحد الأدنى (أرض + جدار فقط)';

  const prompt = `أنت مدرب كاليسثنكس (Calisthenics/Street Workout) نخبوي وخبير في علم التدرجات الحركية (Progressions) وتدريب المهارات الجمنستيكية. مهمتك تصميم برنامج أسبوعي متكامل ومخصص بالكامل لهذا المتدرب.

╔══════════════════════════════════════════════╗
║   نادي مجموعة المطانيخ — قسم الكاليسثنكس     ║
╚══════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 بروفايل المتدرب الكامل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم: ${member?.nameAr || 'المتدرب'}
الجنس: ${effective.gender === 'female' ? 'أنثى' : 'ذكر'}
العمر: ${effective.age ? effective.age + ' سنة' : 'غير محدد'}
الوزن: ${effective.weight ? effective.weight + ' كجم' : 'غير محدد'}
المستوى: ${levelAr}
الهدف: ${effective.goal}
أيام التدريب: ${effective.daysPerWeek} أيام/أسبوع
المهارات المستهدفة: ${effective.skillGoals?.length ? effective.skillGoals.join(' + ') : 'لا توجد — التركيز على الهدف العام'}
المعدات المتاحة: ${equipmentList}
القيود والإصابات: ${effective.limitations || 'لا توجد قيود'}
${override?.specialInstructions ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 تعليمات خاصة من المدرب (أولوية قصوى)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${override.specialInstructions}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 القدرات الحالية المسجلة (معايرة البرنامج)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getCalibration(effective)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 بروتوكول الهدف
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getGoalProtocol(effective.goal)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 هيكل الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getWeekStructure(effective.daysPerWeek, (effective.skillGoals?.length || 0) > 0)}

${effective.skillGoals?.length ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤸 خطة المهارات المستهدفة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
المهارات: ${effective.skillGoals.join(' + ')}
لكل مهارة استخدم سلسلة التدرجات الصحيحة حسب مستوى المتدرب:
• Handstand: Wall Plank → Wall HS → Chest-to-Wall → Freestanding → HSPU
• Muscle-up: Pull-up قوي 8+ → High Pull-ups → Explosive Pull → Transition Drills → Negative MU → MU
• Front Lever: Tuck → Adv Tuck → Single Leg → Straddle → Full
• Back Lever: German Hang → Tuck → Adv Tuck → Straddle → Full
• Planche: Lean → Frog Stand → Tuck → Adv Tuck → Straddle
• Pistol Squat: Box Pistol → Assisted → Counterweight → Full
• Human Flag: Support Press → Tuck Flag → Straddle → Full
• Dragon Flag: Tuck → Single Leg → Full
• L-sit: Foot-supported → One-leg → Full → V-sit
ضع Skill Work في بداية الجلسة (بعد الإحماء مباشرة) — الجهاز العصبي طازج. 10-20 دقيقة كحد أقصى.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 جلسات الأسبوع السابق (تجنّب التكرار الممل)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recentTraining.length ? recentTraining.map(s => `• ${s.date} | ${s.type} | ${s.exercises}`).join('\n') : 'لا توجد جلسات سابقة — هذا أول أسبوع. ابدأ بأسبوع تأسيسي لتعلم الحركات'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 الأيام المطلوبة لهذا الأسبوع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dates.map(d => `• ${d.date} — ${d.dayName}`).join('\n')}

وزّع ${effective.daysPerWeek} أيام تدريب و${restDays} أيام راحة بذكاء:
• لا تضع جلستي دفع (أو سحب) متتاليتين
• أصعب جلسة بعد يوم راحة
• Skill Work لا يوضع بعد جلسة سحب مجهدة لنفس العضلات

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 مبادئ البرمجة الصارمة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. التدرج هو الوزن: في الكاليسثنكس التقدم يكون بتغيير التدرج (رافعة أطول = أصعب) وليس بالوزن
2. كل تمرين يُعطى بـ 4 مستويات — كل مستوى له "variation" مختلف (تدرج مختلف) وليس فقط تكرارات مختلفة
   مثال الضغط: مبتدئ = ضغط على ركبة | متوسط = ضغط عادي | متقدم = أرشر | نخبة = Pseudo Planche
3. توازن الدفع/السحب 1:1 أسبوعياً على الأقل — صحة الكتف أولوية
4. عمل الكتف الخلفي والـ Scapula في كل أسبوع (Scapula Pulls, Face Pulls بالأربطة إن توفرت)
5. الأرجل لا تُهمل: سكوات وتدرجاته + عمل أحادي + بليومتركس
6. قيّد التمارين بالمعدات المتاحة فقط: ${equipmentList}
   ${!effective.equipment?.includes('بار عقلة') && !effective.equipment?.includes('حلقات') ? '⚠️ لا يوجد بار عقلة — استخدم بدائل السحب: Towel Rows على باب، Australian Rows تحت طاولة متينة' : ''}
7. خصائص المستوى:
   - مبتدئ: تعلم الحركة، تدرجات سهلة، 3 مجموعات، راحة كافية
   - متوسط: تدرجات قياسية، 3-4 مجموعات، بدء عمل المهارات البسيطة
   - متقدم: تدرجات صعبة، 4-5 مجموعات، تقنيات تكثيف
   - نخبة: تدرجات نخبوية، عمل رافعات، برمجة موجية
${effective.limitations ? `8. ⚠️ قيود صارمة: ${effective.limitations} — كيّف البرنامج بالكامل حولها` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 التنسيق المطلوب (JSON فقط)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أرجع JSON بالتنسيق التالي فقط، بدون أي نص قبله أو بعده:

{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "الاثنين",
      "sessionType": "Push",
      "title": "جلسة الدفع — قوة الصدر والكتف والترايسبس",
      "focus": "أنماط الدفع الأفقي والعمودي",
      "intensity": "Heavy",
      "isRest": false,
      "duration": 55,
      "notes": "جلسة القوة الأولى — سجّل أرقامك في كل تمرين لمتابعة التقدم",
      "warmup": [
        "3 دقائق نط حبل أو Jumping Jacks — رفع الحرارة",
        "Arm Circles + Shoulder Rolls 10 لكل اتجاه — مفصل الكتف",
        "Scapula Push-ups 2 × 10 — تفعيل لوح الكتف",
        "Wrist Circles + Wrist Push-ups خفيفة — تجهيز الرسغين (أهم مفصل في الكاليسثنكس)",
        "مجموعة تحضيرية من التمرين الأول بتدرج أسهل × 8"
      ],
      "skillWork": [
        {
          "name": "تدريب الوقوف على اليدين",
          "nameEn": "Handstand Practice",
          "targetMuscles": "الكتفين + الجذع + التوازن",
          "type": "skill",
          "sets": 5,
          "notes": "أول الجلسة والجهاز العصبي نشيط — توقف قبل الإجهاد",
          "levels": {
            "beginner":     {"variation": "Wall Plank (قدمان على الحائط)", "reps": "5 × 20 ث", "rest": "60 ث", "cue": "ادفع الأرض بعيداً — كتفان مرفوعان للأذنين — جسم مشدود كلوح"},
            "intermediate": {"variation": "Chest-to-Wall Handstand",       "reps": "5 × 30 ث", "rest": "60 ث", "cue": "أصابع اليد تقبض الأرض — بطن مشدود — قدمان تلمسان الحائط بخفة"},
            "advanced":     {"variation": "Freestanding Kick-up + ثبات",   "reps": "5 محاولات × 15 ث", "rest": "90 ث", "cue": "التوازن من الأصابع والرسغ وليس الكتف — نظرك بين يديك"},
            "elite":        {"variation": "Handstand Push-up Negatives",   "reps": "4 × 3-5", "rest": "2 دق", "cue": "نزول 5 ثوان محكوم — كوعان 45 درجة — رأس يلمس ثم ادفع"}
          }
        }
      ],
      "exercises": [
        {
          "name": "تمرين الضغط",
          "nameEn": "Push-up Progression",
          "targetMuscles": "الصدر + الكتف الأمامي + الترايسبس",
          "type": "push",
          "sets": 4,
          "notes": "النمط الأساسي للدفع الأفقي",
          "levels": {
            "beginner":     {"variation": "ضغط على الركبتين",       "reps": "4 × 8-12",  "rest": "90 ث", "cue": "جسم مستقيم من الركبة للرأس — انزل حتى يلمس الصدر تقريباً"},
            "intermediate": {"variation": "ضغط عادي كامل",           "reps": "4 × 10-15", "rest": "90 ث", "cue": "كوعان 45 درجة من الجسم — اقبض المؤخرة والبطن طوال الحركة"},
            "advanced":     {"variation": "Archer Push-up",          "reps": "4 × 6-8 لكل جانب", "rest": "2 دق", "cue": "الذراع الممدودة مستقيمة تماماً — انقل الوزن كاملاً للذراع العاملة"},
            "elite":        {"variation": "Pseudo Planche Push-up",  "reps": "4 × 6-10",  "rest": "2-3 دق", "cue": "يدان عند الخصر وأصابع للخلف — انحنِ للأمام بأقصى ما يمكن"}
          }
        }
      ],
      "cooldown": [
        "إطالة الصدر على إطار الباب — 45 ث",
        "إطالة الرسغين بالاتجاهين — 30 ث لكل اتجاه",
        "Child's Pose مع تمدد الكتفين — 60 ث",
        "تنفس عميق 5 مرات"
      ],
      "coachNote": "ركّز اليوم على جودة التدرج وليس عدد التكرارات — عندما تصل 4×12 بتقنية مثالية سننتقل للتدرج الأصعب."
    },
    {
      "date": "YYYY-MM-DD",
      "dayName": "الثلاثاء",
      "sessionType": "Rest",
      "title": "راحة واستشفاء",
      "focus": "استرداد",
      "intensity": "Rest",
      "isRest": true,
      "duration": 0,
      "notes": "الرسغان والكتفان يحتاجان الاسترداد بعد جلسة الدفع. تحرك بخفة واشرب ماء كافياً.",
      "warmup": [],
      "skillWork": [],
      "exercises": [],
      "cooldown": [],
      "coachNote": "العضلات تُبنى في الراحة — نم 7-9 ساعات."
    }
  ],
  "weekSummary": "ملخص الأسبوع: توزيع أنماط الحركة وفلسفة التدرجات هذا الأسبوع",
  "progressionNote": "خطة الأسبوع القادم: أي تدرجات يترقى إليها المتدرب وما شروط الترقية"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ قواعد صارمة يجب الالتزام بها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ كل تمرين: 4 مستويات كاملة، ولكل مستوى variation مختلف حقيقي (تدرج أسهل/أصعب) — ليس نفس التمرين بتكرارات مختلفة
✅ الـ cue تعليمة تقنية محددة (وضعية الجسم، زاوية الكوع، شد الجذع) — ليس كلاماً عاماً
✅ الإحماء يتضمن دائماً تجهيز الرسغين والكتفين ولوح الكتف — إجباري في الكاليسثنكس
✅ skillWork يظهر فقط إن كانت هناك مهارات مستهدفة، ويكون أول الجلسة، 1-2 مهارة كحد أقصى لكل جلسة
✅ sessionType: Push | Pull | Legs | Skills | Core | FullBody | Endurance | Rest
✅ intensity: Heavy | Moderate | Light | Rest
✅ أيام الراحة: isRest:true وexercises:[] وskillWork:[] وwarmup:[] وcooldown:[]
✅ عدد التمارين الرئيسية: 4-6 لكل جلسة (غير المهارات)
✅ استخدم المعدات المتاحة فقط — لا تضع Ring Rows لمن لا يملك حلقات
✅ coachNote تحفيزية ومحددة وتشرح شرط الترقية للتدرج الأصعب
✅ لا تكرر نفس تشكيلة تمارين الأسبوع السابق حرفياً

أرجع JSON فقط بدون أي كلمة أو نص قبله أو بعده. لا تشرح. لا تعلق.`;

  const maxTokens = Math.min(32000, Math.max(18000, effective.daysPerWeek * 3500));

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
    await deleteCaliProgramSessionsByMember(memberId, startDate, toDate);

    for (const s of result.sessions || []) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      await upsertCaliProgramSession({ ...s, id, memberId, createdAt: new Date().toISOString() });
    }

    return NextResponse.json({ ...result, memberId, fromDate: startDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
