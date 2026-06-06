import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMemberById, getMembers, saveMembers } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const member = await getMemberById(session.id);
  if (!member) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  const { password: _, ...safe } = member as any;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { nameAr, avatar, currentPassword, newPassword } = body;

  const members = await getMembers();
  const idx = members.findIndex(m => m.id === session.id);
  if (idx === -1) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  const member = { ...members[idx] } as any;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'أدخل كلمة المرور الحالية' }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, member.password);
    if (!valid) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    member.password = await bcrypt.hash(newPassword, 10);
  }

  if (nameAr) member.nameAr = nameAr;
  if (avatar) member.avatar = avatar;

  members[idx] = member;
  await saveMembers(members);

  const { password: _, ...safe } = member;
  return NextResponse.json(safe);
}
