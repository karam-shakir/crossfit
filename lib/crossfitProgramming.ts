// ═══════════════════════════════════════════════════════════════
// مكتبة برمجة الكروسفيت المشتركة — مصدر واحد للحقيقة
// تُستخدم في app/api/wod/generate و app/api/wod/generate-week
// لضمان توافق تمارين الأكسسوار والتهدئة مع تمرين القوة والـ WOD
// ═══════════════════════════════════════════════════════════════

export interface CFExercise {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'strength' | 'olympic' | 'gymnastics' | 'cardio' | 'wod' | 'mobility';
}

export const EXERCISES: CFExercise[] = [
  { id: 'back-squat',        nameEn: 'Back Squat',        nameAr: 'القرفصاء الخلفية',    category: 'strength'   },
  { id: 'front-squat',       nameEn: 'Front Squat',       nameAr: 'القرفصاء الأمامية',    category: 'strength'   },
  { id: 'air-squat',         nameEn: 'Air Squat',         nameAr: 'القرفصاء الهوائية',    category: 'gymnastics' },
  { id: 'deadlift',          nameEn: 'Deadlift',          nameAr: 'الرفعة الميتة',        category: 'strength'   },
  { id: 'power-clean',       nameEn: 'Power Clean',       nameAr: 'النظيفة القوية',       category: 'olympic'    },
  { id: 'clean-and-jerk',    nameEn: 'Clean & Jerk',      nameAr: 'النظيفة والدفع',       category: 'olympic'    },
  { id: 'snatch',            nameEn: 'Snatch',            nameAr: 'الخطف',                category: 'olympic'    },
  { id: 'overhead-squat',    nameEn: 'Overhead Squat',    nameAr: 'القرفصاء فوق الرأس',  category: 'strength'   },
  { id: 'shoulder-press',    nameEn: 'Shoulder Press',    nameAr: 'الضغط فوق الرأس',     category: 'strength'   },
  { id: 'push-press',        nameEn: 'Push Press',        nameAr: 'الدفع بالساقين',       category: 'strength'   },
  { id: 'thruster',          nameEn: 'Thruster',          nameAr: 'الثراستر',             category: 'wod'        },
  { id: 'pull-up',           nameEn: 'Pull Up',           nameAr: 'العقلة',              category: 'gymnastics' },
  { id: 'kipping-pull-up',   nameEn: 'Kipping Pull Up',   nameAr: 'العقلة الكيبينج',     category: 'gymnastics' },
  { id: 'muscle-up',         nameEn: 'Muscle Up',         nameAr: 'الماسل أب',           category: 'gymnastics' },
  { id: 'handstand-pushup',  nameEn: 'Handstand Push Up', nameAr: 'الضغط على اليدين',    category: 'gymnastics' },
  { id: 'handstand-walk',    nameEn: 'Handstand Walk',    nameAr: 'المشي على اليدين',    category: 'gymnastics' },
  { id: 'toes-to-bar',       nameEn: 'Toes to Bar',       nameAr: 'الأصابع للعارضة',     category: 'gymnastics' },
  { id: 'double-under',      nameEn: 'Double Under',      nameAr: 'القفز المزدوج',       category: 'cardio'     },
  { id: 'box-jump',          nameEn: 'Box Jump',          nameAr: 'القفز على الصندوق',   category: 'wod'        },
  { id: 'burpee',            nameEn: 'Burpee',            nameAr: 'البيربي',             category: 'cardio'     },
  { id: 'wall-ball',         nameEn: 'Wall Ball',         nameAr: 'كرة الحائط',          category: 'wod'        },
  { id: 'kettle-bell-swing', nameEn: 'Kettlebell Swing',  nameAr: 'هزة الكيتل بيل',      category: 'wod'        },
  { id: 'row',               nameEn: 'Row',               nameAr: 'التجديف',             category: 'cardio'     },
  { id: 'run',               nameEn: 'Run',               nameAr: 'الجري',               category: 'cardio'     },
  { id: 'push-up',           nameEn: 'Push Up',           nameAr: 'الضغط',               category: 'gymnastics' },
  { id: 'sit-up',            nameEn: 'Sit Up',            nameAr: 'الجلوس',              category: 'gymnastics' },
  { id: 'rope-climb',        nameEn: 'Rope Climb',        nameAr: 'تسلق الحبل',          category: 'gymnastics' },

  // ═══ توسعة المكتبة (منظّمة من ٥ قوائم زوّدنا بها المدرب: إحماء/قوة/ميتكون/أكسسوار/إطالات) —
  // مُنتقاة بعناية من ~٣٥٠ حركة خام: فقط الحركات المختلفة تدريبياً بوضوح عن الموجود أصلاً،
  // لا كل مؤهّل أسلوب (Strict/Kipping/Pause/Tempo تُذكر في notes لا كمعرّفات منفصلة) ═══

  // إحماء وتفعيل حركي
  { id: 'pvc-pass-through',  nameEn: 'PVC Pass-Through',    nameAr: 'تمرير عصا PVC',          category: 'gymnastics' },
  { id: 'band-pull-apart',   nameEn: 'Band Pull-Apart',     nameAr: 'سحب الحزام المطاطي',     category: 'gymnastics' },
  { id: 'inchworm',          nameEn: 'Inchworm',            nameAr: 'دودة الأرض',              category: 'gymnastics' },
  { id: 'worlds-greatest-stretch', nameEn: "World's Greatest Stretch", nameAr: 'إطالة العالم العظيم', category: 'gymnastics' },
  { id: 'bear-crawl',        nameEn: 'Bear Crawl',          nameAr: 'زحف الدب',                category: 'gymnastics' },
  { id: 'walking-lunge',     nameEn: 'Walking Lunge',       nameAr: 'الطعنة المتحركة',         category: 'gymnastics' },
  { id: 'leg-swing',         nameEn: 'Leg Swing',           nameAr: 'أرجحة الساق',             category: 'gymnastics' },
  { id: 'scap-pull-up',      nameEn: 'Scapular Pull-Up',    nameAr: 'عقلة لوح الكتف',          category: 'gymnastics' },
  { id: 'monster-walk',      nameEn: 'Banded Monster Walk', nameAr: 'مشي الوحش بالحزام',       category: 'gymnastics' },
  { id: 'good-morning',      nameEn: 'Good Morning',        nameAr: 'الانحناء الأمامي (Good Morning)', category: 'strength' },

  // قوة بالبار
  { id: 'romanian-deadlift', nameEn: 'Romanian Deadlift',   nameAr: 'الرفعة الرومانية',        category: 'strength' },
  { id: 'sumo-deadlift',     nameEn: 'Sumo Deadlift',       nameAr: 'الرفعة السومو',           category: 'strength' },
  { id: 'bent-over-row',     nameEn: 'Barbell Bent-Over Row', nameAr: 'التجديف المنحني بالبار', category: 'strength' },
  { id: 'pendlay-row',       nameEn: 'Pendlay Row',         nameAr: 'تجديف بندلاي',            category: 'strength' },
  { id: 'bench-press',       nameEn: 'Barbell Bench Press', nameAr: 'ضغط البنش',               category: 'strength' },
  { id: 'split-jerk',        nameEn: 'Split Jerk',          nameAr: 'الدفع الانقسامي',         category: 'olympic'  },
  { id: 'hang-power-clean',  nameEn: 'Hang Power Clean',    nameAr: 'النظيفة القوية المعلّقة', category: 'olympic'  },
  { id: 'hang-power-snatch', nameEn: 'Hang Power Snatch',   nameAr: 'الخطف القوي المعلّق',     category: 'olympic'  },

  // جمناستيك وميتكون إضافي
  { id: 'chest-to-bar-pull-up', nameEn: 'Chest-to-Bar Pull-Up', nameAr: 'عقلة الصدر للعارضة', category: 'gymnastics' },
  { id: 'pistol-squat',      nameEn: 'Pistol Squat',        nameAr: 'قرفصاء المسدس (ساق واحدة)', category: 'gymnastics' },
  { id: 'wall-walk',         nameEn: 'Wall Walk',           nameAr: 'المشي على الحائط',        category: 'gymnastics' },
  { id: 'ghd-situp',         nameEn: 'GHD Sit-Up',          nameAr: 'جلوس GHD',                category: 'gymnastics' },
  { id: 'l-sit',             nameEn: 'L-Sit Hold',          nameAr: 'ثبات L',                  category: 'gymnastics' },
  { id: 'hollow-rock',       nameEn: 'Hollow Rock',         nameAr: 'تمايل الجسم المجوف',       category: 'gymnastics' },
  { id: 'bar-facing-burpee', nameEn: 'Bar-Facing Burpee',   nameAr: 'بيربي مواجه للبار',        category: 'cardio'   },
  { id: 'box-jump-over',     nameEn: 'Box Jump Over',       nameAr: 'القفز فوق الصندوق',        category: 'wod'      },

  // دمبل — معدّات مؤكَّدة التوفر بكمية كافية للحصة الجماعية
  { id: 'dumbbell-snatch',      nameEn: 'Dumbbell Snatch',        nameAr: 'خطف الدمبل',               category: 'wod' },
  { id: 'dumbbell-clean-and-jerk', nameEn: 'Dumbbell Clean & Jerk', nameAr: 'نظيفة ودفع الدمبل',      category: 'wod' },
  { id: 'dumbbell-thruster',    nameEn: 'Dumbbell Thruster',      nameAr: 'ثراستر الدمبل',            category: 'wod' },
  { id: 'dumbbell-power-clean', nameEn: 'Dumbbell Power Clean',   nameAr: 'نظيفة قوية بالدمبل',       category: 'wod' },
  { id: 'dumbbell-push-press',  nameEn: 'Dumbbell Push Press',    nameAr: 'دفع بالساقين بالدمبل',     category: 'wod' },
  { id: 'dumbbell-front-rack-lunge', nameEn: 'DB Front Rack Lunge', nameAr: 'طعنة الرف الأمامي بالدمبل', category: 'wod' },
  { id: 'dumbbell-overhead-lunge', nameEn: 'DB Overhead Lunge',   nameAr: 'طعنة فوق الرأس بالدمبل',   category: 'wod' },
  { id: 'devils-press',         nameEn: "Devil's Press",          nameAr: 'دفعة الشيطان',             category: 'wod' },
  { id: 'farmers-carry',        nameEn: "Farmer's Carry",         nameAr: 'حمل المزارع',              category: 'wod' },
  { id: 'dumbbell-row',         nameEn: 'Dumbbell Row',           nameAr: 'تجديف الدمبل',             category: 'wod' },

  // كيتل بيل إضافي (أوسع من هزة الكيتل بيل وحدها)
  { id: 'kettlebell-clean',        nameEn: 'Kettlebell Clean',       nameAr: 'نظيفة الكيتل بيل',      category: 'wod' },
  { id: 'kettlebell-snatch',       nameEn: 'Kettlebell Snatch',      nameAr: 'خطف الكيتل بيل',        category: 'wod' },
  { id: 'turkish-get-up',          nameEn: 'Turkish Get-Up',         nameAr: 'النهوض التركي',         category: 'wod' },
  { id: 'kettlebell-goblet-squat', nameEn: 'Kettlebell Goblet Squat', nameAr: 'قرفصاء الكأس بالكيتل بيل', category: 'wod' },

  // أجهزة كارديو إضافية
  { id: 'air-bike',   nameEn: 'Air Bike (Echo/Assault)', nameAr: 'دراجة الهواء',    category: 'cardio' },
  { id: 'ski-erg',    nameEn: 'SkiErg',                  nameAr: 'جهاز التزلج',     category: 'cardio' },
  { id: 'shuttle-run', nameEn: 'Shuttle Run',            nameAr: 'الجري المكوكي',   category: 'cardio' },

  // أكسسوار إضافي — يملأ فجوة حقيقية: لا تمرين عزل ذراع أو كتف جانبي كان موجوداً سابقاً إطلاقاً
  { id: 'bicep-curl',       nameEn: 'Dumbbell Bicep Curl',      nameAr: 'ثني العضلة ذات الرأسين',   category: 'wod' },
  { id: 'tricep-extension', nameEn: 'Overhead Tricep Extension', nameAr: 'مد الترايسبس فوق الرأس',  category: 'wod' },
  { id: 'lateral-raise',    nameEn: 'Dumbbell Lateral Raise',   nameAr: 'رفعة جانبية بالدمبل',      category: 'wod' },
  { id: 'face-pull',        nameEn: 'Band Face Pull',           nameAr: 'سحب الوجه بالحزام',        category: 'wod' },
  { id: 'plank',            nameEn: 'Plank Hold',               nameAr: 'ثبات البلانك',             category: 'gymnastics' },
  { id: 'russian-twist',    nameEn: 'Russian Twist',            nameAr: 'الالتواء الروسي',          category: 'wod' },
  { id: 'glute-bridge',     nameEn: 'Glute Bridge',             nameAr: 'جسر المؤخرة',              category: 'gymnastics' },
  { id: 'bulgarian-split-squat', nameEn: 'Bulgarian Split Squat', nameAr: 'قرفصاء بلغاري منقسم',   category: 'wod' },
  { id: 'hip-thrust',       nameEn: 'Barbell Hip Thrust',       nameAr: 'دفعة الورك بالبار',        category: 'strength' },

  // ═══ أكسسوار مُحدَّث (من "الدليل الشامل لتمارين الأكسسوار في CrossFit" الذي زوّدنا به المدرب) —
  // فلسفة هذه الدفعة مختلفة عن الأكسسوار أعلاه: ليست لموازنة نمط معاكس، بل لتعزيز نفس مجموعة
  // عضلات نمط اليوم من زاوية/أداة مختلفة (أحادي الطرف، لامركزي، عزل، ثبات) لضمان تغطية كاملة —
  // راجع PATTERN_ACCESSORY_MAP أدناه لكيفية استخدامها فعلياً لكل نمط ═══
  { id: 'cossack-squat',          nameEn: 'Cossack Squat',            nameAr: 'قرفصاء القوزاق (جانبي)',        category: 'gymnastics' },
  { id: 'reverse-hyperextension', nameEn: 'Reverse Hyperextension',   nameAr: 'التمديد العكسي',                category: 'wod'        },
  { id: 'ghd-hip-extension',      nameEn: 'GHD Hip Extension',        nameAr: 'تمديد الورك على GHD',           category: 'gymnastics' },
  { id: 'hollow-body-hold',       nameEn: 'Hollow Body Hold',         nameAr: 'ثبات الجسم المجوف',             category: 'gymnastics' },
  { id: 'single-leg-rdl',         nameEn: 'Single-Leg RDL',           nameAr: 'رفعة رومانية بساق واحدة',       category: 'wod'        },
  { id: 'nordic-curl',            nameEn: 'Nordic Curl',              nameAr: 'ثني نوردك لأوتار الركبة',       category: 'gymnastics' },
  { id: 'db-z-press',             nameEn: 'DB Z-Press',               nameAr: 'ضغط Z بالدمبل',                 category: 'wod'        },
  { id: 'skull-crusher',          nameEn: 'Skull Crusher',            nameAr: 'سكل كراشر للترايسبس',           category: 'wod'        },
  { id: 'tricep-pushdown',        nameEn: 'Tricep Pushdown',          nameAr: 'دفع الترايسبس بالحزام',         category: 'wod'        },
  { id: 'ytwl',                   nameEn: 'YTWL',                     nameAr: 'حروف YTWL لصحة الكتف',          category: 'gymnastics' },
  { id: 'bent-over-lateral-raise', nameEn: 'Bent-over Lateral Raise', nameAr: 'رفعة جانبية منحنية',            category: 'wod'        },
  { id: 'strict-ring-rows',       nameEn: 'Strict Ring Rows',         nameAr: 'تجديف الحلقات الصارم',          category: 'gymnastics' },
  { id: 'supinated-grip-row',     nameEn: 'Supinated Grip Row',       nameAr: 'تجديف بقبضة مقلوبة',            category: 'wod'        },
  { id: 'dead-hangs',             nameEn: 'Dead Hangs',               nameAr: 'التعليق الميت',                 category: 'gymnastics' },
  { id: 'strict-pull-up-negatives', nameEn: 'Strict Pull-up Negatives', nameAr: 'عقلة سلبية صارمة',            category: 'gymnastics' },
  { id: 'snatch-balance',         nameEn: 'Snatch Balance',           nameAr: 'توازن الخطف',                   category: 'olympic'    },
  { id: 'muscle-snatch',          nameEn: 'Muscle Snatch',            nameAr: 'الخطف العضلي',                  category: 'olympic'    },
  { id: 'tall-snatch',            nameEn: 'Tall Snatch',              nameAr: 'الخطف الطويل',                  category: 'olympic'    },

  // بقية بنود "الدليل الشامل لتمارين الأكسسوار" غير المستخدَمة في PATTERN_ACCESSORY_MAP مباشرة —
  // أُضيفت لاكتمال مكتبة الأكسسوار المرجعية (روابط يوتيوب — راجع scripts/seed-accessory-exercises.ts)
  { id: 'arch-body-hold',         nameEn: 'Arch Body Hold',           nameAr: 'ثبات الجسم المقوّس',            category: 'gymnastics' },
  { id: 'plank-shoulder-taps',    nameEn: 'Plank Shoulder Taps',      nameAr: 'بلانك مع لمس الكتف',            category: 'gymnastics' },
  { id: 'windshield-wiper',       nameEn: 'Windshield Wiper',         nameAr: 'ماسحة الزجاج (بطن)',            category: 'gymnastics' },
  { id: 'deadbug',                nameEn: 'Deadbug',                  nameAr: 'الحشرة الميتة',                 category: 'gymnastics' },
  { id: 'cuban-rotation',         nameEn: 'Cuban Rotation',           nameAr: 'دوران كوبا للكتف',              category: 'wod'        },
  { id: 'scapular-pushup',        nameEn: 'Scapular Push-up',         nameAr: 'ضغط لوح الكتف',                 category: 'gymnastics' },
  { id: 'lateral-band-walk',      nameEn: 'Lateral Band Walk',        nameAr: 'المشي الجانبي بالحزام',         category: 'gymnastics' },
  { id: 'suitcase-carry',         nameEn: 'Suitcase Carry',           nameAr: 'حمل الحقيبة (جانب واحد)',       category: 'wod'        },
  { id: 'plate-pinch',            nameEn: 'Plate Pinch',              nameAr: 'قرص الصفيحة بالأصابع',          category: 'wod'        },
  { id: 'wrist-curls',            nameEn: 'Wrist Curls',              nameAr: 'ثني الرسغ',                     category: 'wod'        },
  { id: 'overhead-squat-pause',   nameEn: 'Overhead Squat (Pause)',   nameAr: 'قرفصاء فوق الرأس مع توقف',      category: 'olympic'    },
  { id: 'pause-front-squat',      nameEn: 'Pause Front Squat',        nameAr: 'قرفصاء أمامية مع توقف',         category: 'olympic'    },
  { id: 'ring-dip-support-hold',  nameEn: 'Ring Dip Support Hold',    nameAr: 'ثبات دعم الحلقات',              category: 'gymnastics' },
  { id: 'false-grip-hangs',       nameEn: 'False Grip Hangs',         nameAr: 'تعليق القبضة الخاطئة',          category: 'gymnastics' },
  { id: 'skin-the-cat',           nameEn: 'Skin-the-Cat',             nameAr: 'سكين-ذا-كات (حلقات)',           category: 'gymnastics' },
  { id: 'lizard-stretch',         nameEn: 'Lizard Stretch',           nameAr: 'إطالة السحلية (الأربية)',       category: 'mobility'   },
  { id: 'kettlebell-halo',        nameEn: 'Kettlebell Halo',          nameAr: 'هالة الكيتل بيل',               category: 'wod'        },

  // ═══ فجوات حركية حقيقية في مكتبة الميتكون — رصدها المدرب عبر مراجعة قائمة حركات ميتكون قياسية
  // في CrossFit ووجد ستّ حركات شائعة غائبة كلياً عن المكتبة (لا معرّف بديل قريب يغطيها) ═══
  { id: 'front-rack-carry',   nameEn: 'Front Rack Carry',   nameAr: 'حمل الصدر (بار أمامي)',       category: 'wod'        },
  { id: 'ring-dip',           nameEn: 'Ring Dip',           nameAr: 'ضغط المتوازي على الحلقات',    category: 'gymnastics' },
  { id: 'bar-dip',            nameEn: 'Bar Dip',            nameAr: 'ضغط المتوازي على البار',      category: 'gymnastics' },
  { id: 'knees-to-elbows',    nameEn: 'Knees to Elbows',    nameAr: 'الركبتين إلى المرفقين',       category: 'gymnastics' },
  { id: 'bike-erg',           nameEn: 'BikeErg',            nameAr: 'دراجة المقاومة (BikeErg)',    category: 'cardio'     },
  { id: 'jump-rope',          nameEn: 'Jump Rope (Single)', nameAr: 'القفز على الحبل (عادي)',      category: 'cardio'     },

  // إطالات مُسمّاة مخصصة لكل نمط (PATTERN_COOLDOWN_MAP) — معرّفات فعلية بدل استخدام تمرين بديل تقني،
  // كل واحدة مربوطة برابط يوتيوب حقيقي في مجموعة exercises (seed-stretch-exercises.ts)
  { id: 'standing-quad-stretch',        nameEn: 'Standing Quad Stretch',        nameAr: 'إطالة الرباعية واقفاً (Standing Quad Stretch)',              category: 'mobility' },
  { id: 'kneeling-hip-flexor-stretch',  nameEn: 'Kneeling Hip Flexor Stretch',  nameAr: 'إطالة الورك القابضة على الركبة (Kneeling Hip Flexor Stretch)', category: 'mobility' },
  { id: 'pigeon-pose-stretch',          nameEn: 'Pigeon Pose',                  nameAr: 'وضعية الحمامة (Pigeon Pose)',                                category: 'mobility' },
  { id: 'couch-stretch',                nameEn: 'Couch Stretch',                nameAr: 'إطالة الكاوتش على الحائط (Couch Stretch)',                   category: 'mobility' },
  { id: 'figure-4-stretch',             nameEn: 'Figure-4 Stretch',             nameAr: 'وضعية الرقم 4 (Figure-4 Stretch)',                           category: 'mobility' },
  { id: 'seated-forward-fold-stretch',  nameEn: 'Seated Forward Fold',          nameAr: 'إطالة أوتار الركبة جلوساً (Seated Forward Fold)',            category: 'mobility' },
  { id: 'childs-pose-stretch',          nameEn: "Child's Pose",                 nameAr: "وضعية الطفل (Child's Pose) لأسفل الظهر",                     category: 'mobility' },
  { id: 'standing-hamstring-stretch',   nameEn: 'Standing Hamstring Stretch',   nameAr: 'إطالة أوتار الركبة واقفاً على درجة (Standing Hamstring Stretch)', category: 'mobility' },
  { id: 'supine-spinal-twist-stretch',  nameEn: 'Supine Spinal Twist',          nameAr: 'الالتواء الفقري المستلقي (Supine Spinal Twist)',             category: 'mobility' },
  { id: 'cat-cow-hold-stretch',         nameEn: 'Cat-Cow Static Hold',          nameAr: 'ثبات القطة-البقرة الساكن (Cat-Cow Slow Static Hold)',        category: 'mobility' },
  { id: 'doorway-chest-stretch',        nameEn: 'Doorway Chest Stretch',        nameAr: 'إطالة الصدر على الحائط (Doorway Chest Stretch)',             category: 'mobility' },
  { id: 'overhead-tricep-stretch',      nameEn: 'Overhead Tricep Stretch',      nameAr: 'إطالة الترايسبس فوق الرأس (Overhead Triceps Stretch)',       category: 'mobility' },
  { id: 'cross-body-shoulder-stretch',  nameEn: 'Cross-Body Shoulder Stretch',  nameAr: 'إطالة الكتف الأمامي بالذراع خلف الظهر (Cross-body Shoulder Stretch)', category: 'mobility' },
  { id: 'puppy-pose-stretch',           nameEn: 'Puppy Pose Stretch',           nameAr: 'وضعية الجرو (Puppy Pose Stretch)',                           category: 'mobility' },
  { id: 'dead-hang-lat-stretch',        nameEn: 'Dead Hang Lat Stretch',        nameAr: 'تعليق ميت سلبي (Dead Hang) لإطالة اللاتس',                   category: 'mobility' },
  { id: 'kneeling-lat-stretch-box',     nameEn: 'Kneeling Lat Stretch (Box)',   nameAr: 'إطالة اللاتس ركوعاً على صندوق (Kneeling Lat Stretch)',       category: 'mobility' },
  { id: 'bicep-forearm-stretch',        nameEn: 'Bicep & Forearm Stretch',      nameAr: 'إطالة البايسبس والساعد بمدّ الذراع (Bicep/Forearm Stretch)', category: 'mobility' },
  { id: 'thread-the-needle-stretch',    nameEn: 'Thread the Needle Stretch',    nameAr: 'خيط الإبرة (Thread the Needle Stretch)',                     category: 'mobility' },
  { id: 'upper-trap-neck-stretch',      nameEn: 'Upper Trap & Neck Stretch',    nameAr: 'إطالة الرقبة والترابيزيوس العلوي (Upper Trap & Neck Stretch)', category: 'mobility' },
  { id: 'deep-squat-hold-stretch',      nameEn: 'Deep Squat Hold',              nameAr: 'جلسة القرفصاء العميقة (Deep Squat Hold)',                    category: 'mobility' },
  { id: 'pvc-overhead-shoulder-stretch', nameEn: 'PVC Overhead Shoulder Stretch', nameAr: 'إطالة الكتف بعصا PVC فوق الرأس',                           category: 'mobility' },
  { id: 'standing-straddle-stretch',    nameEn: 'Standing Straddle Stretch',    nameAr: 'الإطالة الواقفة العريضة (Standing Straddle Stretch)',        category: 'mobility' },
  { id: 'downward-dog-stretch',         nameEn: 'Downward Dog',                 nameAr: 'الكلب الهابط لإطالة الساق (Downward Dog)',                   category: 'mobility' },
  { id: 'ankle-dorsiflexion-stretch',   nameEn: 'Ankle Dorsiflexion Stretch',   nameAr: 'إطالة ظهر القدم مرفوعة (Elevated Ankle Dorsiflexion Stretch)', category: 'mobility' },
];

export function getCalisthenicsExercises(): CFExercise[] {
  return EXERCISES.filter(e =>
    e.category === 'gymnastics' ||
    ['run', 'double-under', 'burpee', 'box-jump'].includes(e.id)
  );
}

// ═══ أنماط الحركة الأساسية وتوافق الأكسسوار/التهدئة ═══

export type MovementPattern = 'squat' | 'hinge' | 'push' | 'pull' | 'olympic';

export const PATTERN_LABELS_AR: Record<MovementPattern, string> = {
  squat: 'القرفصاء (Squat)', hinge: 'الرفعة (Hinge)', push: 'الدفع (Push)', pull: 'السحب (Pull)', olympic: 'الأولمبي (Olympic)',
};

// ═══════════════════════════════════════════════════════════════
// محظورات دمج الحركات (Movement Combination Blacklist)
// راجع docs/movement-blacklist-crossfit.md للتوثيق الكامل والأسباب —
// هذا القسم هو التنفيذ البرمجي الفعلي لقواعد ١ و٣ (تحقق صارم) وقاعدة ٢ (إرشاد + رصد فقط،
// لأن "متغيّر بحمل ثقيل" يعتمد على حقل weight نصّي حر لا يمكن تفسيره برمجياً بثقة كافية للحذف التلقائي)
// ═══════════════════════════════════════════════════════════════

export type MovementFocusClass = 'concentrated' | 'variable' | 'diffuse';

/** تصنيف تركيز كل تمرين — مركّز = يُعامل دائماً كـ"ثقيل"، متغيّر = حسب وصفة الويد، منتشر = مسموح دائماً */
export const EXERCISE_FOCUS_CLASS: Record<string, MovementFocusClass> = {
  'back-squat': 'concentrated', 'front-squat': 'concentrated', 'overhead-squat': 'concentrated',
  'air-squat': 'diffuse', 'pistol-squat': 'concentrated', 'bulgarian-split-squat': 'concentrated',
  'walking-lunge': 'variable', 'dumbbell-front-rack-lunge': 'variable', 'dumbbell-overhead-lunge': 'variable',
  'kettlebell-goblet-squat': 'variable', 'box-jump': 'diffuse', 'box-jump-over': 'diffuse',
  'deadlift': 'concentrated', 'romanian-deadlift': 'concentrated', 'sumo-deadlift': 'concentrated',
  'good-morning': 'concentrated', 'hip-thrust': 'concentrated', 'glute-bridge': 'diffuse',
  'kettle-bell-swing': 'variable',
  'bench-press': 'concentrated', 'push-up': 'diffuse',
  'shoulder-press': 'concentrated', 'push-press': 'concentrated', 'handstand-pushup': 'variable',
  'handstand-walk': 'concentrated', 'wall-walk': 'concentrated', 'lateral-raise': 'concentrated',
  'dumbbell-push-press': 'variable', 'thruster': 'variable', 'dumbbell-thruster': 'variable',
  'bent-over-row': 'concentrated', 'pendlay-row': 'concentrated', 'dumbbell-row': 'concentrated',
  'pull-up': 'diffuse', 'kipping-pull-up': 'diffuse', 'chest-to-bar-pull-up': 'concentrated',
  'rope-climb': 'concentrated', 'face-pull': 'concentrated',
  'farmers-carry': 'concentrated', 'toes-to-bar': 'variable',
  'sit-up': 'diffuse', 'ghd-situp': 'concentrated', 'l-sit': 'concentrated', 'hollow-rock': 'concentrated',
  'plank': 'diffuse', 'russian-twist': 'diffuse',
  'bicep-curl': 'concentrated', 'tricep-extension': 'concentrated',
  'power-clean': 'concentrated', 'clean-and-jerk': 'concentrated', 'snatch': 'concentrated',
  'split-jerk': 'concentrated', 'hang-power-clean': 'concentrated', 'hang-power-snatch': 'concentrated',
  'muscle-up': 'concentrated', 'turkish-get-up': 'concentrated',
  'dumbbell-snatch': 'variable', 'dumbbell-clean-and-jerk': 'variable', 'dumbbell-power-clean': 'variable',
  'kettlebell-clean': 'variable', 'kettlebell-snatch': 'variable',
  'devils-press': 'diffuse', 'burpee': 'diffuse', 'bar-facing-burpee': 'diffuse',
  'double-under': 'diffuse', 'row': 'diffuse', 'run': 'diffuse', 'air-bike': 'diffuse',
  'ski-erg': 'diffuse', 'shuttle-run': 'diffuse', 'wall-ball': 'variable',
  'pvc-pass-through': 'diffuse', 'band-pull-apart': 'diffuse', 'inchworm': 'diffuse',
  'worlds-greatest-stretch': 'diffuse', 'bear-crawl': 'diffuse', 'leg-swing': 'diffuse',
  'scap-pull-up': 'diffuse', 'monster-walk': 'diffuse',

  // أكسسوار الدليل المُحدَّث — راجع تعليق قسمها في EXERCISES أعلاه
  'cossack-squat': 'diffuse', 'reverse-hyperextension': 'diffuse', 'ghd-hip-extension': 'diffuse',
  'hollow-body-hold': 'diffuse', 'single-leg-rdl': 'variable', 'nordic-curl': 'variable',
  'db-z-press': 'concentrated', 'skull-crusher': 'concentrated', 'tricep-pushdown': 'concentrated',
  'ytwl': 'diffuse', 'bent-over-lateral-raise': 'concentrated', 'strict-ring-rows': 'diffuse',
  'supinated-grip-row': 'concentrated', 'dead-hangs': 'diffuse', 'strict-pull-up-negatives': 'diffuse',
  'snatch-balance': 'concentrated', 'muscle-snatch': 'concentrated', 'tall-snatch': 'concentrated',

  // بقية بنود دليل الأكسسوار — راجع تعليق قسمها في EXERCISES أعلاه
  'arch-body-hold': 'diffuse', 'plank-shoulder-taps': 'diffuse', 'windshield-wiper': 'diffuse', 'deadbug': 'diffuse',
  'cuban-rotation': 'concentrated', 'scapular-pushup': 'diffuse', 'lateral-band-walk': 'diffuse',
  'suitcase-carry': 'concentrated', 'plate-pinch': 'concentrated', 'wrist-curls': 'concentrated',
  'overhead-squat-pause': 'concentrated', 'pause-front-squat': 'concentrated',
  'ring-dip-support-hold': 'diffuse', 'false-grip-hangs': 'diffuse', 'skin-the-cat': 'diffuse',
  'kettlebell-halo': 'diffuse',

  // فجوات مكتبة الميتكون — راجع تعليق قسمها في EXERCISES أعلاه
  'front-rack-carry': 'concentrated', 'ring-dip': 'concentrated', 'bar-dip': 'concentrated',
  'knees-to-elbows': 'variable', 'bike-erg': 'diffuse', 'jump-rope': 'diffuse',
};

/** مجموعة التركيز العضلي (١٢ فئة من ملحق الوثيقة) — تحدد "نفس المفصل/السلسلة" بين حركتين */
export type MuscleFocusGroup =
  | 'squat' | 'hinge' | 'chest' | 'overhead-push' | 'back-pull' | 'grip'
  | 'core' | 'arms-isolation' | 'full-body-concentrated' | 'full-body-variable' | 'cardio' | 'warmup-activation';

export const EXERCISE_MUSCLE_GROUP: Record<string, MuscleFocusGroup> = {
  'back-squat':'squat','front-squat':'squat','overhead-squat':'squat','air-squat':'squat','pistol-squat':'squat',
  'bulgarian-split-squat':'squat','walking-lunge':'squat','dumbbell-front-rack-lunge':'squat',
  'dumbbell-overhead-lunge':'squat','kettlebell-goblet-squat':'squat','box-jump':'squat','box-jump-over':'squat',
  'deadlift':'hinge','romanian-deadlift':'hinge','sumo-deadlift':'hinge','good-morning':'hinge',
  'hip-thrust':'hinge','glute-bridge':'hinge','kettle-bell-swing':'hinge',
  'bench-press':'chest','push-up':'chest',
  'shoulder-press':'overhead-push','push-press':'overhead-push','handstand-pushup':'overhead-push',
  'handstand-walk':'overhead-push','wall-walk':'overhead-push','lateral-raise':'overhead-push',
  'dumbbell-push-press':'overhead-push','thruster':'overhead-push','dumbbell-thruster':'overhead-push',
  'bent-over-row':'back-pull','pendlay-row':'back-pull','dumbbell-row':'back-pull','pull-up':'back-pull',
  'kipping-pull-up':'back-pull','chest-to-bar-pull-up':'back-pull','rope-climb':'back-pull','face-pull':'back-pull',
  'farmers-carry':'grip','toes-to-bar':'grip',
  'sit-up':'core','ghd-situp':'core','l-sit':'core','hollow-rock':'core','plank':'core','russian-twist':'core',
  'bicep-curl':'arms-isolation','tricep-extension':'arms-isolation',
  'power-clean':'full-body-concentrated','clean-and-jerk':'full-body-concentrated','snatch':'full-body-concentrated',
  'split-jerk':'full-body-concentrated','hang-power-clean':'full-body-concentrated','hang-power-snatch':'full-body-concentrated',
  'muscle-up':'full-body-concentrated','turkish-get-up':'full-body-concentrated',
  'dumbbell-snatch':'full-body-variable','dumbbell-clean-and-jerk':'full-body-variable',
  'dumbbell-power-clean':'full-body-variable','kettlebell-clean':'full-body-variable','kettlebell-snatch':'full-body-variable',
  'devils-press':'full-body-variable','burpee':'full-body-variable','bar-facing-burpee':'full-body-variable',
  'double-under':'cardio','row':'cardio','run':'cardio','air-bike':'cardio','ski-erg':'cardio',
  'shuttle-run':'cardio','wall-ball':'cardio',
  'pvc-pass-through':'warmup-activation','band-pull-apart':'warmup-activation','inchworm':'warmup-activation',
  'worlds-greatest-stretch':'warmup-activation','bear-crawl':'warmup-activation','leg-swing':'warmup-activation',
  'scap-pull-up':'warmup-activation','monster-walk':'warmup-activation',

  // أكسسوار الدليل المُحدَّث — راجع تعليق قسمها في EXERCISES أعلاه
  'cossack-squat':'squat','reverse-hyperextension':'hinge','ghd-hip-extension':'hinge',
  'hollow-body-hold':'core','single-leg-rdl':'hinge','nordic-curl':'hinge',
  'db-z-press':'overhead-push','skull-crusher':'arms-isolation','tricep-pushdown':'arms-isolation',
  'ytwl':'warmup-activation','bent-over-lateral-raise':'overhead-push','strict-ring-rows':'back-pull',
  'supinated-grip-row':'back-pull','dead-hangs':'grip','strict-pull-up-negatives':'back-pull',
  'snatch-balance':'full-body-concentrated','muscle-snatch':'full-body-concentrated','tall-snatch':'full-body-concentrated',

  // بقية بنود دليل الأكسسوار — راجع تعليق قسمها في EXERCISES أعلاه
  'arch-body-hold':'core','plank-shoulder-taps':'core','windshield-wiper':'core','deadbug':'core',
  'cuban-rotation':'overhead-push','scapular-pushup':'overhead-push','lateral-band-walk':'warmup-activation',
  'suitcase-carry':'grip','plate-pinch':'grip','wrist-curls':'arms-isolation',
  'overhead-squat-pause':'squat','pause-front-squat':'squat',
  'ring-dip-support-hold':'overhead-push','false-grip-hangs':'grip','skin-the-cat':'back-pull',
  'kettlebell-halo':'warmup-activation',

  // فجوات مكتبة الميتكون — راجع تعليق قسمها في EXERCISES أعلاه
  'front-rack-carry':'grip','ring-dip':'chest','bar-dip':'chest',
  'knees-to-elbows':'grip','bike-erg':'cardio','jump-rope':'cardio',
};

/** قاعدة ٣ — أزواج ممنوعة معاً في نفس الميتكون (تكديس مهارة عالية أو قبضة مزدوجة) */
export const RULE3_BANNED_METCON_PAIRS: [string, string][] = [
  ['muscle-up', 'deadlift'],
  ['muscle-up', 'toes-to-bar'],
  ['rope-climb', 'kettle-bell-swing'],
  ['rope-climb', 'farmers-carry'],
  ['chest-to-bar-pull-up', 'toes-to-bar'],
];

type ProgBlock = { format: string; scoreType: string; movements: any[] };

/** يزيل انتهاكات القاعدة ١ (أكثر من تمرين "مركّز" واحد من نفس مجموعة الحركة في بلوكات القوة) — يُبقي أول تمرين ويحذف الباقي */
export function stripRule1Violations(blocks: ProgBlock[]): { blocks: ProgBlock[]; warnings: string[] } {
  const seenGroups = new Set<MuscleFocusGroup>();
  const warnings: string[] = [];
  const newBlocks = blocks
    .map(block => ({
      ...block,
      movements: block.movements.filter((m: any) => {
        if (EXERCISE_FOCUS_CLASS[m.exerciseId] !== 'concentrated') return true;
        const group = EXERCISE_MUSCLE_GROUP[m.exerciseId];
        if (!group) return true;
        if (seenGroups.has(group)) {
          warnings.push(`قاعدة ١ (محظورات دمج الحركات): أُزيل "${m.exerciseId}" من القوة — تكرار تمرين مركّز من مجموعة "${group}"`);
          return false;
        }
        seenGroups.add(group);
        return true;
      }),
    }))
    .filter(b => b.movements.length > 0);
  return { blocks: newBlocks, warnings };
}

/** يزيل انتهاكات القاعدة ٣ (تكديس مهارة عالية/قبضة) من بلوكات الميتكون — يُبقي أول تمرين من كل زوج ممنوع ويحذف الثاني */
export function stripRule3Violations(blocks: ProgBlock[]): { blocks: ProgBlock[]; warnings: string[] } {
  const allIds = blocks.flatMap(b => b.movements.map((m: any) => m.exerciseId));
  const toRemove = new Set<string>();
  const warnings: string[] = [];
  for (const [a, b] of RULE3_BANNED_METCON_PAIRS) {
    if (allIds.includes(a) && allIds.includes(b) && !toRemove.has(a) && !toRemove.has(b)) {
      toRemove.add(b);
      warnings.push(`قاعدة ٣ (محظورات دمج الحركات): أُزيل "${b}" من الميتكون — تكديس مهارة عالية/قبضة مع "${a}"`);
    }
  }
  if (!toRemove.size) return { blocks, warnings: [] };
  const newBlocks = blocks
    .map(block => ({ ...block, movements: block.movements.filter((m: any) => !toRemove.has(m.exerciseId)) }))
    .filter(b => b.movements.length > 0);
  return { blocks: newBlocks, warnings };
}

/** قاعدة ٢ (رصد فقط، لا حذف تلقائي) — يكتشف تكديساً محتملاً بين تمرين قوة "مركّز" وتمرين ميتكون "مركّز" من نفس المجموعة،
 * ليُسجَّل في السجلات للمراجعة. لا يحذف تلقائياً لأن حذف حركة ميتكون بلا بديل مناسب قد يُفرغ الميتكون من محتواه —
 * البديل الآمن هو الإرشاد النصي في البرومت (movementBlacklistGuidance) الذي يوجّه النموذج لاختيار بديل مناسب مسبقاً */
export function detectRule2HeavyOverlap(strengthMovementIds: string[], metconMovementIds: string[]): string[] {
  const heavyGroups = new Set(
    strengthMovementIds
      .filter(id => EXERCISE_FOCUS_CLASS[id] === 'concentrated')
      .map(id => EXERCISE_MUSCLE_GROUP[id])
      .filter(Boolean)
  );
  if (!heavyGroups.size) return [];
  const warnings: string[] = [];
  for (const id of metconMovementIds) {
    if (EXERCISE_FOCUS_CLASS[id] !== 'concentrated') continue;
    const group = EXERCISE_MUSCLE_GROUP[id];
    if (group && heavyGroups.has(group)) {
      warnings.push(`قاعدة ٢ (محظورات دمج الحركات): تنبيه فقط — "${id}" في الميتكون من نفس مجموعة تمرين القوة المركّز (${group})`);
    }
  }
  return warnings;
}

/** نص إرشادي لمحظورات دمج الحركات يُدرج في البرومت — راجع docs/movement-blacklist-crossfit.md للتفاصيل والأسباب الكاملة.
 * pattern اختياري: مرّره عند توليد يوم واحد بنمط معروف مسبقاً (المسار اليومي)؛ اتركه فارغاً في التوليد الأسبوعي
 * حيث يختلف النمط من يوم لآخر — النص عندها يشير إلى "نمط ذلك اليوم" بدل اسم نمط محدد */
export function movementBlacklistGuidance(pattern?: MovementPattern): string {
  const patternRef = pattern ? PATTERN_LABELS_AR[pattern] : 'نمط ذلك اليوم';
  return `⛔ محظورات دمج الحركات (إجبارية — راجع docs/movement-blacklist-crossfit.md):
١) لا تجمع أكثر من تمرين "مركّز" واحد من نفس مجموعة الحركة داخل بلوك القوة (مثال: لا Deadlift + Good Morning معاً، لا Back Squat + Front Squat معاً) — اختر تمريناً أساسياً واحداً فقط مطابقاً لـ${patternRef}.
٢) لا تكدّس حملاً ثقيلاً على نفس المفصل بين القوة والميتكون: إن كان تمرين القوة اليوم "مركّز" (ثقيل بطبيعته دائماً)، لا تضع في الميتكون تمريناً آخر من نفس مجموعة التركيز العضلي يكون أيضاً "مركّز" أو "متغيّر" منفَّذاً بوزن ثقيل — استخدم بدلاً منه تمارين خفيفة/تكييفية أو من مجموعة عضلية مختلفة.
٣) لا تجمع في نفس الميتكون: Muscle-Up + Deadlift ثقيل، أو Muscle-Up Kipping + Toes-to-Bar، أو Rope Climb + KB Swing ثقيل/Farmer's Carry، أو Chest-to-Bar Pull-Up + Toes-to-Bar (تكديس مهارة عالية أو قبضة مزدوجة يرفع خطر الفشل التقني تحت التعب بشكل حاد).`;
}

// ═══════════════════════════════════════════════════════════════
// قاعدة ٤ — دوران نوع التحفيز اليومي عبر الأسبوع (Stimulus Rotation)
// راجع docs/movement-blacklist-crossfit.md قاعدة ٤ للتوثيق الكامل.
//
// تصميم التقاطع مع الأنظمة القائمة (كان غير محدد في الوثيقة، صُمِّم هنا صراحة):
// - محور مستقل تماماً عن نمط الحركة (Squat/Hinge/Push/Pull/Olympic): النمط يحدد "أي حركة قوة"،
//   نوع التحفيز يحدد "طابع الميتكون" (مدة/وتيرة/فئة معدات) فقط — لا تعارض لأن أحدهما لا يُقيّد
//   اختيار حركة القوة والآخر لا يُقيّد اختيار حركة الميتكون بالـ id، فقط خصائصه العامة. الاثنان
//   يُطبَّقان معاً بلا أولوية تفوز على الأخرى لأنهما يحكمان جانبين مختلفين من نفس اليوم.
// - مرحلة دورة التدريج (تأسيس/بناء/ذروة/تفريغ): في أسبوع "تفريغ" تحديداً — حيث القاعدة القائمة
//   أصلاً تمنع أي يوم HEAVY كلياً — يُستبعد نوعا التحفيز الأعلى شدة (القوة الانفجارية والتكييف
//   الثقيل) من دورة ذلك الأسبوع بالكامل، فيبقى فقط التحمل العضلي والمحرك الهوائي يتناوبان.
// - أيام الراحة/البنشمارك/البارتنر/Hyrox/Calisthenics: لا تأخذ نوع تحفيز إطلاقاً (نفس معاملة
//   حقل pattern تماماً) — الدوران يُحسب فقط على أيام الكروسفيت العادية النشطة.
// ═══════════════════════════════════════════════════════════════

export type StimulusType = 'explosive-power' | 'muscular-endurance' | 'aerobic-engine' | 'heavy-conditioning';

export const STIMULUS_LABELS_AR: Record<StimulusType, string> = {
  'explosive-power':    'القوة الانفجارية (Explosive Power)',
  'muscular-endurance': 'التحمل العضلي (Muscular Endurance)',
  'aerobic-engine':      'المحرك الهوائي (Aerobic Engine)',
  'heavy-conditioning':  'التكييف الثقيل (Heavy Conditioning)',
};

const STIMULUS_ROTATION: StimulusType[] = ['explosive-power', 'muscular-endurance', 'aerobic-engine', 'heavy-conditioning'];
const DELOAD_ALLOWED_STIMULI: StimulusType[] = ['muscular-endurance', 'aerobic-engine'];

const STIMULUS_METCON_PROFILE: Record<StimulusType, { durationAr: string; profileAr: string }> = {
  'explosive-power':    { durationAr: 'قصيرة جداً (أقل من ٨ دقائق)', profileAr: 'شدة قصوى وحجم منخفض — تكرارات قليلة من حركات ثقيلة/قفز/أولمبية أو مركّبات قوة قصيرة' },
  'muscular-endurance': { durationAr: 'متوسطة (١٢-١٨ دقيقة)', profileAr: 'تكرارات متوسطة-عالية من حركات جمناستيك/دمبل — إنهاك عضلي موضعي، ليس حملاً قلبياً تنفسياً كعنصر أساسي' },
  'aerobic-engine':      { durationAr: 'طويلة (١٨+ دقيقة أو AMRAP طويل)', profileAr: 'حركات كارديو مونوستركتشورال (جري/تجديف/دراجة هواء/سكي إرغ) كعنصر أساسي في الميتكون، لا ثانوي فقط' },
  'heavy-conditioning':  { durationAr: 'متوسطة (١٠-١٥ دقيقة)', profileAr: 'حمل خارجي متوسط-ثقيل مختلط (بار/دمبل/كيتل بيل) بوتيرة عالية، بلا معدات كارديو أساسية' },
};

/** يقترح نوع التحفيز التالي — نفس منطق suggestPattern (كسر تعادل يدور عبر rotationOffset لمنع احتكار نوع واحد أسبوعياً) */
export function suggestStimulusType(
  avoid?: StimulusType,
  usageCount?: Partial<Record<StimulusType, number>>,
  rotationOffset = 0,
  cyclePhase?: _CyclePhase,
): StimulusType {
  const pool = cyclePhase === 'deload' ? DELOAD_ALLOWED_STIMULI : STIMULUS_ROTATION;
  const n = pool.length;
  const offset = ((rotationOffset % n) + n) % n;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const candidates = rotated.filter(s => s !== avoid);
  const pickFrom = candidates.length ? candidates : rotated;
  const counts = usageCount || {};
  let best = pickFrom[0];
  let bestCount = counts[best] ?? 0;
  for (const s of pickFrom) {
    const c = counts[s] ?? 0;
    if (c < bestCount) { best = s; bestCount = c; }
  }
  return best;
}

/** يبني تسلسل أنواع تحفيز لعدد من الأيام النشطة — بلا تكرار متتالٍ، توزيع عادل، واستبعاد الأنواع الأعلى شدة في أسبوع التفريغ */
export function buildStimulusSequence(activeDaysCount: number, cyclePhase?: _CyclePhase, rotationOffset = 0): StimulusType[] {
  const seq: StimulusType[] = [];
  let last: StimulusType | undefined;
  const usageCount: Partial<Record<StimulusType, number>> = {};
  for (let i = 0; i < activeDaysCount; i++) {
    const next = suggestStimulusType(last, usageCount, rotationOffset, cyclePhase);
    seq.push(next);
    usageCount[next] = (usageCount[next] ?? 0) + 1;
    last = next;
  }
  return seq;
}

/** نص إرشادي لنوع تحفيز اليوم — يُقيّد مدة/وتيرة/فئة معدات الميتكون فقط، لا يُلغي قاعدة توافق الميتكون مع نمط اليوم (يُطبَّقان معاً) */
export function stimulusGuidanceFor(stimulus: StimulusType): string {
  const p = STIMULUS_METCON_PROFILE[stimulus];
  return `🔄 نوع تحفيز اليوم (دوران أسبوعي مستقل عن نمط الحركة — قاعدة ٤ من محظورات دمج الحركات): ${STIMULUS_LABELS_AR[stimulus]}. مدة الميتكون: ${p.durationAr}. طابعه: ${p.profileAr}. هذا يُقيّد مدة/وتيرة/فئة حركات الميتكون فقط — لا يُلغي قاعدة توافق الميتكون مع نمط اليوم؛ اختر حركات تحقق الاثنين معاً.`;
}

// ═══ فلسفة الأكسسوار (مصدرها "الدليل الشامل لتمارين الأكسسوار في CrossFit" الذي زوّدنا به المدرب) —
// الأكسسوار ليس للكمالية ولا لموازنة نمط معاكس، بل تمارين إضافية تستهدف نفس مجموعة العضلات التي
// عملت عليها القوة والميتكون اليوم بالفعل، لكن من زاوية/أداة مختلفة (أحادي الطرف، لامركزي، عزل،
// ثبات ساكن) — الهدف: التأكد أن كل عضلات هذا الجزء بالذات (لا الجزء المعاكس) غُطّيت بالكامل.
// مثال: يوم القرفصاء (ثنائي الطرف، مركّز) → أكسسوار أحادي الطرف (بلغاري/قوزاق) + تمديد ورك خلفي
// لم يعمل بنفس الكثافة + ثبات جذع — كلها أرجل/جذع، لا صدر أو كتف. ═══
export const PATTERN_ACCESSORY_MAP: Record<MovementPattern, { targetsAr: string; suggestedIds: string[]; rationale: string }> = {
  squat:   { targetsAr: 'الأرجل والأرداف من زاوية أحادية الطرف + استقرار الجذع تحت الحمل', suggestedIds: ['bulgarian-split-squat', 'cossack-squat', 'reverse-hyperextension', 'ghd-hip-extension', 'hollow-body-hold'], rationale: 'القرفصاء ثنائي الطرف ومتماثل — الأكسسوار يعزّز نفس عضلات الأرجل/الأرداف بحمل أحادي الطرف (توازن + عضلات ثابتة لم تعمل بنفس الكثافة) ويضيف تمديد ورك خلفي وثبات جذع لم يُستهدفا مباشرة في نمط القرفصاء الأمامي' },
  hinge:   { targetsAr: 'أوتار الركبة والأرداف وأسفل الظهر من زاوية أحادية الطرف ولامركزية + قبضة', suggestedIds: ['single-leg-rdl', 'nordic-curl', 'glute-bridge', 'reverse-hyperextension', 'farmers-carry'], rationale: 'الرفعة الميتة تحميل ثنائي الطرف مركّز — الأكسسوار يعزّز نفس السلسلة الخلفية (أوتار/أرداف/أسفل الظهر) بعمل أحادي الطرف وتوازني (Single-Leg RDL) وانقباض لامركزي بحت (Nordic Curl) لم يعمل عليهما الرفع القياسي، بالإضافة لقبضة الرفعة نفسها بحمل ثابت (Farmer\'s Carry)' },
  push:    { targetsAr: 'الكتف والترايسبس من زاوية عزل واستقرار دوراني', suggestedIds: ['db-z-press', 'skull-crusher', 'tricep-pushdown', 'ytwl', 'bent-over-lateral-raise'], rationale: 'الدفع فوق الرأس يحمّل الدالية الأمامية والترايسبس بحركة مركّبة — الأكسسوار يعزّز نفس منطقة الكتف/الترايسبس بعزل صريح (Z-Press يزيل دفع الأرجل، Skull Crusher يعزل الرأس الطويل) ويضيف الدالية الخلفية ومثبتات الكتف الدورانية (YTWL) التي لا تعمل في الضغط الأمامي البحت — لضمان تغطية كامل مجموعة الكتف لا نصفها الأمامي فقط' },
  pull:    { targetsAr: 'الظهر العريض والبايسبس والقبضة من زاوية وزن الجسم وعزل', suggestedIds: ['strict-ring-rows', 'supinated-grip-row', 'dead-hangs', 'face-pull', 'strict-pull-up-negatives'], rationale: 'السحب الانفجاري/الأفقي بالبار يحمّل الظهر العريض بسرعة — الأكسسوار يعزّز نفس عضلات السحب (لاتس/بايسبس/قبضة) بوزن جسم صريح وإيقاع بطيء (Ring Rows، Negatives) وعزل قبضة ثابت (Dead Hangs)، ويضيف الكتف الخلفي والمعينات (Face Pull) المكمّلة للاتس ضمن نفس "الجزء الخلفي" لا جزء دفع معاكس' },
  olympic: { targetsAr: 'نفس أنماط الحركة الأولمبية (خطف/نظيفة) بتقنية معزولة أبطأ', suggestedIds: ['snatch-balance', 'muscle-snatch', 'tall-snatch', 'overhead-squat', 'front-squat'], rationale: 'الأولمبي انفجاري وسريع بطبيعته — الأكسسوار يعزّز نفس المسار الحركي والعضلات (استقبال الخطف، انفجار الكتفين، ثبات القرفصاء تحت البار) بوتيرة أبطأ وتقنية معزولة (Snatch Balance، Muscle Snatch، Pause) بدل تمارين من مجموعة عضلية مختلفة تماماً' },
};

// ═══ مكتبة الميتكون الخاص بكل نمط — تمنع أن يعاكس الميتكون نمط قوة اليوم بالكامل
// (المشكلة المرصودة فعلياً: يوم دفع كانت قوته دفعاً والميتكون بالكامل تقريباً سحباً) ═══
export const PATTERN_METCON_MAP: Record<MovementPattern, { targetsAr: string; suggestedIds: string[]; rationale: string }> = {
  // ملاحظة: 'burpee' أُضيف لكل الأنماط الخمسة عمداً — حركة جسم كامل محايدة الاتجاه (لا تخدم نمطاً
  // بعينه أكثر من غيره)، شائعة الاستخدام كملء/انتقال في أي ميتكون بغض النظر عن نمط قوة اليوم —
  // كانت غائبة تماماً عن هذا الجدول رغم كونها من أكثر حركات الميتكون شيوعاً في CrossFit فعلياً.
  // اللانجيز بالدمبل (مقدم/فوق الرأس) أُضيفت لنمط القرفصاء تحديداً — حركة أرجل/مؤخرة أحادية الطرف
  // تخدم نفس تركيز النمط، وكانت غائبة عن الميتكون تماماً رغم شيوعها.
  // 'bike-erg' و'jump-rope' أُضيفا لكل الأنماط لنفس منطق burpee (كارديو محايد الاتجاه). حمل الصدر
  // (front-rack-carry) أُضيف لنمط القرفصاء (تحميل أرجل/جذع مشابه)، ضغط المتوازي (ring-dip/bar-dip)
  // لنمط الدفع، والركبتين للمرفقين (knees-to-elbows) لنمط السحب (نفس عائلة toes-to-bar) — راجع
  // فحص المدرب لقائمة حركات ميتكون قياسية وجد هذه الستة غائبة كلياً عن مكتبة التمارين.
  squat:   { targetsAr: 'الأرجل والمؤخرة — نفس تركيز نمط القرفصاء', suggestedIds: ['back-squat', 'front-squat', 'overhead-squat', 'thruster', 'wall-ball', 'air-squat', 'box-jump', 'box-jump-over', 'pistol-squat', 'dumbbell-thruster', 'kettlebell-goblet-squat', 'bulgarian-split-squat', 'dumbbell-front-rack-lunge', 'dumbbell-overhead-lunge', 'front-rack-carry', 'burpee', 'bike-erg', 'jump-rope'], rationale: 'الميتكون يجب أن يواصل استنزاف نفس نمط القوة الرئيسي لليوم لا يعاكسه بالكامل — وإلا فقد اليوم هويته التدريبية رغم اسمه' },
  hinge:   { targetsAr: 'أوتار الركبة وأسفل الظهر والمؤخرة — نفس تركيز نمط الرفعة', suggestedIds: ['deadlift', 'kettle-bell-swing', 'romanian-deadlift', 'sumo-deadlift', 'kettlebell-snatch', 'kettlebell-clean', 'dumbbell-snatch', 'burpee', 'bike-erg', 'jump-rope'], rationale: 'نفس المنطق — نمط الرفعة يحتاج ميتكون يواصل نفس السلسلة الخلفية لا يهملها' },
  push:    { targetsAr: 'الأكتاف والصدر والترايسبس — نفس تركيز نمط الدفع', suggestedIds: ['shoulder-press', 'push-press', 'thruster', 'wall-ball', 'handstand-pushup', 'push-up', 'bench-press', 'dumbbell-push-press', 'devils-press', 'dumbbell-thruster', 'ring-dip', 'bar-dip', 'burpee', 'bike-erg', 'jump-rope'], rationale: 'يوم الدفع قوته دفع — إن كان الميتكون سحباً بالكامل (pull-up/toes-to-bar فقط) يفقد اليوم هويته رغم اسمه، كما رُصد فعلياً سابقاً' },
  pull:    { targetsAr: 'الظهر العريض والبايسبس والقبضة — نفس تركيز نمط السحب', suggestedIds: ['power-clean', 'snatch', 'pull-up', 'kipping-pull-up', 'chest-to-bar-pull-up', 'toes-to-bar', 'knees-to-elbows', 'muscle-up', 'rope-climb', 'row', 'bent-over-row', 'pendlay-row', 'dumbbell-row', 'burpee', 'bike-erg', 'jump-rope'], rationale: 'نفس المنطق — نمط السحب يحتاج ميتكون يواصل نفس مجموعة السحب' },
  olympic: { targetsAr: 'الجسم الكامل بتقنية انفجارية — نفس تركيز النمط الأولمبي', suggestedIds: ['snatch', 'clean-and-jerk', 'power-clean', 'overhead-squat', 'hang-power-clean', 'hang-power-snatch', 'split-jerk', 'dumbbell-snatch', 'dumbbell-clean-and-jerk', 'dumbbell-power-clean', 'burpee', 'bike-erg', 'jump-rope'], rationale: 'نمط الأولمبي تقني بطبيعته — الميتكون يجب أن يحافظ على عنصر تقني ولو خفيف الوزن، لا يتحول لتحمّل بحت' },
};

export interface CooldownStretch { id: string; nameAr: string; }

// كل إطالة الآن exerciseId فعلي (مربوط برابط يوتيوب حقيقي في مجموعة exercises) بدل استخدام
// تمرين بديل تقني غير مطابق — راجع seed-stretch-exercises.ts للروابط الفعلية
export const PATTERN_COOLDOWN_MAP: Record<MovementPattern, { targetsAr: string; stretches: CooldownStretch[]; rationale: string }> = {
  squat:   { targetsAr: 'الرباعية (Quad) + عضلة الورك القابضة (Hip Flexor) + المؤخرة (Glute)',
             stretches: [
               { id: 'standing-quad-stretch',       nameAr: 'إطالة الرباعية واقفاً (Standing Quad Stretch)' },
               { id: 'kneeling-hip-flexor-stretch',  nameAr: 'إطالة الورك القابضة على الركبة (Kneeling Hip Flexor Stretch)' },
               { id: 'pigeon-pose-stretch',          nameAr: 'وضعية الحمامة (Pigeon Pose)' },
               { id: 'couch-stretch',                nameAr: 'إطالة الكاوتش على الحائط (Couch Stretch)' },
               { id: 'figure-4-stretch',             nameAr: 'وضعية الرقم 4 (Figure-4 Stretch)' },
             ],
             rationale: 'القرفصاء يستنزف هذه العضلات مباشرة — الإطالة تسرّع الاسترداد' },
  hinge:   { targetsAr: 'أوتار الركبة (Hamstring) + أسفل الظهر (Low Back) + المؤخرة (Glute)',
             stretches: [
               { id: 'seated-forward-fold-stretch', nameAr: 'إطالة أوتار الركبة جلوساً (Seated Forward Fold)' },
               { id: 'childs-pose-stretch',          nameAr: "وضعية الطفل (Child's Pose) لأسفل الظهر" },
               { id: 'standing-hamstring-stretch',   nameAr: 'إطالة أوتار الركبة واقفاً على درجة (Standing Hamstring Stretch)' },
               { id: 'supine-spinal-twist-stretch',  nameAr: 'الالتواء الفقري المستلقي (Supine Spinal Twist)' },
               { id: 'cat-cow-hold-stretch',         nameAr: 'ثبات القطة-البقرة الساكن (Cat-Cow Slow Static Hold)' },
             ],
             rationale: 'الرفعة الميتة تعتمد كلياً على هذه السلسلة الخلفية' },
  push:    { targetsAr: 'الصدر (Chest) + الكتف الأمامي (Front Delt) + الترايسبس (Triceps)',
             stretches: [
               { id: 'doorway-chest-stretch',       nameAr: 'إطالة الصدر على الحائط (Doorway Chest Stretch)' },
               { id: 'overhead-tricep-stretch',      nameAr: 'إطالة الترايسبس فوق الرأس (Overhead Triceps Stretch)' },
               { id: 'cross-body-shoulder-stretch',  nameAr: 'إطالة الكتف الأمامي بالذراع خلف الظهر (Cross-body Shoulder Stretch)' },
               { id: 'puppy-pose-stretch',           nameAr: 'وضعية الجرو (Puppy Pose Stretch)' },
             ],
             rationale: 'تخفيف التوتر المتراكم من حركات الدفع فوق الرأس والأفقي' },
  pull:    { targetsAr: 'الظهر العريض (Lat) + البايسبس (Bicep) + الكتف الخلفي (Rear Delt)',
             stretches: [
               { id: 'dead-hang-lat-stretch',       nameAr: 'تعليق ميت سلبي (Dead Hang) لإطالة اللاتس' },
               { id: 'kneeling-lat-stretch-box',     nameAr: 'إطالة اللاتس ركوعاً على صندوق (Kneeling Lat Stretch)' },
               { id: 'bicep-forearm-stretch',        nameAr: 'إطالة البايسبس والساعد بمدّ الذراع (Bicep/Forearm Stretch)' },
               { id: 'thread-the-needle-stretch',    nameAr: 'خيط الإبرة (Thread the Needle Stretch)' },
               { id: 'upper-trap-neck-stretch',      nameAr: 'إطالة الرقبة والترابيزيوس العلوي (Upper Trap & Neck Stretch)' },
             ],
             rationale: 'تخفيف توتر السحب المتكرر وحماية المرفق والكتف' },
  olympic: { targetsAr: 'الورك (Hip) + الكاحل (Ankle) + الكتف (Shoulder) — Mobility',
             stretches: [
               { id: 'deep-squat-hold-stretch',         nameAr: 'جلسة القرفصاء العميقة (Deep Squat Hold)' },
               { id: 'pvc-overhead-shoulder-stretch',   nameAr: 'إطالة الكتف بعصا PVC فوق الرأس' },
               { id: 'standing-straddle-stretch',       nameAr: 'الإطالة الواقفة العريضة (Standing Straddle Stretch)' },
               { id: 'downward-dog-stretch',            nameAr: 'الكلب الهابط لإطالة الساق (Downward Dog)' },
               { id: 'ankle-dorsiflexion-stretch',      nameAr: 'إطالة ظهر القدم مرفوعة (Elevated Ankle Dorsiflexion Stretch)' },
             ],
             rationale: 'الحركات الانفجارية تحتاج تحرير مفصلي لا إطالة عضلية عميقة فقط' },
};

// ملاحظة: القرفصاء والرفعة المميتة كانتا تشتركان بنفس المجموعة العريضة سابقاً،
// ما جعل "hinge" لا يُختار عملياً أبداً (القرفصاء يسبقها دوماً في priority القديم)
// رغم أن الرفعة المميتة تُستنزف فيها عضلات مختلفة تماماً (خلفية) عن القرفصاء (أمامية)
const PATTERN_TO_BROAD_GROUP: Record<MovementPattern, string> = {
  squat: 'الأرجل — القرفصاء (Squat)',
  hinge: 'الخلفية — الرفعة المميتة (Hinge)',
  push: 'الكتف/الدفع',
  pull: 'الظهر/السحب',
  olympic: 'الأولمبي/الجسم الكامل',
};

const PATTERN_ROTATION: MovementPattern[] = ['squat', 'pull', 'push', 'hinge', 'olympic'];

/**
 * يقترح نمط القوة التالي بأولوية مزدوجة:
 * 1) المجموعات المُهملة فعلياً في الأسبوع الماضي (كما كان)
 * 2) بين المرشحين المتبقين: الأقل استخداماً هذا الأسبوع تحديداً (usageCount)
 * هذا يمنع هيمنة نمط واحد (القرفصاء/السحب) على حساب بقية الأنماط —
 * الاعتماد القديم على "أول عنصر غير آخر نمط مستخدم" كان يُرجع 'squat' فعلياً
 * في كل مرة تقريباً (لأنه أول عنصر في PATTERN_ROTATION)، فيُحرم push/hinge/olympic
 * من الظهور إلا نادراً جداً.
 *
 * rotationOffset: عند تعادل الاستخدام (كما يحدث دوماً في اليوم السادس من أسبوع 6 أيام نشطة
 * — خمسة أنماط فقط لستة أيام) كان الفائز يُحسم دوماً بموضع النمط في PATTERN_ROTATION الثابت،
 * أي أن "القرفصاء" يفوز بالتكرار الإضافي في كل أسبوع 6 أيام إلى الأبد. rotationOffset
 * (يُفضَّل تمرير cycleIndex الحالي) يُدوِّر ترتيب الفحص نفسه فيتغيّر الفائز بالتعادل من أسبوع لآخر.
 */
export function suggestPattern(
  undertrainedGroups: string[],
  avoid?: MovementPattern,
  usageCount?: Partial<Record<MovementPattern, number>>,
  rotationOffset = 0
): MovementPattern {
  const n = PATTERN_ROTATION.length;
  const offset = ((rotationOffset % n) + n) % n;
  const rotatedOrder = [...PATTERN_ROTATION.slice(offset), ...PATTERN_ROTATION.slice(0, offset)];

  const candidates = rotatedOrder.filter(p => p !== avoid);
  const prioritized = candidates.filter(p => undertrainedGroups.includes(PATTERN_TO_BROAD_GROUP[p]));
  const pool = prioritized.length ? prioritized : candidates;

  const counts = usageCount || {};
  let best = pool[0];
  let bestCount = counts[best] ?? 0;
  for (const p of pool) {
    const c = counts[p] ?? 0;
    if (c < bestCount) { best = p; bestCount = c; }
  }
  return best;
}

/** يبني تسلسل أنماط لعدد من الأيام النشطة (بدون تكرار متتالٍ)، بأولوية للمجموعات المُهملة ثم توزيع عادل بين كل الأنماط الخمسة.
 * rotationOffset (عادة cycleIndex الأسبوع الحالي) يمنع نمطاً واحداً من احتكار "اليوم الإضافي" في كل أسبوع من 6+ أيام نشطة. */
export function buildPatternSequence(activeDaysCount: number, undertrainedGroups: string[], rotationOffset = 0): MovementPattern[] {
  const seq: MovementPattern[] = [];
  let last: MovementPattern | undefined;
  const remaining = [...undertrainedGroups];
  const usageCount: Partial<Record<MovementPattern, number>> = {};
  for (let i = 0; i < activeDaysCount; i++) {
    const next = suggestPattern(remaining, last, usageCount, rotationOffset);
    seq.push(next);
    usageCount[next] = (usageCount[next] ?? 0) + 1;
    const group = PATTERN_TO_BROAD_GROUP[next];
    const idx = remaining.indexOf(group);
    if (idx >= 0) remaining.splice(idx, 1);
    last = next;
  }
  return seq;
}

export const PATTERN_STRENGTH_MAP: Record<MovementPattern, { idsAr: string; note: string }> = {
  squat:   { idsAr: 'back-squat / front-squat / overhead-squat',   note: '' },
  hinge:   { idsAr: 'deadlift / romanian-deadlift / sumo-deadlift / good-morning / hip-thrust', note: 'هذا النمط مختلف تماماً عن السحب (Pull) — يستهدف أوتار الركبة/أسفل الظهر/المؤخرة لا الظهر العريض/البايسبس، فتأكد أن الأكسسوار والتهدئة يعكسان ذلك' },
  push:    { idsAr: 'shoulder-press / push-press / bench-press',   note: '' },
  pull:    { idsAr: 'power-clean أو snatch (سحب انفجاري علوي) — أو bent-over-row/pendlay-row (سحب أفقي بالبار)', note: 'لا تستخدم deadlift كتمرين قوة رئيسي هنا — deadlift ينتمي لنمط "الرفعة" (Hinge) حصراً؛ bent-over-row/pendlay-row بديل ممتاز أخف على الجهاز العصبي من الانفجاري وأكثر تحديداً للظهر العريض؛ الميتكون يمكن أن يستثمر pull-up/toes-to-bar بكثافة' },
  olympic: { idsAr: 'snatch / clean-and-jerk / hang-power-clean / hang-power-snatch / split-jerk بتقنية عالية ووزن معتدل (70-80%)', note: 'التركيز على المسار لا الحمل الأقصى' },
};

// قائمة موحّدة لكل حركات القوة بالبار المسموحة عبر كل الأنماط الخمسة — مصدر واحد للحقيقة
// بدل نسخ نفس القائمة يدوياً في كل من generate/route.ts وgenerate-week/route.ts ولوحة التحكم
export const BARBELL_STRENGTH_IDS = [
  'back-squat', 'front-squat', 'deadlift', 'romanian-deadlift', 'sumo-deadlift',
  'power-clean', 'hang-power-clean', 'clean-and-jerk', 'snatch', 'hang-power-snatch',
  'overhead-squat', 'shoulder-press', 'push-press', 'bench-press', 'split-jerk',
  'bent-over-row', 'pendlay-row', 'good-morning', 'hip-thrust', 'thruster',
];

// ═══ تباعد أيام الثقل — القرفصاء والرفعة هما نمطا القوة "الثقيلان بطبيعتهما" (compound بار مباشر
// بأقرب نسبة لمرجع الذروة)، بعكس الدفع/السحب (أخف عادة) والأولمبي (تقني بوزن معتدل 70-80% بتصميمه أصلاً).
// رُصد فعلياً: يوما قرفصاء ورفعة بفارق يوم نشط واحد فقط (بلا راحة كاملة بينهما) كلاهما RPE 7-8 —
// قد يدخل بعض الأعضاء يوم الثاني بجهاز عصبي لم يتعافَ كلياً من الأول. ═══
export const HEAVY_BY_DEFAULT_PATTERNS: MovementPattern[] = ['squat', 'hinge'];

export function isHeavyByDefaultPattern(pattern: MovementPattern): boolean {
  return HEAVY_BY_DEFAULT_PATTERNS.includes(pattern);
}

/** إرشاد التخفيف عندما يتجاور يوما قرفصاء ورفعة بفارق يوم نشط واحد فقط بلا راحة كاملة بينهما */
export function heavyDaySpacingGuidance(): string {
  return `⚠️ قاعدة شدة إجبارية — تباعد أيام الثقل: القرفصاء (${PATTERN_LABELS_AR.squat}) والرفعة (${PATTERN_LABELS_AR.hinge}) هما نمطا القوة الأثقل بطبيعتهما (أقرب حمل لمرجع مرحلة الدورة). إذا وقع نمطا القرفصاء والرفعة في يومين نشطين يفصل بينهما يوم نشط واحد فقط (بلا يوم راحة كاملة بينهما)، يجب تخفيف شدة الثاني منهما زمنياً إلى MEDIUM صراحة: RPE 6-7 بدل 7-8، وأوزان أقل بـ 5-10% من جدول المرحلة لتمرين القوة في ذلك اليوم تحديداً — واذكر السبب حرفياً في notes (مثال: "خُفِّف الحمل لأن يوم [النمط] الثقيل سبقه بيوم واحد فقط بلا راحة كاملة"). لا يجوز أن يكون يوما القرفصاء والرفعة كلاهما عند ذروة شدة مرحلة الدورة معاً وهما متجاوران بهذا الشكل.`;
}

/** يبني نص إرشادي لتمرين القوة بالبار الصحيح لهذا النمط — يمنع الخلط الشائع بين "الرفعة" (Hinge) و"السحب" (Pull) */
export function strengthGuidanceFor(pattern: MovementPattern): string {
  const s = PATTERN_STRENGTH_MAP[pattern];
  return `تمرين القوة بالبار لهذا النمط: ${s.idsAr}${s.note ? ` — ${s.note}` : ''}`;
}

/** يبني نص إرشادي للأكسسوار — avoidIds تمنع تكرار نفس التمرين المُستخدَم في آخر جلسة/جلسات بنفس النمط حتى يتنوّع الاختيار فعلياً بدل تثبيت خيار واحد دائماً */
export function accessoryGuidanceFor(pattern: MovementPattern, avoidIds: string[] = []): string {
  const a = PATTERN_ACCESSORY_MAP[pattern];
  const pool = a.suggestedIds.filter(id => !avoidIds.includes(id));
  const options = (pool.length ? pool : a.suggestedIds).join(' أو ');
  const avoidNote = avoidIds.length ? ` — لا تستخدم ${avoidIds.join(' أو ')} لأنه استُخدم في آخر جلسة بنفس النمط، نوّع الاختيار` : '';
  return `الأكسسوار يجب أن يستهدف: ${a.targetsAr} (اختر من: ${options}${avoidNote}) — السبب: ${a.rationale}`;
}

/** يبني نص إرشادي للميتكون — يضمن أنه يحتوي حركة واحدة على الأقل من نفس نمط قوة اليوم، لا يعاكسه بالكامل. avoidIds يقلل تكرار حرفي لنفس الحركة الرئيسية من آخر جلسة بنفس النمط */
export function metconGuidanceFor(pattern: MovementPattern, avoidIds: string[] = []): string {
  const m = PATTERN_METCON_MAP[pattern];
  const pool = m.suggestedIds.filter(id => !avoidIds.includes(id));
  const options = (pool.length ? pool : m.suggestedIds).join(' أو ');
  const avoidNote = avoidIds.length ? ` — تجنّب تكرار نفس حركة الميتكون الرئيسية من آخر جلسة بنفس النمط (${avoidIds.join(' أو ')}) قدر الإمكان` : '';
  return `الميتكون يجب أن يتضمن حركة واحدة على الأقل تستهدف: ${m.targetsAr} (اختر من: ${options}${avoidNote}) — السبب: ${m.rationale}`;
}

/** يبني نص إرشادي للتهدئة مع تدوير الإطالات الفعلية (exerciseId مخصص لكل إطالة، لا تمرين بديل) بدل تكرار نفس الصياغة كل يوم بنفس النمط */
export function cooldownGuidanceFor(pattern: MovementPattern, avoidIds: string[] = []): string {
  const c = PATTERN_COOLDOWN_MAP[pattern];
  const pool = c.stretches.filter(s => !avoidIds.includes(s.id));
  const options = (pool.length ? pool : c.stretches).map(s => `${s.id} (${s.nameAr})`).join(' / ');
  return `التهدئة يجب أن تستهدف: ${c.targetsAr} — استخدم exerciseId محدداً (وليس تمريناً بديلاً) من: ${options} — لا تكرر نفس exerciseId المُستخدم في الجلسة الأخيرة بنفس النمط — السبب: ${c.rationale}`;
}

// ═══ مكتبة الإحماء الخاص (Specific Warm-up) لكل نمط — تمنع تكرار نفس التمرين (مثلاً air-squat) في كل يوم قرفصاء ═══
// كل نمط له بدائل صحيحة من قائمة EXERCISES (لا تستخدم أبداً IDs وهمية مثل "pvc-pass-through" غير الموجودة في القائمة —
// أي ID غير صالح يُستبعد بصمت عند التحقق من صحة البيانات، ما يُنتج إحماءً ناقصاً)
export const WARMUP_ACTIVATION_MAP: Record<MovementPattern, { specificIds: string[]; mobilityFocusAr: string; rationale: string }> = {
  squat:   { specificIds: ['air-squat', 'overhead-squat', 'box-jump', 'walking-lunge', 'worlds-greatest-stretch'],
             mobilityFocusAr: 'الكاحل (dorsiflexion) + الورك (hip opener) + الركبة',
             rationale: 'القرفصاء يحتاج مدى حركة كامل في الكاحل والورك — نقص المدى هنا هو غالباً سبب العمق الناقص لا ضعف العضلة' },
  hinge:   { specificIds: ['kettle-bell-swing', 'deadlift', 'good-morning', 'leg-swing'],
             mobilityFocusAr: 'أوتار الركبة + مفصلة الورك (hip hinge pattern) + استقرار أسفل الظهر',
             rationale: 'الرفعة الميتة تتطلب حس مفصلة ورك دقيق قبل التحميل — الإحماء الخاص يبني هذا الحس العصبي-عضلي' },
  push:    { specificIds: ['push-up', 'shoulder-press', 'handstand-walk', 'band-pull-apart'],
             mobilityFocusAr: 'الكتف (shoulder flexion/rotation) + الرسغ + الترايسبس',
             rationale: 'الدفع فوق الرأس يحتاج مدى كتف كامل — تفعيله قبل الحمل يمنع التعويض بأسفل الظهر' },
  pull:    { specificIds: ['row', 'toes-to-bar', 'kipping-pull-up', 'scap-pull-up'],
             mobilityFocusAr: 'الظهر العريض (lat) + القبضة + الكتف الخلفي',
             rationale: 'السحب المتكرر يحتاج تفعيل لاتس وقبضة قبل الحمل حتى لا يتحمل الكتف الأمامي العبء بديلاً عن اللاتس' },
  olympic: { specificIds: ['overhead-squat', 'power-clean', 'snatch', 'pvc-pass-through', 'hang-power-clean'],
             mobilityFocusAr: 'الورك + الكاحل + الكتف فوق الرأس — Mobility شامل',
             rationale: 'الحركات الأولمبية أكثر الأنماط حساسية للمرونة — إحماء مختصر هنا يسبب مساراً خاطئاً للبار أو إصابة لاحقاً' },
};

/** يبني نص إرشادي للمرحلة الخاصة من الإحماء (بعد المرحلة العامة) — avoidIds يمنع تكرار نفس تمرين التفعيل من الجلسة الأخيرة بنفس النمط */
export function warmupGuidanceFor(pattern: MovementPattern, avoidIds: string[] = []): string {
  const w = WARMUP_ACTIVATION_MAP[pattern];
  const pool = w.specificIds.filter(id => !avoidIds.includes(id));
  const options = (pool.length ? pool : w.specificIds).join(' أو ');
  const avoidNote = avoidIds.length ? ` (لا تستخدم ${avoidIds.join(' أو ')} — استُخدم في آخر جلسة بنفس النمط)` : '';
  return `المرحلة الثانية من الإحماء (خاص) يجب أن تُفعّل نمط ${PATTERN_LABELS_AR[pattern]} بدون حمل ثقيل — اختر من: ${options}${avoidNote}. ركّز أيضاً على تحرير: ${w.mobilityFocusAr} واذكر ذلك صراحة في notes — السبب: ${w.rationale}`;
}

// ═══ صيغة البارتنر (Partner WOD) — طبقة إضافية فوق نمط اليوم العادي، لا نمط منفصل ═══
// البارتنر ليس نمط حركة (لا ينافس squat/pull/push/hinge/olympic) بل صيغة جلسة (Format) —
// أي نمط من الخمسة يمكن أن يُبرمَج ثنائياً. القوة تبقى فردية دائماً (كل عضو بمستواه ووزنه) —
// الطابع الثنائي يخص الميتكون بشكل أساسي، مع عنصر ثنائي واحد في الإحماء وواحد في التهدئة
// لضمان جلسة متماسكة من البداية للنهاية لا "ميتكون بارتنر" منعزل داخل يوم فردي بخلاف ذلك.

export type PartnerFormat = 'you_go_i_go' | 'synchro' | 'shared_reps' | 'relay_carry';

export const PARTNER_FORMAT_LABELS_AR: Record<PartnerFormat, string> = {
  you_go_i_go: 'أنت تعمل/أنا أعمل (You Go, I Go)',
  synchro:     'متزامن (Synchro)',
  shared_reps: 'تكرارات مشتركة (Shared Reps)',
  relay_carry: 'تتابع وحمل (Relay & Carry)',
};

export const PARTNER_FORMAT_GUIDANCE: Record<PartnerFormat, string> = {
  you_go_i_go: 'أحد الشريكين يعمل جولة أو محطة كاملة بينما الآخر يستريح تماماً، ثم يتبادلان الأدوار — الأنسب لحركات عالية الشدة أو ثقيلة (Olympic/Heavy) تحتاج راحة كاملة بين المحاولات.',
  synchro:     'كلا الشريكين يعملان في نفس الوقت — إما نفس التكرار جنباً إلى جنب (rep-for-rep)، أو أحدهما يثبّت وضعية (Plank/Wall-sit/Hold) بينما الآخر يعمل ثم يتبادلان دور الثبات — يبني تحمّلاً عضلياً إضافياً أثناء "راحة" الشريك الآخر.',
  shared_reps: 'إجمالي تكرارات واحد للفريق (مثال: 100 Wall Ball) يُقسَّم بين الشريكين بأي طريقة يختارانها — الأنسب لحركات تكرار عالٍ بسيطة التقنية.',
  relay_carry: 'أحد الشريكين يحمل وزناً أو معدات (Farmer Carry / Sandbag) بينما الآخر يؤدي حركة أخرى، ثم يتبادلان — الأنسب لأيام الجسم الكامل وHyrox-style.',
};

/** يختار صيغة البارتنر الأنسب فسيولوجياً لنمط اليوم — لا اختيار عشوائي */
export function suggestPartnerFormat(pattern: MovementPattern): PartnerFormat {
  const map: Record<MovementPattern, PartnerFormat> = {
    hinge: 'you_go_i_go',   // رفعة ميتة/كيتل بيل ثقيل — يحتاج راحة كاملة بين المحاولات
    olympic: 'you_go_i_go', // حركات انفجارية تقنية — التعب يخرّب المسار، راحة كاملة إجبارية
    squat: 'synchro',       // حمل تحمّلي متوسط — يستفيد من عنصر الثبات أثناء راحة الشريك
    push: 'synchro',        // نفس المنطق — دفع متكرر مع ثبات (Plank) يبني جذعاً إضافياً
    pull: 'shared_reps',    // سحب/قبضة — تقسيم حر للتكرارات يريح القبضة دون تعقيد التبديل
  };
  return map[pattern];
}

export function partnerFormatGuidanceFor(format: PartnerFormat): string {
  return `صيغة البارتنر: ${PARTNER_FORMAT_LABELS_AR[format]} — ${PARTNER_FORMAT_GUIDANCE[format]}`;
}

/** إرشاد تماسك الجلسة الثنائية من الإحماء حتى التهدئة — لا تكتفِ بجعل الميتكون فقط بارتنر */
export const PARTNER_SESSION_COHERENCE_GUIDANCE = `
🤝 قاعدة تماسك يوم البارتنر (إجبارية — الجلسة كاملة، لا الميتكون فقط):
- الإحماء: أضف عنصراً ثنائياً واحداً (مثال: partner-assisted mobility، أو تمرين تنشيط بالتناوب بين الشريكين) لبناء التناغم قبل الميتكون المشترك — اذكر "بارتنر" في notes ذلك العنصر تحديداً.
- القوة: تبقى فردية بالكامل (4 مستويات كالمعتاد لكل عضو بوزنه الخاص) — لا تُشارَك، فالتحميل الثقيل الثنائي غير آمن لجمهور مختلط المستوى.
- الميتكون: طبّق صيغة البارتنر المحددة أعلاه حرفياً — اذكر آلية التبديل بوضوح في notes كل حركة، وأضف "(بارتنر)" في reps حيث يلزم لتوضيح أن الرقم إجمالي الفريق لا الفرد.
- الأكسسوار: فردي كالمعتاد (يطبّق قاعدة التوافق العادية لنمط اليوم).
- التهدئة: اجعل تمطيطة واحدة على الأقل partner-assisted (الشريك يساعد في تعميق الإطالة بلطف) — اذكر ذلك في notes.
- العنوان: يجب أن يتضمن "بارتنر" أو "(Partner)" بوضوح.`;

// ═══ تمارين البنشمارك المعروفة (Hero / Girl WODs) ═══

export interface BenchmarkMovement { exerciseId: string; reps: string; distance?: string; notes?: string; }
export interface BenchmarkWod {
  key: string; nameAr: string; nameEn: string; kind: 'hero' | 'girl';
  type: string; duration?: number; rounds: number | null;
  movements: BenchmarkMovement[];
  cooldownTargetsAr: string;
  scalingNote: string;
}

export const BENCHMARKS: Record<string, BenchmarkWod> = {
  fran: {
    key: 'fran', nameAr: 'فران', nameEn: 'Fran', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [
      { exerciseId: 'thruster', reps: '21-15-9', notes: '43كجم Rx رجال، 30كجم نساء' },
      { exerciseId: 'pull-up',  reps: '21-15-9', notes: 'Kipping مسموح' },
    ],
    cooldownTargetsAr: 'الكتف الأمامي + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن فارغ أو 20كجم + Banded Pull-up/Ring Row',
  },
  cindy: {
    key: 'cindy', nameAr: 'سيندي', nameEn: 'Cindy', kind: 'girl', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '5' },
      { exerciseId: 'push-up',  reps: '10' },
      { exerciseId: 'air-squat', reps: '15' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + الرباعية',
    scalingNote: 'مبتدئ: Ring Row بدل العقلة، ضغط على الركبتين',
  },
  grace: {
    key: 'grace', nameAr: 'غريس', nameEn: 'Grace', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [{ exerciseId: 'clean-and-jerk', reps: '30', notes: '61كجم Rx رجال، 43كجم نساء' }],
    cooldownTargetsAr: 'أسفل الظهر + الكتف فوق الرأس + الرسغين',
    scalingNote: 'مبتدئ: بار فارغ 20كجم أو Dumbbell خفيف',
  },
  diane: {
    key: 'diane', nameAr: 'ديان', nameEn: 'Diane', kind: 'girl', type: 'للوقت', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'deadlift',         reps: '21-15-9', notes: '102كجم Rx رجال، 70كجم نساء' },
      { exerciseId: 'handstand-pushup', reps: '21-15-9' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + أوتار الركبة + الكتف',
    scalingNote: 'مبتدئ: وزن معتدل + Pike Push-up بدل HSPU الحر',
  },
  helen: {
    key: 'helen', nameAr: 'هيلين', nameEn: 'Helen', kind: 'girl', type: 'للوقت', duration: 12, rounds: 3,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'kettle-bell-swing', reps: '21', notes: '24كجم رجال، 16كجم نساء' },
      { exerciseId: 'pull-up',           reps: '12' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الكتف الخلفي + قبضة اليد',
    scalingNote: 'مبتدئ: مشي سريع بدل الجري + كيتل بيل أخف',
  },
  annie: {
    key: 'annie', nameAr: 'آني', nameEn: 'Annie', kind: 'girl', type: 'للوقت', duration: 15, rounds: null,
    movements: [
      { exerciseId: 'double-under', reps: '50-40-30-20-10' },
      { exerciseId: 'sit-up',       reps: '50-40-30-20-10' },
    ],
    cooldownTargetsAr: 'الكاحل + الجذع + أسفل الظهر',
    scalingNote: 'مبتدئ: قفز مفرد (Single-under) ×2 بدل المزدوج',
  },
  karen: {
    key: 'karen', nameAr: 'كارين', nameEn: 'Karen', kind: 'girl', type: 'للوقت', duration: 10, rounds: null,
    movements: [{ exerciseId: 'wall-ball', reps: '150', notes: '9كجم لهدف 3م رجال، 6كجم لهدف 2.75م نساء' }],
    cooldownTargetsAr: 'الكتف الأمامي + الرباعية + أسفل الظهر',
    scalingNote: 'مبتدئ: كرة أخف ووزن أقل من 150 تكرار (100 مثلاً)',
  },
  dt: {
    key: 'dt', nameAr: 'دي تي', nameEn: 'DT', kind: 'hero', type: 'للوقت', duration: 12, rounds: 5,
    movements: [
      { exerciseId: 'deadlift',    reps: '12', notes: '70كجم Rx' },
      { exerciseId: 'power-clean', reps: '9',  notes: 'بديل Hang Power Clean — نفس الوزن' },
      { exerciseId: 'push-press',  reps: '6',  notes: 'بديل Push Jerk — نفس الوزن' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف فوق الرأس + الساعد',
    scalingNote: 'مبتدئ: 40-50كجم مع تقنية نظيفة',
  },
  murph: {
    key: 'murph', nameAr: 'مورف', nameEn: 'Murph', kind: 'hero', type: 'للوقت', duration: 45, rounds: null,
    movements: [
      { exerciseId: 'run',      reps: '', distance: '1.6كم', notes: 'ميل واحد' },
      { exerciseId: 'pull-up',  reps: '100' },
      { exerciseId: 'push-up', reps: '200' },
      { exerciseId: 'air-squat', reps: '300' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم', notes: 'ميل واحد' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'يمكن تقسيم التكرارات على طريقة Cindy: 20 جولة من 5 عقلة/10 ضغط/15 قرفصاء بين الجريين — مبتدئ: نصف الكمية (Half Murph)',
  },
  angie: {
    key: 'angie', nameAr: 'آنجي', nameEn: 'Angie', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '100' },
      { exerciseId: 'push-up',  reps: '100' },
      { exerciseId: 'sit-up',   reps: '100' },
      { exerciseId: 'air-squat', reps: '100' },
    ],
    cooldownTargetsAr: 'كامل الجسم — الكتف + الصدر + الجذع + الرباعية',
    scalingNote: 'مبتدئ: 50 تكرار من كل حركة بدل 100',
  },
};

export const BENCHMARK_OPTIONS = Object.values(BENCHMARKS).map(b => ({ key: b.key, label: `${b.nameAr} (${b.nameEn})`, kind: b.kind }));

// دورة التدريج (Periodization) انتقلت إلى lib/periodization.ts لتكون مشتركة بين
// الكروسفت والجيم بدل تكرارها في كل قسم — يُعاد تصديرها هنا للتوافق الخلفي
// مع مسارات الكروسفت التي تستورد هذه الأسماء من هذا الملف
export type { CyclePhase } from './periodization';
export {
  CYCLE_ORDER, CYCLE_PHASE_LABELS_AR, CYCLE_PHASE_INFO,
  computeNextCyclePhase, getRpeGuidance,
} from './periodization';
import type { CyclePhase as _CyclePhase } from './periodization';
import { CYCLE_PHASE_INFO as _CYCLE_PHASE_INFO } from './periodization';

// مرجع الذروة (100%) لكل حركة رئيسية — نفس أرقام الجدول الثابت القديم (مستوى "نخبة")
// حتى تبقى قيم "الذروة" مطابقة لما كان مُستخدَماً سابقاً، مع اشتقاق بقية المستويات والمراحل منها بدل تثبيتها
const PEAK_REFERENCE: Record<string, { nameAr: string; eliteMale: number }> = {
  'back-squat':        { nameAr: 'قرفصاء خلفية', eliteMale: 115 },
  'deadlift':          { nameAr: 'رفعة ميتة',     eliteMale: 150 },
  'clean-and-jerk':    { nameAr: 'نظيفة ودفع',   eliteMale: 100 },
  'snatch':            { nameAr: 'خطف',           eliteMale: 85 },
  'thruster':          { nameAr: 'ثراستر',        eliteMale: 65 },
  'wall-ball':         { nameAr: 'كرة الحائط',    eliteMale: 9 },
  'kettle-bell-swing': { nameAr: 'هزة كيتل بيل',  eliteMale: 32 },
};
// نسب المستويات مشتقة من الجدول الأصلي (Back Squat: مبتدئ 50 / متوسط 75 / متقدم 95 / نخبة 115)
const LEVEL_FACTORS: Record<'beginner' | 'intermediate' | 'advanced' | 'elite', number> = {
  beginner: 50 / 115, intermediate: 75 / 115, advanced: 95 / 115, elite: 1,
};
// نفس معامل الفرق بين الجنسين المستخدم في قسم الجيم (lib/gym) — اتساق عبر المنصة بدل رقم جديد مُخترَع
const FEMALE_FACTOR = 0.65;

/** جدول أوزان مرجعي (رجال/نساء × 4 مستويات) مُدرَّج حسب مرحلة الدورة الحالية — يستبدل الجدول الثابت القديم الذي لم يكن يتغير أبداً بين الأسابيع */
export function getWeightStandardsTable(phase: _CyclePhase): string {
  const mult = _CYCLE_PHASE_INFO[phase].multiplier;
  const roundTo25 = (n: number) => Math.round(n / 2.5) * 2.5;
  const rows = Object.entries(PEAK_REFERENCE).map(([id, ref]) => {
    const cells = (['beginner', 'intermediate', 'advanced', 'elite'] as const).map(lvl => {
      const male = roundTo25(ref.eliteMale * LEVEL_FACTORS[lvl] * mult);
      const female = roundTo25(male * FEMALE_FACTOR);
      return `${lvl}: ${male}كجم♂/${female}كجم♀`;
    });
    return `${ref.nameAr} (${id}): ${cells.join(' | ')}`;
  });
  return rows.join('\n');
}

/** يبني نص إرشادي كامل لبنشمارك محدد يُدرج في البرومت — أو '' إن لم يوجد */
export function getBenchmarkGuidance(key: string): string {
  const b = BENCHMARKS[key];
  if (!b) return '';
  const movesTxt = b.movements.map(m => `- ${m.exerciseId}${m.distance ? ` (${m.distance})` : ''}: ${m.reps} ${m.notes ? `[${m.notes}]` : ''}`).join('\n');
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 اليوم بنشمارك محدد إجباري: ${b.nameAr} (${b.nameEn}) — ${b.kind === 'hero' ? 'Hero WOD' : 'Girl WOD'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
يجب إعادة إنتاج هذا التمرين بالضبط بحركاته وتكراراته الرسمية — لا تخترع نسخة مختلفة:
النوع: ${b.type} | ${b.rounds ? `الجولات: ${b.rounds}` : ''} ${b.duration ? `| تايم كاب/مدة تقديرية: ${b.duration} دقيقة` : ''}
الحركات الرسمية:
${movesTxt}
ملاحظة القياس: ${b.scalingNote}
⚠️ قاعدة خاصة ببنشمارك: هذا اليوم benchmark كامل بذاته — strength = [] فارغ تماماً (لا قوة إضافية قبله)، accessory = [] فارغ تماماً (البنشمارك هو التحفيز الكامل لليوم)
التهدئة يجب أن تستهدف: ${b.cooldownTargetsAr}
العنوان يجب أن يتضمن اسم البنشمارك "${b.nameAr}" بوضوح`;
}

// ═══ ميزانية وقت الحصة الجماعية ═══

export function getClassTimeBudget(classDuration: number): string {
  const table: Record<number, string> = {
    45: 'إحماء 8 دقائق → قوة 10 دقائق (تمرين مركب واحد فقط) → ميتكون 12-15 دقيقة → أكسسوار: تخطاه أو تمرين واحد سريع → تهدئة 5 دقائق. المجموع ≈ 45 دقيقة — الجلسة مضغوطة، لا وقت للفائض',
    60: 'إحماء 10 دقائق → قوة 15 دقيقة (تمرينان compound) → ميتكون 15-20 دقيقة → أكسسوار 8 دقائق (2 تمرين) → تهدئة 7 دقائق. المجموع ≈ 60 دقيقة — الصيغة الكلاسيكية القياسية',
    75: 'إحماء 10 دقائق → قوة 20 دقيقة → ميتكون 18-22 دقيقة → أكسسوار 10 دقائق (2-3 تمارين) → تهدئة 8 دقائق. المجموع ≈ 75 دقيقة',
    90: 'إحماء 12 دقيقة → قوة 25 دقيقة (مساحة لتقنية أولمبية أعمق) → ميتكون 20-25 دقيقة → أكسسوار 12 دقيقة (3 تمارين) → تهدئة 10 دقائق. المجموع ≈ 90 دقيقة — جلسة كاملة بلا استعجال',
  };
  return table[classDuration] || table[60];
}

export function getEquipmentGuidance(note: string): string {
  if (!note?.trim()) return '';
  return `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🛠️ قيد معدات اليوم (التزم به بدقة)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${note.trim()}\nكيّف اختيار التمارين والقوة والميتكون بالكامل حول هذا القيد — لا تضع تمريناً يحتاج معدات غير متاحة.`;
}

export function getRxFocusGuidance(focus: string): string {
  if (focus === 'rx') return 'الجمهور اليوم متمرس نسبياً — اجعل نسخة Advanced/Elite قريبة جداً من الحمل الرسمي RX، ولا تخفف نسخة Intermediate كثيراً.';
  if (focus === 'scaled') return 'غالبية الحضور اليوم مبتدئون — ركّز الشرح والتفصيل على نسخة Beginner/Intermediate بأوزان محافظة وبدائل حركية آمنة (Ring Row بدل عقلة، ضغط على الركبة، KB بدل بار)، ونسخة Advanced/Elite اختيارية فقط لمن يطلبها المدرب.';
  return '';
}
