/**
 * يُدرج/يُحدّث (upsert) وثائق مجموعة exercises في MongoDB لكل إطالة مُسمّاة أُضيفت إلى
 * lib/crossfitProgramming.ts (PATTERN_COOLDOWN_MAP) — الآن بمعرّف exerciseId فعلي مخصص
 * بدل استخدام تمرين بديل تقني غير مطابق. كل إطالة مربوطة برابط يوتيوب حقيقي (بحث فعلي،
 * لا روابط مُختلَقة) اختاره المدرب من نتائج البحث.
 *
 * تشغيل: npx tsx scripts/seed-stretch-exercises.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const STRETCH_EXERCISES = [
  // القرفصاء (Squat)
  { id: 'standing-quad-stretch',        nameAr: 'إطالة الرباعية واقفاً (Standing Quad Stretch)',               nameEn: 'Standing Quad Stretch',       category: 'إطالة', muscles: 'الرباعية', youtube: 'https://youtu.be/ob1tvmQUQZ0' },
  { id: 'kneeling-hip-flexor-stretch',  nameAr: 'إطالة الورك القابضة على الركبة (Kneeling Hip Flexor Stretch)', nameEn: 'Kneeling Hip Flexor Stretch',  category: 'إطالة', muscles: 'عضلة الورك القابضة', youtube: 'https://youtu.be/bW7FqSFKqyE' },
  { id: 'pigeon-pose-stretch',          nameAr: 'وضعية الحمامة (Pigeon Pose)',                                  nameEn: 'Pigeon Pose',                  category: 'إطالة', muscles: 'المؤخرة والورك', youtube: 'https://youtu.be/1o7awuDGzag' },
  { id: 'couch-stretch',                nameAr: 'إطالة الكاوتش على الحائط (Couch Stretch)',                     nameEn: 'Couch Stretch',                category: 'إطالة', muscles: 'الرباعية وعضلة الورك القابضة', youtube: 'https://youtu.be/NpmS6Fx1WLo' },
  { id: 'figure-4-stretch',             nameAr: 'وضعية الرقم 4 (Figure-4 Stretch)',                             nameEn: 'Figure-4 Stretch',             category: 'إطالة', muscles: 'المؤخرة', youtube: 'https://youtu.be/Xb5gHdYtHnk' },

  // الرفعة (Hinge)
  { id: 'seated-forward-fold-stretch',  nameAr: 'إطالة أوتار الركبة جلوساً (Seated Forward Fold)',              nameEn: 'Seated Forward Fold',          category: 'إطالة', muscles: 'أوتار الركبة', youtube: 'https://youtube.com/shorts/5njnlgYYdD4' },
  { id: 'childs-pose-stretch',          nameAr: "وضعية الطفل (Child's Pose) لأسفل الظهر",                       nameEn: "Child's Pose",                 category: 'إطالة', muscles: 'أسفل الظهر', youtube: 'https://youtu.be/_ZX_zTOBgp8' },
  { id: 'standing-hamstring-stretch',   nameAr: 'إطالة أوتار الركبة واقفاً على درجة (Standing Hamstring Stretch)', nameEn: 'Standing Hamstring Stretch', category: 'إطالة', muscles: 'أوتار الركبة', youtube: 'https://youtu.be/HoNG4hqw5P8' },
  { id: 'supine-spinal-twist-stretch',  nameAr: 'الالتواء الفقري المستلقي (Supine Spinal Twist)',               nameEn: 'Supine Spinal Twist',          category: 'إطالة', muscles: 'العمود الفقري وأسفل الظهر', youtube: 'https://youtu.be/TeAhhVD2q1c' },
  { id: 'cat-cow-hold-stretch',         nameAr: 'ثبات القطة-البقرة الساكن (Cat-Cow Slow Static Hold)',          nameEn: 'Cat-Cow Static Hold',          category: 'إطالة', muscles: 'العمود الفقري وأسفل الظهر', youtube: 'https://youtu.be/LIVJZZyZ2qM' },

  // الدفع (Push)
  { id: 'doorway-chest-stretch',        nameAr: 'إطالة الصدر على الحائط (Doorway Chest Stretch)',               nameEn: 'Doorway Chest Stretch',        category: 'إطالة', muscles: 'الصدر', youtube: 'https://youtube.com/shorts/K-Ulo0TqJ0k' },
  { id: 'overhead-tricep-stretch',      nameAr: 'إطالة الترايسبس فوق الرأس (Overhead Triceps Stretch)',         nameEn: 'Overhead Tricep Stretch',      category: 'إطالة', muscles: 'الترايسبس', youtube: 'https://youtube.com/shorts/_IOHtPSYGbk' },
  { id: 'cross-body-shoulder-stretch',  nameAr: 'إطالة الكتف الأمامي بالذراع خلف الظهر (Cross-body Shoulder Stretch)', nameEn: 'Cross-Body Shoulder Stretch', category: 'إطالة', muscles: 'الكتف الأمامي', youtube: 'https://youtube.com/shorts/aIq0fLi8iak' },
  { id: 'puppy-pose-stretch',           nameAr: 'وضعية الجرو (Puppy Pose Stretch)',                             nameEn: 'Puppy Pose Stretch',           category: 'إطالة', muscles: 'الصدر والكتف', youtube: 'https://youtu.be/szi5tN8NpKY' },

  // السحب (Pull)
  { id: 'dead-hang-lat-stretch',        nameAr: 'تعليق ميت سلبي (Dead Hang) لإطالة اللاتس',                     nameEn: 'Dead Hang Lat Stretch',        category: 'إطالة', muscles: 'الظهر العريض (Lat)', youtube: 'https://www.youtube.com/watch?v=ZBqo6xpslaY' },
  { id: 'kneeling-lat-stretch-box',     nameAr: 'إطالة اللاتس ركوعاً على صندوق (Kneeling Lat Stretch)',         nameEn: 'Kneeling Lat Stretch (Box)',   category: 'إطالة', muscles: 'الظهر العريض (Lat)', youtube: 'https://www.youtube.com/watch?v=BlnSatHy-vc' },
  { id: 'bicep-forearm-stretch',        nameAr: 'إطالة البايسبس والساعد بمدّ الذراع (Bicep/Forearm Stretch)',   nameEn: 'Bicep & Forearm Stretch',      category: 'إطالة', muscles: 'البايسبس والساعد', youtube: 'https://www.youtube.com/watch?v=xiSd1HiyPhY' },
  { id: 'thread-the-needle-stretch',    nameAr: 'خيط الإبرة (Thread the Needle Stretch)',                       nameEn: 'Thread the Needle Stretch',    category: 'إطالة', muscles: 'الكتف الخلفي وأعلى الظهر', youtube: 'https://www.youtube.com/watch?v=XEDlUwttabc' },
  { id: 'upper-trap-neck-stretch',      nameAr: 'إطالة الرقبة والترابيزيوس العلوي (Upper Trap & Neck Stretch)', nameEn: 'Upper Trap & Neck Stretch',    category: 'إطالة', muscles: 'الترابيزيوس العلوي والرقبة', youtube: 'https://www.youtube.com/watch?v=yho44869qPw' },

  // الأولمبي (Olympic)
  { id: 'deep-squat-hold-stretch',       nameAr: 'جلسة القرفصاء العميقة (Deep Squat Hold)',    nameEn: 'Deep Squat Hold',              category: 'إطالة', muscles: 'الورك والكاحل', youtube: 'https://www.youtube.com/watch?v=0wzrgyAurT8' },
  { id: 'pvc-overhead-shoulder-stretch', nameAr: 'إطالة الكتف بعصا PVC فوق الرأس',              nameEn: 'PVC Overhead Shoulder Stretch', category: 'إطالة', muscles: 'الكتف', youtube: 'https://www.youtube.com/watch?v=LQTfONFmcFA' },
  { id: 'standing-straddle-stretch',     nameAr: 'الإطالة الواقفة العريضة (Standing Straddle Stretch)', nameEn: 'Standing Straddle Stretch', category: 'إطالة', muscles: 'أوتار الركبة والورك الداخلي', youtube: 'https://www.youtube.com/watch?v=bsUcOoxkaGE' },
  { id: 'downward-dog-stretch',          nameAr: 'الكلب الهابط لإطالة الساق (Downward Dog)',    nameEn: 'Downward Dog',                 category: 'إطالة', muscles: 'أوتار الركبة وربلة الساق', youtube: 'https://www.youtube.com/watch?v=Y0GDgQqt-bA' },
  { id: 'ankle-dorsiflexion-stretch',    nameAr: 'إطالة ظهر القدم مرفوعة (Elevated Ankle Dorsiflexion Stretch)', nameEn: 'Ankle Dorsiflexion Stretch', category: 'إطالة', muscles: 'الكاحل', youtube: 'https://www.youtube.com/watch?v=RrMp1WPU4eg' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of STRETCH_EXERCISES) {
    const doc = { ...ex, gif: '' };
    const res = await db.collection('exercises').updateOne(
      { id: ex.id },
      { $set: doc },
      { upsert: true }
    );
    if (res.upsertedCount > 0) inserted++; else updated++;
  }

  console.log(`✅ تم: ${inserted} إطالة جديدة أُدرجت، ${updated} كانت موجودة وحُدِّثت`);
  const total = await db.collection('exercises').countDocuments();
  console.log(`إجمالي التمارين في المجموعة الآن: ${total}`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
