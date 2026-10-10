import { NextRequest, NextResponse } from 'next/server';
import { getMembers, saveMembers } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canManageGym } from '@/lib/permissions';
import { todaySA } from '@/lib/timezone';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

function generateId() {
  return randomUUID();
}

const AVATARS = ['🏋️','💪','🔥','⚡','🦁','🐺','🦅','🎯','🏆','💥'];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  // Admin فقط يمكنه رؤية قائمة الأعضاء الكاملة
  if (session.role === 'admin') {
    const members = (await getMembers()).map(({ password: _, ...m }) => m);
    return NextResponse.json(members);
  }

  // مدرّب الجيم يحتاج القائمة لاختيار العضو فقط — حقول التعريف الأساسية بلا صلاحيات أو تواريخ
  if (await canManageGym(session)) {
    const members = (await getMembers()).map(m => ({
      id: m.id, username: m.username, nameAr: m.nameAr, role: m.role, avatar: m.avatar,
    }));
    return NextResponse.json(members);
  }

  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const body = await req.json();
  const members = await getMembers();
  if (members.find(m => m.username === body.username))
    return NextResponse.json({ error: 'اسم المستخدم موجود مسبقاً' }, { status: 400 });
  const member = {
    id: generateId(),
    username: body.username,
    password: await bcrypt.hash(body.password, 10),
    nameAr: body.nameAr,
    role: 'member' as const,
    joinDate: todaySA(),
    avatar: AVATARS[members.length % AVATARS.length],
  };
  members.push(member);
  await saveMembers(members);
  const { password: _, ...safe } = member;
  return NextResponse.json(safe);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id === 'admin') return NextResponse.json({ error: 'لا يمكن حذف المدير' }, { status: 400 });
  const members = (await getMembers()).filter(m => m.id !== id);
  await saveMembers(members);
  return NextResponse.json({ ok: true });
}
