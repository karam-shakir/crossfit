import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById, getExercises } from '@/lib/db';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [member, exercises] = await Promise.all([getMemberById(session.id), getExercises()]);
  if (!member) redirect('/dashboard');

  const isFullAdmin = member.role === 'admin';
  // صلاحية شبه إدارية محدودة بتوليد/حفظ تمارين الكروسفت — يفعّلها المدير لعضو عبر canGenerateWod
  const isCrossfitManager = isFullAdmin || member.canGenerateWod === true;
  if (!isCrossfitManager) redirect('/dashboard');

  const { password: _, ...safeMember } = member;
  return <AdminClient member={safeMember} exercises={exercises} isFullAdmin={isFullAdmin} />;
}
