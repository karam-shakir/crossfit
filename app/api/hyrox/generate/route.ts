import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAllHyroxSessions } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function analyzeWeekIntensity(sessions: any[]) {
  const last7 = sessions.slice(0, 7);
  const count = last7.length;

  // تتبع المحطات والعضلات المُدرَّبة مع تاريخ كل جلسة
  const sessionLog: { date: string; stations: string[]; strengthEx: string[]; type: string }[] = [];
  last7.forEach(s => {
    const stations = (s.stations || []).map((st: any) => st.name).filter(Boolean);
    const strengthEx = (s.strengthBlock?.exercises || []).map((ex: any) => ex.name).filter(Boolean);
    sessionLog.push({ date: s.date, stations, strengthEx, type: s.sessionType || '' });
  });

  // المحطات التي تدربنا عليها مؤخراً (الأخيرتان بوزن أكبر)
  const recentStations = [...new Set(sessionLog.flatMap(s => s.stations))];
  const recentStrength = [...new Set(sessionLog.flatMap(s => s.strengthEx))];

  // قياس نوع الحمل: كم جلسة simulation (ثقيلة) مقابل strength أو running
  const heavySessions = sessionLog.filter(s => s.type === 'race-sim' || s.type === 'simulation').length;

  // المحطات الغائبة (فرصة لاستهدافها)
  const allStations = ['Ski Erg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jumps', 'Rowing', 'Farmers Carry', 'Sandbag Lunges', 'Wall Balls'];
  const missingStations = allStations.filter(st => !recentStations.includes(st));

  let label: string;
  let recommendation: string;
  if (count >= 4 || heavySessions >= 2) {
    label = 'ثقيل';
    recommendation = `الأسبوع كان ثقيلاً (${count} جلسات، ${heavySessions} simulation) — اجعل هذه جلسة strength أو technique خفيفة. تجنب race-sim اليوم.`;
  } else if (count >= 2 || heavySessions >= 1) {
    label = 'متوسط';
    recommendation = `الأسبوع متوسط — يمكن جلسة strength متوسطة أو simulation بأوزان 75%. استهدف المحطات الغائبة.`;
  } else {
    label = 'خفيف';
    recommendation = `الأسبوع خفيف جداً — الجسم جاهز. اجعلها race-sim كاملة أو strength ثقيلة مع 4-5 محطات.`;
  }

  return { label, recommendation, recentStations, missingStations, recentStrength, sessionLog };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, sessionType, difficulty = 'متوسط' } = body;

  const allSessions = await getAllHyroxSessions();
  const recentSessions = allSessions
    .filter(s => date ? s.date < date : true)
    .slice(0, 7);

  const weekAnalysis = analyzeWeekIntensity(recentSessions);

  const recentSummary = recentSessions.slice(0, 4).map(s => ({
    date: s.date,
    sessionType: s.sessionType,
    stations: (s.stations || []).map((st: any) => st.name).join(', '),
    strength: (s.strengthBlock?.exercises || []).map((ex: any) => ex.name).join(', '),
  }));

  const prompt = `أنت مدرب HYROX محترف معتمد ومبرمج بطولات عالمية. فلسفتك الأساسية: القوة الوظيفية أولاً — الفائز في HYROX هو الأقوى، ليس الأسرع فقط. مهمتك: تصميم جلسة واحدة تخدم جميع المستويات مع أهداف ومتطلبات مختلفة لكل مستوى.

═══════════════════════════════
النادي: مجموعة المطانيخ HYROX
الجمهور: مبتدئون إلى نخبة (رجال ونساء)
الفلسفة: القوة + التحمل + الكفاءة = HYROX Champion
═══════════════════════════════

**═══ تحليل الأسبوع الماضي ═══**
عدد الجلسات في آخر 7 أيام: ${recentSessions.length}
شدة الأسبوع: ${weekAnalysis.label}
توصية اليوم: ${weekAnalysis.recommendation}

المحطات التي تدربنا عليها مؤخراً (قلّل منها أو تجنبها):
${weekAnalysis.recentStations.length ? weekAnalysis.recentStations.map((s: string) => `- ${s}`).join('\n') : '- لا توجد بيانات'}

المحطات الغائبة (استهدفها اليوم بأولوية):
${weekAnalysis.missingStations.length ? weekAnalysis.missingStations.map((s: string) => `- ${s}`).join('\n') : '- جميع المحطات تدربت مؤخراً'}

تمارين القوة الأخيرة (تجنب التكرار):
${weekAnalysis.recentStrength.length ? weekAnalysis.recentStrength.map((s: string) => `- ${s}`).join('\n') : '- لا توجد بيانات'}

سجل الجلسات:
${weekAnalysis.sessionLog.map((s: any) => `${s.date}: [${s.stations.join(' + ') || 'لا محطات'}] | قوة: [${s.strengthEx.join(' + ') || 'لا'}] | نوع: ${s.type}`).join('\n') || 'لا توجد جلسات'}

**الجلسة المطلوبة:**
نوع الجلسة: ${sessionType || 'حسب تحليل الأسبوع'}
الصعوبة العامة: ${difficulty}
${date ? `التاريخ: ${date}` : ''}

**══ المحطات الرسمية وأوزانها ══**

| المحطة | رجال (Rx) | نساء (Rx) | المسافة |
|--------|-----------|-----------|---------|
| Ski Erg | — | — | 1000م |
| Sled Push | 102كجم | 72كجم | 50م |
| Sled Pull | 102كجم | 72كجم | 50م |
| Burpee Broad Jumps | — | — | 80م |
| Rowing | — | — | 1000م |
| Farmers Carry | 32كجم/يد | 24كجم/يد | 200م |
| Sandbag Lunges | 20كجم | 10كجم | 200م |
| Wall Balls | 6كجم/3م | 4كجم/3م | 100 تكرار |

**══ تعديلات الأوزان لكل مستوى ══**

| المستوى | تعديل الوزن | تعديل المسافة | هدف الوقت (البطولة) |
|---------|------------|--------------|---------------------|
| مبتدئ | 50% Rx | 50% المسافة | 110-130 دقيقة |
| متوسط | 75% Rx | 75% المسافة | 90-110 دقيقة |
| متقدم | 90% Rx | 100% المسافة | 75-90 دقيقة |
| نخبة | 100% Rx | 100% + لا توقف | 55-75 دقيقة |

**══ بنية الجلسة الاحترافية ══**

1. **كتلة القوة (قبل الكارديو — دائماً):**
   - 15-25 دقيقة
   - تمارين compound: Deadlift, Squat, Carry, Press
   - 4 مستويات لكل تمرين بأوزان حقيقية
   - هذه الكتلة تميزنا عن مراكز التحمل العادية

2. **المحطات:**
   - 2-5 محطات حسب شدة الأسبوع
   - بين كل محطة: 1000م جري (إلا إذا كانت جلسة تقنية)
   - كل محطة لها 4 مستويات بأوزان ومسافات محددة

3. **التهدئة:**
   - تمطيط نشط للعضلات المُستنزفة
   - عمل على الأنسجة (Foam Roll)

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان احترافي يعكس محاور الجلسة",
  "sessionType": "strength | race-sim | intervals | technique",
  "totalDuration": 65,
  "weekIntensity": "${weekAnalysis.label}",
  "warmup": {
    "duration": 12,
    "description": "لماذا هذا الإحماء تحديداً لهذه الجلسة",
    "movements": [
      {
        "name": "Hip Hinge Activation",
        "duration": "90 ث",
        "intensity": "60%",
        "levels": {
          "beginner": "Good Morning ببار خفيف 20كجم — ظهر مستقيم",
          "intermediate": "Romanian Deadlift 40كجم — تحكم في النزول",
          "advanced": "Single-leg Deadlift وزن الجسم — توازن كامل",
          "elite": "Kettlebell Swing 24كجم × 20 تكرار — ربط حركي"
        }
      }
    ]
  },
  "strengthBlock": {
    "duration": 20,
    "description": "كتلة القوة الوظيفية — أساس أداء HYROX",
    "exercises": [
      {
        "name": "Deadlift",
        "scheme": "4×5",
        "levels": {
          "beginner":     { "weight": "50كجم", "rest": "90 ث", "cue": "رقبتك محايدة — عيناك للأمام" },
          "intermediate": { "weight": "80كجم", "rest": "120 ث", "cue": "الحزام فوق 80كجم — ابدأ بالأرداف" },
          "advanced":     { "weight": "110كجم", "rest": "150 ث", "cue": "ضغط على الأرض — لا تشد الظهر" },
          "elite":        { "weight": "140كجم+", "rest": "180 ث", "cue": "Brace كامل — 360 درجة ضغط" }
        },
        "coachNote": "الرفعة الميتة هي أساس Sled Push وFarmers Carry — من يدرب الرفعة بجدية يتفوق في البطولة"
      }
    ]
  },
  "stations": [
    {
      "order": 1,
      "name": "Ski Erg",
      "runBefore": "1000م",
      "levels": {
        "beginner":     { "distance": "300م", "weight": "", "targetPace": "2:30/500م", "scaling": "إذا لم تعرف الجهاز: شاهد المدرب أولاً" },
        "intermediate": { "distance": "500م", "weight": "", "targetPace": "2:05/500م", "scaling": "" },
        "advanced":     { "distance": "500م", "weight": "", "targetPace": "1:55/500م", "scaling": "" },
        "elite":        { "distance": "500م", "weight": "", "targetPace": "1:45/500م", "scaling": "الدفع بالورك والجسم كله — لا الذراع فقط" }
      },
      "technique": "ابدأ من الأعلى — دع الجاذبية تساعدك في الشد",
      "coachNote": "Ski Erg بعد الجري = تحدٍ حقيقي — حافظ على إيقاعك"
    }
  ],
  "cooldown": {
    "duration": 10,
    "movements": [
      "Hip Flexor Stretch — 60 ث لكل جانب",
      "Hamstring Stretch — 60 ث لكل جانب",
      "Thoracic Rotation — 45 ث لكل جانب",
      "Calf Raises Slow — 20 تكرار بطيء للتعافي"
    ]
  },
  "targetTimes": {
    "beginner": "لا يهم الوقت — الهدف: إنهاء كل محطة بشكل صحيح",
    "intermediate": "أذكر وقتاً محدداً يناسب الجلسة",
    "advanced": "أذكر وقتاً محدداً يناسب الجلسة",
    "elite": "أذكر وقتاً تنافسياً محدداً"
  },
  "nutritionBefore": "وجبة غنية بالكارب 2-3 ساعات قبل: أرز + بروتين خفيف. 30 دقيقة قبل: موزة + قهوة",
  "nutritionAfter": "خلال 30 دقيقة: بروتين سريع الامتصاص + كارب — Whey Shake + موزة أو تمر",
  "coachNote": "نصيحة مخصصة لهذه الجلسة تحديداً تساعد المتدربين على الأداء الأفضل"
}

**قواعد صارمة:**
- كل محطة وكل تمرين في strengthBlock يجب أن يحتوي على levels بـ 4 مستويات
- strengthBlock يأتي قبل stations دائماً
- لا تكرر هذه الحركات التي ظهرت مؤخراً: ${weekAnalysis.usedMovements.slice(0,6).join(', ') || 'لا شيء'}
- الأوزان والمسافات أرقام حقيقية محددة، ليس "حسب مستواك"
- الوقت الإجمالي واقعي ومحسوب بدقة

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    const generated = JSON.parse(jsonText);

    const result = {
      date: date || new Date().toISOString().split('T')[0],
      type: 'hyrox',
      title: generated.title || 'جلسة HYROX',
      sessionType: generated.sessionType || sessionType || 'race-sim',
      totalDuration: generated.totalDuration ?? 65,
      weekIntensity: generated.weekIntensity || weekAnalysis.label,
      warmup: generated.warmup || {},
      strengthBlock: generated.strengthBlock || {},
      stations: generated.stations || [],
      cooldown: generated.cooldown || {},
      targetTimes: generated.targetTimes || {},
      nutritionBefore: generated.nutritionBefore || '',
      nutritionAfter: generated.nutritionAfter || '',
      coachNote: generated.coachNote || '',
    };

    return NextResponse.json({ wod: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
