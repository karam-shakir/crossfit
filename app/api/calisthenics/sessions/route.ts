import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  saveCalisthenicsSession,
  getMemberCalisthenicsSessions,
  deleteCalisthenicsSession,
} from '@/lib/db';
import { randomUUID } from 'crypto';

// GET: جلب جلسات العضو
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const sessions = await getMemberCalisthenicsSessions(session.id);
  return NextResponse.json({ sessions });
}

// POST: حفظ جلسة جديدة
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { sessionData, date, sessionType, difficulty } = body;

  const record = {
    id: randomUUID(),
    memberId: session.id,
    memberName: (session as any).nameAr || '',
    date: date || new Date().toISOString().split('T')[0],
    sessionType,
    difficulty,
    title: sessionData?.title || 'جلسة Calisthenics',
    sessionData,
    createdAt: new Date().toISOString(),
  };

  await saveCalisthenicsSession(record);
  return NextResponse.json({ success: true, id: record.id });
}

// DELETE: حذف جلسة
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });

  await deleteCalisthenicsSession(id);
  return NextResponse.json({ success: true });
}
