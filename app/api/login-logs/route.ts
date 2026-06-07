import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId'); // اختياري: فلتر لعضو معين
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);

  const db = await getDb();
  const query = memberId ? { memberId } : {};
  const logs = await db.collection('login_logs')
    .find(query)
    .sort({ loginAt: -1 })
    .limit(limit)
    .toArray();

  // إحصائيات: عدد الدخولات لكل عضو
  const stats = await db.collection('login_logs').aggregate([
    { $group: {
        _id: '$memberId',
        memberName: { $first: '$memberName' },
        username:   { $first: '$username' },
        role:       { $first: '$role' },
        totalLogins: { $sum: 1 },
        lastLogin:   { $max: '$loginAt' },
        firstLogin:  { $min: '$loginAt' },
    }},
    { $sort: { totalLogins: -1 } },
  ]).toArray();

  return NextResponse.json({
    logs: logs.map(({ _id, ...l }) => l),
    stats: stats.map(({ _id, ...s }) => ({ memberId: _id, ...s })),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const db = await getDb();
  await db.collection('login_logs').deleteMany({});
  return NextResponse.json({ ok: true });
}
