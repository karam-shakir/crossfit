import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import LogbookClient from './LogbookClient';

export default async function LogbookPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  const { password: _, ...safeMember } = member;
  return <LogbookClient member={safeMember} />;
}

