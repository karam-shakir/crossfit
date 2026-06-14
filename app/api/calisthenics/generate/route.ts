import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { getAllCalisthenicsSessions } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXERCISES = [
  { id: 'pull-up',           nameEn: 'Pull Up',            nameAr: 'العقلة',              category: 'pull'       },
  { id: 'kipping-pull-up',   nameEn: 'Kipping Pull Up',    nameAr: 'العقلة الكيبينج',     category: 'pull'       },
  { id: 'muscle-up',         nameEn: 'Muscle Up',          nameAr: 'الماسل أب',           category: 'pull'       },
  { id: 'handstand-pushup',  nameEn: 'Handstand Push Up',  nameAr: 'ضغط اليدين',          category: 'push'       },
  { id: 'push-up',           nameEn: 'Push Up',            nameAr: 'الضغط',               category: 'push'       },
  { id: 'toes-to-bar',       nameEn: 'Toes to Bar',        nameAr: 'الأصابع للعارضة',     category: 'core'       },
  { id: 'sit-up',            nameEn: 'Sit Up',             nameAr: 'الجلوس',              category: 'core'       },
  { id: 'box-jump',          nameEn: 'Box Jump',           nameAr: 'القفز على الصندوق',   category: 'lower'      },
  { id: 'double-under',      nameEn: 'Double Under',       nameAr: 'القفز المزدوج',       category: 'cardio'     },
  { id: 'burpee',            nameEn: 'Burpee',             nameAr: 'البيربي',             category: 'cardio'     },
  { id: 'run',               nameEn: 'Run',                nameAr: 'الجري',               category: 'cardio'     },
  { id: 'handstand-walk',    nameEn: 'Handstand Walk',     nameAr: 'المشي على اليدين',    category: 'skill'      },
  { id: 'rope-climb',        nameEn: 'Rope Climb',         nameAr: 'تسلق الحبل',          category: 'pull'       },
];

function analyzeWeekIntensity(sessions: any[]) {
  const last7 = sessions.slice(0, 7);
  const count = last7.length;

  // تتبع تفصيلي: الأنماط الحركية + التمارين المحددة + الشدة
  const sessionLog: { date: string; patterns: string[]; exercises: string[]; hasSkill: boolean }[] = [];

  const PULL_EX = ['pull-up','kipping-pull-up','muscle-up','rope-climb'];
  const PUSH_EX = ['handstand-pushup','push-up'];
  const CORE_EX = ['toes-to-bar','sit-up'];
  const LOWER_EX = ['box-jump'];
  const CARDIO_EX = ['double-under','run','burpee'];
  const SKILL_EX = ['muscle-up','handstand-pushup','handstand-walk','rope-climb'];

  last7.forEach(s => {
    const allEx = [...(s.strength || []), ...(s.skillWork || []), ...(s.metcon || [])].map((e: any) => e.exerciseId);
    const patterns: string[] = [];
    if (allEx.some(id => PULL_EX.includes(id))) patterns.push('سحب/ظهر');
    if (allEx.some(id => PUSH_EX.includes(id))) patterns.push('دفع/كتف');
    if (allEx.some(id => CORE_EX.includes(id))) patterns.push('جذع/بطن');
    if (allEx.some(id => LOWER_EX.includes(id))) patterns.push('رجل/قفز');
    if (allEx.some(id => CARDIO_EX.includes(id))) patterns.push('كارديو');
    const hasSkill = allEx.some(id => SKILL_EX.includes(id));
    sessionLog.push({ date: s.date, patterns, exercises: allEx, hasSkill });
  });

  // تجميع الأنماط وحساب التكرار
  const allPatterns = sessionLog.flatMap(s => s.patterns);
  const patternFreq: Record<string, number> = {};
  allPatterns.forEach(p => { patternFreq[p] = (patternFreq[p] || 0) + 1; });

  const overtrainedPatterns = Object.entries(patternFreq).filter(([, v]) => v >= 2).map(([k]) => k);
  const allPossiblePatterns = ['سحب/ظهر', 'دفع/كتف', 'جذع/بطن', 'رجل/قفز', 'كارديو'];
  const neglectedPatterns = allPossiblePatterns.filter(p => !allPatterns.includes(p));

  // آخر مرة تدرب كل نمط
  const lastTrainedPull = sessionLog.find(s => s.patterns.includes('سحب/ظهر'))?.date;
  const lastTrainedPush = sessionLog.find(s => s.patterns.includes('دفع/كتف'))?.date;
  const daysSincePull = lastTrainedPull ? Math.round((new Date().getTime() - new Date(lastTrainedPull).getTime()) / 86400000) : 99;
  const daysSincePush = lastTrainedPush ? Math.round((new Date().getTime() - new Date(lastTrainedPush).getTime()) / 86400000) : 99;

  let label: string;
  let recommendation: string;
  if (count >= 5) {
    label = 'ثقيل';
    recommendation = `أسبوع ثقيل (${count} جلسات) — اجعل هذه جلسة Skill خفيفة أو Mobility. ${overtrainedPatterns.length ? `تجنب خاصة: ${overtrainedPatterns.join(' و')}` : ''}`;
  } else if (count >= 3) {
    label = 'متوسط';
    const focus = neglectedPatterns.length ? `ركز اليوم على: ${neglectedPatterns.join(' و')}` : 'جميع الأنماط تدربت — تنوع بين القوة والمهارة';
    recommendation = `أسبوع متوسط (${count} جلسات) — ${focus}. ${daysSincePull >= 2 && daysSincePush >= 2 ? 'السحب والدفع متعافيان.' : daysSincePull >= 2 ? 'يوم السحب مناسب.' : daysSincePush >= 2 ? 'يوم الدفع مناسب.' : ''}`;
  } else {
    label = 'خفيف';
    recommendation = `أسبوع خفيف (${count} جلسات فقط) — الجسم جاهز. اجعلها جلسة قوة ثقيلة. ${neglectedPatterns.length ? `استهدف: ${neglectedPatterns.join(' و')}` : 'اختر المجموعة التي تريد تطويرها.'}`;
  }

  return { label, recommendation, overtrainedPatterns, neglectedPatterns, sessionLog, daysSincePull, daysSincePush };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, focus, difficulty = 'متوسط' } = body;

  const allSessions = await getAllCalisthenicsSessions();
  const recentSessions = allSessions
    .filter(s => date ? s.date < date : true)
    .slice(0, 7);

  const weekAnalysis = analyzeWeekIntensity(recentSessions);

  const recentSummary = recentSessions.slice(0, 5).map(s => ({
    date: s.date,
    title: s.title,
    strength: (s.strength || []).map((e: any) => e.exerciseId).join(', '),
    metcon: (s.metcon || []).map((e: any) => e.exerciseId).join(', '),
  }));

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn}) [${e.category}]`).join('\n');

  const prompt = `أنت مدرب Calisthenics وGST (Gymnastics Strength Training) محترف. فلسفتك: الجسم نفسه هو الوزن والأداة والمعلم — والتدرج هو الطريق الوحيد للقوة الحقيقية. مهمتك: جلسة واحدة تخدم جميع المستويات في نفس الوقت، مع تركيز حقيقي على بناء القوة العضلية بالحركات الوظيفية.

═══════════════════════════════
النادي: مجموعة المطانيخ CrossFit
القسم: Calisthenics / Gymnastics Strength
الفلسفة: من Push-up إلى Muscle-up — كل شيء مبني على الأساس
═══════════════════════════════

**═══ تحليل الأسبوع الماضي ═══**
عدد الجلسات في آخر 7 أيام: ${recentSessions.length}
شدة الأسبوع: ${weekAnalysis.label}
توصية اليوم: ${weekAnalysis.recommendation}

الأنماط الحركية المُجهَدة (قلّل منها اليوم):
${weekAnalysis.overtrainedPatterns.length ? weekAnalysis.overtrainedPatterns.map((p: string) => `- ${p}`).join('\n') : '- لا يوجد إجهاد تراكمي'}

الأنماط المُهمَلة (استهدفها اليوم بأولوية):
${weekAnalysis.neglectedPatterns.length ? weekAnalysis.neglectedPatterns.map((p: string) => `- ${p}`).join('\n') : '- جميع الأنماط تدربت بشكل متوازن'}

آخر تدريب للسحب: ${weekAnalysis.daysSincePull < 99 ? `منذ ${weekAnalysis.daysSincePull} أيام` : 'لم يُدرَّب هذا الأسبوع'}
آخر تدريب للدفع: ${weekAnalysis.daysSincePush < 99 ? `منذ ${weekAnalysis.daysSincePush} أيام` : 'لم يُدرَّب هذا الأسبوع'}

سجل الجلسات:
${weekAnalysis.sessionLog.map((s: any) => `${s.date}: [${s.patterns.join(' + ') || 'لا أنماط'}]${s.hasSkill ? ' + Skill Work' : ''}`).join('\n') || 'لا توجد جلسات'}

**الجلسة المطلوبة:**
التركيز: ${focus || 'حسب التحليل'}
الصعوبة: ${difficulty}
${date ? `التاريخ: ${date}` : ''}

**قائمة التمارين المتاحة (استخدم ID فقط):**
${exerciseList}

**══ نظام الـ 4 مستويات في Calisthenics ══**

| الحركة | مبتدئ | متوسط | متقدم | نخبة |
|--------|-------|-------|-------|------|
| **Pull** | Negative Pull-up أو Band | Strict Pull-up | Weighted Pull-up (+10كجم) | Muscle-up |
| **Push** | Knee Push-up | Strict Push-up | Weighted Push-up (+15كجم) أو Ring Push-up | HSPU Strict |
| **Core** | Sit-up | K2E (ركبة للصدر) | Toes-to-Bar Strict | L-Sit 20-30 ث |
| **Lower** | Squat | Box Jump | Pistol Squat وزن الجسم | Pistol + وزن |
| **Skill** | Dead Hang 20 ث | Bar Hang Passive 30 ث | False Grip Hold | Muscle-up Transition |
| **Cardio** | Single Under | Double Under 20 | Double Under 50 | Double Under 100 |

**══ مبادئ البرمجة ══**

1. **Skill Work أولاً** (عندما تكون طاقة الجهاز العصبي كاملة):
   - التقنيات الجديدة والصعبة في أول 15 دقيقة
   - لا تقدم Muscle-up Skill بعد جلسة قوة مرهقة

2. **Strength ثانياً** (بناء القوة الأساسية):
   - Weighted options للمتقدمين (حزام أو صدرية)
   - Negatives للمبتدئين (Eccentric = بناء قوة أسرع)
   - 3-5 مجموعات، 4-6 تكرارات للقوة الحقيقية

3. **Metcon آخراً** (التحمل العضلي):
   - يرتكز على حركات أخف من القوة
   - لا تكرر نفس الحركة في القوة والميتكون

4. **التهدئة: إطالة عضلية حقيقية**:
   - Lat Stretch، Chest Stretch، Shoulder Flexion
   - الجمناستيكس = إطالة ضرورية ليست اختيارية

**تعديلات الوزن:**
- مبتدئ: Band مساعدة أو Negative فقط
- متوسط: وزن الجسم Strict
- متقدم: +5 إلى +15كجم حزام ثقل
- نخبة: +20كجم أو متغير اليد الواحدة أو حركة أصعب

أرجع JSON بهذا التنسيق بدون أي نص خارجه:
{
  "title": "عنوان احترافي (مثال: ضغط القوة — HSPU & Ring Push Circuit)",
  "type": "تدريب | للوقت | AMRAP",
  "duration": 50,
  "rounds": null,
  "weekIntensity": "${weekAnalysis.label}",
  "theme": "الفكرة الجوهرية: ما الذي يبنيه هذا التمرين فيزيولوجياً وحركياً",
  "notes": "استراتيجية الجلسة للمتدرب: كيف يدير طاقته",
  "warmup": [
    {
      "exerciseId": "run",
      "reps": "400م",
      "weight": "",
      "distance": "400م",
      "time": "",
      "notes": "إيقاع 60% — تحضير للحركات الجمناستيكية"
    },
    {
      "exerciseId": "pull-up",
      "reps": "3×3",
      "weight": "",
      "distance": "",
      "time": "",
      "notes": "Scapular Pull-up — تنشيط لوح الكتف قبل القوة"
    }
  ],
  "skillWork": [
    {
      "exerciseId": "muscle-up",
      "reps": "10 دقائق ممارسة مستمرة",
      "weight": "",
      "distance": "",
      "time": "10 دقائق",
      "levels": {
        "beginner":     { "weight": "", "reps": "False Grip Dead Hang × 4 × 15 ث", "cue": "الهدف: الإمساك بالـ False Grip لمدة 15 ث" },
        "intermediate": { "weight": "", "reps": "Jumping Muscle-up × 5", "cue": "الدفع في الأعلى — ليس الشد فقط" },
        "advanced":     { "weight": "", "reps": "Strict Muscle-up × 3-5", "cue": "Low transition — لا ترفع الكوع للخارج" },
        "elite":        { "weight": "", "reps": "Weighted Muscle-up +5كجم × 3", "cue": "Controlled descent — إنزال بطيء 3 ث" }
      },
      "notes": "Skill Work = ممارسة لا إرهاق — توقف عند أول علامة تعب"
    }
  ],
  "strength": [
    {
      "exerciseId": "pull-up",
      "reps": "5×4",
      "weight": "",
      "distance": "",
      "time": "",
      "levels": {
        "beginner":     { "weight": "Band مساعدة 15-20كجم", "reps": "5×4 أو Negative 5×3 ث", "cue": "Chin over bar — إذا تعذّر: Negative فقط" },
        "intermediate": { "weight": "وزن الجسم Strict", "reps": "5×5", "cue": "Packed shoulders — الكتف لأسفل قبل الشد" },
        "advanced":     { "weight": "+10كجم حزام", "reps": "5×4", "cue": "Pause 1 ث في الأعلى — تحكم كامل" },
        "elite":        { "weight": "+20كجم حزام", "reps": "4×3", "cue": "Tempo 2-1-3: صعود 2 ث، ثبات 1 ث، نزول 3 ث" }
      },
      "notes": "راحة 2 دقيقة — جودة الحركة أهم من العدد"
    }
  ],
  "metcon": [
    {
      "exerciseId": "push-up",
      "reps": "21-15-9",
      "weight": "",
      "distance": "",
      "time": "",
      "levels": {
        "beginner":     { "weight": "", "scaling": "Knee Push-up — صدر يلمس الأرض كل تكرار" },
        "intermediate": { "weight": "", "scaling": "Strict Push-up — كتف فوق يد" },
        "advanced":     { "weight": "+10كجم صدرية", "scaling": "Ring Push-up — مستوى الدائرة محاذٍ للصدر" },
        "elite":        { "weight": "", "scaling": "Archer Push-up — يد واحدة مستقيمة في كل جانب" }
      },
      "notes": "لا تنهار في القعدة — صدر كامل في كل تكرار"
    }
  ],
  "cooldown": [
    {
      "exerciseId": "sit-up",
      "reps": "",
      "weight": "",
      "distance": "",
      "time": "90 ث",
      "notes": "Lat Doorway Stretch — ضروري بعد كل جلسة سحب"
    }
  ]
}

**قواعد صارمة:**
- استخدم IDs من قائمة التمارين أعلاه فقط
- كل تمرين في skillWork وstrength وmetcon يجب أن يحتوي على levels بـ 4 مستويات
- skillWork قبل strength دائماً
- الميتكون لا يكرر نفس عضلات القوة (مثال: إذا القوة pull-up، الميتكون push-up)
- weight فارغ في warmup و cooldown
- الوزن الإضافي للمتقدمين والنخبة حزام أو صدرية — لا تخترع أدوات
- تجنب هذه الأنماط الأخيرة: ${weekAnalysis.overtrainedPatterns.join(', ') || 'لا شيء'}

أرجع JSON فقط، بدون أي نص قبله أو بعده.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 7000,
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

    const result = {
      date: date || todaySA(),
      type: 'calisthenics',
      title: generated.title || 'جلسة Calisthenics',
      wodType: generated.type || 'تدريب',
      duration: generated.duration ?? 50,
      rounds: generated.rounds ?? null,
      weekIntensity: generated.weekIntensity || weekAnalysis.label,
      aiTheme: generated.theme || '',
      notes: generated.notes || '',
      warmup: validateSection(generated.warmup),
      skillWork: validateSection(generated.skillWork),
      strength: validateSection(generated.strength),
      metcon: validateSection(generated.metcon),
      cooldown: validateSection(generated.cooldown),
    };

    return NextResponse.json({ wod: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
