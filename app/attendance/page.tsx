import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberById } from '@/lib/db';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const member = getMemberById(session.id);
  if (!member) redirect('/login');
  const { password: _, ...safeMember } = member;
  return <AttendanceClient member={safeMember} />;
}
