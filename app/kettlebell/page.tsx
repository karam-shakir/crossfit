import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/db';
import KettlebellClient from './KettlebellClient';

export default async function KettlebellPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  return <KettlebellClient member={member} />;
}

