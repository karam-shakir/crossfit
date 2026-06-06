import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById, getExercises } from '@/lib/db';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [member, exercises] = await Promise.all([getMemberById(session.id), getExercises()]);
  if (!member || member.role !== 'admin') redirect('/dashboard');
  const { password: _, ...safeMember } = member;
  return <AdminClient member={safeMember} exercises={exercises} />;
}
