import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const db = await getDb();
  const filter = date ? { date } : {};
  const docs = await db.collection('comments').find(filter).sort({ createdAt: 1 }).toArray();
  const comments = docs.map(({ _id, ...r }) => r);
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { date, text, result, rxd } = body;
  if (!text?.trim() && !result) return NextResponse.json({ error: 'النص مطلوب' }, { status: 400 });

  const member = await getMemberById(session.id);
  const db = await getDb();
  const comment = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    date,
    memberId: session.id,
    memberName: member?.nameAr || 'عضو',
    memberAvatar: member?.avatar || '🏋️',
    text: text || '',
    result: result || '',
    rxd: rxd || false,
    emoji: body.emoji || '',
    createdAt: new Date().toISOString(),
  };
  await db.collection('comments').insertOne(comment as any);
  return NextResponse.json(comment);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const db = await getDb();
  const doc = await db.collection('comments').findOne({ id });
  if (!doc) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  if (doc.memberId !== session.id && session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  await db.collection('comments').deleteOne({ id });
  return NextResponse.json({ ok: true });
}
