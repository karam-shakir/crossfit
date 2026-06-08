import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById, getTodayWod, getExercises, getMemberLogEntries, getMemberPRs, getMemberAttendance } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const member = await getMemberById(session.id);
  if (!member) redirect('/login');

  // جلب بيانات العضو فقط — بدلاً من جلب كل المجموعة
  const [exercises, rawWod, logs, prs, attendance] = await Promise.all([
    getExercises(),
    getTodayWod(),
    getMemberLogEntries(session.id),
    getMemberPRs(session.id),
    getMemberAttendance(session.id),
  ]);

  const enrich = (list: any[] | undefined) => (list || []).map(item => ({
    ...item,
    exercise: exercises.find((e: any) => e.id === item.exerciseId)
  }));

  const wod = rawWod ? {
    ...rawWod,
    warmup:   enrich(rawWod.warmup),
    strength: enrich(rawWod.strength),
    metcon:   enrich(rawWod.metcon),
    cooldown: enrich(rawWod.cooldown),
  } : null;

  const today     = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const monthAttendance = (attendance || []).filter((a: any) => a.date.startsWith(thisMonth));
  const checkedInToday  = (attendance || []).some((a: any) => a.date === today);

  const { password: _, ...safeMember } = member;

  return (
    <DashboardClient
      member={safeMember}
      wod={wod}
      stats={{
        totalSessions: (logs || []).length,
        totalPRs:      (prs  || []).length,
        monthSessions: monthAttendance.length,
        checkedInToday,
      }}
    />
  );
}
