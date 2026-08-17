import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { buildDailyWodContext, processDailyWodResult } from '@/lib/wodDailyGeneration';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// يمنح Vercel وقتاً كافياً — نفس حد مسار الأسبوعي، احتياطاً بعد رفع max_tokens أدناه
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));

  try {
    const ctx = await buildDailyWodContext(body);

    // ⚠️ كان 8000 كافياً تاريخياً، لكن رُصد فعلياً (2026-08-25) أن Claude Opus 5 يستهلك تفكيراً
    // داخلياً (thinking_tokens) يصل لأكثر من 4000 توكن قبل حتى بدء كتابة الـ JSON — بعد توسّع
    // البرومبت بوصفة الميتكون العلمية (خطوات ١-٥)، هذا الاستهلاك صار يقتطع من ميزانية max_tokens
    // نفسها ويقطع الاستجابة منتصف نص حرفياً (stop_reason: "max_tokens" مؤكَّد بالاختبار المباشر).
    // البث (stream) إجباري هنا أيضاً — نفس سبب استخدامه في المسار الأسبوعي عند max_tokens الكبيرة
    const maxTokens = 24000;
    const stream = client.messages.stream({
      model: 'claude-opus-5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: ctx.prompt }],
    });
    const message = await stream.finalMessage();
    console.log(`[generate/wod] date=${ctx.date} maxTokens=${maxTokens} usage=${JSON.stringify(message.usage)} stop_reason=${message.stop_reason}`);

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = processDailyWodResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
