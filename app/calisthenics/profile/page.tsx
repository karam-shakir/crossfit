import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCalisthenicsProfile } from '@/lib/db';
import CalisthenicsProfileClient from './CalisthenicsProfileClient';

export const dynamic = 'force-dynamic';

export default async function CalisthenicsProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const profile = await getCalisthenicsProfile(session.id);
  return <CalisthenicsProfileClient member={session} initialProfile={profile || null} />;
}
