import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/db';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = getMemberById(session.id);
  if (!member) redirect('/login');
  return <ProfileClient member={member} />;
}
