import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// PATCH /api/members/permissions?id=xxx
// body: { canViewWods: bool, canGenerateWod: bool }
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
  if (id === 'admin') return NextResponse.json({ error: 'لا يمكن تعديل صلاحيات المدير' }, { status: 400 });

  const body = await req.json();
  const db = await getDb();

  const update: Record<string, boolean> = {};
  if (typeof body.canViewWods === 'boolean') update.canViewWods = body.canViewWods;
  if (typeof body.canGenerateWod === 'boolean') update.canGenerateWod = body.canGenerateWod;

  await db.collection('members').updateOne({ id }, { $set: update });
  return NextResponse.json({ ok: true, ...update });
}
