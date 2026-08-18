import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getWodByDate, getExercises } from '@/lib/db';
import { enrichWodSections } from '@/lib/wodBlocks';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SECTIONS = ['warmup', 'strength', 'metcon', 'accessory', 'cooldown'] as const;
const MOVEMENT_FIELDS = ['reps', 'weight', 'distance', 'time', 'notes', 'executionNote'] as const;
const ARABIC_RE = /[؀-ۿ]/;

// يترجم النصوص العربية في تمرين محفوظ (العنوان/الثيم/الملاحظات وكل حقول الحركات النصية) إلى إنجليزية
// طبيعية عبر Claude Haiku — يُستخدم فقط عند الضغط على زر "تصدير صورة إنجليزي"، لا في مسار التوليد
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { date } = await req.json().catch(() => ({}));
  if (!date) return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 });

  const wodRaw = await getWodByDate(date);
  if (!wodRaw) return NextResponse.json({ error: 'لا يوجد تمرين لهذا التاريخ' }, { status: 404 });

  const exercises = await getExercises();
  const wod: any = { ...wodRaw, ...enrichWodSections(wodRaw, exercises) };

  const toTranslate: Record<string, string> = {};
  if (wod.aiTheme && ARABIC_RE.test(wod.aiTheme)) toTranslate['aiTheme'] = wod.aiTheme;
  if (wod.notes && ARABIC_RE.test(wod.notes)) toTranslate['notes'] = wod.notes;
  if (!wod.titleEn && wod.title && ARABIC_RE.test(wod.title)) toTranslate['title'] = wod.title;
  if (wod.type && ARABIC_RE.test(wod.type)) toTranslate['type'] = wod.type;

  for (const sec of SECTIONS) {
    const blocks = wod[sec] || [];
    blocks.forEach((block: any, bi: number) => {
      (block.movements || []).forEach((m: any, mi: number) => {
        for (const field of MOVEMENT_FIELDS) {
          const val = m[field];
          if (val && typeof val === 'string' && ARABIC_RE.test(val)) {
            toTranslate[`${sec}.${bi}.${mi}.${field}`] = val;
          }
        }
      });
    });
  }

  let translations: Record<string, string> = {};
  if (Object.keys(toTranslate).length > 0) {
    const prompt = `ترجم قيم كائن JSON التالي من العربية إلى إنجليزية طبيعية ومختصرة مناسبة لبطاقة تمرين رياضي (CrossFit) تُشارك على وسائل التواصل الاجتماعي.
- حافظ على الأرقام والرموز (♂ ♀ + - / : %) والصيغ (مثل "1+1") كما هي دون تغيير.
- حوّل وحدة الوزن "كجم" إلى "kg" ووحدة الطول "سم" إلى "cm".
- أعد كائن JSON فقط بنفس المفاتيح تماماً بلا أي نقص أو زيادة، وقيم إنجليزية مختصرة، بلا أي نص أو شرح خارج كائن الـ JSON.

${JSON.stringify(toTranslate, null, 2)}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = message.content.find((b: any) => b.type === 'text') as any;
    const raw = textBlock ? textBlock.text.trim() : '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    try {
      translations = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      translations = {};
    }
  }

  const translatedWod = JSON.parse(JSON.stringify(wod));
  if (translations['title'])   translatedWod.titleEn = translations['title'];
  if (translations['aiTheme']) translatedWod.aiTheme = translations['aiTheme'];
  if (translations['notes'])   translatedWod.notes = translations['notes'];
  if (translations['type'])    translatedWod.type = translations['type'];

  for (const sec of SECTIONS) {
    const blocks = translatedWod[sec] || [];
    blocks.forEach((block: any, bi: number) => {
      (block.movements || []).forEach((m: any, mi: number) => {
        for (const field of MOVEMENT_FIELDS) {
          const key = `${sec}.${bi}.${mi}.${field}`;
          if (translations[key]) m[field] = translations[key];
        }
      });
    });
  }

  return NextResponse.json(translatedWod);
}
