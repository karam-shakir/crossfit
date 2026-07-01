import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateMemberFields } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { memberId, notes } = await req.json().catch(() => ({}));
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  await updateMemberFields(memberId, { adminNotes: notes || '' });
  return NextResponse.json({ ok: true });
}
