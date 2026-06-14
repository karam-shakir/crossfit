import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';
import { saveKettlebellSession, getMemberKettlebellSessions, deleteKettlebellSession } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const sessions = await getMemberKettlebellSessions(session.id);
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { date, eventType, difficulty, focus, sessionData } = body;
  if (!sessionData) return NextResponse.json({ error: 'بيانات الجلسة مطلوبة' }, { status: 400 });

  const record = {
    id: randomUUID(),
    memberId: session.id,
    date: date || todaySA(),
    eventType: eventType || 'biathlon',
    difficulty: difficulty || 'متوسط',
    focus: focus || 'التحمل',
    sessionData,
    createdAt: new Date().toISOString(),
  };

  await saveKettlebellSession(record);
  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });

  await deleteKettlebellSession(id);
  return NextResponse.json({ ok: true });
}
