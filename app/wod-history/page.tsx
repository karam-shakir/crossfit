import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById, getWods, getExercises } from '@/lib/db';
import WodHistoryClient from './WodHistoryClient';

export default async function WodHistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [member, exercises, allWods] = await Promise.all([
    getMemberById(session.id),
    getExercises(),
    getWods(),
  ]);
  if (!member) redirect('/login');

  const enrich = (list: any[] | undefined) =>
    (list || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) }));

  // جلب كل WODs — الماضية والمستقبلية (بدون limit)
  const wods = (allWods || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(w => ({
      ...w,
      warmup: enrich(w.warmup),
      strength: enrich(w.strength),
      metcon: enrich(w.metcon),
      cooldown: enrich(w.cooldown),
    }));

  const { password: _, ...safeMember } = member;
  return <WodHistoryClient member={safeMember} wods={wods} />;
}
