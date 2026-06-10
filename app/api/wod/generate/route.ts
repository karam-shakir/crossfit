import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

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

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');
  const calisExerciseList = CALISTHENICS_EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');

  const calisthenicsPrompt = `أنت مدرب Calisthenics محترف بخبرة أكثر من 10 سنوات، متخصص في برمجة تمارين وزن الجسم والجمناستيكس على المستوى التنافسي. أسلوبك يشبه أفضل مدربي Street Workout وGymnastics Strength Training (GST).

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: رجال ونساء، أعمار 18-45، مستويات متعددة
═══════════════════════════════

**تفاصيل الجلسة:**
- نوع الجلسة: Calisthenics — وزن الجسم البحت
- الصعوبة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: كامل الجسم'}
${date ? `- التاريخ: ${date}` : ''}

**التمارين المتاحة (وزن الجسم فقط — استخدم IDs هذه حصراً):**
${calisExerciseList}

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
الجمهور: رجال ونساء، أعمار 18-45، غالبيتهم مستوى متوسط مع عدد من المبتدئين والمتقدمين
═══════════════════════════════

**تفاصيل التمرين المطلوب:**
- الصعوبة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: حسب تقدير المدرب'}
${date ? `- التاريخ: ${date}` : ''}

**قائمة التمارين المتاحة (استخدم ID المطابق حصراً):**
${exerciseList}

**فلسفة البرمجة الاحترافية:**
✦ الإحماء: تهيئة تدريجية تُفعّل العضلات المستخدمة في الجلسة (dynamic warm-up، mobility، activation)
✦ القوة: بناء الأساس — compound movements بنسب 70-85% من الـ 1RM، مجموعات 3-5 × 3-6 تكرارات
✦ الميتكون: اختر نوع WOD يناسب التركيز:
   - "Hero/Benchmark": 21-15-9 أو Cindy-style أو تابطا
   - "Chipper": تسلسل من 5-7 تمارين يُنجز مرة واحدة
   - "EMOM": x تمارين في كل دقيقة لـ 10-20 دقيقة
   - "AMRAP": أقصى جولات في وقت محدد
✦ التهدئة: تمطيط هادئ للمجموعات العضلية المُستنزفة

**قواعد حقلَي duration و rounds — مهم جداً:**
- "للوقت" مع جولات محددة → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً صحيحاً

**جدول الأوزان المرجعية لتمارين القوة:**
| التمرين | مبتدئ | متوسط | متقدم | نخبة |
|---------|-------|-------|-------|------|
| Back Squat | 40-50كجم | 60-80كجم | 90-110كجم | 120كجم+ |
| Deadlift | 50-60كجم | 80-100كجم | 110-140كجم | 150كجم+ |
| Thruster | 20-30كجم | 35-45كجم | 50-65كجم | 70كجم+ |
| Clean & Jerk | 30-40كجم | 50-65كجم | 70-90كجم | 95كجم+ |

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان التمرين اليومي بالعربية — احترافي ومُلهم",
  "type": "للوقت | AMRAP | قوة | تدريب",
  "duration": 20,
  "rounds": 5,
  "notes": "ملاحظات تفصيلية: كيف تُقسّم الجهد، متى تتنفس، ما هو الهدف الزمني المقترح لكل مستوى",
  "theme": "الرابط التدريبي بين القوة والميتكون — لماذا اخترنا هذه التمارين معاً",
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "400م", "time": "", "notes": "هادئ جداً — إيقاع المحادثة"},
    {"exerciseId": "back-squat", "reps": "10", "weight": "الوزن الخفيف جداً", "distance": "", "time": "", "notes": "حرك المفصل — بدون إجهاد"},
    {"exerciseId": "pull-up", "reps": "5", "weight": "", "distance": "", "time": "", "notes": "تنشيط الكتف والظهر"}
  ],
  "strength": [
    {"exerciseId": "back-squat", "reps": "5×5", "weight": "75% — مبتدئ: 50كجم | متوسط: 70كجم | متقدم: 90كجم", "distance": "", "time": "", "notes": "ركز على العمق الكامل — ركبتيك تتبعان أصابع قدميك"},
    {"exerciseId": "deadlift", "reps": "3×3", "weight": "80% — مبتدئ: 60كجم | متوسط: 90كجم | متقدم: 120كجم", "distance": "", "time": "", "notes": "ظهر مستقيم — التعامل القوي مع البار"}
  ],
  "metcon": [
    {"exerciseId": "thruster", "reps": "21-15-9", "weight": "مبتدئ: 30كجم | متوسط: 43كجم | متقدم: 55كجم", "distance": "", "time": "", "notes": "قسّمها: 15-6 ثم 9-6 ثم 5-4"},
    {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": "مبتدئ: Banded | متوسط: Kipping | متقدم: Strict"}
  ],
  "cooldown": [
    {"exerciseId": "run", "reps": "", "weight": "", "distance": "400م", "time": "", "notes": "مشي هادئ — خفّف معدل القلب"},
    {"exerciseId": "sit-up", "reps": "10", "weight": "", "distance": "", "time": "30 ث", "notes": "تمطيط الوتر الرباعي والظهر السفلي"}
  ]
}

**قواعد مهمة:**
- استخدم فقط IDs من القائمة أعلاه
- في كل تمرين قوة: اذكر الوزن لـ 3 مستويات (مبتدئ | متوسط | متقدم)
- في الميتكون: اذكر scaling واضح لكل تمرين في الـ notes
- الإحماء: 3-4 تمارين، الأول cardio خفيف ثم تفعيل عضلي
- القوة: 2-4 تمارين compound مع أوزان محددة ومرجعية
- الميتكون: 3-5 تمارين مكثفة 7-20 دقيقة، مترابطة مع القوة
- التهدئة: 2-3 تمارين تمطيط للعضلات الأكثر إجهاداً

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
      }));

    const wodData = {
      date: date || new Date().toISOString().split('T')[0],
      title: generated.title || (wodMode === 'calisthenics' ? 'تمرين Calisthenics' : 'تمرين يومي'),
      type: generated.type || 'للوقت',
      isCalisthenics: wodMode === 'calisthenics',
      duration: generated.duration ?? 20,
      rounds: generated.rounds ?? null,
      notes: generated.notes || '',
      aiTheme: generated.theme || '',
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
