import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get('admin-restore-token')?.value;
  if (!adminToken) return NextResponse.json({ error: 'لا يوجد حساب مدير محفوظ' }, { status: 400 });

  const payload = await verifyToken(adminToken);
  if (!payload || payload.role !== 'admin')
    return NextResponse.json({ error: 'رمز المدير غير صالح' }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth-token', adminToken, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  res.cookies.delete('admin-restore-token');
  return res;
}
