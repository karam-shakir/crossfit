import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymProfile } from '@/lib/db';
import GymProfileClient from './GymProfileClient';

export default async function GymProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const profile = await getGymProfile(session.id);
  return <GymProfileClient member={session} initialProfile={profile || null} />;
}
