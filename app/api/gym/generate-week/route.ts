import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { buildGymWeekContext, processGymWeekResult } from '@/lib/gymGeneration';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// يمنح Vercel وقتاً كافياً لتوليد استجابات طويلة (حتى 32000 توكن) قبل قطع الاتصال —
// بدون هذا كانت الدالة قد تُقطَع في منتصف الاستجابة فينكسر تحليل JSON لاحقاً
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));

  try {
    const ctx = await buildGymWeekContext(body);

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: ctx.maxTokens,
      messages: [{ role: 'user', content: ctx.prompt }],
    });

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = await processGymWeekResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
