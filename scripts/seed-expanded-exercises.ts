/**
 * يُدرج/يُحدّث (upsert) وثائق مجموعة exercises في MongoDB لكل تمرين جديد أُضيف إلى
 * lib/crossfitProgramming.ts (توسعة المكتبة من 5 قوائم زوّدنا بها المدرب)، بالإضافة إلى
 * air-squat الذي كان موجوداً في الكود لكن مفقوداً من هذه المجموعة (لا GIF/فيديو — لم تُوفَّر
 * روابط، والواجهة تتعامل مع غيابها بلطف أصلاً).
 *
 * تشغيل: npx tsx scripts/seed-expanded-exercises.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const NEW_EXERCISES = [
  { id: 'air-squat', nameAr: 'القرفصاء الهوائية', nameEn: 'Air Squat', category: 'جمناستيك', muscles: 'الأرجل والمؤخرة' },

  { id: 'pvc-pass-through', nameAr: 'تمرير عصا PVC', nameEn: 'PVC Pass-Through', category: 'جمناستيك', muscles: 'الكتفين والرسغين' },
  { id: 'band-pull-apart', nameAr: 'سحب الحزام المطاطي', nameEn: 'Band Pull-Apart', category: 'جمناستيك', muscles: 'الكتف الخلفي وأعلى الظهر' },
  { id: 'inchworm', nameAr: 'دودة الأرض', nameEn: 'Inchworm', category: 'جمناستيك', muscles: 'الجذع وأوتار الركبة' },
  { id: 'worlds-greatest-stretch', nameAr: 'إطالة العالم العظيم', nameEn: "World's Greatest Stretch", category: 'جمناستيك', muscles: 'الورك والعمود الفقري' },
  { id: 'bear-crawl', nameAr: 'زحف الدب', nameEn: 'Bear Crawl', category: 'جمناستيك', muscles: 'الجذع والكتفين' },
  { id: 'walking-lunge', nameAr: 'الطعنة المتحركة', nameEn: 'Walking Lunge', category: 'جمناستيك', muscles: 'الأرجل والمؤخرة' },
  { id: 'leg-swing', nameAr: 'أرجحة الساق', nameEn: 'Leg Swing', category: 'جمناستيك', muscles: 'الورك وأوتار الركبة' },
  { id: 'scap-pull-up', nameAr: 'عقلة لوح الكتف', nameEn: 'Scapular Pull-Up', category: 'جمناستيك', muscles: 'أعلى الظهر ولوح الكتف' },
  { id: 'monster-walk', nameAr: 'مشي الوحش بالحزام', nameEn: 'Banded Monster Walk', category: 'جمناستيك', muscles: 'المؤخرة الجانبية والورك' },
  { id: 'good-morning', nameAr: 'الانحناء الأمامي (Good Morning)', nameEn: 'Good Morning', category: 'قوة', muscles: 'أسفل الظهر وأوتار الركبة' },

  { id: 'romanian-deadlift', nameAr: 'الرفعة الرومانية', nameEn: 'Romanian Deadlift', category: 'قوة', muscles: 'أوتار الركبة والمؤخرة' },
  { id: 'sumo-deadlift', nameAr: 'الرفعة السومو', nameEn: 'Sumo Deadlift', category: 'قوة', muscles: 'الأرجل والمؤخرة وأسفل الظهر' },
  { id: 'bent-over-row', nameAr: 'التجديف المنحني بالبار', nameEn: 'Barbell Bent-Over Row', category: 'قوة', muscles: 'الظهر والبايسبس' },
  { id: 'pendlay-row', nameAr: 'تجديف بندلاي', nameEn: 'Pendlay Row', category: 'قوة', muscles: 'الظهر والبايسبس' },
  { id: 'bench-press', nameAr: 'ضغط البنش', nameEn: 'Barbell Bench Press', category: 'قوة', muscles: 'الصدر والكتف والترايسبس' },
  { id: 'split-jerk', nameAr: 'الدفع الانقسامي', nameEn: 'Split Jerk', category: 'رفع أثقال أولمبي', muscles: 'كامل الجسم' },
  { id: 'hang-power-clean', nameAr: 'النظيفة القوية المعلّقة', nameEn: 'Hang Power Clean', category: 'رفع أثقال أولمبي', muscles: 'كامل الجسم' },
  { id: 'hang-power-snatch', nameAr: 'الخطف القوي المعلّق', nameEn: 'Hang Power Snatch', category: 'رفع أثقال أولمبي', muscles: 'كامل الجسم' },

  { id: 'chest-to-bar-pull-up', nameAr: 'عقلة الصدر للعارضة', nameEn: 'Chest-to-Bar Pull-Up', category: 'جمناستيك', muscles: 'الظهر والذراعين' },
  { id: 'pistol-squat', nameAr: 'قرفصاء المسدس (ساق واحدة)', nameEn: 'Pistol Squat', category: 'جمناستيك', muscles: 'الأرجل والتوازن' },
  { id: 'wall-walk', nameAr: 'المشي على الحائط', nameEn: 'Wall Walk', category: 'جمناستيك', muscles: 'الكتفين والجذع' },
  { id: 'ghd-situp', nameAr: 'جلوس GHD', nameEn: 'GHD Sit-Up', category: 'جمناستيك', muscles: 'البطن وأسفل الظهر' },
  { id: 'l-sit', nameAr: 'ثبات L', nameEn: 'L-Sit Hold', category: 'جمناستيك', muscles: 'البطن وثنائيات الورك' },
  { id: 'hollow-rock', nameAr: 'تمايل الجسم المجوف', nameEn: 'Hollow Rock', category: 'جمناستيك', muscles: 'البطن والجذع' },
  { id: 'bar-facing-burpee', nameAr: 'بيربي مواجه للبار', nameEn: 'Bar-Facing Burpee', category: 'تحمل', muscles: 'كامل الجسم' },
  { id: 'box-jump-over', nameAr: 'القفز فوق الصندوق', nameEn: 'Box Jump Over', category: 'وود', muscles: 'الأرجل والقلب' },

  { id: 'dumbbell-snatch', nameAr: 'خطف الدمبل', nameEn: 'Dumbbell Snatch', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'dumbbell-clean-and-jerk', nameAr: 'نظيفة ودفع الدمبل', nameEn: 'Dumbbell Clean & Jerk', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'dumbbell-thruster', nameAr: 'ثراستر الدمبل', nameEn: 'Dumbbell Thruster', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'dumbbell-power-clean', nameAr: 'نظيفة قوية بالدمبل', nameEn: 'Dumbbell Power Clean', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'dumbbell-push-press', nameAr: 'دفع بالساقين بالدمبل', nameEn: 'Dumbbell Push Press', category: 'وود', muscles: 'الأكتاف والأرجل' },
  { id: 'dumbbell-front-rack-lunge', nameAr: 'طعنة الرف الأمامي بالدمبل', nameEn: 'DB Front Rack Lunge', category: 'وود', muscles: 'الأرجل والمؤخرة' },
  { id: 'dumbbell-overhead-lunge', nameAr: 'طعنة فوق الرأس بالدمبل', nameEn: 'DB Overhead Lunge', category: 'وود', muscles: 'الأرجل والكتف والتوازن' },
  { id: 'devils-press', nameAr: 'دفعة الشيطان', nameEn: "Devil's Press", category: 'وود', muscles: 'كامل الجسم' },
  { id: 'farmers-carry', nameAr: 'حمل المزارع', nameEn: "Farmer's Carry", category: 'وود', muscles: 'القبضة والجذع' },
  { id: 'dumbbell-row', nameAr: 'تجديف الدمبل', nameEn: 'Dumbbell Row', category: 'وود', muscles: 'الظهر والبايسبس' },

  { id: 'kettlebell-clean', nameAr: 'نظيفة الكيتل بيل', nameEn: 'Kettlebell Clean', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'kettlebell-snatch', nameAr: 'خطف الكيتل بيل', nameEn: 'Kettlebell Snatch', category: 'وود', muscles: 'كامل الجسم' },
  { id: 'turkish-get-up', nameAr: 'النهوض التركي', nameEn: 'Turkish Get-Up', category: 'وود', muscles: 'كامل الجسم والاستقرار' },
  { id: 'kettlebell-goblet-squat', nameAr: 'قرفصاء الكأس بالكيتل بيل', nameEn: 'Kettlebell Goblet Squat', category: 'وود', muscles: 'الأرجل والمؤخرة' },

  { id: 'air-bike', nameAr: 'دراجة الهواء', nameEn: 'Air Bike (Echo/Assault)', category: 'تحمل', muscles: 'كامل الجسم والقلب' },
  { id: 'ski-erg', nameAr: 'جهاز التزلج', nameEn: 'SkiErg', category: 'تحمل', muscles: 'الذراعين والقلب' },
  { id: 'shuttle-run', nameAr: 'الجري المكوكي', nameEn: 'Shuttle Run', category: 'تحمل', muscles: 'الأرجل والقلب' },

  { id: 'bicep-curl', nameAr: 'ثني العضلة ذات الرأسين', nameEn: 'Dumbbell Bicep Curl', category: 'وود', muscles: 'البايسبس' },
  { id: 'tricep-extension', nameAr: 'مد الترايسبس فوق الرأس', nameEn: 'Overhead Tricep Extension', category: 'وود', muscles: 'الترايسبس' },
  { id: 'lateral-raise', nameAr: 'رفعة جانبية بالدمبل', nameEn: 'Dumbbell Lateral Raise', category: 'وود', muscles: 'الكتف الجانبي' },
  { id: 'face-pull', nameAr: 'سحب الوجه بالحزام', nameEn: 'Band Face Pull', category: 'وود', muscles: 'الكتف الخلفي وأعلى الظهر' },
  { id: 'plank', nameAr: 'ثبات البلانك', nameEn: 'Plank Hold', category: 'جمناستيك', muscles: 'البطن والجذع' },
  { id: 'russian-twist', nameAr: 'الالتواء الروسي', nameEn: 'Russian Twist', category: 'وود', muscles: 'البطن الجانبي' },
  { id: 'glute-bridge', nameAr: 'جسر المؤخرة', nameEn: 'Glute Bridge', category: 'جمناستيك', muscles: 'المؤخرة وأسفل الظهر' },
  { id: 'bulgarian-split-squat', nameAr: 'قرفصاء بلغاري منقسم', nameEn: 'Bulgarian Split Squat', category: 'وود', muscles: 'الأرجل والمؤخرة' },
  { id: 'hip-thrust', nameAr: 'دفعة الورك بالبار', nameEn: 'Barbell Hip Thrust', category: 'قوة', muscles: 'المؤخرة وأسفل الظهر' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of NEW_EXERCISES) {
    const doc = { ...ex, gif: '', youtube: '' };
    const res = await db.collection('exercises').updateOne(
      { id: ex.id },
      { $set: doc },
      { upsert: true }
    );
    if (res.upsertedCount > 0) inserted++; else updated++;
  }

  console.log(`✅ تم: ${inserted} تمريناً جديداً أُدرِج، ${updated} كان موجوداً وحُدِّث`);
  const total = await db.collection('exercises').countDocuments();
  console.log(`إجمالي التمارين في المجموعة الآن: ${total}`);

  await client.close();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
