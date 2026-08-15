import type { Exercise, Wod, WodBlock, WodExercise } from './db';

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
