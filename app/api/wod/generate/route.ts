import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Available exercises in the system
const EXERCISES = [
  { id: 'back-squat', nameEn: 'Back Squat', nameAr: 'ط§ظ„ظ‚ط±ظپطµط§ط، ط§ظ„ط®ظ„ظپظٹط©', category: 'strength' },
  { id: 'front-squat', nameEn: 'Front Squat', nameAr: 'ط§ظ„ظ‚ط±ظپطµط§ط، ط§ظ„ط£ظ…ط§ظ…ظٹط©', category: 'strength' },
  { id: 'deadlift', nameEn: 'Deadlift', nameAr: 'ط§ظ„ط±ظپط¹ط© ط§ظ„ظ…ظٹطھط©', category: 'strength' },
  { id: 'power-clean', nameEn: 'Power Clean', nameAr: 'ط§ظ„ظ†ط¸ظٹظپط© ط§ظ„ظ‚ظˆظٹط©', category: 'olympic' },
  { id: 'clean-and-jerk', nameEn: 'Clean & Jerk', nameAr: 'ط§ظ„ظ†ط¸ظٹظپط© ظˆط§ظ„ط®ط·ظپ', category: 'olympic' },
  { id: 'snatch', nameEn: 'Snatch', nameAr: 'ط§ظ„ط®ط·ظپ', category: 'olympic' },
  { id: 'overhead-squat', nameEn: 'Overhead Squat', nameAr: 'ط§ظ„ظ‚ط±ظپطµط§ط، ظپظˆظ‚ ط§ظ„ط±ط£ط³', category: 'strength' },
  { id: 'shoulder-press', nameEn: 'Shoulder Press', nameAr: 'ط§ظ„ط¶ط؛ط· ظپظˆظ‚ ط§ظ„ط±ط£ط³', category: 'strength' },
  { id: 'push-press', nameEn: 'Push Press', nameAr: 'ط§ظ„ط¯ظپط¹ ط¨ط§ظ„ط³ط§ظ‚ظٹظ†', category: 'strength' },
  { id: 'thruster', nameEn: 'Thruster', nameAr: 'ط§ظ„ط«ط±ط§ط³طھط±', category: 'wod' },
  { id: 'pull-up', nameEn: 'Pull Up', nameAr: 'ط§ظ„ط¹ظ‚ظ„ط©', category: 'gymnastics' },
  { id: 'kipping-pull-up', nameEn: 'Kipping Pull Up', nameAr: 'ط§ظ„ط¹ظ‚ظ„ط© ط§ظ„ظƒظٹط¨ظٹظ†ط¬', category: 'gymnastics' },
  { id: 'muscle-up', nameEn: 'Muscle Up', nameAr: 'ط§ظ„ظ…ط§ط³ظ„ ط£ط¨', category: 'gymnastics' },
  { id: 'handstand-pushup', nameEn: 'Handstand Push Up', nameAr: 'ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ ط§ظ„ظٹط¯ظٹظ†', category: 'gymnastics' },
  { id: 'handstand-walk', nameEn: 'Handstand Walk', nameAr: 'ط§ظ„ظ…ط´ظٹ ط¹ظ„ظ‰ ط§ظ„ظٹط¯ظٹظ†', category: 'gymnastics' },
  { id: 'toes-to-bar', nameEn: 'Toes to Bar', nameAr: 'ط§ظ„ط£طµط§ط¨ط¹ ظ„ظ„ط¹ط§ط±ط¶ط©', category: 'gymnastics' },
  { id: 'double-under', nameEn: 'Double Under', nameAr: 'ط§ظ„ظ‚ظپط² ط§ظ„ظ…ط²ط¯ظˆط¬', category: 'cardio' },
  { id: 'box-jump', nameEn: 'Box Jump', nameAr: 'ط§ظ„ظ‚ظپط² ط¹ظ„ظ‰ ط§ظ„طµظ†ط¯ظˆظ‚', category: 'wod' },
  { id: 'burpee', nameEn: 'Burpee', nameAr: 'ط§ظ„ط¨ظٹط±ط¨ظٹ', category: 'cardio' },
  { id: 'wall-ball', nameEn: 'Wall Ball', nameAr: 'ظƒط±ط© ط§ظ„ط­ط§ط¦ط·', category: 'wod' },
  { id: 'kettle-bell-swing', nameEn: 'Kettlebell Swing', nameAr: 'ظ‡ط²ط© ط§ظ„ظƒظٹطھظ„ ط¨ظٹظ„', category: 'wod' },
  { id: 'row', nameEn: 'Row', nameAr: 'ط§ظ„طھط¬ط¯ظٹظپ', category: 'cardio' },
  { id: 'run', nameEn: 'Run', nameAr: 'ط§ظ„ط¬ط±ظٹ', category: 'cardio' },
  { id: 'push-up', nameEn: 'Push Up', nameAr: 'ط§ظ„ط¶ط؛ط·', category: 'gymnastics' },
  { id: 'sit-up', nameEn: 'Sit Up', nameAr: 'ط§ظ„ط¬ظ„ظˆط³', category: 'gymnastics' },
  { id: 'rope-climb', nameEn: 'Rope Climb', nameAr: 'طھط³ظ„ظ‚ ط§ظ„ط­ط¨ظ„', category: 'gymnastics' },
];

const WARMUP_EXERCISES = [
  { id: 'run', nameEn: 'Run', reps: '400ظ…', weight: '' },
  { id: 'double-under', nameEn: 'Double Under', reps: '50', weight: '' },
  { id: 'pull-up', nameEn: 'Pull Up', reps: '10', weight: '' },
  { id: 'push-up', nameEn: 'Push Up', reps: '10', weight: '' },
  { id: 'sit-up', nameEn: 'Sit Up', reps: '15', weight: '' },
  { id: 'box-jump', nameEn: 'Box Jump', reps: '10', weight: '' },
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'ط؛ظٹط± ظ…طµط±ط­' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { date, focus, difficulty = 'ظ…طھظˆط³ط·' } = body;

  const exerciseList = EXERCISES.map(e => `- ${e.id} (${e.nameEn} / ${e.nameAr}) [${e.category}]`).join('\n');

  const prompt = `ط£ظ†طھ ظ…ط¨ط±ظ…ط¬ CrossFit ظ…ط­طھط±ظپ ط¨ط®ط¨ط±ط© طھط²ظٹط¯ ط¹ظ† 10 ط³ظ†ظˆط§طھطŒ ظ…طھط®طµطµ ظپظٹ ط¨ط±ظ…ط¬ط© طھظ…ط§ط±ظٹظ† ط¹ظ„ظ‰ ظ…ط³طھظˆظ‰ CompTrain ظˆPRVN Athletics ظˆMisfit Athletics ظˆCrossFit.com.

ظ…ظ‡ظ…طھظƒ: طھظˆظ„ظٹط¯ طھظ…ط±ظٹظ† CrossFit ظٹظˆظ…ظٹ ظ…طھظƒط§ظ…ظ„ ظˆط¹ط§ظ„ظٹ ط§ظ„ظ…ط³طھظˆظ‰.

**ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©:**
1. ظٹط¬ط¨ ط£ظ† ظٹطھظƒظˆظ† ط§ظ„طھظ…ط±ظٹظ† ظ…ظ† ظ‚ط³ظ…ظٹظ† ط±ط¦ظٹط³ظٹظٹظ†:
   - **طھظ…ط±ظٹظ† ط§ظ„ظ‚ظˆط© (Strength)**: ط­ط±ظƒط© ط£ظˆ ظ…ط¬ظ…ظˆط¹ط© ط­ط±ظƒط§طھ ظ‚ظˆط© ط£ظˆ ط±ظپط¹ ط£ط«ظ‚ط§ظ„ ط£ظˆظ„ظ…ط¨ظٹ ظ…ط¹ ظ…ط¬ظ…ظˆط¹ط§طھ ظˆطھظƒط±ط§ط±ط§طھ ظˆط£ظˆط²ط§ظ† ظ…ظ‚طھط±ط­ط©
   - **ط§ظ„ظ€ Metcon (WOD)**: طھظ…ط±ظٹظ† ظ„ظٹط§ظ‚ط© ظ‚ظ„ط¨ظٹ ظˆط¹ط§ط¦ظٹ ظ…ظƒط«ظپ ظˆظ…ط±طھط¨ط· ط¨طھظ…ط±ظٹظ† ط§ظ„ظ‚ظˆط© ظ…ظ† ظ†ط§ط­ظٹط© ط­ط±ظƒط§طھ ط§ظ„ط¹ط¶ظ„ط§طھ ط£ظˆ ظ†ظ…ط· ط§ظ„طھط¯ط±ظٹط¨
2. ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ†ط§ **ط°ظˆظٹ ط¹ظ„ط§ظ‚ط©** ط¨ط¨ط¹ط¶ظ‡ظ…ط§ (ظ…ط«ظ„ط§ظ‹: ط¥ط°ط§ ظƒط§ظ†طھ ط§ظ„ظ‚ظˆط© Deadlift ظپط§ظ„ظ…ظٹطھظƒظˆظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ Deadlift ط£ظˆ KB Swing ط£ظˆ Row)
3. ط§طھط¨ط¹ ظ…ط¨ط§ط¯ط¦ ط§ظ„ط¨ط±ظ…ط¬ط© ط§ظ„ط¹ط§ظ„ظ…ظٹط© ط§ظ„ط§ط­طھط±ط§ظپظٹط©: طھظ†ظˆط¹ ط§ظ„ط­ط±ظƒط§طھطŒ ط§ظ„طھظˆط§ط²ظ† ط¨ظٹظ† ط§ظ„ط´ط¯ ظˆط§ظ„ط¯ظپط¹طŒ ط§ظ„طھط¹ط§ظپظٹ ط§ظ„ظ…ظ†ط§ط³ط¨
4. ط§ظ„طµط¹ظˆط¨ط© ط§ظ„ظ…ط·ظ„ظˆط¨ط©: ${difficulty}

**ظ‚ط§ط¦ظ…ط© ط§ظ„طھظ…ط§ط±ظٹظ† ط§ظ„ظ…طھط§ط­ط© ظپظٹ ط§ظ„ظ†ط¸ط§ظ… (ظٹط¬ط¨ ط§ط³طھط®ط¯ط§ظ… ID ط§ظ„ظ…ط·ط§ط¨ظ‚):**
${exerciseList}

**ط§ظ„ظ…ط·ظ„ظˆط¨**: ط£ط±ط¬ط¹ JSON ط¨ط§ظ„طھظ†ط³ظٹظ‚ ط§ظ„طھط§ظ„ظٹ ط¨ط§ظ„ط¶ط¨ط· ط¨ط¯ظˆظ† ط£ظٹ ظ†طµ ط®ط§ط±ط¬ JSON:
{
  "title": "ط¹ظ†ظˆط§ظ† ط§ظ„طھظ…ط±ظٹظ† ط§ظ„ظٹظˆظ…ظٹ ط¨ط§ظ„ط¹ط±ط¨ظٹط©",
  "type": "ظ„ظ„ظˆظ‚طھ ط£ظˆ AMRAP ط£ظˆ ظ‚ظˆط©",
  "duration": 20,
  "rounds": null,
  "notes": "ظ…ظ„ط§ط­ط¸ط§طھ ظ…ظپظٹط¯ط© ظ„ظ„ظ…طھط¯ط±ط¨ظٹظ†",
  "theme": "ظˆطµظپ ظ…ط®طھطµط± ظ„ظ„ط±ط§ط¨ط· ط¨ظٹظ† طھظ…ط±ظٹظ† ط§ظ„ظ‚ظˆط© ظˆط§ظ„ظ…ظٹطھظƒظˆظ†",
  "warmup": [
    {"exerciseId": "id ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©", "reps": "ط§ظ„طھظƒط±ط§ط±ط§طھ", "weight": "", "distance": "", "time": "", "notes": ""}
  ],
  "strength": [
    {"exerciseId": "id ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©", "reps": "ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھأ—ط§ظ„طھظƒط±ط§ط±ط§طھ", "weight": "ط§ظ„ظˆط²ظ† ط§ظ„ظ…ظ‚طھط±ط­", "distance": "", "time": "", "notes": "طھط¹ظ„ظٹظ…ط§طھ ط§ظ„ظ‚ظˆط©"}
  ],
  "metcon": [
    {"exerciseId": "id ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©", "reps": "ط§ظ„طھظƒط±ط§ط±ط§طھ", "weight": "ط§ظ„ظˆط²ظ† ط§ظ„ظ…ظ‚طھط±ط­", "distance": "", "time": "", "notes": ""}
  ],
  "cooldown": [
    {"exerciseId": "id ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©", "reps": "", "weight": "", "distance": "", "time": "60 ط«ط§ظ†ظٹط©", "notes": "طھظ…ط·ظٹط·"}
  ]
}

**ظ‚ظˆط§ط¹ط¯ ظ…ظ‡ظ…ط©:**
- ط§ط³طھط®ط¯ظ… ظپظ‚ط· IDs ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…طھط§ط­ط© ط£ط¹ظ„ط§ظ‡
- ط§ظ„ط¥ط­ظ…ط§ط، ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† 3-4 طھظ…ط§ط±ظٹظ† ط®ظپظٹظپط© طھظڈظ‡ظٹط¦ ط§ظ„ط¹ط¶ظ„ط§طھ ظ„ظ„طھظ…ط±ظٹظ†
- طھظ…ط±ظٹظ† ط§ظ„ظ‚ظˆط©: 3-5 ظ…ط¬ظ…ظˆط¹ط§طھطŒ ط±ظƒط² ط¹ظ„ظ‰ ط§ظ„ط­ط±ظƒط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©
- ط§ظ„ظ…ظٹطھظƒظˆظ†: طھظ…ط±ظٹظ† ظ…ظƒط«ظپ 7-20 ط¯ظ‚ظٹظ‚ط©طŒ 2-4 طھظ…ط§ط±ظٹظ† ظ…طھط±ط§ط¨ط·ط©
- ط§ظ„طھظ‡ط¯ط¦ط©: 2-3 طھظ…ط§ط±ظٹظ† طھظ…ط·ظٹط·
- ط§ظ„ط£ظˆط²ط§ظ† ط§ظ„ظ…ظ‚طھط±ط­ط© ظ„ظ„ط±ط¬ط§ظ„ ظ…ظ†ط§ط³ط¨ط© ظ„ظ…طھط¯ط±ط¨ظٹظ† ظ…طھظˆط³ط·ظٹ ط§ظ„ظ…ط³طھظˆظ‰
- ط§ط¬ط¹ظ„ ط§ظ„ظ…ظٹطھظƒظˆظ† ظ…ط±طھط¨ط·ط§ظ‹ ط¨ط´ظƒظ„ ظˆط§ط¶ط­ ط¨طھظ…ط±ظٹظ† ط§ظ„ظ‚ظˆط©
${focus ? `- ط§ظ„طھط±ظƒظٹط² ط§ظ„ظٹظˆظ… ط¹ظ„ظ‰: ${focus}` : ''}
${date ? `- طھط§ط±ظٹط® ط§ظ„طھظ…ط±ظٹظ†: ${date}` : ''}

ط£ط±ط¬ط¹ JSON ظپظ‚ط·طŒ ط¨ط¯ظˆظ† ط£ظٹ ظƒظ„ط§ظ… ظ‚ط¨ظ„ظ‡ ط£ظˆ ط¨ط¹ط¯ظ‡.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
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
      return NextResponse.json({ error: 'ط®ط·ط£ ظپظٹ طھط­ظ„ظٹظ„ ط§ظ„ط±ط¯ ظ…ظ† ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ', raw: jsonText }, { status: 500 });
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
      title: generated.title || 'طھظ…ط±ظٹظ† ظٹظˆظ…ظٹ',
      type: generated.type || 'ظ„ظ„ظˆظ‚طھ',
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
      { error: error.message || 'ط®ط·ط£ ظپظٹ طھظˆظ„ظٹط¯ ط§ظ„طھظ…ط±ظٹظ† ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ' },
      { status: 500 }
    );
  }
}

