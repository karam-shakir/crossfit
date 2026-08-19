import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { createExercise, updateExercise, deleteCustomExercise, getExercises, getExerciseById, Exercise } from '@/lib/db';
import { EXERCISES } from '@/lib/crossfitProgramming';

const VALID_SECTIONS = ['warmup', 'strength', 'metcon', 'accessory', 'cooldown'];
const VALID_CATEGORIES = ['strength', 'olympic', 'gymnastics', 'cardio', 'wod', 'mobility'];
const VALID_FOCUS = ['concentrated', 'variable', 'diffuse'];
const VALID_MUSCLE_GROUPS = [
  'squat', 'hinge', 'chest', 'overhead-push', 'back-pull', 'grip',
  'core', 'arms-isolation', 'full-body-concentrated', 'full-body-variable', 'cardio', 'warmup-activation',
];
const VALID_METCON_CATEGORY = ['push', 'pull', 'hip-explode', 'mono'];

function slugify(nameEn: string): string {
  return nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// تمارين مضافة عبر لوحة التحكم فقط — راجع lib/db.ts (Exercise.isCustom) ولوحة "مكتبة التمارين" في AdminClient.tsx
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const all = await getExercises();
  return NextResponse.json(all.filter(e => e.isCustom));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { nameAr, nameEn, category, youtube = '', muscles = '', sections } = body;

  if (!nameAr || !nameEn) return NextResponse.json({ error: 'الاسم بالعربي والإنجليزي مطلوبان' }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: 'فئة غير صالحة' }, { status: 400 });
  const cleanSections = (Array.isArray(sections) ? sections : []).filter((s: string) => VALID_SECTIONS.includes(s));
  if (!cleanSections.length) return NextResponse.json({ error: 'اختر قسماً واحداً على الأقل يظهر فيه التمرين' }, { status: 400 });

  const baseId = slugify(nameEn);
  if (!baseId) return NextResponse.json({ error: 'تعذّر توليد معرّف من الاسم الإنجليزي' }, { status: 400 });

  const existingIds = new Set([...EXERCISES.map(e => e.id), ...(await getExercises()).map(e => e.id)]);
  let id = baseId;
  let n = 2;
  while (existingIds.has(id)) { id = `${baseId}-${n}`; n++; }

  const exercise: Exercise = {
    id, nameAr, nameEn, category, gif: '', youtube, muscles,
    isCustom: true, sections: cleanSections, aiEligible: false,
    createdBy: session.id, createdAt: new Date().toISOString(),
  };
  await createExercise(exercise);
  return NextResponse.json(exercise);
}

// يعدّل بيانات تمرين مضاف، أو يُرقّيه للذكاء الاصطناعي (aiEligible: true) بعد تصنيف كامل —
// راجع lib/crossfitProgramming.ts للحقول (focusClass تحكم قاعدتي ١/٢ لمحظورات الدمج، metconStimulusCategory تحكم قاعدة خلط المحفزات الأربعة)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'معرّف التمرين مطلوب' }, { status: 400 });

  const existing = await getExerciseById(id);
  if (!existing || !existing.isCustom)
    return NextResponse.json({ error: 'هذا التمرين ليس من التمارين المضافة عبر لوحة التحكم' }, { status: 404 });

  const fields: Record<string, any> = {};
  if (body.nameAr !== undefined) fields.nameAr = body.nameAr;
  if (body.nameEn !== undefined) fields.nameEn = body.nameEn;
  if (body.category !== undefined && VALID_CATEGORIES.includes(body.category)) fields.category = body.category;
  if (body.youtube !== undefined) fields.youtube = body.youtube;
  if (body.muscles !== undefined) fields.muscles = body.muscles;
  if (Array.isArray(body.sections)) fields.sections = body.sections.filter((s: string) => VALID_SECTIONS.includes(s));

  if (body.aiEligible === true) {
    if (!VALID_FOCUS.includes(body.focusClass))
      return NextResponse.json({ error: 'فئة التركيز (focusClass) مطلوبة للترقية للذكاء الاصطناعي' }, { status: 400 });
    if (!VALID_MUSCLE_GROUPS.includes(body.muscleGroup))
      return NextResponse.json({ error: 'المجموعة العضلية مطلوبة للترقية للذكاء الاصطناعي' }, { status: 400 });
    const effectiveSections = fields.sections || existing.sections || [];
    if (effectiveSections.includes('metcon') && !VALID_METCON_CATEGORY.includes(body.metconStimulusCategory))
      return NextResponse.json({ error: 'فئة محفز الميتكون مطلوبة لأن هذا التمرين مخصص لقسم الميتكون' }, { status: 400 });
    fields.aiEligible = true;
    fields.focusClass = body.focusClass;
    fields.muscleGroup = body.muscleGroup;
    if (body.metconStimulusCategory) fields.metconStimulusCategory = body.metconStimulusCategory;
  } else if (body.aiEligible === false) {
    fields.aiEligible = false;
  }

  await updateExercise(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'معرّف التمرين مطلوب' }, { status: 400 });
  await deleteCustomExercise(id);
  return NextResponse.json({ ok: true });
}
