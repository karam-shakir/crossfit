import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertCalisthenicsExerciseLog, getCalisthenicsExerciseLogs, deleteCalisthenicsExerciseLog } from '@/lib/db';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// GET — سجل الإنجاز الفعلي الخاص بالعضو الحالي فقط
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const logs = await getCalisthenicsExerciseLogs(session.id);
  return NextResponse.json(logs);
}

// POST — تسجيل إنجاز تمرين (اختياري) — دائماً باسم العضو الحالي
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const {
    date, exerciseKey, level, movementType, isSkillWork,
    suggestedVariation, suggestedReps, actualVariation, actualReps, comparison,
  } = body;

  if (!date || !exerciseKey || !comparison || !['as_suggested', 'easier', 'harder'].includes(comparison)) {
    return NextResponse.json({ error: 'بيانات ناقصة أو غير صحيحة' }, { status: 400 });
  }

  const log = {
    id: generateId(),
    memberId: session.id,
    date,
    exerciseKey,
    level: level || 'intermediate',
    movementType: movementType || 'core',
    isSkillWork: !!isSkillWork,
    suggestedVariation: suggestedVariation || '',
    suggestedReps: suggestedReps || '',
    actualVariation: comparison === 'as_suggested' ? (suggestedVariation || '') : (actualVariation || suggestedVariation || ''),
    actualReps: comparison === 'as_suggested' ? (suggestedReps || '') : (actualReps || suggestedReps || ''),
    comparison,
    createdAt: new Date().toISOString(),
  };

  await upsertCalisthenicsExerciseLog(log as any);
  return NextResponse.json(log);
}

// DELETE — إلغاء تسجيل إنجاز (تعديل/تراجع في نفس اليوم)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const exerciseKey = searchParams.get('exerciseKey');
  if (!date || !exerciseKey) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });

  await deleteCalisthenicsExerciseLog(session.id, date, exerciseKey);
  return NextResponse.json({ ok: true });
}
