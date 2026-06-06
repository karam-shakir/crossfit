import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const db = await getDb();
  const [skills, records] = await Promise.all([
    db.collection('skills').find({}).toArray(),
    db.collection('skill_records').find({ memberId: session.id }).toArray(),
  ]);
  const clean = (arr: any[]) => arr.map(({ _id, ...r }) => r);
  return NextResponse.json({ skills: clean(skills), records: clean(records) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { skillId, level, notes } = body;
  const db = await getDb();

  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    memberId: session.id,
    skillId,
    level,
    notes: notes || '',
    updatedAt: new Date().toISOString(),
  };

  await db.collection('skill_records').replaceOne(
    { memberId: session.id, skillId },
    record,
    { upsert: true }
  );

  return NextResponse.json(record);
}
