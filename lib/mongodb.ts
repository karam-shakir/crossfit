import { MongoClient, Db } from 'mongodb';

const dbName = process.env.MONGODB_DB || 'matanikeh';

// Cache المتصل في global لإعادة الاستخدام عبر كل الطلبات
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
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
  return client.db(dbName);
}

export default { getDb };
