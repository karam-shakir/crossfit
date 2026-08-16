/**
 * فحص ثانٍ من المدرب لقائمة تمارين الأكسسوار المحدَّثة وجد فجوتين فقط باقيتين: GHD Hip Extension
 * موجود في المكتبة لكن بلا رابط يوتيوب، وReverse Wrist Curls غائب كلياً. أُضيف الأخير إلى
 * lib/crossfitProgramming.ts، وهذا السكربت يُدرج/يُحدّث رابطَي اليوتيوب الحقيقيَين المتحقق منهما.
 *
 * تشغيل: npx tsx scripts/seed-accessory-links-round2.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const EXERCISES_TO_SEED = [
  { id: 'ghd-hip-extension',   nameAr: 'تمديد الورك على GHD', nameEn: 'GHD Hip Extension',   category: 'جمناستيك', muscles: 'السلسلة الخلفية (الأرداف والظهر)', youtube: 'https://www.youtube.com/watch?v=yCoUpLutVo8' },
  { id: 'reverse-wrist-curls', nameAr: 'مد الرسغ العكسي',     nameEn: 'Reverse Wrist Curls', category: 'وود',       muscles: 'مادّات الساعد',                    youtube: 'https://www.youtube.com/watch?v=krZ6pWGZ8xo' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of EXERCISES_TO_SEED) {
    const doc = { ...ex, gif: '' };
    const res = await db.collection('exercises').updateOne(
      { id: ex.id },
      { $set: doc },
      { upsert: true }
    );
    if (res.upsertedCount > 0) inserted++; else updated++;
  }

  console.log(`✅ تم: ${inserted} تمرين جديد أُدرج، ${updated} كان موجوداً وحُدِّث برابط يوتيوب`);
  const total = await db.collection('exercises').countDocuments();
  console.log(`إجمالي التمارين في المجموعة الآن: ${total}`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
