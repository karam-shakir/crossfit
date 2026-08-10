// ═══════════════════════════════════════════════════════════════
// دورة التدريج (Periodization) — مصدر واحد مشترك بين الكروسفت والجيم
// يحل مشكلة "نفس الوزن كل أسبوع بلا تدرّج حقيقي" و"لا ديلود تلقائي أبداً".
// كل برنامج أسبوعي يمرّ بدورة 4 أسابيع (تأسيس→بناء→ذروة→تفريغ) تتقدم
// تلقائياً وتُخزَّن بين الأسابيع بدل أن يُبرمَج كل أسبوع بمعزل عمّا قبله.
// ═══════════════════════════════════════════════════════════════

export type CyclePhase = 'foundation' | 'build' | 'peak' | 'deload';

export const CYCLE_ORDER: CyclePhase[] = ['foundation', 'build', 'peak', 'deload'];

export const CYCLE_PHASE_LABELS_AR: Record<CyclePhase, string> = {
  foundation: 'التأسيس (Foundation)',
  build: 'البناء (Build)',
  peak: 'الذروة (Peak)',
  deload: 'التفريغ (Deload)',
};

/** multiplier نسبة إلى مرجع الذروة (peak = 1.00) */
export const CYCLE_PHASE_INFO: Record<CyclePhase, { pctLabel: string; multiplier: number; description: string }> = {
  foundation: { pctLabel: '~82% من مرجع الذروة', multiplier: 0.82, description: 'بداية الدورة — بناء حجم وتقنية بحمل معتدل، ليست أثقل نقطة في الدورة' },
  build:      { pctLabel: '~90% من مرجع الذروة', multiplier: 0.90, description: 'زيادة تدريجية في الحمل استعداداً لأسبوع الذروة' },
  peak:       { pctLabel: '100% (مرجع الذروة)',   multiplier: 1.00, description: 'أعلى نقطة في الدورة — أقرب الأحمال للحد الأقصى ضمن الدورة الحالية' },
  deload:     { pctLabel: '~68% من مرجع الذروة', multiplier: 0.68, description: 'أسبوع تعافٍ إجباري بعد الذروة — يعيد ضبط الجهاز العصبي المركزي قبل بدء دورة جديدة' },
};

/**
 * يحدد مرحلة الدورة القادمة:
 * - إن طلب المدرب مرحلة محددة (forcePhase) تُطبَّق كما هي
 * - وإلا: تقدّم طبيعي عبر التسلسل (تأسيس→بناء→ذروة→تفريغ→تأسيس...) بناءً على آخر مرحلة مخزّنة
 * - إن لم توجد دورة سابقة أصلاً، تبدأ من "التأسيس"
 */
export function computeNextCyclePhase(
  prevCycleIndex: number | null,
  forcePhase?: CyclePhase
): { phase: CyclePhase; cycleIndex: number; autoDeloadTriggered: boolean } {
  if (forcePhase) {
    const idx = CYCLE_ORDER.indexOf(forcePhase);
    return { phase: forcePhase, cycleIndex: idx, autoDeloadTriggered: false };
  }
  const nextIndex = prevCycleIndex === null ? 0 : (prevCycleIndex + 1) % CYCLE_ORDER.length;
  const phase = CYCLE_ORDER[nextIndex];
  // autoDeloadTriggered: وصلنا لتفريغ عبر التقدم الطبيعي وليس لأنه أول أسبوع في التاريخ
  return { phase, cycleIndex: nextIndex, autoDeloadTriggered: phase === 'deload' && prevCycleIndex !== null };
}

/** إرشاد RPE (معدل الجهد المُدرَك) للمستويات المتقدمة — يمنع دفعها لنفس الشدة القصوى كل أسبوع بغض النظر عن مرحلة الدورة */
export function getRpeGuidance(phase: CyclePhase): string {
  const map: Record<CyclePhase, string> = {
    foundation: 'RPE 6-7 (تكراران احتياطيان أو أكثر) — أسبوع بناء تقنية لا اختبار قوة',
    build:      'RPE 7-8 (تكرار احتياطي إلى تكرارين) — اقتراب تدريجي من الحمل الأعلى',
    peak:       'RPE 8-9 على المجموعة الأخيرة فقط (تكرار احتياطي أو صفر) — لا تصل RPE10 إلا في يوم بنشمارك/اختبار معلن رسمياً',
    deload:     'لا تتجاوز RPE 6 هذا الأسبوع مهما شعر المتدرب بجاهزية — الهدف تفريغ الجهاز العصبي المركزي لا الاختبار',
  };
  return `للمستويات Advanced/Elite تحديداً: ${map[phase]}`;
}

/**
 * تقدير 1RM من مجموعة مُنجَزة فعلياً (معادلة Epley: 1RM ≈ الوزن × (1 + التكرارات/30)).
 * دقيقة بما يكفي حتى 10-12 تكرار؛ تتراجع الدقة فوق ذلك لكنها تبقى أفضل من رقم عام ثابت لكل من يحمل نفس المستوى الاسمي.
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (!weight || weight <= 0) return 0;
  if (!reps || reps <= 1) return weight;
  return weight * (1 + reps / 30);
}
