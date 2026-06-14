import { NextRequest, NextResponse } from 'next/server';
import { getMemberMeasurements, addMeasurement } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { todaySA } from '@/lib/timezone';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requested = searchParams.get('memberId') || session.id;
  const memberId = session.role === 'admin' ? requested : session.id;

  const records = await getMemberMeasurements(memberId);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const record = {
    id: generateId(),
    memberId: session.id,
    date: body.date || todaySA(),
    weight: body.weight,
    height: body.height,
    bodyFat: body.bodyFat,
    chest: body.chest,
    waist: body.waist,
    hips: body.hips,
    shoulders: body.shoulders,
    arm: body.arm,
    thigh: body.thigh,
  };

  await addMeasurement(record);
  return NextResponse.json(record);
}
