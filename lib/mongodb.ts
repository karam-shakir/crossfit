import { MongoClient, Db } from 'mongodb';

const dbName = process.env.MONGODB_DB || 'matanikeh';

// Cache المتصل في global لإعادة الاستخدام عبر كل الطلبات
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _indexesEnsured: Promise<void> | undefined;
}

/**
 * ينشئ الفهارس (indexes) المطلوبة مرة واحدة فقط لكل نسخة خادم.
 * بدون فهارس، كل استعلام بحسب memberId/date/username هو full collection scan —
 * سريع على جدول صغير لكن يتباطأ تدريجياً كلما تراكمت بيانات النادي عبر الأشهر.
 * createIndex آمن ومتكرر (idempotent) — لا يضر استدعاؤه أكثر من مرة.
 */
async function ensureIndexes(db: Db): Promise<void> {
  const byMemberDate = (col: string) =>
    db.collection(col).createIndex({ memberId: 1, date: -1 }).catch(() => {});

  await Promise.all([
    // تسجيل الدخول ولوحة الأعضاء — أهم مسار حرج للسرعة
    db.collection('members').createIndex({ username: 1 }, { unique: true }).catch(() => {}),
    db.collection('members').createIndex({ id: 1 }, { unique: true }).catch(() => {}),

    // WOD اليومي/الأسبوعي — البحث بالتاريخ وتقويم الشهر
    db.collection('wods').createIndex({ date: 1 }, { unique: true }).catch(() => {}),

    // بروفايلات كل رياضة — بحث بمعرّف العضو
    db.collection('gym_profiles').createIndex({ memberId: 1 }, { unique: true }).catch(() => {}),
    db.collection('running_profiles').createIndex({ memberId: 1 }, { unique: true }).catch(() => {}),
    db.collection('calisthenics_profiles').createIndex({ memberId: 1 }, { unique: true }).catch(() => {}),

    // برامج/جلسات كل رياضة — memberId + date معاً في كل استعلام تقريباً
    byMemberDate('gym_sessions'),
    byMemberDate('running_sessions'),
    byMemberDate('calisthenics_programs'),
    byMemberDate('hyrox_sessions'),
    byMemberDate('kettlebell_sessions'),
    byMemberDate('calisthenics_sessions'),
    byMemberDate('measurements'),
    byMemberDate('prs'),
    byMemberDate('attendance'),
    db.collection('gym_week_meta').createIndex({ memberId: 1, weekStartDate: -1 }).catch(() => {}),
    db.collection('logbook').createIndex({ memberId: 1, createdAt: -1 }).catch(() => {}),

    // استعلامات "الكل مرتب بالتاريخ" في لوحة الإدارة والتقويم
    db.collection('hyrox_sessions').createIndex({ date: -1 }).catch(() => {}),
    db.collection('kettlebell_sessions').createIndex({ date: -1 }).catch(() => {}),
    db.collection('calisthenics_sessions').createIndex({ date: -1 }).catch(() => {}),
    db.collection('measurements').createIndex({ date: -1 }).catch(() => {}),
    db.collection('prs').createIndex({ date: -1 }).catch(() => {}),
    db.collection('logbook').createIndex({ createdAt: -1 }).catch(() => {}),

    db.collection('exercises').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
  ]);
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  // في كلا البيئتين: أعد استخدام الاتصال الموجود دائماً
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      // تحديد الحد الأقصى للاتصالات per serverless instance
      maxPoolSize: 5,
      minPoolSize: 1,
      // إغلاق الاتصالات الخاملة بعد 30 ثانية
      maxIdleTimeMS: 30000,
      // timeout للاتصال
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);

  if (!global._indexesEnsured) {
    global._indexesEnsured = ensureIndexes(db);
  }
  // ينتظر فقط أول استدعاء فعلياً (الوعد يكون قد اكتمل مسبقاً في كل الاستدعاءات التالية)
  await global._indexesEnsured;

  return db;
}

export default { getDb };
