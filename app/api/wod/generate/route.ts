import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Available exercises in the system
const EXERCISES = [
  { id: 'back-squat', nameEn: 'Back Squat', nameAr: 'القرفصاء الخلفية', category: 'strength' },
  { id: 'front-squat', nameEn: 'Front Squat', nameAr: 'القرفصاء الأمامية', category: 'strength' },
  { id: 'deadlift', nameEn: 'Deadlift', nameAr: 'الرفعة الميتة', category: 'strength' },
  { id: 'power-clean', nameEn: 'Power Clean', nameAr: 'النظيفة القوية', category: 'olympic' },
  { id: 'clean-and-jerk', nameEn: 'Clean & Jerk', nameAr: 'النظيفة والخطف', category: 'olympic' },
  { id: 'snatch', nameEn: 'Snatch', nameAr: 'الخطف', category: 'olympic' },
  { id: 'overhead-squat', nameEn: 'Overhead Squat', nameAr: 'القرفصاء فوق الرأس', category: 'strength' },
  { id: 'shoulder-press', nameEn: 'Shoulder Press', nameAr: 'الضغط فوق الرأس', category: 'strength' },
  { id: 'push-press', nameEn: 'Push Press', nameAr: 'الدفع بالساقين', category: 'strength' },
  { id: 'thruster', nameEn: 'Thruster', nameAr: 'الثراستر', category: 'wod' },
  { id: 'pull-up', nameEn: 'Pull Up', nameAr: 'العقلة', category: 'gymnastics' },
  { id: 'kipping-pull-up', nameEn: 'Kipping Pull Up', nameAr: 'العقلة الكيبينج', category: 'gymnastics' },
  { id: 'muscle-up', nameEn: 'Muscle Up', nameAr: 'الماسل أب', category: 'gymnastics' },
  { id: 'handstand-pushup', nameEn: 'Handstand Push Up', nameAr: 'الضغط على اليدين', category: 'gymnastics' },
  { id: 'handstand-walk', nameEn: 'Handstand Walk', nameAr: 'المشي على اليدين', category: 'gymnastics' },
  { id: 'toes-to-bar', nameEn: 'Toes to Bar', nameAr: 'الأصابع للعارضة', category: 'gymnastics' },
  { id: 'double-under', nameEn: 'Double Under', nameAr: 'القفز المزدوج', category: 'cardio' },
  { id: 'box-jump', nameEn: 'Box Jump', nameAr: 'القفز على الصندوق', category: 'wod' },
  { id: 'burpee', nameEn: 'Burpee', nameAr: 'البيربي', category: 'cardio' },
  { id: 'wall-ball', nameEn: 'Wall Ball', nameAr: 'كرة الحائط', category: 'wod' },
  { id: 'kettle-bell-swing', nameEn: 'Kettlebell Swing', nameAr: 'هزة الكيتل بيل', category: 'wod' },
  { id: 'row', nameEn: 'Row', nameAr: 'التجديف', category: 'cardio' },
  { id: 'run', nameEn: 'Run', nameAr: 'الجري', category: 'cardio' },
  { id: 'push-up', nameEn: 'Push Up', nameAr: 'الضغط', category: 'gymnastics' },
  { id: 'sit-up', nameEn: 'Sit Up', nameAr: 'الجلوس', category: 'gymnastics' },
  { id: 'rope-climb', nameEn: 'Rope Climb', nameAr: 'تسلق الحبل', category: 'gymnastics' },
];

const WARMUP_EXERCISES = [
  { id: 'run', nameEn: 'Run', reps: '400م', weight: '' },
  { id: 'double-under', nameEn: 'Double Under', reps: '50', weight: '' },
  { id: 'pull-up', nameEn: 'Pull Up', reps: '10', weight: '' },
  { id: 'push-up', nameEn: 'Push Up', reps: '10', weight: '' },
  { id: 'sit-up', nameEn: 'Sit Up', reps: '15', weight: '' },
  { id: 'box-jump', nameEn: 'Box Jump', reps: '10', weight: '' },
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { date, focus, difficulty = 'متوسط' } = body;

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');

  const prompt = `أنت مبرمج CrossFit محترف بخبرة تزيد عن 10 سنوات، متخصص في برمجة تمارين على مستوى CompTrain وPRVN Athletics وMisfit Athletics وCrossFit.com.

مهمتك: توليد تمرين CrossFit يومي متكامل وعالي المستوى.

**المتطلبات الأساسية:**
1. يجب أن يتكون التمرين من قسمين رئيسيين:
   - **تمرين القوة (Strength)**: حركة أو مجموعة حركات قوة أو رفع أثقال أولمبي مع مجموعات وتكرارات وأوزان مقترحة
   - **الـ Metcon (WOD)**: تمرين لياقة قلبي وعائي مكثف ومرتبط بتمرين القوة من ناحية حركات العضلات أو نمط التدريب
2. يجب أن يكونا **ذوي علاقة** ببعضهما (مثلاً: إذا كانت القوة Deadlift فالميتكون يحتوي على Deadlift أو KB Swing أو Row)
3. اتبع مبادئ البرمجة العالمية الاحترافية: تنوع الحركات، التوازن بين الشد والدفع، التعافي المناسب
4. الصعوبة المطلوبة: ${difficulty}

**قائمة التمارين المتاحة في النظام (يجب استخدام ID المطابق):**
${exerciseList}

**المطلوب**: أرجع JSON بالتنسيق التالي بالضبط بدون أي نص خارج JSON:
{
  "title": "عنوان التمرين اليومي بالعربية",
  "type": "للوقت أو AMRAP أو قوة",
  "duration": 20,
  "rounds": null,
  "notes": "ملاحظات مفيدة للمتدربين",
  "theme": "وصف مختصر للرابط بين تمرين القوة والميتكون",
  "warmup": [
    {"exerciseId": "id من القائمة", "reps": "التكرارات", "weight": "", "distance": "", "time": "", "notes": ""}
  ],
  "strength": [
    {"exerciseId": "id من القائمة", "reps": "المجموعات×التكرارات", "weight": "الوزن المقترح", "distance": "", "time": "", "notes": "تعليمات القوة"}
  ],
  "metcon": [
    {"exerciseId": "id من القائمة", "reps": "التكرارات", "weight": "الوزن المقترح", "distance": "", "time": "", "notes": ""}
  ],
  "cooldown": [
    {"exerciseId": "id من القائمة", "reps": "", "weight": "", "distance": "", "time": "60 ثانية", "notes": "تمطيط"}
  ]
}

**قواعد مهمة:**
- استخدم فقط IDs من القائمة المتاحة أعلاه
- الإحماء يجب أن يكون 3-4 تمارين خفيفة تُهيئ العضلات للتمرين
- تمرين القوة: 3-5 مجموعات، ركز على الحركات الأساسية
- الميتكون: تمرين مكثف 7-20 دقيقة، 2-4 تمارين مترابطة
- التهدئة: 2-3 تمارين تمطيط
- الأوزان المقترحة للرجال مناسبة لمتدربين متوسطي المستوى
- اجعل الميتكون مرتبطاً بشكل واضح بتمرين القوة
${focus ? `- التركيز اليوم على: ${focus}` : ''}
${date ? `- تاريخ التمرين: ${date}` : ''}

أرجع JSON فقط، بدون أي كلام قبله أو بعده.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract text from response
    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        jsonText = block.text.trim();
        break;
      }
    }

    // Clean up any markdown code blocks
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    let generated;
    try {
      generated = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'خطأ في تحليل الرد من الذكاء الاصطناعي', raw: jsonText }, { status: 500 });
    }

    // Validate that exerciseIds exist
    const validIds = new Set(EXERCISES.map(e => e.id));
    const validateSection = (items: any[]) =>
      (items || []).map((item: any) => ({
        ...item,
        exerciseId: validIds.has(item.exerciseId) ? item.exerciseId : '',
        reps: item.reps || '',
        weight: item.weight || '',
        distance: item.distance || '',
        time: item.time || '',
        notes: item.notes || '',
      }));

    const wodData = {
      date: date || new Date().toISOString().split('T')[0],
      title: generated.title || 'تمرين يومي',
      type: generated.type || 'للوقت',
      duration: generated.duration || 20,
      rounds: generated.rounds || null,
      notes: generated.notes || '',
      aiTheme: generated.theme || '',
      warmup: validateSection(generated.warmup),
      strength: validateSection(generated.strength),
      metcon: validateSection(generated.metcon),
      cooldown: validateSection(generated.cooldown),
    };

    return NextResponse.json({ wod: wodData, theme: generated.theme });
  } catch (error: any) {
    console.error('AI WOD generation error:', error);
    return NextResponse.json(
      { error: error.message || 'خطأ في توليد التمرين بالذكاء الاصطناعي' },
      { status: 500 }
    );
  }
}
