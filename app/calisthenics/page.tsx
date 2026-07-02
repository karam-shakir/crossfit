import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCalisthenicsProfile, getCaliProgramSessions } from '@/lib/db';
import CalisthenicsClient from './CalisthenicsClient';

export const dynamic = 'force-dynamic';

export default async function CalisthenicsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const memberId = session.id;
  const profile = await getCalisthenicsProfile(memberId);
  const allSessions = profile ? await getCaliProgramSessions(memberId) : [];
  // فلتر أمان إضافي: تأكيد أن الجلسات تخص هذا العضو فقط
  const sessions = allSessions.filter(s => s.memberId === memberId);
  return <CalisthenicsClient member={session} profile={profile || null} sessions={sessions} />;
}
