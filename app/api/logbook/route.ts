import { NextRequest, NextResponse } from 'next/server';
import { getLogEntries, addLogEntry, deleteLogEntry, getMemberLogEntries, getMembers } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requested = searchParams.get('memberId') || session.id;
  const memberId = session.role === 'admin' ? requested : session.id;
  const all = searchParams.get('all');

  if (all && session.role === 'admin') {
    const [entries, members] = await Promise.all([getLogEntries(), getMembers()]);
    return NextResponse.json(entries.map(e => ({
      ...e,
      member: members.find(m => m.id === e.memberId)
    })));
  }

  const entries = await getMemberLogEntries(memberId);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const entry = {
    id: generateId(),
    memberId: session.id,
    date: body.date || new Date().toISOString().split('T')[0],
    wodId: body.wodId,
    wodTitle: body.wodTitle,
    result: body.result,
    weight: body.weight,
    rounds: body.rounds,
    time: body.time,
    reps: body.reps,
    notes: body.notes,
    rxd: body.rxd || false,
    createdAt: new Date().toISOString()
  };

  await addLogEntry(entry);
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const entries = await getLogEntries();
  const entry = entries.find(e => e.id === id);

  if (!entry || (entry.memberId !== session.id && session.role !== 'admin')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  await deleteLogEntry(id!);
  return NextResponse.json({ ok: true });
}
