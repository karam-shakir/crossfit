import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/db';
import CalisthenicsClient from './CalisthenicsClient';

export default async function CalisthenicsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  return <CalisthenicsClient member={member} />;
}
