import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/db';
import HyroxClient from './HyroxClient';

export default async function HyroxPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  return <HyroxClient member={member} />;
}

