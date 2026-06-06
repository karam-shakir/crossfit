import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const member = await getMemberById(session.id);
  if (!member) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  const { password: _, ...safe } = member;
  return NextResponse.json(safe);
}
