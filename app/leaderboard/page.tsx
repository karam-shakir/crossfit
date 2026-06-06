import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  const { password: _, ...safeMember } = member;
  return <LeaderboardClient member={safeMember} currentUserId={session.id} />;
}

