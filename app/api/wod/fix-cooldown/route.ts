import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getWods, upsertWod } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXERCISE_MUSCLES: Record<string, string[]> = {
  'back-squat':       ['quad', 'glute', 'hip flexor'],
  'front-squat':      ['quad', 'glute', 'hip flexor'],
  'overhead-squat':   ['quad', 'glute', 'hip flexor', 'shoulder'],
  'deadlift':         ['hamstring', 'low back', 'glute'],
  'power-clean':      ['hamstring', 'low back', 'quad', 'shoulder'],
  'clean-and-jerk':   ['hamstring', 'low back', 'quad', 'shoulder', 'tricep'],
  'snatch':           ['hamstring', 'low back', 'quad', 'shoulder'],
  'shoulder-press':   ['shoulder', 'front delt', 'tricep'],
  'push-press':       ['shoulder', 'front delt', 'tricep', 'quad'],
  'thruster':         ['quad', 'glute', 'shoulder', 'front delt', 'tricep'],
  'pull-up':          ['lat', 'bicep', 'shoulder'],
  'kipping-pull-up':  ['lat', 'bicep', 'shoulder'],
  'muscle-up':        ['lat', 'bicep', 'shoulder', 'tricep', 'chest'],
  'handstand-pushup': ['shoulder', 'front delt', 'tricep'],
  'handstand-walk':   ['shoulder', 'front delt', 'wrist'],
  'toes-to-bar':      ['hip flexor', 'core', 'lat'],
  'double-under':     ['calf', 'ankle'],
  'box-jump':         ['quad', 'glute', 'calf'],
  'burpee':           ['chest', 'shoulder', 'quad', 'hip flexor'],
  'wall-ball':        ['quad', 'glute', 'shoulder'],
  'kettle-bell-swing':['hamstring', 'glute', 'low back', 'shoulder'],
  'row':              ['lat', 'bicep', 'low back', 'hamstring'],
  'run':              ['calf', 'hip flexor', 'quad', 'hamstring'],
  'push-up':          ['chest', 'shoulder', 'tricep'],
  'sit-up':           ['hip flexor', 'core'],
  'rope-climb':       ['lat', 'bicep', 'forearm'],
};

const MUSCLE_STRETCHES: Record<string, string> = {
  'quad':        'Quad Stretch (يقف على ساق واحدة ويسحب القدم للخلف) — 45 ث لكل جانب',
  'glute':       'Figure-4 Stretch (يضع كاحل على الركبة ويجلس للخلف) — 45 ث لكل جانب',
  'hip flexor':  'Hip Flexor Lunge Stretch (ركبة على الأرض، ورك للأمام) — 45 ث لكل جانب',
  'hamstring':   'Standing Hamstring Stretch (يمد الساق على سطح مرتفع) — 45 ث لكل جانب',
  'low back':    'Child\'s Pose + Lumbar Twist — 60 ث',
  'lat':         'Lat Stretch (يمسك العارضة ويتدلى) أو Doorway Lat Stretch — 45 ث لكل جانب',
  'bicep':       'Bicep Doorway Stretch (يضع اليد على الحائط وراءه ويدور) — 30 ث لكل جانب',
  'shoulder':    'Cross-body Shoulder Stretch — 30 ث لكل جانب',
  'front delt':  'Chest Opener (يشبك يديه خلفه ويرفع) — 45 ث',
  'tricep':      'Overhead Tricep Stretch (يمد ذراعه فوق الرأس) — 30 ث لكل جانب',
  'chest':       'Chest Stretch على الحائط أو الأرضية — 45 ث',
  'calf':        'Calf Stretch (الاستناد للحائط مع مد الساق) — 45 ث لكل جانب',
  'core':        'Cobra Pose (الضغط باليدين ورفع الجذع) — 45 ث',
  'wrist':       'Wrist Flexor + Extensor Stretch — 30 ث',
  'forearm':     'Wrist + Forearm Stretch — 30 ث',
  'ankle':       'Ankle Circles + Calf Raise Stretch — 45 ث',
};

function getMusclesFromWod(strength: any[], metcon: any[]): string[] {
  const allExercises = [...(strength || []), ...(metcon || [])];
  const muscles = new Set<string>();
  for (const ex of allExercises) {
    const exMuscles = EXERCISE_MUSCLES[ex.exerciseId] || [];
    exMuscles.forEach(m => muscles.add(m));
  }
  return Array.from(muscles);
}

function buildCooldownPrompt(wodTitle: string, strengthIds: string[], metconIds: string[], muscles: string[]): string {
  const topMuscles = muscles.slice(0, 5); // أهم 5 عضلات
  const stretchOptions = topMuscles.map(m => `- ${m}: ${MUSCLE_STRETCHES[m] || m}`).join('\n');

  return `أنت مدرب CrossFit محترف. بناءً على تمرين اليوم، اختر 2-3 إطالات ثابتة مناسبة.

تمرين اليوم: ${wodTitle}
تمارين القوة: ${strengthIds.join(', ') || 'لا يوجد'}
تمارين الميتكون: ${metconIds.join(', ') || 'لا يوجد'}
العضلات المُستنزفة: ${muscles.join(', ')}

خيارات الإطالة المتاحة:
${stretchOptions}

أرجع JSON فقط — مصفوفة من 2-3 إطالات:
[
  {
    "exerciseId": "sit-up",
    "reps": "",
    "weight": "",
    "distance": "",
    "time": "45 ث",
    "notes": "اسم الإطالة بالعربية — وصف مختصر للتنفيذ — لماذا هي مناسبة لجلسة اليوم"
  }
]

قواعد:
- exerciseId يجب أن يكون واحداً من: pull-up, push-up, sit-up, run, row, deadlift, back-squat, burpee, box-jump, double-under, toes-to-bar, handstand-pushup, rope-climb, wall-ball
- استخدم exerciseId الأقرب منطقياً لحركة الإطالة (مثلاً للهامسترينج استخدم deadlift، للصدر استخدم push-up، للكتف استخدم pull-up)
- الوقت في حقل time فقط، reps يبقى فارغاً
- في notes: اذكر اسم الإطالة + لماذا هي مناسبة لعضلات جلسة اليوم
- أرجع JSON فقط بدون أي نص`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { fromDate, toDate } = body;

  if (!fromDate || !toDate)
    return NextResponse.json({ error: 'fromDate و toDate مطلوبان' }, { status: 400 });

  const allWods = await getWods();
  const targetWods = allWods.filter(w =>
    w.date >= fromDate && w.date <= toDate &&
    w.type === 'crossfit' &&
    !w.isCalisthenics &&
    (w.strength?.length > 0 || w.metcon?.length > 0)
  );

  if (targetWods.length === 0)
    return NextResponse.json({ fixed: 0, message: 'لا توجد جلسات CrossFit في هذا النطاق' });

  const results: { date: string; status: string }[] = [];

  for (const wod of targetWods) {
    try {
      const strengthIds = (wod.strength || []).map((e: any) => e.exerciseId);
      const metconIds = (wod.metcon || []).map((e: any) => e.exerciseId);
      const muscles = getMusclesFromWod(wod.strength, wod.metcon);

      if (muscles.length === 0) {
        results.push({ date: wod.date, status: 'تخطي — لا تمارين' });
        continue;
      }

      const prompt = buildCooldownPrompt(wod.title, strengthIds, metconIds, muscles);

      const message = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      let jsonText = '';
      for (const block of message.content) {
        if (block.type === 'text') { jsonText = block.text.trim(); break; }
      }
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

      const newCooldown = JSON.parse(jsonText);

      if (!Array.isArray(newCooldown) || newCooldown.length === 0) {
        results.push({ date: wod.date, status: 'فشل — استجابة غير صالحة' });
        continue;
      }

      await upsertWod({ ...wod, cooldown: newCooldown });
      results.push({ date: wod.date, status: `تم — ${newCooldown.length} إطالات (${muscles.slice(0, 3).join(', ')})` });

    } catch (err: any) {
      results.push({ date: wod.date, status: `خطأ: ${err.message}` });
    }
  }

  const fixed = results.filter(r => r.status.startsWith('تم')).length;
  return NextResponse.json({ fixed, total: targetWods.length, results });
}
