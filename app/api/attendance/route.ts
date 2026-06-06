import { NextRequest, NextResponse } from 'next/server';
import { getAttendance, addAttendance, getMemberAttendance, getMembers } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId') || session.id;

  if (memberId === 'all' && session.role === 'admin') {
    const [records, members] = await Promise.all([getAttendance(), getMembers()]);
    return NextResponse.json(records.map(r => ({
      ...r,
      member: members.find(m => m.id === r.memberId)
    })));
  }

  const records = await getMemberAttendance(memberId);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];
  const records = await getMemberAttendance(session.id);
  const alreadyCheckedIn = records.find(r => r.date === today);

  if (alreadyCheckedIn) {
    return NextResponse.json({ error: 'سبق تسجيل حضورك اليوم' }, { status: 400 });
  }

  const record = { id: generateId(), memberId: session.id, date: today };
  await addAttendance(record);
  return NextResponse.json(record);
}
