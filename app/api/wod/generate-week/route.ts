import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
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

  const startDate = fromDate || new Date().toISOString().split('T')[0];

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

  const exerciseList = EXERCISES.map(e => `${e.id} | ${e.nameAr} | ${e.nameEn} | ${e.category}`).join('\n');

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
    : `**قواعد البرمجة:**
- وزّع: 2-3 أيام CrossFit كلاسيكي، يوم Calisthenics (وزن جسم + جمناستيكس)، يوم Hyrox أو Kettlebell، يوم راحة أو راحة نشطة
- في يوم Calisthenics: اجعل strength عبارة عن تمارين وزن الجسم (pull-up, push-up, dips, pistol-squat) وأضف skill work (handstand, muscle-up progression) في notes
- في بعض الأيام (مرة أسبوعياً): ادمج الكاليسثينكس مع CrossFit بوضع pull-up/muscle-up/handstand-pushup في الميتكون بجانب تمارين الحديد
- لا تكرر نفس التمارين في يومين متتاليين
- اجعل القوة والميتكون مترابطَين (نفس مجموعة العضلات أو نفس الحركة)
- أيام الراحة: warmup وstrength وmetcon وcooldown = مصفوفات فارغة []`;

  const prompt = `أنت مبرمج CrossFit محترف على مستوى CompTrain وPRVN Athletics، بخبرة أكثر من 10 سنوات في تصميم الخطط الأسبوعية. تبرمج بفلسفة الـ Conjugate Method المعدّلة لـ CrossFit: تنويع منهجي بين القوة القصوى والقوة المتفجرة والتحمل.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit — غالبيتهم رجال (18-40 سنة)، أوزان RX للرجال مع scaling للنساء
الخطة: ${weekMode === 'mixed' ? `أسبوع مختلط CrossFit + ${calisthenicsDays === 2 ? 'يومان' : 'يوم'} Calisthenics` : 'أسبوع CrossFit متكامل'}
المدة: ${days} أيام من ${startDate}
المستوى: ${difficulty}
═══════════════════════════════

**التمارين المتاحة (استخدم IDs هذه حصراً):**
${exerciseList}

**التمارين السابقة — تجنّب تكرار نفس التمرين في يومين متتاليين:**
${JSON.stringify(recentWods, null, 2)}

**قواعد حقلَي duration و rounds:**
- "للوقت" مع جولات → rounds = عدد الجولات، duration = التايم كاب بالدقائق
- "AMRAP" → rounds = null، duration = مدة الـ AMRAP
- "للوقت" بدون جولات (21-15-9) → rounds = null، duration = التايم كاب
- "قوة" فقط → rounds = عدد المجموعات، duration = الوقت التقديري
- duration يجب أن يكون دائماً رقماً، rounds قد يكون null

**فلسفة توزيع الأسبوع الاحترافية:**
يوم 1 (ثقيل): قوة مركّبة ثقيلة (85-90%) + ميتكون قصير مكثف (7-12 دقيقة)
يوم 2 (متوسط): قوة متفجرة أوليمبية (70-75%) + ميتكون متوسط (12-18 دقيقة)
يوم 3: راحة أو راحة نشطة (jogging خفيف + تمطيط)
يوم 4 (قوة تحمل): حجم أكبر بأوزان متوسطة (65-70%) + ميتكون طويل (18-25 دقيقة)
يوم 5 (جمناستيكس): تركيز على حركات الجسم + ميتكون مختلط
يوم 6: راحة أو نشاط خفيف (mobility + stretching)
يوم 7: راحة كاملة أو تعافٍ نشط

${programmingRules}

**الأيام المطلوبة:**
${dates.map(d => `- ${d.date} (${d.dayName})`).join('\n')}

**جدول الأوزان المرجعية:**
Back Squat: مبتدئ 50كجم | متوسط 75كجم | متقدم 100كجم
Deadlift: مبتدئ 60كجم | متوسط 95كجم | متقدم 130كجم
Clean & Jerk: مبتدئ 40كجم | متوسط 60كجم | متقدم 85كجم
Thruster: مبتدئ 30كجم | متوسط 43كجم | متقدم 60كجم

أرجع JSON بهذا التنسيق بالضبط (بدون أي نص خارجه):
{
  "wods": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "اسم اليوم",
      "title": "عنوان التمرين — احترافي ومحدد",
      "type": "للوقت | AMRAP | قوة | تدريب | راحة | راحة نشطة",
      "duration": 20,
      "rounds": 3,
      "notes": "استراتيجية الجلسة: كيف تُقسّم التكرارات، ما هو الهدف الزمني لكل مستوى، scaling للمبتدئين",
      "aiTheme": "الرابط التدريبي بين القوة والميتكون هذا اليوم",
      "isRest": false,
      "isCalisthenics": false,
      "warmup": [
        { "exerciseId": "run", "reps": "400م", "weight": "", "notes": "هادئ جداً — إيقاع المحادثة" }
      ],
      "strength": [
        { "exerciseId": "back-squat", "reps": "5×5", "weight": "مبتدئ: 50كجم | متوسط: 75كجم | متقدم: 95كجم", "notes": "عمق كامل — ركبة فوق القدم" }
      ],
      "metcon": [
        { "exerciseId": "thruster", "reps": "21-15-9", "weight": "مبتدئ: 30كجم | متوسط: 43كجم | متقدم: 55كجم", "notes": "قسّمها بذكاء — لا تصل للفشل" },
        { "exerciseId": "pull-up", "reps": "21-15-9", "weight": "", "notes": "مبتدئ: Banded | متوسط: Kipping | متقدم: Strict" }
      ],
      "cooldown": [
        { "exerciseId": "sit-up", "reps": "10", "weight": "", "notes": "تمطيط الوتر الرباعي والظهر السفلي" }
      ]
    }
  ],
  "weekSummary": "ملخص فلسفة الأسبوع: التوزيع، التدرج، الهدف الرئيسي",
  "recoveryTips": ["نصيحة تعافٍ 1 — محددة وعملية", "نصيحة تعافٍ 2", "نصيحة تعافٍ 3"],
  "nutritionNote": "توصية غذائية مرتبطة بحجم التدريب هذا الأسبوع"
}

**مهم جداً:**
- استخدم exerciseId من القائمة فقط
- في كل تمرين قوة: ضع أوزان لثلاثة مستويات (مبتدئ | متوسط | متقدم)
- في الميتكون: ضع scaling واضح لكل تمرين
- أيام الراحة: isRest: true وكل المصفوفات فارغة []
- تنوّع في أنواع الميتكون: لا تكرر نفس النمط (AMRAP/للوقت/EMOM)
- الإحماء: 3-5 تمارين، الأول cardio ثم activation للعضلات المستهدفة`;

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
