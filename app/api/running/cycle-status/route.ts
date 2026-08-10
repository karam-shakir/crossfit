import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getRunningProfile, getLatestRunningWeekMeta } from '@/lib/db';
import { todaySA } from '@/lib/timezone';
import { computeNextCyclePhase, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO } from '@/lib/periodization';
import { getRaceTaperInfo, computeNextWalkRunStage, getWalkRunStageGuidance, SENIOR_LEVEL_TO_INITIAL_STAGE } from '@/lib/runningProgramming';

// يعرض للوحة الإدارة حالة برنامج هذا العداء قبل التوليد — يختلف الشكل حسب هدفه:
// كبار السن (مرحلة مشي/جري)، سباق قريب (تخفيف)، أو عادي (دورة تدريج)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) return NextResponse.json({ error: 'memberId مطلوب' }, { status: 400 });

  const profile = await getRunningProfile(memberId);
  const latest = await getLatestRunningWeekMeta(memberId);
  const today = todaySA();

  if (profile?.goal === 'senior_walk_run') {
    const initialStage = SENIOR_LEVEL_TO_INITIAL_STAGE[profile.level] ?? 0;
    const { stage, weeksAtStage } = computeNextWalkRunStage(
      latest?.runWalkStage ?? null,
      latest?.weeksAtStage ?? null,
      initialStage
    );
    // هذه معاينة فقط (لا تُقدِّم فعلياً) — تُظهر المرحلة الحالية المخزّنة، لا التالية بعد الترقية
    const currentStage = latest?.runWalkStage ?? stage;
    const currentInfo = getWalkRunStageGuidance(currentStage);
    return NextResponse.json({
      mode: 'senior',
      currentStage,
      currentStageLabel: `${currentInfo.stage}. ${currentInfo.nameAr}`,
      weeksAtStage: latest?.weeksAtStage ?? 0,
      weeksUntilNextStage: Math.max(0, 2 - (latest?.weeksAtStage ?? 0)),
      isMaxStage: currentStage >= 8,
      latest: latest || null,
    });
  }

  if (profile?.goal) {
    const raceTaper = getRaceTaperInfo(profile.targetRaceDate, today, profile.goal);
    if (raceTaper) {
      return NextResponse.json({ mode: 'taper', taperInfo: raceTaper, latest: latest || null });
    }
  }

  const { phase, cycleIndex, autoDeloadTriggered } = computeNextCyclePhase(latest?.cycleIndex ?? null);
  return NextResponse.json({
    mode: 'cycle',
    latest: latest || null,
    nextPhase: phase,
    nextCycleIndex: cycleIndex,
    nextPhaseLabel: CYCLE_PHASE_LABELS_AR[phase],
    nextPhaseInfo: CYCLE_PHASE_INFO[phase],
    autoDeloadTriggered,
  });
}
