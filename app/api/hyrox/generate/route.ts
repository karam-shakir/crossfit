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
  const { date, difficulty = 'ظ…طھظˆط³ط·', focus = 'ظƒط§ظ…ظ„', sessionType = 'full' } = body;

  const prompt = `ط£ظ†طھ ظ…ط¯ط±ط¨ ظ‡ط§ظٹط±ظˆظƒط³ ظ…ط­طھط±ظپ ظˆظ…طھط®طµطµ ظپظٹ ط¨ط±ظ…ط¬ط© طھظ…ط§ط±ظٹظ† Hyrox ط¹ظ„ظ‰ ظ…ط³طھظˆظ‰ ط¹ط§ظ„ظ…ظٹ.

**ظ…ط¹ظ„ظˆظ…ط§طھ ط¹ظ† Hyrox:**
ظ‡ط§ظٹط±ظˆظƒط³ ظ‡ظˆ ط±ظٹط§ط¶ط© ظ„ظٹط§ظ‚ط© ط¨ط¯ظ†ظٹط© طھظ†ط§ظپط³ظٹط© طھطھظƒظˆظ† ظ…ظ†:
- 8 ط¬ظˆظ„ط§طھطŒ ظƒظ„ ط¬ظˆظ„ط©: 1 ظƒظٹظ„ظˆظ…طھط± ط¬ط±ظٹ + ظ…ط­ط·ط© طھظ…ط±ظٹظ†
- ط§ظ„ظ…ط­ط·ط§طھ ط¨ط§ظ„طھط±طھظٹط¨:
  1. SkiErg - 1000ظ…
  2. Sled Push - 50ظ…
  3. Sled Pull - 50ظ…
  4. Burpee Broad Jump - 80ظ…
  5. Row - 1000ظ…
  6. Farmers Carry - 200ظ…
  7. Sandbag Lunges - 100ظ…
  8. Wall Balls - 100 طھظƒط±ط§ط±

**ط§ظ„ظ…ط·ظ„ظˆط¨:**
ظ†ظˆط¹ ط§ظ„ط¬ظ„ط³ط©: ${sessionType} (full = ظƒط§ظ…ظ„طŒ simulation = ظ…ط­ط§ظƒط§ط© ط¨ط£ظˆط²ط§ظ† ط£ظ‚ظ„طŒ strength = ظ…ط­ط·ط§طھ ظ‚ظˆط© ظپظ‚ط·طŒ running = ط¬ط±ظٹ ظپظ‚ط·)
ظ…ط³طھظˆظ‰ ط§ظ„طµط¹ظˆط¨ط©: ${difficulty}
ط§ظ„طھط±ظƒظٹط²: ${focus}
ط§ظ„طھط§ط±ظٹط®: ${date || 'ط§ظ„ظٹظˆظ…'}

ط£ط±ط¬ط¹ JSON ط¨ظ‡ط°ط§ ط§ظ„طھظ†ط³ظٹظ‚:
{
  "title": "ط¹ظ†ظˆط§ظ† ط¬ظ„ط³ط© ظ‡ط§ظٹط±ظˆظƒط³",
  "sessionType": "${sessionType}",
  "difficulty": "${difficulty}",
  "totalDuration": "ط§ظ„ظ…ط¯ط© ط§ظ„ظƒظ„ظٹط© ط§ظ„ظ…طھظˆظ‚ط¹ط© ط¨ط§ظ„ط¯ظ‚ط§ط¦ظ‚",
  "warmup": {
    "duration": "15 ط¯ظ‚ظٹظ‚ط©",
    "exercises": [
      {"name": "ط§ط³ظ… ط§ظ„طھظ…ط±ظٹظ† ط¨ط§ظ„ط¹ط±ط¨ظٹ", "nameEn": "English name", "duration": "ط§ظ„ظˆظ‚طھ ط£ظˆ ط§ظ„طھظƒط±ط§ط±", "notes": "ظ…ظ„ط§ط­ط¸ط©"}
    ]
  },
  "stations": [
    {
      "number": 1,
      "name": "ط§ط³ظ… ط§ظ„ظ…ط­ط·ط© ط¨ط§ظ„ط¹ط±ط¨ظٹ",
      "nameEn": "Station name",
      "runBefore": "1 ظƒظٹظ„ظˆظ…طھط±",
      "target": "ط§ظ„ظ‡ط¯ظپ (ظ…ط³ط§ظپط© ط£ظˆ طھظƒط±ط§ط±)",
      "weight": "ط§ظ„ظˆط²ظ† ط§ظ„ظ…ظ‚طھط±ط­",
      "targetTime": "ط§ظ„ظˆظ‚طھ ط§ظ„ظ…ط³طھظ‡ط¯ظپ",
      "tips": "ظ†طµظٹط­ط© طھظ‚ظ†ظٹط©",
      "scaling": "ط¨ط¯ظٹظ„ ظ„ظ„ظ…ط¨طھط¯ط¦ظٹظ†"
    }
  ],
  "cooldown": {
    "duration": "10 ط¯ظ‚ظٹظ‚ط©",
    "exercises": [
      {"name": "طھظ…ط±ظٹظ† ط§ظ„طھظ‡ط¯ط¦ط©", "duration": "ط§ظ„ظˆظ‚طھ"}
    ]
  },
  "targetTimes": {
    "elite": "ظˆظ‚طھ ط§ظ„ظ†ط®ط¨ط©",
    "advanced": "ظˆظ‚طھ ط§ظ„ظ…طھظ‚ط¯ظ…",
    "intermediate": "ظˆظ‚طھ ط§ظ„ظ…طھظˆط³ط·",
    "beginner": "ظˆظ‚طھ ط§ظ„ظ…ط¨طھط¯ط¦"
  },
  "nutritionBefore": "ظ…ط§ طھط£ظƒظ„ظ‡ ظ‚ط¨ظ„ ط§ظ„طھظ…ط±ظٹظ†",
  "nutritionAfter": "ظ…ط§ طھط£ظƒظ„ظ‡ ط¨ط¹ط¯ ط§ظ„طھظ…ط±ظٹظ†",
  "coachNote": "ظ…ظ„ط§ط­ط¸ط© ط§ظ„ظ…ط¯ط±ط¨ ط§ظ„ط´ط§ظ…ظ„ط©",
  "nextSessionRecommendation": "طھظˆطµظٹط© ظ„ظ„ط¬ظ„ط³ط© ط§ظ„ظ‚ط§ط¯ظ…ط© ط¨ظ†ط§ط،ظ‹ ط¹ظ„ظ‰ ظ‡ط°ظ‡"
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

