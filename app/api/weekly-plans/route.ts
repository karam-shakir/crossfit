import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { getDb } from '@/lib/mongodb';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET() {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const db = await getDb();
  const plans = await db.collection('weekly_plans')
    .find({}).sort({ createdAt: -1 }).limit(20).toArray();
  return NextResponse.json(plans.map(({ _id, ...p }) => p));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const body = await req.json();
  const db = await getDb();
  const plan = {
    id: generateId(),
    ...body,
    createdAt: new Date().toISOString(),
    createdBy: session.id,
  };
  await db.collection('weekly_plans').insertOne(plan as any);
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const deleteWods = searchParams.get('deleteWods') === 'true';
  const db = await getDb();

  // جلب بيانات الخطة لمعرفة نطاق التواريخ
  let deletedWods = 0;
  if (deleteWods) {
    const plan = await db.collection('weekly_plans').findOne({ id });
    if (plan?.fromDate && plan?.days) {
      const start = plan.fromDate as string;
      const end = new Date(start + 'T00:00:00');
      end.setDate(end.getDate() + (plan.days as number) - 1);
      const endStr = end.toISOString().split('T')[0];
      const result = await db.collection('wods').deleteMany({
        date: { $gte: start, $lte: endStr },
      });
      deletedWods = result.deletedCount;
    } else if (plan?.wods?.length) {
      // fallback: استخرج التواريخ من الـ wods المحفوظة
      const dates = (plan.wods as any[]).map((w: any) => w.date).filter(Boolean);
      if (dates.length) {
        const result = await db.collection('wods').deleteMany({ date: { $in: dates } });
        deletedWods = result.deletedCount;
      }
    }
  }

  await db.collection('weekly_plans').deleteOne({ id });
  return NextResponse.json({ ok: true, deletedWods });
}
