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

  const calisthenicsPrompt = `أنت مبرمج Calisthenics محترف متخصص في تمارين وزن الجسم والجمناستيكس.

مهمتك: توليد تمرين Calisthenics يومي متكامل — وزن الجسم فقط، بدون أي معدات أثقال.

**الصعوبة المطلوبة:** ${difficulty}
${focus ? `**التركيز اليوم:** ${focus}` : ''}
${date ? `**تاريخ التمرين:** ${date}` : ''}

**التمارين المتاحة (وزن الجسم فقط — استخدم IDs هذه فقط):**
${calisExerciseList}

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات محددة → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق
- "تدريب" (Skill Work) → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً

**المطلوب**: تمرين Calisthenics كامل يشمل:
- إحماء ديناميكي بحركات وزن الجسم
- تمرين قوة (Skill Work): تمارين مهارية كالـ handstand أو muscle-up أو تقوية push/pull
- الميتكون: circuit مكثف من وزن الجسم
- تهدئة وتمطيط

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان التمرين بالعربية — يوم Calisthenics",
  "type": "للوقت | AMRAP | تدريب",
  "duration": 20,
  "rounds": null,
  "notes": "ملاحظات للمتدربين — تمرين وزن جسم كامل",
  "theme": "الهدف الأساسي من هذا التمرين (مثال: تقوية الضغط وتحمل الجمناستيكس)",
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "", "time": "", "notes": "إيقاع هادئ"}
  ],
  "strength": [
    {"exerciseId": "handstand-pushup", "reps": "5×5", "weight": "", "distance": "", "time": "", "notes": "Strict — بطيء وتحكم"}
  ],
  "metcon": [
    {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": ""},
    {"exerciseId": "push-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": ""},
    {"exerciseId": "burpee", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": ""}
  ],
  "cooldown": [
    {"exerciseId": "sit-up", "reps": "20", "weight": "", "distance": "", "time": "", "notes": "تمطيط خفيف"}
  ]
}

**قواعد صارمة:**
- استخدم فقط IDs التمارين المتاحة أعلاه
- لا تضع أي أوزان حديدية (weight يكون فارغاً أو نسبة مئوية من وزن الجسم كـ "BW")
- الإحماء: 3-4 تمارين خفيفة ديناميكية
- Skill Work: 2-3 تمارين مهارية تحت الحمل
- الميتكون: 3-5 تمارين وزن جسم مكثفة 7-20 دقيقة
- التهدئة: 2-3 تمارين تمطيط

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  const crossfitPrompt = `أنت مبرمج CrossFit محترف بخبرة تزيد عن 10 سنوات، متخصص في برمجة تمارين على مستوى CompTrain وPRVN Athletics.

مهمتك: توليد تمرين CrossFit يومي متكامل وعالي المستوى.

**الصعوبة المطلوبة:** ${difficulty}
${focus ? `**التركيز اليوم:** ${focus}` : ''}
${date ? `**تاريخ التمرين:** ${date}` : ''}

**قائمة التمارين المتاحة (استخدم ID المطابق فقط):**
${exerciseList}

**قواعد حقلَي duration و rounds — مهم جداً:**
- "للوقت" (For Time) مع جولات محددة → rounds = عدد الجولات (مثل 5)، duration = التايم كاب بالدقائق (مثل 20)
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP بالدقائق (مثل 15)
- "للوقت" بدون جولات (21-15-9 وما شابه) → rounds = null، duration = التايم كاب (مثل 12)
- "قوة" فقط → rounds = عدد المجموعات (مثل 5)، duration = الوقت التقديري (مثل 30)
- يجب أن يكون duration دائماً رقماً صحيحاً (ليس null)

**المطلوب**: أرجع JSON بالتنسيق التالي بدون أي نص خارجه:
{
  "title": "عنوان التمرين اليومي بالعربية",
  "type": "للوقت | AMRAP | قوة | تدريب",
  "duration": 20,
  "rounds": 5,
  "notes": "ملاحظات مفيدة للمتدربين",
  "theme": "وصف مختصر للرابط بين تمرين القوة والميتكون",
  "warmup": [
    {"exerciseId": "run", "reps": "400م", "weight": "", "distance": "", "time": "", "notes": "إيقاع هادئ"}
  ],
  "strength": [
    {"exerciseId": "back-squat", "reps": "5×5", "weight": "75%", "distance": "", "time": "", "notes": "ركز على العمق"}
  ],
  "metcon": [
    {"exerciseId": "thruster", "reps": "21-15-9", "weight": "43كجم", "distance": "", "time": "", "notes": ""},
    {"exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "distance": "", "time": "", "notes": ""}
  ],
  "cooldown": [
    {"exerciseId": "run", "reps": "", "weight": "", "distance": "400م", "time": "", "notes": "تهدئة خفيفة"}
  ]
}

**قواعد مهمة:**
- استخدم فقط IDs من القائمة أعلاه
- الإحماء: 3-4 تمارين خفيفة تهيئ العضلات للتمرين
- تمرين القوة: 2-4 تمارين مع مجموعات وأوزان محددة
- الميتكون: 3-5 تمارين مكثفة 7-20 دقيقة، مرتبطة بالقوة
- التهدئة: 2-3 تمارين تمطيط
- الأوزان المقترحة مناسبة لمتدربين متوسطي المستوى

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
