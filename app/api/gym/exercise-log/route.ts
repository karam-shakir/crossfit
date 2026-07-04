import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertGymExerciseLog, getGymExerciseLogs, deleteGymExerciseLog } from '@/lib/db';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// GET — سجل الإنجاز الفعلي الخاص بالعضو الحالي فقط
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const logs = await getGymExerciseLogs(session.id);
  return NextResponse.json(logs);
}

// POST — تسجيل إنجاز تمرين (اختياري) — دائماً باسم العضو الحالي، لا يمكن التسجيل نيابة عن غيره
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { date, machineId, level, suggestedWeight, suggestedReps, actualWeight, actualReps, comparison } = body;

  if (!date || !machineId || !comparison || !['same', 'less', 'more'].includes(comparison)) {
    return NextResponse.json({ error: 'بيانات ناقصة أو غير صحيحة' }, { status: 400 });
  }

  const log = {
    id: generateId(),
    memberId: session.id,
    date,
    machineId,
    level: level || 'intermediate',
    suggestedWeight: suggestedWeight || '',
    suggestedReps: suggestedReps || '',
    actualWeight: comparison === 'same' ? (suggestedWeight || '') : (actualWeight || suggestedWeight || ''),
    actualReps: comparison === 'same' ? (suggestedReps || '') : (actualReps || suggestedReps || ''),
    comparison,
    createdAt: new Date().toISOString(),
  };

  await upsertGymExerciseLog(log as any);
  return NextResponse.json(log);
}

// DELETE — إلغاء تسجيل إنجاز (تعديل/تراجع في نفس اليوم)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const machineId = searchParams.get('machineId');
  if (!date || !machineId) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });

  await deleteGymExerciseLog(session.id, date, machineId);
  return NextResponse.json({ ok: true });
}
