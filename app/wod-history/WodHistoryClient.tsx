'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import WodBlockList from '@/components/WodBlockList';
import { formatMeta } from '@/components/WodCalendar';
import WodShareCard, { ShareCardLang } from '@/components/WodShareCard';
import { toPng } from 'html-to-image';

const flatMovements = (blocks: any[]) => (blocks || []).flatMap((b: any) => b.movements || []);

// ── ألوان الرياضات (Light theme) ────────────────────────────────────────────
const SPORT_COLORS = {
  crossfit:     { badge: 'bg-orange-100 text-orange-700 border border-orange-200',   border: 'border-orange-300',  accent: 'bg-orange-500' },
  calisthenics: { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', border: 'border-emerald-300', accent: 'bg-emerald-500' },
  hyrox:        { badge: 'bg-red-100 text-red-700 border border-red-200',             border: 'border-red-300',     accent: 'bg-red-500' },
  kettlebell:   { badge: 'bg-amber-100 text-amber-700 border border-amber-200',       border: 'border-amber-300',   accent: 'bg-amber-500' },
};

const WOD_TYPE_COLORS: Record<string, string> = {
  'AMRAP': 'bg-orange-100 text-orange-700 border-orange-200',
  'للوقت': 'bg-red-100 text-red-700 border-red-200',
  'قوة':   'bg-blue-100 text-blue-700 border-blue-200',
  'تدريب': 'bg-green-100 text-green-700 border-green-200',
};

const HYROX_TYPE_LABELS: Record<string, string> = {
  full: 'كامل 🏁', simulation: 'محاكاة 🎯', strength: 'قوة 💪', running: 'جري 🏃',
};

const KB_EVENT_LABELS: Record<string, string> = {
  biathlon: 'Biathlon', jerk: 'Jerk', snatch: 'Snatch', longcycle: 'Long Cycle', strength: 'قوة',
};

const CALIS_TYPE_LABELS: Record<string, string> = {
  strength: 'قوة 💪', skills: 'مهارات 🤸', endurance: 'تحمل 🔄', mixed: 'مختلط ⚡', hiit: 'HIIT 🔥',
};

function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function ytLink(nameEn: string, sport: string) {
  const q = encodeURIComponent(`${nameEn} ${sport} tutorial`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

// ── أزرار المشاركة/النسخ المشتركة ───────────────────────────────────────────
function ShareActions({
  onShare, onCopy, copied, isAdmin, editHref, onDelete,
}: {
  onShare: () => void; onCopy: () => void; copied: boolean;
  isAdmin?: boolean; editHref?: string; onDelete?: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button onClick={onShare}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-colors">
        📲 واتساب
      </button>
      <button onClick={onCopy}
        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-bold transition-colors">
        {copied ? '✅' : '📋'} نسخ
      </button>
      {isAdmin && (
        <>
          {editHref && (
            <a href={editHref} className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">✏️</a>
          )}
          {onDelete && (
            <button onClick={onDelete} className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-bold transition-colors">🗑</button>
          )}
        </>
      )}
    </div>
  );
}

// ── CrossFit WOD Card ────────────────────────────────────────────────────────
type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';
const LEVEL_TABS_WOD: { key: LevelKey; label: string; color: string; active: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', color: 'bg-green-50 text-green-700 border border-green-300',  active: 'bg-green-600 text-white border-transparent'  },
  { key: 'intermediate', label: 'متوسط', color: 'bg-blue-50 text-blue-700 border border-blue-300',    active: 'bg-blue-600 text-white border-transparent'    },
  { key: 'advanced',     label: 'متقدم', color: 'bg-orange-50 text-orange-700 border border-orange-300',active: 'bg-orange-500 text-white border-transparent'  },
  { key: 'elite',        label: 'نخبة',  color: 'bg-red-50 text-red-700 border border-red-300',      active: 'bg-red-600 text-white border-transparent'     },
];

function WodCard({ wod, isAdmin, onDelete, defaultOpen = false }: { wod: any; isAdmin?: boolean; onDelete?: (id: string) => void; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | undefined>(undefined);
  const [exportingLang, setExportingLang] = useState<ShareCardLang | null>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);
  const today = todaySA();

  // يُصدِّر بطاقة التمرين كصورة PNG جاهزة للمشاركة على وسائل التواصل — يُخفي البطاقة خارج الشاشة
  // أثناء الالتقاط بدل حذفها من الـ DOM (html-to-image يحتاج العنصر مرسوماً فعلياً ليلتقطه)
  async function exportImage(lang: ShareCardLang) {
    setExportingLang(lang);
    await new Promise(r => setTimeout(r, 60)); // فسحة إطار واحد لإعادة رسم البطاقة باللغة الجديدة قبل الالتقاط
    const node = exportCardRef.current;
    if (!node) { setExportingLang(null); return; }
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `matanikeh-wod-${wod.date}-${lang}.png`;
      a.click();
    } catch (e) {
      console.error('[exportImage] فشل تصدير الصورة', e);
    } finally {
      setExportingLang(null);
    }
  }
  function hasMultiLevel(s: string) { return (s.includes('|') || s.includes('مبتدئ')) && s.includes('متوسط'); }
  const hasLevels = [...flatMovements(wod.strength || []), ...flatMovements(wod.metcon || [])].some((e: any) =>
    e.levels ||
    (e.weight && hasMultiLevel(e.weight)) ||
    (e.notes  && hasMultiLevel(e.notes))
  );
  const isFuture = wod.date > today;
  const isToday  = wod.date === today;
  const colors   = SPORT_COLORS.crossfit;
  const meta     = formatMeta(wod.type);

  function buildText() {
    const lines: string[] = [];
    lines.push(`🏋️ CrossFit — ${formatDate(wod.date)}`);
    lines.push(`📌 ${wod.title || 'تمرين'}${wod.type ? ' | ' + wod.type : ''}${wod.duration ? ' | ⏱' + wod.duration + 'د' : ''}`);
    if (wod.aiTheme) lines.push(`🤖 ${wod.aiTheme}`);
    if (wod.notes)   lines.push(`📝 ${wod.notes}`);
    const sections = [
      { k: 'warmup',    icon: '🔆', label: 'الإحماء' },
      { k: 'strength',  icon: '🏋️', label: 'القوة' },
      { k: 'metcon',    icon: '🔥', label: 'الـ WOD' },
      { k: 'accessory', icon: '💪', label: 'الأكسسوار' },
      { k: 'cooldown',  icon: '🧘', label: 'التهدئة' },
    ];
    for (const sec of sections) {
      const items = flatMovements(wod[sec.k]).filter((e: any) => e.exerciseId);
      if (!items.length) continue;
      lines.push('');
      lines.push(`${sec.icon} ${sec.label}:`);
      items.forEach((ex: any, i: number) => {
        const name   = ex.exercise?.nameEn || ex.exerciseId;
        const nameEn = ex.exercise?.nameEn || ex.exerciseId || '';
        const reps   = ex.reps   ? ` — ${ex.reps}`   : '';
        const weight = ex.weight ? ` (${ex.weight})`  : '';
        const sets   = ex.sets   ? ` × ${ex.sets} مج` : '';
        lines.push(`  ${i + 1}. ${name}${sets}${reps}${weight}`);
        // فيديو حقيقي مُنسَّق من مكتبة التمارين إن وُجد — بدل رابط بحث عام دائماً حتى لو توفّر فيديو محدد فعلي
        const ytUrl = ex.exercise?.youtube || (nameEn ? ytLink(nameEn, 'crossfit') : '');
        if (ytUrl) lines.push(`     ▶️ ${ytUrl}`);
      });
    }
    lines.push('');
    lines.push('💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }

  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  async function deleteWod() {
    if (!confirm(`حذف تمرين ${wod.date}؟`)) return;
    const res = await fetch(`/api/wod?id=${wod.id}`, { method: 'DELETE' });
    if (res.ok) onDelete?.(wod.id);
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isToday ? colors.border + ' ring-2 ring-orange-300' : isFuture ? 'border-blue-200' : 'border-slate-200'}`}>
      <button className="w-full p-4 text-right" onClick={() => setIsOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {isToday  && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${WOD_TYPE_COLORS[wod.type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {meta.icon} {wod.type}
            </span>
            {wod.duration && <span className="text-xs text-slate-500 font-semibold">⏱{wod.duration}د</span>}
            <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-bold text-slate-800 text-base truncate">{wod.titleEn || wod.title || 'تمرين'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{formatDate(wod.date)}</div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          <ShareActions
            onShare={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
            onCopy={copyText} copied={copied}
            isAdmin={isAdmin} editHref={`/admin?date=${wod.date}`} onDelete={deleteWod}
          />
          <div className="flex gap-2">
            <button onClick={() => exportImage('ar')} disabled={!!exportingLang}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
              {exportingLang === 'ar' ? '⏳ جارٍ التصدير...' : '🖼️ صورة عربي'}
            </button>
            <button onClick={() => exportImage('en')} disabled={!!exportingLang}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
              {exportingLang === 'en' ? '⏳ Exporting...' : '🖼️ Image English'}
            </button>
          </div>
          {/* بطاقة مخفية خارج الشاشة — تُلتقَط كصورة PNG عند التصدير، لا تظهر للمستخدم إطلاقاً */}
          <div style={{ position: 'fixed', top: 0, insetInlineStart: -99999, pointerEvents: 'none' }}>
            <div ref={exportCardRef}>
              <WodShareCard wod={wod} lang={exportingLang || 'ar'} />
            </div>
          </div>
          {wod.aiTheme && <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-800 leading-relaxed">🤖 {wod.aiTheme}</div>}
          {wod.notes   && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 leading-relaxed">📝 {wod.notes}</div>}

          {/* Level selector — يظهر فقط عند وجود بيانات مستويات */}
          {hasLevels && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
              <div className="text-sm font-bold text-slate-700 mb-2 text-right">⚡ اختر مستواك — سيتغير التمرين كاملاً</div>
              <div className="flex gap-2">
                {LEVEL_TABS_WOD.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setSelectedLevel(selectedLevel === t.key ? undefined : t.key)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                      selectedLevel === t.key ? t.active : t.color
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {selectedLevel && wod.targetTimes?.[selectedLevel] && (
                <div className="mt-2 text-sm text-slate-600 text-right">
                  ⏱ وقتك المرجعي: <span className="font-bold text-slate-800">{wod.targetTimes[selectedLevel]}</span>
                </div>
              )}
            </div>
          )}

          {/* Target times (if no levels data) */}
          {!hasLevels && wod.targetTimes && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-600 mb-2">⏱ أوقات الأداء المرجعية</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(wod.targetTimes).map(([k, v]: [string, any]) => {
                  const labels: Record<string,string> = {elite:'نخبة 🥇',advanced:'متقدم 🥈',intermediate:'متوسط 🥉',beginner:'مبتدئ'};
                  return (
                    <div key={k} className="bg-white rounded-lg px-3 py-2 text-right border border-slate-200">
                      <div className="text-xs text-slate-500">{labels[k]||k}</div>
                      <div className="text-sm font-bold text-slate-800">{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(['warmup','strength','metcon','accessory','cooldown'] as const).map(sec => {
            const blocks = (wod as any)[sec];
            if (!blocks?.length) return null;
            const secMeta: Record<string, {label:string;icon:string;color:string;bg:string}> = {
              warmup:    {label:'الإحماء',    icon:'🔆',color:'text-amber-700',  bg:'bg-amber-50 border-amber-200'},
              strength:  {label:'القوة',      icon:'🏋️',color:'text-blue-700',   bg:'bg-blue-50 border-blue-200'},
              metcon:    {label:'الـ WOD',    icon:'🔥',color:'text-orange-700', bg:'bg-orange-50 border-orange-200'},
              accessory: {label:'الأكسسوار', icon:'💪',color:'text-purple-700', bg:'bg-purple-50 border-purple-200'},
              cooldown:  {label:'التهدئة',    icon:'🧘',color:'text-teal-700',   bg:'bg-teal-50 border-teal-200'},
            };
            const {label,icon,color,bg} = secMeta[sec];
            const showLevel = (sec === 'strength' || sec === 'metcon' || sec === 'accessory') ? selectedLevel : undefined;
            return (
              <div key={sec}>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-2 border ${bg}`}>
                  <span className="text-lg">{icon}</span>
                  <h3 className={`font-bold text-base ${color}`}>{label}</h3>
                </div>
                <WodBlockList blocks={blocks} selectedLevel={showLevel} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Hyrox Session Card ───────────────────────────────────────────────────────
function HyroxCard({ rec }: { rec: any }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = rec.sessionData || rec;
  const today = todaySA();
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.hyrox;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🏁 Hyrox — ${formatDate(rec.date)}`);
    lines.push(`📌 ${s.title || 'جلسة Hyrox'}${s.totalDuration ? ' | ⏱' + s.totalDuration + 'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    if (s.warmup?.exercises?.length) {
      lines.push(''); lines.push(`🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.reps ? ' — ' + ex.reps : ''}${ex.duration ? ' — ' + ex.duration : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'hyrox')}`);
      });
    }
    if (s.stations?.length) {
      lines.push(''); lines.push('🏁 المحطات:');
      s.stations.forEach((st: any, i: number) => {
        const run = st.runBefore ? ` | جري ${st.runBefore}` : '';
        const w   = st.weight   ? ` | ⚖️ ${st.weight}`      : '';
        const t   = st.target   ? ` | 🎯 ${st.target}`       : '';
        lines.push(`  ${i + 1}. ${st.name}${run}${w}${t}`);
        if (st.tips) lines.push(`     💡 ${st.tips}`);
        if (st.nameEn || st.name) lines.push(`     ▶️ ${ytLink(st.nameEn || st.name, 'hyrox')}`);
      });
    }
    if (s.cooldown?.exercises?.length) {
      lines.push(''); lines.push('🧘 التهدئة:');
      s.cooldown.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.duration ? ' — ' + ex.duration : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'hyrox')}`);
      });
    }
    if (s.nutritionBefore) lines.push(`\n🥗 قبل التمرين: ${s.nutritionBefore}`);
    if (s.nutritionAfter)  lines.push(`🥗 بعد التمرين: ${s.nutritionAfter}`);
    lines.push(''); lines.push('💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isToday ? colors.border + ' ring-2 ring-red-300' : isFuture ? 'border-blue-200' : 'border-slate-200'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {isToday  && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
              {HYROX_TYPE_LABELS[rec.sessionType] || rec.sessionType}
            </span>
            {s.totalDuration && <span className="text-xs text-slate-500 font-semibold">⏱{s.totalDuration}د</span>}
            <span className="text-slate-400">{open ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-bold text-slate-800 text-base truncate">{s.title || 'جلسة Hyrox'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          <ShareActions onShare={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')} onCopy={copyText} copied={copied} />

          {s.coachNote && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800 leading-relaxed">💬 {s.coachNote}</div>}

          {/* Warmup */}
          {s.warmup?.exercises?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-amber-700 mb-2">🔆 الإحماء — {s.warmup.duration}</h3>
              <div className="space-y-1.5">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <a href={ytLink(ex.nameEn, 'hyrox')} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-[15px] text-slate-800 font-medium">{ex.name}</span>
                      <span className="text-sm text-slate-500 mr-2">{ex.duration || ex.reps || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stations */}
          {s.stations?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-red-700 mb-2">🏁 المحطات</h3>
              <div className="space-y-2">
                {s.stations.map((st: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <a href={ytLink(st.nameEn || st.name, 'hyrox')} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">▶ يوتيوب</a>
                      <div className="text-right">
                        <span className="text-sm text-slate-500">#{st.number} • 🏃 {st.runBefore}</span>
                        <span className="font-bold text-slate-800 text-[15px] mr-2">{st.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm text-slate-600 justify-end flex-wrap font-medium">
                      <span>🎯 {st.target}</span>
                      {st.weight && <span>⚖️ {st.weight}</span>}
                      {st.targetTime && <span>⏱ {st.targetTime}</span>}
                    </div>
                    {st.tips && <p className="text-sm text-amber-700 mt-1.5 text-right bg-amber-50 rounded-lg px-2.5 py-1.5">💡 {st.tips}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target times */}
          {s.targetTimes && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-600 mb-2">⏱ أوقات الأداء المرجعية</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(s.targetTimes).map(([k, v]: [string, any]) => {
                  const labels: Record<string,string> = {elite:'نخبة 🥇',advanced:'متقدم 🥈',intermediate:'متوسط 🥉',beginner:'مبتدئ'};
                  return <div key={k} className="text-sm text-slate-700 text-right font-medium">{labels[k]||k}: {v}</div>;
                })}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.exercises?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-teal-700 mb-2">🧘 التهدئة — {s.cooldown.duration}</h3>
              <div className="space-y-1.5">
                {s.cooldown.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-slate-500">{ex.duration}</span>
                    <span className="text-[15px] text-slate-800 font-medium">{ex.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {(s.nutritionBefore || s.nutritionAfter) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5">
              <h4 className="text-sm font-bold text-green-700 mb-1">🥗 التغذية</h4>
              {s.nutritionBefore && <p className="text-sm text-slate-700"><span className="text-green-700 font-bold">قبل: </span>{s.nutritionBefore}</p>}
              {s.nutritionAfter  && <p className="text-sm text-slate-700"><span className="text-green-700 font-bold">بعد: </span>{s.nutritionAfter}</p>}
            </div>
          )}

          {/* Next session recommendation */}
          {s.nextSessionRecommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 leading-relaxed">
              🔜 {s.nextSessionRecommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Kettlebell Session Card ──────────────────────────────────────────────────
function KettlebellCard({ rec }: { rec: any }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = rec.sessionData || rec;
  const today = todaySA();
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.kettlebell;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🔔 Kettlebell — ${formatDate(rec.date)}`);
    lines.push(`📌 ${s.title || 'جلسة Kettlebell'}`);
    if (s.coachNote)       lines.push(`💬 ${s.coachNote}`);
    if (s.breathingPattern) lines.push(`🌬️ ${s.breathingPattern}`);
    if (s.warmup?.movements?.length) {
      lines.push(''); lines.push(`🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.movements.forEach((m: any, i: number) => {
        if (typeof m === 'string') {
          lines.push(`  ${i + 1}. ${m}`);
        } else {
          lines.push(`  ${i + 1}. ${m.name}${m.sets ? ' — ' + m.sets + '×' : ''}${m.reps ? m.reps : ''}${m.notes ? ' | ' + m.notes : ''}`);
          if (m.nameEn) lines.push(`     ▶️ ${ytLink(m.nameEn, 'kettlebell')}`);
        }
      });
    }
    if (s.mainWork?.length) {
      lines.push(''); lines.push('🔔 العمل الرئيسي:');
      s.mainWork.forEach((ex: any, i: number) => {
        const name  = ex.exerciseAr || ex.exercise;
        const sets  = ex.sets   ? ` | ${ex.sets} مجموعات` : '';
        const reps  = ex.reps   ? ` × ${ex.reps}`          : '';
        const w     = ex.weight ? ` | ⚖️ ${ex.weight}`     : '';
        const rpm   = ex.targetRPM ? ` | 🔄 ${ex.targetRPM} RPM` : '';
        const rest  = ex.restBetweenSets ? ` | راحة ${ex.restBetweenSets}` : '';
        lines.push(`  ${i + 1}. ${name}${sets}${reps}${w}${rpm}${rest}`);
        if (ex.technique) lines.push(`     💡 ${ex.technique}`);
        if (ex.exercise)  lines.push(`     ▶️ ${ytLink(ex.exercise, 'kettlebell')}`);
      });
    }
    if (s.techniqueNotes?.length) {
      lines.push(''); lines.push('💡 ملاحظات تقنية:');
      s.techniqueNotes.forEach((n: string) => lines.push(`  • ${n}`));
    }
    const cooldownArr = Array.isArray(s.cooldown) ? s.cooldown : s.cooldown?.movements;
    if (cooldownArr?.length) {
      lines.push(''); lines.push('🧘 التهدئة:');
      cooldownArr.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.duration ? ' — ' + ex.duration : ''}`);
      });
    }
    if (s.progressionNote) lines.push(`\n📈 ${s.progressionNote}`);
    lines.push(''); lines.push('💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isToday ? colors.border + ' ring-2 ring-amber-300' : isFuture ? 'border-blue-200' : 'border-slate-200'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {isToday  && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
              {KB_EVENT_LABELS[rec.eventType] || rec.eventType}
            </span>
            <span className="text-slate-400">{open ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-bold text-slate-800 text-base truncate">{s.title || 'جلسة Kettlebell'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          <ShareActions onShare={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')} onCopy={copyText} copied={copied} />

          {s.coachNote && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 leading-relaxed">💬 {s.coachNote}</div>}
          {s.breathingPattern && <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700">🌬️ {s.breathingPattern}</div>}

          {/* Warmup */}
          {s.warmup?.movements?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-amber-700 mb-2">🔆 الإحماء — {s.warmup.duration}</h3>
              <div className="space-y-1.5">
                {s.warmup.movements.map((m: any, i: number) => (
                  typeof m === 'string'
                    ? <span key={i} className="inline-block text-sm bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg mr-1 mb-1 font-medium">{m}</span>
                    : <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                        <span className="text-sm text-slate-500">{m.sets && `${m.sets}×`}{m.reps}</span>
                        <span className="text-[15px] text-slate-800 font-medium">{m.name}</span>
                      </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Work */}
          {s.mainWork?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-amber-700 mb-2">🔔 العمل الرئيسي</h3>
              <div className="space-y-2">
                {s.mainWork.map((ex: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-amber-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <a href={ytLink(ex.exercise || ex.exerciseAr, 'kettlebell')} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">▶ يوتيوب</a>
                      <div className="font-bold text-slate-800 text-[15px]">{ex.exerciseAr || ex.exercise}</div>
                    </div>
                    <div className="flex gap-3 text-sm text-slate-600 justify-end flex-wrap font-medium">
                      {ex.sets && <span>{ex.sets} مجموعة</span>}
                      {ex.reps && <span>{ex.reps}</span>}
                      {ex.weight && <span>⚖️ {ex.weight}</span>}
                      {ex.targetRPM && <span>🔄 {ex.targetRPM} RPM</span>}
                      {ex.restBetweenSets && <span>راحة {ex.restBetweenSets}</span>}
                    </div>
                    {ex.technique && <p className="text-sm text-amber-700 mt-1.5 text-right bg-amber-50 rounded-lg px-2.5 py-1.5">💡 {ex.technique}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.techniqueNotes?.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-1 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-600 mb-1">💡 ملاحظات تقنية</h4>
              {s.techniqueNotes.map((n: string, i: number) => (
                <p key={i} className="text-sm text-slate-700">• {n}</p>
              ))}
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-teal-700 mb-2">🧘 التهدئة</h3>
              <div className="space-y-1.5">
                {s.cooldown.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-slate-500">{ex.duration}</span>
                    <div className="text-right"><span className="text-[15px] text-slate-800 font-medium">{ex.name}</span>{ex.focus && <span className="text-sm text-teal-700 mr-2">({ex.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.progressionNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 leading-relaxed">
              📈 {s.progressionNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CAL_LEVEL_TABS: { key: LevelKey; label: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', active: 'bg-green-600 text-white',  idle: 'bg-green-50 text-green-700 border border-green-300'  },
  { key: 'intermediate', label: 'متوسط', active: 'bg-blue-600 text-white',   idle: 'bg-blue-50 text-blue-700 border border-blue-300'    },
  { key: 'advanced',     label: 'متقدم', active: 'bg-orange-500 text-white',  idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'نخبة',  active: 'bg-purple-600 text-white',  idle: 'bg-purple-50 text-purple-700 border border-purple-300' },
];

// ── Calisthenics Session Card ────────────────────────────────────────────────
function CalisthenicsCard({ rec }: { rec: any }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | undefined>(undefined);
  const s = rec.sessionData || rec;
  const today = todaySA();
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.calisthenics;

  const hasLevels = [
    ...(s.skillWork?.exercises || []),
    ...(Array.isArray(s.mainWork) ? s.mainWork : (s.mainWork?.exercises || [])),
  ].some((ex: any) => ex.levels);

  function buildText() {
    const lines: string[] = [];
    lines.push(`🤸 Calisthenics — ${formatDate(rec.date)}`);
    const typeLabel = CALIS_TYPE_LABELS[rec.sessionType] || rec.sessionType || '';
    lines.push(`📌 ${s.title || 'جلسة Calisthenics'}${typeLabel ? ' | ' + typeLabel : ''}${s.totalDuration ? ' | ⏱' + s.totalDuration + 'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    if (s.warmup?.exercises?.length) {
      lines.push(''); lines.push(`🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.sets ? ' — ' + ex.sets + '×' : ''}${ex.reps || ''}${ex.notes ? ' | ' + ex.notes : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
      });
    }
    if (s.skillWork?.exercises?.length) {
      lines.push(''); lines.push(`🤸 ${s.skillWork.title || 'عمل المهارات'}${s.skillWork.duration ? ' — ' + s.skillWork.duration + 'د' : ''}:`);
      s.skillWork.exercises.forEach((ex: any, i: number) => {
        const target = ex.target || ex.hold || '';
        lines.push(`  ${i + 1}. ${ex.name}${target ? ' — ' + target : ''}${ex.sets ? ' | ' + ex.sets + ' مج' : ''}`);
        if (ex.nameEn)      lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
        if (ex.regression)  lines.push(`     ⬇️ ${ex.regression}`);
        if (ex.progression) lines.push(`     ⬆️ ${ex.progression}`);
      });
    }
    const mainExercises = Array.isArray(s.mainWork) ? s.mainWork : (s.mainWork?.exercises || []);
    if (mainExercises.length) {
      const mwTitle = !Array.isArray(s.mainWork) ? (s.mainWork?.title || 'العمل الرئيسي') : 'العمل الرئيسي';
      const mwDur   = !Array.isArray(s.mainWork) && s.mainWork?.duration ? ' — ' + s.mainWork.duration + 'د' : '';
      lines.push(''); lines.push(`💪 ${mwTitle}${mwDur}:`);
      if (!Array.isArray(s.mainWork) && s.mainWork?.format) lines.push(`  📋 ${s.mainWork.format}`);
      mainExercises.forEach((ex: any, i: number) => {
        const sets  = ex.sets  ? ` | ${ex.sets} مج`    : '';
        const reps  = ex.reps  ? ` × ${ex.reps}`        : '';
        const rest  = ex.rest  ? ` | راحة ${ex.rest}`   : '';
        const tempo = ex.tempo ? ` | Tempo ${ex.tempo}` : '';
        lines.push(`  ${i + 1}. ${ex.name}${sets}${reps}${rest}${tempo}`);
        if (ex.nameEn)      lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
        if (ex.cues)        lines.push(`     💡 ${ex.cues}`);
        if (ex.regression || ex.scaling?.easier)  lines.push(`     ⬇️ ${ex.regression || ex.scaling?.easier}`);
        if (ex.progression || ex.scaling?.harder) lines.push(`     ⬆️ ${ex.progression || ex.scaling?.harder}`);
      });
    }
    if (s.metcon?.exercises?.length) {
      lines.push(''); lines.push(`🔥 ${s.metcon.format || 'الميتكون'}${s.metcon.duration ? ' — ' + s.metcon.duration + 'د' : ''}:`);
      s.metcon.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.reps ? ' — ' + ex.reps : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
        if (ex.notes)  lines.push(`     💡 ${ex.notes}`);
      });
    }
    if (s.cooldown?.stretches?.length) {
      lines.push(''); lines.push(`🧘 التهدئة${s.cooldown.duration ? ' — ' + s.cooldown.duration + 'د' : ''}:`);
      s.cooldown.stretches.forEach((st: any, i: number) => {
        lines.push(`  ${i + 1}. ${st.name}${st.duration ? ' — ' + st.duration : ''}${st.focus ? ' | ' + st.focus : ''}`);
      });
    }
    if (s.nutritionTips)  lines.push(`\n🥗 ${s.nutritionTips}`);
    if (s.progressionPath) lines.push(`📈 ${s.progressionPath}`);
    lines.push(''); lines.push('💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isToday ? colors.border + ' ring-2 ring-emerald-300' : isFuture ? 'border-blue-200' : 'border-slate-200'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {isToday  && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
              {CALIS_TYPE_LABELS[rec.sessionType] || rec.sessionType}
            </span>
            {s.totalDuration && <span className="text-xs text-slate-500 font-semibold">⏱{s.totalDuration}د</span>}
            <span className="text-slate-400">{open ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-bold text-slate-800 text-base truncate">{s.title || 'جلسة Calisthenics'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          <ShareActions onShare={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')} onCopy={copyText} copied={copied} />

          {s.coachNote && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800 leading-relaxed">💬 {s.coachNote}</div>}

          {/* Level Tabs */}
          {hasLevels && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="text-sm font-bold text-slate-600 mb-2">اختر مستواك</div>
              <div className="grid grid-cols-4 gap-1.5">
                {CAL_LEVEL_TABS.map(t => (
                  <button key={t.key}
                    onClick={() => setSelectedLevel(selectedLevel === t.key ? undefined : t.key)}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${selectedLevel === t.key ? t.active : t.idle}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Warmup */}
          {s.warmup?.exercises?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-amber-700 mb-2">🔆 الإحماء — {s.warmup.duration} د</h3>
              <div className="space-y-1.5">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 font-semibold">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-[15px] text-slate-800 font-medium">{ex.name}</span>
                      <span className="text-sm text-slate-500 mr-2">{ex.sets}×{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Work */}
          {s.skillWork?.exercises?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-purple-700 mb-2">🤸 {s.skillWork.title || 'عمل المهارة'} — {s.skillWork.duration} د</h3>
              <div className="space-y-2">
                {s.skillWork.exercises.map((ex: any, i: number) => {
                  const lvl = selectedLevel && ex.levels ? ex.levels[selectedLevel] : null;
                  return (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:text-red-700 font-semibold">▶ يوتيوب</a>
                        <div className="font-bold text-slate-800 text-[15px]">{ex.name}</div>
                      </div>
                      {lvl ? (
                        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-right font-medium">{typeof lvl === 'string' ? lvl : (lvl.reps || lvl.scaling || '')}{lvl.cue ? ` — ${lvl.cue}` : ''}</div>
                      ) : (
                        <>
                          {ex.regression && <p className="text-sm text-blue-700 text-right font-medium">⬇️ {ex.regression}</p>}
                          {ex.progression && <p className="text-sm text-green-700 text-right font-medium">⬆️ {ex.progression}</p>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Work — يدعم البنية الجديدة (object) والقديمة (array) */}
          {s.mainWork && (Array.isArray(s.mainWork) ? s.mainWork.length > 0 : s.mainWork.exercises?.length > 0) && (
            <div>
              <h3 className="font-bold text-[15px] text-emerald-700 mb-2">💪 {Array.isArray(s.mainWork) ? 'العمل الرئيسي' : (s.mainWork.title || 'العمل الرئيسي')} {!Array.isArray(s.mainWork) && s.mainWork.duration ? `— ${s.mainWork.duration} د` : ''}</h3>
              <div className="space-y-2">
                {(Array.isArray(s.mainWork) ? s.mainWork : s.mainWork.exercises).map((ex: any, i: number) => {
                  const lvl = selectedLevel && ex.levels ? ex.levels[selectedLevel] : null;
                  return (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-emerald-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:text-red-700 font-semibold">▶ يوتيوب</a>
                        <div className="font-bold text-slate-800 text-[15px]">{ex.name}</div>
                      </div>
                      {lvl ? (
                        <div className="bg-white rounded-lg px-3 py-2 space-y-1 text-right border border-slate-200">
                          {lvl.weight && <div className="text-sm text-slate-600">⚖️ <span className="font-bold text-slate-800">{lvl.weight}</span></div>}
                          {(lvl.reps || lvl.scaling) && <div className="text-sm text-slate-600">🔢 <span className="font-bold text-slate-800">{lvl.reps || lvl.scaling}</span></div>}
                          {lvl.cue && <div className="text-sm text-emerald-700 font-medium">💬 {lvl.cue}</div>}
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-3 text-sm text-slate-600 justify-end font-medium">
                            {ex.sets && <span>{ex.sets} مج</span>}
                            {ex.reps && <span>{ex.reps}</span>}
                            {ex.rest && <span>راحة {ex.rest}</span>}
                          </div>
                          {ex.regression && <p className="text-sm text-blue-700 text-right mt-1 font-medium">⬇️ {ex.regression}</p>}
                          {ex.progression && <p className="text-sm text-green-700 text-right mt-1 font-medium">⬆️ {ex.progression}</p>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metcon */}
          {s.metcon?.exercises?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-orange-700 mb-2">🔥 {s.metcon.format} — {s.metcon.duration} د</h3>
              <div className="space-y-1.5">
                {s.metcon.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 font-semibold">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-[15px] text-slate-800 font-medium">{ex.name}</span>
                      <span className="text-sm text-slate-500 mr-2">{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.stretches?.length > 0 && (
            <div>
              <h3 className="font-bold text-[15px] text-teal-700 mb-2">🧘 التهدئة — {s.cooldown.duration} د</h3>
              <div className="space-y-1.5">
                {s.cooldown.stretches.map((st: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-slate-500">{st.duration}</span>
                    <div className="text-right"><span className="text-[15px] text-slate-800 font-medium">{st.name}</span>{st.focus && <span className="text-sm text-teal-700 mr-2">({st.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition + Progression */}
          {s.nutritionTips && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">
              🥗 <span className="text-green-700 font-bold">تغذية: </span>{s.nutritionTips}
            </div>
          )}
          {s.progressionPath && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 leading-relaxed">
              📈 {s.progressionPath}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── التقويم الموحد ───────────────────────────────────────────────────────────
function UnifiedCalendar({
  wods, hyroxSessions, kettlebellSessions, calisthenicsSessions, onSelect,
}: {
  wods: any[]; hyroxSessions: any[]; kettlebellSessions: any[]; calisthenicsSessions: any[];
  onSelect: (sport: string, date: string) => void;
}) {
  const [cursor, setCursor] = useState(new Date());
  const today = todaySA();

  const year  = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const DAYS_AR   = ['أح','إث','ثل','أر','خم','جم','سب'];
  const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  // Build date maps
  const cfDates   = new Set(wods.filter(w => w.type !== 'راحة' && w.type !== 'راحة نشطة').map(w => w.date));
  const hxDates   = new Set(hyroxSessions.map(s => s.date));
  const kbDates   = new Set(kettlebellSessions.map(s => s.date));
  const calDates  = new Set(calisthenicsSessions.map(s => s.date));
  const restDates = new Set(wods.filter(w => w.type === 'راحة' || w.type === 'راحة نشطة').map(w => w.date));

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">›</button>
        <span className="font-extrabold text-slate-800 text-base">{MONTHS_AR[month]} {year}</span>
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">‹</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_AR.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === today;
          const hasCF   = cfDates.has(dateStr);
          const hasHX   = hxDates.has(dateStr);
          const hasKB   = kbDates.has(dateStr);
          const hasCal  = calDates.has(dateStr);
          const isRest  = restDates.has(dateStr) && !hasCF;
          const hasAny  = hasCF || hasHX || hasKB || hasCal;

          return (
            <button key={i}
              onClick={() => {
                if (hasCF)  onSelect('crossfit', dateStr);
                else if (hasHX)  onSelect('hyrox', dateStr);
                else if (hasKB)  onSelect('kettlebell', dateStr);
                else if (hasCal) onSelect('calisthenics', dateStr);
              }}
              className={`aspect-square rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 border
                ${isToday ? 'bg-orange-600 text-white border-transparent shadow-md' : ''}
                ${!isToday && hasAny ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 cursor-pointer' : ''}
                ${!isToday && isRest ? 'bg-slate-50 border-slate-200 text-slate-400' : ''}
                ${!isToday && !hasAny && !isRest ? 'bg-white border-slate-100 text-slate-300 cursor-default' : ''}
              `}>
              <span>{day}</span>
              <div className="flex gap-0.5">
                {hasCF  && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                {hasHX  && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {hasKB  && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                {hasCal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {isRest && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> CrossFit</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Hyrox</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Kettlebell</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Calisthenics</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> راحة</span>
      </div>
    </div>
  );
}

// ── الصفحة الرئيسية ──────────────────────────────────────────────────────────
type MainTab = 'crossfit' | 'calisthenics' | 'hyrox' | 'kettlebell' | 'calendar';
type CrossfitSubTab = 'upcoming' | 'past';

const MAIN_TABS: { id: MainTab; label: string; sublabel: string; active: string }[] = [
  { id: 'crossfit',     label: '🏋️',  sublabel: 'CrossFit',     active: 'bg-orange-500' },
  { id: 'calisthenics', label: '🤸',  sublabel: 'Calisthenics', active: 'bg-emerald-600' },
  { id: 'hyrox',        label: '🏁',  sublabel: 'Hyrox',        active: 'bg-red-600' },
  { id: 'kettlebell',   label: '🔔',  sublabel: 'Kettlebell',   active: 'bg-amber-600' },
  { id: 'calendar',     label: '🗓️',  sublabel: 'تقويم',        active: 'bg-purple-600' },
];

export default function WodHistoryClient({
  member, wods: initialWods, hyroxSessions, kettlebellSessions, calisthenicsSessions,
}: {
  member: any;
  wods: any[];
  hyroxSessions: any[];
  kettlebellSessions: any[];
  calisthenicsSessions: any[];
}) {
  const [mainTab, setMainTab] = useState<MainTab>('crossfit');
  const [cfTab,   setCfTab]   = useState<CrossfitSubTab>('upcoming');
  const [wods, setWods] = useState(initialWods);
  const [search, setSearch] = useState('');
  const isAdmin = member.role === 'admin';
  const today = todaySA();

  const cfUpcoming = wods.filter(w => w.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const cfPast     = wods.filter(w => w.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const hxUpcoming   = hyroxSessions.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const hxPast       = hyroxSessions.filter(s => s.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const kbUpcoming   = kettlebellSessions.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const kbPast       = kettlebellSessions.filter(s => s.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const calUpcoming  = calisthenicsSessions.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const calPast      = calisthenicsSessions.filter(s => s.date < today).sort((a, b) => b.date.localeCompare(a.date));

  function handleDelete(id: string) { setWods(prev => prev.filter(w => w.id !== id)); }

  function handleCalendarSelect(sport: string, date: string) {
    setMainTab(sport as MainTab);
    setSearch(date);
    if (sport === 'crossfit') setCfTab(date >= today ? 'upcoming' : 'past');
  }

  const totalCount = wods.length + hyroxSessions.length + kettlebellSessions.length + calisthenicsSessions.length;

  // Filter helpers
  const filterWods = (list: any[]) => !search ? list : list.filter(w => w.title?.toLowerCase().includes(search.toLowerCase()) || w.date.includes(search));
  const filterSess = (list: any[]) => !search ? list : list.filter(s => (s.sessionData?.title || s.title || '').toLowerCase().includes(search.toLowerCase()) || s.date.includes(search));

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-5 overflow-x-hidden">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>📚</span> سجل التمارين
            </h1>
            <span className="text-sm font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">{totalCount} جلسة</span>
          </div>

          {/* Main Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {MAIN_TABS.map(t => (
              <button key={t.id} onClick={() => { setMainTab(t.id); setSearch(''); }}
                className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold transition-colors ${mainTab === t.id ? t.active + ' text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="text-lg">{t.label}</span>
                <span className="text-[10px] mt-0.5 hidden sm:block">{t.sublabel}</span>
              </button>
            ))}
          </div>

          {/* التقويم الموحد */}
          {mainTab === 'calendar' && (
            <UnifiedCalendar
              wods={wods}
              hyroxSessions={hyroxSessions}
              kettlebellSessions={kettlebellSessions}
              calisthenicsSessions={calisthenicsSessions}
              onSelect={handleCalendarSelect}
            />
          )}

          {/* Search */}
          {mainTab !== 'calendar' && (
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 ابحث بالتاريخ أو العنوان..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-[15px] placeholder:text-slate-400 focus:outline-none focus:border-blue-400 shadow-sm"
            />
          )}

          {/* ── CrossFit ── */}
          {mainTab === 'crossfit' && (
            <div className="space-y-4">
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={() => { setCfTab('upcoming'); setSearch(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${cfTab === 'upcoming' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  📅 القادمة ({cfUpcoming.length})
                </button>
                <button onClick={() => { setCfTab('past'); setSearch(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${cfTab === 'past' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  📚 السابقة ({cfPast.length})
                </button>
              </div>
              {cfTab === 'upcoming' && cfUpcoming.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <div className="text-4xl">📭</div>
                  <p className="text-slate-500 font-medium">لا تمارين مجدولة — استخدم الإدارة ← خطة CrossFit</p>
                </div>
              )}
              {cfTab === 'past' && cfPast.length === 0 && (
                <div className="text-center py-12"><div className="text-4xl mb-2">📭</div><p className="text-slate-500 font-medium">لا تمارين سابقة</p></div>
              )}
              <div className="space-y-3">
                {filterWods(cfTab === 'upcoming' ? cfUpcoming : cfPast).map((wod, i) => (
                  <WodCard key={wod.id} wod={wod} isAdmin={isAdmin} onDelete={handleDelete}
                    defaultOpen={cfTab === 'upcoming' && i === 0} />
                ))}
              </div>
            </div>
          )}

          {/* ── Hyrox ── */}
          {mainTab === 'hyrox' && (
            <SportSection
              upcoming={hxUpcoming} past={hxPast}
              emptyMsg="استخدم الإدارة ← خطة الرياضات ← Hyrox"
              renderCard={(rec) => <HyroxCard key={rec.id} rec={rec} />}
              search={search} filterFn={filterSess}
            />
          )}

          {/* ── Kettlebell ── */}
          {mainTab === 'kettlebell' && (
            <SportSection
              upcoming={kbUpcoming} past={kbPast}
              emptyMsg="استخدم الإدارة ← خطة الرياضات ← Kettlebell"
              renderCard={(rec) => <KettlebellCard key={rec.id} rec={rec} />}
              search={search} filterFn={filterSess}
            />
          )}

          {/* ── Calisthenics ── */}
          {mainTab === 'calisthenics' && (
            <SportSection
              upcoming={calUpcoming} past={calPast}
              emptyMsg="استخدم الإدارة ← خطة الرياضات ← Calisthenics"
              renderCard={(rec) => <CalisthenicsCard key={rec.id} rec={rec} />}
              search={search} filterFn={filterSess}
            />
          )}

        </div>
      </main>
    </div>
  );
}

// ── مكوّن مشترك للرياضات (قادم/سابق) ──────────────────────────────────────
function SportSection({
  upcoming, past, emptyMsg, renderCard, search, filterFn,
}: {
  upcoming: any[]; past: any[];
  emptyMsg: string;
  renderCard: (rec: any) => React.ReactNode;
  search: string;
  filterFn: (list: any[]) => any[];
}) {
  const [sub, setSub] = useState<'upcoming' | 'past'>('upcoming');
  const list = filterFn(sub === 'upcoming' ? upcoming : past);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
        <button onClick={() => setSub('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${sub === 'upcoming' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          📅 القادمة ({upcoming.length})
        </button>
        <button onClick={() => setSub('past')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${sub === 'past' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          📚 السابقة ({past.length})
        </button>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">📭</div>
          <p className="text-slate-500 text-sm font-medium">{sub === 'upcoming' ? emptyMsg : 'لا جلسات سابقة'}</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(rec => renderCard(rec))}</div>
      )}
    </div>
  );
}
