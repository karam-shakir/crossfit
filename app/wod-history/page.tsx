import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getMemberById, getWods, getExercises,
  getAllHyroxSessions, getAllKettlebellSessions, getAllCalisthenicsSessions,
} from '@/lib/db';
import WodHistoryClient from './WodHistoryClient';

export default async function WodHistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [member, exercises, allWods, hyroxSessions, kettlebellSessions, calisthenicsSessions] = await Promise.all([
    getMemberById(session.id),
    getExercises(),
    getWods(),
    getAllHyroxSessions(),
    getAllKettlebellSessions(),
    getAllCalisthenicsSessions(),
  ]);

  if (!member) redirect('/login');
  if (member.canViewWods === false && session.role !== 'admin') redirect('/dashboard');

  const enrich = (list: any[] | undefined) =>
    (list || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) }));

  const wods = (allWods || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(w => ({
      ...w,
      warmup:   enrich(w.warmup),
      strength: enrich(w.strength),
      metcon:   enrich(w.metcon),
      cooldown: enrich(w.cooldown),
    }));

  const { password: _, ...safeMember } = member;

  return (
    <WodHistoryClient
      member={safeMember}
      wods={wods}
      hyroxSessions={hyroxSessions || []}
      kettlebellSessions={kettlebellSessions || []}
      calisthenicsSessions={calisthenicsSessions || []}
    />
  );
}
