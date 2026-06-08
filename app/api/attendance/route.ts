import { NextRequest, NextResponse } from 'next/server';
import { getAttendance, addAttendance, getMemberAttendance, getMembers } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');

  // Admin فقط يمكنه رؤية كل الحضور أو حضور عضو آخر
  if (memberId === 'all') {
    if (session.role !== 'admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    const [records, members] = await Promise.all([getAttendance(), getMembers()]);
    return NextResponse.json(records.map(r => ({
      ...r,
      member: members.find(m => m.id === r.memberId),
    })));
  }

  // عضو عادي: يرى حضوره فقط
  const targetId = (memberId && session.role === 'admin') ? memberId : session.id;
  const records = await getMemberAttendance(targetId);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];
  const records = await getMemberAttendance(session.id);

  // منع التكرار
  if (records.find(r => r.date === today))
    return NextResponse.json({ error: 'سبق تسجيل حضورك اليوم' }, { status: 400 });

  // UUID آمن بدلاً من Date.now + random
  const record = { id: randomUUID(), memberId: session.id, date: today };
  await addAttendance(record);
  return NextResponse.json(record);
}
