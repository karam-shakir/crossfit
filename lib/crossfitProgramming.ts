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

  // حركات أضيفت لدعم مكتبة Hero WODs (30 بطل الدفعة التجريبية الأولى)
  { id: 'l-pull-up',              nameEn: 'L Pull-Up',              nameAr: 'عقلة L',                    category: 'gymnastics' },
  { id: 'squat-clean',            nameEn: 'Squat Clean',            nameAr: 'النظيفة القرفصاء',          category: 'olympic'    },
  { id: 'power-snatch',           nameEn: 'Power Snatch',           nameAr: 'الخطف القوي',               category: 'olympic'    },
  { id: 'sumo-deadlift-high-pull', nameEn: 'Sumo Deadlift High-Pull', nameAr: 'رفعة السومو مع سحب عالٍ', category: 'wod'        },
  { id: 'overhead-plate-carry',   nameEn: 'Overhead Plate Carry',   nameAr: 'حمل الصفيحة فوق الرأس',     category: 'wod'        },

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
  { id: 'band-lying-leg-curl',    nameEn: 'Band Lying Leg Curl',      nameAr: 'ثني الرجل الأرضي بالشريط',      category: 'wod'        },
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
  { id: 'reverse-wrist-curls',    nameEn: 'Reverse Wrist Curls',      nameAr: 'مد الرسغ العكسي',               category: 'wod'        },
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

  // إطالات إضافية راجعها المدرب مقابل قائمة إطالات قياسية في CrossFit ووجدها غائبة كلياً
  { id: 'dynamic-butterfly-stretch', nameEn: 'Dynamic Butterfly Stretch', nameAr: 'تمدد الفراشة الديناميكي',        category: 'mobility' },
  { id: 'zombie-kicks-stretch',      nameEn: 'Zombie Kicks',              nameAr: 'ركلات الزومبي (لمس أصابع القدم)', category: 'mobility' },
  { id: 'frog-stretch',              nameEn: 'Frog Stretch',              nameAr: 'تمدد الضفدع',                    category: 'mobility' },
  { id: '90-90-stretch',             nameEn: '90/90 Stretch',             nameAr: 'تمدد 90/90',                     category: 'mobility' },
  { id: 'banded-hamstring-stretch',  nameEn: 'Banded Hamstring Stretch',  nameAr: 'تمدد أوتار الركبة بالشريط',       category: 'mobility' },
  { id: 'wall-calf-stretch',         nameEn: 'Wall Calf Stretch',         nameAr: 'تمدد السمانة على الحائط',        category: 'mobility' },
  { id: 'towel-achilles-stretch',    nameEn: 'Towel Achilles Stretch',    nameAr: 'تمدد وتر أخيل بالمنشفة',         category: 'mobility' },
  { id: 'sphinx-seal-stretch',       nameEn: 'Sphinx / Seal Stretch',     nameAr: 'تمدد أبو الهول / الفقمة',        category: 'mobility' },
  { id: 'pnf-hamstring-stretch',     nameEn: 'PNF Hamstring (Contract-Relax)', nameAr: 'تمدد PNF لأوتار الركبة',    category: 'mobility' },
  { id: 'partner-pnf-hip-stretch',   nameEn: 'Partner PNF Hip Stretch',   nameAr: 'تمدد PNF للورك بالشريك',         category: 'mobility' },

  // ═══ حركات أُضيفت لدعم الدفعة الثانية من مكتبة Hero WODs — فقط ما لا يغطيه معرّف موجود حتى مع notes ═══
  { id: 'bar-muscle-up',     nameEn: 'Bar Muscle-Up',       nameAr: 'الماسل أب على البار',        category: 'gymnastics' },
  { id: 'weighted-pull-up',  nameEn: 'Weighted Pull-Up',    nameAr: 'العقلة المثقلة',             category: 'gymnastics' },
  { id: 'burpee-pull-up',    nameEn: 'Burpee Pull-Up',      nameAr: 'بيربي مع عقلة',              category: 'wod'        },
  { id: 'burpee-box-jump',   nameEn: 'Burpee Box Jump',     nameAr: 'بيربي مع قفز على الصندوق',   category: 'wod'        },
  { id: 'medicine-ball-clean', nameEn: 'Medicine Ball Clean', nameAr: 'نظيفة الكرة الطبية',       category: 'wod'        },
  { id: 'box-step-up',       nameEn: 'Box Step-Up',         nameAr: 'الصعود على الصندوق',         category: 'wod'        },
  { id: 'broad-jump',        nameEn: 'Broad Jump',          nameAr: 'القفزة العريضة',             category: 'wod'        },
  { id: 'weighted-lunge',    nameEn: 'Weighted Lunge',      nameAr: 'الطعنة المثقلة',             category: 'wod'        },
  { id: 'sandbag-carry',     nameEn: 'Sandbag Carry',       nameAr: 'حمل كيس الرمل',              category: 'wod'        },
  { id: 'partner-carry',     nameEn: 'Buddy/Partner Carry', nameAr: 'حمل الشريك',                 category: 'wod'        },
  { id: 'ring-push-up',      nameEn: 'Ring Push-Up',        nameAr: 'الضغط على الحلقات',          category: 'gymnastics' },
  { id: 'triple-under',      nameEn: 'Triple Under',        nameAr: 'القفز الثلاثي',              category: 'cardio'     },
  { id: 'forward-roll',      nameEn: 'Forward Roll',        nameAr: 'الدحرجة الأمامية',           category: 'gymnastics' },
  { id: 'swim',              nameEn: 'Swim',                nameAr: 'السباحة',                    category: 'cardio'     },
];

export function getCalisthenicsExercises(): CFExercise[] {
  return EXERCISES.filter(e =>
    e.category === 'gymnastics' ||
    ['run', 'double-under', 'burpee', 'box-jump'].includes(e.id)
  );
}

// ═══ مكتبات مشتقّة تلقائياً من EXERCISES حسب الفئة — لواجهة الاختيار اليدوي في لوحة التحكم فقط
// (ليست مستخدَمة في توليد الذكاء الاصطناعي، الذي يعتمد القوائم المُقترحة الأضيق أعلاه/أدناه لكل نمط).
// اشتقاقها من الفئة تلقائياً يمنع تكرار مشكلة الأكسسوار (حيث خفيت عشرات التمارين عن التعديل اليدوي
// لأن الواجهة كانت تسحب من قائمة اقتراحات الذكاء الاصطناعي المصغّرة بدل مكتبة القسم الكاملة) —
// أي تمرين جديد يُضاف بالفئة الصحيحة يظهر تلقائياً هنا دون الحاجة لتحديث قائمة يدوياً كل مرة.
export const WARMUP_LIBRARY_IDS: string[] = EXERCISES.filter(e => e.category === 'gymnastics' || e.category === 'cardio').map(e => e.id);
export const METCON_LIBRARY_IDS: string[] = EXERCISES.filter(e => e.category !== 'mobility').map(e => e.id);
export const COOLDOWN_LIBRARY_IDS: string[] = EXERCISES.filter(e => e.category === 'mobility').map(e => e.id);

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
  'hollow-body-hold': 'diffuse', 'single-leg-rdl': 'variable', 'nordic-curl': 'variable', 'band-lying-leg-curl': 'concentrated',
  'db-z-press': 'concentrated', 'skull-crusher': 'concentrated', 'tricep-pushdown': 'concentrated',
  'ytwl': 'diffuse', 'bent-over-lateral-raise': 'concentrated', 'strict-ring-rows': 'diffuse',
  'supinated-grip-row': 'concentrated', 'dead-hangs': 'diffuse', 'strict-pull-up-negatives': 'diffuse',
  'snatch-balance': 'concentrated', 'muscle-snatch': 'concentrated', 'tall-snatch': 'concentrated',

  // بقية بنود دليل الأكسسوار — راجع تعليق قسمها في EXERCISES أعلاه
  'arch-body-hold': 'diffuse', 'plank-shoulder-taps': 'diffuse', 'windshield-wiper': 'diffuse', 'deadbug': 'diffuse',
  'cuban-rotation': 'concentrated', 'scapular-pushup': 'diffuse', 'lateral-band-walk': 'diffuse',
  'suitcase-carry': 'concentrated', 'plate-pinch': 'concentrated', 'wrist-curls': 'concentrated', 'reverse-wrist-curls': 'concentrated',
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
  'hollow-body-hold':'core','single-leg-rdl':'hinge','nordic-curl':'hinge','band-lying-leg-curl':'hinge',
  'db-z-press':'overhead-push','skull-crusher':'arms-isolation','tricep-pushdown':'arms-isolation',
  'ytwl':'warmup-activation','bent-over-lateral-raise':'overhead-push','strict-ring-rows':'back-pull',
  'supinated-grip-row':'back-pull','dead-hangs':'grip','strict-pull-up-negatives':'back-pull',
  'snatch-balance':'full-body-concentrated','muscle-snatch':'full-body-concentrated','tall-snatch':'full-body-concentrated',

  // بقية بنود دليل الأكسسوار — راجع تعليق قسمها في EXERCISES أعلاه
  'arch-body-hold':'core','plank-shoulder-taps':'core','windshield-wiper':'core','deadbug':'core',
  'cuban-rotation':'overhead-push','scapular-pushup':'overhead-push','lateral-band-walk':'warmup-activation',
  'suitcase-carry':'grip','plate-pinch':'grip','wrist-curls':'arms-isolation','reverse-wrist-curls':'arms-isolation',
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

/** يزيل انتهاكات القاعدة ١ (أكثر من تمرين "مركّز" واحد من نفس مجموعة الحركة في بلوكات القوة) — يُبقي أول تمرين ويحذف الباقي.
 * extraFocusClass/extraMuscleGroup: تصنيف تمارين مضافة عبر لوحة التحكم (مؤهَّلة للذكاء الاصطناعي) — تُدمَج فوق المكتبة الأساسية دون تعديلها */
export function stripRule1Violations(
  blocks: ProgBlock[],
  extraFocusClass: Record<string, MovementFocusClass> = {},
  extraMuscleGroup: Record<string, MuscleFocusGroup> = {},
): { blocks: ProgBlock[]; warnings: string[] } {
  const focusClass = { ...EXERCISE_FOCUS_CLASS, ...extraFocusClass };
  const muscleGroup = { ...EXERCISE_MUSCLE_GROUP, ...extraMuscleGroup };
  const seenGroups = new Set<MuscleFocusGroup>();
  const warnings: string[] = [];
  const newBlocks = blocks
    .map(block => ({
      ...block,
      movements: block.movements.filter((m: any) => {
        if (focusClass[m.exerciseId] !== 'concentrated') return true;
        const group = muscleGroup[m.exerciseId];
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
export function detectRule2HeavyOverlap(
  strengthMovementIds: string[],
  metconMovementIds: string[],
  extraFocusClass: Record<string, MovementFocusClass> = {},
  extraMuscleGroup: Record<string, MuscleFocusGroup> = {},
): string[] {
  const focusClass = { ...EXERCISE_FOCUS_CLASS, ...extraFocusClass };
  const muscleGroup = { ...EXERCISE_MUSCLE_GROUP, ...extraMuscleGroup };
  const heavyGroups = new Set(
    strengthMovementIds
      .filter(id => focusClass[id] === 'concentrated')
      .map(id => muscleGroup[id])
      .filter(Boolean)
  );
  if (!heavyGroups.size) return [];
  const warnings: string[] = [];
  for (const id of metconMovementIds) {
    if (focusClass[id] !== 'concentrated') continue;
    const group = muscleGroup[id];
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

// ═══ وصفة الميتكون العلمية (زوّدنا بها المدرب — منهجية CompTrain/PRVN) — المدة الزمنية تحدد
// مسار الطاقة، والذي يحدد بدوره نطاق الحمل ونوع الحركات، لا اجتهاد حر. أعيد ضبط حدود المدة
// والمحتوى هنا حرفياً حسب الوصفة، مع إعادة تعيين ذكية لأنواع StimulusType الأربعة الموجودة أصلاً
// بدل استحداث نظام مواز: ترتيب الشدة القديم (الانفجارية والتكييف الثقيل مُستبعدان في أسبوع
// التفريغ، التحمل العضلي والمحرك الهوائي مسموحان) يطابق تماماً ترتيب الحمل في الوصفة من الأثقل
// للأخف (فوسفاجيني > لاكتيكي > هوائي-لاكتيكي مختلط > هوائي بحت) — فلا حاجة لتغيير منطق التفريغ. ═══
const STIMULUS_METCON_PROFILE: Record<StimulusType, {
  durationAr: string; energySystemAr: string; loadPctAr: string; profileAr: string; breathingAr: string;
}> = {
  'explosive-power': {
    durationAr: 'قصيرة جداً (أقل من ٥ دقائق)',
    energySystemAr: 'فوسفاجيني بحت (Phosphocreatine) — انفجارات قصوى متكررة لا تتجاوز 5-10 ثوانٍ لكل انفجار',
    loadPctAr: 'ثقيل — 60% فأعلى من الحمل الأقصى للحركات المُحمَّلة، أو حركات انفجارية بوزن الجسم (قفزات/سباقات سرعة قصيرة)',
    profileAr: 'حركات انفجارية ثقيلة فقط (قفز، سرعة، أولمبي/قوة بحمل عالٍ) — لا مكان لمعدات كارديو مونوستركتشورال أساسية هنا إطلاقاً',
    breathingAr: 'تنفس 1:1 (شهيق مع الحركة، زفير مع العودة) — اندفاع عصبي كامل',
  },
  'heavy-conditioning': {
    durationAr: 'متوسطة (٥-١٢ دقيقة)',
    energySystemAr: 'لاكتيكي (حامض اللبنيك) — المسار اللاهوائي المُنتِج لإحساس "الحرق" العضلي',
    loadPctAr: 'متوسط — 40-55% من الحمل الأقصى للحركات المُحمَّلة',
    profileAr: 'مزيج حركات متوسطة الوزن (بار/دمبل/كيتل بيل) مع حركات جمناستيك — هذا هو نطاق "المُكيِّف الحقيقي" للياقة',
    breathingAr: 'انتقالي بين 1:1 و2:1 حسب موضع الدقيقة داخل النطاق — كلما اقترب من 12 دقيقة اتجه لـ2:1',
  },
  'muscular-endurance': {
    durationAr: 'طويلة نسبياً (١٢-٢٠ دقيقة)',
    energySystemAr: 'هوائي-لاكتيكي مختلط',
    loadPctAr: 'خفيف — 30-40% من الحمل الأقصى، مع فترات راحة "خفية" مبنية داخل تصميم الحركات نفسها',
    profileAr: 'حركات خفيفة الوزن مدموجة مع آلات كارديو (تجديف/دراجة) — لا تعتمد على الثقل كمصدر شدة',
    breathingAr: '2:1 أو 3:1 (نفسان-ثلاثة داخل الحركة، نفس واحد للخروج) — للحفاظ على ثبات ثاني أكسيد الكربون في الدم',
  },
  'aerobic-engine': {
    durationAr: 'طويلة (٢٠+ دقيقة أو AMRAP طويل)',
    energySystemAr: 'هوائي بحت (Aerobic) — يعتمد كلياً على الأكسجين، لا مسار لاهوائي مساهم فعلياً',
    loadPctAr: 'خفيف جداً — وزن الجسم أو ~20% من الحمل الأقصى، التركيز على الاستمرارية لا الشدة اللحظية',
    profileAr: 'حركات كارديو مونوستركتشورال (جري/تجديف/دراجة هواء/سكي إرغ) كعنصر أساسي في الميتكون، لا ثانوي فقط',
    breathingAr: 'اختبار الجملة الكاملة: يجب أن يقدر اللاعب على نطق جملة كاملة أثناء الأداء — إن لم يستطع، الحمل أثقل من المطلوب ويجب تخفيفه فوراً',
  },
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
  return `🔄 نوع تحفيز اليوم (دوران أسبوعي مستقل عن نمط الحركة — قاعدة ٤ من محظورات دمج الحركات): ${STIMULUS_LABELS_AR[stimulus]}.
مدة الميتكون: ${p.durationAr}. مسار الطاقة: ${p.energySystemAr}.
حمل خارجي: ${p.loadPctAr}.
طابع الحركات: ${p.profileAr}.
إيقاع التنفس: ${p.breathingAr}.
هذا يُقيّد مدة/وتيرة/حمل/فئة حركات الميتكون فقط — لا يُلغي قاعدة توافق الميتكون مع نمط اليوم؛ اختر حركات تحقق الاثنين معاً.`;
}

// ═══ قاعدة المحفزات الأربعة (وصفة الميتكون العلمية — خطوة ٢) — تصنيف حركات الميتكون إلى 4 فئات:
// الدفع العمودي/الأفقي، السحب، الورك/الانفجار (يشمل القرفصاء والرفعة والأولمبي والبيربي — كلها
// حركات هوجمة بالورك)، والمونو (آلات كارديو + حمل ثابت كـ"فاصل"). التمارين غير المصنَّفة هنا
// (أكسسوار عزل، إحماء، تحضير مهارة) تُستبعد ضمنياً من حساب النسب — ليست حركات ميتكون رئيسية أصلاً. ═══
export type MetconStimulusCategory = 'push' | 'pull' | 'hip-explode' | 'mono';

export const METCON_STIMULUS_CATEGORY_LABELS_AR: Record<MetconStimulusCategory, string> = {
  'push': 'الدفع العمودي/الأفقي (Push)',
  'pull': 'السحب (Pull)',
  'hip-explode': 'الورك/الانفجار (Hip/Explode)',
  'mono': 'المونو/الآلة (Mono)',
};

export const METCON_STIMULUS_CATEGORY: Record<string, MetconStimulusCategory> = {
  // الدفع — لا تزيد عن 30% من التكرارات
  'shoulder-press': 'push', 'push-press': 'push', 'thruster': 'push', 'handstand-pushup': 'push',
  'push-up': 'push', 'bench-press': 'push', 'dumbbell-thruster': 'push', 'dumbbell-push-press': 'push',
  'wall-ball': 'push', 'db-z-press': 'push', 'ring-dip': 'push', 'bar-dip': 'push',
  // السحب — لا تزيد عن 30% من التكرارات
  'pull-up': 'pull', 'kipping-pull-up': 'pull', 'chest-to-bar-pull-up': 'pull', 'rope-climb': 'pull',
  'bent-over-row': 'pull', 'pendlay-row': 'pull', 'dumbbell-row': 'pull', 'strict-ring-rows': 'pull',
  'supinated-grip-row': 'pull', 'toes-to-bar': 'pull', 'knees-to-elbows': 'pull', 'muscle-up': 'pull',
  // الورك/الانفجار — لا تزيد عن 40% من التكرارات
  'back-squat': 'hip-explode', 'front-squat': 'hip-explode', 'air-squat': 'hip-explode', 'deadlift': 'hip-explode',
  'power-clean': 'hip-explode', 'clean-and-jerk': 'hip-explode', 'snatch': 'hip-explode', 'overhead-squat': 'hip-explode',
  'box-jump': 'hip-explode', 'burpee': 'hip-explode', 'kettle-bell-swing': 'hip-explode', 'romanian-deadlift': 'hip-explode',
  'sumo-deadlift': 'hip-explode', 'split-jerk': 'hip-explode', 'hang-power-clean': 'hip-explode', 'hang-power-snatch': 'hip-explode',
  'pistol-squat': 'hip-explode', 'bar-facing-burpee': 'hip-explode', 'box-jump-over': 'hip-explode', 'dumbbell-snatch': 'hip-explode',
  'dumbbell-clean-and-jerk': 'hip-explode', 'dumbbell-power-clean': 'hip-explode', 'dumbbell-front-rack-lunge': 'hip-explode',
  'dumbbell-overhead-lunge': 'hip-explode', 'devils-press': 'hip-explode', 'kettlebell-clean': 'hip-explode',
  'kettlebell-snatch': 'hip-explode', 'turkish-get-up': 'hip-explode', 'kettlebell-goblet-squat': 'hip-explode',
  'bulgarian-split-squat': 'hip-explode', 'hip-thrust': 'hip-explode',
  // المونو — فاصل بين المحفزات، لا حركة رئيسية
  'double-under': 'mono', 'row': 'mono', 'run': 'mono', 'air-bike': 'mono', 'ski-erg': 'mono',
  'shuttle-run': 'mono', 'bike-erg': 'mono', 'jump-rope': 'mono', 'farmers-carry': 'mono',
  'front-rack-carry': 'mono', 'suitcase-carry': 'mono',
};

/** نص إرشادي لقاعدة المحفزات الأربعة — يُدرَج مرة واحدة في البرومت (لا يتغيّر حسب النمط أو نوع التحفيز) */
export function metconStimulusMixGuidance(): string {
  return `🧩 قاعدة المحفزات الأربعة (وصفة الميتكون العلمية — خطوة ٢): كل حركة ميتكون رئيسية تنتمي لفئة واحدة من:
- ${METCON_STIMULUS_CATEGORY_LABELS_AR['push']}: مثل Push Press، Handstand Push-up، Thruster — لا تزيد عن 30% من إجمالي التكرارات
- ${METCON_STIMULUS_CATEGORY_LABELS_AR['pull']}: مثل Pull-ups، Rows، Rope Climb — لا تزيد عن 30% من إجمالي التكرارات
- ${METCON_STIMULUS_CATEGORY_LABELS_AR['hip-explode']}: مثل Kettlebell Swing، Box Jump، Burpee، القرفصاء، الرفعة، الأولمبي — لا تزيد عن 40% من إجمالي التكرارات
- ${METCON_STIMULUS_CATEGORY_LABELS_AR['mono']}: آلات كارديو (تجديف/دراجة هواء/سكي إرغ/جري) — تُستخدم كـ"فاصل" بين المحفزات، لا كحركة رئيسية وحيدة للميتكون
اختر **فئتين أو ثلاث فقط** من هذه الأربع لكل ميتكون (لا الأربع معاً — الفئة الرابعة تُنهك الجهاز العصبي المركزي بلا فائدة إضافية). ⛔ ممنوع دمج فئة الدفع مع نفسها في نفس الميتكون (مثال: Thruster + Handstand Push-up ممنوع لأن كلاهما دفع عمودي) — اخلط (دفع+سحب) أو (ورك+مونو) بدلاً من ذلك.`;
}

/** رصد فقط (بلا حذف تلقائي — النسب المئوية للتكرارات تعتمد على حقل reps النصي الحر الذي لا يمكن تفسيره برمجياً بثقة كافية):
 * يكتشف إن كانت كل حركات الميتكون من فئة محفز واحدة فقط (خرق واضح لقاعدة "فئتان أو ثلاث") */
export function detectMetconStimulusImbalance(
  metconMovementIds: string[],
  extraMetconCategory: Record<string, MetconStimulusCategory> = {},
): string[] {
  const metconCategory = { ...METCON_STIMULUS_CATEGORY, ...extraMetconCategory };
  const categories = Array.from(new Set(
    metconMovementIds.map(id => metconCategory[id]).filter((c): c is MetconStimulusCategory => !!c)
  ));
  if (categories.length === 1) {
    const only = categories[0];
    return [`قاعدة المحفزات الأربعة: كل حركات الميتكون من فئة "${METCON_STIMULUS_CATEGORY_LABELS_AR[only]}" فقط — يجب المزج بين فئتين أو ثلاث`];
  }
  if (categories.length >= 4) {
    return [`قاعدة المحفزات الأربعة: الميتكون يخلط الفئات الأربع معاً — اختر فئتين أو ثلاثاً فقط لتجنّب إنهاك الجهاز العصبي المركزي بلا فائدة إضافية`];
  }
  return [];
}

// ═══ قانون التحميل حسب عدد التكرارات (وصفة الميتكون العلمية — خطوة ٣) — الوزن نسبة من 1RM
// اللاعب، تُحدَّد بعدد التكرارات المتوقعة في الجولة الواحدة، لا بمرحلة دورة التدريج وحدها. ═══
export function metconRepLoadGuidance(): string {
  return `🏋️ قانون التحميل حسب التكرارات (وصفة الميتكون العلمية — خطوة ٣، تُطبَّق على حركات الميتكون المُحمَّلة فقط، لا تمارين القوة الرئيسية التي تتبع جدول مرحلة الدورة أعلاه):
- 1-3 تكرارات في الجولة: 80-90% من الحمل الأقصى (ثقيل جداً/انفجاري)
- 5-8 تكرارات: 65-75% (ثقيل يمكن التحكم به)
- 10-15 تكراراً: 50-60% (متوسط — يبدأ الحرق تقريباً في الدقيقة الثالثة)
- 15-20+ تكراراً: 30-45% (خفيف — هوائي/تحمل عضلي)
مثال: سلّم 21-15-9 عدد تكراراته الأعلى (21) يقع في نطاق "15-20+" رغم أن الجولة الأخيرة (9) تقترب من "5-8" — التزم بالنطاق الأثقل للحركة عبر السلّم كاملاً، لا بجولة واحدة فقط. لا تستخدم وزناً ثابتاً بمعزل عن عدد التكرارات المطلوب.`;
}

// ═══ التايم كاب (وصفة الميتكون العلمية — خطوة ٤) — أداة لضبط الكثافة النسبية، لا حداً للفشل ═══
export function metconTimeCapGuidance(): string {
  return `⏳ قاعدة التايم كاب (وصفة الميتكون العلمية — خطوة ٤):
- "AMRAP": التايم كاب هو مدة العمل نفسها (مثال: AMRAP x 12 MIN) — الهدف الحفاظ على إيقاع ثابت، لا إنهاء جولات أكثر بأي ثمن.
- "For Time": التايم كاب يجب أن يكون تقريباً **ضعف** الزمن المتوقع لإنهاء رياضي بمستوى نخبة لهذا الميتكون تحديداً — قدّر زمن النخبة أولاً من حجم وشدة الحركات، ثم اضربه ×2 للتايم كاب. إن كان زمن النخبة المتوقع 6 دقائق مثلاً، التايم كاب 12 دقيقة.`;
}

// ═══ فلسفة الأكسسوار (مصدرها "الدليل الشامل لتمارين الأكسسوار في CrossFit" الذي زوّدنا به المدرب) —
// الأكسسوار ليس للكمالية ولا لموازنة نمط معاكس، بل تمارين إضافية تستهدف نفس مجموعة العضلات التي
// عملت عليها القوة والميتكون اليوم بالفعل، لكن من زاوية/أداة مختلفة (أحادي الطرف، لامركزي، عزل،
// ثبات ساكن) — الهدف: التأكد أن كل عضلات هذا الجزء بالذات (لا الجزء المعاكس) غُطّيت بالكامل.
// مثال: يوم القرفصاء (ثنائي الطرف، مركّز) → أكسسوار أحادي الطرف (بلغاري/قوزاق) + تمديد ورك خلفي
// لم يعمل بنفس الكثافة + ثبات جذع — كلها أرجل/جذع، لا صدر أو كتف. ═══
export const PATTERN_ACCESSORY_MAP: Record<MovementPattern, { targetsAr: string; suggestedIds: string[]; rationale: string }> = {
  squat:   { targetsAr: 'الأرجل والأرداف من زاوية أحادية الطرف + استقرار الجذع تحت الحمل', suggestedIds: ['bulgarian-split-squat', 'cossack-squat', 'reverse-hyperextension', 'ghd-hip-extension', 'hollow-body-hold'], rationale: 'القرفصاء ثنائي الطرف ومتماثل — الأكسسوار يعزّز نفس عضلات الأرجل/الأرداف بحمل أحادي الطرف (توازن + عضلات ثابتة لم تعمل بنفس الكثافة) ويضيف تمديد ورك خلفي وثبات جذع لم يُستهدفا مباشرة في نمط القرفصاء الأمامي' },
  hinge:   { targetsAr: 'أوتار الركبة والأرداف وأسفل الظهر من زاوية أحادية الطرف ولامركزية + قبضة', suggestedIds: ['single-leg-rdl', 'nordic-curl', 'band-lying-leg-curl', 'glute-bridge', 'reverse-hyperextension', 'farmers-carry'], rationale: 'الرفعة الميتة تحميل ثنائي الطرف مركّز — الأكسسوار يعزّز نفس السلسلة الخلفية (أوتار/أرداف/أسفل الظهر) بعمل أحادي الطرف وتوازني (Single-Leg RDL) وانقباض لامركزي بحت (Nordic Curl، Band Lying Leg Curl) لم يعمل عليهما الرفع القياسي، بالإضافة لقبضة الرفعة نفسها بحمل ثابت (Farmer\'s Carry)' },
  push:    { targetsAr: 'الكتف والترايسبس من زاوية عزل واستقرار دوراني', suggestedIds: ['db-z-press', 'skull-crusher', 'tricep-pushdown', 'ytwl', 'bent-over-lateral-raise'], rationale: 'الدفع فوق الرأس يحمّل الدالية الأمامية والترايسبس بحركة مركّبة — الأكسسوار يعزّز نفس منطقة الكتف/الترايسبس بعزل صريح (Z-Press يزيل دفع الأرجل، Skull Crusher يعزل الرأس الطويل) ويضيف الدالية الخلفية ومثبتات الكتف الدورانية (YTWL) التي لا تعمل في الضغط الأمامي البحت — لضمان تغطية كامل مجموعة الكتف لا نصفها الأمامي فقط' },
  pull:    { targetsAr: 'الظهر العريض والبايسبس والقبضة من زاوية وزن الجسم وعزل', suggestedIds: ['strict-ring-rows', 'supinated-grip-row', 'dead-hangs', 'face-pull', 'strict-pull-up-negatives'], rationale: 'السحب الانفجاري/الأفقي بالبار يحمّل الظهر العريض بسرعة — الأكسسوار يعزّز نفس عضلات السحب (لاتس/بايسبس/قبضة) بوزن جسم صريح وإيقاع بطيء (Ring Rows، Negatives) وعزل قبضة ثابت (Dead Hangs)، ويضيف الكتف الخلفي والمعينات (Face Pull) المكمّلة للاتس ضمن نفس "الجزء الخلفي" لا جزء دفع معاكس' },
  olympic: { targetsAr: 'نفس أنماط الحركة الأولمبية (خطف/نظيفة) بتقنية معزولة أبطأ', suggestedIds: ['snatch-balance', 'muscle-snatch', 'tall-snatch', 'overhead-squat', 'front-squat'], rationale: 'الأولمبي انفجاري وسريع بطبيعته — الأكسسوار يعزّز نفس المسار الحركي والعضلات (استقبال الخطف، انفجار الكتفين، ثبات القرفصاء تحت البار) بوتيرة أبطأ وتقنية معزولة (Snatch Balance، Muscle Snatch، Pause) بدل تمارين من مجموعة عضلية مختلفة تماماً' },
};

// ═══ مكتبة الأكسسوار الكاملة — كل تمرين أُضيف عبر دفعات "الدليل الشامل لتمارين الأكسسوار" على
// مدى الجلسة، بصرف النظر عن كونه ضمن الاقتراحات المُختارة لكل نمط في PATTERN_ACCESSORY_MAP أعلاه
// (تلك قائمة مصغّرة (5-6 لكل نمط) مُستخدَمة فقط كتوجيه نصي لتوليد الذكاء الاصطناعي). هذه القائمة
// هي المصدر الوحيد للحقيقة لأي واجهة تحتاج عرض "كل تمارين الأكسسوار المتاحة" (مثال: قائمة الاختيار
// اليدوي في لوحة التحكم عند تعديل قسم الأكسسوار في WOD محفوظ مسبقاً) — كانت تلك الواجهة تستخدم
// suggestedIds المصغّرة خطأً فتُخفي عشرات التمارين الفعلية عن المدرب عند التعديل اليدوي.
export const ACCESSORY_LIBRARY_IDS: string[] = [
  'bicep-curl', 'tricep-extension', 'lateral-raise', 'face-pull', 'plank', 'russian-twist',
  'glute-bridge', 'bulgarian-split-squat', 'hip-thrust', 'farmers-carry',
  'cossack-squat', 'reverse-hyperextension', 'ghd-hip-extension', 'hollow-body-hold',
  'single-leg-rdl', 'nordic-curl', 'band-lying-leg-curl', 'db-z-press', 'skull-crusher',
  'tricep-pushdown', 'ytwl', 'bent-over-lateral-raise', 'strict-ring-rows', 'supinated-grip-row',
  'dead-hangs', 'strict-pull-up-negatives', 'snatch-balance', 'muscle-snatch', 'tall-snatch',
  'arch-body-hold', 'plank-shoulder-taps', 'windshield-wiper', 'deadbug', 'cuban-rotation',
  'scapular-pushup', 'lateral-band-walk', 'suitcase-carry', 'plate-pinch', 'wrist-curls',
  'reverse-wrist-curls', 'overhead-squat-pause', 'pause-front-squat', 'ring-dip-support-hold',
  'false-grip-hangs', 'skin-the-cat', 'kettlebell-halo',
];

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

  // ═══ دفعة أولى (٣٧ بطل) من مكتبة الـHero WODs — حركات وأوزان فقط، بدون قصة البطل ═══
  jt: {
    key: 'jt', nameAr: 'جي تي', nameEn: 'JT', kind: 'hero', type: 'للوقت', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '21-15-9' },
      { exerciseId: 'ring-dip',         reps: '21-15-9' },
      { exerciseId: 'push-up',          reps: '21-15-9' },
    ],
    cooldownTargetsAr: 'الكتف + الترايسبس + الصدر',
    scalingNote: 'مبتدئ: Ring Row/Pike Push-up بدل الحركات الحرة',
  },
  michael: {
    key: 'michael', nameAr: 'مايكل', nameEn: 'Michael', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '800م' },
      { exerciseId: 'ghd-hip-extension', reps: '50', notes: 'بديل Back Extension' },
      { exerciseId: 'sit-up',            reps: '50' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + أوتار الركبة + الجذع',
    scalingNote: 'مبتدئ: 25 تكرار من كل حركة بدل 50',
  },
  daniel: {
    key: 'daniel', nameAr: 'دانيال', nameEn: 'Daniel', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',  reps: '50' },
      { exerciseId: 'run',      reps: '', distance: '400م' },
      { exerciseId: 'thruster', reps: '21', notes: '43كجم Rx' },
      { exerciseId: 'run',      reps: '', distance: '800م' },
      { exerciseId: 'thruster', reps: '21' },
      { exerciseId: 'run',      reps: '', distance: '400م' },
      { exerciseId: 'pull-up',  reps: '50' },
    ],
    cooldownTargetsAr: 'الكتف الأمامي + الرباعية + قبضة اليد',
    scalingNote: 'مبتدئ: نصف الوزن + Ring Row بدل جزء من العقلة',
  },
  josh: {
    key: 'josh', nameAr: 'جوش', nameEn: 'Josh', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'overhead-squat', reps: '21', notes: '43كجم Rx' },
      { exerciseId: 'pull-up',        reps: '42' },
      { exerciseId: 'overhead-squat', reps: '15' },
      { exerciseId: 'pull-up',        reps: '30' },
      { exerciseId: 'overhead-squat', reps: '9' },
      { exerciseId: 'pull-up',        reps: '18' },
    ],
    cooldownTargetsAr: 'الورك + الكتف فوق الرأس + الرباعية',
    scalingNote: 'مبتدئ: بار فارغ + تقليل تكرار العقلة للنصف',
  },
  jason: {
    key: 'jason', nameAr: 'جيسون', nameEn: 'Jason', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'air-squat', reps: '100' },
      { exerciseId: 'muscle-up', reps: '5' },
      { exerciseId: 'air-squat', reps: '75' },
      { exerciseId: 'muscle-up', reps: '10' },
      { exerciseId: 'air-squat', reps: '50' },
      { exerciseId: 'muscle-up', reps: '15' },
      { exerciseId: 'air-squat', reps: '25' },
      { exerciseId: 'muscle-up', reps: '20' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الصدر',
    scalingNote: 'مبتدئ: Ring Dip + Pull-up منفصلين بدل الماسل أب',
  },
  badger: {
    key: 'badger', nameAr: 'بادجر', nameEn: 'Badger', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'squat-clean', reps: '30', notes: '43كجم Rx' },
      { exerciseId: 'pull-up',     reps: '30' },
      { exerciseId: 'run',         reps: '', distance: '800م' },
    ],
    cooldownTargetsAr: 'الورك + أسفل الظهر + قبضة اليد',
    scalingNote: 'مبتدئ: وزن خفيف + Ring Row بدل العقلة',
  },
  joshie: {
    key: 'joshie', nameAr: 'جوشي', nameEn: 'Joshie', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'dumbbell-snatch', reps: '21', notes: 'يد يمنى، 18كجم Rx' },
      { exerciseId: 'l-pull-up',       reps: '21' },
      { exerciseId: 'dumbbell-snatch', reps: '21', notes: 'يد يسرى' },
      { exerciseId: 'l-pull-up',       reps: '21' },
    ],
    cooldownTargetsAr: 'الكتف + قبضة اليد + الجذع',
    scalingNote: 'مبتدئ: دمبل أخف + عقلة عادية بدل L-Pull-up',
  },
  nate: {
    key: 'nate', nameAr: 'نيت', nameEn: 'Nate', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'muscle-up',         reps: '2' },
      { exerciseId: 'handstand-pushup',  reps: '4' },
      { exerciseId: 'kettle-bell-swing', reps: '8', notes: '2 بود/24كجم' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + الظهر العريض',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up بدل الماسل أب + Pike Push-up بدل HSPU',
  },
  randy: {
    key: 'randy', nameAr: 'راندي', nameEn: 'Randy', kind: 'hero', type: 'للوقت', duration: 10, rounds: null,
    movements: [{ exerciseId: 'power-snatch', reps: '75', notes: '34كجم Rx رجال، 25كجم نساء' }],
    cooldownTargetsAr: 'أسفل الظهر + الكتف فوق الرأس',
    scalingNote: 'مبتدئ: بار فارغ أو دمبل خفيف',
  },
  'tommy-v': {
    key: 'tommy-v', nameAr: 'تومي في', nameEn: 'Tommy V', kind: 'hero', type: 'للوقت', duration: 15, rounds: null,
    movements: [
      { exerciseId: 'thruster',    reps: '21', notes: '52كجم Rx' },
      { exerciseId: 'rope-climb',  reps: '12' },
      { exerciseId: 'thruster',    reps: '15' },
      { exerciseId: 'rope-climb',  reps: '9' },
      { exerciseId: 'thruster',    reps: '9' },
      { exerciseId: 'rope-climb',  reps: '6' },
    ],
    cooldownTargetsAr: 'الكتف + قبضة اليد + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull بدل التسلق الكامل',
  },
  griff: {
    key: 'griff', nameAr: 'غريف', nameEn: 'Griff', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'run', reps: '', distance: '800م' },
      { exerciseId: 'run', reps: '', distance: '400م', notes: 'جري للخلف' },
      { exerciseId: 'run', reps: '', distance: '800م' },
      { exerciseId: 'run', reps: '', distance: '400م', notes: 'جري للخلف' },
    ],
    cooldownTargetsAr: 'الكاحل + ربلة الساق + الورك',
    scalingNote: 'مبتدئ: مشي سريع بدل الجري للخلف',
  },
  ryan: {
    key: 'ryan', nameAr: 'رايان', nameEn: 'Ryan', kind: 'hero', type: 'للوقت', duration: 15, rounds: 5,
    movements: [
      { exerciseId: 'muscle-up', reps: '7' },
      { exerciseId: 'burpee',    reps: '21', notes: 'قفزة 30سم فوق أقصى مدى' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + الرباعية',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up بدل الماسل أب + بيربي عادي',
  },
  erin: {
    key: 'erin', nameAr: 'إيرين', nameEn: 'Erin', kind: 'hero', type: 'للوقت', duration: 20, rounds: 5,
    movements: [
      { exerciseId: 'dumbbell-power-clean', reps: '15', notes: 'Split Clean بدمبل 18كجم' },
      { exerciseId: 'pull-up',              reps: '21' },
    ],
    cooldownTargetsAr: 'الورك + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: دمبل أخف + Ring Row بدل العقلة',
  },
  danny: {
    key: 'danny', nameAr: 'داني', nameEn: 'Danny', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'box-jump',   reps: '30', notes: '60سم' },
      { exerciseId: 'push-press', reps: '20', notes: '52كجم Rx' },
      { exerciseId: 'pull-up',    reps: '30' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: صندوق أقل + وزن أخف + Ring Row',
  },
  hansen: {
    key: 'hansen', nameAr: 'هانسن', nameEn: 'Hansen', kind: 'hero', type: 'للوقت', duration: 20, rounds: 5,
    movements: [
      { exerciseId: 'kettle-bell-swing', reps: '30', notes: '24كجم Rx' },
      { exerciseId: 'burpee',            reps: '30' },
      { exerciseId: 'ghd-situp',         reps: '30', notes: 'Glute-Ham Sit-up' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الجذع + الكتف',
    scalingNote: 'مبتدئ: كيتل بيل أخف + Sit-up عادي بدل GHD',
  },
  tyler: {
    key: 'tyler', nameAr: 'تايلر', nameEn: 'Tyler', kind: 'hero', type: 'للوقت', duration: 15, rounds: 5,
    movements: [
      { exerciseId: 'muscle-up',                 reps: '7' },
      { exerciseId: 'sumo-deadlift-high-pull',   reps: '21', notes: '43كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + أسفل الظهر + قبضة اليد',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up بدل الماسل أب + وزن أخف',
  },
  garrett: {
    key: 'garrett', nameAr: 'غاريت', nameEn: 'Garrett', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'air-squat',        reps: '75' },
      { exerciseId: 'handstand-pushup', reps: '25', notes: 'على الحلقات' },
      { exerciseId: 'l-pull-up',        reps: '25' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + قبضة اليد',
    scalingNote: 'مبتدئ: Pike Push-up + عقلة عادية بدل L-Pull-up',
  },
  'war-frank': {
    key: 'war-frank', nameAr: 'وور فرانك', nameEn: 'War Frank', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'muscle-up', reps: '25' },
      { exerciseId: 'air-squat', reps: '100' },
      { exerciseId: 'ghd-situp', reps: '35' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الجذع',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up بدل الماسل أب + Sit-up عادي بدل GHD',
  },
  mcghee: {
    key: 'mcghee', nameAr: 'مكغي', nameEn: 'McGhee', kind: 'hero', type: 'AMRAP', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'deadlift', reps: '5', notes: '125كجم Rx' },
      { exerciseId: 'push-up',  reps: '13' },
      { exerciseId: 'box-jump', reps: '9', notes: '60سم' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الصدر + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + صندوق أقل',
  },
  paul: {
    key: 'paul', nameAr: 'بول', nameEn: 'Paul', kind: 'hero', type: 'للوقت', duration: 20, rounds: 5,
    movements: [
      { exerciseId: 'double-under',        reps: '50' },
      { exerciseId: 'knees-to-elbows',     reps: '35' },
      { exerciseId: 'overhead-plate-carry', reps: '', distance: '18م', notes: '84كجم Rx' },
    ],
    cooldownTargetsAr: 'الجذع + الكتف فوق الرأس + الكاحل',
    scalingNote: 'مبتدئ: قفز مفرد ×2 بدل المزدوج + وزن أخف للحمل',
  },
  jerry: {
    key: 'jerry', nameAr: 'جيري', nameEn: 'Jerry', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'run', reps: '', distance: '1.6كم' },
      { exerciseId: 'row', reps: '', distance: '2000م' },
      { exerciseId: 'run', reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: تقليل المسافات للنصف',
  },
  nutts: {
    key: 'nutts', nameAr: 'ناتس', nameEn: 'Nutts', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '10' },
      { exerciseId: 'deadlift',         reps: '15', notes: '113كجم Rx' },
      { exerciseId: 'box-jump',         reps: '25', notes: '75سم' },
      { exerciseId: 'pull-up',          reps: '50' },
      { exerciseId: 'wall-ball',        reps: '100', notes: '9كجم لهدف 3م' },
      { exerciseId: 'double-under',     reps: '200' },
      { exerciseId: 'run',              reps: '', distance: '400م', notes: 'مع حمل صفيحة 20كجم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + ظهر + رباعية',
    scalingNote: 'مبتدئ: تقليل كل التكرارات للنصف',
  },
  arnie: {
    key: 'arnie', nameAr: 'آرني', nameEn: 'Arnie', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'turkish-get-up',    reps: '21', notes: 'يد يمنى، كيتل بيل 24كجم' },
      { exerciseId: 'kettle-bell-swing', reps: '50' },
      { exerciseId: 'overhead-squat',    reps: '21', notes: 'كيتل بيل يد يسرى' },
      { exerciseId: 'kettle-bell-swing', reps: '50' },
      { exerciseId: 'overhead-squat',    reps: '21', notes: 'كيتل بيل يد يمنى' },
      { exerciseId: 'kettle-bell-swing', reps: '50' },
      { exerciseId: 'turkish-get-up',    reps: '21', notes: 'يد يسرى' },
    ],
    cooldownTargetsAr: 'الكتف + الجذع + الورك',
    scalingNote: 'مبتدئ: كيتل بيل أخف',
  },
  'the-seven': {
    key: 'the-seven', nameAr: 'السبعة', nameEn: 'The Seven', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'handstand-pushup',  reps: '7' },
      { exerciseId: 'thruster',          reps: '7', notes: '61كجم Rx' },
      { exerciseId: 'knees-to-elbows',   reps: '7' },
      { exerciseId: 'deadlift',          reps: '7', notes: '111كجم Rx' },
      { exerciseId: 'burpee',            reps: '7' },
      { exerciseId: 'kettle-bell-swing', reps: '7', notes: '2 بود/32كجم' },
      { exerciseId: 'pull-up',           reps: '7' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف + جولات أقل (5 بدل 7)',
  },
  rj: {
    key: 'rj', nameAr: 'آر جي', nameEn: 'RJ', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '800م' },
      { exerciseId: 'rope-climb', reps: '5' },
      { exerciseId: 'push-up',    reps: '50' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الكتف + الصدر',
    scalingNote: 'مبتدئ: Rope Pull بدل التسلق الكامل + تقليل الضغط',
  },
  johnson: {
    key: 'johnson', nameAr: 'جونسون', nameEn: 'Johnson', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'deadlift',     reps: '9', notes: '111كجم Rx' },
      { exerciseId: 'muscle-up',    reps: '8' },
      { exerciseId: 'squat-clean',  reps: '9', notes: '70كجم Rx' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + الورك',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Dip+Pull-up بدل الماسل أب',
  },
  roy: {
    key: 'roy', nameAr: 'روي', nameEn: 'Roy', kind: 'hero', type: 'للوقت', duration: 20, rounds: 5,
    movements: [
      { exerciseId: 'deadlift', reps: '15', notes: '102كجم Rx' },
      { exerciseId: 'box-jump', reps: '20', notes: '60سم' },
      { exerciseId: 'pull-up',  reps: '25' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + صندوق أقل',
  },
  adambrown: {
    key: 'adambrown', nameAr: 'آدم براون', nameEn: 'Adambrown', kind: 'hero', type: 'للوقت', duration: 25, rounds: 2,
    movements: [
      { exerciseId: 'deadlift',     reps: '24', notes: '134كجم Rx' },
      { exerciseId: 'box-jump',     reps: '24', notes: '60سم' },
      { exerciseId: 'wall-ball',    reps: '24', notes: '9كجم' },
      { exerciseId: 'bench-press',  reps: '24', notes: '88كجم Rx' },
      { exerciseId: 'box-jump',     reps: '24' },
      { exerciseId: 'wall-ball',    reps: '24' },
      { exerciseId: 'squat-clean',  reps: '24', notes: '66كجم Rx' },
    ],
    cooldownTargetsAr: 'كامل الجسم — صدر + ظهر + أرجل',
    scalingNote: 'مبتدئ: تقليل الأوزان تقريباً للنصف',
  },
  severin: {
    key: 'severin', nameAr: 'سيفرين', nameEn: 'Severin', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'pull-up',  reps: '50', notes: 'Strict بدون كيبينج' },
      { exerciseId: 'push-up',  reps: '100', notes: 'Hand-Release' },
      { exerciseId: 'run',      reps: '', distance: '5كم' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: تقليل التكرار للنصف + تقليل المسافة إلى 2.5كم',
  },
  helton: {
    key: 'helton', nameAr: 'هيلتون', nameEn: 'Helton', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'run',                  reps: '', distance: '800م' },
      { exerciseId: 'dumbbell-power-clean', reps: '30', notes: 'Squat Clean بدمبل 22كجم' },
      { exerciseId: 'burpee',               reps: '30' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: دمبل أخف + تقليل تكرار البيربي',
  },
  jack: {
    key: 'jack', nameAr: 'جاك', nameEn: 'Jack', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'push-press',        reps: '10', notes: '52كجم Rx' },
      { exerciseId: 'kettle-bell-swing', reps: '10', notes: '1.5 بود/24كجم' },
      { exerciseId: 'box-jump',          reps: '10', notes: '60سم' },
    ],
    cooldownTargetsAr: 'الكتف + الورك + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + صندوق أقل',
  },
  bull: {
    key: 'bull', nameAr: 'بُل', nameEn: 'Bull', kind: 'hero', type: 'للوقت', duration: 35, rounds: 2,
    movements: [
      { exerciseId: 'double-under',     reps: '200' },
      { exerciseId: 'overhead-squat',   reps: '50', notes: '61كجم Rx' },
      { exerciseId: 'pull-up',          reps: '50' },
      { exerciseId: 'run',              reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'الكتف فوق الرأس + الظهر العريض + الكاحل',
    scalingNote: 'مبتدئ: قفز مفرد + وزن أخف + تقليل تكرار العقلة',
  },
  whitten: {
    key: 'whitten', nameAr: 'ويتن', nameEn: 'Whitten', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'kettle-bell-swing', reps: '22', notes: '2 بود/32كجم' },
      { exerciseId: 'box-jump',          reps: '22', notes: '60سم' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'burpee',            reps: '22' },
      { exerciseId: 'wall-ball',         reps: '22', notes: '9كجم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + ظهر + رباعية',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل التكرار',
  },
  wittman: {
    key: 'wittman', nameAr: 'ويتمان', nameEn: 'Wittman', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'kettle-bell-swing', reps: '15', notes: '1.5 بود/24كجم' },
      { exerciseId: 'power-clean',       reps: '15', notes: '43كجم Rx' },
      { exerciseId: 'box-jump',          reps: '15', notes: '60سم' },
    ],
    cooldownTargetsAr: 'الورك + الكتف + الرباعية',
    scalingNote: 'مبتدئ: أوزان أخف + جولات أقل (5 بدل 7)',
  },
  zimmerman: {
    key: 'zimmerman', nameAr: 'زيمرمان', nameEn: 'Zimmerman', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'chest-to-bar-pull-up', reps: '11' },
      { exerciseId: 'deadlift',             reps: '2', notes: '143كجم Rx' },
    ],
    cooldownTargetsAr: 'الظهر العريض + أسفل الظهر + قبضة اليد',
    scalingNote: 'مبتدئ: عقلة عادية بدل C2B + وزن أخف',
  },
  hammer: {
    key: 'hammer', nameAr: 'هامر', nameEn: 'Hammer', kind: 'hero', type: 'للوقت', duration: 35, rounds: 5,
    movements: [
      { exerciseId: 'power-clean', reps: '5',  notes: '61كجم Rx' },
      { exerciseId: 'front-squat', reps: '10', notes: '61كجم Rx' },
      { exerciseId: 'push-press',  reps: '5',  notes: 'بديل Push Jerk — نفس الوزن' },
      { exerciseId: 'pull-up',     reps: '20' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row بدل جزء من العقلة',
  },
  abbate: {
    key: 'abbate', nameAr: 'أباتي', nameEn: 'Abbate', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '1.6كم' },
      { exerciseId: 'clean-and-jerk', reps: '21', notes: '70كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '800م' },
      { exerciseId: 'clean-and-jerk', reps: '21' },
      { exerciseId: 'run',            reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + رباعية + ربلة الساق',
    scalingNote: 'مبتدئ: وزن أخف + تقليل المسافات',
  },

  // ═══ دفعة ثانية (باقي أبطال الـHero WODs من قائمة الـ135) — حركات وأوزان فقط، بدون قصة البطل ═══
  'mr-joshua': {
    key: 'mr-joshua', nameAr: 'مستر جوشوا', nameEn: 'Mr. Joshua', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'run',      reps: '', distance: '400م' },
      { exerciseId: 'ghd-situp', reps: '30', notes: 'Glute-Ham Sit-up' },
      { exerciseId: 'deadlift',  reps: '15', notes: '113كجم Rx' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الجذع + أوتار الركبة',
    scalingNote: 'مبتدئ: وزن أخف + Sit-up عادي بدل GHD',
  },
  'lumberjack-20': {
    key: 'lumberjack-20', nameAr: 'لمبرجاك 20', nameEn: 'Lumberjack 20', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'deadlift',           reps: '20', notes: '125كجم Rx' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'kettle-bell-swing',  reps: '20', notes: '25كجم' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'overhead-squat',     reps: '20', notes: '52كجم Rx' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'burpee',             reps: '20' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '20' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'box-jump',           reps: '20', notes: '60سم' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
      { exerciseId: 'dumbbell-power-clean', reps: '20', notes: 'Squat Clean بدمبل 20كجم لكل يد' },
      { exerciseId: 'run',                reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل مسافات الجري',
  },
  stephen: {
    key: 'stephen', nameAr: 'ستيفن', nameEn: 'Stephen', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'ghd-situp',         reps: '30-25-20-15-10-5' },
      { exerciseId: 'ghd-hip-extension', reps: '30-25-20-15-10-5', notes: 'Back Extension' },
      { exerciseId: 'knees-to-elbows',   reps: '30-25-20-15-10-5' },
      { exerciseId: 'romanian-deadlift', reps: '30-25-20-15-10-5', notes: 'Stiff-Legged Deadlift 43كجم' },
    ],
    cooldownTargetsAr: 'الجذع + أسفل الظهر + أوتار الركبة',
    scalingNote: 'مبتدئ: Sit-up عادي + وزن أخف',
  },
  luce: {
    key: 'luce', nameAr: 'لوس', nameEn: 'Luce', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '1كم', notes: 'مع سترة 9كجم' },
      { exerciseId: 'muscle-up', reps: '10' },
      { exerciseId: 'air-squat', reps: '100' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الصدر',
    scalingNote: 'مبتدئ: بدون سترة + Ring Dip+Pull-up بدل الماسل أب',
  },
  coe: {
    key: 'coe', nameAr: 'كو', nameEn: 'Coe', kind: 'hero', type: 'للوقت', duration: 20, rounds: 10,
    movements: [
      { exerciseId: 'thruster',   reps: '10', notes: '43كجم Rx' },
      { exerciseId: 'ring-push-up', reps: '10' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + ضغط عادي بدل الحلقات',
  },
  forrest: {
    key: 'forrest', nameAr: 'فورست', nameEn: 'Forrest', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'l-pull-up',    reps: '20' },
      { exerciseId: 'toes-to-bar',  reps: '30' },
      { exerciseId: 'burpee',       reps: '40' },
      { exerciseId: 'run',          reps: '', distance: '800م' },
    ],
    cooldownTargetsAr: 'الجذع + الظهر العريض + الرباعية',
    scalingNote: 'مبتدئ: عقلة عادية + تقليل تكرار البيربي',
  },
  bulger: {
    key: 'bulger', nameAr: 'بولجر', nameEn: 'Bulger', kind: 'hero', type: 'للوقت', duration: 30, rounds: 10,
    movements: [
      { exerciseId: 'run',                  reps: '', distance: '150م' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '7' },
      { exerciseId: 'front-squat',          reps: '7', notes: '61كجم Rx' },
      { exerciseId: 'handstand-pushup',     reps: '7' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Pike Push-up بدل HSPU',
  },
  brenton: {
    key: 'brenton', nameAr: 'برينتون', nameEn: 'Brenton', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'bear-crawl',  reps: '', distance: '30م' },
      { exerciseId: 'broad-jump',  reps: '', distance: '30م', notes: '3 بيربي بعد كل 5 قفزات — سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الجذع',
    scalingNote: 'مبتدئ: بدون سترة + تقليل المسافة',
  },
  blake: {
    key: 'blake', nameAr: 'بليك', nameEn: 'Blake', kind: 'hero', type: 'للوقت', duration: 25, rounds: 4,
    movements: [
      { exerciseId: 'walking-lunge',    reps: '', distance: '30م', notes: 'صفيحة 20كجم فوق الرأس' },
      { exerciseId: 'box-jump',         reps: '30', notes: '60سم' },
      { exerciseId: 'wall-ball',        reps: '20', notes: '9كجم' },
      { exerciseId: 'handstand-pushup', reps: '10' },
    ],
    cooldownTargetsAr: 'الكتف فوق الرأس + الرباعية + الجذع',
    scalingNote: 'مبتدئ: صفيحة أخف + Pike Push-up',
  },
  collin: {
    key: 'collin', nameAr: 'كولن', nameEn: 'Collin', kind: 'hero', type: 'للوقت', duration: 30, rounds: 6,
    movements: [
      { exerciseId: 'sandbag-carry',           reps: '', distance: '400م', notes: 'كيس رمل 22كجم' },
      { exerciseId: 'push-press',              reps: '12', notes: '52كجم Rx' },
      { exerciseId: 'box-jump',                reps: '12', notes: '60سم' },
      { exerciseId: 'sumo-deadlift-high-pull', reps: '12', notes: '43كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + أسفل الظهر + الرباعية',
    scalingNote: 'مبتدئ: أوزان أخف + مسافة حمل أقصر',
  },
  thompson: {
    key: 'thompson', nameAr: 'طومسون', nameEn: 'Thompson', kind: 'hero', type: 'للوقت', duration: 35, rounds: 10,
    movements: [
      { exerciseId: 'rope-climb',    reps: '1', notes: 'يبدأ جالساً على الأرض' },
      { exerciseId: 'back-squat',    reps: '29', notes: '43كجم Rx' },
      { exerciseId: 'front-rack-carry', reps: '', distance: '10م', notes: 'بار 61كجم Farmer Carry' },
    ],
    cooldownTargetsAr: 'الرباعية + قبضة اليد + أسفل الظهر',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull بدل التسلق',
  },
  rankel: {
    key: 'rankel', nameAr: 'رانكل', nameEn: 'Rankel', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'deadlift',          reps: '6', notes: '102كجم Rx' },
      { exerciseId: 'burpee-pull-up',    reps: '7' },
      { exerciseId: 'kettle-bell-swing', reps: '10', notes: '2 بود/32كجم' },
      { exerciseId: 'run',               reps: '', distance: '200م' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الظهر العريض + الكتف',
    scalingNote: 'مبتدئ: وزن أخف + بيربي وعقلة منفصلين',
  },
  holbrook: {
    key: 'holbrook', nameAr: 'هولبروك', nameEn: 'Holbrook', kind: 'hero', type: 'للوقت', duration: 25, rounds: 10,
    movements: [
      { exerciseId: 'thruster', reps: '5', notes: '52كجم Rx' },
      { exerciseId: 'pull-up',  reps: '10' },
      { exerciseId: 'run',      reps: '', distance: '100م', notes: 'عدو سريع' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row (راحة دقيقة بين الجولات)',
  },
  ledesma: {
    key: 'ledesma', nameAr: 'ليديسما', nameEn: 'Ledesma', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup',   reps: '5', notes: 'Parallette HSPU' },
      { exerciseId: 'toes-to-bar',        reps: '10', notes: 'Toes Through Rings' },
      { exerciseId: 'medicine-ball-clean', reps: '15', notes: 'كرة طبية 9كجم' },
    ],
    cooldownTargetsAr: 'الكتف + الجذع + الرباعية',
    scalingNote: 'مبتدئ: Pike Push-up + Knees-to-Elbows',
  },
  mccluskey: {
    key: 'mccluskey', nameAr: 'مكلوسكي', nameEn: 'McCluskey', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'muscle-up',      reps: '9' },
      { exerciseId: 'burpee-pull-up', reps: '15' },
      { exerciseId: 'pull-up',        reps: '21' },
      { exerciseId: 'run',            reps: '', distance: '800م', notes: 'سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكتف + الصدر',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up بدل الماسل أب + بدون سترة',
  },
  weaver: {
    key: 'weaver', nameAr: 'ويفر', nameEn: 'Weaver', kind: 'hero', type: 'للوقت', duration: 25, rounds: 4,
    movements: [
      { exerciseId: 'l-pull-up',            reps: '10' },
      { exerciseId: 'push-up',              reps: '15' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '15' },
      { exerciseId: 'push-up',              reps: '15' },
      { exerciseId: 'pull-up',              reps: '20' },
      { exerciseId: 'push-up',              reps: '15' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + الجذع',
    scalingNote: 'مبتدئ: Ring Row بدل العقلة + ضغط على الركبتين',
  },
  moore: {
    key: 'moore', nameAr: 'مور', nameEn: 'Moore', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'rope-climb',       reps: '1' },
      { exerciseId: 'run',              reps: '', distance: '400م' },
      { exerciseId: 'handstand-pushup', reps: '', notes: 'أقصى عدد ممكن' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: Rope Pull + Pike Push-up',
  },
  wilmot: {
    key: 'wilmot', nameAr: 'ويلموت', nameEn: 'Wilmot', kind: 'hero', type: 'للوقت', duration: 20, rounds: 6,
    movements: [
      { exerciseId: 'air-squat', reps: '50' },
      { exerciseId: 'ring-dip',  reps: '25' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الترايسبس',
    scalingNote: 'مبتدئ: Bar Dip أو ضغط بدل Ring Dip + تقليل التكرار',
  },
  moon: {
    key: 'moon', nameAr: 'مون', nameEn: 'Moon', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'dumbbell-snatch', reps: '10', notes: 'Hang Split Snatch يد يمنى، دمبل 18كجم' },
      { exerciseId: 'rope-climb',      reps: '1' },
      { exerciseId: 'dumbbell-snatch', reps: '10', notes: 'Hang Split Snatch يد يسرى' },
      { exerciseId: 'rope-climb',      reps: '1' },
    ],
    cooldownTargetsAr: 'الكتف + قبضة اليد + الظهر العريض',
    scalingNote: 'مبتدئ: دمبل أخف + Rope Pull بدل التسلق',
  },
  small: {
    key: 'small', nameAr: 'سمول', nameEn: 'Small', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'row',      reps: '', distance: '1000م' },
      { exerciseId: 'burpee',   reps: '50' },
      { exerciseId: 'box-jump', reps: '50', notes: '60سم' },
      { exerciseId: 'run',      reps: '', distance: '800م' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ربلة الساق',
    scalingNote: 'مبتدئ: تقليل التكرار والمسافات للنصف',
  },
  morrison: {
    key: 'morrison', nameAr: 'موريسون', nameEn: 'Morrison', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'wall-ball',         reps: '50-40-30-20-10', notes: '9كجم' },
      { exerciseId: 'box-jump',          reps: '50-40-30-20-10', notes: '60سم' },
      { exerciseId: 'kettle-bell-swing', reps: '50-40-30-20-10', notes: '1.5 بود/24كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الورك',
    scalingNote: 'مبتدئ: كرة وكيتل بيل أخف + صندوق أقل',
  },
  manion: {
    key: 'manion', nameAr: 'مانيون', nameEn: 'Manion', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '400م' },
      { exerciseId: 'back-squat', reps: '29', notes: '61كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + ربلة الساق',
    scalingNote: 'مبتدئ: وزن أخف + تقليل التكرار',
  },
  gator: {
    key: 'gator', nameAr: 'غيتور', nameEn: 'Gator', kind: 'hero', type: 'للوقت', duration: 20, rounds: 8,
    movements: [
      { exerciseId: 'front-squat',  reps: '5', notes: '84كجم Rx' },
      { exerciseId: 'ring-push-up', reps: '26' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + الكتف',
    scalingNote: 'مبتدئ: وزن أخف + ضغط عادي بدل الحلقات',
  },
  bradley: {
    key: 'bradley', nameAr: 'برادلي', nameEn: 'Bradley', kind: 'hero', type: 'للوقت', duration: 25, rounds: 10,
    movements: [
      { exerciseId: 'run',    reps: '', distance: '100م', notes: 'عدو سريع' },
      { exerciseId: 'pull-up', reps: '10' },
      { exerciseId: 'run',    reps: '', distance: '100م', notes: 'عدو سريع' },
      { exerciseId: 'burpee', reps: '10' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Row + مشي سريع (راحة 30 ثانية بين الجولات)',
  },
  meadows: {
    key: 'meadows', nameAr: 'ميدوز', nameEn: 'Meadows', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'muscle-up',        reps: '20' },
      { exerciseId: 'skin-the-cat',     reps: '25', notes: 'Lowers من التعليق المقلوب على الحلقات ببطء' },
      { exerciseId: 'handstand-pushup', reps: '30', notes: 'على الحلقات' },
      { exerciseId: 'strict-ring-rows', reps: '35' },
      { exerciseId: 'ring-push-up',     reps: '40' },
    ],
    cooldownTargetsAr: 'الكتف + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + Pike Push-up + تقليل التكرار',
  },
  santiago: {
    key: 'santiago', nameAr: 'سانتياغو', nameEn: 'Santiago', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'dumbbell-power-clean', reps: '18', notes: 'Hang Squat Clean بدمبل 16كجم' },
      { exerciseId: 'pull-up',              reps: '18' },
      { exerciseId: 'power-clean',          reps: '10', notes: '61كجم Rx' },
      { exerciseId: 'handstand-pushup',     reps: '10' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row + Pike Push-up',
  },
  carse: {
    key: 'carse', nameAr: 'كارس', nameEn: 'Carse', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'bear-crawl',   reps: '', distance: '50م', notes: 'بداية كل جولة' },
      { exerciseId: 'squat-clean',  reps: '21-18-15-12-9-6-3', notes: '43كجم Rx' },
      { exerciseId: 'double-under', reps: '21-18-15-12-9-6-3' },
      { exerciseId: 'deadlift',     reps: '21-18-15-12-9-6-3', notes: '84كجم Rx' },
      { exerciseId: 'box-jump',     reps: '21-18-15-12-9-6-3', notes: '60سم' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + الكتف',
    scalingNote: 'مبتدئ: أوزان أخف + قفز مفرد ×2',
  },
  bradshaw: {
    key: 'bradshaw', nameAr: 'برادشو', nameEn: 'Bradshaw', kind: 'hero', type: 'للوقت', duration: 25, rounds: 10,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '3' },
      { exerciseId: 'deadlift',         reps: '6', notes: '102كجم Rx' },
      { exerciseId: 'pull-up',          reps: '12' },
      { exerciseId: 'double-under',     reps: '24' },
    ],
    cooldownTargetsAr: 'الكتف + أسفل الظهر + الظهر العريض',
    scalingNote: 'مبتدئ: Pike Push-up + وزن أخف + قفز مفرد',
  },
  white: {
    key: 'white', nameAr: 'وايت', nameEn: 'White', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'rope-climb',    reps: '3' },
      { exerciseId: 'toes-to-bar',   reps: '10' },
      { exerciseId: 'walking-lunge', reps: '21', notes: 'خطوات، صفيحة 20كجم فوق الرأس' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الجذع + الرباعية',
    scalingNote: 'مبتدئ: Rope Pull + صفيحة أخف',
  },
  santora: {
    key: 'santora', nameAr: 'سانتورا', nameEn: 'Santora', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'squat-clean',  reps: '', notes: 'أقصى عدد بدقيقة، 70كجم Rx' },
      { exerciseId: 'shuttle-run',  reps: '', notes: 'أقصى عدد بدقيقة (20 أمام + 20 خلف = تكرار)' },
      { exerciseId: 'deadlift',     reps: '', notes: 'أقصى عدد بدقيقة، 111كجم Rx' },
      { exerciseId: 'burpee',       reps: '', notes: 'أقصى عدد بدقيقة' },
      { exerciseId: 'push-press',   reps: '', notes: 'Jerk أقصى عدد بدقيقة، 70كجم Rx' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + ظهر + كتف',
    scalingNote: 'مبتدئ: أوزان أخف (راحة دقيقة بين الجولات)',
  },
  wood: {
    key: 'wood', nameAr: 'وود', nameEn: 'Wood', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'run',                     reps: '', distance: '400م' },
      { exerciseId: 'burpee-box-jump',         reps: '10', notes: '60سم' },
      { exerciseId: 'sumo-deadlift-high-pull', reps: '10', notes: '43كجم Rx' },
      { exerciseId: 'thruster',                reps: '10', notes: '43كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + أسفل الظهر',
    scalingNote: 'مبتدئ: أوزان أخف (راحة دقيقة بين الجولات)',
  },
  hidalgo: {
    key: 'hidalgo', nameAr: 'هيدالغو', nameEn: 'Hidalgo', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'run',           reps: '', distance: '3.2كم', notes: 'ميلان' },
      { exerciseId: 'squat-clean',   reps: '20', notes: '61كجم Rx' },
      { exerciseId: 'box-jump',      reps: '20', notes: '60سم' },
      { exerciseId: 'walking-lunge', reps: '20', notes: 'خطوات، صفيحة 20كجم فوق الرأس' },
      { exerciseId: 'box-jump',      reps: '20' },
      { exerciseId: 'squat-clean',   reps: '20' },
      { exerciseId: 'run',           reps: '', distance: '3.2كم', notes: 'ميلان، سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: تقليل المسافات + وزن أخف + بدون سترة',
  },
  ricky: {
    key: 'ricky', nameAr: 'ريكي', nameEn: 'Ricky', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',           reps: '10' },
      { exerciseId: 'dumbbell-row',      reps: '5', notes: 'Dumbbell Deadlift بدمبل 34كجم' },
      { exerciseId: 'dumbbell-push-press', reps: '8', notes: '61كجم بار بديل — Push Press' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  'dae-han': {
    key: 'dae-han', nameAr: 'داي هان', nameEn: 'Dae Han', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '800م', notes: 'مع بار 20كجم' },
      { exerciseId: 'rope-climb', reps: '3' },
      { exerciseId: 'thruster',   reps: '12', notes: '61كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + قبضة اليد',
    scalingNote: 'مبتدئ: بار أخف + Rope Pull',
  },
  desforges: {
    key: 'desforges', nameAr: 'ديسفورج', nameEn: 'Desforges', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'deadlift',        reps: '12', notes: '102كجم Rx' },
      { exerciseId: 'pull-up',         reps: '20' },
      { exerciseId: 'clean-and-jerk',  reps: '12', notes: '61كجم Rx' },
      { exerciseId: 'knees-to-elbows', reps: '20' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + الجذع',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  rahoi: {
    key: 'rahoi', nameAr: 'راهوي', nameEn: 'Rahoi', kind: 'hero', type: 'AMRAP', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'box-jump',          reps: '12', notes: '60سم' },
      { exerciseId: 'thruster',          reps: '6', notes: '43كجم Rx' },
      { exerciseId: 'bar-facing-burpee', reps: '6' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الصدر',
    scalingNote: 'مبتدئ: صندوق أقل + وزن أخف',
  },
  klepto: {
    key: 'klepto', nameAr: 'كليبتو', nameEn: 'Klepto', kind: 'hero', type: 'للوقت', duration: 20, rounds: 4,
    movements: [
      { exerciseId: 'box-jump',    reps: '27', notes: '60سم' },
      { exerciseId: 'burpee',      reps: '20' },
      { exerciseId: 'squat-clean', reps: '11', notes: '66كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: صندوق أقل + وزن أخف',
  },
  del: {
    key: 'del', nameAr: 'ديل', nameEn: 'Del', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'burpee',               reps: '25' },
      { exerciseId: 'run',                  reps: '', distance: '400م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'weighted-pull-up',     reps: '25', notes: 'دمبل 9كجم' },
      { exerciseId: 'run',                  reps: '', distance: '400م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'handstand-pushup',     reps: '25' },
      { exerciseId: 'run',                  reps: '', distance: '400م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '25' },
      { exerciseId: 'run',                  reps: '', distance: '400م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'burpee',               reps: '25' },
    ],
    cooldownTargetsAr: 'كامل الجسم — ظهر + كتف + رباعية',
    scalingNote: 'مبتدئ: عقلة عادية + Pike Push-up + كرة أخف',
  },
  pheezy: {
    key: 'pheezy', nameAr: 'فيزي', nameEn: 'Pheezy', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'front-squat',  reps: '5', notes: '75كجم Rx' },
      { exerciseId: 'pull-up',      reps: '18' },
      { exerciseId: 'deadlift',     reps: '5', notes: '102كجم Rx' },
      { exerciseId: 'toes-to-bar',  reps: '18' },
      { exerciseId: 'push-press',   reps: '5', notes: 'Push Jerk 75كجم' },
      { exerciseId: 'push-up',      reps: '18', notes: 'Hand-Release' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  jj: {
    key: 'jj', nameAr: 'جيه جيه', nameEn: 'J.J.', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'squat-clean',      reps: '1→10 تصاعدي', notes: '84كجم Rx' },
      { exerciseId: 'handstand-pushup', reps: '10→1 تنازلي', notes: 'Parallette HSPU' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: وزن أخف + Pike Push-up',
  },
  'jag-28': {
    key: 'jag-28', nameAr: 'جاغ 28', nameEn: 'Jag 28', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'run',                     reps: '', distance: '800م' },
      { exerciseId: 'kettle-bell-swing',       reps: '28', notes: '2 بود/32كجم' },
      { exerciseId: 'pull-up',                 reps: '28', notes: 'Strict' },
      { exerciseId: 'dumbbell-clean-and-jerk', reps: '28', notes: 'كيتل بيل 2 بود لكل يد' },
      { exerciseId: 'pull-up',                 reps: '28', notes: 'Strict' },
      { exerciseId: 'run',                     reps: '', distance: '800م' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكتف + قبضة اليد',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  brian: {
    key: 'brian', nameAr: 'براين', nameEn: 'Brian', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'rope-climb', reps: '5' },
      { exerciseId: 'back-squat', reps: '25', notes: '84كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + قبضة اليد + أسفل الظهر',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull',
  },
  nick: {
    key: 'nick', nameAr: 'نيك', nameEn: 'Nick', kind: 'hero', type: 'للوقت', duration: 25, rounds: 12,
    movements: [
      { exerciseId: 'dumbbell-power-clean', reps: '10', notes: 'Hang Squat Clean بدمبل 20كجم' },
      { exerciseId: 'handstand-pushup',     reps: '6', notes: 'على الدمبل' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: دمبل أخف + Pike Push-up',
  },
  strange: {
    key: 'strange', nameAr: 'سترينج', nameEn: 'Strange', kind: 'hero', type: 'للوقت', duration: 35, rounds: 8,
    movements: [
      { exerciseId: 'run',                  reps: '', distance: '600م' },
      { exerciseId: 'weighted-pull-up',     reps: '11', notes: 'كيتل بيل 1.5 بود/24كجم' },
      { exerciseId: 'walking-lunge',        reps: '11', notes: 'خطوات، كيتل بيل 1.5 بود/24كجم' },
      { exerciseId: 'dumbbell-thruster',    reps: '11', notes: 'كيتل بيل 1.5 بود/24كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: أوزان أخف + عقلة عادية',
  },
  tumilson: {
    key: 'tumilson', nameAr: 'توميلسون', nameEn: 'Tumilson', kind: 'hero', type: 'للوقت', duration: 25, rounds: 8,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '200م' },
      { exerciseId: 'devils-press',   reps: '11', notes: 'Dumbbell Burpee Deadlift بدمبل 27كجم' },
    ],
    cooldownTargetsAr: 'الظهر + الكتف + الرباعية',
    scalingNote: 'مبتدئ: دمبل أخف + مشي سريع',
  },
  ship: {
    key: 'ship', nameAr: 'شيب', nameEn: 'Ship', kind: 'hero', type: 'للوقت', duration: 25, rounds: 9,
    movements: [
      { exerciseId: 'squat-clean',     reps: '7', notes: '84كجم Rx' },
      { exerciseId: 'burpee-box-jump', reps: '8', notes: '90سم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: وزن أخف + صندوق أقل',
  },
  jared: {
    key: 'jared', nameAr: 'جاريد', nameEn: 'Jared', kind: 'hero', type: 'للوقت', duration: 30, rounds: 4,
    movements: [
      { exerciseId: 'run',     reps: '', distance: '800م' },
      { exerciseId: 'pull-up', reps: '40' },
      { exerciseId: 'push-up', reps: '70' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Row + ضغط على الركبتين',
  },
  tully: {
    key: 'tully', nameAr: 'تولي', nameEn: 'Tully', kind: 'hero', type: 'للوقت', duration: 25, rounds: 4,
    movements: [
      { exerciseId: 'swim',                 reps: '', distance: '200م' },
      { exerciseId: 'dumbbell-power-clean', reps: '23', notes: 'Squat Clean بدمبل 18كجم' },
    ],
    cooldownTargetsAr: 'الظهر + الرباعية + الكتف',
    scalingNote: 'مبتدئ: مسافة سباحة أقصر + دمبل أخف',
  },
  holleyman: {
    key: 'holleyman', nameAr: 'هوليمان', nameEn: 'Holleyman', kind: 'hero', type: 'للوقت', duration: 30, rounds: 30,
    movements: [
      { exerciseId: 'wall-ball',        reps: '5', notes: '9كجم' },
      { exerciseId: 'handstand-pushup', reps: '3' },
      { exerciseId: 'power-clean',      reps: '1', notes: '102كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + أسفل الظهر',
    scalingNote: 'مبتدئ: وزن أخف + Pike Push-up + تقليل الجولات',
  },
  adrian: {
    key: 'adrian', nameAr: 'أدريان', nameEn: 'Adrian', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'forward-roll', reps: '3' },
      { exerciseId: 'wall-walk',    reps: '5', notes: 'Wall Climb' },
      { exerciseId: 'toes-to-bar',  reps: '7' },
      { exerciseId: 'box-jump',     reps: '9', notes: '75سم' },
    ],
    cooldownTargetsAr: 'الكتف + الجذع + الرباعية',
    scalingNote: 'مبتدئ: صندوق أقل + تقليل الجولات',
  },
  glen: {
    key: 'glen', nameAr: 'غلين', nameEn: 'Glen', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'clean-and-jerk', reps: '30', notes: '61كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '1.6كم' },
      { exerciseId: 'rope-climb',     reps: '10' },
      { exerciseId: 'run',            reps: '', distance: '1.6كم' },
      { exerciseId: 'burpee',         reps: '100' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + ظهر + ربلة الساق',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull + تقليل المسافات',
  },
  tom: {
    key: 'tom', nameAr: 'توم', nameEn: 'Tom', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'muscle-up',   reps: '7' },
      { exerciseId: 'thruster',    reps: '11', notes: '70كجم Rx' },
      { exerciseId: 'toes-to-bar', reps: '14' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الجذع',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + وزن أخف',
  },
  ralph: {
    key: 'ralph', nameAr: 'رالف', nameEn: 'Ralph', kind: 'hero', type: 'للوقت', duration: 30, rounds: 4,
    movements: [
      { exerciseId: 'deadlift',   reps: '8', notes: '113كجم Rx' },
      { exerciseId: 'burpee',     reps: '16' },
      { exerciseId: 'rope-climb', reps: '3' },
      { exerciseId: 'run',        reps: '', distance: '600م' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull',
  },
  clovis: {
    key: 'clovis', nameAr: 'كلوفيس', nameEn: 'Clovis', kind: 'hero', type: 'للوقت', duration: 90, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '16كم', notes: '10 أميال — يُقسّم حسب الحاجة' },
      { exerciseId: 'burpee-pull-up', reps: '150' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: تقليل المسافة والتكرار للنصف',
  },
  weston: {
    key: 'weston', nameAr: 'ويستون', nameEn: 'Weston', kind: 'hero', type: 'للوقت', duration: 35, rounds: 5,
    movements: [
      { exerciseId: 'row',           reps: '', distance: '1000م' },
      { exerciseId: 'farmers-carry', reps: '', distance: '200م', notes: 'دمبل 20كجم' },
      { exerciseId: 'farmers-carry', reps: '', distance: '50م', notes: 'Waiter Walk فوق الرأس يد يمنى، دمبل 20كجم' },
      { exerciseId: 'farmers-carry', reps: '', distance: '50م', notes: 'Waiter Walk فوق الرأس يد يسرى' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: دمبل أخف + تقليل المسافات',
  },
  loredo: {
    key: 'loredo', nameAr: 'لوريدو', nameEn: 'Loredo', kind: 'hero', type: 'للوقت', duration: 30, rounds: 6,
    movements: [
      { exerciseId: 'air-squat',     reps: '24' },
      { exerciseId: 'push-up',       reps: '24' },
      { exerciseId: 'walking-lunge', reps: '24', notes: 'خطوات' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: ضغط على الركبتين + تقليل التكرار',
  },
  sean: {
    key: 'sean', nameAr: 'شون', nameEn: 'Sean', kind: 'hero', type: 'للوقت', duration: 25, rounds: 10,
    movements: [
      { exerciseId: 'chest-to-bar-pull-up', reps: '11' },
      { exerciseId: 'front-squat',          reps: '22', notes: '34كجم Rx' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + الكتف',
    scalingNote: 'مبتدئ: عقلة عادية + وزن أخف',
  },
  hortman: {
    key: 'hortman', nameAr: 'هورتمان', nameEn: 'Hortman', kind: 'hero', type: 'AMRAP', duration: 45, rounds: null,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '800م' },
      { exerciseId: 'air-squat', reps: '80' },
      { exerciseId: 'muscle-up', reps: '8' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + تقليل التكرار',
  },
  hamilton: {
    key: 'hamilton', nameAr: 'هاملتون', nameEn: 'Hamilton', kind: 'hero', type: 'للوقت', duration: 35, rounds: 3,
    movements: [
      { exerciseId: 'row',     reps: '', distance: '1000م' },
      { exerciseId: 'push-up', reps: '50' },
      { exerciseId: 'run',     reps: '', distance: '1000م' },
      { exerciseId: 'pull-up', reps: '50' },
    ],
    cooldownTargetsAr: 'الصدر + الظهر العريض + ربلة الساق',
    scalingNote: 'مبتدئ: ضغط على الركبتين + Ring Row',
  },
  zeus: {
    key: 'zeus', nameAr: 'زيوس', nameEn: 'Zeus', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'wall-ball',               reps: '30', notes: '9كجم' },
      { exerciseId: 'sumo-deadlift-high-pull', reps: '30', notes: '34كجم Rx' },
      { exerciseId: 'box-jump',                reps: '30', notes: '50سم' },
      { exerciseId: 'push-press',              reps: '30', notes: '34كجم Rx' },
      { exerciseId: 'row',                     reps: '30 سعرة' },
      { exerciseId: 'push-up',                 reps: '30' },
      { exerciseId: 'back-squat',              reps: '10', notes: 'وزن الجسم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + رباعية + صدر',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل التكرار',
  },
  barraza: {
    key: 'barraza', nameAr: 'بارازا', nameEn: 'Barraza', kind: 'hero', type: 'AMRAP', duration: 18, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '200م' },
      { exerciseId: 'deadlift',       reps: '9', notes: '125كجم Rx' },
      { exerciseId: 'bar-muscle-up',  reps: '6', notes: 'Burpee Bar Muscle-Up' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Jumping Bar Muscle-Up',
  },
  cameron: {
    key: 'cameron', nameAr: 'كاميرون', nameEn: 'Cameron', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'walking-lunge',        reps: '50', notes: 'خطوات' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '25' },
      { exerciseId: 'box-jump',             reps: '50', notes: '60سم' },
      { exerciseId: 'triple-under',         reps: '25' },
      { exerciseId: 'ghd-hip-extension',    reps: '50', notes: 'Back Extension' },
      { exerciseId: 'ring-dip',             reps: '25' },
      { exerciseId: 'knees-to-elbows',      reps: '50' },
      { exerciseId: 'wall-ball',            reps: '25', notes: '2-fer-1، 9كجم' },
      { exerciseId: 'sit-up',               reps: '50' },
      { exerciseId: 'rope-climb',           reps: '5' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + ظهر + كتف',
    scalingNote: 'مبتدئ: عقلة عادية + قفز مزدوج بدل الثلاثي + تقليل التكرار',
  },
  jorge: {
    key: 'jorge', nameAr: 'خورخي', nameEn: 'Jorge', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'ghd-situp',   reps: '30-24-18-12-6' },
      { exerciseId: 'squat-clean', reps: '15-12-9-6-3', notes: '70كجم Rx' },
    ],
    cooldownTargetsAr: 'الجذع + الرباعية + أسفل الظهر',
    scalingNote: 'مبتدئ: Sit-up عادي + وزن أخف',
  },
  schmalls: {
    key: 'schmalls', nameAr: 'شمالز', nameEn: 'Schmalls', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '800م' },
      { exerciseId: 'burpee',            reps: '50', notes: 'جولتان' },
      { exerciseId: 'pull-up',           reps: '40', notes: 'جولتان' },
      { exerciseId: 'pistol-squat',      reps: '30', notes: 'قرفصاء ساق واحدة، جولتان' },
      { exerciseId: 'kettle-bell-swing', reps: '20', notes: '1.5 بود/24كجم، جولتان' },
      { exerciseId: 'handstand-pushup',  reps: '10', notes: 'جولتان' },
      { exerciseId: 'run',               reps: '', distance: '800م' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: قرفصاء بمساعدة + Pike Push-up + تقليل التكرار',
  },
  brehm: {
    key: 'brehm', nameAr: 'بريم', nameEn: 'Brehm', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'rope-climb',       reps: '10' },
      { exerciseId: 'back-squat',       reps: '20', notes: '102كجم Rx' },
      { exerciseId: 'handstand-pushup', reps: '30' },
      { exerciseId: 'row',              reps: '40 سعرة' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + قبضة اليد',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull + Pike Push-up',
  },
  omar: {
    key: 'omar', nameAr: 'عمر', nameEn: 'Omar', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'thruster',          reps: '10', notes: '43كجم Rx' },
      { exerciseId: 'bar-facing-burpee', reps: '15' },
      { exerciseId: 'thruster',          reps: '20' },
      { exerciseId: 'bar-facing-burpee', reps: '25' },
      { exerciseId: 'thruster',          reps: '30' },
      { exerciseId: 'bar-facing-burpee', reps: '35' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الصدر',
    scalingNote: 'مبتدئ: وزن أخف',
  },
  gallant: {
    key: 'gallant', nameAr: 'غالانت', nameEn: 'Gallant', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '1.6كم', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'burpee-pull-up', reps: '60' },
      { exerciseId: 'run',            reps: '', distance: '800م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'burpee-pull-up', reps: '30' },
      { exerciseId: 'run',            reps: '', distance: '400م', notes: 'مع كرة طبية 9كجم' },
      { exerciseId: 'burpee-pull-up', reps: '15' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: كرة أخف + بيربي وعقلة منفصلين',
  },
  bruck: {
    key: 'bruck', nameAr: 'بروك', nameEn: 'Bruck', kind: 'hero', type: 'للوقت', duration: 25, rounds: 4,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '400م' },
      { exerciseId: 'back-squat', reps: '24', notes: '84كجم Rx' },
      { exerciseId: 'push-press', reps: '24', notes: 'Jerk 61كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  smykowski: {
    key: 'smykowski', nameAr: 'سميكوفسكي', nameEn: 'Smykowski', kind: 'hero', type: 'للوقت', duration: 45, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '6كم' },
      { exerciseId: 'burpee-pull-up', reps: '60', notes: 'سترة 14كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: تقليل المسافة + بدون سترة',
  },
  falkel: {
    key: 'falkel', nameAr: 'فالكل', nameEn: 'Falkel', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '8' },
      { exerciseId: 'box-jump',         reps: '8', notes: '75سم' },
      { exerciseId: 'rope-climb',       reps: '1' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + قبضة اليد',
    scalingNote: 'مبتدئ: Pike Push-up + صندوق أقل + Rope Pull',
  },
  donny: {
    key: 'donny', nameAr: 'دوني', nameEn: 'Donny', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'deadlift', reps: '21-15-9-9-15-21', notes: '102كجم Rx' },
      { exerciseId: 'burpee',   reps: '21-15-9-9-15-21' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الرباعية + الصدر',
    scalingNote: 'مبتدئ: وزن أخف',
  },
  dobogai: {
    key: 'dobogai', nameAr: 'دوبوغاي', nameEn: 'Dobogai', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'muscle-up',     reps: '8' },
      { exerciseId: 'farmers-carry', reps: '', distance: '20م', notes: 'دمبل 22كجم' },
    ],
    cooldownTargetsAr: 'الكتف + الظهر العريض + قبضة اليد',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + دمبل أخف',
  },
  'hotshots-19': {
    key: 'hotshots-19', nameAr: 'هوت شوتس 19', nameEn: 'Hotshots 19', kind: 'hero', type: 'للوقت', duration: 30, rounds: 6,
    movements: [
      { exerciseId: 'air-squat',   reps: '30' },
      { exerciseId: 'power-clean', reps: '19', notes: '61كجم Rx' },
      { exerciseId: 'pull-up',     reps: '7', notes: 'Strict' },
      { exerciseId: 'run',         reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row',
  },
  roney: {
    key: 'roney', nameAr: 'روني', nameEn: 'Roney', kind: 'hero', type: 'للوقت', duration: 20, rounds: 4,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '200م' },
      { exerciseId: 'thruster',    reps: '11', notes: '61كجم Rx' },
      { exerciseId: 'run',         reps: '', distance: '200م' },
      { exerciseId: 'push-press',  reps: '11', notes: '61كجم Rx' },
      { exerciseId: 'run',         reps: '', distance: '200م' },
      { exerciseId: 'bench-press', reps: '11', notes: '61كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + الرباعية',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  'the-don': {
    key: 'the-don', nameAr: 'ذا دون', nameEn: 'The Don', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'deadlift',          reps: '66', notes: '50كجم Rx' },
      { exerciseId: 'box-jump',          reps: '66', notes: '60سم' },
      { exerciseId: 'kettle-bell-swing', reps: '66', notes: '1.5 بود/24كجم' },
      { exerciseId: 'knees-to-elbows',   reps: '66' },
      { exerciseId: 'sit-up',            reps: '66' },
      { exerciseId: 'pull-up',           reps: '66' },
      { exerciseId: 'thruster',          reps: '66', notes: '25كجم Rx' },
      { exerciseId: 'wall-ball',         reps: '66', notes: '9كجم' },
      { exerciseId: 'burpee',            reps: '66' },
      { exerciseId: 'double-under',      reps: '66' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كل المجموعات',
    scalingNote: 'مبتدئ: تقليل التكرار للنصف + أوزان أخف',
  },
  dragon: {
    key: 'dragon', nameAr: 'دراغون', nameEn: 'Dragon', kind: 'hero', type: 'للوقت', duration: 60, rounds: null,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '5كم' },
      { exerciseId: 'deadlift',   reps: '4RM', notes: '4 دقائق لإيجاد أقصى 4 تكرارات' },
      { exerciseId: 'run',        reps: '', distance: '5كم' },
      { exerciseId: 'push-press', reps: '4RM', notes: 'Push Jerk — 4 دقائق لإيجاد أقصى 4 تكرارات' },
    ],
    cooldownTargetsAr: 'ربلة الساق + أسفل الظهر + الكتف',
    scalingNote: 'مبتدئ: تقليل المسافة + أوزان معتدلة',
  },
  walsh: {
    key: 'walsh', nameAr: 'والش', nameEn: 'Walsh', kind: 'hero', type: 'للوقت', duration: 25, rounds: 4,
    movements: [
      { exerciseId: 'burpee-pull-up', reps: '22' },
      { exerciseId: 'back-squat',     reps: '22', notes: '84كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '200م', notes: 'صفيحة 20كجم فوق الرأس' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + بيربي وعقلة منفصلين',
  },
  lee: {
    key: 'lee', nameAr: 'لي', nameEn: 'Lee', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '400م' },
      { exerciseId: 'deadlift',    reps: '1', notes: '156كجم Rx' },
      { exerciseId: 'squat-clean', reps: '3', notes: '84كجم Rx' },
      { exerciseId: 'push-press',  reps: '5', notes: 'Push Jerk 84كجم' },
      { exerciseId: 'muscle-up',   reps: '3' },
      { exerciseId: 'rope-climb',  reps: '1' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Dip+Pull-up',
  },
  willy: {
    key: 'willy', nameAr: 'ويلي', nameEn: 'Willy', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'run',                  reps: '', distance: '800م' },
      { exerciseId: 'front-squat',          reps: '5', notes: '102كجم Rx' },
      { exerciseId: 'run',                  reps: '', distance: '200م' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '11' },
      { exerciseId: 'run',                  reps: '', distance: '400م' },
      { exerciseId: 'kettle-bell-swing',    reps: '12', notes: '2 بود/32كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الظهر العريض + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف + عقلة عادية',
  },
  coffey: {
    key: 'coffey', nameAr: 'كوفي', nameEn: 'Coffey', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '800م' },
      { exerciseId: 'back-squat',  reps: '50', notes: '61كجم Rx' },
      { exerciseId: 'bench-press', reps: '50', notes: '61كجم Rx' },
      { exerciseId: 'run',         reps: '', distance: '800م' },
      { exerciseId: 'back-squat',  reps: '35' },
      { exerciseId: 'bench-press', reps: '35' },
      { exerciseId: 'run',         reps: '', distance: '800م' },
      { exerciseId: 'back-squat',  reps: '20' },
      { exerciseId: 'bench-press', reps: '20' },
      { exerciseId: 'run',         reps: '', distance: '800م' },
      { exerciseId: 'muscle-up',   reps: '1' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Dip+Pull-up',
  },
  dg: {
    key: 'dg', nameAr: 'دي جي', nameEn: 'DG', kind: 'hero', type: 'AMRAP', duration: 10, rounds: null,
    movements: [
      { exerciseId: 'toes-to-bar',       reps: '8' },
      { exerciseId: 'dumbbell-thruster', reps: '8', notes: 'دمبل 16كجم' },
      { exerciseId: 'dumbbell-overhead-lunge', reps: '12', notes: 'Walking Lunge بدمبل 16كجم' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الجذع',
    scalingNote: 'مبتدئ: دمبل أخف + Knees-to-Elbows',
  },
  tk: {
    key: 'tk', nameAr: 'تي كيه', nameEn: 'TK', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',           reps: '8', notes: 'Strict' },
      { exerciseId: 'box-jump',          reps: '8', notes: '90سم' },
      { exerciseId: 'kettle-bell-swing', reps: '12', notes: '2 بود/32كجم' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + الكتف',
    scalingNote: 'مبتدئ: Ring Row + صندوق أقل + كيتل بيل أخف',
  },
  taylor: {
    key: 'taylor', nameAr: 'تايلور', nameEn: 'Taylor', kind: 'hero', type: 'للوقت', duration: 20, rounds: 4,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '400م' },
      { exerciseId: 'muscle-up', reps: '5', notes: 'Burpee Muscle-Up، سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + بدون سترة',
  },
  justin: {
    key: 'justin', nameAr: 'جاستن', nameEn: 'Justin', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'back-squat',  reps: '30-20-10', notes: 'وزن الجسم' },
      { exerciseId: 'bench-press', reps: '30-20-10', notes: 'وزن الجسم' },
      { exerciseId: 'pull-up',     reps: '30-20-10', notes: 'Strict' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + الظهر العريض',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  nukes: {
    key: 'nukes', nameAr: 'نيوكس', nameEn: 'Nukes', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'run',            reps: '', distance: '1.6كم', notes: 'سقف زمني 8 دقائق للجزء الأول' },
      { exerciseId: 'deadlift',       reps: '', notes: 'أقصى عدد، 143كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '1.6كم', notes: 'سقف زمني 10 دقائق للجزء الثاني' },
      { exerciseId: 'power-clean',    reps: '', notes: 'أقصى عدد، 102كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '1.6كم', notes: 'سقف زمني 12 دقيقة للجزء الثالث' },
      { exerciseId: 'overhead-squat', reps: '', notes: 'أقصى عدد، 61كجم Rx' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف + مسافات أقصر',
  },
  zembiec: {
    key: 'zembiec', nameAr: 'زمبيك', nameEn: 'Zembiec', kind: 'hero', type: 'للوقت', duration: 20, rounds: 5,
    movements: [
      { exerciseId: 'back-squat',     reps: '11', notes: '84كجم Rx' },
      { exerciseId: 'burpee-pull-up', reps: '7', notes: 'Strict' },
      { exerciseId: 'run',            reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'الرباعية + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: وزن أخف + بيربي وعقلة منفصلين',
  },
  alexander: {
    key: 'alexander', nameAr: 'ألكسندر', nameEn: 'Alexander', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'back-squat',  reps: '31', notes: '61كجم Rx' },
      { exerciseId: 'power-clean', reps: '12', notes: '84كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + الكتف',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  wyk: {
    key: 'wyk', nameAr: 'فان ويك', nameEn: 'Wyk', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'front-squat', reps: '5', notes: '102كجم Rx' },
      { exerciseId: 'rope-climb',  reps: '5' },
      { exerciseId: 'run',         reps: '', distance: '400م', notes: 'صفيحة 20كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + قبضة اليد + الكتف',
    scalingNote: 'مبتدئ: وزن أخف + Rope Pull',
  },
  bell: {
    key: 'bell', nameAr: 'بيل', nameEn: 'Bell', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'deadlift',    reps: '21', notes: '84كجم Rx' },
      { exerciseId: 'pull-up',     reps: '15' },
      { exerciseId: 'front-squat', reps: '9', notes: '84كجم Rx' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row',
  },
  jbo: {
    key: 'jbo', nameAr: 'جي بو', nameEn: 'JBo', kind: 'hero', type: 'AMRAP', duration: 28, rounds: null,
    movements: [
      { exerciseId: 'overhead-squat', reps: '9', notes: '52كجم Rx' },
      { exerciseId: 'rope-climb',     reps: '1', notes: 'Legless من الجلوس' },
      { exerciseId: 'bench-press',    reps: '12', notes: '52كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف فوق الرأس + الصدر + قبضة اليد',
    scalingNote: 'مبتدئ: وزن أخف + Rope Climb عادي',
  },
  kevin: {
    key: 'kevin', nameAr: 'كيفن', nameEn: 'Kevin', kind: 'hero', type: 'للوقت', duration: 25, rounds: 3,
    movements: [
      { exerciseId: 'deadlift',        reps: '32', notes: '84كجم Rx' },
      { exerciseId: 'knees-to-elbows', reps: '32', notes: 'Hanging Hip Touch بالتناوب' },
      { exerciseId: 'farmers-carry',   reps: '', distance: '800م', notes: 'جري مع دمبل 7كجم' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الجذع + قبضة اليد',
    scalingNote: 'مبتدئ: وزن أخف + مسافة حمل أقصر',
  },
  rocket: {
    key: 'rocket', nameAr: 'روكيت', nameEn: 'Rocket', kind: 'hero', type: 'AMRAP', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'swim',      reps: '', distance: '45م' },
      { exerciseId: 'push-up',   reps: '10' },
      { exerciseId: 'air-squat', reps: '15' },
    ],
    cooldownTargetsAr: 'الصدر + الرباعية + الكتف',
    scalingNote: 'مبتدئ: مسافة سباحة أقصر + ضغط على الركبتين',
  },
  riley: {
    key: 'riley', nameAr: 'رايلي', nameEn: 'Riley', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'run',    reps: '', distance: '2.4كم', notes: '1.5 ميل' },
      { exerciseId: 'burpee', reps: '150' },
      { exerciseId: 'run',    reps: '', distance: '2.4كم', notes: '1.5 ميل، سترة إن توفرت' },
    ],
    cooldownTargetsAr: 'ربلة الساق + الصدر + الرباعية',
    scalingNote: 'مبتدئ: تقليل المسافة والتكرار + بدون سترة',
  },
  feeks: {
    key: 'feeks', nameAr: 'فيكس', nameEn: 'Feeks', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'shuttle-run',       reps: '2→16 تصاعدي', notes: '×100م لكل تكرار' },
      { exerciseId: 'dumbbell-thruster', reps: '2→16 تصاعدي', notes: 'Squat Clean Thruster بدمبل 30كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: دمبل أخف + تقليل التصاعد',
  },
  ned: {
    key: 'ned', nameAr: 'نيد', nameEn: 'Ned', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'back-squat', reps: '11', notes: 'وزن الجسم' },
      { exerciseId: 'row',        reps: '', distance: '1000م' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف من وزن الجسم',
  },
  sham: {
    key: 'sham', nameAr: 'شام', nameEn: 'Sham', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'deadlift', reps: '11', notes: 'وزن الجسم' },
      { exerciseId: 'run',      reps: '', distance: '100م', notes: 'عدو سريع' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الرباعية + ربلة الساق',
    scalingNote: 'مبتدئ: وزن أخف من وزن الجسم',
  },
  ozzy: {
    key: 'ozzy', nameAr: 'أوزي', nameEn: 'Ozzy', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '11', notes: 'Deficit HSPU' },
      { exerciseId: 'run',              reps: '', distance: '1000م' },
    ],
    cooldownTargetsAr: 'الكتف + الترايسبس + ربلة الساق',
    scalingNote: 'مبتدئ: Pike Push-up بدون عجز',
  },
  jenny: {
    key: 'jenny', nameAr: 'جيني', nameEn: 'Jenny', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'overhead-squat', reps: '20', notes: '20كجم Rx' },
      { exerciseId: 'back-squat',     reps: '20', notes: '20كجم Rx' },
      { exerciseId: 'run',            reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف فوق الرأس + ربلة الساق',
    scalingNote: 'مبتدئ: بار فارغ أو عصا',
  },
  spehar: {
    key: 'spehar', nameAr: 'سبيهار', nameEn: 'Spehar', kind: 'hero', type: 'للوقت', duration: 60, rounds: null,
    movements: [
      { exerciseId: 'thruster',             reps: '100', notes: '61كجم Rx' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '100' },
      { exerciseId: 'run',                  reps: '', distance: '9.6كم', notes: '6 أميال — يُقسّم حسب الحاجة' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + عقلة عادية + تقليل المسافة',
  },
  luke: {
    key: 'luke', nameAr: 'لوك', nameEn: 'Luke', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'clean-and-jerk',    reps: '15', notes: '70كجم Rx' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'toes-to-bar',       reps: '30' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'wall-ball',         reps: '45', notes: '9كجم' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'kettle-bell-swing', reps: '45', notes: '25كجم' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'ring-dip',          reps: '30' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
      { exerciseId: 'weighted-lunge',    reps: '15', notes: 'خطوات، بار 70كجم' },
      { exerciseId: 'run',               reps: '', distance: '400م' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل التكرار',
  },
  robbie: {
    key: 'robbie', nameAr: 'روبي', nameEn: 'Robbie', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '8', notes: 'Freestanding HSPU' },
      { exerciseId: 'rope-climb',       reps: '1', notes: 'L-Sit Rope Climb' },
    ],
    cooldownTargetsAr: 'الكتف + الجذع + قبضة اليد',
    scalingNote: 'مبتدئ: Pike Push-up + Rope Climb عادي',
  },
  shawn: {
    key: 'shawn', nameAr: 'شون', nameEn: 'Shawn', kind: 'hero', type: 'للوقت', duration: 50, rounds: null,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '8كم', notes: '5 أميال بفواصل 5 دقائق' },
      { exerciseId: 'air-squat', reps: '50', notes: 'بعد كل فاصل جري' },
      { exerciseId: 'push-up',   reps: '50', notes: 'بعد كل فاصل جري' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: تقليل المسافة والتكرار',
  },
  foo: {
    key: 'foo', nameAr: 'فو', nameEn: 'Foo', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'bench-press',          reps: '13', notes: '77كجم — تُنجز مرة واحدة قبل الـAMRAP' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '7' },
      { exerciseId: 'double-under',         reps: '77' },
      { exerciseId: 'dumbbell-thruster',    reps: '2', notes: 'Squat Clean Thruster بار 77كجم' },
      { exerciseId: 'sit-up',               reps: '28' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + الجذع',
    scalingNote: 'مبتدئ: أوزان أخف + عقلة عادية + قفز مفرد',
  },
  bowen: {
    key: 'bowen', nameAr: 'بوين', nameEn: 'Bowen', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '800م' },
      { exerciseId: 'deadlift',          reps: '7', notes: '125كجم Rx' },
      { exerciseId: 'burpee-pull-up',    reps: '10' },
      { exerciseId: 'dumbbell-thruster', reps: '14', notes: 'كيتل بيل يد واحدة 24كجم (7 لكل يد)' },
      { exerciseId: 'box-jump',          reps: '20', notes: '60سم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف + بيربي وعقلة منفصلين',
  },
  gaza: {
    key: 'gaza', nameAr: 'غزة', nameEn: 'Gaza', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'kettle-bell-swing', reps: '35', notes: '1.5 بود/24كجم' },
      { exerciseId: 'push-up',           reps: '30' },
      { exerciseId: 'pull-up',           reps: '25' },
      { exerciseId: 'box-jump',          reps: '20', notes: '75سم' },
      { exerciseId: 'run',               reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + ظهر + رباعية',
    scalingNote: 'مبتدئ: كيتل بيل أخف + Ring Row + صندوق أقل',
  },
  crain: {
    key: 'crain', nameAr: 'كرين', nameEn: 'Crain', kind: 'hero', type: 'للوقت', duration: 30, rounds: 2,
    movements: [
      { exerciseId: 'push-up',        reps: '34' },
      { exerciseId: 'run',            reps: '', distance: '45م', notes: 'عدو سريع بعد كل حركة' },
      { exerciseId: 'deadlift',       reps: '34', notes: '61كجم Rx' },
      { exerciseId: 'box-jump',       reps: '34', notes: '60سم' },
      { exerciseId: 'clean-and-jerk', reps: '34', notes: '43كجم Rx' },
      { exerciseId: 'burpee',         reps: '34' },
      { exerciseId: 'wall-ball',      reps: '34', notes: '9كجم' },
      { exerciseId: 'pull-up',        reps: '34' },
    ],
    cooldownTargetsAr: 'كامل الجسم — صدر + ظهر + رباعية',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل التكرار',
  },
  capoot: {
    key: 'capoot', nameAr: 'كابوت', nameEn: 'Capoot', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'push-up', reps: '100' },
      { exerciseId: 'run',     reps: '', distance: '800م' },
      { exerciseId: 'push-up', reps: '75' },
      { exerciseId: 'run',     reps: '', distance: '1.2كم' },
      { exerciseId: 'push-up', reps: '50' },
      { exerciseId: 'run',     reps: '', distance: '1.6كم' },
      { exerciseId: 'push-up', reps: '25' },
      { exerciseId: 'run',     reps: '', distance: '2كم' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: ضغط على الركبتين + تقليل المسافات',
  },
  hall: {
    key: 'hall', nameAr: 'هول', nameEn: 'Hall', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'power-clean',       reps: '3', notes: '102كجم Rx' },
      { exerciseId: 'run',               reps: '', distance: '200م', notes: 'عدو سريع' },
      { exerciseId: 'kettlebell-snatch', reps: '20', notes: '1.5 بود/24كجم (10 لكل يد)' },
    ],
    cooldownTargetsAr: 'الكتف + أسفل الظهر + الرباعية',
    scalingNote: 'مبتدئ: أوزان أخف (راحة دقيقتين بين الجولات)',
  },
  servais: {
    key: 'servais', nameAr: 'سيرفيه', nameEn: 'Servais', kind: 'hero', type: 'للوقت', duration: 50, rounds: null,
    movements: [
      { exerciseId: 'run',           reps: '', distance: '2.4كم', notes: '1.5 ميل' },
      { exerciseId: 'pull-up',       reps: '19', notes: '8 جولات' },
      { exerciseId: 'push-up',       reps: '19', notes: '8 جولات' },
      { exerciseId: 'burpee',        reps: '19', notes: '8 جولات' },
      { exerciseId: 'sandbag-carry', reps: '', distance: '400م', notes: 'كيس رمل ثقيل' },
      { exerciseId: 'farmers-carry', reps: '', distance: '1.6كم', notes: 'دمبل 20كجم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — ظهر + صدر + قبضة اليد',
    scalingNote: 'مبتدئ: تقليل المسافات + Ring Row',
  },
  pk: {
    key: 'pk', nameAr: 'بي كيه', nameEn: 'PK', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'back-squat', reps: '10', notes: '102كجم Rx' },
      { exerciseId: 'deadlift',   reps: '10', notes: '125كجم Rx' },
      { exerciseId: 'run',        reps: '', distance: '400م', notes: 'عدو سريع' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف (راحة دقيقتين بين الجولات)',
  },
  marco: {
    key: 'marco', nameAr: 'ماركو', nameEn: 'Marco', kind: 'hero', type: 'للوقت', duration: 20, rounds: 3,
    movements: [
      { exerciseId: 'pull-up',          reps: '21' },
      { exerciseId: 'handstand-pushup', reps: '15' },
      { exerciseId: 'thruster',         reps: '9', notes: '61كجم Rx' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكتف + الرباعية',
    scalingNote: 'مبتدئ: Ring Row + Pike Push-up + وزن أخف',
  },
  rene: {
    key: 'rene', nameAr: 'رينيه', nameEn: 'René', kind: 'hero', type: 'للوقت', duration: 30, rounds: 7,
    movements: [
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'walking-lunge', reps: '21', notes: 'خطوات، سترة 9كجم إن توفرت' },
      { exerciseId: 'pull-up',       reps: '15' },
      { exerciseId: 'burpee',        reps: '9' },
    ],
    cooldownTargetsAr: 'الرباعية + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: بدون سترة + Ring Row',
  },
  pike: {
    key: 'pike', nameAr: 'بايك', nameEn: 'Pike', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'thruster',         reps: '20', notes: '34كجم Rx' },
      { exerciseId: 'ring-dip',         reps: '10', notes: 'Strict' },
      { exerciseId: 'push-up',          reps: '20' },
      { exerciseId: 'handstand-pushup', reps: '10', notes: 'Strict' },
      { exerciseId: 'bear-crawl',       reps: '', distance: '50م' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + Bar Dip + Pike Push-up',
  },
  kutschbach: {
    key: 'kutschbach', nameAr: 'كوتشباخ', nameEn: 'Kutschbach', kind: 'hero', type: 'للوقت', duration: 25, rounds: 7,
    movements: [
      { exerciseId: 'back-squat', reps: '11', notes: '84كجم Rx' },
      { exerciseId: 'push-press', reps: '10', notes: 'Jerk 61كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  jennifer: {
    key: 'jennifer', nameAr: 'جينيفر', nameEn: 'Jennifer', kind: 'hero', type: 'AMRAP', duration: 26, rounds: null,
    movements: [
      { exerciseId: 'pull-up',           reps: '10' },
      { exerciseId: 'kettle-bell-swing', reps: '15', notes: '1.5 بود/24كجم' },
      { exerciseId: 'box-jump',          reps: '20', notes: '60سم' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الورك + الرباعية',
    scalingNote: 'مبتدئ: Ring Row + كيتل بيل أخف + صندوق أقل',
  },
  horton: {
    key: 'horton', nameAr: 'هورتون', nameEn: 'Horton', kind: 'hero', type: 'للوقت', duration: 30, rounds: 9,
    movements: [
      { exerciseId: 'bar-muscle-up',  reps: '9', notes: 'بارتنر — تبادل العمل' },
      { exerciseId: 'clean-and-jerk', reps: '11', notes: '70كجم Rx، بارتنر' },
      { exerciseId: 'partner-carry',  reps: '', distance: '45م', notes: 'حمل الشريك (Buddy Carry)' },
    ],
    cooldownTargetsAr: 'الكتف + أسفل الظهر + الرباعية',
    scalingNote: 'مبتدئ: 5 تكرارات لكل حركة + حمل كيس رمل بدل الشريك',
  },
  scooter: {
    key: 'scooter', nameAr: 'سكوتر', nameEn: 'Scooter', kind: 'hero', type: 'AMRAP', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'double-under', reps: '30', notes: 'بارتنر — تبادل بعد كل جولة' },
      { exerciseId: 'pull-up',      reps: '15' },
      { exerciseId: 'push-up',      reps: '15' },
      { exerciseId: 'run',          reps: '', distance: '100م', notes: 'عدو سريع' },
      { exerciseId: 'deadlift',     reps: '1RM', notes: '5 دقائق لإيجاد أقصى رفعة ثنائية بعد الـAMRAP' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + أسفل الظهر',
    scalingNote: 'مبتدئ: قفز مفرد + Ring Row (بدون شريك: راحة 60 ثانية بين الجولات)',
  },
  'matt-16': {
    key: 'matt-16', nameAr: 'مات 16', nameEn: 'Matt 16', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'deadlift',        reps: '16', notes: '125كجم Rx' },
      { exerciseId: 'hang-power-clean', reps: '16', notes: '84كجم Rx' },
      { exerciseId: 'push-press',      reps: '16', notes: '61كجم Rx' },
      { exerciseId: 'run',             reps: '', distance: '800م' },
      { exerciseId: 'deadlift',        reps: '16' },
      { exerciseId: 'hang-power-clean', reps: '16' },
      { exerciseId: 'push-press',      reps: '16' },
      { exerciseId: 'run',             reps: '', distance: '800م' },
      { exerciseId: 'deadlift',        reps: '16' },
      { exerciseId: 'hang-power-clean', reps: '16' },
      { exerciseId: 'push-press',      reps: '16' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  tup: {
    key: 'tup', nameAr: 'تي يو بي', nameEn: 'T.U.P.', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'power-clean', reps: '15-12-9-6-3', notes: '61كجم Rx' },
      { exerciseId: 'pull-up',     reps: '15-12-9-6-3' },
      { exerciseId: 'front-squat', reps: '15-12-9-6-3', notes: '61كجم Rx' },
      { exerciseId: 'pull-up',     reps: '15-12-9-6-3' },
    ],
    cooldownTargetsAr: 'الرباعية + الظهر العريض + الكتف',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row',
  },
  harper: {
    key: 'harper', nameAr: 'هاربر', nameEn: 'Harper', kind: 'hero', type: 'AMRAP', duration: 23, rounds: null,
    movements: [
      { exerciseId: 'chest-to-bar-pull-up', reps: '9' },
      { exerciseId: 'power-clean',          reps: '15', notes: '61كجم Rx' },
      { exerciseId: 'air-squat',            reps: '21' },
      { exerciseId: 'run',                  reps: '', distance: '400م', notes: 'صفيحة 20كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: عقلة عادية + وزن أخف',
  },
  sisson: {
    key: 'sisson', nameAr: 'سيسون', nameEn: 'Sisson', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'rope-climb', reps: '1' },
      { exerciseId: 'burpee',     reps: '5' },
      { exerciseId: 'run',        reps: '', distance: '200م', notes: 'سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: Rope Pull + بدون سترة',
  },
  terry: {
    key: 'terry', nameAr: 'تيري', nameEn: 'Terry', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '1.6كم' },
      { exerciseId: 'push-up',    reps: '100' },
      { exerciseId: 'bear-crawl', reps: '', distance: '100م' },
      { exerciseId: 'run',        reps: '', distance: '1.6كم' },
      { exerciseId: 'bear-crawl', reps: '', distance: '100م' },
      { exerciseId: 'push-up',    reps: '100' },
      { exerciseId: 'run',        reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: ضغط على الركبتين + تقليل المسافات',
  },
  'big-sexy': {
    key: 'big-sexy', nameAr: 'بيغ سيكسي', nameEn: 'Big Sexy', kind: 'hero', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'deadlift',             reps: '6', notes: '143كجم Rx' },
      { exerciseId: 'burpee',               reps: '6' },
      { exerciseId: 'power-clean',          reps: '5', notes: '102كجم Rx' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '5' },
      { exerciseId: 'thruster',             reps: '4', notes: '70كجم Rx' },
      { exerciseId: 'muscle-up',            reps: '4' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Dip+Pull-up',
  },
  woehlke: {
    key: 'woehlke', nameAr: 'ويلكه', nameEn: 'Woehlke', kind: 'hero', type: 'للوقت', duration: 30, rounds: 3,
    movements: [
      { exerciseId: 'push-press',  reps: '4', notes: 'Jerk 84كجم' },
      { exerciseId: 'front-squat', reps: '5', notes: '84كجم Rx' },
      { exerciseId: 'power-clean', reps: '6', notes: '84كجم Rx' },
      { exerciseId: 'pull-up',     reps: '40' },
      { exerciseId: 'push-up',     reps: '50' },
      { exerciseId: 'sit-up',      reps: '60' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الصدر',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row (راحة 3 دقائق بين الجولات)',
  },
  maupin: {
    key: 'maupin', nameAr: 'موبين', nameEn: 'Maupin', kind: 'hero', type: 'للوقت', duration: 30, rounds: 4,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '800م' },
      { exerciseId: 'push-up',   reps: '49' },
      { exerciseId: 'sit-up',    reps: '49' },
      { exerciseId: 'air-squat', reps: '49' },
    ],
    cooldownTargetsAr: 'الصدر + الجذع + الرباعية',
    scalingNote: 'مبتدئ: ضغط على الركبتين + تقليل التكرار',
  },
  hildy: {
    key: 'hildy', nameAr: 'هيلدي', nameEn: 'Hildy', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'row',       reps: '100 سعرة' },
      { exerciseId: 'thruster',  reps: '75', notes: 'بار 20كجم' },
      { exerciseId: 'pull-up',   reps: '50' },
      { exerciseId: 'wall-ball', reps: '75', notes: '9كجم' },
      { exerciseId: 'row',       reps: '100 سعرة', notes: 'سترة 9كجم إن توفرت' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: تقليل التكرار + بدون سترة',
  },
  tj: {
    key: 'tj', nameAr: 'تي جيه', nameEn: 'T.J.', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'bench-press', reps: '10', notes: '84كجم Rx' },
      { exerciseId: 'pull-up',     reps: '10', notes: 'Strict' },
      { exerciseId: 'thruster',    reps: 'أقصى مجموعة', notes: '61كجم — كرّر الثلاثية حتى 100 ثراستر' },
    ],
    cooldownTargetsAr: 'الصدر + الظهر العريض + الكتف',
    scalingNote: 'مبتدئ: أوزان أخف + Ring Row',
  },
  monti: {
    key: 'monti', nameAr: 'مونتي', nameEn: 'Monti', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'box-step-up',  reps: '50', notes: 'بار 20كجم، صندوق 50سم' },
      { exerciseId: 'power-clean',  reps: '15', notes: '61كجم Rx' },
      { exerciseId: 'box-step-up',  reps: '50', notes: 'بار 20كجم، صندوق 50سم' },
      { exerciseId: 'snatch',       reps: '10', notes: '61كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: بار أخف + صندوق أقل',
  },
  dvb: {
    key: 'dvb', nameAr: 'دي في بي', nameEn: 'DVB', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '1.6كم', notes: 'كرة طبية 9كجم' },
      { exerciseId: 'wall-ball',  reps: '10', notes: '8 جولات' },
      { exerciseId: 'rope-climb', reps: '1', notes: '8 جولات' },
      { exerciseId: 'run',        reps: '', distance: '800م', notes: 'كرة طبية 9كجم' },
      { exerciseId: 'wall-ball',  reps: '10', notes: '4 جولات' },
      { exerciseId: 'rope-climb', reps: '1', notes: '4 جولات' },
      { exerciseId: 'run',        reps: '', distance: '400م', notes: 'كرة طبية 9كجم' },
      { exerciseId: 'wall-ball',  reps: '10', notes: 'جولتان' },
      { exerciseId: 'rope-climb', reps: '1', notes: 'جولتان' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + قبضة اليد',
    scalingNote: 'مبتدئ: كرة أخف + Rope Pull + تقليل المسافات',
  },
  nickman: {
    key: 'nickman', nameAr: 'نيكمان', nameEn: 'Nickman', kind: 'hero', type: 'للوقت', duration: 35, rounds: 10,
    movements: [
      { exerciseId: 'farmers-carry',    reps: '', distance: '200م', notes: 'دمبل 25كجم و16كجم' },
      { exerciseId: 'weighted-pull-up', reps: '10', notes: 'دمبل 16كجم' },
      { exerciseId: 'dumbbell-snatch',  reps: '20', notes: 'Power Snatch بدمبل 25كجم بالتناوب' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الظهر العريض + الكتف',
    scalingNote: 'مبتدئ: أوزان أخف + عقلة عادية',
  },
  marston: {
    key: 'marston', nameAr: 'مارستون', nameEn: 'Marston', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'deadlift',          reps: '1', notes: '184كجم Rx' },
      { exerciseId: 'toes-to-bar',       reps: '10' },
      { exerciseId: 'bar-facing-burpee', reps: '15' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الجذع + الكتف',
    scalingNote: 'مبتدئ: وزن أخف + Knees-to-Elbows',
  },
  artie: {
    key: 'artie', nameAr: 'آرتي', nameEn: 'Artie', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '5' },
      { exerciseId: 'push-up',   reps: '10' },
      { exerciseId: 'air-squat', reps: '15' },
      { exerciseId: 'pull-up',   reps: '5' },
      { exerciseId: 'thruster',  reps: '10', notes: '43كجم Rx' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + الرباعية',
    scalingNote: 'مبتدئ: Ring Row + وزن أخف',
  },
  hollywood: {
    key: 'hollywood', nameAr: 'هوليوود', nameEn: 'Hollywood', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '2كم' },
      { exerciseId: 'wall-ball',   reps: '22', notes: '14كجم' },
      { exerciseId: 'muscle-up',   reps: '22' },
      { exerciseId: 'wall-ball',   reps: '22', notes: '14كجم' },
      { exerciseId: 'power-clean', reps: '22', notes: '84كجم Rx' },
      { exerciseId: 'wall-ball',   reps: '22', notes: '14كجم' },
      { exerciseId: 'run',         reps: '', distance: '2كم' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: كرة أخف + Ring Dip+Pull-up + وزن أخف',
  },
  manuel: {
    key: 'manuel', nameAr: 'مانويل', nameEn: 'Manuel', kind: 'hero', type: 'للوقت', duration: 50, rounds: 5,
    movements: [
      { exerciseId: 'rope-climb', reps: '', notes: '3 دقائق تسلق حبل، سترة 9كجم' },
      { exerciseId: 'air-squat',  reps: '', notes: 'دقيقتان قرفصاء' },
      { exerciseId: 'push-up',    reps: '', notes: 'دقيقتان ضغط' },
      { exerciseId: 'run',        reps: '', distance: '400م', notes: '3 دقائق للجري ثم راحة لبقية الوقت' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الرباعية + الصدر',
    scalingNote: 'مبتدئ: بدون سترة + Rope Pull',
  },
  tiff: {
    key: 'tiff', nameAr: 'تيف', nameEn: 'Tiff', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'run',                  reps: '', distance: '2.4كم', notes: '1.5 ميل، ثم AMRAP في المتبقي' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '11' },
      { exerciseId: 'squat-clean',          reps: '7', notes: 'Hang Squat Clean 70كجم' },
      { exerciseId: 'push-press',           reps: '7', notes: '70كجم Rx' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: مسافة أقصر + عقلة عادية + وزن أخف',
  },
  'paul-pena': {
    key: 'paul-pena', nameAr: 'بول بينا', nameEn: 'Paul Pena', kind: 'hero', type: 'للوقت', duration: 35, rounds: 7,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '100م', notes: 'عدو سريع' },
      { exerciseId: 'kettle-bell-swing', reps: '19', notes: '2 بود/32كجم' },
      { exerciseId: 'burpee-box-jump',   reps: '10', notes: '60سم' },
    ],
    cooldownTargetsAr: 'الورك + الكتف + الرباعية',
    scalingNote: 'مبتدئ: كيتل بيل أخف + صندوق أقل (راحة 3 دقائق بين الجولات)',
  },
  yeti: {
    key: 'yeti', nameAr: 'يتي', nameEn: 'Yeti', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '25' },
      { exerciseId: 'muscle-up', reps: '10' },
      { exerciseId: 'run',       reps: '', distance: '2.4كم', notes: '1.5 ميل' },
      { exerciseId: 'muscle-up', reps: '10' },
      { exerciseId: 'pull-up',   reps: '25' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + تقليل المسافة',
  },
  liam: {
    key: 'liam', nameAr: 'ليام', nameEn: 'Liam', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '800م', notes: 'صفيحة 20كجم' },
      { exerciseId: 'toes-to-bar', reps: '100' },
      { exerciseId: 'front-squat', reps: '50', notes: '70كجم Rx' },
      { exerciseId: 'rope-climb',  reps: '10' },
      { exerciseId: 'run',         reps: '', distance: '800م', notes: 'صفيحة 20كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الجذع + قبضة اليد',
    scalingNote: 'مبتدئ: صفيحة أخف + وزن أخف + تقليل التكرار',
  },
  wes: {
    key: 'wes', nameAr: 'ويس', nameEn: 'Wes', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'run',             reps: '', distance: '800م', notes: 'صفيحة 11كجم' },
      { exerciseId: 'pull-up',         reps: '5', notes: 'Strict، 14 جولة' },
      { exerciseId: 'burpee-box-jump', reps: '4', notes: '60سم، 14 جولة' },
      { exerciseId: 'power-clean',     reps: '3', notes: '84كجم Rx، 14 جولة' },
      { exerciseId: 'run',             reps: '', distance: '800م', notes: 'صفيحة 11كجم' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + الكتف',
    scalingNote: 'مبتدئ: صفيحة أخف + Ring Row + وزن أخف',
  },
  miron: {
    key: 'miron', nameAr: 'ميرون', nameEn: 'Miron', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'run',        reps: '', distance: '800م' },
      { exerciseId: 'back-squat', reps: '23', notes: '½ وزن الجسم' },
      { exerciseId: 'deadlift',   reps: '13', notes: '1¼ وزن الجسم' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + ربلة الساق',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  pat: {
    key: 'pat', nameAr: 'بات', nameEn: 'Pat', kind: 'hero', type: 'للوقت', duration: 30, rounds: 6,
    movements: [
      { exerciseId: 'pull-up',                   reps: '25', notes: 'سترة 9كجم' },
      { exerciseId: 'dumbbell-front-rack-lunge', reps: '', distance: '15م', notes: 'بار 34كجم Front-Rack Lunge' },
      { exerciseId: 'push-up',                   reps: '25' },
      { exerciseId: 'dumbbell-front-rack-lunge', reps: '', distance: '15م', notes: 'بار 34كجم Front-Rack Lunge' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + الصدر',
    scalingNote: 'مبتدئ: بدون سترة + Ring Row + وزن أخف',
  },
  scotty: {
    key: 'scotty', nameAr: 'سكوتي', nameEn: 'Scotty', kind: 'hero', type: 'AMRAP', duration: 11, rounds: null,
    movements: [
      { exerciseId: 'deadlift',          reps: '5', notes: '143كجم Rx' },
      { exerciseId: 'wall-ball',         reps: '18', notes: '9كجم' },
      { exerciseId: 'bar-facing-burpee', reps: '17' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + كرة أخف',
  },
  rich: {
    key: 'rich', nameAr: 'ريتش', nameEn: 'Rich', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'snatch',      reps: '13', notes: 'Squat Snatch 70كجم' },
      { exerciseId: 'pull-up',     reps: '10', notes: '10 جولات' },
      { exerciseId: 'run',         reps: '', distance: '100م', notes: 'عدو سريع، 10 جولات' },
      { exerciseId: 'squat-clean', reps: '13', notes: '70كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row',
  },
  'dallas-5': {
    key: 'dallas-5', nameAr: 'دالاس 5', nameEn: 'Dallas 5', kind: 'hero', type: 'AMRAP', duration: 29, rounds: null,
    movements: [
      { exerciseId: 'burpee',         reps: '', notes: 'محطة 5 دقائق' },
      { exerciseId: 'deadlift',       reps: '7', notes: '70كجم Rx، محطة 5 دقائق' },
      { exerciseId: 'box-jump',       reps: '7', notes: '60سم، محطة 5 دقائق' },
      { exerciseId: 'turkish-get-up', reps: '', notes: 'دمبل 18كجم، محطة 5 دقائق' },
      { exerciseId: 'snatch',         reps: '7', notes: '34كجم Rx، محطة 5 دقائق' },
      { exerciseId: 'push-up',        reps: '7', notes: 'محطة 5 دقائق' },
      { exerciseId: 'row',            reps: '', notes: 'سعرات، محطة 5 دقائق' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: أوزان أخف (راحة دقيقة بين المحطات)',
  },
  dunn: {
    key: 'dunn', nameAr: 'دَن', nameEn: 'Dunn', kind: 'hero', type: 'AMRAP', duration: 19, rounds: null,
    movements: [
      { exerciseId: 'muscle-up',        reps: '3' },
      { exerciseId: 'shuttle-run',      reps: '1', notes: '5-10-15 ياردة' },
      { exerciseId: 'box-jump-over',    reps: '6', notes: 'Burpee Box Jump-Over 50سم' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + ربلة الساق',
    scalingNote: 'مبتدئ: Ring Dip+Pull-up + صندوق أقل',
  },
  kev: {
    key: 'kev', nameAr: 'كيف', nameEn: 'Kev', kind: 'hero', type: 'AMRAP', duration: 26, rounds: null,
    movements: [
      { exerciseId: 'deadlift',          reps: '6', notes: '143كجم لكل شريك، بارتنر' },
      { exerciseId: 'bar-facing-burpee', reps: '9', notes: 'متزامن، بارتنر' },
      { exerciseId: 'bar-muscle-up',     reps: '9', notes: 'لكل شريك' },
      { exerciseId: 'partner-carry',     reps: '', distance: '17م', notes: 'حمل بار ثنائي 143كجم' },
    ],
    cooldownTargetsAr: 'أسفل الظهر + الكتف + الظهر العريض',
    scalingNote: 'مبتدئ: أوزان أخف + Jumping Bar Muscle-Up',
  },
  emily: {
    key: 'emily', nameAr: 'إيميلي', nameEn: 'Emily', kind: 'hero', type: 'للوقت', duration: 35, rounds: 10,
    movements: [
      { exerciseId: 'double-under', reps: '30' },
      { exerciseId: 'pull-up',      reps: '15' },
      { exerciseId: 'air-squat',    reps: '30' },
      { exerciseId: 'run',          reps: '', distance: '100م', notes: 'عدو سريع' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرباعية + ربلة الساق',
    scalingNote: 'مبتدئ: قفز مفرد + Ring Row (راحة دقيقتين بين الجولات)',
  },
  andy: {
    key: 'andy', nameAr: 'آندي', nameEn: 'Andy', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'thruster', reps: '25', notes: '52كجم Rx، سترة 9كجم' },
      { exerciseId: 'box-jump', reps: '50', notes: '60سم' },
      { exerciseId: 'deadlift', reps: '75', notes: '52كجم Rx' },
      { exerciseId: 'run',      reps: '', distance: '2.4كم', notes: '1.5 ميل' },
      { exerciseId: 'deadlift', reps: '75' },
      { exerciseId: 'box-jump', reps: '50' },
      { exerciseId: 'thruster', reps: '25' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + أسفل الظهر',
    scalingNote: 'مبتدئ: بدون سترة + أوزان أخف + تقليل المسافة',
  },
  viola: {
    key: 'viola', nameAr: 'فيولا', nameEn: 'Viola', kind: 'hero', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'run',          reps: '', distance: '400م' },
      { exerciseId: 'power-snatch', reps: '11', notes: '43كجم Rx' },
      { exerciseId: 'pull-up',      reps: '17' },
      { exerciseId: 'power-clean',  reps: '13', notes: '43كجم Rx' },
    ],
    cooldownTargetsAr: 'الكتف + الظهر العريض + الرباعية',
    scalingNote: 'مبتدئ: وزن أخف + Ring Row',
  },
  coffland: {
    key: 'coffland', nameAr: 'كوفلاند', nameEn: 'Coffland', kind: 'hero', type: 'للوقت', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'dead-hangs', reps: '', notes: 'تعليق على العارضة 6 دقائق' },
      { exerciseId: 'run',        reps: '', distance: '800م', notes: 'عند كل سقوط من العارضة' },
      { exerciseId: 'push-up',    reps: '30', notes: 'عند كل سقوط من العارضة' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الظهر العريض + الصدر',
    scalingNote: 'مبتدئ: تعليق بمساعدة + تقليل المسافة',
  },
  'the-lyon': {
    key: 'the-lyon', nameAr: 'ذا ليون', nameEn: 'The Lyon', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'squat-clean',          reps: '7', notes: '75كجم Rx' },
      { exerciseId: 'push-press',           reps: '7', notes: 'Shoulder-to-Overhead 75كجم' },
      { exerciseId: 'chest-to-bar-pull-up', reps: '7', notes: 'Burpee C2B' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: وزن أخف + عقلة عادية (راحة دقيقتين بين الجولات)',
  },
  t: {
    key: 't', nameAr: 'تي', nameEn: 'T', kind: 'hero', type: 'للوقت', duration: 30, rounds: 5,
    movements: [
      { exerciseId: 'run',               reps: '', distance: '100م', notes: 'عدو سريع' },
      { exerciseId: 'dumbbell-thruster', reps: '10', notes: 'Squat Clean Thruster بار 52كجم رجال/34كجم نساء' },
      { exerciseId: 'kettle-bell-swing', reps: '15' },
      { exerciseId: 'run',               reps: '', distance: '100م', notes: 'عدو سريع' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + الورك',
    scalingNote: 'مبتدئ: وزن أخف (راحة دقيقتين بين الجولات)',
  },
  havana: {
    key: 'havana', nameAr: 'هافانا', nameEn: 'Havana', kind: 'hero', type: 'AMRAP', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'double-under', reps: '150' },
      { exerciseId: 'push-up',      reps: '50' },
      { exerciseId: 'power-clean',  reps: '15', notes: '84كجم رجال، 57كجم نساء' },
    ],
    cooldownTargetsAr: 'الكتف + الصدر + ربلة الساق',
    scalingNote: 'مبتدئ: قفز مفرد + ضغط على الركبتين + وزن أخف',
  },
  tama: {
    key: 'tama', nameAr: 'تاما', nameEn: 'Tama', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'farmers-carry',    reps: '', distance: '800م', notes: 'بار يد واحدة 20كجم' },
      { exerciseId: 'toes-to-bar',      reps: '31' },
      { exerciseId: 'push-up',          reps: '31' },
      { exerciseId: 'front-squat',      reps: '31', notes: '43كجم Rx' },
      { exerciseId: 'farmers-carry',    reps: '', distance: '400م', notes: 'بار يد واحدة 43كجم' },
      { exerciseId: 'toes-to-bar',      reps: '31' },
      { exerciseId: 'push-up',          reps: '31' },
      { exerciseId: 'hang-power-clean', reps: '31', notes: '61كجم Rx' },
      { exerciseId: 'farmers-carry',    reps: '', distance: '200م', notes: 'بار يد واحدة 61كجم' },
    ],
    cooldownTargetsAr: 'قبضة اليد + الجذع + الرباعية',
    scalingNote: 'مبتدئ: أوزان أخف + تقليل المسافات',
  },
  otis: {
    key: 'otis', nameAr: 'أوتيس', nameEn: 'Otis', kind: 'hero', type: 'AMRAP', duration: 15, rounds: null,
    movements: [
      { exerciseId: 'back-squat',      reps: 'سلّم تصاعدي 1-2-3...', notes: '1¼ وزن الجسم' },
      { exerciseId: 'shoulder-press',  reps: 'سلّم تصاعدي 1-2-3...', notes: '½ وزن الجسم' },
      { exerciseId: 'deadlift',        reps: 'سلّم تصاعدي 1-2-3...', notes: '1¼ وزن الجسم' },
    ],
    cooldownTargetsAr: 'الرباعية + أسفل الظهر + الكتف',
    scalingNote: 'مبتدئ: أوزان أخف',
  },
  josie: {
    key: 'josie', nameAr: 'جوزي', nameEn: 'Josie', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'run',         reps: '', distance: '1.6كم', notes: 'سترة 9كجم' },
      { exerciseId: 'burpee',      reps: '30', notes: '3 جولات' },
      { exerciseId: 'power-clean', reps: '4', notes: '70كجم رجال/48كجم نساء، 3 جولات' },
      { exerciseId: 'front-squat', reps: '6', notes: '70كجم رجال/48كجم نساء، 3 جولات' },
      { exerciseId: 'run',         reps: '', distance: '1.6كم', notes: 'سترة 9كجم' },
    ],
    cooldownTargetsAr: 'الرباعية + الكتف + ربلة الساق',
    scalingNote: 'مبتدئ: بدون سترة + وزن أخف',
  },
  dork: {
    key: 'dork', nameAr: 'دورك', nameEn: 'Dork', kind: 'hero', type: 'للوقت', duration: 25, rounds: 6,
    movements: [
      { exerciseId: 'double-under',      reps: '60' },
      { exerciseId: 'kettle-bell-swing', reps: '30', notes: '25كجم رجال/16كجم نساء' },
      { exerciseId: 'burpee',            reps: '15' },
    ],
    cooldownTargetsAr: 'الكتف + الورك + ربلة الساق',
    scalingNote: 'مبتدئ: قفز مفرد + كيتل بيل أخف',
  },
  bert: {
    key: 'bert', nameAr: 'بيرت', nameEn: 'Bert', kind: 'hero', type: 'للوقت', duration: 40, rounds: null,
    movements: [
      { exerciseId: 'burpee',        reps: '50' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'push-up',       reps: '100' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'walking-lunge', reps: '150', notes: 'خطوات' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'air-squat',     reps: '200' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'walking-lunge', reps: '150', notes: 'خطوات' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'push-up',       reps: '100' },
      { exerciseId: 'run',           reps: '', distance: '400م' },
      { exerciseId: 'burpee',        reps: '50' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + صدر + ربلة الساق',
    scalingNote: 'مبتدئ: تقليل التكرار للنصف + ضغط على الركبتين',
  },

  // ═══ من Travel-WODs.pdf (CrossFit Bodyweight Workouts) — بدون معدات، بنشماركات رسمية + منتقاة من المجتمع ═══
  barbara: {
    key: 'barbara', nameAr: 'باربرا', nameEn: 'Barbara', kind: 'girl', type: 'للوقت', duration: 25, rounds: 5,
    movements: [
      { exerciseId: 'pull-up',   reps: '20' },
      { exerciseId: 'push-up',  reps: '30' },
      { exerciseId: 'sit-up',   reps: '40' },
      { exerciseId: 'air-squat', reps: '50' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + الجذع + الرباعية',
    scalingNote: 'مبتدئ: تقليل التكرار للنصف + Ring Row بدل العقلة',
  },
  chelsea: {
    key: 'chelsea', nameAr: 'تشيلسي', nameEn: 'Chelsea', kind: 'girl', type: 'EMOM', duration: 30, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '5',  notes: 'كل دقيقة على الدقيقة لمدة 30 دقيقة' },
      { exerciseId: 'push-up',  reps: '10' },
      { exerciseId: 'air-squat', reps: '15' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + الرباعية',
    scalingNote: 'مبتدئ: تقليل التكرار لكل حركة أو تقصير المدة إلى 20 دقيقة',
  },
  mary: {
    key: 'mary', nameAr: 'ماري', nameEn: 'Mary', kind: 'girl', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'handstand-pushup', reps: '5' },
      { exerciseId: 'pistol-squat',     reps: '10', notes: 'One-Legged Squat بالتناوب' },
      { exerciseId: 'pull-up',          reps: '15' },
    ],
    cooldownTargetsAr: 'الكتف + الرباعية + الظهر العريض',
    scalingNote: 'مبتدئ: Pike Push-up + قرفصاء عادية بدل المسدس',
  },
  nicole: {
    key: 'nicole', nameAr: 'نيكول', nameEn: 'Nicole', kind: 'girl', type: 'AMRAP', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'run',      reps: '', distance: '400م' },
      { exerciseId: 'pull-up',  reps: 'أقصى عدد ممكن', notes: 'سجّل عدد العقلات في كل جولة' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الكاحل + الرئتين',
    scalingNote: 'مبتدئ: مسافة أقصر + Ring Row بدل العقلة',
  },
  'death-by-pullups': {
    key: 'death-by-pullups', nameAr: 'الموت بالعقلة', nameEn: 'Death by Pullups', kind: 'hero', type: 'سلم تصاعدي (EMOM حتى الفشل)', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'pull-up', reps: '1 ثم 2 ثم 3...', notes: 'زيادة تكرار واحد كل دقيقة حتى الفشل عن إكمال العدد بالدقيقة' },
    ],
    cooldownTargetsAr: 'الظهر العريض + قبضة اليد',
    scalingNote: 'مبتدئ: Ring Row بدل العقلة بنفس نمط السلم',
  },
  'gi-jane': {
    key: 'gi-jane', nameAr: 'جي آي جين', nameEn: 'GI Jane', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [{ exerciseId: 'burpee-pull-up', reps: '100' }],
    cooldownTargetsAr: 'كامل الجسم — كتف + رئتين + رباعية',
    scalingNote: 'مبتدئ: 50 تكرار + Ring Row بدل جزء من العقلة',
  },
  'tabata-something-else': {
    key: 'tabata-something-else', nameAr: 'تاباتا سمثنق إلس', nameEn: 'Tabata Something Else', kind: 'hero', type: 'تاباتا', duration: 16, rounds: null,
    movements: [
      { exerciseId: 'pull-up',   reps: '8 فترات × 20 ثانية عمل/10 ثانية راحة' },
      { exerciseId: 'push-up',  reps: '8 فترات × 20/10' },
      { exerciseId: 'sit-up',   reps: '8 فترات × 20/10' },
      { exerciseId: 'air-squat', reps: '8 فترات × 20/10' },
    ],
    cooldownTargetsAr: 'كامل الجسم',
    scalingNote: 'مبتدئ: نسخة معدّلة من كل حركة (Ring Row، ضغط على الركبة)',
  },
  'running-tabata-something-else': {
    key: 'running-tabata-something-else', nameAr: 'تاباتا الجري', nameEn: 'Running Tabata Something Else', kind: 'hero', type: 'للوقت', duration: 35, rounds: null,
    movements: [
      { exerciseId: 'pull-up',  reps: '8 فترات × 20/10', notes: 'جولة تاباتا واحدة' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'push-up', reps: '8 فترات × 20/10' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'sit-up',  reps: '8 فترات × 20/10' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'air-squat', reps: '8 فترات × 20/10' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — رئتين + رباعية + ظهر',
    scalingNote: 'مبتدئ: تقليل مسافة الجري للنصف',
  },
  'bodyweight-fran': {
    key: 'bodyweight-fran', nameAr: 'فران بدون معدات', nameEn: 'Bodyweight Fran', kind: 'hero', type: 'للوقت', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'pull-up', reps: '21-15-9' },
      { exerciseId: 'burpee',  reps: '21-15-9' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الرئتين + الكتف',
    scalingNote: 'مبتدئ: Ring Row بدل العقلة',
  },
  'segmented-bodyweight-fran': {
    key: 'segmented-bodyweight-fran', nameAr: 'فران بدون معدات (مجزأة)', nameEn: 'Segmented Bodyweight Fran', kind: 'hero', type: 'للوقت', duration: 12, rounds: null,
    movements: [
      { exerciseId: 'pull-up',  reps: '21-15-9' },
      { exerciseId: 'push-up', reps: '21-15-9' },
      { exerciseId: 'air-squat', reps: '21-15-9', notes: 'قفزة انفجارية (Squat Jump) لهدف 30سم فوق أقصى مدى' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + الظهر العريض',
    scalingNote: 'مبتدئ: قرفصاء عادية بدل القفز الانفجاري',
  },
  'running-with-angie': {
    key: 'running-with-angie', nameAr: 'آنجي الجارية', nameEn: 'Running with Angie', kind: 'hero', type: 'للوقت', duration: 45, rounds: null,
    movements: [
      { exerciseId: 'pull-up',  reps: '100' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'push-up', reps: '100' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'sit-up',  reps: '100' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
      { exerciseId: 'air-squat', reps: '100' },
      { exerciseId: 'run',      reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + صدر + جذع + رباعية',
    scalingNote: 'مبتدئ: تقليل كل التكرارات للنصف + تقليل مسافة الجري',
  },
  'murph-tribute': {
    key: 'murph-tribute', nameAr: 'تحية مورف', nameEn: 'Murph Tribute', kind: 'hero', type: 'للوقت', duration: 60, rounds: null,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '1.6كم' },
      { exerciseId: 'pull-up',   reps: '50' },
      { exerciseId: 'push-up',  reps: '100' },
      { exerciseId: 'sit-up',   reps: '150' },
      { exerciseId: 'air-squat', reps: '200' },
      { exerciseId: 'run',       reps: '', distance: '1.6كم' },
      { exerciseId: 'pull-up',   reps: '50' },
      { exerciseId: 'push-up',  reps: '100' },
      { exerciseId: 'sit-up',   reps: '150' },
      { exerciseId: 'air-squat', reps: '200' },
      { exerciseId: 'run',       reps: '', distance: '1.6كم' },
    ],
    cooldownTargetsAr: 'كامل الجسم — أرجل + كتف + ظهر',
    scalingNote: 'مبتدئ: نصف الكمية (Half Murph Tribute) + تقسيم التكرارات على أسلوب Cindy',
  },
  'bad-snake': {
    key: 'bad-snake', nameAr: 'باد سنيك', nameEn: 'Bad Snake', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'jump-rope',        reps: '100' },
      { exerciseId: 'knees-to-elbows',  reps: '21' },
      { exerciseId: 'push-up',          reps: '50' },
      { exerciseId: 'l-pull-up',        reps: '15' },
      { exerciseId: 'jump-rope',        reps: '100' },
      { exerciseId: 'knees-to-elbows',  reps: '15' },
      { exerciseId: 'push-up',          reps: '35' },
      { exerciseId: 'l-pull-up',        reps: '12' },
      { exerciseId: 'jump-rope',        reps: '100' },
      { exerciseId: 'knees-to-elbows',  reps: '12' },
      { exerciseId: 'push-up',          reps: '20' },
      { exerciseId: 'l-pull-up',        reps: '9' },
    ],
    cooldownTargetsAr: 'الجذع + الظهر العريض + الكاحل',
    scalingNote: 'مبتدئ: تقليل تكرار القفز للنصف + عقلة عادية بدل L-Pull-up',
  },
  seppuku: {
    key: 'seppuku', nameAr: 'سيبوكو', nameEn: 'Seppuku', kind: 'hero', type: 'للوقت', duration: 20, rounds: 10,
    movements: [
      { exerciseId: 'l-pull-up',       reps: '10' },
      { exerciseId: 'ring-push-up',    reps: '10' },
      { exerciseId: 'knees-to-elbows', reps: '10' },
    ],
    cooldownTargetsAr: 'الظهر العريض + الصدر + الجذع',
    scalingNote: 'مبتدئ: عقلة عادية + ضغط عادي بدل الحلقات',
  },
  '20-pieces-of-angie': {
    key: '20-pieces-of-angie', nameAr: 'عشرون قطعة من آنجي', nameEn: '20 Pieces of Angie', kind: 'hero', type: 'للوقت', duration: 25, rounds: 20,
    movements: [
      { exerciseId: 'pull-up',   reps: '5' },
      { exerciseId: 'push-up',  reps: '5' },
      { exerciseId: 'sit-up',   reps: '5' },
      { exerciseId: 'air-squat', reps: '5' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + صدر + جذع + رباعية',
    scalingNote: 'مبتدئ: 10 جولات بدل 20',
  },
  'burning-rings-of-fire': {
    key: 'burning-rings-of-fire', nameAr: 'حلقات النار المشتعلة', nameEn: 'Burning Rings of Fire', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'ring-push-up', reps: '10' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'Archer Push-up، 5 لكل جانب' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'Ring Flyes' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'قبضة عريضة (Wide Grip)' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'ساق واحدة، 5 لكل جانب' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'Pseudo-Planche' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'Jackknife' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'Dive Bomber' },
      { exerciseId: 'ring-push-up', reps: '10', notes: 'مرتفع (Elevated)' },
      { exerciseId: 'ring-push-up', reps: '10' },
    ],
    cooldownTargetsAr: 'الصدر + الكتف + الترايسبس',
    scalingNote: 'مبتدئ: ضغط عادي بدل نصف التنويعات',
  },
  'playing-with-pushups': {
    key: 'playing-with-pushups', nameAr: 'اللعب بالضغط', nameEn: 'Playing with Pushups', kind: 'hero', type: 'للوقت', duration: 20, rounds: null,
    movements: [
      { exerciseId: 'run',           reps: '', distance: '100م' },
      { exerciseId: 'push-up',       reps: '20' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'ring-push-up',  reps: '15', notes: 'Clap Push-up' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '10', notes: 'Chest-Slap' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '5',  notes: 'Fingertip' },
      { exerciseId: 'run',           reps: '', distance: '100م' },
      { exerciseId: 'push-up',       reps: '15' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'ring-push-up',  reps: '10', notes: 'Clap Push-up' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '10', notes: 'Chest-Slap' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '5',  notes: 'Fingertip' },
      { exerciseId: 'run',           reps: '', distance: '100م' },
      { exerciseId: 'push-up',       reps: '10' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'ring-push-up',  reps: '10', notes: 'Clap Push-up' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '10', notes: 'Chest-Slap' },
      { exerciseId: 'burpee',        reps: '5' },
      { exerciseId: 'push-up',       reps: '5',  notes: 'Fingertip' },
    ],
    cooldownTargetsAr: 'الصدر + الترايسبس + الرئتين',
    scalingNote: 'مبتدئ: ضغط على الركبتين لكل التنويعات',
  },
  balboa: {
    key: 'balboa', nameAr: 'بالبوا', nameEn: 'Balboa', kind: 'hero', type: 'للوقت', duration: 20, rounds: 4,
    movements: [
      { exerciseId: 'jump-rope',       reps: '100' },
      { exerciseId: 'run',             reps: '', distance: '400م' },
      { exerciseId: 'burpee-pull-up',  reps: '10', notes: 'Bodyblaster — بيربي + عقلة + ركبتين للمرفقين' },
    ],
    cooldownTargetsAr: 'كامل الجسم — رئتين + ظهر + جذع',
    scalingNote: 'مبتدئ: تقليل التكرار للنصف',
  },
  'crouching-tiger': {
    key: 'crouching-tiger', nameAr: 'النمر القابع', nameEn: 'Crouching Tiger', kind: 'hero', type: 'للوقت', duration: 25, rounds: null,
    movements: [
      { exerciseId: 'air-squat',     reps: '50' },
      { exerciseId: 'push-up',       reps: '25' },
      { exerciseId: 'pistol-squat',  reps: '50', notes: 'بالتناوب' },
      { exerciseId: 'push-up',       reps: '25', notes: 'Fingertip' },
      { exerciseId: 'walking-lunge', reps: '50', notes: 'طعنة جانبية (Side Lunge)' },
      { exerciseId: 'push-up',       reps: '25', notes: 'Knuckle' },
      { exerciseId: 'walking-lunge', reps: '50' },
      { exerciseId: 'push-up',       reps: '25', notes: 'Diamond' },
    ],
    cooldownTargetsAr: 'الرباعية + الصدر + الترايسبس + الورك',
    scalingNote: 'مبتدئ: قرفصاء عادية بدل المسدس + ضغط على الركبتين',
  },
  'fractured-runny-angie': {
    key: 'fractured-runny-angie', nameAr: 'آنجي الجارية المكسورة', nameEn: 'Fractured Runny Angie', kind: 'hero', type: 'للوقت', duration: 15, rounds: null,
    movements: [
      { exerciseId: 'run',       reps: '', distance: '400م' },
      { exerciseId: 'pull-up',   reps: '25' },
      { exerciseId: 'push-up',  reps: '25' },
      { exerciseId: 'sit-up',   reps: '25' },
      { exerciseId: 'air-squat', reps: '25' },
    ],
    cooldownTargetsAr: 'كامل الجسم — كتف + صدر + جذع + رباعية',
    scalingNote: 'مبتدئ: تقليل التكرار إلى 15 لكل حركة',
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
