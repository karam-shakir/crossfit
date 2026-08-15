import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getMemberById, getWods, getExercises,
  getAllHyroxSessions, getAllKettlebellSessions, getAllCalisthenicsSessions,
} from '@/lib/db';
import { enrichWodSections } from '@/lib/wodBlocks';
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

  const wods = (allWods || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(w => ({
      ...w,
      ...enrichWodSections(w, exercises),
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
