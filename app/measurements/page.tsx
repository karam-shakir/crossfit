import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import MeasurementsClient from './MeasurementsClient';

export default async function MeasurementsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = await getMemberById(session.id);
  if (!member) redirect('/login');
  const { password: _, ...safeMember } = member;
  return <MeasurementsClient member={safeMember} />;
}

