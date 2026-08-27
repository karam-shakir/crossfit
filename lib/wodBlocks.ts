import type { Exercise, Wod, WodBlock, WodExercise, WodLevelSpec } from './db';

// المستويات الأربعة الوحيدة التي تعرضها الواجهة — رُصد فعلياً (2026-08-25) أن الذكاء الاصطناعي
// (تحديداً GPT) قد يُرجع مفتاح مستوى وهمياً إضافياً (مثال: "engineer") لم يُطلَب منه إطلاقاً،
// وكانت طبقة التحقق السابقة تمرر حقل levels كما وصل حرفياً بلا أي تصفية للمفاتيح
const VALID_LEVEL_KEYS = ['beginner', 'intermediate', 'advanced', 'elite'] as const;

/** يُبقي فقط المستويات الأربعة الصحيحة من حقل levels (يحذف أي مفتاح إضافي وهمي)، ويرجع null إن لم يبقَ شيء */
export function sanitizeLevels(levels: any): Record<string, WodLevelSpec> | null {
  if (!levels || typeof levels !== 'object') return null;
  const out: Record<string, WodLevelSpec> = {};
  for (const key of VALID_LEVEL_KEYS) {
    if (levels[key]) out[key] = levels[key];
  }
  return Object.keys(out).length > 0 ? out : null;
}

// ═══════════════════════════════════════════════════════════════
// تطبيع أقسام الـ WOD (إحماء/قوة/ميتكون/أكسسوار/تهدئة) — طبقة توافق مركزية
// ═══════════════════════════════════════════════════════════════
// قبل هذا التحويل كانت الأقسام مصفوفة مسطّحة من التمارين مباشرة (WodExercise[]).
// الآن هي مصفوفة بلوكات (WodBlock[])، كل بلوك له صيغته الخاصة. الأسابيع المحفوظة
// قبل التحويل في MongoDB بقيت بشكلها القديم كما هي (لا ترحيل قسري لقاعدة البيانات) —
// هذه الدالة هي المصدر الوحيد الذي يُطبّع الشكلين لواجهة موحّدة عند القراءة:
// بيانات قديمة (مسطّحة) تُغلَّف كبلوك واحد ضمني بلا صيغة، بيانات جديدة تمر كما هي.
export function normalizeToBlocks(section: unknown): WodBlock[] {
  if (!Array.isArray(section) || section.length === 0) return [];
  const first = section[0] as any;
  if (first && Array.isArray(first.movements)) return section as WodBlock[];
  return [{ format: '', movements: section as WodExercise[] }];
}

/** يُسطّح كل حركات القسم عبر كل البلوكات لمن يحتاج فقط قائمة تمارين (تحليلات، فحوصات، مطابقة IDs) بلا حاجة لبنية البلوك نفسها */
export function flattenMovements(section: unknown): WodExercise[] {
  return normalizeToBlocks(section).flatMap(b => b.movements);
}

export interface NormalizedWodSections {
  warmup: WodBlock[];
  strength: WodBlock[];
  metcon: WodBlock[];
  accessory: WodBlock[];
  cooldown: WodBlock[];
}

/** يُطبّع كل أقسام WOD واحد دفعة واحدة — للاستخدام في نقاط القراءة (enrich, عرض, مشاركة) */
export function normalizeWodSections(wod: Partial<Wod>): NormalizedWodSections {
  return {
    warmup: normalizeToBlocks(wod.warmup),
    strength: normalizeToBlocks(wod.strength),
    metcon: normalizeToBlocks(wod.metcon),
    accessory: normalizeToBlocks(wod.accessory),
    cooldown: normalizeToBlocks(wod.cooldown),
  };
}

/**
 * يُطبّع + يُفعّل (enrich) كل أقسام WOD دفعة واحدة — نقطة القراءة الموحّدة الوحيدة
 * التي يجب أن تستخدمها كل الصفحات (كانت مكرّرة سابقاً في 3 ملفات منفصلة، بعضها كان
 * يُغفل قسم accessory بالخطأ). كل حركة داخل كل بلوك تحصل على حقل exercise (بيانات
 * العرض الكاملة: الاسم/الصورة/العضلات) من مجموعة exercises في قاعدة البيانات.
 */
export function enrichWodSections(wod: Partial<Wod>, exercises: Exercise[]): NormalizedWodSections {
  const enrichBlock = (block: WodBlock): WodBlock => ({
    ...block,
    movements: block.movements.map(m => ({ ...m, exercise: exercises.find(e => e.id === m.exerciseId) })),
  });
  const sections = normalizeWodSections(wod);
  return {
    warmup: sections.warmup.map(enrichBlock),
    strength: sections.strength.map(enrichBlock),
    metcon: sections.metcon.map(enrichBlock),
    accessory: sections.accessory.map(enrichBlock),
    cooldown: sections.cooldown.map(enrichBlock),
  };
}

// النموذج يملأ "type" (AMRAP/للوقت/تدريب) وصيغة بلوك الميتكون (format، مثل "FOR TIME") بشكل منفصل
// بلا ربط بينهما، فقد يكتب type="AMRAP" بينما صيغة الميتكون الفعلية "FOR TIME" — تناقض يُربك
// وتيرة العضو (رُصد فعلياً 2026-08-20). يشتق النوع الصحيح من صيغة الميتكون الفعلية حين تكون واضحة.
// مشتركة بين التوليد اليومي والأسبوعي (كانت محصورة في اليومي فقط قبل هذا الاستخراج).
export function deriveTypeFromMetconFormat(format: string): string | null {
  const f = (format || '').toUpperCase();
  if (f.includes('AMRAP')) return 'AMRAP';
  if (f.includes('FOR TIME')) return 'للوقت';
  if (f.includes('EMOM') || f.includes('EVERY')) return 'تدريب';
  return null;
}

// ═══ فحص اكتمال الأقسام — دالة مشتركة (سيرفر وعميل) بلا أي استيراد يقتصر على أحدهما، فتُستخدم
// كلاً من: (١) وقت التوليد لإضافة تحذير مرئي ضمن نفس بانر محظورات دمج الحركات الموجود أصلاً،
// و(٢) وقت الحفظ في لوحة التحكم كبوابة تأكيد أخيرة — تعيد الفحص على الحالة الحالية فعلياً وقت
// الضغط على "حفظ" (لا على تحذير قديم من وقت التوليد) لأن المدرب قد يكون عدّل الحركات يدوياً بينهما.
// السبب: رُصد فعلياً (2026-08-27) تمرين وصل للأعضاء بالقوة والأكسسوار والتهدئة فارغة تماماً بصمت.
export function detectIncompleteSections(
  sections: { warmup: unknown; strength: unknown; metcon: unknown; accessory: unknown; cooldown: unknown },
  isBenchmarkDay = false,
): string[] {
  const missing: string[] = [];
  if (!flattenMovements(sections.warmup).length) missing.push('الإحماء');
  if (!flattenMovements(sections.metcon).length) missing.push('الميتكون');
  if (!flattenMovements(sections.cooldown).length) missing.push('التهدئة');
  // القوة والأكسسوار فارغان بالتصميم في يوم بنشمارك — ليسا نقصاً هناك
  if (!isBenchmarkDay) {
    if (!flattenMovements(sections.strength).length) missing.push('القوة');
    if (!flattenMovements(sections.accessory).length) missing.push('الأكسسوار');
  }
  return missing;
}
