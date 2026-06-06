import { NextRequest, NextResponse } from 'next/server';
import { getMemberMeasurements, addMeasurement } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId') || session.id;

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
    date: body.date || new Date().toISOString().split('T')[0],
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
