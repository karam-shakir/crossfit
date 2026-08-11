import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { getLatestWodCycleMeta } from '@/lib/db';
import { computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO } from '@/lib/crossfitProgramming';

// يعرض للوحة الإدارة مرحلة دورة التدريج القادمة قبل التوليد الفعلي —
// بدون هذا كان المدرب يكتشف الشدة الأسبوعية فقط بعد قراءة الجدول المُولَّد
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const latest = await getLatestWodCycleMeta();
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
