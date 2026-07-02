import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getRunningProfile, getRunningSessions } from '@/lib/db';
import RunningClient from './RunningClient';

export const dynamic = 'force-dynamic';

export default async function RunningPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const memberId = session.id;
  const profile = await getRunningProfile(memberId);
  const allSessions = profile ? await getRunningSessions(memberId) : [];
  // فلتر أمان إضافي: تأكيد أن الجلسات تخص هذا العضو فقط
  const sessions = allSessions.filter(s => s.memberId === memberId);
  return <RunningClient member={session} profile={profile || null} sessions={sessions} />;
}
