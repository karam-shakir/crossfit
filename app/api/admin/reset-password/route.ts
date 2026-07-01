import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateMemberFields } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { memberId, newPassword } = await req.json().catch(() => ({}));
  if (!memberId || !newPassword)
    return NextResponse.json({ error: 'memberId وnewPassword مطلوبان' }, { status: 400 });
  if (newPassword.length < 4)
    return NextResponse.json({ error: 'كلمة المرور قصيرة جداً (4 أحرف على الأقل)' }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateMemberFields(memberId, { password: hashed });
  return NextResponse.json({ ok: true });
}
