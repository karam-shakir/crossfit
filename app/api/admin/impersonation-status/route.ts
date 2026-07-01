import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const adminToken = req.cookies.get('admin-restore-token')?.value;
  if (!adminToken) return NextResponse.json({ impersonating: false });

  const payload = await verifyToken(adminToken);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ impersonating: false });

  return NextResponse.json({ impersonating: true, adminName: (payload as any).nameAr || 'المدير' });
}
