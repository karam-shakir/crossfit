import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const db = await getDb();
  const plans = await db.collection('weekly_plans')
    .find({}).sort({ createdAt: -1 }).limit(20).toArray();
  return NextResponse.json(plans.map(({ _id, ...p }) => p));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const body = await req.json();
  const db = await getDb();
  const plan = {
    id: generateId(),
    ...body,
    createdAt: new Date().toISOString(),
    createdBy: session.id,
  };
  await db.collection('weekly_plans').insertOne(plan as any);
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const db = await getDb();
  await db.collection('weekly_plans').deleteOne({ id });
  return NextResponse.json({ ok: true });
}
