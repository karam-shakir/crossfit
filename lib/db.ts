import { getDb } from './mongodb';
import { unstable_cache } from 'next/cache';

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
}

export interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
}

export interface Wod {
  id: string;
  date: string;
  title: string;
  type: string;
  duration?: number;
  rounds?: number;
  warmup: WodExercise[];
  strength: WodExercise[];
  metcon: WodExercise[];
  cooldown: WodExercise[];
  notes?: string;
  aiTheme?: string;
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

// ===================== EXERCISES =====================

// Exercises are static — cached for 1 hour (they rarely change)
export const getExercises = unstable_cache(
  async (): Promise<Exercise[]> => {
    const db = await getDb();
    const docs = await db.collection('exercises').find({}).toArray();
    return stripAll<Exercise>(docs);
  },
  ['exercises'],
  { revalidate: 3600 }
);

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const db = await getDb();
  const doc = await db.collection('exercises').findOne({ id });
  return doc ? strip_id<Exercise>(doc) : undefined;
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
  const today = new Date().toISOString().split('T')[0];
  return getWodByDate(today);
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

export async function getMemberCalisthenicsSessions(memberId: string): Promise<any[]> {
  const db = await getDb();
  const docs = await db.collection('calisthenics_sessions')
    .find({ memberId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return stripAll(docs);
}

export async function deleteCalisthenicsSession(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('calisthenics_sessions').deleteOne({ id });
}
