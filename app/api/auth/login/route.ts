import { NextRequest, NextResponse } from 'next/server';
import { getMemberByUsername } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const member = await getMemberByUsername(username);
  if (!member) {
    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غلط' }, { status: 401 });
  }

  // All accounts must use bcrypt — no plaintext fallback
  const valid = await bcrypt.compare(password, member.password);
  if (!valid) {
    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غلط' }, { status: 401 });
  }

  const token = await signToken({
    id: member.id,
    username: member.username,
    role: member.role,
    nameAr: member.nameAr,
  });

  const res = NextResponse.json({
    ok: true,
    member: { id: member.id, nameAr: member.nameAr, role: member.role },
  });

  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
