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

  const wods = allWods
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 60)
    .map(w => ({
      ...w,
      warmup: (w.warmup || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) })),
      strength: (w.strength || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) })),
      metcon: (w.metcon || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) })),
      cooldown: (w.cooldown || []).map((e: any) => ({ ...e, exercise: exercises.find(ex => ex.id === e.exerciseId) })),
    }));

  const { password: _, ...safeMember } = member;
  return <WodHistoryClient member={safeMember} wods={wods} />;
}
