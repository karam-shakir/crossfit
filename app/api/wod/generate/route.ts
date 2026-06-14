import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getWods } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXERCISES = [
  { id: 'back-squat',        nameEn: 'Back Squat',        nameAr: 'القرفصاء الخلفية',    category: 'strength'   },
  { id: 'front-squat',       nameEn: 'Front Squat',       nameAr: 'القرفصاء الأمامية',    category: 'strength'   },
  { id: 'deadlift',          nameEn: 'Deadlift',          nameAr: 'الرفعة الميتة',        category: 'strength'   },
  { id: 'power-clean',       nameEn: 'Power Clean',       nameAr: 'النظيفة القوية',       category: 'olympic'    },
  { id: 'clean-and-jerk',    nameEn: 'Clean & Jerk',      nameAr: 'النظيفة والدفع',       category: 'olympic'    },
  { id: 'snatch',            nameEn: 'Snatch',            nameAr: 'الخطف',                category: 'olympic'    },
  { id: 'overhead-squat',    nameEn: 'Overhead Squat',    nameAr: 'القرفصاء فوق الرأس',  category: 'strength'   },
  { id: 'shoulder-press',    nameEn: 'Shoulder Press',    nameAr: 'الضغط فوق الرأس',     category: 'strength'   },
  { id: 'push-press',        nameEn: 'Push Press',        nameAr: 'الدفع بالساقين',       category: 'strength'   },
  { id: 'thruster',          nameEn: 'Thruster',          nameAr: 'الثراستر',             category: 'wod'        },
  { id: 'pull-up',           nameEn: 'Pull Up',           nameAr: 'العقلة',              category: 'gymnastics' },
  { id: 'kipping-pull-up',   nameEn: 'Kipping Pull Up',   nameAr: 'العقلة الكيبينج',     category: 'gymnastics' },
  { id: 'muscle-up',         nameEn: 'Muscle Up',         nameAr: 'الماسل أب',           category: 'gymnastics' },
  { id: 'handstand-pushup',  nameEn: 'Handstand Push Up', nameAr: 'الضغط على اليدين',    category: 'gymnastics' },
  { id: 'handstand-walk',    nameEn: 'Handstand Walk',    nameAr: 'المشي على اليدين',    category: 'gymnastics' },
  { id: 'toes-to-bar',       nameEn: 'Toes to Bar',       nameAr: 'الأصابع للعارضة',     category: 'gymnastics' },
  { id: 'double-under',      nameEn: 'Double Under',      nameAr: 'القفز المزدوج',       category: 'cardio'     },
  { id: 'box-jump',          nameEn: 'Box Jump',          nameAr: 'القفز على الصندوق',   category: 'wod'        },
  { id: 'burpee',            nameEn: 'Burpee',            nameAr: 'البيربي',             category: 'cardio'     },
  { id: 'wall-ball',         nameEn: 'Wall Ball',         nameAr: 'كرة الحائط',          category: 'wod'        },
  { id: 'kettle-bell-swing', nameEn: 'Kettlebell Swing',  nameAr: 'هزة الكيتل بيل',      category: 'wod'        },
  { id: 'row',               nameEn: 'Row',               nameAr: 'التجديف',             category: 'cardio'     },
  { id: 'run',               nameEn: 'Run',               nameAr: 'الجري',               category: 'cardio'     },
  { id: 'push-up',           nameEn: 'Push Up',           nameAr: 'الضغط',               category: 'gymnastics' },
  { id: 'sit-up',            nameEn: 'Sit Up',            nameAr: 'الجلوس',              category: 'gymnastics' },
  { id: 'rope-climb',        nameEn: 'Rope Climb',        nameAr: 'تسلق الحبل',          category: 'gymnastics' },
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, focus, difficulty = 'متوسط', wodMode = 'crossfit' } = body;

  // Calisthenics: bodyweight only — exclude barbell/machine exercises (row = machine)
  const CALISTHENICS_EXERCISES = EXERCISES.filter(e =>
    e.category === 'gymnastics' ||
    ['run', 'double-under', 'burpee', 'box-jump'].includes(e.id)
  );

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn}) [${e.category}]`).join('\n');
  const calisExerciseList = CALISTHENICS_EXERCISES.map(e => `- ${e.id} (${e.nameEn}) [${e.category}]`).join('\n');

  const allWods = await getWods();
  const last7Wods = allWods
    .filter(w => date ? w.date < date : true)
    .slice(0, 7);

  // تحليل المجموعات العضلية المُدرَّبة في آخر 7 أيام
  const muscleGroupLog: { date: string; muscles: string[]; intensity: string }[] = [];
  for (const w of last7Wods) {
    const allEx = [...(w.strength || []), ...(w.metcon || [])].map((e: any) => e.exerciseId);
    const muscles: string[] = [];
    if (allEx.some(id => ['back-squat','front-squat','overhead-squat','deadlift'].includes(id))) muscles.push('الساق/السلسلة الخلفية');
    if (allEx.some(id => ['power-clean','clean-and-jerk','snatch'].includes(id))) muscles.push('الأولمبي/الجسم الكامل');
    if (allEx.some(id => ['pull-up','kipping-pull-up','muscle-up','rope-climb'].includes(id))) muscles.push('الظهر/السحب');
    if (allEx.some(id => ['shoulder-press','push-press','handstand-pushup'].includes(id))) muscles.push('الكتف/الدفع');
    if (allEx.some(id => ['thruster','wall-ball'].includes(id))) muscles.push('الجسم الكامل');
    if (allEx.some(id => ['row','run','double-under','burpee'].includes(id))) muscles.push('القلب/التحمل');
    // قياس شدة الجلسة: عدد التمارين وحجم القوة
    const hasHeavyStrength = (w.strength || []).length >= 2;
    const intensity = hasHeavyStrength ? 'ثقيلة' : (w.metcon || []).length >= 4 ? 'تحمل' : 'متوسطة';
    muscleGroupLog.push({ date: w.date, muscles, intensity });
  }

  // تحديد شدة الأسبوع الكلية
  const sessionCount = last7Wods.length;
  const heavyCount = muscleGroupLog.filter(d => d.intensity === 'ثقيلة').length;
  let weekIntensity: string;
  let intensityRecommendation: string;
  if (sessionCount >= 5 || heavyCount >= 3) {
    weekIntensity = 'ثقيل';
    intensityRecommendation = 'الأسبوع كان ثقيلاً — اجعل هذه الجلسة متوسطة أو خفيفة للتعافي، ركز على التقنية والحجم لا على الحد الأقصى';
  } else if (sessionCount >= 3 || heavyCount >= 1) {
    weekIntensity = 'متوسط';
    intensityRecommendation = 'الأسبوع متوسط — يمكن جلسة ثقيلة إلى متوسطة، تأكد من استهداف مجموعات عضلية مختلفة عن السابق';
  } else {
    weekIntensity = 'خفيف';
    intensityRecommendation = 'الأسبوع خفيف — الجسم جاهز تماماً، اجعلها جلسة ثقيلة وطموحة';
  }

  // تحديد المجموعات العضلية الأكثر تدريباً لتجنبها
  const allRecentMuscles = muscleGroupLog.flatMap(d => d.muscles);
  const muscleFreq: Record<string, number> = {};
  allRecentMuscles.forEach(m => { muscleFreq[m] = (muscleFreq[m] || 0) + 1; });
  const overtrained = Object.entries(muscleFreq).filter(([, v]) => v >= 2).map(([k]) => k);
  const undertrained = ['الساق/السلسلة الخلفية','الأولمبي/الجسم الكامل','الظهر/السحب','الكتف/الدفع','الجسم الكامل','القلب/التحمل']
    .filter(m => !allRecentMuscles.includes(m));

  const recentContext = `
**═══ تحليل الأسبوع الماضي (آخر 7 أيام) ═══**
عدد الجلسات: ${sessionCount} جلسات
شدة الأسبوع: ${weekIntensity}
توصية اليوم: ${intensityRecommendation}

المجموعات العضلية التي تدربت كثيراً (تجنبها أو قللها):
${overtrained.length ? overtrained.map(m => `- ${m}`).join('\n') : '- لا يوجد إجهاد تراكمي'}

المجموعات العضلية المُهمَلة (استهدفها اليوم بأولوية):
${undertrained.length ? undertrained.map(m => `- ${m}`).join('\n') : '- جميع المجموعات تدربت بشكل متوازن'}

سجل الجلسات التفصيلي:
${muscleGroupLog.map(d => `${d.date}: [${d.muscles.join(' + ')}] — شدة: ${d.intensity}`).join('\n') || 'لا توجد جلسات سابقة'}
`;

  const calisthenicsPrompt = `أنت مدرب Calisthenics محترف بخبرة أكثر من 10 سنوات، متخصص في برمجة تمارين وزن الجسم والجمناستيكس على المستوى التنافسي. أسلوبك يشبه أفضل مدربي Street Workout وGymnastics Strength Training (GST).

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: غالبيتهم رجال (18-40 سنة) — مع وجود نساء
الأوزان: مبنية على معايير الرجال — مع ذكر scaling للنساء في الـ notes
═══════════════════════════════

**تفاصيل الجلسة:**
- نوع الجلسة: Calisthenics — وزن الجسم البحت
- الصعوبة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: كامل الجسم'}
${date ? `- التاريخ: ${date}` : ''}

**التمارين المتاحة (وزن الجسم فقط — استخدم IDs هذه حصراً):**
${calisExerciseList}
${recentContext}
**فلسفة البرمجة الاحترافية:**
- الإحماء: تنشيط مفصلي تدريجي + تفعيل عضلي (shoulder circles، hip circles، inchworm، scapular pull-ups)
- القوة / Skill Work: تمارين تقنية مهارية بمجموعات قصيرة عالية الجودة (Strict Pull-up، HSPU، Muscle-up Progression)
- الميتكون: circuit مكثف يرفع معدل ضربات القلب، تمارين تدفق بدون توقف
- التهدئة: تمطيط إيزومتري عميق للعضلات الأكثر استخداماً

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق
- "تدريب" (Skill) → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً

**مستويات الصعوبة في الأوزان والتمارين:**
- مبتدئ: تمارين مساعدة (band pull-up, knee push-up, negative pull-up)
- متوسط: تمارين كاملة (strict pull-up, push-up, dips)
- متقدم: تمارين مركبة (muscle-up, handstand push-up, toes-to-bar)
- نخبة: تمارين مهارية متقدمة (strict HSPU, kipping muscle-up, rope climb)

أرجع JSON بهذا التنسيق بالضبط بدون أي نص خارجه:
{
  "title": "عنوان التمرين بالعربية — يوم Calisthenics",
  "type": "للوقت | AMRAP | تدريب",
  "duration": 20,
  "rounds": null,
  "notes": "ملاحظات تفصيلية للمتدربين تشمل: استراتيجية الجلسة، كيفية تقسيم التكرارات، نقاط الأمان",
  "theme": "الفكرة المحورية للجلسة (مثال: بناء قوة السحب مع تحمل وزن الجسم)",
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "إيقاع هادئ — تنشيط الدورة الدموية"},
    {"exerciseId": "push-up", "reps": "10", "weight": "", "distance": "", "time": "", "notes": "بطيء — تفعيل الكتف والصدر"},
    {"exerciseId": "sit-up", "reps": "15", "weight": "", "distance": "", "time": "", "notes": "تفعيل العضلة الوسطى"}
  ],
  "strength": [
    {"exerciseId": "pull-up", "reps": "5×3", "weight": "", "distance": "", "time": "", "notes": "Strict فقط — توقف 3 ث في الأعلى، متوسط: Banded، متقدم: Weighted BW"},
    {"exerciseId": "handstand-pushup", "reps": "4×5", "weight": "", "distance": "", "time": "", "notes": "Strict HSPU — متوسط: Pike Push-up، نخبة: Freestanding HSPU"}
  ],
  "metcon": [
    {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "Kipping مسموح — لا تصل للفشل الكامل"},
    {"exerciseId": "push-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "صدر للأرض في كل تكرار"},
    {"exerciseId": "burpee", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "استمر في الحركة — لا توقف"}
  ],
  "cooldown": [
    {"exerciseId": "sit-up", "reps": "10", "weight": "", "distance": "", "time": "45 ث", "notes": "تمطيط الصدر والكتفين — أمسك 45 ث"}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs التمارين المتاحة أعلاه
- weight يبقى فارغاً دائماً (وزن الجسم)
- الإحماء: 3-4 تمارين ديناميكية تُهيئ للعمل الرئيسي
- القوة/Skill: 2-3 تمارين مهارية عالية الجودة
- الميتكون: 3-5 تمارين مكثفة 7-20 دقيقة
- في كل notes: اذكر scaling للمبتدئين وللمتقدمين
- التهدئة: 2-3 تمطيطات للعضلات الأكثر استخداماً

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const crossfitPrompt = `أنت مبرمج CrossFit محترف على مستوى CompTrain وPRVN Athletics، بخبرة أكثر من 10 سنوات في برمجة الجداول اليومية لأندية CrossFit. تبرمج بأسلوب مدرب ذكي يفهم التوازن بين القوة والتحمل ويراعي تعافي الأعضاء.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: غالبيتهم رجال (18-40 سنة) — متوسط إلى متقدم
الأوزان: مبنية على معايير الرجال (RX للرجال)
═══════════════════════════════

**تفاصيل التمرين المطلوب:**
- الصعوبة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: حسب تقدير المدرب'}
${date ? `- التاريخ: ${date}` : ''}

**قائمة التمارين المتاحة (استخدم ID المطابق حصراً):**
${exerciseList}
${recentContext}
**فلسفة البرمجة الاحترافية:**
✦ استخدم تحليل الأسبوع أعلاه لتحديد: (1) شدة اليوم (2) المجموعات العضلية المستهدفة
✦ الإحماء: تهيئة تدريجية تُفعّل العضلات التي ستستهدفها اليوم تحديداً
✦ القوة: compound movements بالبار (barbell) بنسب تتناسب مع شدة الأسبوع
✦ الميتكون: اختر نوع WOD يناسب الشدة المقررة:
   - "Hero/Benchmark": 21-15-9 أو Cindy-style أو تابطا
   - "Chipper": تسلسل من 5-7 تمارين يُنجز مرة واحدة
   - "EMOM": x تمارين في كل دقيقة لـ 10-20 دقيقة
   - "AMRAP": أقصى جولات في وقت محدد
✦ التهدئة: تمطيط هادئ للمجموعات العضلية المُستنزفة اليوم

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات محددة → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً صحيحاً

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان التمرين اليومي بالعربية — احترافي ومُلهم",
  "titleEn": "Daily workout title in English — professional and inspiring",
  "type": "للوقت | AMRAP | قوة | تدريب",
  "duration": 20,
  "rounds": 5,
  "notes": "ملاحظات تفصيلية: كيف تُقسّم الجهد، متى تتنفس",
  "theme": "الرابط التدريبي بين القوة والميتكون",
  "targetTimes": {
    "beginner": "25-30 دقيقة",
    "intermediate": "18-22 دقيقة",
    "advanced": "14-17 دقيقة",
    "elite": "10-13 دقيقة"
  },
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "هادئ جداً — إيقاع المحادثة"},
    {"exerciseId": "back-squat", "reps": "10", "weight": "", "distance": "", "time": "", "notes": "حرك المفصل — بدون إجهاد"}
  ],
  "strength": [
    {
      "exerciseId": "back-squat",
      "reps": "5×5",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "ركز على العمق الكامل — ركبتيك تتبعان أصابع قدميك",
      "levels": {
        "beginner":     {"weight": "50كجم", "reps": "5×4", "cue": "عمق موازٍ — ظهر مستقيم"},
        "intermediate": {"weight": "70كجم", "reps": "5×5", "cue": "عمق كامل — ركبة وفق القدم"},
        "advanced":     {"weight": "90كجم", "reps": "5×5", "cue": "سرعة في الصعود — حزام"},
        "elite":        {"weight": "110كجم+", "reps": "5×5", "cue": "Pause Squat 2ث — انفجاري للأعلى"}
      }
    },
    {
      "exerciseId": "deadlift",
      "reps": "3×3",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "ظهر مستقيم — التعامل القوي مع البار",
      "levels": {
        "beginner":     {"weight": "60كجم", "reps": "3×3", "cue": "شد الكتفين للخلف قبل الرفع"},
        "intermediate": {"weight": "90كجم", "reps": "3×3", "cue": "حزام فوق 80% — ابدأ بالأرداف"},
        "advanced":     {"weight": "120كجم", "reps": "3×3", "cue": "Brace 360 درجة — لا ترتخِ"},
        "elite":        {"weight": "150كجم+", "reps": "3×3", "cue": "Reset كامل بين كل تكرار"}
      }
    }
  ],
  "metcon": [
    {
      "exerciseId": "thruster",
      "reps": "21-15-9",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "قسّمها: 15-6 ثم 9-6 ثم 5-4",
      "levels": {
        "beginner":     {"weight": "30كجم", "reps": "21-15-9", "cue": "Push Press بدل Thruster عند الإرهاق"},
        "intermediate": {"weight": "43كجم", "reps": "21-15-9", "cue": "حافظ على إيقاعك — لا تتوقف طويلاً"},
        "advanced":     {"weight": "55كجم", "reps": "21-15-9", "cue": "Unbroken أول جولة"},
        "elite":        {"weight": "65كجم", "reps": "21-15-9", "cue": "Squat Clean into Thruster للأول"}
      }
    },
    {
      "exerciseId": "pull-up",
      "reps": "21-15-9",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "قسّم التكرارات — لا تصل للفشل الكامل",
      "levels": {
        "beginner":     {"weight": "", "reps": "21-15-9", "cue": "Banded Pull-up أو Ring Row"},
        "intermediate": {"weight": "", "reps": "21-15-9", "cue": "Kipping مسموح — مجموعات صغيرة"},
        "advanced":     {"weight": "", "reps": "21-15-9", "cue": "Butterfly للسرعة"},
        "elite":        {"weight": "", "reps": "21-15-9", "cue": "Chest-to-Bar — Unbroken أكثر ما يمكن"}
      }
    }
  ],
  "cooldown": [
    {"exerciseId": "run", "reps": "", "weight": "", "distance": "400م", "time": "", "notes": "مشي هادئ 2 دقيقة — خفّف معدل القلب تدريجياً"},
    {"exerciseId": "sit-up", "reps": "", "weight": "", "distance": "", "time": "60 ث", "notes": "تمطيط Hip Flexor — ركبة أمامية، ورك للأمام، أمسك 60 ث لكل جانب — لأن الـ WOD استنزف الجذع والورك"}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs من القائمة أعلاه
- تمارين القوة (strength) يجب أن تكون بالبار حصراً (back-squat, deadlift, power-clean, clean-and-jerk, snatch, overhead-squat, shoulder-press, push-press, thruster) — لا تضع pull-up أو handstand-pushup في القوة
- كل تمرين في strength وmetcon يجب أن يحتوي على حقل "levels" بالمستويات الأربعة مع الوزن والتكرارات والنصيحة
- الإحماء والتهدئة: بدون levels (تُضاف في notes فقط)
- الإحماء: 3-4 تمارين، الأول cardio خفيف ثم تفعيل عضلي
- القوة: 2-3 تمارين barbell compound
- الميتكون: 3-5 تمارين مكثفة 7-20 دقيقة، تجمع barbell مع gymnastics
- targetTimes: أوقات واقعية لإنهاء الميتكون لكل مستوى
- التهدئة: 2-3 إطالات ثابتة (static stretches) مرتبطة مباشرة بعضلات strength وmetcon هذا اليوم — إذا كان اليوم squat فالإطالة للـ quad وhip flexor وglute، وإذا كان pull-up فالإطالة للـ lat وbicep وshoulder، وإذا كان deadlift فالإطالة للـ hamstring وlow back — اذكر في notes لماذا هذه الإطالة مناسبة لجلسة اليوم

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const prompt = wodMode === 'calisthenics' ? calisthenicsPrompt : crossfitPrompt;

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

    const generated = JSON.parse(jsonText);
    const validIds = new Set(EXERCISES.map(e => e.id));

    const validateSection = (items: any[]) =>
      (items || []).filter((item: any) => item && validIds.has(item.exerciseId)).map((item: any) => ({
        ...item,
        exerciseId: item.exerciseId,
        reps: item.reps || '',
        weight: item.weight || '',
        distance: item.distance || '',
        time: item.time || '',
        notes: item.notes || '',
        levels: item.levels || null,
      }));

    const wodData = {
      date: date || todaySA(),
      title:   generated.title   || (wodMode === 'calisthenics' ? 'تمرين Calisthenics' : 'تمرين يومي'),
      titleEn: generated.titleEn || '',
      type: generated.type || 'للوقت',
      isCalisthenics: wodMode === 'calisthenics',
      duration: generated.duration ?? 20,
      rounds: generated.rounds ?? null,
      notes: generated.notes || '',
      aiTheme: generated.theme || '',
      targetTimes: generated.targetTimes || null,
      warmup: validateSection(generated.warmup),
      strength: validateSection(generated.strength),
      metcon: validateSection(generated.metcon),
      cooldown: validateSection(generated.cooldown),
    };

    return NextResponse.json({ wod: wodData, theme: generated.theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
