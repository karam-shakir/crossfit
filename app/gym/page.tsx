import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymProfile, getGymSessions } from '@/lib/db';
import GymClient from './GymClient';

export default async function GymPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const profile = await getGymProfile(session.id);
  const sessions = profile ? await getGymSessions(session.id) : [];
  return <GymClient member={session} profile={profile || null} sessions={sessions} />;
}
