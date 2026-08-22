import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getGymSessions, deleteGymSessionsByMember } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = session.role === 'admin'
    ? (searchParams.get('memberId') || session.id)
    : session.id;

  const sessions = await getGymSessions(memberId);
  return NextResponse.json(sessions);
}

// حذف جلسات جيم لعضو ضمن نطاق تاريخ — لتصحيح توليد خاطئ أو مسح جدول تجريبي قبل تسليم جدول حقيقي.
// نفس منطق deleteGymSessionsByMember المُستخدم داخلياً بالفعل عند بداية كل توليد أسبوعي (lib/db.ts)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  if (!memberId || !fromDate || !toDate) return NextResponse.json({ error: 'memberId وfromDate وtoDate مطلوبة' }, { status: 400 });

  await deleteGymSessionsByMember(memberId, fromDate, toDate);
  return NextResponse.json({ ok: true });
}
