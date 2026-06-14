import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getMembers } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { thisMonthSA } from '@/lib/timezone';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const db = await getDb();
  const thisMonth = thisMonthSA();

  // جلب الأعضاء واستخدام MongoDB aggregation بدلاً من filter في JavaScript
  const [members, prsAgg, logsAgg, attendanceAgg] = await Promise.all([
    getMembers(),
    db.collection('prs').aggregate([
      { $group: { _id: '$memberId', count: { $sum: 1 } } }
    ]).toArray(),
    db.collection('logbook').aggregate([
      { $group: { _id: '$memberId', total: { $sum: 1 }, rxd: { $sum: { $cond: ['$rxd', 1, 0] } } } }
    ]).toArray(),
    db.collection('attendance').aggregate([
      { $group: {
        _id: '$memberId',
        total: { $sum: 1 },
        monthCount: { $sum: { $cond: [{ $eq: [{ $substr: ['$date', 0, 7] }, thisMonth] }, 1, 0] } },
        dates: { $push: '$date' },
      }},
    ]).toArray(),
  ]);

  const prsMap    = Object.fromEntries(prsAgg.map(r => [r._id, r.count]));
  const logsMap   = Object.fromEntries(logsAgg.map(r => [r._id, { total: r.total, rxd: r.rxd }]));
  const attMap    = Object.fromEntries(attendanceAgg.map(r => [r._id, r]));

  const leaderboard = members.map(m => {
    const att = attMap[m.id];
    // حساب streak
    let streak = 0;
    if (att?.dates) {
      const dateSet = new Set(att.dates);
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (dateSet.has(d.toISOString().split('T')[0])) { streak++; }
        else if (i > 0) break;
      }
    }
    return {
      id:            m.id,
      nameAr:        m.nameAr,
      avatar:        m.avatar,
      totalSessions: logsMap[m.id]?.total   ?? 0,
      totalPRs:      prsMap[m.id]            ?? 0,
      monthSessions: att?.monthCount          ?? 0,
      rxdCount:      logsMap[m.id]?.rxd      ?? 0,
      streak,
    };
  });

  leaderboard.sort((a, b) => b.monthSessions - a.monthSessions || b.totalPRs - a.totalPRs);
  return NextResponse.json(leaderboard);
}
