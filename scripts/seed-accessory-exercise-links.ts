/**
 * يُدرج/يُحدّث (upsert) وثائق مجموعة exercises في MongoDB لروابط يوتيوب تمارين الأكسسوار من
 * "الدليل الشامل لتمارين الأكسسوار في CrossFit" الذي زوّدنا به المدرب (٤٢ تمريناً، مع كلمات بحث
 * إنجليزية موصى بها لكل تمرين). الروابط بُحث عنها فعلياً والتحقق من صحتها (كل رابط تأكّد أنه فيديو
 * حي على يوتيوب يطابق التمرين فعلياً، لا معرّف مُخترَع) — لا معرّفات وهمية.
 *
 * استُبعد من هذه الدفعة تمرينان كان لهما رابط مُختار مسبقاً من المدرب في seed-stretch-exercises.ts:
 * couch-stretch وpigeon-pose-stretch — لم نستبدلهما حتى لا نُلغي اختياراً سابقاً للمدرب بلا داعٍ.
 *
 * تشغيل: npx tsx scripts/seed-accessory-exercise-links.ts
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const ACCESSORY_EXERCISES = [
  // الجذع والعمود الفقري (Core & Trunk)
  { id: 'hollow-body-hold',      nameAr: 'ثبات الجسم المجوف',              nameEn: 'Hollow Body Hold',       category: 'جمناستيك',       muscles: 'الجذع الأمامي (Rectus Abdominis)', youtube: 'https://www.youtube.com/watch?v=WRHcG59yN2Q' },
  { id: 'arch-body-hold',        nameAr: 'ثبات الجسم المقوّس',              nameEn: 'Arch Body Hold',         category: 'جمناستيك',       muscles: 'الظهر السفلي والاستطالة',          youtube: 'https://www.youtube.com/watch?v=TkrTjU-qf6U' },
  { id: 'ghd-situp',             nameAr: 'جلوس GHD',                        nameEn: 'GHD Sit-Up',             category: 'جمناستيك',       muscles: 'الثني القوي للورك والجذع',          youtube: 'https://www.youtube.com/watch?v=1pbZ8mX2D1U' },
  { id: 'plank-shoulder-taps',   nameAr: 'بلانك مع لمس الكتف',              nameEn: 'Plank Shoulder Taps',    category: 'جمناستيك',       muscles: 'الثبات الجانبي والدوراني',          youtube: 'https://www.youtube.com/watch?v=xlXn0wKRHBQ' },
  { id: 'russian-twist',         nameAr: 'الالتواء الروسي',                 nameEn: 'Russian Twist',          category: 'وود',            muscles: 'المائلة (Obliques)',                youtube: 'https://www.youtube.com/watch?v=jM93aZ5gHJw' },
  { id: 'windshield-wiper',      nameAr: 'ماسحة الزجاج (بطن)',              nameEn: 'Windshield Wiper',       category: 'جمناستيك',       muscles: 'المائلة وعضلات الورك الجانبية',     youtube: 'https://www.youtube.com/watch?v=af-20PyuwgI' },
  { id: 'toes-to-bar',           nameAr: 'الأصابع للعارضة',                 nameEn: 'Toes to Bar',            category: 'جمناستيك',       muscles: 'الجذع السفلي واللاتس',              youtube: 'https://www.youtube.com/watch?v=xX9Hzi7Onnw' },
  { id: 'deadbug',               nameAr: 'الحشرة الميتة',                   nameEn: 'Deadbug',                category: 'جمناستيك',       muscles: 'التثبيت العميق (Transversus Abdominis)', youtube: 'https://www.youtube.com/watch?v=gFFO3lkYv1Q' },

  // صحة الكتف والمثبتات الدورانية (Shoulder Stability)
  { id: 'band-pull-apart',       nameAr: 'سحب الحزام المطاطي',              nameEn: 'Band Pull-Apart',        category: 'جمناستيك',       muscles: 'المعينات (Rhomboids) والكفة الخلفية', youtube: 'https://www.youtube.com/watch?v=KV3BCoFkzpk' },
  { id: 'face-pull',             nameAr: 'سحب الوجه بالحزام',               nameEn: 'Band Face Pull',         category: 'وود',            muscles: 'الدالية الخلفية والدوران الخارجي',   youtube: 'https://www.youtube.com/watch?v=CU4Xc2qlLC0' },
  { id: 'cuban-rotation',        nameAr: 'دوران كوبا للكتف',                nameEn: 'Cuban Rotation',         category: 'وود',            muscles: 'الكفة المدورة (Rotator Cuff)',       youtube: 'https://www.youtube.com/watch?v=9EgejxNJxIY' },
  { id: 'scapular-pushup',       nameAr: 'ضغط لوح الكتف',                   nameEn: 'Scapular Push-up',       category: 'جمناستيك',       muscles: 'تحريك الكتف (Serratus Anterior)',    youtube: 'https://www.youtube.com/watch?v=wCiRjQk-RSg' },
  { id: 'db-z-press',            nameAr: 'ضغط Z بالدمبل',                   nameEn: 'DB Z-Press',             category: 'وود',            muscles: 'عزل الدالية الأمامية',               youtube: 'https://www.youtube.com/watch?v=BK2z6pRRbvQ' },
  { id: 'ytwl',                  nameAr: 'حروف YTWL لصحة الكتف',            nameEn: 'YTWL',                   category: 'جمناستيك',       muscles: 'كل عضلات الكتف المحيطة (Prehab)',    youtube: 'https://www.youtube.com/watch?v=W52eiWh0eTM' },

  // الورك، الأرداف، وأوتار الركبة (Hips, Glutes & Hamstrings)
  { id: 'single-leg-rdl',        nameAr: 'رفعة رومانية بساق واحدة',         nameEn: 'Single-Leg RDL',         category: 'وود',            muscles: 'التوازن وقوة أوتار الركبة',          youtube: 'https://www.youtube.com/watch?v=Zfr6wizR8rs' },
  { id: 'bulgarian-split-squat', nameAr: 'قرفصاء بلغاري منقسم',             nameEn: 'Bulgarian Split Squat',  category: 'وود',            muscles: 'الأرداف والفخذ الأمامي',             youtube: 'https://www.youtube.com/watch?v=E2UpghpIIXM' },
  { id: 'glute-bridge',          nameAr: 'جسر المؤخرة',                     nameEn: 'Glute Bridge',           category: 'جمناستيك',       muscles: 'الأرداف الكبرى',                     youtube: 'https://www.youtube.com/watch?v=GNY0RKIvkH0' },
  { id: 'nordic-curl',           nameAr: 'ثني نوردك لأوتار الركبة',         nameEn: 'Nordic Curl',            category: 'جمناستيك',       muscles: 'الانقباض اللامركزي لأوتار الركبة',   youtube: 'https://www.youtube.com/watch?v=_e9vFU9-tkc' },
  { id: 'cossack-squat',         nameAr: 'قرفصاء القوزاق (جانبي)',          nameEn: 'Cossack Squat',          category: 'جمناستيك',       muscles: 'التنقل الجانبي ومرونة الأربية',      youtube: 'https://www.youtube.com/watch?v=JaCbmoDqUc4' },
  { id: 'lateral-band-walk',     nameAr: 'المشي الجانبي بالحزام',           nameEn: 'Lateral Band Walk',      category: 'جمناستيك',       muscles: 'الأرداف الوسطى (المبعدة)',           youtube: 'https://www.youtube.com/watch?v=YCqrtnr6g5g' },

  // القبضة والساعدين (Grip & Forearms)
  { id: 'farmers-carry',         nameAr: 'حمل المزارع',                     nameEn: "Farmer's Carry",         category: 'وود',            muscles: 'قبضة اليد والساعدين',                youtube: 'https://www.youtube.com/watch?v=T-3lacPakkM' },
  { id: 'suitcase-carry',        nameAr: 'حمل الحقيبة (جانب واحد)',         nameEn: 'Suitcase Carry',         category: 'وود',            muscles: 'قبضة + تثبيت جانبي للجذع',           youtube: 'https://www.youtube.com/watch?v=eX1OgPzK89o' },
  { id: 'plate-pinch',           nameAr: 'قرص الصفيحة بالأصابع',            nameEn: 'Plate Pinch',            category: 'وود',            muscles: 'عضلات الأصابع والقبضة العميقة',      youtube: 'https://www.youtube.com/watch?v=LARw21BBiDk' },
  { id: 'wrist-curls',           nameAr: 'ثني الرسغ',                       nameEn: 'Wrist Curls',            category: 'وود',            muscles: 'مثنيات الساعد',                      youtube: 'https://www.youtube.com/watch?v=3VLTzIrnb5g' },
  { id: 'dead-hangs',            nameAr: 'التعليق الميت',                   nameEn: 'Dead Hangs',             category: 'جمناستيك',       muscles: 'تحمل القبضة الثابتة',                youtube: 'https://www.youtube.com/watch?v=feAUed98lFg' },

  // العضلات الثنائية والثلاثية (Biceps & Triceps)
  { id: 'strict-ring-rows',      nameAr: 'تجديف الحلقات الصارم',            nameEn: 'Strict Ring Rows',       category: 'جمناستيك',       muscles: 'الظهر العريض والعضلة ذات الرأسين',   youtube: 'https://www.youtube.com/watch?v=-4ewEbYEr4w' },
  { id: 'tricep-pushdown',       nameAr: 'دفع الترايسبس بالحزام',           nameEn: 'Tricep Pushdown',        category: 'وود',            muscles: 'العضلة الثلاثية',                    youtube: 'https://www.youtube.com/watch?v=qjPN6ElNqpc' },
  { id: 'skull-crusher',         nameAr: 'سكل كراشر للترايسبس',             nameEn: 'Skull Crusher',          category: 'وود',            muscles: 'الرأس الطويل للثلاثية',              youtube: 'https://www.youtube.com/watch?v=1BDGIcMTSXc' },

  // مساعدات الأولمبيات (Olympic Lifting Assistance)
  { id: 'snatch-balance',        nameAr: 'توازن الخطف',                     nameEn: 'Snatch Balance',         category: 'رفع أثقال أولمبي', muscles: 'استقبال الخطف بسرعة تحت البار',    youtube: 'https://www.youtube.com/watch?v=8KKQTdnxWso' },
  { id: 'overhead-squat-pause',  nameAr: 'قرفصاء فوق الرأس مع توقف',        nameEn: 'Overhead Squat (Pause)', category: 'رفع أثقال أولمبي', muscles: 'ثبات الكتفين والوركين في القرفصاء العميق', youtube: 'https://www.youtube.com/watch?v=GTMHsyXARJk' },
  { id: 'tall-snatch',           nameAr: 'الخطف الطويل',                    nameEn: 'Tall Snatch / Tall Clean', category: 'رفع أثقال أولمبي', muscles: 'سرعة إعادة تموضع القدمين',        youtube: 'https://www.youtube.com/watch?v=dDVvsXfITyQ' },
  { id: 'muscle-snatch',         nameAr: 'الخطف العضلي',                    nameEn: 'Muscle Snatch',          category: 'رفع أثقال أولمبي', muscles: 'انفجار الكتفين والذراعين بدون جلوس', youtube: 'https://www.youtube.com/watch?v=0v70F3R_SFs' },
  { id: 'pause-front-squat',     nameAr: 'قرفصاء أمامية مع توقف',           nameEn: 'Pause Front Squat',      category: 'رفع أثقال أولمبي', muscles: 'قوة الخروج من القاع في النظافة',   youtube: 'https://www.youtube.com/watch?v=AxFt4JVJwdw' },

  // مساعدات الجمناستيك (Gymnastics Progressions)
  { id: 'strict-pull-up-negatives', nameAr: 'عقلة سلبية صارمة',             nameEn: 'Strict Pull-up Negatives', category: 'جمناستيك',     muscles: 'قوة السحب اللامركزية',               youtube: 'https://www.youtube.com/watch?v=s9MlTeJHwAI' },
  { id: 'ring-dip-support-hold', nameAr: 'ثبات دعم الحلقات',                nameEn: 'Ring Dip Support Hold',  category: 'جمناستيك',       muscles: 'ثبات الكتفين في الدفع',              youtube: 'https://www.youtube.com/watch?v=jPPM1ri6MqQ' },
  { id: 'false-grip-hangs',      nameAr: 'تعليق القبضة الخاطئة',            nameEn: 'False Grip Hangs',       category: 'جمناستيك',       muscles: 'تحضير عضلات الساعد للحلقات',        youtube: 'https://www.youtube.com/watch?v=2C2c7ESHXpY' },
  { id: 'wall-walk',             nameAr: 'المشي على الحائط',                nameEn: 'Wall Walk',              category: 'جمناستيك',       muscles: 'قوة الكتفين والجذع المقلوب',         youtube: 'https://www.youtube.com/watch?v=z9x_woleD8A' },
  { id: 'skin-the-cat',          nameAr: 'سكين-ذا-كات (حلقات)',             nameEn: 'Skin-the-Cat',           category: 'جمناستيك',       muscles: 'مرونة الكتفين ودوران العمود الفقري', youtube: 'https://www.youtube.com/watch?v=eAHkE3BfcAg' },

  // إعادة التأهيل والتنقل (Prehab & Mobility) — باستثناء couch-stretch وpigeon-pose-stretch
  // (لهما رابط مُختار من المدرب مسبقاً في seed-stretch-exercises.ts، لم نستبدله)
  { id: 'lizard-stretch',        nameAr: 'إطالة السحلية (الأربية)',         nameEn: 'Lizard Stretch',         category: 'إطالة',          muscles: 'المناطق الأربية والوركية',           youtube: 'https://www.youtube.com/watch?v=AwBO4DJtss0' },
  { id: 'kettlebell-halo',       nameAr: 'هالة الكيتل بيل',                 nameEn: 'Kettlebell Halo',        category: 'وود',            muscles: 'مرونة الكتفين الدوارة',              youtube: 'https://www.youtube.com/watch?v=U9jmmHQEweA' },
];

async function seed() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'matanikeh');

  let inserted = 0, updated = 0;
  for (const ex of ACCESSORY_EXERCISES) {
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
