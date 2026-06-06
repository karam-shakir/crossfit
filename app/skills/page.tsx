import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/db';
import SkillsClient from './SkillsClient';

export default async function SkillsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = getMemberById(session.id);
  if (!member) redirect('/login');
  return <SkillsClient member={member} />;
}
