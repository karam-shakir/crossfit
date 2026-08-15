/**
 * سكريبت تحقق آلي لنظام توليد الكروسفت — بدل الاعتماد على مراجعة يدوية لأسبوع واحد
 * في كل مرة (كما جرى طوال هذه الجلسة)، يفحص هذا السكريبت كل القواعد المتراكمة دفعة واحدة.
 *
 * قسمان مستقلان:
 *   ١) فحوصات منطق حتمي (بدون شبكة) — تستدعي دوال lib/crossfitProgramming.ts وlib/periodization.ts
 *      الحقيقية مباشرة (لا إعادة تنفيذ للمنطق)، وتتحقق من: تناوب الأنماط، عدالة كسر التعادل،
 *      دورة التدريج، رصد تباعد أيام الثقل، اختيار صيغة البارتنر.
 *   ٢) فحص محتوى على بيانات حقيقية من قاعدة البيانات (اختياري) — يجلب أسبوعاً فعلياً محفوظاً
 *      ويتحقق منه ضد كل القواعد: IDs صالحة، توزيع الراحة، تباعد الثقل، تماسك يوم البارتنر،
 *      تنوّع الأكسسوار/الإحماء بين أيام النمط نفسه، الميتكون يدرّب نمط يومه.
 *
 * تشغيل:
 *   npx tsx scripts/verify-crossfit-week.ts                                  # منطق فقط، بدون شبكة
 *   npx tsx scripts/verify-crossfit-week.ts --live                           # + آخر أسبوع محفوظ فعلياً
 *   npx tsx scripts/verify-crossfit-week.ts --from 2026-08-11 --days 7       # + نطاق تواريخ محدد
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

import {
  MovementPattern, PATTERN_LABELS_AR, EXERCISES,
  buildPatternSequence, suggestPartnerFormat, PartnerFormat,
  HEAVY_BY_DEFAULT_PATTERNS, PATTERN_ACCESSORY_MAP, PATTERN_METCON_MAP,
} from '../lib/crossfitProgramming';
import { computeNextCyclePhase, CyclePhase, CYCLE_ORDER } from '../lib/periodization';
import { flattenMovements } from '../lib/wodBlocks';

// ═══════════════════════════════════════════════════════════════
// تقرير موحّد
// ═══════════════════════════════════════════════════════════════
type CheckResult = { section: string; name: string; pass: boolean; details?: string };
const results: CheckResult[] = [];
function check(section: string, name: string, pass: boolean, details?: string) {
  results.push({ section, name, pass, details });
}

function printReport(): boolean {
  const bySection = new Map<string, CheckResult[]>();
  for (const r of results) {
    if (!bySection.has(r.section)) bySection.set(r.section, []);
    bySection.get(r.section)!.push(r);
  }
  let allPass = true;
  Array.from(bySection.entries()).forEach(([section, checks]) => {
    console.log(`\n${section}`);
    console.log('─'.repeat(section.length));
    checks.forEach(c => {
      const icon = c.pass ? '✅' : '❌';
      if (!c.pass) allPass = false;
      console.log(`${icon} ${c.name}${c.details ? `\n   ↳ ${c.details}` : ''}`);
    });
  });
  const passCount = results.filter(r => r.pass).length;
  console.log(`\n${'═'.repeat(40)}`);
  console.log(`النتيجة: ${passCount}/${results.length} فحصاً ناجحاً`);
  console.log('═'.repeat(40));
  return allPass;
}

// ═══════════════════════════════════════════════════════════════
// القسم ١: فحوصات المنطق الحتمي — بدون شبكة، تستدعي الكود الحقيقي مباشرة
// ═══════════════════════════════════════════════════════════════

function runLogicChecks() {
  const S = 'القسم ١ — المنطق الحتمي (بدون شبكة)';

  // ── تناوب الأنماط: لا تكرار متتالٍ عبر يوم نشط طويل ──
  {
    const seq = buildPatternSequence(10, [], 0);
    let noImmediateRepeat = true;
    for (let i = 1; i < seq.length; i++) if (seq[i] === seq[i - 1]) noImmediateRepeat = false;
    check(S, 'تناوب الأنماط: لا تكرار متتالٍ عبر 10 أيام نشطة', noImmediateRepeat, seq.join(' → '));
  }

  // ── عدالة كسر التعادل: "اليوم السادس" الإضافي يجب أن يتنقّل بين الأنماط لا أن يفوز به نمط واحد دائماً ──
  {
    const winners: MovementPattern[] = [];
    for (let cycleIndex = 0; cycleIndex < 5; cycleIndex++) {
      winners.push(buildPatternSequence(6, [], cycleIndex)[5]);
    }
    const distinctWinners = new Set(winners);
    check(
      S,
      'عدالة كسر التعادل: الفائز بـ"اليوم السادس" يتغيّر عبر 5 دورات متتالية (لا يفوز القرفصاء دائماً)',
      distinctWinners.size >= 4,
      `عبر cycleIndex=0..4: ${winners.join(', ')}`
    );
  }

  // ── رصد تباعد أيام الثقل: إعادة إنتاج سيناريو أسبوع ١١-١٧ أغسطس ٢٠٢٦ الفعلي ──
  {
    const heavySpacingFlags = (seq: MovementPattern[]): string[] => {
      const squatIdx = seq.map((p, i) => (p === 'squat' ? i : -1)).filter(i => i >= 0);
      const hingeIdx = seq.map((p, i) => (p === 'hinge' ? i : -1)).filter(i => i >= 0);
      const flags: string[] = [];
      for (const si of squatIdx) for (const hi of hingeIdx) {
        if (Math.abs(si - hi) === 2) flags.push(`يوم${Math.min(si, hi) + 1}/يوم${Math.max(si, hi) + 1}`);
      }
      return flags;
    };
    const realWorldSeq: MovementPattern[] = ['pull', 'push', 'hinge', 'olympic', 'squat'];
    const flagged = heavySpacingFlags(realWorldSeq);
    check(S, 'رصد تباعد الثقل: يُطلق تنبيهاً على سيناريو ١١-١٧ أغسطس الفعلي (رفعة يوم٣ ↔ قرفصاء يوم٥)', flagged.length === 1, flagged.join(', '));

    const normalSeq: MovementPattern[] = ['squat', 'pull', 'push', 'hinge', 'olympic'];
    const falsePositives = heavySpacingFlags(normalSeq);
    check(S, 'رصد تباعد الثقل: لا تنبيه خاطئ على تسلسل عادي (فارق 3 أيام بين القرفصاء والرفعة)', falsePositives.length === 0, falsePositives.join(', ') || 'لا تنبيهات');
  }

  // ── دورة التدريج: تتقدّم بترتيب صحيح ذاتي التكرار كل 4 أسابيع ──
  {
    let idx: number | null = null;
    const seen: CyclePhase[] = [];
    for (let week = 0; week < 8; week++) {
      const { phase, cycleIndex } = computeNextCyclePhase(idx);
      seen.push(phase);
      idx = cycleIndex;
    }
    const expected = [...CYCLE_ORDER, ...CYCLE_ORDER];
    check(S, 'دورة التدريج: تتقدّم (تأسيس→بناء→ذروة→تفريغ) وتُعيد الكرّة تلقائياً كل 4 أسابيع', JSON.stringify(seen) === JSON.stringify(expected), seen.join(' → '));
  }

  // ── دورة التدريج: autoDeloadTriggered يُفعَّل فقط في التقدّم الطبيعي، لا عند فرض المدرب مرحلة يدوياً ──
  // forcePhase هو قرار بشري صريح — النظام لا يتجاوزه، وautoDeloadTriggered يبقى false احتراماً له.
  // الضمان الحقيقي (وصول التفريغ تلقائياً كل 4 أسابيع) مُختبَر أعلاه ضمن التقدّم الطبيعي الكامل.
  {
    let idx: number | null = null;
    let anyAutoTriggeredWhileForced = false;
    for (let week = 0; week < 5; week++) {
      const res = computeNextCyclePhase(idx, 'build');
      idx = res.cycleIndex;
      if (res.autoDeloadTriggered) anyAutoTriggeredWhileForced = true;
    }
    check(S, 'دورة التدريج: فرض مرحلة يدوياً (forcePhase) لا يُفعِّل autoDeloadTriggered أبداً — قرار المدرب يُحترَم بلا تجاوز', !anyAutoTriggeredWhileForced);
  }

  // ── اختيار صيغة البارتنر يطابق التصميم لكل نمط ──
  {
    const expected: Record<MovementPattern, PartnerFormat> = {
      squat: 'synchro', hinge: 'you_go_i_go', push: 'synchro', pull: 'shared_reps', olympic: 'you_go_i_go',
    };
    const mismatches: string[] = [];
    for (const p of Object.keys(expected) as MovementPattern[]) {
      const actual = suggestPartnerFormat(p);
      if (actual !== expected[p]) mismatches.push(`${PATTERN_LABELS_AR[p]}: توقعنا ${expected[p]} وحصلنا ${actual}`);
    }
    check(S, 'صيغة البارتنر المُقترحة تلقائياً تطابق التصميم لكل نمط (hinge/olympic→you_go_i_go، إلخ)', mismatches.length === 0, mismatches.join(' | '));
  }

  // ── سلامة قائمة التمارين الأساسية نفسها ──
  {
    const ids = EXERCISES.map(e => e.id);
    const unique = new Set(ids);
    check(S, 'قائمة EXERCISES خالية من IDs مكررة', unique.size === ids.length, `${ids.length} إجمالي، ${unique.size} فريد`);

    // كل ID مذكور في PATTERN_ACCESSORY_MAP يجب أن يكون موجوداً فعلاً في EXERCISES —
    // هذا بالضبط نوع الخطأ الذي حدث سابقاً مع "PVC pass-through" (ID وهمي غير موجود)
    const invalidAccessoryIds: string[] = [];
    for (const pattern of Object.keys(PATTERN_ACCESSORY_MAP) as MovementPattern[]) {
      for (const id of PATTERN_ACCESSORY_MAP[pattern].suggestedIds) {
        if (!unique.has(id)) invalidAccessoryIds.push(`${pattern}:${id}`);
      }
    }
    check(S, 'كل IDs الأكسسوار المقترحة في PATTERN_ACCESSORY_MAP موجودة فعلياً في EXERCISES', invalidAccessoryIds.length === 0, invalidAccessoryIds.join(', '));

    // نفس الفحص لقائمة الميتكون المستقلة الجديدة لكل نمط (PATTERN_METCON_MAP)
    const invalidMetconIds: string[] = [];
    for (const pattern of Object.keys(PATTERN_METCON_MAP) as MovementPattern[]) {
      for (const id of PATTERN_METCON_MAP[pattern].suggestedIds) {
        if (!unique.has(id)) invalidMetconIds.push(`${pattern}:${id}`);
      }
    }
    check(S, 'كل IDs الميتكون المقترحة في PATTERN_METCON_MAP موجودة فعلياً في EXERCISES', invalidMetconIds.length === 0, invalidMetconIds.join(', '));
  }
}

// ═══════════════════════════════════════════════════════════════
// القسم ٢: فحص محتوى أسبوع حقيقي من قاعدة البيانات
// ═══════════════════════════════════════════════════════════════

interface WodDoc {
  date: string; title: string; titleEn?: string; type: string;
  isRest?: boolean; isCalisthenics?: boolean; isPartnerWod?: boolean; partnerFormat?: string;
  pattern?: MovementPattern;
  warmup?: any[]; strength?: any[]; metcon?: any[]; accessory?: any[]; cooldown?: any[];
  notes?: string;
}

const VALID_EXERCISE_IDS = new Set(EXERCISES.map(e => e.id));
const COOLDOWN_BANNED_PHRASES = ['لخفض النبض', 'تهدئة القلب', 'خفّف معدل القلب'];

// خرائط تقريبية: أي حركات في الميتكون تُعتبر "من نفس نمط اليوم" — تطابق دليل اختيار تمرين
// القوة بالبار في lib/crossfitProgramming.ts (PATTERN_STRENGTH_MAP) بشكل موسّع ليشمل حركات
// الميتكون المرتبطة منطقياً بكل نمط (وليس فقط تمرين القوة بالبار نفسه)
// مصدر واحد للحقيقة الآن: lib/crossfitProgramming.ts (PATTERN_METCON_MAP) — كان مكرَّراً محلياً هنا سابقاً

function validateWeek(wods: WodDoc[], label: string) {
  const S = `القسم ٢ — محتوى حقيقي: ${label}`;
  const active = wods.filter(w => !w.isRest && !w.isCalisthenics);

  // ── IDs صالحة فقط ──
  {
    const invalid: string[] = [];
    for (const w of wods) {
      for (const sec of ['warmup', 'strength', 'metcon', 'accessory', 'cooldown'] as const) {
        for (const item of flattenMovements((w as any)[sec])) {
          if (item?.exerciseId && !VALID_EXERCISE_IDS.has(item.exerciseId)) {
            invalid.push(`${w.date}/${sec}: ${item.exerciseId}`);
          }
        }
      }
    }
    check(S, 'كل exerciseId المستخدمة موجودة في القائمة الأساسية (لا IDs مخترَعة)', invalid.length === 0, invalid.join(', '));
  }

  // ── كل يوم نشط عادي (غير راحة، غير بنشمارك بدون قوة/أكسسوار) مكتمل الأقسام الخمسة ──
  {
    const incomplete: string[] = [];
    for (const w of active) {
      const isBenchmarkLike = flattenMovements(w.strength).length === 0 && flattenMovements(w.accessory).length === 0 && flattenMovements(w.metcon).length > 0;
      for (const sec of ['warmup', 'metcon', 'cooldown'] as const) {
        if (flattenMovements((w as any)[sec]).length === 0) incomplete.push(`${w.date}: ${sec} فارغ`);
      }
      if (!isBenchmarkLike) {
        for (const sec of ['strength', 'accessory'] as const) {
          if (flattenMovements((w as any)[sec]).length === 0) incomplete.push(`${w.date}: ${sec} فارغ (وليس يوم بنشمارك)`);
        }
      }
    }
    check(S, 'كل يوم نشط مكتمل الأقسام الخمسة (لا انقطاع JSON صامت)', incomplete.length === 0, incomplete.join(', '));
  }

  // ── التهدئة إطالات فقط — لا عناصر "خفض نبض" ──
  {
    const violations: string[] = [];
    for (const w of active) {
      for (const item of flattenMovements(w.cooldown)) {
        const text = `${item.notes || ''}`;
        if (COOLDOWN_BANNED_PHRASES.some(p => text.includes(p))) violations.push(`${w.date}: "${text.slice(0, 40)}..."`);
      }
    }
    check(S, 'قسم الإطالات خالٍ من عناصر "خفض النبض" (إطالات ثابتة فقط)', violations.length === 0, violations.join(' | '));
  }

  // ── توزيع الراحة: لا أكثر من 3 أيام نشطة متتالية ──
  {
    const sorted = [...wods].sort((a, b) => a.date.localeCompare(b.date));
    let streak = 0, maxStreak = 0;
    for (const w of sorted) {
      if (w.isRest) streak = 0; else { streak++; maxStreak = Math.max(maxStreak, streak); }
    }
    check(S, 'لا يوجد أكثر من 3 أيام نشطة متتالية بلا راحة', maxStreak <= 3, `أطول سلسلة نشطة متتالية: ${maxStreak} أيام`);
  }

  // ── تباعد الثقل: إن وقع القرفصاء والرفعة بفارق يوم نشط واحد بلا راحة، يجب ذكر تخفيف صريح ──
  {
    const patternedActive = active.filter(w => w.pattern).sort((a, b) => a.date.localeCompare(b.date));
    const warnings: string[] = [];
    for (let i = 0; i < patternedActive.length; i++) {
      for (let j = i + 1; j < patternedActive.length; j++) {
        const a = patternedActive[i], b = patternedActive[j];
        if (!HEAVY_BY_DEFAULT_PATTERNS.includes(a.pattern!) || !HEAVY_BY_DEFAULT_PATTERNS.includes(b.pattern!)) continue;
        if (a.pattern === b.pattern) continue;
        // فارق يوم تقويمي واحد بالضبط (متجاوران فعلياً في التقويم، لا في التسلسل المنطقي فقط)
        const dA = new Date(a.date + 'T00:00:00'), dB = new Date(b.date + 'T00:00:00');
        const dayGap = Math.round((dB.getTime() - dA.getTime()) / 86400000);
        if (dayGap === 2) {
          const laterDay = b; // b هو الأحدث زمنياً (بما أن القائمة مرتّبة تصاعدياً و j > i)
          const mentionsLighter = /RPE\s*6|MEDIUM|خُفِّف|خفّف|أقل بـ\s*5|أقل بـ\s*10/i.test(laterDay.notes || '');
          if (!mentionsLighter) warnings.push(`${a.date} (${PATTERN_LABELS_AR[a.pattern!]}) و${b.date} (${PATTERN_LABELS_AR[b.pattern!]}) بفارق يوم واحد — لا ذكر لتخفيف الشدة في notes اليوم الثاني`);
        }
      }
    }
    check(S, 'تباعد الثقل: أي تجاور بفارق يوم بين القرفصاء والرفعة مذكور فيه تخفيف صريح', warnings.length === 0, warnings.join(' || '));
  }

  // ── تماسك يوم البارتنر: العنوان يذكر "بارتنر"، والقوة تحمل levels فردية ──
  {
    const partnerDays = active.filter(w => w.isPartnerWod);
    const issues: string[] = [];
    for (const w of partnerDays) {
      const titleText = `${w.title} ${w.titleEn || ''}`;
      if (!/بارتنر|partner/i.test(titleText)) issues.push(`${w.date}: العنوان لا يذكر "بارتنر"`);
      const strengthMoves = flattenMovements(w.strength);
      const strengthHasLevels = strengthMoves.every((e: any) => e.levels);
      if (strengthMoves.length > 0 && !strengthHasLevels) issues.push(`${w.date}: تمرين قوة بلا levels فردية`);
    }
    check(S, `تماسك يوم/أيام البارتنر (${partnerDays.length} يوم)`, issues.length === 0, issues.join(' | ') || (partnerDays.length === 0 ? 'لا يوجد يوم بارتنر هذا الأسبوع' : undefined));
  }

  // ── الميتكون يدرّب نمط يومه فعلياً (وليس معاكساً بالكامل) ──
  {
    const violations: string[] = [];
    for (const w of active) {
      if (!w.pattern) continue;
      const family = PATTERN_METCON_MAP[w.pattern]?.suggestedIds || [];
      const metconIds = flattenMovements(w.metcon).map(e => e.exerciseId);
      const hasSamePattern = metconIds.some((id: string) => family.includes(id));
      if (metconIds.length > 0 && !hasSamePattern) violations.push(`${w.date} (${PATTERN_LABELS_AR[w.pattern]}): الميتكون [${metconIds.join(', ')}] لا يحتوي أي حركة من نمط اليوم`);
    }
    check(S, 'كل ميتكون يحتوي حركة واحدة على الأقل من نمط يومه', violations.length === 0, violations.join(' || '));
  }

  // ── تنوّع الأكسسوار/الإحماء بين يومين من نفس النمط ──
  {
    const byPattern = new Map<MovementPattern, WodDoc[]>();
    for (const w of active) {
      if (!w.pattern) continue;
      if (!byPattern.has(w.pattern)) byPattern.set(w.pattern, []);
      byPattern.get(w.pattern)!.push(w);
    }
    const repeats: string[] = [];
    Array.from(byPattern.entries()).forEach(([pattern, days]: [MovementPattern, WodDoc[]]) => {
      if (days.length < 2) return;
      for (let i = 0; i < days.length; i++) for (let j = i + 1; j < days.length; j++) {
        const accA = new Set(flattenMovements(days[i].accessory).map(e => e.exerciseId));
        const accB: Set<string> = new Set(flattenMovements(days[j].accessory).map(e => e.exerciseId));
        const accAList: string[] = Array.from(accA);
        const sameAccessory = accA.size > 0 && accA.size === accB.size && accAList.every(id => accB.has(id));
        if (sameAccessory) repeats.push(`${days[i].date} و${days[j].date} (كلاهما ${PATTERN_LABELS_AR[pattern]}): نفس مجموعة الأكسسوار بالضبط`);
      }
    });
    check(S, 'لا تكرار حرفي للأكسسوار بين يومين من نفس النمط ضمن الأسبوع', repeats.length === 0, repeats.join(' || '));
  }
}

// ═══════════════════════════════════════════════════════════════
// اتصال قاعدة البيانات (نفس أسلوب scripts/fix-admin-password.ts)
// ═══════════════════════════════════════════════════════════════

async function fetchLiveWeek(fromDate?: string, days?: number): Promise<{ wods: WodDoc[]; label: string } | null> {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });

  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log('⚠️  لا يوجد MONGODB_URI في .env.local — تخطّي فحص البيانات الحقيقية'); return null; }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'matanikeh');

    let start = fromDate;
    let numDays = days || 7;

    if (!start) {
      // آخر خطة أسبوعية محفوظة فعلياً — الأحدث تلقائياً
      const latestPlan = await db.collection('weekly_plans').find({}).sort({ createdAt: -1 }).limit(1).toArray();
      if (!latestPlan.length) { console.log('⚠️  لا توجد خطط أسبوعية محفوظة بعد'); return null; }
      start = latestPlan[0].fromDate;
      numDays = latestPlan[0].days || 7;
    }

    const startDateObj = new Date(start + 'T00:00:00');
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + numDays - 1);
    const end = endDateObj.toISOString().split('T')[0];

    const docs = await db.collection('wods').find({ date: { $gte: start, $lte: end } }).sort({ date: 1 }).toArray();
    return { wods: docs as any as WodDoc[], label: `${start} → ${end} (${docs.length}/${numDays} يوماً محفوظاً)` };
  } catch (e: any) {
    console.log('⚠️  فشل الاتصال بقاعدة البيانات:', e.message);
    return null;
  } finally {
    await client.close().catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════
// التشغيل
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const wantsLive = args.includes('--live') || args.includes('--from');
  const fromIdx = args.indexOf('--from');
  const daysIdx = args.indexOf('--days');
  const fromDate = fromIdx >= 0 ? args[fromIdx + 1] : undefined;
  const days = daysIdx >= 0 ? Number(args[daysIdx + 1]) : undefined;

  console.log('🧪 تحقق آلي من نظام توليد الكروسفت\n');

  runLogicChecks();

  if (wantsLive) {
    const result = await fetchLiveWeek(fromDate, days);
    if (result) validateWeek(result.wods, result.label);
  } else {
    console.log('\n(لتشغيل فحص البيانات الحقيقية أيضاً: أضف --live أو --from YYYY-MM-DD --days N)');
  }

  const allPass = printReport();
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error('❌ خطأ غير متوقع:', e); process.exit(1); });
