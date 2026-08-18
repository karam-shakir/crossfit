'use client';
import { normalizeToBlocks } from '@/lib/wodBlocks';

export type ShareCardLang = 'ar' | 'en';

const SECTION_STYLE: Record<string, { icon: string; color: string; bg: string; labelAr: string; labelEn: string }> = {
  warmup:    { icon: '🔆', color: '#D97706', bg: '#FFFBEB', labelAr: 'الإحماء',   labelEn: 'Warm-Up' },
  strength:  { icon: '🏋️', color: '#2563EB', bg: '#EFF6FF', labelAr: 'القوة',     labelEn: 'Strength' },
  metcon:    { icon: '🔥', color: '#DC2626', bg: '#FEF2F2', labelAr: 'الـ WOD',   labelEn: 'MetCon' },
  accessory: { icon: '💪', color: '#7C3AED', bg: '#F5F3FF', labelAr: 'الأكسسوار', labelEn: 'Accessory' },
  cooldown:  { icon: '🧘', color: '#0D9488', bg: '#F0FDFA', labelAr: 'التهدئة',   labelEn: 'Cooldown' },
};

const SECTION_ORDER = ['warmup', 'strength', 'metcon', 'accessory', 'cooldown'] as const;

function formatDate(date: string, lang: ShareCardLang) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function movementLine(m: any, lang: ShareCardLang): { name: string; qty: string } {
  const name = lang === 'ar' ? (m.exercise?.nameAr || m.exerciseId) : (m.exercise?.nameEn || m.exerciseId);
  const parts = [m.reps, m.weight, m.distance, m.time].filter(Boolean);
  return { name, qty: parts.join(' · ') };
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
        <div style={{ fontSize: 14, color: '#94A3B8' }}>
          {formatDate(wod.date, lang)}
          {wod.type ? ` · ${wod.type}` : ''}
        </div>
        {subtitle && (
          <div style={{ marginTop: 10, fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.6 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SECTION_ORDER.map((key, sectionIdx) => {
          const blocks = normalizeToBlocks(wod[key]);
          const items = blocks.flatMap(b => b.movements || []).filter((m: any) => m.exerciseId);
          if (!items.length) return null;
          const style = SECTION_STYLE[key];
          const label = isAr ? style.labelAr : style.labelEn;
          const metconFormat = key === 'metcon' ? blocks.find(b => b.format)?.format : null;

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

              {metconFormat && (
                <div
                  style={{
                    background: style.bg, color: style.color, fontWeight: 800, fontSize: 13.5,
                    borderRadius: 10, padding: '8px 12px', marginBottom: 10,
                  }}
                >
                  {metconFormat}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((m: any, i: number) => {
                  const { name, qty } = movementLine(m, lang);
                  return (
                    <div key={i} style={{ fontSize: 14.5, color: '#1E293B', display: 'flex', gap: 8 }}>
                      {qty && <span style={{ fontWeight: 800, color: style.color, flexShrink: 0, minWidth: 64 }}>{qty}</span>}
                      <span>{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12.5, color: '#94A3B8', fontWeight: 600 }}>
        💪 {isAr ? 'مجموعة المطانيخ CrossFit' : 'MATANIKEH CROSSFIT'}
      </div>
    </div>
  );
}
