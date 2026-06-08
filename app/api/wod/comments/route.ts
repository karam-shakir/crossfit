import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import { getDb } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 });

  const db = await getDb();
  // جلب التعليقات مع حد أقصى 200 لكل يوم
  const docs = await db.collection('comments')
    .find({ date })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();

  const comments = docs.map(({ _id, ...r }) => r);
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { date, text, result, rxd } = body;

  if (!date) return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 });
  if (!text?.trim() && !result) return NextResponse.json({ error: 'النص مطلوب' }, { status: 400 });

  // تحديد طول النص الأقصى
  if (text && text.length > 500)
    return NextResponse.json({ error: 'النص طويل جداً (500 حرف كحد أقصى)' }, { status: 400 });

  const member = await getMemberById(session.id);
  const db = await getDb();

  const comment = {
    id:           randomUUID(),
    date,
    memberId:     session.id,
    memberName:   member?.nameAr   || 'عضو',
    memberAvatar: member?.avatar   || '🏋️',
    text:         (text || '').trim().slice(0, 500),
    result:       (result || '').slice(0, 100),
    rxd:          rxd === true,
    emoji:        (body.emoji || '').slice(0, 10),
    createdAt:    new Date().toISOString(),
  };

  await db.collection('comments').insertOne(comment as any);
  return NextResponse.json(comment);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });

  const db = await getDb();
  const doc = await db.collection('comments').findOne({ id });
  if (!doc) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  if (doc.memberId !== session.id && session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  await db.collection('comments').deleteOne({ id });
  return NextResponse.json({ ok: true });
}
