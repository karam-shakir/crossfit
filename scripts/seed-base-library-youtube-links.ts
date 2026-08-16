/**
 * الإصلاح الأخير لعرض روابط اليوتيوب (استخدام ex.exercise.youtube الحقيقي بدل رابط بحث عام دائماً)
 * كشف أن 37 تمريناً من المكتبة الأساسية القديمة (قبل هذه الجلسة، وقبل دفعات دليلَي الأكسسوار
 * والميتكون) لم يكن لها رابط يوتيوب حقيقي إطلاقاً — كان رابط البحث العام يُخفي هذه الفجوة تماماً.
 * الروابط هنا بُحث عنها فعلياً والتحقق من صحتها عبر واجهة يوتيوب البرمجية (oEmbed)، مع فحص يدوي
 * إضافي لعينة منها — لا معرّفات وهمية.
 *
 * تشغيل: npx tsx scripts/seed-base-library-youtube-links.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const LINKS: Record<string, string> = {
  'air-squat': 'https://youtu.be/C_VtOYc6j5c',
  'inchworm': 'https://youtu.be/ml3MdmCkwbQ',
  'bear-crawl': 'https://youtu.be/_li8Mi8grTU',
  'walking-lunge': 'https://youtu.be/vYfp2t4XgqQ',
  'scap-pull-up': 'https://youtu.be/inxW0UX9b5A',
  'monster-walk': 'https://youtu.be/N9xf-hk7_6w',
  'good-morning': 'https://youtu.be/nWyx81AfTos',
  'romanian-deadlift': 'https://youtu.be/5bJEigM5iVg',
  'sumo-deadlift': 'https://youtu.be/HBmLwb9IcaI',
  'bent-over-row': 'https://youtu.be/YcK7pyFXmWk',
  'pendlay-row': 'https://youtu.be/c1ooSxRXeGQ',
  'bench-press': 'https://youtu.be/gRVjAtPip0Y',
  'split-jerk': 'https://youtu.be/2GPA-cjUFnA',
  'hang-power-clean': 'https://youtu.be/0aP3tgKZcHQ',
  'hang-power-snatch': 'https://youtu.be/8AyTzORaBM8',
  'chest-to-bar-pull-up': 'https://youtu.be/p9Stan68FYM',
  'pistol-squat': 'https://youtu.be/nGKFTLLRdGU',
  'l-sit': 'https://youtu.be/_HbccxgnCg0',
  'hollow-rock': 'https://youtu.be/V72HS7BV42g',
  'dumbbell-clean-and-jerk': 'https://youtu.be/olYaqKBXxb4',
  'dumbbell-thruster': 'https://youtu.be/M5gEwLTtWbg',
  'dumbbell-push-press': 'https://youtu.be/MqvN10OF5fo',
  'dumbbell-front-rack-lunge': 'https://youtu.be/7EmwtpAI8cM',
  'dumbbell-overhead-lunge': 'https://youtu.be/J3DxelcaaMU',
  'dumbbell-row': 'https://youtu.be/tLnlWj7LQ34',
  'kettlebell-snatch': 'https://youtu.be/ZQccQg4kDf8',
  'turkish-get-up': 'https://youtu.be/0bWRPC49-KI',
  'kettlebell-goblet-squat': 'https://youtu.be/aNDUbH_Uv4g',
  'shuttle-run': 'https://youtu.be/fZoJVVuqY3U',
  'bicep-curl': 'https://youtu.be/6DeLZ6cbgWQ',
  'tricep-extension': 'https://youtu.be/X-iV-cG8cYs',
  'lateral-raise': 'https://youtu.be/Y29xKcze8Ik',
  'plank': 'https://youtu.be/A2b2EmIg0dA',
  'hip-thrust': 'https://youtu.be/Zp26q4BY5HE',
  'reverse-hyperextension': 'https://youtu.be/Pqigpd54aL8',
  'bent-over-lateral-raise': 'https://youtu.be/gQBJPfWf_-s',
  'supinated-grip-row': 'https://youtu.be/X_9L54FVD0c',
};

// الثلاثة التالية لم يكن لها أي وثيقة في مجموعة exercises إطلاقاً (لا فقط رابط فارغ) — تحتاج upsert بحقول كاملة
const NEW_DOCS: Record<string, { nameAr: string; nameEn: string; category: string; muscles: string }> = {
  'reverse-hyperextension':  { nameAr: 'التمديد العكسي',        nameEn: 'Reverse Hyperextension',   category: 'وود', muscles: 'أسفل الظهر والأرداف وأوتار الركبة' },
  'bent-over-lateral-raise': { nameAr: 'رفعة جانبية منحنية',    nameEn: 'Bent-over Lateral Raise',  category: 'وود', muscles: 'الكتف الخلفي' },
  'supinated-grip-row':      { nameAr: 'تجديف بقبضة مقلوبة',    nameEn: 'Supinated Grip Row',       category: 'قوة', muscles: 'الظهر والبايسبس' },
};

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let updated = 0, inserted = 0, notFound = 0;
  for (const [id, youtube] of Object.entries(LINKS)) {
    if (NEW_DOCS[id]) {
      const res = await db.collection('exercises').updateOne(
        { id },
        { $set: { id, youtube, gif: '', ...NEW_DOCS[id] } },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++; else updated++;
      continue;
    }
    const res = await db.collection('exercises').updateOne(
      { id },
      { $set: { youtube } },
    );
    if (res.matchedCount > 0) updated++;
    else notFound++;
  }

  console.log(`✅ تم تحديث ${updated} تمريناً موجوداً، وإدراج ${inserted} تمريناً جديداً برابط يوتيوب حقيقي`);
  if (notFound > 0) console.log(`⚠️ ${notFound} معرّف لم يُطابَق أي وثيقة موجودة (تحقق من الأسماء)`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
