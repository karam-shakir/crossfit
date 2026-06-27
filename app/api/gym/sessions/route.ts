import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getGymSessions } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = session.role === 'admin'
    ? (searchParams.get('memberId') || session.id)
    : session.id;

  const sessions = await getGymSessions(memberId);
  return NextResponse.json(sessions);
}
