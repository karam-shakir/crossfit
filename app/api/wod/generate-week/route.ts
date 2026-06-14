import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getWods } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXERCISES = [
  { id: 'back-squat',       nameEn: 'Back Squat',         nameAr: 'القرفصاء الخلفية',      category: 'strength'   },
  { id: 'front-squat',      nameEn: 'Front Squat',        nameAr: 'القرفصاء الأمامية',      category: 'strength'   },
  { id: 'deadlift',         nameEn: 'Deadlift',           nameAr: 'الرفعة الميتة',          category: 'strength'   },
  { id: 'power-clean',      nameEn: 'Power Clean',        nameAr: 'النظيفة القوية',         category: 'olympic'    },
  { id: 'clean-and-jerk',   nameEn: 'Clean & Jerk',       nameAr: 'النظيفة والدفع',         category: 'olympic'    },
  { id: 'snatch',           nameEn: 'Snatch',             nameAr: 'الخطف',                  category: 'olympic'    },
  { id: 'overhead-squat',   nameEn: 'Overhead Squat',     nameAr: 'القرفصاء فوق الرأس',    category: 'strength'   },
  { id: 'shoulder-press',   nameEn: 'Shoulder Press',     nameAr: 'الضغط فوق الرأس',       category: 'strength'   },
  { id: 'push-press',       nameEn: 'Push Press',         nameAr: 'الدفع بالساقين',         category: 'strength'   },
  { id: 'thruster',         nameEn: 'Thruster',           nameAr: 'الثراستر',               category: 'wod'        },
  { id: 'pull-up',          nameEn: 'Pull Up',            nameAr: 'العقلة',                 category: 'gymnastics' },
  { id: 'kipping-pull-up',  nameEn: 'Kipping Pull Up',    nameAr: 'العقلة الكيبينج',        category: 'gymnastics' },
  { id: 'muscle-up',        nameEn: 'Muscle Up',          nameAr: 'الماسل أب',              category: 'gymnastics' },
  { id: 'handstand-pushup', nameEn: 'Handstand Push Up',  nameAr: 'الضغط على اليدين',      category: 'gymnastics' },
  { id: 'handstand-walk',   nameEn: 'Handstand Walk',     nameAr: 'المشي على اليدين',      category: 'gymnastics' },
  { id: 'toes-to-bar',      nameEn: 'Toes to Bar',        nameAr: 'الأصابع للعارضة',       category: 'gymnastics' },
  { id: 'double-under',     nameEn: 'Double Under',       nameAr: 'القفز المزدوج',          category: 'cardio'     },
  { id: 'box-jump',         nameEn: 'Box Jump',           nameAr: 'القفز على الصندوق',      category: 'wod'        },
  { id: 'burpee',           nameEn: 'Burpee',             nameAr: 'البيربي',                category: 'cardio'     },
  { id: 'wall-ball',        nameEn: 'Wall Ball',          nameAr: 'كرة الحائط',             category: 'wod'        },
  { id: 'kettle-bell-swing',nameEn: 'Kettlebell Swing',   nameAr: 'هزة الكيتل بيل',        category: 'wod'        },
  { id: 'row',              nameEn: 'Row',                nameAr: 'التجديف',                category: 'cardio'     },
  { id: 'run',              nameEn: 'Run',                nameAr: 'الجري',                  category: 'cardio'     },
  { id: 'push-up',          nameEn: 'Push Up',            nameAr: 'الضغط',                  category: 'gymnastics' },
  { id: 'sit-up',           nameEn: 'Sit Up',             nameAr: 'الجلوس',                 category: 'gymnastics' },
  { id: 'rope-climb',       nameEn: 'Rope Climb',         nameAr: 'تسلق الحبل',             category: 'gymnastics' },
];

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { fromDate, days = 7, difficulty = 'متوسط', weekMode = 'crossfit', calisthenicsDays = 1 } = body;

  const startDate = fromDate || todaySA();

  // Build list of dates
  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    dates.push({
      date: d.toISOString().split('T')[0],
      dayName: DAY_NAMES[d.getDay()] || '',
    });
  }

  // Get recent WODs for context
  const allWods = await getWods();
  const recentWods = allWods
    .filter(w => w.date < startDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .map(w => ({
      date: w.date, title: w.title, type: w.type,
      strength: (w.strength || []).map((e: any) => e.exerciseId).join(', '),
      metcon: (w.metcon || []).map((e: any) => e.exerciseId).join(', '),
    }));

  const exerciseList = EXERCISES.map(e => `${e.id} | ${e.nameEn} | ${e.category}`).join('\n');

  // Build programming rules based on weekMode
  const programmingRules = weekMode === 'mixed'
    ? `**قواعد البرمجة — أسبوع مختلط CrossFit + Calisthenics:**
- خصص ${calisthenicsDays === 2 ? 'يومَين' : 'يوماً واحداً'} كاملاً لـ Calisthenics (وزن الجسم البحت) من أصل الأيام المطلوبة
- باقي الأيام: CrossFit كلاسيكي + يوم راحة أو راحة نشطة
- أيام Calisthenics: اجعل نوع اليوم "تدريب" وضع isCalisthenics: true
  - strength: تمارين وزن الجسم فقط (pull-up, push-up, muscle-up, handstand-pushup, rope-climb)
  - metcon: circuit من وزن الجسم (burpee, box-jump, double-under, sit-up, toes-to-bar, pull-up, push-up)
  - notes: اذكر أن هذا يوم Calisthenics
  - aiTheme: "Calisthenics — وزن الجسم كامل"
- لا تضع أي أوزان حديد في أيام Calisthenics
- وزّع أيام Calisthenics على مدار الأسبوع بشكل متوازن (ليست يومين متتاليين)
- لا تكرر نفس التمارين في يومين متتاليين
- اجعل القوة والميتكون مترابطَين في أيام CrossFit
- أيام الراحة: warmup وstrength وmetcon وcooldown = مصفوفات فارغة []`
    : `**قواعد البرمجة — CrossFit كامل (بدون Calisthenics):**
- هذا أسبوع CrossFit خالص — لا يوم Calisthenics ولا يوم Hyrox ولا Kettlebell
- كل يوم نشاط هو CrossFit كلاسيكي: قوة بالبار + ميتكون مع أوزان
- تمارين القوة (strength): يجب أن تكون بالبار حصراً (back-squat, deadlift, front-squat, overhead-squat, power-clean, clean-and-jerk, snatch, shoulder-press, push-press, thruster)
- الميتكون: يجمع تمارين الحديد مع cardio وgymnastics — مسموح بـ pull-up وtoes-to-bar ودبل أندر في الميتكون فقط
- وزّع الأيام: HEAVY (1-2 مرة) + MEDIUM (2-3 مرة) + SKILL (مرة) + REST (1-2 مرة)
- يوم SKILL: تقنية أولمبية (snatch, clean) أو جمناستيكس (muscle-up, handstand) — مع ميتكون قصير
- لا تكرر نفس التمارين في يومين متتاليين
- اجعل القوة والميتكون مترابطَين (نفس مجموعة العضلات أو نفس الحركة)
- أيام الراحة: isRest: true وكل المصفوفات فارغة []`;

  const prompt = `أنت مبرمج CrossFit محترف على مستوى CompTrain وPRVN Athletics. تصمم خططاً أسبوعية بفلسفة: القوة الوظيفية أولاً — كل جلسة تخدم جميع المستويات في آن واحد مع أوزان وscaling واضحة لكل مستوى.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
الجمهور: رجال ونساء (18-40 سنة)، 4 مستويات
الفلسفة: تمرين واحد لجميع المستويات — مبتدئ يتعلم، نخبة يتحدى
الخطة: ${weekMode === 'mixed' ? `أسبوع مختلط CrossFit + ${calisthenicsDays === 2 ? 'يومان' : 'يوم'} Calisthenics` : 'أسبوع CrossFit خالص — بدون Calisthenics أو Hyrox أو Kettlebell'}
المدة: ${days} أيام من ${startDate}
المستوى العام: ${difficulty}
═══════════════════════════════

**التمارين المتاحة (استخدم IDs هذه حصراً):**
${exerciseList}

**الأسبوع الماضي (تجنّب تكرار نفس التمارين والمجموعات العضلية في يومين متتاليين):**
${JSON.stringify(recentWods, null, 2)}

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات → rounds = العدد، duration = التايم كاب
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = المجموعات، duration = الوقت التقديري
- duration رقم دائماً، rounds قد يكون null

**══ فلسفة توزيع الأسبوع الاحترافية ══**

يوم HEAVY (1-2 مرة/أسبوع): قوة compound ثقيلة (80-90% 1RM) + ميتكون قصير (8-12 دقيقة)
يوم MEDIUM (2-3 مرة/أسبوع): قوة أوليمبية أو تحمل (65-75%) + ميتكون متوسط (12-18 دقيقة)
يوم SKILL (مرة/أسبوع): جمناستيكس + تقنية + ميتكون مختلط
يوم DELOAD/REST: راحة كاملة أو تعافٍ نشط خفيف

مبدأ التنوع الأسبوعي:
- الأيام المتتالية: لا تكرر نفس المجموعة العضلية (ساق/ظهر/كتف)
- تنوع الميتكون: AMRAP → للوقت → EMOM → للوقت → AMRAP
- تنوع القوة: Squat pattern → Hinge pattern → Press pattern → Pull pattern

${programmingRules}

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

**══ معايير الأوزان الدقيقة لكل مستوى ══**
Back Squat: مبتدئ 50كجم | متوسط 75كجم | متقدم 95كجم | نخبة 115كجم
Deadlift: مبتدئ 60كجم | متوسط 90كجم | متقدم 120كجم | نخبة 150كجم
Clean & Jerk: مبتدئ 35كجم | متوسط 55كجم | متقدم 80كجم | نخبة 100كجم
Snatch: مبتدئ 25كجم | متوسط 45كجم | متقدم 65كجم | نخبة 85كجم
Thruster: مبتدئ 30كجم | متوسط 43كجم | متقدم 55كجم | نخبة 65كجم
Wall Ball: مبتدئ 6كجم | متوسط 9كجم | متقدم 9كجم | نخبة 9كجم Rx
KB Swing: مبتدئ 16كجم | متوسط 24كجم | متقدم 28كجم | نخبة 32كجم

أرجع JSON بهذا التنسيق (بدون أي نص خارجه):
{
  "wods": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "title": "عنوان احترافي بالعربية يعكس الحركة الرئيسية والهدف",
      "titleEn": "Professional English title — e.g. 'Heavy Front Squat + Anterior Chain MetCon'",
      "type": "للوقت | AMRAP | قوة | تدريب | راحة | راحة نشطة",
      "duration": 20,
      "rounds": null,
      "notes": "استراتيجية الجلسة: كيف يُقسّم المتدرب طاقته، ما هو الهدف الزمني لكل مستوى",
      "aiTheme": "الرابط الفيزيولوجي والحركي بين القوة والميتكون هذا اليوم",
      "isRest": false,
      "isCalisthenics": false,
      "warmup": [
        { "exerciseId": "run", "reps": "400م", "weight": "", "notes": "60% إيقاع — تنشيط الدورة الدموية" }
      ],
      "strength": [
        {
          "exerciseId": "back-squat",
          "reps": "5×4",
          "weight": "",
          "notes": "عمق كامل — ركبة فوق القدم — راحة 2-3 دقيقة",
          "levels": {
            "beginner":     {"weight": "50كجم",  "reps": "5×4", "cue": "عمق موازٍ — ظهر مستقيم"},
            "intermediate": {"weight": "75كجم",  "reps": "5×4", "cue": "عمق كامل — ركبة وفق القدم"},
            "advanced":     {"weight": "95كجم",  "reps": "5×4", "cue": "سرعة في الصعود — حزام"},
            "elite":        {"weight": "115كجم", "reps": "5×4", "cue": "Pause 2ث في الأسفل"}
          }
        }
      ],
      "metcon": [
        {
          "exerciseId": "thruster",
          "reps": "21-15-9",
          "weight": "",
          "notes": "قسّم: 12-9 ثم 8-7 ثم لا توقف في الـ 9",
          "levels": {
            "beginner":     {"weight": "30كجم", "reps": "21-15-9", "cue": "توقف عند الحاجة — لا تصل للفشل"},
            "intermediate": {"weight": "43كجم", "reps": "21-15-9", "cue": "قسّم بذكاء — إيقاع ثابت"},
            "advanced":     {"weight": "55كجم", "reps": "21-15-9", "cue": "Unbroken الـ 9 الأخيرة"},
            "elite":        {"weight": "65كجم", "reps": "21-15-9", "cue": "Unbroken كامل — سرعة"}
          }
        },
        {
          "exerciseId": "pull-up",
          "reps": "21-15-9",
          "weight": "",
          "notes": "مجموعات صغيرة — لا تصل للفشل الكامل",
          "levels": {
            "beginner":     {"weight": "", "reps": "21-15-9", "cue": "Banded Pull-up أو Ring Row"},
            "intermediate": {"weight": "", "reps": "21-15-9", "cue": "Kipping مسموح"},
            "advanced":     {"weight": "", "reps": "21-15-9", "cue": "Butterfly للسرعة"},
            "elite":        {"weight": "", "reps": "21-15-9", "cue": "Chest-to-Bar"}
          }
        }
      ],
      "cooldown": [
        { "exerciseId": "run",    "reps": "", "weight": "", "distance": "400م", "notes": "مشي هادئ — خفّف معدل القلب" },
        { "exerciseId": "push-up","reps": "", "weight": "", "time": "45 ث",     "notes": "بطيء — تمطيط الصدر والكتف" }
      ]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع الحمل، مراحل التدرج، الهدف الرئيسي لهذا الأسبوع تحديداً",
  "recoveryTips": ["نصيحة تعافٍ محددة وعملية 1", "نصيحة 2", "نصيحة 3"],
  "nutritionNote": "توصية غذائية مرتبطة بحجم التدريب هذا الأسبوع — كارب وبروتين وتوقيت"
}

**قواعد صارمة:**
- استخدم exerciseId من القائمة فقط — لا تخترع IDs
- كل تمرين في strength وmetcon يجب أن يحتوي على حقل "levels" بالمستويات الأربعة (beginner/intermediate/advanced/elite) مع weight وreps وcue
- weight في levels: الوزن المحدد لهذا المستوى فقط (مثال: "75كجم") — وليس نص طويل
- cue في levels: نصيحة تقنية قصيرة للمستوى
- الإحماء والتهدئة: بدون levels
- التهدئة: اختر تمارين تمطيط تناسب عضلات اليوم — لا تستخدم sit-up دائماً
- أيام الراحة: isRest: true وكل المصفوفات فارغة []
- لا تكرر نمط الميتكون في يومين متتاليين (AMRAP/للوقت/EMOM يتناوبان)
- الإحماء: 3-4 تمارين — الأول cardio ثم activation للعضلات المستهدفة
- كل يوم نشاط: strength لا يقل عن تمرينَين compound

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
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
