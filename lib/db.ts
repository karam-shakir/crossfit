import { getDb } from './mongodb';
import { unstable_cache, revalidateTag } from 'next/cache';
import type { MovementPattern, PartnerFormat, StimulusType } from './crossfitProgramming';

// ===================== INTERFACES =====================

export interface Member {
  id: string;
  username: string;
  password: string;
  nameAr: string;
  role: 'admin' | 'member';
  joinDate: string;
  avatar: string;
  canViewWods?: boolean;
  canGenerateWod?: boolean;
}

export interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  gif: string;
  youtube: string;
  muscles: string;
  // حقول تمرين مضاف عبر لوحة التحكم (لا من مكتبة الكود الأساسية EXERCISES في crossfitProgramming.ts)
  isCustom?: boolean;
  sections?: string[];      // warmup/strength/metcon/accessory/cooldown — أي قوائم تعديل يدوي يظهر فيها
  aiEligible?: boolean;     // true = الذكاء الاصطناعي قد يختاره أيضاً (يتطلب focusClass وmuscleGroup مضبوطة أولاً)
  focusClass?: 'concentrated' | 'variable' | 'diffuse';
  muscleGroup?: string;
  metconStimulusCategory?: 'push' | 'pull' | 'hip-explode' | 'mono';
  createdBy?: string;
  createdAt?: string;
}

export interface WodLevelSpec {
  weight?: string;
  reps?: string;
  cue?: string;
}

export interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
  executionNote?: string; // قيد تنفيذ تقني قصير: "Touch & Go"، "Start @ RPE 6 build to RPE 8/9"، "Single-Arm" ...
  levels?: Partial<Record<'beginner'|'intermediate'|'advanced'|'elite', WodLevelSpec>>;
  exercise?: Exercise; // للعرض فقط — يُضاف عند القراءة (enrichWodSections)، لا يُحفَظ في قاعدة البيانات
}

// بلوك واحد داخل أي قسم (إحماء/قوة/ميتكون/أكسسوار/تهدئة) — يحمل صيغته الخاصة
// (مثال: "AMRAP x 6 MIN"، "EVERY 2:30 (4 SETS)"، "FOR TIME") ومعيار تسجيل اختياري،
// بدل أن يكون القسم قائمة مسطّحة من التمارين بلا تجميع أو صيغة. راجع lib/wodBlocks.ts
// للتعامل مع البيانات القديمة المحفوظة بالشكل المسطّح (قبل هذا التحويل).
export interface WodBlock {
  format: string;        // "AMRAP x 6 MIN" | "EVERY 2:30 (4 SETS)" | "1-2 SETS" | "FOR TIME" | "5 SETS" | '' (بلا صيغة خاصة)
  scoreType?: string;     // "Heaviest Weight" | "Weight" | "Time" | "Rounds + Reps" ...
  movements: WodExercise[];
}

export interface Wod {
  id: string;
  date: string;
  title: string;
  titleEn?: string;
  type: string;
  duration?: number;
  rounds?: number;
  warmup: WodBlock[];
  strength: WodBlock[];
  metcon: WodBlock[];
  accessory?: WodBlock[];
  cooldown: WodBlock[];
  notes?: string;
  aiTheme?: string;
  pattern?: MovementPattern;
  stimulusType?: StimulusType;
  targetTimes?: Partial<Record<'beginner'|'intermediate'|'advanced'|'elite', string>>;
  isCalisthenics?: boolean;
  isPartnerWod?: boolean;
  partnerFormat?: PartnerFormat;
  createdBy: string;
}

export interface LogEntry {
  id: string;
  memberId: string;
  date: string;
  wodId?: string;
  wodTitle: string;
  result: string;
  weight?: string;
  rounds?: string;
  time?: string;
  reps?: string;
  notes?: string;
  rxd: boolean;
  createdAt: string;
}

export interface PR {
  id: string;
  memberId: string;
  exerciseId: string;
  value: number;
  unit: 'kg' | 'min' | 'sec' | 'reps';
  date: string;
  notes?: string;
}

export interface Measurement {
  id: string;
  memberId: string;
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  arm?: number;
  thigh?: number;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  date: string;
}

export interface BenchmarkResult {
  id: string;
  memberId: string;
  benchmarkId: string;
  date: string;
  result: string;
  rxd: boolean;
  notes?: string;
}

// ===================== HELPERS =====================

function strip_id<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

function stripAll<T>(docs: any[]): T[] {
  return docs.map(strip_id<T>);
}

// ===================== MEMBERS =====================

export async function getMembers(): Promise<Member[]> {
  const db = await getDb();
  const docs = await db.collection('members').find({}).toArray();
  return stripAll<Member>(docs);
}

export async function saveMembers(members: Member[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('members');
  await col.deleteMany({});
  if (members.length > 0) await col.insertMany(members as any[]);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const db = await getDb();
  const doc = await db.collection('members').findOne({ id });
  return doc ? strip_id<Member>(doc) : undefined;
}

export async function getMemberByUsername(username: string): Promise<Member | undefined> {
  const db = await getDb();
  const doc = await db.collection('members').findOne({ username });
  return doc ? strip_id<Member>(doc) : undefined;
}

export async function updateMemberFields(id: string, fields: Record<string, any>): Promise<void> {
  const db = await getDb();
  await db.collection('members').updateOne({ id }, { $set: fields });
}

// ===================== EXERCISES =====================

// Exercises are static — cached for 1 hour (they rarely change). المفتاح تغيّر إلى exercises-v2
// لإبطال كاش أي نشر سابق فوراً — سكربتات seed-*.ts تكتب مباشرة على MongoDB بمعزل تام عن التطبيق،
// فكاش Vercel المستمر بين عمليات النشر (unstable_cache) لا يعرف بالكتابة ويستمر بإرجاع القائمة القديمة
// حتى انتهاء الـ TTL (حتى ساعة كاملة) — رُصد هذا فعلياً بعد زرع إطالات التهدئة الـ٢٤: لوحة التحكم
// استمرت تعرض القائمة القديمة رغم أن البيانات في قاعدة البيانات كانت صحيحة فعلاً
export const getExercises = unstable_cache(
  async (): Promise<Exercise[]> => {
    const db = await getDb();
    const docs = await db.collection('exercises').find({}).toArray();
    return stripAll<Exercise>(docs);
  },
  ['exercises-v2'],
  { revalidate: 3600, tags: ['exercises-v2'] }
);

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const db = await getDb();
  const doc = await db.collection('exercises').findOne({ id });
  return doc ? strip_id<Exercise>(doc) : undefined;
}

// تمارين مضافة عبر لوحة التحكم (isCustom: true) — إضافة/تعديل/حذف تُبطل كاش getExercises فوراً
// (بعكس سكربتات seed-*.ts القديمة التي كانت تكتب على MongoDB بمعزل تام عن كاش unstable_cache
// وتترك لوحة التحكم تعرض بيانات قديمة حتى انتهاء الـ TTL — نفس المشكلة الموثّقة أعلاه بالضبط)
export async function createExercise(ex: Exercise): Promise<void> {
  const db = await getDb();
  await db.collection('exercises').insertOne(ex as any);
  revalidateTag('exercises-v2');
}

export async function updateExercise(id: string, fields: Partial<Exercise>): Promise<void> {
  const db = await getDb();
  await db.collection('exercises').updateOne({ id }, { $set: fields });
  revalidateTag('exercises-v2');
}

// يمنع حذف تمارين المكتبة الأساسية بالخطأ — تلك ليست في هذه المجموعة أصلاً بحقل isCustom، فالفلتر أمان إضافي فقط
export async function deleteCustomExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('exercises').deleteOne({ id, isCustom: true });
  revalidateTag('exercises-v2');
}

// ===================== GYM CATALOG =====================
// كتالوج أجهزة/تمارين الجيم — كان قبل هذا نصاً ثابتاً داخل app/api/gym/generate-week/route.ts
// (قائمة "أجهزة Technogym") لا يمكن تعديله إلا بتغيير كود ونشر جديد. الآن قاعدة بيانات قابلة للتعديل
// من لوحة التحكم مباشرة، بلا أي افتراض علامة تجارية — أي جهاز/تمرين معدّات صالة عامة قياسية.
// بعكس مكتبة تمارين الكروسفت لا يوجد هنا نظام "محظورات دمج" يحتاج تصنيفاً دقيقاً قبل الاستخدام،
// فكل تمرين مُضاف يدخل قائمة توليد الذكاء الاصطناعي فوراً بلا مرحلة "ترقية" منفصلة
export interface GymCatalogExercise {
  id: string;          // كان يُسمّى machineId في الأماكن الأخرى من الكود (GymExercise/GymExerciseLog) — نفس المعنى
  nameEn: string;
  nameAr?: string;
  muscleGroup: string; // وصف عربي حر، مثال: "الرباعية والمؤخرة"
  category: string;    // مفتاح تجميع للعرض في البرومبت، مثال: legs/free-weight/chest/back/shoulders/arms/core/cardio
  createdBy?: string;
  createdAt?: string;
}

export const getGymCatalog = unstable_cache(
  async (): Promise<GymCatalogExercise[]> => {
    const db = await getDb();
    const docs = await db.collection('gymCatalog').find({}).toArray();
    return stripAll<GymCatalogExercise>(docs);
  },
  ['gym-catalog-v1'],
  { revalidate: 3600, tags: ['gym-catalog-v1'] }
);

export async function createGymCatalogExercise(ex: GymCatalogExercise): Promise<void> {
  const db = await getDb();
  await db.collection('gymCatalog').insertOne(ex as any);
  revalidateTag('gym-catalog-v1');
}

export async function updateGymCatalogExercise(id: string, fields: Partial<GymCatalogExercise>): Promise<void> {
  const db = await getDb();
  await db.collection('gymCatalog').updateOne({ id }, { $set: fields });
  revalidateTag('gym-catalog-v1');
}

export async function deleteGymCatalogExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('gymCatalog').deleteOne({ id });
  revalidateTag('gym-catalog-v1');
}

// ===================== WODS =====================

export async function getWods(limit?: number): Promise<Wod[]> {
  const db = await getDb();
  let query = db.collection('wods').find({}).sort({ date: -1 });
  if (limit) query = query.limit(limit);
  const docs = await query.toArray();
  return stripAll<Wod>(docs);
}

export async function getRecentWods(limit = 60): Promise<Wod[]> {
  return getWods(limit);
}

export async function saveWods(wods: Wod[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('wods');
  await col.deleteMany({});
  if (wods.length > 0) await col.insertMany(wods as any[]);
}

export async function getWodByDate(date: string): Promise<Wod | undefined> {
  const db = await getDb();
  const doc = await db.collection('wods').findOne({ date });
  return doc ? strip_id<Wod>(doc) : undefined;
}

/** كل تمارين شهر معيّن (بصيغة "YYYY-MM") — لعرض تقويم WOD الخفيف بدون تحميل التفاصيل الكاملة */
export async function getWodsByMonth(monthPrefix: string): Promise<Wod[]> {
  const db = await getDb();
  const [y, m] = monthPrefix.split('-').map(Number);
  const start = `${monthPrefix}-01`;
  const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const docs = await db.collection('wods').find({ date: { $gte: start, $lt: end } }).sort({ date: 1 }).toArray();
  return stripAll<Wod>(docs);
}

export async function upsertWod(wod: Wod): Promise<Wod> {
  const db = await getDb();
  await db.collection('wods').replaceOne({ date: wod.date }, wod, { upsert: true });
  return wod;
}

export async function deleteWodById(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('wods').deleteOne({ id });
}

export async function getTodayWod(): Promise<Wod | undefined> {
  const { todaySA } = await import('./timezone');
  return getWodByDate(todaySA());
}

// ===================== LOGBOOK =====================

export async function getLogEntries(limit?: number): Promise<LogEntry[]> {
  const db = await getDb();
  let q = db.collection('logbook').find({}).sort({ createdAt: -1 });
  if (limit) q = q.limit(limit);
  const docs = await q.toArray();
  return stripAll<LogEntry>(docs);
}

export async function getMemberLogEntries(memberId: string): Promise<LogEntry[]> {
  const db = await getDb();
  const docs = await db.collection('logbook').find({ memberId }).sort({ createdAt: -1 }).toArray();
  return stripAll<LogEntry>(docs);
}

export async function saveLogEntries(entries: LogEntry[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('logbook');
  await col.deleteMany({});
  if (entries.length > 0) await col.insertMany(entries as any[]);
}

export async function addLogEntry(entry: LogEntry): Promise<LogEntry> {
  const db = await getDb();
  await db.collection('logbook').insertOne(entry as any);
  return entry;
}

export async function deleteLogEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('logbook').deleteOne({ id });
}

// ===================== PRs =====================

export async function getPRs(limit?: number): Promise<PR[]> {
  const db = await getDb();
  let q = db.collection('prs').find({}).sort({ date: -1 });
  if (limit) q = q.limit(limit);
  const docs = await q.toArray();
  return stripAll<PR>(docs);
}

export async function getMemberPRs(memberId: string): Promise<PR[]> {
  const db = await getDb();
  const docs = await db.collection('prs').find({ memberId }).sort({ date: -1 }).toArray();
  return stripAll<PR>(docs);
}

export async function savePRs(records: PR[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('prs');
  await col.deleteMany({});
  if (records.length > 0) await col.insertMany(records as any[]);
}

export async function addPR(pr: PR): Promise<PR> {
  const db = await getDb();
  await db.collection('prs').insertOne(pr as any);
  return pr;
}

export async function deletePR(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('prs').deleteOne({ id });
}

// ===================== MEASUREMENTS =====================

export async function getMeasurements(): Promise<Measurement[]> {
  const db = await getDb();
  const docs = await db.collection('measurements').find({}).sort({ date: -1 }).toArray();
  return stripAll<Measurement>(docs);
}

export async function getMemberMeasurements(memberId: string): Promise<Measurement[]> {
  const db = await getDb();
  const docs = await db.collection('measurements').find({ memberId }).sort({ date: -1 }).toArray();
  return stripAll<Measurement>(docs);
}

export async function saveMeasurements(records: Measurement[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('measurements');
  await col.deleteMany({});
  if (records.length > 0) await col.insertMany(records as any[]);
}

export async function addMeasurement(m: Measurement): Promise<Measurement> {
  const db = await getDb();
  await db.collection('measurements').insertOne(m as any);
  return m;
}

export async function deleteMeasurement(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('measurements').deleteOne({ id });
}

// ===================== ATTENDANCE =====================

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const db = await getDb();
  const docs = await db.collection('attendance').find({}).toArray();
  return stripAll<AttendanceRecord>(docs);
}

export async function getMemberAttendance(memberId: string): Promise<AttendanceRecord[]> {
  const db = await getDb();
  const docs = await db.collection('attendance').find({ memberId }).toArray();
  return stripAll<AttendanceRecord>(docs);
}

export async function saveAttendance(records: AttendanceRecord[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('attendance');
  await col.deleteMany({});
  if (records.length > 0) await col.insertMany(records as any[]);
}

export async function addAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
  const db = await getDb();
  await db.collection('attendance').insertOne(record as any);
  return record;
}

// ===================== BENCHMARKS =====================

export async function getBenchmarks(): Promise<{ benchmarks: any[]; results: BenchmarkResult[] }> {
  const db = await getDb();
  const benchmarks = stripAll<any>(await db.collection('benchmarks').find({}).toArray());
  const results = stripAll<BenchmarkResult>(await db.collection('benchmark_results').find({}).toArray());
  return { benchmarks, results };
}

export async function saveBenchmarkResults(results: BenchmarkResult[]): Promise<void> {
  const db = await getDb();
  const col = db.collection('benchmark_results');
  await col.deleteMany({});
  if (results.length > 0) await col.insertMany(results as any[]);
}

export async function addBenchmarkResult(result: BenchmarkResult): Promise<BenchmarkResult> {
  const db = await getDb();
  await db.collection('benchmark_results').insertOne(result as any);
  return result;
}

export async function deleteBenchmarkResult(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('benchmark_results').deleteOne({ id });
}

// ===================== CALISTHENICS SESSIONS =====================

export async function saveCalisthenicsSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('calisthenics_sessions').insertOne(session as any);
  return session;
}

export async function upsertCalisthenicsSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('calisthenics_sessions').replaceOne(
    { id: session.id },
    session,
    { upsert: true }
  );
  return session;
}

export async function getMemberCalisthenicsSessions(memberId: string): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_sessions')
    .find({ memberId })
    .sort({ date: -1, createdAt: -1 })
    .limit(50)
    .toArray();
  return stripAll(docs);
}

export async function getAllCalisthenicsSessions(): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_sessions')
    .find({})
    .sort({ date: -1 })
    .limit(100)
    .toArray();
  return stripAll(docs);
}

export async function deleteCalisthenicsSession(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('calisthenics_sessions').deleteOne({ id });
}

// ===================== HYROX SESSIONS =====================

export async function saveHyroxSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('hyrox_sessions').insertOne(session as any);
  return session;
}

export async function upsertHyroxSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('hyrox_sessions').replaceOne(
    { id: session.id },
    session,
    { upsert: true }
  );
  return session;
}

export async function getMemberHyroxSessions(memberId: string): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('hyrox_sessions')
    .find({ memberId })
    .sort({ date: -1, createdAt: -1 })
    .limit(50)
    .toArray();
  return stripAll(docs);
}

export async function getAllHyroxSessions(): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('hyrox_sessions')
    .find({})
    .sort({ date: -1 })
    .limit(100)
    .toArray();
  return stripAll(docs);
}

export async function deleteHyroxSession(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('hyrox_sessions').deleteOne({ id });
}

// ===================== KETTLEBELL SESSIONS =====================

export async function saveKettlebellSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('kettlebell_sessions').insertOne(session as any);
  return session;
}

export async function upsertKettlebellSession(session: any): Promise<any> {
  const db = await getDb();
  await db.collection('kettlebell_sessions').replaceOne(
    { id: session.id },
    session,
    { upsert: true }
  );
  return session;
}

export async function getMemberKettlebellSessions(memberId: string): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('kettlebell_sessions')
    .find({ memberId })
    .sort({ date: -1, createdAt: -1 })
    .limit(50)
    .toArray();
  return stripAll(docs);
}

export async function getAllKettlebellSessions(): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('kettlebell_sessions')
    .find({})
    .sort({ date: -1 })
    .limit(100)
    .toArray();
  return stripAll(docs);
}

export async function deleteKettlebellSession(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('kettlebell_sessions').deleteOne({ id });
}

// ===================== GYM PROFILES =====================

export interface GymProfile {
  id: string;
  memberId: string;
  goal: 'weight_loss' | 'muscle_gain' | 'strength' | 'general_fitness' | 'body_recomp';
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  age?: number;
  weight?: number;
  height?: number;
  daysPerWeek: 3 | 4 | 5 | 6;
  focusAreas: string[];
  limitations?: string;
  updatedAt: string;
}

export async function getGymProfile(memberId: string): Promise<GymProfile | undefined> {
  const db = await getDb();
  const doc = await db.collection('gym_profiles').findOne({ memberId });
  return doc ? strip_id<GymProfile>(doc) : undefined;
}

export async function upsertGymProfile(profile: GymProfile): Promise<GymProfile> {
  const db = await getDb();
  await db.collection('gym_profiles').replaceOne({ memberId: profile.memberId }, profile, { upsert: true });
  return profile;
}

export async function getAllGymProfiles(): Promise<GymProfile[]> {
  const db = await getDb();
  const docs = await db.collection('gym_profiles').find({}).toArray();
  return stripAll<GymProfile>(docs);
}

// ===================== GYM SESSIONS =====================

export interface GymSession {
  id: string;
  memberId: string;
  date: string;
  dayName: string;
  splitType: string;
  title: string;
  focus: string;
  isRest: boolean;
  duration?: number;
  exercises: GymExercise[];
  warmup?: string[];
  cooldown?: string[];
  notes?: string;
  coachNote?: string;
  createdAt: string;
}

export interface GymExercise {
  machineId: string;
  nameAr: string;
  nameEn: string;
  sets: number;
  levels: {
    beginner:     GymExerciseLevel;
    intermediate: GymExerciseLevel;
    advanced:     GymExerciseLevel;
    elite:        GymExerciseLevel;
  };
  notes?: string;
  muscleGroup: string;
}

export interface GymExerciseLevel {
  weight: string;
  reps: string;
  rest: string;
  cue: string;
}

export async function getGymSessions(memberId: string): Promise<GymSession[]> {
  const db = await getDb();
  const docs = await db.collection('gym_sessions')
    .find({ memberId })
    .sort({ date: -1 })
    .limit(60)
    .toArray();
  return stripAll<GymSession>(docs);
}

export async function getGymSessionByDate(memberId: string, date: string): Promise<GymSession | undefined> {
  const db = await getDb();
  const doc = await db.collection('gym_sessions').findOne({ memberId, date });
  return doc ? strip_id<GymSession>(doc) : undefined;
}

export async function upsertGymSession(session: GymSession): Promise<GymSession> {
  const db = await getDb();
  await db.collection('gym_sessions').replaceOne(
    { memberId: session.memberId, date: session.date },
    session,
    { upsert: true }
  );
  return session;
}

export async function deleteGymSessionsByMember(memberId: string, fromDate: string, toDate: string): Promise<void> {
  const db = await getDb();
  await db.collection('gym_sessions').deleteMany({ memberId, date: { $gte: fromDate, $lte: toDate } });
}

// ===================== GYM WEEK META (استمرارية البرمجة أسبوعاً بعد أسبوع) =====================

export interface GymWeekMeta {
  id: string;
  memberId: string;
  weekStartDate: string;
  weekSummary: string;
  progressionNote: string;
  createdAt: string;
  // دورة تدريج شخصية لكل عضو (اختيارية — سجلات قديمة قبل هذه الميزة لن تملكها)
  cyclePhase?: 'foundation' | 'build' | 'peak' | 'deload';
  cycleIndex?: number;
}

export async function upsertGymWeekMeta(meta: GymWeekMeta): Promise<GymWeekMeta> {
  const db = await getDb();
  await db.collection('gym_week_meta').replaceOne(
    { memberId: meta.memberId, weekStartDate: meta.weekStartDate },
    meta,
    { upsert: true }
  );
  return meta;
}

/** أحدث حالة مُخزَّنة لهذا العضو — إن مُرِّر beforeDate يُقيَّد البحث بما قبله (لبناء برومت التوليد)، وإلا يُرجَع أحدث أسبوع مخزّن مطلقاً (لعرض حالة الدورة قبل التوليد) */
export async function getLatestGymWeekMeta(memberId: string, beforeDate?: string): Promise<GymWeekMeta | undefined> {
  const db = await getDb();
  const filter = beforeDate ? { memberId, weekStartDate: { $lt: beforeDate } } : { memberId };
  const docs = await db.collection('gym_week_meta')
    .find(filter)
    .sort({ weekStartDate: -1 })
    .limit(1)
    .toArray();
  return docs[0] ? strip_id<GymWeekMeta>(docs[0]) : undefined;
}

// ===================== WOD CYCLE META (دورة تدريج الكروسفت الأسبوعية) =====================
// برنامج الكروسفت للنادي بالكامل (لا لكل عضو) — يمرّ بدورة 4 أسابيع
// (تأسيس→بناء→ذروة→تفريغ) تتقدم تلقائياً بين الأسابيع بدل تكرار نفس الوزن دائماً

export interface WodCycleMeta {
  id: string;
  weekStartDate: string;
  cyclePhase: 'foundation' | 'build' | 'peak' | 'deload';
  cycleIndex: number; // 0=تأسيس 1=بناء 2=ذروة 3=تفريغ
  weeklyIntensityLabel: string; // خفيف/متوسط/ثقيل — من تحليل الأسبوع الماضي فعلياً
  weekSummary: string;
  progressionNote: string;
  wasAutoDeload: boolean;
  createdAt: string;
}

export async function upsertWodCycleMeta(meta: WodCycleMeta): Promise<WodCycleMeta> {
  const db = await getDb();
  await db.collection('wod_cycle_meta').replaceOne(
    { weekStartDate: meta.weekStartDate },
    meta,
    { upsert: true }
  );
  return meta;
}

/** أحدث حالة دورة مخزّنة — إن مُرِّر beforeDate يُقيَّد البحث بما قبله، وإلا يُرجَع أحدث أسبوع مُخزَّن مطلقاً */
export async function getLatestWodCycleMeta(beforeDate?: string): Promise<WodCycleMeta | undefined> {
  const db = await getDb();
  const filter = beforeDate ? { weekStartDate: { $lt: beforeDate } } : {};
  const docs = await db.collection('wod_cycle_meta')
    .find(filter)
    .sort({ weekStartDate: -1 })
    .limit(1)
    .toArray();
  return docs[0] ? strip_id<WodCycleMeta>(docs[0]) : undefined;
}

// ===================== GYM EXERCISE LOGS (توثيق الإنجاز الفعلي) =====================
// تسجيل اختياري من العضو لما رفعه فعلياً — يغذّي التصاعد الأسبوعي بأرقام حقيقية
// بدل الاعتماد فقط على جدول الأوزان العام للمستوى.

export interface GymExerciseLog {
  id: string;
  memberId: string;
  date: string;                 // نفس تاريخ الجلسة
  machineId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  suggestedWeight: string;
  suggestedReps: string;
  actualWeight: string;
  actualReps: string;
  comparison: 'same' | 'less' | 'more';
  createdAt: string;
}

export async function upsertGymExerciseLog(log: GymExerciseLog): Promise<GymExerciseLog> {
  const db = await getDb();
  await db.collection('gym_exercise_logs').replaceOne(
    { memberId: log.memberId, date: log.date, machineId: log.machineId },
    log,
    { upsert: true }
  );
  return log;
}

export async function getGymExerciseLogs(memberId: string, limit = 300): Promise<GymExerciseLog[]> {
  const db = await getDb();
  const docs = await db.collection('gym_exercise_logs')
    .find({ memberId })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
  return stripAll<GymExerciseLog>(docs);
}

export async function deleteGymExerciseLog(memberId: string, date: string, machineId: string): Promise<void> {
  const db = await getDb();
  await db.collection('gym_exercise_logs').deleteOne({ memberId, date, machineId });
}

// ===================== RUNNING PROFILES =====================

export interface RunningProfile {
  id: string;
  memberId: string;
  goal: 'general_endurance' | 'fat_burn' | 'race_5k' | 'race_10k' | 'half_marathon' | 'marathon' | 'speed' | 'senior_walk_run';
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  daysPerWeek: 3 | 4 | 5 | 6;
  currentWeeklyKm?: number;      // كم يجري حالياً في الأسبوع
  best5kTime?: string;           // أفضل زمن 5 كم (مثال: "28:30")
  best10kTime?: string;          // أفضل زمن 10 كم
  surface: 'treadmill' | 'outdoor' | 'track' | 'mixed';
  preferredTime?: 'morning' | 'evening' | 'any';
  targetRaceDate?: string;       // تاريخ سباق مستهدف إن وجد
  limitations?: string;
  updatedAt: string;
}

export async function getRunningProfile(memberId: string): Promise<RunningProfile | undefined> {
  const db = await getDb();
  const doc = await db.collection('running_profiles').findOne({ memberId });
  return doc ? strip_id<RunningProfile>(doc) : undefined;
}

export async function upsertRunningProfile(profile: RunningProfile): Promise<RunningProfile> {
  const db = await getDb();
  await db.collection('running_profiles').replaceOne({ memberId: profile.memberId }, profile, { upsert: true });
  return profile;
}

export async function getAllRunningProfiles(): Promise<RunningProfile[]> {
  const db = await getDb();
  const docs = await db.collection('running_profiles').find({}).toArray();
  return stripAll<RunningProfile>(docs);
}

// ===================== RUNNING SESSIONS =====================

export interface RunningSegmentLevel {
  pace: string;        // مثال: "6:30/كم" أو "70% جهد"
  target: string;      // المسافة أو الزمن: "5 كم" أو "30 دقيقة" أو "6 × 400م"
  rest: string;        // الراحة بين التكرارات إن وجدت
  cue: string;         // تعليمة تقنية
}

export interface RunningSegment {
  name: string;                  // اسم الجزء: "الجري الرئيسي" / "تكرارات 400م"
  type: string;                  // easy | tempo | interval | hills | strides | drills
  description: string;
  levels: {
    beginner:     RunningSegmentLevel;
    intermediate: RunningSegmentLevel;
    advanced:     RunningSegmentLevel;
    elite:        RunningSegmentLevel;
  };
}

export interface RunningSession {
  id: string;
  memberId: string;
  date: string;
  dayName: string;
  runType: string;               // Easy | Tempo | Intervals | Long | Recovery | Hills | Fartlek | Cross | Rest
  title: string;
  focus: string;
  intensity: string;             // Easy | Moderate | Hard | Rest
  isRest: boolean;
  duration?: number;             // بالدقائق
  totalDistanceKm?: number;      // إجمالي مسافة الجلسة التقريبية
  warmup?: string[];
  segments: RunningSegment[];
  cooldown?: string[];
  notes?: string;
  coachNote?: string;
  createdAt: string;
}

export async function getRunningSessions(memberId: string): Promise<RunningSession[]> {
  const db = await getDb();
  const docs = await db.collection('running_sessions')
    .find({ memberId })
    .sort({ date: -1 })
    .limit(60)
    .toArray();
  return stripAll<RunningSession>(docs);
}

export async function upsertRunningSession(session: RunningSession): Promise<RunningSession> {
  const db = await getDb();
  await db.collection('running_sessions').replaceOne(
    { memberId: session.memberId, date: session.date },
    session,
    { upsert: true }
  );
  return session;
}

export async function deleteRunningSessionsByMember(memberId: string, fromDate: string, toDate: string): Promise<void> {
  const db = await getDb();
  await db.collection('running_sessions').deleteMany({ memberId, date: { $gte: fromDate, $lte: toDate } });
}

// ===================== RUNNING WEEK META (استمرارية البرمجة أسبوعاً بعد أسبوع) =====================
// نفس فكرة GymWeekMeta: يقرأ توصية الأسبوع الماضي، ويتتبع مرحلة دورة التدريج (سباقات)
// أو مرحلة تقدّم المشي/الجري (كبار السن) لكل عداء تحديداً

export interface RunningWeekMeta {
  id: string;
  memberId: string;
  weekStartDate: string;
  weekSummary: string;
  progressionNote: string;
  createdAt: string;
  // دورة تدريج عادية (سباقات) — لا تُستخدم لبرنامج كبار السن
  cyclePhase?: 'foundation' | 'build' | 'peak' | 'deload';
  cycleIndex?: number;
  // مرحلة تقدّم المشي/الجري لبرنامج كبار السن تحديداً (Couch-to-5K الگ) — لا علاقة لها بدورة السباقات
  runWalkStage?: number;
  weeksAtStage?: number; // كم أسبوعاً مضى على هذه المرحلة — يُستخدم لتحديد موعد الترقية (كل أسبوعين)
}

export async function upsertRunningWeekMeta(meta: RunningWeekMeta): Promise<RunningWeekMeta> {
  const db = await getDb();
  await db.collection('running_week_meta').replaceOne(
    { memberId: meta.memberId, weekStartDate: meta.weekStartDate },
    meta,
    { upsert: true }
  );
  return meta;
}

/** أحدث حالة مُخزَّنة لهذا العداء — إن مُرِّر beforeDate يُقيَّد البحث بما قبله، وإلا يُرجَع أحدث أسبوع مطلقاً */
export async function getLatestRunningWeekMeta(memberId: string, beforeDate?: string): Promise<RunningWeekMeta | undefined> {
  const db = await getDb();
  const filter = beforeDate ? { memberId, weekStartDate: { $lt: beforeDate } } : { memberId };
  const docs = await db.collection('running_week_meta')
    .find(filter)
    .sort({ weekStartDate: -1 })
    .limit(1)
    .toArray();
  return docs[0] ? strip_id<RunningWeekMeta>(docs[0]) : undefined;
}

// ===================== CALISTHENICS PROFILES =====================

export interface CalisthenicsProfile {
  id: string;
  memberId: string;
  goal: 'strength' | 'skills' | 'muscle_gain' | 'endurance' | 'fat_burn';
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  daysPerWeek: 3 | 4 | 5 | 6;
  // القدرات الحالية — أساس معايرة البرنامج
  maxPushups?: number;
  maxPullups?: number;
  maxDips?: number;
  plankSeconds?: number;
  // المهارات المستهدفة
  skillGoals: string[];      // Handstand, Muscle-up, Front Lever...
  // المعدات المتاحة
  equipment: string[];       // بار عقلة، متوازي، حلقات، أربطة مقاومة، جدار
  limitations?: string;
  updatedAt: string;
}

export async function getCalisthenicsProfile(memberId: string): Promise<CalisthenicsProfile | undefined> {
  const db = await getDb();
  const doc = await db.collection('calisthenics_profiles').findOne({ memberId });
  return doc ? strip_id<CalisthenicsProfile>(doc) : undefined;
}

export async function upsertCalisthenicsProfile(profile: CalisthenicsProfile): Promise<CalisthenicsProfile> {
  const db = await getDb();
  await db.collection('calisthenics_profiles').replaceOne({ memberId: profile.memberId }, profile, { upsert: true });
  return profile;
}

export async function getAllCalisthenicsProfiles(): Promise<CalisthenicsProfile[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_profiles').find({}).toArray();
  return stripAll<CalisthenicsProfile>(docs);
}

// ===================== CALISTHENICS PROGRAM (per-member weekly) =====================

export interface CaliExerciseLevel {
  variation: string;   // التدرج المناسب للمستوى: "ضغط على الحائط" → "ضغط أرشر"
  reps: string;        // "3 × 8-12" أو "4 × 20 ث ثبات"
  rest: string;
  cue: string;
}

export interface CaliExercise {
  name: string;                // الاسم بالعربية
  nameEn: string;
  exerciseKey?: string;        // مفتاح ثابت من كتالوج معروف (مثال: 'push-up') — لمطابقة السجل عبر الأسابيع رغم اختلاف صياغة الاسم
  targetMuscles: string;
  type: string;                // push | pull | legs | core | skill | conditioning
  sets: number;
  notes?: string;
  levels: {
    beginner:     CaliExerciseLevel;
    intermediate: CaliExerciseLevel;
    advanced:     CaliExerciseLevel;
    elite:        CaliExerciseLevel;
  };
}

export interface CaliProgramSession {
  id: string;
  memberId: string;
  date: string;
  dayName: string;
  sessionType: string;         // Push | Pull | Legs | Skills | Core | FullBody | Endurance | Rest
  title: string;
  focus: string;
  intensity: string;           // Heavy | Moderate | Light | Rest
  isRest: boolean;
  duration?: number;
  warmup?: string[];
  skillWork?: CaliExercise[];  // تدريب المهارات — أول الجلسة والجهاز العصبي نشيط
  exercises: CaliExercise[];
  cooldown?: string[];
  notes?: string;
  coachNote?: string;
  createdAt: string;
}

export async function getCaliProgramSessions(memberId: string): Promise<CaliProgramSession[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_programs')
    .find({ memberId })
    .sort({ date: -1 })
    .limit(60)
    .toArray();
  return stripAll<CaliProgramSession>(docs);
}

export async function upsertCaliProgramSession(session: CaliProgramSession): Promise<CaliProgramSession> {
  const db = await getDb();
  await db.collection('calisthenics_programs').replaceOne(
    { memberId: session.memberId, date: session.date },
    session,
    { upsert: true }
  );
  return session;
}

export async function deleteCaliProgramSessionsByMember(memberId: string, fromDate: string, toDate: string): Promise<void> {
  const db = await getDb();
  await db.collection('calisthenics_programs').deleteMany({ memberId, date: { $gte: fromDate, $lte: toDate } });
}

// ===================== CALISTHENICS EXERCISE LOGS (توثيق الإنجاز الفعلي) =====================
// عملة التقدم هنا هي التدرّج (Variation) لا الوزن — العضو يسجّل أي تدرّج أدّى فعلاً
// وكم تكرار/مدة ثبات حقّق فيه، ما يغذّي البرومت بتصاعد حقيقي مبني على أدائه الفعلي.

export interface CalisthenicsExerciseLog {
  id: string;
  memberId: string;
  date: string;
  exerciseKey: string;           // من الكتالوج الثابت (أو نسخة مُطبَّعة من nameEn للجلسات القديمة)
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  movementType: string;          // push | pull | legs | core | skill | conditioning — لتحليل المستوى الفعلي لكل نمط حركة
  isSkillWork: boolean;
  suggestedVariation: string;
  suggestedReps: string;         // نص حر: تكرار أو مدة ثبات كما هو معروض
  actualVariation: string;
  actualReps: string;
  comparison: 'as_suggested' | 'easier' | 'harder';
  createdAt: string;
}

export async function upsertCalisthenicsExerciseLog(log: CalisthenicsExerciseLog): Promise<CalisthenicsExerciseLog> {
  const db = await getDb();
  await db.collection('calisthenics_exercise_logs').replaceOne(
    { memberId: log.memberId, date: log.date, exerciseKey: log.exerciseKey },
    log,
    { upsert: true }
  );
  return log;
}

export async function getCalisthenicsExerciseLogs(memberId: string, limit = 300): Promise<CalisthenicsExerciseLog[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_exercise_logs')
    .find({ memberId })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
  return stripAll<CalisthenicsExerciseLog>(docs);
}

export async function deleteCalisthenicsExerciseLog(memberId: string, date: string, exerciseKey: string): Promise<void> {
  const db = await getDb();
  await db.collection('calisthenics_exercise_logs').deleteOne({ memberId, date, exerciseKey });
}
