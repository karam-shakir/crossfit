import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageGym } from '@/lib/permissions';
import { getGymProfile, upsertGymProfile, getAllGymProfiles } from '@/lib/db';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// GET — admin: أي عضو أو كل البروفايلات | صلاحية الجيم المحدودة: أي عضو بالمعرّف فقط | عضو عادي: بروفايله فقط
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');

  if (session.role === 'admin') {
    if (memberId) {
      const profile = await getGymProfile(memberId);
      return NextResponse.json(profile || null);
    }
    const profiles = await getAllGymProfiles();
    return NextResponse.json(profiles);
  }

  if (memberId && await canManageGym(session)) {
    const profile = await getGymProfile(memberId);
    return NextResponse.json(profile || null);
  }

  const profile = await getGymProfile(session.id);
  return NextResponse.json(profile || null);
}

// POST — عضو يحفظ بروفايله | admin أو صلاحية الجيم المحدودة يحفظان لأي عضو
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const canActForOthers = session.role === 'admin' || await canManageGym(session);
  const memberId = canActForOthers && body.memberId ? body.memberId : session.id;

  const existing = await getGymProfile(memberId);
  const profile = {
    id: existing?.id || generateId(),
    memberId,
    goal: body.goal || 'general_fitness',
    level: body.level || 'beginner',
    age: body.age ? Number(body.age) : undefined,
    weight: body.weight ? Number(body.weight) : undefined,
    height: body.height ? Number(body.height) : undefined,
    daysPerWeek: Number(body.daysPerWeek) || 3,
    focusAreas: body.focusAreas || [],
    limitations: body.limitations || '',
    updatedAt: new Date().toISOString(),
  };

  await upsertGymProfile(profile as any);
  return NextResponse.json(profile);
}
