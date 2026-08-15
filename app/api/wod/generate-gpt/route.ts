import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { buildDailyWodContext, processDailyWodResult } from '@/lib/wodDailyGeneration';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  if (!process.env.OPENAI_API_KEY)
    return NextResponse.json({ error: 'OPENAI_API_KEY غير مضبوط في متغيرات البيئة' }, { status: 500 });

  // إنشاء العميل داخل الطالب لا في نطاق الوحدة (module scope) — بناء Next.js يستورد كل ملفات
  // route.ts أثناء "جمع بيانات الصفحة" حتى بدون استدعائها فعلياً، وحزمة OpenAI SDK ترمي خطأ
  // فوراً عند الإنشاء إن كان OPENAI_API_KEY غير مضبوط (بخلاف Anthropic التي لا تفعل ذلك) —
  // هذا كان يكسر البناء بالكامل حتى في بيئات لم تُضبط فيها هذه المتغيّرة بعد
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json().catch(() => ({}));

  try {
    const ctx = await buildDailyWodContext(body);

    // response_format: json_object يفرض على GPT إرجاع JSON صالح نحوياً دائماً (لا يضمن مطابقة
    // المخطط المطلوب حرفياً، فلا يزال processDailyWodResult يطبّق نفس التحقق والتصفية بعده)
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: ctx.prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8000,
    });

    const jsonText = completion.choices[0]?.message?.content?.trim() || '';
    const result = processDailyWodResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في التوليد' }, { status: 500 });
  }
}
