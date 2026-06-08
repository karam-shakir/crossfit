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

  // استخراج الحقول المسموح بتعديلها فقط — لا يمكن تغيير role أو id
  const { nameAr, avatar, currentPassword, newPassword } = body;

  // validation
  if (nameAr && (typeof nameAr !== 'string' || nameAr.trim().length < 2 || nameAr.length > 50))
    return NextResponse.json({ error: 'الاسم يجب أن يكون بين 2 و 50 حرف' }, { status: 400 });

  if (newPassword && newPassword.length < 6)
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });

  const members = await getMembers();
  const idx = members.findIndex(m => m.id === session.id);
  if (idx === -1) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  // نسخ الحقول القابلة للتعديل فقط
  const member = { ...members[idx] } as any;

  if (newPassword) {
    if (!currentPassword)
      return NextResponse.json({ error: 'أدخل كلمة المرور الحالية' }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, member.password);
    if (!valid)
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    member.password = await bcrypt.hash(newPassword, 10);
  }

  if (nameAr) member.nameAr = nameAr.trim();
  if (avatar) member.avatar = String(avatar).slice(0, 10); // حد أقصى للـ avatar

  members[idx] = member;
  await saveMembers(members);

  const { password: _, ...safe } = member;
  return NextResponse.json(safe);
}
