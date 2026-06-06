import { NextResponse } from 'next/server';
import { getMembers, getPRs, getLogEntries, getAttendance } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const [members, prs, logs, attendance] = await Promise.all([
    getMembers(), getPRs(), getLogEntries(), getAttendance()
  ]);

  const thisMonth = new Date().toISOString().slice(0, 7);

  const leaderboard = members.map(m => {
    const memberPRs = prs.filter(p => p.memberId === m.id);
    const memberLogs = logs.filter(l => l.memberId === m.id);
    const memberAttendance = attendance.filter(a => a.memberId === m.id);
    const monthAttendance = memberAttendance.filter(a => a.date.startsWith(thisMonth));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (memberAttendance.find(a => a.date === dateStr)) {
        streak++;
      } else if (i > 0) break;
    }

    return {
      id: m.id,
      nameAr: m.nameAr,
      avatar: m.avatar,
      totalSessions: memberLogs.length,
      totalPRs: memberPRs.length,
      monthSessions: monthAttendance.length,
      streak,
      rxdCount: memberLogs.filter(l => l.rxd).length,
    };
  });

  leaderboard.sort((a, b) => b.monthSessions - a.monthSessions || b.totalPRs - a.totalPRs);
  return NextResponse.json(leaderboard);
}
