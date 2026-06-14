import { NextRequest, NextResponse } from 'next/server';
import { getMemberPRs, addPR, deletePR, getPRs, getExercises } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requested = searchParams.get('memberId') || session.id;
  const memberId = session.role === 'admin' ? requested : session.id;

  const [records, exercises] = await Promise.all([getMemberPRs(memberId), getExercises()]);

  const enriched = records.map(r => ({
    ...r,
    exercise: exercises.find(e => e.id === r.exerciseId)
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const newRecord = {
    id: generateId(),
    memberId: session.id,
    exerciseId: body.exerciseId,
    value: body.value,
    unit: body.unit,
    date: body.date || todaySA(),
    notes: body.notes || ''
  };

  await addPR(newRecord);
  return NextResponse.json(newRecord);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const records = await getPRs();
  const record = records.find(r => r.id === id);

  if (!record || (record.memberId !== session.id && session.role !== 'admin')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  await deletePR(id!);
  return NextResponse.json({ ok: true });
}
