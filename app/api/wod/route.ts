import { NextRequest, NextResponse } from 'next/server';
import { getWods, getWodByDate, getWodsByMonth, upsertWod, deleteWodById, getExercises } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const month = searchParams.get('month');

  if (date) {
    const wod = await getWodByDate(date);
    if (!wod) return NextResponse.json(null);
    const exercises = await getExercises();
    const enrich = (list: any[]) => list.map(item => ({
      ...item,
      exercise: exercises.find(e => e.id === item.exerciseId),
    }));
    return NextResponse.json({
      ...wod,
      warmup:    enrich(wod.warmup    || []),
      strength:  enrich(wod.strength  || []),
      metcon:    enrich(wod.metcon    || []),
      accessory: enrich(wod.accessory || []),
      cooldown:  enrich(wod.cooldown  || []),
    });
  }

  if (month) {
    const wods = await getWodsByMonth(month);
    return NextResponse.json(wods.map(w => ({
      date: w.date, title: w.title, titleEn: w.titleEn || '', type: w.type,
      duration: w.duration ?? null, isRest: (w as any).isRest || false,
      isCalisthenics: w.isCalisthenics || false,
      isPartnerWod: w.isPartnerWod || false,
    })));
  }

  const wods = await getWods();
  return NextResponse.json(wods.slice(0, 30));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json();
  const existing = await getWodByDate(body.date);
  const wod = { ...body, id: existing?.id || generateId(), createdBy: session.id };
  await upsertWod(wod);
  return NextResponse.json(wod);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) await deleteWodById(id);
  return NextResponse.json({ ok: true });
}
