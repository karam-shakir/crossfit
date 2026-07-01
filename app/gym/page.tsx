import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymProfile, getGymSessions } from '@/lib/db';
import GymClient from './GymClient';

export const dynamic = 'force-dynamic';

export default async function GymPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const memberId = session.id;
  const profile = await getGymProfile(memberId);
  const allSessions = profile ? await getGymSessions(memberId) : [];
  // فلتر أمان إضافي: تأكيد أن الجلسات تخص هذا العضو فقط
  const sessions = allSessions.filter(s => s.memberId === memberId);
  return <GymClient member={session} profile={profile || null} sessions={sessions} />;
}
