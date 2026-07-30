// ═══════════════════════════════════════════════════════════════
// معالجة JSON الناتج من الذكاء الاصطناعي — مصدر واحد للحقيقة
// يُستخدم في كل route يطلب من Claude توليد JSON (WOD، جيم، جري، كاليسثنكس...)
// ═══════════════════════════════════════════════════════════════
//
// السبب: النموذج يكتب نصوصاً حرة طويلة (coachNote، cue، notes) وأحياناً
// يضع سطراً جديداً حرفياً أو علامة اقتباس داخل قيمة نصية بدون Escape —
// وهذا كسر JSON صحيح نحوياً بأخطاء مثل "Unterminated string" أو
// "Expected ',' or '}' after property value". الإصلاح القديم (regex بسيط
// لالتقاط مصفوفة "sessions" عند فشل التحليل) لا يعالج هذا لأن الخلل غالباً
// في منتصف النص لا في نهايته المقتطعة فقط.

/** يزيل أسيجة Markdown (```json ... ```) المحيطة بالاستجابة إن وُجدت */
export function stripCodeFences(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  s = s.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return s;
}

/**
 * يمسح النص حرفاً بحرف ويُصلح أكثر خللين شائعين داخل قيم JSON النصية:
 * 1) سطر جديد/تبويب حرفي غير مُهرَّب داخل نص — يُحوَّل إلى \n\ \t
 * 2) علامة اقتباس مضمّنة داخل النص (وليست نهاية القيمة الحقيقية) — تُهرَّب بـ \"
 *    يُحدَّد ذلك بالنظر للحرف التالي: لو لم يكن فاصلة أو قوس إغلاق أو ':' فالاقتباس مضمّن لا خاتم
 * لا يغيّر أي حرف خارج السلاسل النصية — البنية الأساسية لـ JSON تبقى كما هي
 */
export function sanitizeJsonText(text: string): string {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '\n') { out += '\\n'; continue; }
    if (ch === '\r') { out += '\\r'; continue; }
    if (ch === '\t') { out += '\\t'; continue; }
    if (ch === '"') {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      const next = text[j];
      const looksLikeRealClose = next === undefined || [',', '}', ']', ':'].includes(next);
      if (looksLikeRealClose) {
        out += ch;
        inString = false;
      } else {
        out += '\\"';
      }
      continue;
    }
    out += ch;
  }

  return out;
}

/** إزالة فواصل زائدة قبل } أو ] وتطبيع مفاتيح غير مُقتبَسة (احتياط إضافي بسيط) */
function fixCommonSyntax(text: string): string {
  let s = text.replace(/,(\s*[}\]])/g, '$1');
  s = s.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  return s;
}

/**
 * يجد فهرس آخر '}' يُغلق عنصراً كاملاً في المستوى الأول من مصفوفة JSON (نص يبدأ بـ '[')،
 * بغضّ النظر عن عمق التداخل داخل كل عنصر. هذا يتتبع عمق الأقواس فعلياً بدل البحث
 * النصي البسيط عن "}," — فالبحث النصي يلتقط بسهولة إغلاق كائن متداخل (مثل
 * levels.advanced أو exercises[i]) بدل نهاية العنصر الفعلي، وهو تحديداً ما كان
 * يسبب فشل التعافي في الجداول ذات التداخل العميق (جلسات الجيم بمستوياتها الأربعة).
 * يرجع -1 إن لم يوجد أي عنصر كامل.
 */
function findLastCompleteArrayElementEnd(arrText: string): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastCompleteEnd = -1;

  for (let i = 0; i < arrText.length; i++) {
    const ch = arrText[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') { depth++; continue; }
    if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 1 && ch === '}') lastCompleteEnd = i;
      continue;
    }
  }
  return lastCompleteEnd;
}

/**
 * يحلّل استجابة JSON من Claude بأقصى مقاومة ممكنة للأخطاء:
 * 1) إزالة الأسيجة والتنظيف
 * 2) محاولة تحليل مباشرة
 * 3) عند الفشل: تنظيف السلاسل النصية (escape) ثم إعادة المحاولة
 * 4) عند الفشل مجدداً وتوفر arrayKey: استخراج المصفوفة (مثال "sessions")
 *    وإغلاقها عند آخر عنصر مكتمل (تعافٍ من انقطاع الاستجابة عند حد التوكِن)
 */
export function parseAiJson(rawText: string, arrayKey?: string): any {
  const stripped = stripCodeFences(rawText);

  try {
    return JSON.parse(stripped);
  } catch {}

  const sanitized = sanitizeJsonText(stripped);
  try {
    return JSON.parse(sanitized);
  } catch {}

  const fixed = fixCommonSyntax(sanitized);
  try {
    return JSON.parse(fixed);
  } catch {}

  if (arrayKey) {
    const re = new RegExp(`"${arrayKey}"\\s*:\\s*(\\[[\\s\\S]*)`);
    const match = fixed.match(re);
    if (match) {
      const arrText = match[1];
      const endIdx = findLastCompleteArrayElementEnd(arrText);
      if (endIdx !== -1) {
        const recovered = arrText.slice(0, endIdx + 1) + ']';
        try {
          const items = JSON.parse(recovered);
          if (Array.isArray(items) && items.length > 0) {
            return { [arrayKey]: items };
          }
        } catch {}
      }
    }
  }

  // تشخيص: سجّل مقتطفاً من النص الخام في سجلات الخادم (Vercel logs) بدل الفشل الصامت،
  // ليتسنى معرفة طبيعة الخلل الفعلي إن تكرر (طول الاستجابة، بداية ونهاية النص)
  console.error('[parseAiJson] فشل نهائي في التحليل', {
    length: rawText.length,
    head: rawText.slice(0, 300),
    tail: rawText.slice(-300),
  });

  throw new Error('فشل تحليل JSON المُولَّد من الذكاء الاصطناعي — حاول التوليد مرة أخرى');
}
