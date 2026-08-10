import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getLatestGymWeekMeta } from '@/lib/db';
import { computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO } from '@/lib/periodization';

// يعرض للوحة الإدارة مرحلة دورة التدريج القادمة لهذا العضو تحديداً قبل التوليد الفعلي
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const latest = await getLatestGymWeekMeta(memberId);
  const { phase, cycleIndex, autoDeloadTriggered } = computeNextCyclePhase(latest?.cycleIndex ?? null);

  return NextResponse.json({
    latest: latest || null,
    nextPhase: phase,
    nextCycleIndex: cycleIndex,
    nextPhaseLabel: CYCLE_PHASE_LABELS_AR[phase],
    nextPhaseInfo: CYCLE_PHASE_INFO[phase],
    autoDeloadTriggered,
  });
}
