import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
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

// تحليل شدة الأسبوع الماضي
function analyzeWeekIntensity(recentWods: any[]): { label: string; recommendation: string; musclesHit: string[] } {
  const last7 = recentWods.slice(0, 7);
  const count = last7.length;
  const musclesHit: string[] = [];

  last7.forEach(w => {
    const all = [...(w.strength || []), ...(w.metcon || [])];
    all.forEach((e: any) => {
      const id = e.exerciseId || '';
      if (['back-squat','front-squat','overhead-squat'].includes(id)) musclesHit.push('الرجل/القرفصاء');
      if (['deadlift'].includes(id)) musclesHit.push('السلسلة الخلفية/الرفعة الميتة');
      if (['power-clean','clean-and-jerk','snatch'].includes(id)) musclesHit.push('الأولمبي/الظهر');
      if (['pull-up','kipping-pull-up','muscle-up','rope-climb'].includes(id)) musclesHit.push('السحب/الظهر');
      if (['handstand-pushup','shoulder-press','push-press'].includes(id)) musclesHit.push('الكتف/الضغط');
      if (['thruster','wall-ball'].includes(id)) musclesHit.push('كامل الجسم');
    });
  });

  const unique = [...new Set(musclesHit)];

  if (count >= 5) return { label: 'ثقيل', recommendation: 'أسبوع ثقيل — يجب أن تكون هذه جلسة خفيفة أو متوسطة للتعافي', musclesHit: unique };
  if (count >= 3) return { label: 'متوسط', recommendation: 'أسبوع متوسط — يمكن جلسة متوسطة إلى ثقيلة', musclesHit: unique };
  return { label: 'خفيف', recommendation: 'أسبوع خفيف — الجسم جاهز لجلسة ثقيلة', musclesHit: unique };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, focus, difficulty = 'متوسط', wodMode = 'crossfit' } = body;

  const CALIS_EXERCISES = EXERCISES.filter(e =>
    e.category === 'gymnastics' || ['run','double-under','burpee','box-jump'].includes(e.id)
  );

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');
  const calisExerciseList = CALIS_EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');

  const allWods = await getWods();
  const recentWods = allWods
    .filter(w => date ? w.date < date : true)
    .slice(0, 7);

  const weekAnalysis = analyzeWeekIntensity(recentWods);

  const recentSummary = recentWods.slice(0, 5).map(w => ({
    date: w.date,
    title: w.title,
    type: w.type,
    strength: (w.strength || []).map((e: any) => e.exerciseId).join(', '),
    metcon: (w.metcon || []).map((e: any) => e.exerciseId).join(', '),
    isCalisthenics: w.isCalisthenics || false,
  }));

  const weekContext = `
**═══ تحليل الأسبوع الماضي ═══**
- عدد جلسات آخر 7 أيام: ${recentWods.length}
- شدة الأسبوع: ${weekAnalysis.label}
- المجموعات العضلية التي تم تدريبها: ${weekAnalysis.musclesHit.join(' | ') || 'لا يوجد بيانات'}
- توصية المدرب: ${weekAnalysis.recommendation}

**التمارين السابقة (تجنب تكرار نفس التمارين المذكورة):**
${JSON.stringify(recentSummary, null, 2)}
`;

  const crossfitPrompt = `أنت مبرمج CrossFit على مستوى CompTrain وPRVN Athletics. تعرف مبادئ الحمل التدريجي (Progressive Overload) والدورات التدريبية (Periodization). مهمتك: توليد تمرين واحد يخدم جميع مستويات الصالة في نفس الوقت، مع تركيز حقيقي على الحركات الوظيفية والأثقال لبناء القوة العضلية.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: رجال وبعض النساء (18-40 سنة)
فلسفة النادي: القوة أولاً ثم التحمل — نبني متدربين أقوياء ووظيفيين
═══════════════════════════════

${weekContext}

**الجلسة المطلوبة:**
- الصعوبة العامة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: حسب تحليل الأسبوع'}
${date ? `- التاريخ: ${date}` : ''}

**قائمة التمارين المتاحة (استخدم ID المطابق حصراً):**
${exerciseList}

**══ قواعد البرمجة الذهبية ══**

1. **التمرين الواحد لجميع المستويات:**
   كل تمرين له مستويات 4 واضحة — يدخل الجميع نفس الصالة ويؤدون نفس الحركة بأوزان مختلفة.
   المبتدئ يتعلم الحركة، المتقدم يبني القوة، النخبة يتحدى حدوده.

2. **القوة وظيفية حقيقية:**
   الإحماء: تفعيل عضلي هادئ يهيئ للحركة الرئيسية
   القوة: تمارين compound ثقيلة (squat/deadlift/press/pull) — 70-85% من الـ 1RM
   الميتكون: يكمّل القوة، لا يلغيها — 8-15 دقيقة كافية
   التهدئة: تمطيط إيزومتري للعضلات المُستنزفة

3. **مبدأ التدرج:**
   - إذا كان الأسبوع ثقيل: اجعل القوة متوسطة (3×5 بـ 70%) والميتكون قصير (أقل من 12 دقيقة)
   - إذا كان الأسبوع متوسط: ثقّل القوة (5×3 بـ 80-85%) وميتكون متوسط (12-18 دقيقة)
   - إذا كان الأسبوع خفيف: اجعلها ثقيلة — قوة قصوى + ميتكون مكثف

4. **المجموعات العضلية:**
   - تجنب تدريب نفس المجموعة العضلية يومَين متتاليَين
   - بعد تمارين الساق الثقيلة: اليوم التالي للجسم العلوي
   - بعد الأولمبي: اليوم التالي للجمناستيكس أو الكارديو

**══ معايير الأوزان الدقيقة ══**

تمارين القوة:
| التمرين | مبتدئ (1 سنة-) | متوسط (2-3 سنة) | متقدم (4+ سنة) | نخبة (منافس) |
|---------|---------------|----------------|----------------|--------------|
| Back Squat | 40-50كجم | 65-80كجم | 90-110كجم | 120كجم+ |
| Front Squat | 30-40كجم | 50-65كجم | 70-90كجم | 100كجم+ |
| Deadlift | 50-70كجم | 85-105كجم | 115-140كجم | 155كجم+ |
| Clean & Jerk | 30-40كجم | 55-70كجم | 80-95كجم | 105كجم+ |
| Snatch | 20-30كجم | 40-55كجم | 65-80كجم | 90كجم+ |
| Shoulder Press | 25-35كجم | 45-60كجم | 65-80كجم | 85كجم+ |
| Thruster | 20-30كجم | 35-50كجم | 55-65كجم | 70كجم+ |
| Wall Ball | 6كجم/3م | 9كجم/3م | 9كجم/3م | 9كجم/3م (Rx) |
| KB Swing | 12-16كجم | 20-24كجم | 28-32كجم | 32كجم+ |

**قواعد duration و rounds:**
- "للوقت" مع جولات → rounds = العدد، duration = التايم كاب
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP
- "للوقت" بدون جولات → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = مجموعات القوة، duration = وقت الجلسة
- duration: رقم صحيح دائماً

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان التمرين بالعربية — احترافي يعكس الحركة الرئيسية",
  "type": "للوقت | AMRAP | قوة | EMOM",
  "duration": 20,
  "rounds": null,
  "weekIntensity": "${weekAnalysis.label}",
  "theme": "الفكرة المحورية: لماذا هذه التمارين معاً، ما الذي تبنيه فيزيولوجياً",
  "notes": "ملاحظات للمتدربين: استراتيجية الجلسة، متى تتنفس، علامات الأداء الجيد",
  "warmup": [
    {
      "exerciseId": "run",
      "reps": "400م",
      "weight": "",
      "distance": "400م",
      "time": "",
      "notes": "إيقاع 60% — تنشيط الدورة الدموية فقط، ليس سباقاً"
    }
  ],
  "strength": [
    {
      "exerciseId": "back-squat",
      "reps": "5×4",
      "weight": "75-80%",
      "distance": "",
      "time": "",
      "levels": {
        "beginner":     { "weight": "50كجم", "reps": "5×4", "cue": "عمق موازٍ — خذ وقتك" },
        "intermediate": { "weight": "75كجم", "reps": "5×4", "cue": "عمق كامل — ركبتيك خارجاً" },
        "advanced":     { "weight": "95كجم", "reps": "5×4", "cue": "بحزام — تفعيل البطن قبل النزول" },
        "elite":        { "weight": "115كجم", "reps": "5×4", "cue": "Pause Squat 2 ث في الأسفل" }
      },
      "notes": "راحة 2-3 دقائق بين المجموعات — جودة الحركة قبل الثقل"
    }
  ],
  "metcon": [
    {
      "exerciseId": "thruster",
      "reps": "21-15-9",
      "weight": "",
      "distance": "",
      "time": "",
      "levels": {
        "beginner":     { "weight": "30كجم", "scaling": "Push Press مع كرة إلى الأمام بدلاً من Thruster" },
        "intermediate": { "weight": "43كجم", "scaling": "" },
        "advanced":     { "weight": "55كجم", "scaling": "" },
        "elite":        { "weight": "65كجم", "scaling": "Squat Clean into Thruster" }
      },
      "notes": "قسّم التكرارات: 12-9 ثم 8-7 ثم لا تتوقف في الـ 9"
    }
  ],
  "cooldown": [
    {
      "exerciseId": "sit-up",
      "reps": "",
      "weight": "",
      "distance": "",
      "time": "60 ث",
      "notes": "تمطيط الوتر الرباعي والظهر السفلي — أمسك بثبات"
    }
  ]
}

**قواعد صارمة:**
- استخدم IDs من القائمة أعلاه فقط
- كل تمرين في strength و metcon يجب أن يحتوي على حقل "levels" بـ 4 مستويات
- كل مستوى يحتوي على: weight, reps (أو scaling), cue (نقطة تقنية مخصصة)
- الإحماء: 3-4 تمارين، الأول cardio ثم تفعيل عضلي مرتبط بتمارين القوة
- القوة: 2-3 تمارين compound ثقيلة مع أوزان حقيقية لكل مستوى
- الميتكون: 3-5 تمارين، مكثف ومرتبط بالقوة (تجنب تكرار نفس المجموعة العضلية)
- التهدئة: 2-3 تمارين للمناطق الأكثر إجهاداً

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  const calisthenicsPrompt = `أنت مدرب Calisthenics وGST (Gymnastics Strength Training) محترف. فلسفتك: بناء قوة حقيقية بوزن الجسم — الجسم هو الوزن، والتدرج هو الأداة. كل جلسة تخدم جميع المستويات في نفس الوقت.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الفلسفة: Calisthenics = قوة وظيفية كاملة، ليس مجرد تكرارات
التركيز: حركات مقاومة (weighted options متاحة للمتقدمين)
═══════════════════════════════

${weekContext}

**الجلسة المطلوبة:**
- الصعوبة العامة: ${difficulty}
${focus ? `- التركيز: ${focus}` : '- التركيز: حسب تحليل الأسبوع'}
${date ? `- التاريخ: ${date}` : ''}

**قائمة التمارين المتاحة:**
${calisExerciseList}

**══ منهج الـ 4 مستويات في Calisthenics ══**

| الحركة | مبتدئ | متوسط | متقدم | نخبة |
|--------|-------|-------|-------|------|
| Pull | Band Pull-up | Strict Pull-up | Weighted Pull-up (+10كجم) | Muscle-up |
| Push | Knee Push-up | Strict Push-up | Weighted Push-up (+15كجم) | Handstand Push-up |
| Core | Sit-up | Toes-to-Bar (بند) | Toes-to-Bar (strict) | L-Sit 30 ث |
| Hinge | Good Morning | KB Swing | Single-leg Deadlift | GHD |
| Skill | Negative Pull-up | Kipping Pull-up | Strict HSPU | Freestanding HSPU |
| Carry | Bodyweight Lunges | Box Jump | Weighted Vest Lunge | Pistol Squat |

**قواعد البرمجة:**
- Skill Work أولاً (حركات تقنية عندما تكون الطاقة كاملة)
- Strength ثانياً (حركات مقاومة — weighted options للمتقدمين والنخبة)
- Metcon آخراً (التحمل العضلي والقلبي)
- التهدئة: إطالة عميقة للمجموعات المُستنزفة

أرجع JSON بنفس بنية CrossFit بالضبط (مع levels لكل تمرين):
{
  "title": "...",
  "type": "للوقت | AMRAP | تدريب",
  "duration": 20,
  "rounds": null,
  "weekIntensity": "${weekAnalysis.label}",
  "theme": "...",
  "notes": "...",
  "warmup": [ { "exerciseId": "...", "reps": "...", "weight": "", "distance": "", "time": "", "notes": "..." } ],
  "strength": [
    {
      "exerciseId": "pull-up",
      "reps": "5×4",
      "weight": "",
      "distance": "", "time": "",
      "levels": {
        "beginner":     { "weight": "Band مساعدة 20كجم", "reps": "5×4", "cue": "Negative فقط إذا تعذّر الإتمام" },
        "intermediate": { "weight": "وزن الجسم", "reps": "5×4", "cue": "Strict — لا kipping في القوة" },
        "advanced":     { "weight": "+10كجم حزام", "reps": "5×3", "cue": "تحكم كامل في الصعود والنزول" },
        "elite":        { "weight": "+20كجم حزام", "reps": "4×3", "cue": "Pause 2 ث في الأعلى" }
      },
      "notes": "راحة 90 ث — جودة الحركة أهم من العدد"
    }
  ],
  "metcon": [ { "exerciseId": "...", "reps": "...", "weight": "", "distance": "", "time": "", "levels": { "beginner": {"weight":"","scaling":""}, "intermediate":{"weight":"","scaling":""}, "advanced":{"weight":"","scaling":""}, "elite":{"weight":"","scaling":""} }, "notes": "..." } ],
  "cooldown": [ { "exerciseId": "...", "reps": "", "weight": "", "distance": "", "time": "60 ث", "notes": "..." } ]
}

قواعد صارمة: استخدم IDs من القائمة فقط، weight فارغ في الإحماء والتهدئة، كل تمرين في strength/metcon له levels.
أرجع JSON فقط.`;

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
        exerciseId: item.exerciseId,
        reps:       item.reps || '',
        weight:     item.weight || '',
        distance:   item.distance || '',
        time:       item.time || '',
        notes:      item.notes || '',
        levels:     item.levels || null,
      }));

    const wodData = {
      date:           date || new Date().toISOString().split('T')[0],
      title:          generated.title || (wodMode === 'calisthenics' ? 'تمرين Calisthenics' : 'تمرين يومي'),
      type:           generated.type || 'للوقت',
      isCalisthenics: wodMode === 'calisthenics',
      duration:       generated.duration ?? 20,
      rounds:         generated.rounds ?? null,
      weekIntensity:  generated.weekIntensity || weekAnalysis.label,
      notes:          generated.notes || '',
      aiTheme:        generated.theme || '',
      warmup:         validateSection(generated.warmup),
      strength:       validateSection(generated.strength),
      metcon:         validateSection(generated.metcon),
      cooldown:       validateSection(generated.cooldown),
    };

    return NextResponse.json({ wod: wodData, theme: generated.theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
