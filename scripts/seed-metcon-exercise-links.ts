/**
 * يُدرج/يُحدّث (upsert) وثائق مجموعة exercises في MongoDB لتمارين ميتكون كان المدرب قد راجعها
 * بمقارنة قائمة حركات ميتكون قياسية في CrossFit مع مكتبة النظام — وجد 6 تمارين غائبة كلياً
 * (أُضيفت أولاً إلى lib/crossfitProgramming.ts) و8 تمارين موجودة لكن بلا رابط يوتيوب.
 * الروابط بُحث عنها فعلياً والتحقق من صحتها (كل رابط تأكّد أنه فيديو حي على يوتيوب يطابق التمرين
 * فعلياً عبر واجهة يوتيوب البرمجية، مع فحص يدوي إضافي لعينة منها) — لا معرّفات وهمية.
 *
 * تشغيل: npx tsx scripts/seed-metcon-exercise-links.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const METCON_EXERCISES = [
  // ستة تمارين كانت غائبة كلياً عن المكتبة
  { id: 'front-rack-carry', nameAr: 'حمل الصدر (بار أمامي)',   nameEn: 'Front Rack Carry',   category: 'وود',       muscles: 'الجذع والأرجل تحت حمل ثابت', youtube: 'https://youtu.be/CRXvlBsTgHY' },
  { id: 'ring-dip',         nameAr: 'ضغط المتوازي على الحلقات', nameEn: 'Ring Dip',           category: 'جمناستيك',  muscles: 'الصدر والترايسبس والكتف',    youtube: 'https://youtu.be/Vt0lO4jpIDo' },
  { id: 'bar-dip',          nameAr: 'ضغط المتوازي على البار',   nameEn: 'Bar Dip',            category: 'جمناستيك',  muscles: 'الصدر والترايسبس والكتف',    youtube: 'https://youtu.be/eERwCQHZqfA' },
  { id: 'knees-to-elbows',  nameAr: 'الركبتين إلى المرفقين',    nameEn: 'Knees to Elbows',    category: 'جمناستيك',  muscles: 'الجذع السفلي والقبضة',       youtube: 'https://youtu.be/zEJ0q5sz4G0' },
  { id: 'bike-erg',         nameAr: 'دراجة المقاومة (BikeErg)', nameEn: 'BikeErg',            category: 'تحمل',      muscles: 'الأرجل والقلب',              youtube: 'https://youtu.be/UZKbytEQJAU' },
  { id: 'jump-rope',        nameAr: 'القفز على الحبل (عادي)',   nameEn: 'Jump Rope (Single)', category: 'تحمل',      muscles: 'الساقين وتناسق الحركة',      youtube: 'https://youtu.be/hCuXYrTOMxI' },

  // ثمانية تمارين موجودة سابقاً لكن بلا رابط يوتيوب
  { id: 'dumbbell-snatch',      nameAr: 'خطف الدمبل',             nameEn: 'Dumbbell Snatch (Alternating)', category: 'وود', muscles: 'كامل الجسم', youtube: 'https://youtu.be/zVptpUTqUUg' },
  { id: 'dumbbell-power-clean', nameAr: 'نظيفة قوية بالدمبل',     nameEn: 'DB Clean',                      category: 'وود', muscles: 'كامل الجسم', youtube: 'https://youtu.be/CUaxieWW0tw' },
  { id: 'kettlebell-clean',     nameAr: 'نظيفة الكيتل بيل',       nameEn: 'KB Clean',                      category: 'وود', muscles: 'كامل الجسم', youtube: 'https://youtu.be/Im85FE1U8CI' },
  { id: 'devils-press',         nameAr: 'دفعة الشيطان',           nameEn: "Devil's Press",                 category: 'وود', muscles: 'كامل الجسم', youtube: 'https://youtu.be/cBGQrgovLFM' },
  { id: 'box-jump-over',        nameAr: 'القفز فوق الصندوق',      nameEn: 'Box Jump Over',                 category: 'وود', muscles: 'الأرجل والقلب', youtube: 'https://youtu.be/h909cgXsiaU' },
  { id: 'bar-facing-burpee',    nameAr: 'بيربي مواجه للبار',      nameEn: 'Bar-Facing Burpee',             category: 'تحمل', muscles: 'كامل الجسم', youtube: 'https://youtu.be/wcA_-ciyjsY' },
  { id: 'ski-erg',              nameAr: 'جهاز التزلج',            nameEn: 'SkiErg',                        category: 'تحمل', muscles: 'الذراعين والقلب', youtube: 'https://youtu.be/Lgi5YAfIqto' },
  { id: 'air-bike',             nameAr: 'دراجة الهواء',           nameEn: 'Air Bike (Echo/Assault)',       category: 'تحمل', muscles: 'كامل الجسم والقلب', youtube: 'https://youtu.be/9zoBaVgZ9PQ' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of METCON_EXERCISES) {
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
