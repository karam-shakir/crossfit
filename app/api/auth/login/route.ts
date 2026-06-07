import { NextRequest, NextResponse } from 'next/server';
import { getMemberByUsername } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
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

  // تسجيل الدخول في سجل الـ Login Log
  try {
    const db = await getDb();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
    await db.collection('login_logs').insertOne({
      memberId:   member.id,
      memberName: member.nameAr,
      username:   member.username,
      role:       member.role,
      loginAt:    new Date().toISOString(),
      ip,
      userAgent:  req.headers.get('user-agent') || '',
    });
  } catch (_) { /* لا نوقف الدخول إذا فشل التسجيل */ }

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
