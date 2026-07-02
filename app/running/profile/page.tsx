import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getRunningProfile } from '@/lib/db';
import RunningProfileClient from './RunningProfileClient';

export const dynamic = 'force-dynamic';

export default async function RunningProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const profile = await getRunningProfile(session.id);
  return <RunningProfileClient member={session} initialProfile={profile || null} />;
}
