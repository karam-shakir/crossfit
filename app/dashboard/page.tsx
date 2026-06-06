import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById, getTodayWod, getExercises, getLogEntries, getPRs, getAttendance } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const member = getMemberById(session.id);
  if (!member) redirect('/login');

  const exercises = getExercises();
  const rawWod = getTodayWod();

  // Enrich WOD with exercise data
  const enrich = (list: any[]) => list.map(item => ({
    ...item,
    exercise: exercises.find((e: any) => e.id === item.exerciseId)
  }));

  const wod = rawWod ? {
    ...rawWod,
    warmup: enrich(rawWod.warmup),
    strength: enrich(rawWod.strength),
    metcon: enrich(rawWod.metcon),
    cooldown: enrich(rawWod.cooldown),
  } : null;

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const logs = getLogEntries();
  const prs = getPRs();
  const attendance = getAttendance();

  const myLogs = logs.filter(l => l.memberId === session.id);
  const myPRs = prs.filter(p => p.memberId === session.id);
  const myAttendance = attendance.filter(a => a.memberId === session.id);
  const monthAttendance = myAttendance.filter(a => a.date.startsWith(thisMonth));
  const checkedInToday = myAttendance.some(a => a.date === today);

  const { password: _, ...safeMember } = member;

  return (
    <DashboardClient
      member={safeMember}
      wod={wod}
      stats={{
        totalSessions: myLogs.length,
        totalPRs: myPRs.length,
        monthSessions: monthAttendance.length,
        checkedInToday,
      }}
    />
  );
}
