import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById, getExercises } from '@/lib/db';
import PRsClient from './PRsClient';

export default async function PRsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [member, exercises] = await Promise.all([getMemberById(session.id), getExercises()]);
  if (!member) redirect('/login');
  const { password: _, ...safeMember } = member;
  return <PRsClient member={safeMember} exercises={exercises} />;
}
