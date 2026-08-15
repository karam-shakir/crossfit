import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { canManageCrossfitWod } from '@/lib/permissions';
import { buildWeeklyWodContext, processWeeklyWodResult, MAX_SAFE_WEEKLY_DAYS } from '@/lib/wodWeeklyGeneration';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// يمنح Vercel وقتاً كافياً لتوليد استجابات طويلة قبل قطع الاتصال.
// ⚠️ رُفعت سابقاً إلى 800 لكن هذا كسر النشر فعلياً على الإنتاج (فشل ثلاث عمليات نشر متتالية —
// النشر ينجح في مرحلة البناء لكن يفشل عند "Deploying outputs" لأن الخطة الحالية لا تدعم مدة دالة
// تتجاوز 300 ثانية دون تفعيل Fluid Compute). أُعيدت إلى 300 (القيمة المعروفة أنها تعمل) —
// راجع maxTokens أدناه أولاً كحل لمشكلة القطع بدل رفع هذا الرقم مرة أخرى.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await canManageCrossfitWod(session)))
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const days = body.days ?? 7;

  // ═══ سقف أيام آمن مؤقت — رُصد فعلياً في الإنتاج (2026-08-15): طلب 7 أيام انتهى بخطأ 504
  // (Vercel Runtime Timeout) لأن التوليد تجاوز الحد الأقصى 300 ثانية لمدة الدالة. راجع التعليق
  // الكامل في lib/wodWeeklyGeneration.ts عند تعريف MAX_SAFE_WEEKLY_DAYS.
  if (days > MAX_SAFE_WEEKLY_DAYS) {
    return NextResponse.json({
      error: `عدد الأيام المطلوب (${days}) أكبر من الحد الآمن حالياً (${MAX_SAFE_WEEKLY_DAYS} أيام). توليد أسبوع كامل (6-7 أيام) قد يتجاوز مهلة الخادم (300 ثانية) وينتهي بالفشل بعد انتظار طويل. جرّب ${MAX_SAFE_WEEKLY_DAYS} أيام أو أقل، أو ولّد الأسبوع على دفعتين.`,
    }, { status: 400 });
  }

  try {
    const ctx = await buildWeeklyWodContext(body);

    // الحد الأقصى للتوكنز مرتبط بحجم المحتوى الفعلي لكل يوم. هذه القيمة (8000 توكن/يوم) صُححت
    // بعد رصد قطع فعلي عند 7 أيام مع صيغة أقدم — راجع سجل commits لتفاصيل الحادثة.
    const maxTokens = Math.min(100000, Math.max(24000, days * 8000 + 6000));

    // البث (stream) إجباري هنا — الحد الأقصى للتوكنز (حتى 100000) قد يستغرق دقائق طويلة نظرياً،
    // وواجهة Anthropic البرمجية ترفض طلبات create() العادية بهذا الحجم وتطلب البث صراحة
    const stream = client.messages.stream({
      model: 'claude-opus-5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: ctx.prompt }],
    });
    const message = await stream.finalMessage();
    console.log(`[generate-week] days=${days} maxTokens=${maxTokens} usage=${JSON.stringify(message.usage)} stop_reason=${message.stop_reason}`);

    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') { jsonText = block.text.trim(); break; }
    }

    const result = await processWeeklyWodResult(jsonText, ctx);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
