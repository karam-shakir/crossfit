import { NextRequest, NextResponse } from 'next/server';
import { getSession, signToken } from '@/lib/auth';
import { getMemberById } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { memberId } = await req.json().catch(() => ({}));
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const member = await getMemberById(memberId);
  if (!member) return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 });

  // نحفظ admin token في cookie منفصل حتى نستطيع العودة
  const adminToken = req.cookies.get('auth-token')?.value || '';

  const memberToken = await signToken({
    id: member.id,
    username: member.username,
    role: member.role,
    nameAr: member.nameAr,
  });

  const res = NextResponse.json({ ok: true, memberName: member.nameAr });
  res.cookies.set('auth-token', memberToken, { httpOnly: true, path: '/', maxAge: 60 * 60 * 2 }); // 2 hours
  res.cookies.set('admin-restore-token', adminToken, { httpOnly: true, path: '/', maxAge: 60 * 60 * 2 });
  return res;
}
