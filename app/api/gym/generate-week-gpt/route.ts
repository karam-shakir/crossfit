import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';
import { buildGymWeekContext, processGymWeekResult } from '@/lib/gymGeneration';

// نفس مهلة مسار Claude — راجع التعليق هناك، القيد نفسه (300 ثانية بلا Fluid Compute)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  if (!process.env.OPENAI_API_KEY)
    return NextResponse.json({ error: 'OPENAI_API_KEY غير مضبوط في متغيرات البيئة' }, { status: 500 });

  // إنشاء العميل داخل الطالب لا في نطاق الوحدة — راجع نفس السبب الموثّق في app/api/wod/generate-week-gpt/route.ts
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json().catch(() => ({}));

  try {
    const ctx = await buildGymWeekContext(body);

    // gpt-4o محدود بـ16384 توكن إخراج كحد أقصى — غير كافٍ لخطة أسبوعية بهذه البنية الثقيلة
    // (كل تمرين له 4 مستويات × 4 حقول لكل مستوى، عبر حتى 6 أيام تدريب). نفس سبب استخدام gpt-5
    // حصراً في التوليد الأسبوعي لقسم الكروسفت — راجع lib/wodWeeklyGeneration.ts / generate-week-gpt هناك
    const maxTokens = Math.min(100000, Math.max(24000, ctx.dates.length * 8000 + 6000));

    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: ctx.prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: maxTokens,
      reasoning_effort: 'low',
    });

    console.log(`[gym/generate-week-gpt] days=${ctx.dates.length} maxTokens=${maxTokens} usage=${JSON.stringify(completion.usage)} finish_reason=${completion.choices[0]?.finish_reason}`);

    const jsonText = completion.choices[0]?.message?.content?.trim() || '';
    const result = await processGymWeekResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
