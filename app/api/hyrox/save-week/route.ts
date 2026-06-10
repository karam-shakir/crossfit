import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertHyroxSession } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { sessions = [] } = body;

  const saved = [];
  for (const s of sessions) {
    if (s.isRest) continue; // لا نحفظ أيام الراحة
    const record = {
      id: s.id || randomUUID(),
      memberId: 'weekly-plan', // مصدر: خطة أسبوعية
      date: s.date,
      sessionType: s.sessionType || 'simulation',
      difficulty: s.difficulty || 'متوسط',
      isWeeklyPlan: true,
      sessionData: s,
      createdAt: new Date().toISOString(),
    };
    await upsertHyroxSession(record);
    saved.push(record);
  }

  return NextResponse.json({ saved: saved.length });
}
