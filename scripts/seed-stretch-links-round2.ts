/**
 * فحص ثالث من المدرب لقائمة إطالات/تنقّل قياسية في CrossFit مقابل مكتبة النظام — وجد 10 إطالات
 * غائبة كلياً (أُضيفت أولاً إلى lib/crossfitProgramming.ts) و3 موجودة لكن بلا رابط يوتيوب.
 * الروابط بُحث عنها فعلياً والتحقق من صحتها عبر واجهة يوتيوب البرمجية (oEmbed)، مع فحص يدوي
 * إضافي للعناصر متوسطة الثقة — لا معرّفات وهمية.
 *
 * تشغيل: npx tsx scripts/seed-stretch-links-round2.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const STRETCHES = [
  // ثلاث إطالات موجودة سابقاً لكن بلا رابط
  { id: 'leg-swing',              nameAr: 'أرجحة الساق',             nameEn: 'Leg Swings (Front & Side)', category: 'إطالة', muscles: 'الورك وأوتار الركبة',       youtube: 'https://youtu.be/difYoBtZi2s' },
  { id: 'worlds-greatest-stretch', nameAr: 'إطالة العالم العظيم',     nameEn: "World's Greatest Stretch",  category: 'إطالة', muscles: 'الورك والعمود الفقري',      youtube: 'https://youtu.be/-CiWQ2IvY34' },
  { id: 'pvc-pass-through',       nameAr: 'تمرير عصا PVC',           nameEn: 'PVC Pass-Through',           category: 'إطالة', muscles: 'الكتفين والرسغين',          youtube: 'https://youtu.be/YW20zO__f_c' },

  // عشر إطالات كانت غائبة كلياً عن المكتبة
  { id: 'dynamic-butterfly-stretch', nameAr: 'تمدد الفراشة الديناميكي',  nameEn: 'Dynamic Butterfly Stretch',      category: 'إطالة', muscles: 'المقربات (Adductors)',        youtube: 'https://youtu.be/e8BGuP7-Dzw' },
  { id: 'zombie-kicks-stretch',      nameAr: 'ركلات الزومبي',            nameEn: 'Zombie Kicks',                    category: 'إطالة', muscles: 'أوتار الركبة',                youtube: 'https://youtu.be/P1DKww2Yuv4' },
  { id: 'frog-stretch',              nameAr: 'تمدد الضفدع',              nameEn: 'Frog Stretch',                    category: 'إطالة', muscles: 'الأربية والحوض الداخلي',      youtube: 'https://youtu.be/L1ir7JRMfuA' },
  { id: '90-90-stretch',             nameAr: 'تمدد 90/90',               nameEn: '90/90 Stretch',                   category: 'إطالة', muscles: 'الدوران الداخلي والخارجي للورك', youtube: 'https://youtu.be/P4GfbdNvOT8' },
  { id: 'banded-hamstring-stretch',  nameAr: 'تمدد أوتار الركبة بالشريط', nameEn: 'Banded Hamstring Stretch',       category: 'إطالة', muscles: 'أوتار الركبة',                youtube: 'https://youtu.be/laJOsMlcZLM' },
  { id: 'wall-calf-stretch',         nameAr: 'تمدد السمانة على الحائط',  nameEn: 'Wall Calf Stretch',               category: 'إطالة', muscles: 'السمانة (Calf)',              youtube: 'https://youtu.be/b87SO0LrXZY' },
  { id: 'towel-achilles-stretch',    nameAr: 'تمدد وتر أخيل بالمنشفة',   nameEn: 'Towel Achilles Stretch',          category: 'إطالة', muscles: 'وتر أخيل',                    youtube: 'https://youtu.be/RBR5AfJ1SrE' },
  { id: 'sphinx-seal-stretch',       nameAr: 'تمدد أبو الهول / الفقمة',  nameEn: 'Sphinx / Seal Stretch',           category: 'إطالة', muscles: 'العمود الفقري القطني',        youtube: 'https://youtu.be/ghM7MHPwuLY' },
  { id: 'pnf-hamstring-stretch',     nameAr: 'تمدد PNF لأوتار الركبة',   nameEn: 'PNF Hamstring (Contract-Relax)', category: 'إطالة', muscles: 'أوتار الركبة',                youtube: 'https://youtu.be/gJHxJEd-BWE' },
  { id: 'partner-pnf-hip-stretch',   nameAr: 'تمدد PNF للورك بالشريك',   nameEn: 'Partner PNF Hip Stretch',         category: 'إطالة', muscles: 'مثنية الورك',                 youtube: 'https://youtu.be/BBVJVEAt8Dw' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of STRETCHES) {
    const doc = { ...ex, gif: '' };
    const res = await db.collection('exercises').updateOne(
      { id: ex.id },
      { $set: doc },
      { upsert: true }
    );
    if (res.upsertedCount > 0) inserted++; else updated++;
  }

  console.log(`✅ تم: ${inserted} إطالة جديدة أُدرجت، ${updated} كانت موجودة وحُدِّثت برابط يوتيوب`);
  const total = await db.collection('exercises').countDocuments();
  console.log(`إجمالي التمارين في المجموعة الآن: ${total}`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
