import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'ط؛ظٹط± ظ…طµط±ط­' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { date, difficulty = 'ظ…طھظˆط³ط·', eventType = 'biathlon', focus = 'ط§ظ„طھط­ظ…ظ„' } = body;

  const prompt = `ط£ظ†طھ ظ…ط¯ط±ط¨ Kettlebell Athletics ظ…ط­طھط±ظپ ظˆظ…ط¹طھظ…ط¯ ط¯ظˆظ„ظٹط§ظ‹ ظ…ظ† IUKL (ط§ظ„ط§طھط­ط§ط¯ ط§ظ„ط¯ظˆظ„ظٹ ظ„ط±ظپط¹ ط§ظ„ظƒظٹطھظ„ ط¨ظٹظ„).

**ظ…ط¹ظ„ظˆظ…ط§طھ ط¹ظ† Kettlebell Athletics (ط±ظٹط§ط¶ط© ط§ظ„ط¬ظٹط±ظƒ):**
- ط±ظٹط§ط¶ط© ظ‚ظˆط© ظˆطھط­ظ…ظ„ طھظ†ط§ظپط³ظٹط© ط¨ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظƒظٹطھظ„ ط¨ظٹظ„
- ط§ظ„ط£ط­ط¯ط§ط« ط§ظ„ط±ط¦ظٹط³ظٹط©:
  * Biathlon (ط«ظ†ط§ط¦ظٹ): Jerk + Snatch ط¨ظƒظٹطھظ„ ط¨ظٹظ„ ظˆط§ط­ط¯ط© ط£ظˆ ط«ظ†ط§ط¦ظٹط©طŒ 10 ط¯ظ‚ط§ط¦ظ‚ ظ„ظƒظ„ ط­ط¯ط«
  * Long Cycle (ط¯ظˆط±ط© ط·ظˆظٹظ„ط©): Clean + Jerk ط¨ظƒظٹطھظ„ ط¨ظٹظ„ظژظٹظ†طŒ 10 ط¯ظ‚ط§ط¦ظ‚
  * Snatch (ط§ظ†طھط²ط§ط¹): Snatch ط¨ظƒظٹطھظ„ ط¨ظٹظ„ ظˆط§ط­ط¯ط©طŒ 10 ط¯ظ‚ط§ط¦ظ‚
- ط§ظ„ط£ظˆط²ط§ظ† ط§ظ„ظ‚ظٹط§ط³ظٹط©: 8طŒ 12طŒ 16طŒ 20طŒ 24طŒ 28طŒ 32 ظƒط¬ظ…

**ط§ظ„ظ…ط·ظ„ظˆط¨:**
ظ†ظˆط¹ ط§ظ„ط­ط¯ط«: ${eventType} (biathlon | long_cycle | snatch | strength | conditioning)
ظ…ط³طھظˆظ‰ ط§ظ„طµط¹ظˆط¨ط©: ${difficulty}
ط§ظ„طھط±ظƒظٹط²: ${focus}
ط§ظ„طھط§ط±ظٹط®: ${date || 'ط§ظ„ظٹظˆظ…'}

ط£ط±ط¬ط¹ JSON ط¨ظ‡ط°ط§ ط§ظ„طھظ†ط³ظٹظ‚:
{
  "title": "ط¹ظ†ظˆط§ظ† ط§ظ„ط¬ظ„ط³ط© ط¨ط§ظ„ط¹ط±ط¨ظٹ",
  "eventType": "${eventType}",
  "difficulty": "${difficulty}",
  "totalDuration": "ط§ظ„ظ…ط¯ط© ط§ظ„ظƒظ„ظٹط©",
  "warmup": {
    "duration": "10-15 ط¯ظ‚ظٹظ‚ط©",
    "movements": [
      {"name": "ط§ط³ظ… ط§ظ„ط­ط±ظƒط© ط¨ط§ظ„ط¹ط±ط¨ظٹ", "nameEn": "English", "sets": "ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھ", "reps": "ط§ظ„طھظƒط±ط§ط±ط§طھ", "notes": "ظ…ظ„ط§ط­ط¸ط©"}
    ]
  },
  "mainWork": [
    {
      "block": "ط§ط³ظ… ط§ظ„ظƒطھظ„ط© ط§ظ„طھط¯ط±ظٹط¨ظٹط©",
      "movement": "ط§ط³ظ… ط§ظ„ط­ط±ظƒط© ط¨ط§ظ„ط¹ط±ط¨ظٹ",
      "movementEn": "ط§ط³ظ… ط§ظ„ط­ط±ظƒط© ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹ",
      "weight": "ط§ظ„ظˆط²ظ† ط§ظ„ظ…ظ‚طھط±ط­",
      "sets": "ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھ",
      "reps": "ط§ظ„طھظƒط±ط§ط±ط§طھ ط£ظˆ ط§ظ„ظˆظ‚طھ",
      "tempo": "ط¥ظٹظ‚ط§ط¹ ط§ظ„ط­ط±ظƒط©",
      "restBetweenSets": "ط§ظ„ط±ط§ط­ط© ط¨ظٹظ† ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھ",
      "technique": "ظ†ظ‚ط§ط· طھظ‚ظ†ظٹط© ظ…ظ‡ظ…ط©",
      "targetRPM": "ط§ظ„ظ‡ط¯ظپ: ط¹ط¯ط¯ ط§ظ„طھظƒط±ط§ط±ط§طھ ظپظٹ ط§ظ„ط¯ظ‚ظٹظ‚ط© ط¥ط°ط§ ظƒط§ظ† ظ„ظ„ظˆظ‚طھ"
    }
  ],
  "gripwork": {
    "note": "ط§ط³ظ„ظˆط¨ ط§ظ„ط¥ظ…ط³ط§ظƒ ظˆط§ظ„طھط¹ط§ظ…ظ„ ظ…ط¹ ط§ظ„طھط¹ط¨ ظپظٹ ط§ظ„ط±ط³ط؛",
    "exercises": [
      {"name": "طھظ…ط±ظٹظ† ط§ظ„طھظ‚ظˆظٹط©", "sets": "ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھ", "reps": "ط§ظ„طھظƒط±ط§ط±ط§طھ"}
    ]
  },
  "cooldown": [
    {"name": "طھظ…ط±ظٹظ† ط§ظ„طھظ‡ط¯ط¦ط©", "duration": "ط§ظ„ظˆظ‚طھ", "focus": "ط§ظ„طھط±ظƒظٹط²"}
  ],
  "techniqueNotes": ["ظ†ظ‚ط·ط© طھظ‚ظ†ظٹط© 1", "ظ†ظ‚ط·ط© طھظ‚ظ†ظٹط© 2"],
  "breathingPattern": "ظ†ظ…ط· ط§ظ„طھظ†ظپط³ ط§ظ„طµط­ظٹط­ ط®ظ„ط§ظ„ ط§ظ„ط­ط±ظƒط©",
  "weeklyPlan": {
    "sessionsPerWeek": "ط¹ط¯ط¯ ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ط£ط³ط¨ظˆط¹ظٹط© ط§ظ„ظ…ظ‚طھط±ط­ط©",
    "placement": "ظ…طھظ‰ طھظڈط¯ط±ط¬ ظ‡ط°ط§ ط§ظ„طھظ…ط±ظٹظ† ظپظٹ ط§ظ„ط£ط³ط¨ظˆط¹ ظ…ط¹ CrossFit",
    "avoidAfter": "ظ…ط§ ط§ظ„ط°ظٹ ظٹط¬ط¨ طھط¬ظ†ط¨ظ‡ ظ‚ط¨ظ„ ظ‡ط°ظ‡ ط§ظ„ط¬ظ„ط³ط©"
  },
  "coachNote": "ظ…ظ„ط§ط­ط¸ط© ط§ظ„ظ…ط¯ط±ط¨ ط§ظ„ط´ط§ظ…ظ„ط© ظ„ظ„ط¬ظ„ط³ط©",
  "progressionNote": "ظƒظٹظپ طھطھط·ظˆط± ظپظٹ ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ظ‚ط§ط¯ظ…ط©"
}

ط£ط±ط¬ط¹ JSON ظپظ‚ط·.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
            messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    const result = JSON.parse(jsonText);
    return NextResponse.json({ session: result, date: date || new Date().toISOString().split('T')[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

