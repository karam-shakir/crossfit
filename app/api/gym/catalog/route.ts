import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createGymCatalogExercise, updateGymCatalogExercise, deleteGymCatalogExercise, getGymCatalog, GymCatalogExercise } from '@/lib/db';

const VALID_CATEGORIES = ['legs', 'free-weight', 'chest', 'back', 'shoulders', 'arms', 'core', 'cardio'];

function slugify(nameEn: string): string {
  return nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// كتالوج أجهزة/تمارين الجيم — بديل القائمة الثابتة التي كانت مكتوبة داخل app/api/gym/generate-week/route.ts.
// إدارة الجيم صلاحية مدير كامل فقط (نفس تحقق مسار التوليد نفسه)، بعكس تمارين الكروسفت المتاحة للمدربين المحدودين أيضاً
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const list = await getGymCatalog();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { nameAr = '', nameEn, category, muscleGroup = '' } = body;

  if (!nameEn) return NextResponse.json({ error: 'الاسم بالإنجليزي مطلوب' }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: 'فئة غير صالحة' }, { status: 400 });

  // id صريح اختياري — يُستخدم فقط لسكربتات ترحيل بيانات تحتاج الحفاظ على machineId قديم متطابق مع
  // سجلات تاريخية محفوظة (GymExerciseLog/GymSession)؛ نموذج لوحة التحكم العادي لا يرسل هذا الحقل أبداً
  const existingIds = new Set((await getGymCatalog()).map(e => e.id));
  let id: string;
  if (typeof body.id === 'string' && /^[a-z0-9-]+$/.test(body.id)) {
    if (existingIds.has(body.id)) return NextResponse.json({ error: 'هذا المعرّف مستخدم بالفعل' }, { status: 400 });
    id = body.id;
  } else {
    const baseId = slugify(nameEn);
    if (!baseId) return NextResponse.json({ error: 'تعذّر توليد معرّف من الاسم الإنجليزي' }, { status: 400 });
    id = baseId;
    let n = 2;
    while (existingIds.has(id)) { id = `${baseId}-${n}`; n++; }
  }

  const exercise: GymCatalogExercise = {
    id, nameEn, nameAr, category, muscleGroup,
    createdBy: session.id, createdAt: new Date().toISOString(),
  };
  await createGymCatalogExercise(exercise);
  return NextResponse.json(exercise);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'معرّف التمرين مطلوب' }, { status: 400 });

  const fields: Record<string, any> = {};
  if (body.nameAr !== undefined) fields.nameAr = body.nameAr;
  if (body.nameEn !== undefined) fields.nameEn = body.nameEn;
  if (body.muscleGroup !== undefined) fields.muscleGroup = body.muscleGroup;
  if (body.category !== undefined && VALID_CATEGORIES.includes(body.category)) fields.category = body.category;

  await updateGymCatalogExercise(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'معرّف التمرين مطلوب' }, { status: 400 });
  await deleteGymCatalogExercise(id);
  return NextResponse.json({ ok: true });
}
