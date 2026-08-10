// ═══════════════════════════════════════════════════════════════
// مكتبة برمجة الجري المشتركة — مصدر واحد للحقيقة لمسار توليد الأسبوع
// يغطي: تخفيف ما قبل السباق (Taper)، تصنيف شدة الأسبوع الماضي من نوع
// الجلسات لا الكيلومترات فقط، إرشاد وقاية إصابات، وبرنامج المشي/الجري
// التدريجي الآمن لكبار السن المبتدئين (Couch-to-5K المُعتمد طبياً).
// ═══════════════════════════════════════════════════════════════

import type { CyclePhase } from './periodization';

// ═══ دورة التدريج العادية (بلا سباق قريب) — تُترجَم لقاعدة نمو حجم/جودة نصية،
// لا مضاعِف وزن كما في الجيم/الكروسفت، لأن حجم الجري أصلاً ديناميكي (مبني على lastWeekKm) ═══

export const RUNNING_PHASE_VOLUME_RULE: Record<CyclePhase, string> = {
  foundation: 'انمُ الحجم بحذر — بحد أقصى 5-7% عن الأسبوع الماضي (أقل من الحد الاعتيادي 10%) — الأولوية بناء القاعدة الهوائية لا زيادة الحجم بسرعة',
  build:      'انمُ الحجم حتى حد 10% القياسي عن الأسبوع الماضي — هذا أسبوع بناء طبيعي',
  peak:       'حافظ على حجم قريب من الأسبوع الماضي (±3%) لكن ارفع جودة/شدة جلسات الجودة لأقصى درجة آمنة لمستوى العداء — هذا أسبوع ذروة شدة لا نمو حجم',
  deload:     'خفّض الحجم 30-40% عن الأسبوع الماضي — جلسات Easy/Recovery فقط، لا Intervals ولا Tempo ولا Hills إطلاقاً هذا الأسبوع',
};

// ═══ تخفيف ما قبل السباق (Race Taper) ═══

export interface RaceTaperInfo {
  weeksUntilRace: number;
  isRaceWeek: boolean;
  volumeMultiplier: number; // نسبة من الحجم المعتاد لهذا الأسبوع
  phaseLabel: string;
  guidance: string;
}

// عدد أسابيع نافذة التخفيف حسب الهدف — كلما طالت مسافة السباق زادت نافذة التخفيف اللازمة
const TAPER_WINDOW_WEEKS: Record<string, number> = {
  race_5k: 1, speed: 1, race_10k: 1, half_marathon: 2, marathon: 3,
  general_endurance: 0, fat_burn: 0, senior_walk_run: 0,
};

/** يحسب مرحلة التخفيف إن كان هناك تاريخ سباق مستهدف ضمن نافذة التخفيف — وإلا يُرجِع null (استخدم دورة التدريج العادية) */
export function getRaceTaperInfo(targetRaceDate: string | undefined, startDate: string, goal: string): RaceTaperInfo | null {
  if (!targetRaceDate) return null;
  const raceMs = new Date(targetRaceDate + 'T00:00:00').getTime();
  const startMs = new Date(startDate + 'T00:00:00').getTime();
  if (isNaN(raceMs) || isNaN(startMs)) return null;

  const daysUntil = Math.round((raceMs - startMs) / 86400000);
  if (daysUntil < -3) return null; // السباق مضى فعلياً

  const weeksUntilRace = Math.max(0, Math.round(daysUntil / 7));
  const taperWindow = TAPER_WINDOW_WEEKS[goal] ?? 0;
  if (taperWindow === 0 || weeksUntilRace > taperWindow) return null;

  const isRaceWeek = weeksUntilRace === 0;
  let volumeMultiplier: number;
  let phaseLabel: string;
  if (isRaceWeek) {
    volumeMultiplier = 0.35; phaseLabel = '🏁 أسبوع السباق';
  } else if (weeksUntilRace === 1) {
    volumeMultiplier = 0.65; phaseLabel = 'تخفيف — أسبوع واحد قبل السباق';
  } else if (weeksUntilRace === 2) {
    volumeMultiplier = 0.82; phaseLabel = 'تخفيف — أسبوعان قبل السباق';
  } else {
    volumeMultiplier = 0.90; phaseLabel = 'بداية التخفيف — 3 أسابيع قبل السباق';
  }

  const guidance = isRaceWeek
    ? 'أسبوع السباق: خفّض الحجم إلى ~35% من المعتاد. احتفظ بمقطع قصير جداً بإيقاع السباق قبل يومين من السباق فقط لإيقاظ الساقين. لا تجرّب حذاءً أو تغذية جديدة لأول مرة الآن. نم جيداً وركّز على الترطيب وتحميل الكربوهيدرات آخر 2-3 أيام. لا جلسات جودة طويلة إطلاقاً.'
    : `تخفيف تدريجي: قلّل الحجم الكلي حسب النسبة أعلاه لكن حافظ على بعض الحدة (مقاطع قصيرة بإيقاع السباق) حتى لا يفقد الجسم حدّته — القاعدة: قلّل الكمية لا الجودة. لا تُدخل مسافات أو تمارين قياسية جديدة الآن مهما شعر العداء بجاهزية.`;

  return { weeksUntilRace, isRaceWeek, volumeMultiplier, phaseLabel, guidance };
}

// ═══ تصنيف شدة الأسبوع الماضي من نوع الجلسات — لا الكيلومترات فقط ═══

const QUALITY_RUN_TYPES = ['Intervals', 'Tempo', 'Hills', 'Fartlek', 'Speed'];

export function classifyRunningWeekIntensity(recentSessions: { runType: string }[]): { qualityCount: number; label: string; recommendation: string } {
  const qualityCount = recentSessions.filter(s => QUALITY_RUN_TYPES.includes(s.runType)).length;
  let label: string;
  let recommendation: string;
  if (qualityCount >= 3) {
    label = 'ثقيل (جودة عالية)';
    recommendation = 'الأسبوع الماضي كان كثيف الجودة (3+ جلسات شدة) — لا تُضف جلسة جودة إضافية هذا الأسبوع حتى لو كان الحجم الكلي ضمن حد الـ10%؛ أعطِ أولوية حقيقية للاسترداد بين جلسات الجودة';
  } else if (qualityCount >= 1) {
    label = 'متوسط';
    recommendation = 'الأسبوع الماضي معتدل الشدة — يمكن الاستمرار بنفس عدد جلسات الجودة، أو زيادة واحدة بحذر إن كان العداء يتعافى جيداً';
  } else {
    label = 'خفيف (بلا جودة)';
    recommendation = 'لا توجد جلسات جودة في الأسبوع الماضي — الجسم جاهز لجلسة شدة واحدة على الأقل هذا الأسبوع (Intervals أو Tempo حسب الهدف)';
  }
  return { qualityCount, label, recommendation };
}

// ═══ إرشاد وقاية الإصابات — تمارين استقرار مكمّلة، لا بديلة عن تدريب الجيم ═══

export const INJURY_PREVENTION_GUIDANCE =
  'أضف تمارين استقرار وقائية 1-2 مرة أسبوعياً بعد جلسة Easy (وليس قبل جلسة جودة أو في يوم Long Run): ' +
  '2-3 من (Single-Leg Glute Bridge، Clamshells، Side Plank، Calf Raises، Single-Leg Balance) لمدة 8-10 دقائق فقط. ' +
  'هذا يقي من إصابات الجري الشائعة (ركبة العداء، التهاب الرباط الحرقفي، Shin Splints) ويكمل تدريب الجيم إن وُجد — لا يُدرجه كجلسة منفصلة، بل ملاحظة قصيرة في notes ذلك اليوم.';

// ═══ برنامج المشي/الجري التدريجي الآمن لكبار السن (منهجية Couch-to-5K المُعتمدة) ═══

export interface WalkRunStage {
  stage: number;
  nameAr: string;
  structureAr: string;
  totalMinutes: string;
  notesAr: string;
}

export const WALK_RUN_STAGES: WalkRunStage[] = [
  { stage: 0, nameAr: 'التأسيس — مشي فقط', structureAr: 'مشي متواصل بإيقاع نشيط (جمل كاملة أثناء الحديث) — بدون أي جري إطلاقاً', totalMinutes: '20-25 دقيقة', notesAr: 'الهدف بناء عادة الحركة اليومية وتحمّل المفاصل قبل أي جري — لا استعجال هنا مهما بدا العضو متحمساً' },
  { stage: 1, nameAr: 'أول تلامس مع الجري', structureAr: 'مشي 4 دقائق ← جري خفيف جداً 1 دقيقة — كرر 4-5 مرات', totalMinutes: '20-25 دقيقة', notesAr: 'الجري هنا قد يكون أبطأ من المشي السريع أحياناً — الهدف الإحساس بالحركة لا السرعة' },
  { stage: 2, nameAr: 'زيادة زمن الجري', structureAr: 'مشي 3 دقائق ← جري خفيف 2 دقيقة — كرر 4-5 مرات', totalMinutes: '20-25 دقيقة', notesAr: '' },
  { stage: 3, nameAr: 'توازن مشي/جري', structureAr: 'مشي 2 دقيقة ← جري خفيف 3 دقائق — كرر 4-5 مرات', totalMinutes: '25-30 دقيقة', notesAr: '' },
  { stage: 4, nameAr: 'الجري يهيمن تدريجياً', structureAr: 'مشي 1 دقيقة ← جري خفيف 4 دقائق — كرر 4-5 مرات', totalMinutes: '25-30 دقيقة', notesAr: '' },
  { stage: 5, nameAr: 'جري شبه متواصل', structureAr: 'جري خفيف 8 دقائق ← مشي دقيقة واحدة (راحة نشطة) — كرر 2-3 مرات', totalMinutes: '25-30 دقيقة', notesAr: '' },
  { stage: 6, nameAr: 'جري متواصل قصير', structureAr: 'جري خفيف متواصل 10-12 دقيقة، إحماء وتهدئة بالمشي حوله', totalMinutes: '20-25 دقيقة جري + إحماء/تهدئة', notesAr: '' },
  { stage: 7, nameAr: 'جري متواصل متوسط', structureAr: 'جري خفيف متواصل 15-18 دقيقة، إحماء وتهدئة بالمشي حوله', totalMinutes: '25-30 دقيقة جري + إحماء/تهدئة', notesAr: '' },
  { stage: 8, nameAr: 'الهدف الصحي المستقر (Maintenance)', structureAr: 'جري خفيف متواصل 20-25 دقيقة براحة تامة', totalMinutes: '20-25 دقيقة', notesAr: 'هذه مرحلة الحفاظ — الهدف الصحة والاستمرارية طويلة المدى لا كسر أرقام أو زيادة أكثر ما لم يطلب العضو ذلك صراحة' },
];

// نقطة انطلاق مختلفة حسب مستوى اللياقة الحالي المُقيَّم من المدرب — لا يبدأ الجميع من الصفر
export const SENIOR_LEVEL_TO_INITIAL_STAGE: Record<string, number> = {
  beginner: 0,       // خامل تماماً أو يبدأ من الصفر
  intermediate: 2,    // يمشي بانتظام لكن لم يجرّب الجري
  advanced: 4,        // نشيط، يمشي مسافات طويلة بانتظام
  elite: 6,           // عاد للجري تدريجياً من قبل أو نشيط جداً لعمره
};

/**
 * يحدد مرحلة المشي/الجري القادمة: يترقّى درجة واحدة فقط بعد أسبوعين ناجحين متتاليين على
 * نفس الدرجة (لا كل أسبوع — التدرج البطيء هو أساس السلامة لهذه الفئة)، بحد أقصى آخر درجة.
 */
export function computeNextWalkRunStage(
  prevStage: number | null,
  weeksAtPrevStage: number | null,
  initialStage: number,
  forceStage?: number
): { stage: number; weeksAtStage: number; justAdvanced: boolean } {
  const maxStage = WALK_RUN_STAGES.length - 1;
  if (forceStage !== undefined) {
    return { stage: Math.min(Math.max(forceStage, 0), maxStage), weeksAtStage: 1, justAdvanced: false };
  }
  if (prevStage === null) {
    return { stage: Math.min(Math.max(initialStage, 0), maxStage), weeksAtStage: 1, justAdvanced: false };
  }
  // weeksAtPrevStage يمثّل عدد الأسابيع المكتملة فعلياً على المرحلة الحالية قبل هذا الأسبوع —
  // نُرقّي فقط إن اكتمل أسبوعان بالفعل، لا عند بداية الأسبوع الثاني (وإلا يترقّى العضو بعد أسبوع واحد فقط)
  const completedWeeksAtStage = weeksAtPrevStage ?? 0;
  if (completedWeeksAtStage >= 2 && prevStage < maxStage) {
    return { stage: prevStage + 1, weeksAtStage: 1, justAdvanced: true };
  }
  return { stage: prevStage, weeksAtStage: completedWeeksAtStage + 1, justAdvanced: false };
}

export function getWalkRunStageGuidance(stage: number): WalkRunStage {
  return WALK_RUN_STAGES[Math.min(Math.max(stage, 0), WALK_RUN_STAGES.length - 1)];
}

// ═══ إرشادات سلامة إجبارية لبرنامج كبار السن — تُدرج حرفياً في كل أسبوع ═══

export const SENIOR_SAFETY_GUIDANCE = `⚠️ سلامة إجبارية لهذا البرنامج (لا تُهمَل مهما بدا العضو متحمساً):
• ينصح باستشارة الطبيب قبل البدء إن وُجد تاريخ مرضي (قلب، ضغط، سكري، مفاصل) — اذكر هذا في الأسبوع الأول فقط
• التوقف الفوري عند: ألم صدر، دوخة، ضيق تنفس غير طبيعي، ألم مفصلي حاد — لا "تحمّل الألم"
• إحماء وتهدئة أطول من المعتاد (5-7 دقائق مشي بطيء كل طرف) — المفاصل والقلب يحتاجان وقتاً أطول للتكيّف
• الجري هنا بجهد "يمكن التحدث فيه بجمل كاملة دوماً" (Talk Test) — لا إيقاعات ولا نبض مستهدف
• تجنّب ساعات الحر تماماً في السعودية — فجراً أو بعد المغرب فقط، وترطيب متكرر
• أحذية جيدة الدعم وسطح مستوٍ غير زلق — لا جري على رمل أو حصى غير مستقر
• يوم راحة كامل على الأقل بين كل جلستين — لا جلستان متتاليتان أبداً مهما كان المستوى`;
