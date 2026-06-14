import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getWods, upsertWod } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_IDS = new Set([
  'back-squat','front-squat','deadlift','power-clean','clean-and-jerk','snatch',
  'overhead-squat','shoulder-press','push-press','thruster','pull-up','kipping-pull-up',
  'muscle-up','handstand-pushup','handstand-walk','toes-to-bar','double-under',
  'box-jump','burpee','wall-ball','kettle-bell-swing','row','run','push-up','sit-up','rope-climb',
]);

async function buildCooldown(wod: any): Promise<any[]> {
  const allExercises = [...(wod.strength || []), ...(wod.metcon || [])];
  const ids = allExercises.map((e: any) => e.exerciseId).join(', ');
  const theme = wod.aiTheme || wod.notes || '';

  const prompt = `أنت مدرب CrossFit. بناءً على تمارين اليوم، اقترح 2-3 تمارين تهدئة وتمطيط مناسبة.

تمارين اليوم: ${ids}
موضوع الجلسة: ${theme}

القواعد:
- استخدم فقط هذه الـ IDs: back-squat, front-squat, deadlift, power-clean, clean-and-jerk, snatch, overhead-squat, shoulder-press, push-press, thruster, pull-up, kipping-pull-up, muscle-up, handstand-pushup, handstand-walk, toes-to-bar, double-under, box-jump, burpee, wall-ball, kettle-bell-swing, row, run, push-up, sit-up, rope-climb
- الأول دائماً run (مشي هادئ لتخفيف معدل القلب)
- الباقي: اختر ما يُمطّط العضلات الأكثر استخداماً في الجلسة
- لا تضع sit-up إلا إذا كانت الجلسة ركّزت على البطن/العضلة الوسطى
- time = "30 ث" أو "45 ث" للتمطيط، reps فارغ، weight فارغ
- notes: وصف التمطيط بإيجاز

أرجع JSON فقط — مصفوفة فقط بدون أي نص:
[
  {"exerciseId": "run", "reps": "", "weight": "", "distance": "400م", "time": "", "notes": "مشي هادئ — خفّف معدل القلب"},
  {"exerciseId": "push-up", "reps": "", "weight": "", "distance": "", "time": "45 ث", "notes": "بطيء جداً — تمطيط الصدر"}
]`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  let text = '';
  for (const b of msg.content) { if (b.type === 'text') { text = b.text.trim(); break; } }
  text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  text = text.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

  const arr = JSON.parse(text);
  return arr.filter((e: any) => VALID_IDS.has(e.exerciseId));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  // This week
  const weekStart = '2026-06-15';
  const weekEnd   = '2026-06-21';

  const allWods = await getWods();
  const weekWods = allWods.filter((w: any) => w.date >= weekStart && w.date <= weekEnd);

  if (!weekWods.length)
    return NextResponse.json({ message: 'لا توجد تمارين هذا الأسبوع', updated: 0 });

  const results: any[] = [];

  for (const wod of weekWods) {
    try {
      const newCooldown = await buildCooldown(wod);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...wodWithoutId } = wod as any;
      await upsertWod({ ...wodWithoutId, cooldown: newCooldown });
      results.push({
        date: wod.date,
        title: (wod as any).titleEn || wod.title,
        cooldown: newCooldown.map((e: any) => e.exerciseId),
      });
    } catch (e: any) {
      results.push({ date: wod.date, error: e.message });
    }
  }

  return NextResponse.json({
    updated: results.filter(r => !r.error).length,
    results,
  });
}
