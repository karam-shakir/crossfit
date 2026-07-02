import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCalisthenicsProfile, upsertCalisthenicsProfile, getAllCalisthenicsProfiles } from '@/lib/db';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// GET — admin: all profiles | member: own profile
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');

  if (session.role === 'admin') {
    if (memberId) {
      const profile = await getCalisthenicsProfile(memberId);
      return NextResponse.json(profile || null);
    }
    const profiles = await getAllCalisthenicsProfiles();
    return NextResponse.json(profiles);
  }

  const profile = await getCalisthenicsProfile(session.id);
  return NextResponse.json(profile || null);
}

// POST — member saves own profile | admin saves for any member
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const memberId = session.role === 'admin' && body.memberId ? body.memberId : session.id;

  const existing = await getCalisthenicsProfile(memberId);
  const profile = {
    id: existing?.id || generateId(),
    memberId,
    goal: body.goal || 'strength',
    level: body.level || 'beginner',
    gender: body.gender || 'male',
    age: body.age ? Number(body.age) : undefined,
    weight: body.weight ? Number(body.weight) : undefined,
    height: body.height ? Number(body.height) : undefined,
    daysPerWeek: Number(body.daysPerWeek) || 3,
    maxPushups: body.maxPushups ? Number(body.maxPushups) : undefined,
    maxPullups: body.maxPullups !== '' && body.maxPullups !== undefined ? Number(body.maxPullups) : undefined,
    maxDips: body.maxDips !== '' && body.maxDips !== undefined ? Number(body.maxDips) : undefined,
    plankSeconds: body.plankSeconds ? Number(body.plankSeconds) : undefined,
    skillGoals: Array.isArray(body.skillGoals) ? body.skillGoals : [],
    equipment: Array.isArray(body.equipment) ? body.equipment : [],
    limitations: body.limitations || '',
    updatedAt: new Date().toISOString(),
  };

  await upsertCalisthenicsProfile(profile as any);
  return NextResponse.json(profile);
}
