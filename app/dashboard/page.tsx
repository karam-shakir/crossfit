import { redirect } from 'next/navigation';
import { todaySA } from '@/lib/timezone';
import { getSession } from '@/lib/auth';
import {
  getMemberById, getTodayWod, getExercises,
  getMemberLogEntries, getMemberPRs, getMemberAttendance,
  getAllHyroxSessions, getAllKettlebellSessions, getAllCalisthenicsSessions,
} from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const member = await getMemberById(session.id);
  if (!member) redirect('/login');

  const today     = todaySA();
  const thisMonth = today.slice(0, 7);

  const [exercises, rawWod, logs, prs, attendance, allHyrox, allKettlebell, allCalisthenics] = await Promise.all([
    getExercises(),
    getTodayWod(),
    getMemberLogEntries(session.id),
    getMemberPRs(session.id),
    getMemberAttendance(session.id),
    getAllHyroxSessions(),
    getAllKettlebellSessions(),
    getAllCalisthenicsSessions(),
  ]);

  // جلسات اليوم فقط لكل رياضة
  const todayHyrox        = (allHyrox        || []).filter((s: any) => s.date === today);
  const todayKettlebell   = (allKettlebell   || []).filter((s: any) => s.date === today);
  const todayCalisthenics = (allCalisthenics || []).filter((s: any) => s.date === today);

  const enrich = (list: any[] | undefined) => (list || []).map(item => ({
    ...item,
    exercise: exercises.find((e: any) => e.id === item.exerciseId),
  }));

  const wod = rawWod ? {
    ...rawWod,
    warmup:   enrich(rawWod.warmup),
    strength: enrich(rawWod.strength),
    metcon:   enrich(rawWod.metcon),
    cooldown: enrich(rawWod.cooldown),
  } : null;

  const monthAttendance = (attendance || []).filter((a: any) => a.date.startsWith(thisMonth));
  const checkedInToday  = (attendance || []).some((a: any) => a.date === today);

  const { password: _, ...safeMember } = member;

  return (
    <DashboardClient
      member={safeMember}
      wod={wod}
      todayHyrox={todayHyrox}
      todayKettlebell={todayKettlebell}
      todayCalisthenics={todayCalisthenics}
      stats={{
        totalSessions: (logs || []).length,
        totalPRs:      (prs  || []).length,
        monthSessions: monthAttendance.length,
        checkedInToday,
      }}
    />
  );
}
