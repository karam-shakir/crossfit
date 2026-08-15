import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { buildWeeklyWodContext, processWeeklyWodResult, MAX_SAFE_WEEKLY_DAYS } from '@/lib/wodWeeklyGeneration';

// نفس مهلة مسار Claude — راجع التعليق هناك، القيد نفسه (300 ثانية بلا Fluid Compute)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  if (!process.env.OPENAI_API_KEY)
    return NextResponse.json({ error: 'OPENAI_API_KEY غير مضبوط في متغيرات البيئة' }, { status: 500 });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json().catch(() => ({}));
  const days = body.days ?? 7;

  if (days > MAX_SAFE_WEEKLY_DAYS) {
    return NextResponse.json({
      error: `عدد الأيام المطلوب (${days}) أكبر من الحد الآمن حالياً (${MAX_SAFE_WEEKLY_DAYS} أيام). توليد أسبوع كامل (6-7 أيام) قد يتجاوز مهلة الخادم (300 ثانية) وينتهي بالفشل بعد انتظار طويل. جرّب ${MAX_SAFE_WEEKLY_DAYS} أيام أو أقل، أو ولّد الأسبوع على دفعتين.`,
    }, { status: 400 });
  }

  try {
    const ctx = await buildWeeklyWodContext(body);

    // gpt-4o (المستخدَم في التوليد اليومي) محدود بـ16384 توكن إخراج كحد أقصى — غير كافٍ لخطة
    // أسبوعية متعددة الأيام بهذه البنية الثقيلة (بلوكات + مستويات أربعة لكل حركة). gpt-5 نموذج
    // استدلال (reasoning) بحد إخراج أعلى بكثير، فاستُخدم هنا حصراً للتوليد الأسبوعي — الزر اليومي
    // يبقى على gpt-4o كما هو.
    const maxTokens = Math.min(100000, Math.max(24000, days * 8000 + 6000));

    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: ctx.prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: maxTokens,
      reasoning_effort: 'low',
    });

    console.log(`[generate-week-gpt] days=${days} maxTokens=${maxTokens} usage=${JSON.stringify(completion.usage)} finish_reason=${completion.choices[0]?.finish_reason}`);

    const jsonText = completion.choices[0]?.message?.content?.trim() || '';
    const result = await processWeeklyWodResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
