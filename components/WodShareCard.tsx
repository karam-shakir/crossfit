'use client';
import { Sun, Dumbbell, Flame, Wind, Timer, FileText, type LucideIcon } from 'lucide-react';
import { normalizeToBlocks } from '@/lib/wodBlocks';

export type ShareCardLang = 'ar' | 'en';

const SECTION_STYLE: Record<string, { icon: LucideIcon; color: string; bg: string; labelAr: string; labelEn: string }> = {
  warmup:    { icon: Sun,      color: '#D97706', bg: '#FFFBEB', labelAr: 'الإحماء',   labelEn: 'Warm-Up' },
  strength:  { icon: Dumbbell, color: '#2563EB', bg: '#EFF6FF', labelAr: 'القوة',     labelEn: 'Strength' },
  metcon:    { icon: Flame,    color: '#DC2626', bg: '#FEF2F2', labelAr: 'الـ WOD',   labelEn: 'MetCon' },
  accessory: { icon: Dumbbell, color: '#EA580C', bg: '#FFF7ED', labelAr: 'الأكسسوار', labelEn: 'Accessory' },
  cooldown:  { icon: Wind,     color: '#1E2839', bg: '#F8FAFC', labelAr: 'التهدئة',   labelEn: 'Cooldown' },
};

const SECTION_ORDER = ['warmup', 'strength', 'metcon', 'accessory', 'cooldown'] as const;

function formatDate(date: string, lang: ShareCardLang) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function movementLine(m: any, lang: ShareCardLang): { name: string; qty: string; notes: string } {
  const name = lang === 'ar' ? (m.exercise?.nameAr || m.exerciseId) : (m.exercise?.nameEn || m.exerciseId);
  const parts = [m.reps, m.weight, m.distance, m.time].filter(Boolean);
  return { name, qty: parts.join(' · '), notes: m.notes || m.executionNote || '' };
}

export default function WodShareCard({ wod, lang = 'ar' }: { wod: any; lang?: ShareCardLang }) {
  const isAr = lang === 'ar';
  const title = isAr ? (wod.title || 'تمرين اليوم') : (wod.titleEn || wod.title || "Today's Workout");
  const subtitle = wod.aiTheme || '';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        width: 720,
        fontFamily: isAr
          ? '"Tahoma", "Segoe UI", "Noto Sans Arabic", sans-serif'
          : '"Segoe UI", -apple-system, sans-serif',
        background: '#F8FAFC',
        padding: 28,
        boxSizing: 'border-box',
        color: '#0F172A',
      }}
    >
      {/* Header */}
      <div style={{ background: '#0B1729', borderRadius: 18, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#60A5FA', textTransform: 'uppercase', marginBottom: 6 }}>
          {isAr ? 'مجموعة المطانيخ' : 'MATANIKEH CROSSFIT'}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: '#94A3B8', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <span>{formatDate(wod.date, lang)}</span>
          {wod.type ? <span> · {wod.type}</span> : null}
          {wod.duration ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              · <Timer size={13} /> {wod.duration}{isAr ? 'د' : ' min'}
            </span>
          ) : null}
        </div>
        {subtitle && (
          <div style={{ marginTop: 10, fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.6 }}>
            {subtitle}
          </div>
        )}
        {wod.notes && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#93C5FD', lineHeight: 1.6, background: 'rgba(96,165,250,0.1)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <FileText size={14} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{wod.notes}</span>
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SECTION_ORDER.map((key, sectionIdx) => {
          const blocks = normalizeToBlocks(wod[key]).filter(b => (b.movements || []).some((m: any) => m.exerciseId));
          if (!blocks.length) return null;
          const style = SECTION_STYLE[key];
          const label = isAr ? style.labelAr : style.labelEn;

          return (
            <div
              key={key}
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '16px 18px',
                borderInlineStart: `5px solid ${style.color}`,
                boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: style.color,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}
                >
                  {sectionIdx + 1}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: style.color }}>
                  {label}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {blocks.map((block, bi) => {
                  const items = (block.movements || []).filter((m: any) => m.exerciseId);
                  if (!items.length) return null;
                  return (
                    <div key={bi}>
                      {(block.format || block.scoreType) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                          {block.format && (
                            <span style={{
                              background: style.bg, color: style.color, fontWeight: 800, fontSize: 13,
                              borderRadius: 8, padding: '5px 10px',
                            }}>
                              {block.format}
                            </span>
                          )}
                          {block.scoreType && (
                            <span style={{ color: '#64748B', fontSize: 11.5, fontWeight: 600 }}>
                              {isAr ? 'التسجيل: ' : 'Score: '}{block.scoreType}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {items.map((m: any, i: number) => {
                          const { name, qty, notes } = movementLine(m, lang);
                          return (
                            <div key={i} style={{ fontSize: 14.5, color: '#1E293B' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {qty && <span style={{ fontWeight: 800, color: style.color, flexShrink: 0, minWidth: 64 }}>{qty}</span>}
                                <span>{name}</span>
                              </div>
                              {notes && (
                                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, marginTop: 2, paddingInlineStart: qty ? 72 : 0 }}>
                                  {notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12.5, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Dumbbell size={14} /> {isAr ? 'مجموعة المطانيخ CrossFit' : 'MATANIKEH CROSSFIT'}
      </div>
    </div>
  );
}
