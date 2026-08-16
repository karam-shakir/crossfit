/**
 * يُدرج تمرين أكسسوار واحد طلبه المدرب صراحة: Band Lying Leg Curl (Prone Banded Leg Curl) —
 * أُضيف إلى lib/crossfitProgramming.ts ضمن نمط الرفعة (Hinge) بجانب Nordic Curl.
 *
 * تشغيل: npx tsx scripts/seed-band-lying-leg-curl.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const EXERCISE = {
  id: 'band-lying-leg-curl',
  nameAr: 'ثني الرجل الأرضي بالشريط',
  nameEn: 'Band Lying Leg Curl',
  category: 'وود',
  muscles: 'أوتار الركبة (Hamstrings)',
  youtube: 'https://www.youtube.com/watch?v=3T2lRvxwMJw',
};

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  const doc = { ...EXERCISE, gif: '' };
  const res = await db.collection('exercises').updateOne(
    { id: EXERCISE.id },
    { $set: doc },
    { upsert: true }
  );
  console.log(res.upsertedCount > 0 ? '✅ أُدرج تمرين جديد' : '✅ تم تحديث تمرين موجود');
  const total = await db.collection('exercises').countDocuments();
  console.log(`إجمالي التمارين في المجموعة الآن: ${total}`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
