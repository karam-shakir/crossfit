'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ExerciseCard from '@/components/ExerciseCard';

// ── ألوان الرياضات ──────────────────────────────────────────────────────────
const SPORT_COLORS = {
  crossfit:     { dot: 'bg-orange-500',  border: 'border-orange-500/60', badge: 'bg-orange-900/40 text-orange-300',  title: 'text-orange-400',  ring: 'ring-orange-500'  },
  calisthenics: { dot: 'bg-emerald-500', border: 'border-emerald-500/60',badge: 'bg-emerald-900/40 text-emerald-300',title: 'text-emerald-400', ring: 'ring-emerald-500' },
  hyrox:        { dot: 'bg-red-500',     border: 'border-red-500/60',    badge: 'bg-red-900/40 text-red-300',        title: 'text-red-400',     ring: 'ring-red-500'     },
  kettlebell:   { dot: 'bg-yellow-500',  border: 'border-yellow-500/60', badge: 'bg-yellow-900/40 text-yellow-300',  title: 'text-yellow-400',  ring: 'ring-yellow-500'  },
};

const WOD_TYPE_COLORS: Record<string, string> = {
  'AMRAP': 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  'للوقت': 'bg-red-900/40 text-red-300 border-red-700/40',
  'قوة':   'bg-blue-900/40 text-blue-300 border-blue-700/40',
  'تدريب': 'bg-green-900/40 text-green-300 border-green-700/40',
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

// ── CrossFit WOD Card ────────────────────────────────────────────────────────
function WodCard({ wod, isAdmin, onDelete, defaultOpen = false }: { wod: any; isAdmin?: boolean; onDelete?: (id: string) => void; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isFuture = wod.date > today;
  const isToday  = wod.date === today;
  const colors   = SPORT_COLORS.crossfit;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🏋️ CrossFit — ${formatDate(wod.date)}`);
    lines.push(`📌 ${wod.title || 'تمرين'}${wod.type ? ' | ' + wod.type : ''}${wod.duration ? ' | ⏱' + wod.duration + 'د' : ''}`);
    if (wod.aiTheme) lines.push(`🤖 ${wod.aiTheme}`);
    if (wod.notes)   lines.push(`📝 ${wod.notes}`);
    const sections = [
      { k: 'warmup',   icon: '🔆', label: 'الإحماء' },
      { k: 'strength', icon: '🏋️', label: 'القوة' },
      { k: 'metcon',   icon: '🔥', label: 'الـ WOD' },
      { k: 'cooldown', icon: '🧘', label: 'التهدئة' },
    ];
    for (const sec of sections) {
      const items = (wod[sec.k] || []).filter((e: any) => e.exerciseId);
      if (!items.length) continue;
      lines.push('');
      lines.push(`${sec.icon} ${sec.label}:`);
      items.forEach((ex: any, i: number) => {
        const name   = ex.exercise?.nameAr || ex.exerciseId;
        const nameEn = ex.exercise?.nameEn || ex.exerciseId || '';
        const reps   = ex.reps   ? ` — ${ex.reps}`   : '';
        const weight = ex.weight ? ` (${ex.weight})`  : '';
        const sets   = ex.sets   ? ` × ${ex.sets} مج` : '';
        lines.push(`  ${i + 1}. ${name}${sets}${reps}${weight}`);
        if (nameEn) lines.push(`     ▶️ ${ytLink(nameEn, 'crossfit')}`);
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
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? colors.border : isFuture ? 'border-blue-700/40' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setIsOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday  && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${WOD_TYPE_COLORS[wod.type] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>{wod.type}</span>
            {wod.duration && <span className="text-xs text-gray-500">⏱{wod.duration}د</span>}
            <span className="text-gray-600">{isOpen ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-semibold text-white text-sm truncate">{wod.title || 'تمرين'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDate(wod.date)}</div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-semibold">
              📲 واتساب
            </button>
            <button onClick={copyText} className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold">
              {copied ? '✅' : '📋'} نسخ
            </button>
            {isAdmin && (
              <>
                <a href={`/admin?date=${wod.date}`} className="px-3 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold">✏️</a>
                <button onClick={deleteWod} className="px-3 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-400 text-xs font-semibold">🗑</button>
              </>
            )}
          </div>
          {wod.aiTheme && <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3 text-xs text-purple-300">🤖 {wod.aiTheme}</div>}
          {wod.notes   && <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-300">📝 {wod.notes}</div>}
          {(['warmup','strength','metcon','cooldown'] as const).map(sec => {
            const items = wod[sec]?.filter((e: any) => e.exerciseId);
            if (!items?.length) return null;
            const labels: Record<string, {label:string;icon:string;color:string}> = {
              warmup:{label:'الإحماء',icon:'🔆',color:'text-yellow-400'},
              strength:{label:'القوة',icon:'🏋️',color:'text-blue-400'},
              metcon:{label:'الـ WOD',icon:'🔥',color:'text-orange-400'},
              cooldown:{label:'التهدئة',icon:'🧘',color:'text-teal-400'},
            };
            const {label,icon,color} = labels[sec];
            return (
              <div key={sec}>
                <h3 className={`font-semibold text-sm mb-2 flex items-center gap-2 ${color}`}><span>{icon}</span>{label}</h3>
                <div className="space-y-2">
                  {items.map((ex: any, i: number) => (
                    <div key={i}>
                      <ExerciseCard item={ex} index={i} />
                      {ex.exercise?.youtube && (
                        <a href={ex.exercise.youtube} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 mr-2">
                          ▶ شاهد الشرح على يوتيوب
                        </a>
                      )}
                    </div>
                  ))}
                </div>
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
  const today = new Date().toISOString().split('T')[0];
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.hyrox;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🏁 Hyrox — ${formatDate(rec.date)}`);
    lines.push(`📌 ${s.title || 'جلسة Hyrox'}${s.totalDuration ? ' | ⏱' + s.totalDuration + 'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    // الإحماء
    if (s.warmup?.exercises?.length) {
      lines.push(''); lines.push(`🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.reps ? ' — ' + ex.reps : ''}${ex.duration ? ' — ' + ex.duration : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'hyrox')}`);
      });
    }
    // المحطات
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
    // التهدئة
    if (s.cooldown?.exercises?.length) {
      lines.push(''); lines.push('🧘 التهدئة:');
      s.cooldown.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.duration ? ' — ' + ex.duration : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'hyrox')}`);
      });
    }
    // التغذية
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
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? colors.border : isFuture ? 'border-blue-700/40' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday  && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
              {HYROX_TYPE_LABELS[rec.sessionType] || rec.sessionType}
            </span>
            {s.totalDuration && <span className="text-xs text-gray-500">⏱{s.totalDuration}د</span>}
            <span className="text-gray-600">{open ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-semibold text-white text-sm truncate">{s.title || 'جلسة Hyrox'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* Share buttons */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-semibold">
              📲 واتساب
            </button>
            <button onClick={copyText} className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-xs text-red-300">💬 {s.coachNote}</div>}

          {/* Warmup */}
          {s.warmup?.exercises?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration}</h3>
              <div className="space-y-1">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <a href={ytLink(ex.nameEn, 'hyrox')} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.duration || ex.reps || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stations */}
          {s.stations?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-red-400 mb-2">🏁 المحطات</h3>
              <div className="space-y-2">
                {s.stations.map((st: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <a href={ytLink(st.nameEn || st.name, 'hyrox')} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">▶ يوتيوب</a>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">#{st.number} • 🏃 {st.runBefore}</span>
                        <span className="font-semibold text-white text-sm mr-2">{st.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end">
                      <span>🎯 {st.target}</span>
                      {st.weight && <span>⚖️ {st.weight}</span>}
                      {st.targetTime && <span>⏱ {st.targetTime}</span>}
                    </div>
                    {st.tips && <p className="text-xs text-yellow-300 mt-1 text-right">💡 {st.tips}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target times */}
          {s.targetTimes && (
            <div className="bg-gray-800/40 rounded-xl p-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">⏱ أوقات الأداء المرجعية</h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(s.targetTimes).map(([k, v]: [string, any]) => {
                  const labels: Record<string,string> = {elite:'نخبة 🥇',advanced:'متقدم 🥈',intermediate:'متوسط 🥉',beginner:'مبتدئ'};
                  return <div key={k} className="text-xs text-gray-300 text-right">{labels[k]||k}: {v}</div>;
                })}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.exercises?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-teal-400 mb-2">🧘 التهدئة — {s.cooldown.duration}</h3>
              <div className="space-y-1">
                {s.cooldown.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">{ex.duration}</span>
                    <span className="text-sm text-white">{ex.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {(s.nutritionBefore || s.nutritionAfter) && (
            <div className="bg-green-900/10 border border-green-700/20 rounded-xl p-3 space-y-1">
              <h4 className="text-xs font-semibold text-green-400 mb-1">🥗 التغذية</h4>
              {s.nutritionBefore && <p className="text-xs text-gray-300"><span className="text-green-400">قبل: </span>{s.nutritionBefore}</p>}
              {s.nutritionAfter  && <p className="text-xs text-gray-300"><span className="text-green-400">بعد: </span>{s.nutritionAfter}</p>}
            </div>
          )}

          {/* Next session recommendation */}
          {s.nextSessionRecommendation && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
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
  const today = new Date().toISOString().split('T')[0];
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.kettlebell;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🔔 Kettlebell — ${formatDate(rec.date)}`);
    lines.push(`📌 ${s.title || 'جلسة Kettlebell'}`);
    if (s.coachNote)       lines.push(`💬 ${s.coachNote}`);
    if (s.breathingPattern) lines.push(`🌬️ ${s.breathingPattern}`);
    // الإحماء
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
    // العمل الرئيسي
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
    // ملاحظات تقنية
    if (s.techniqueNotes?.length) {
      lines.push(''); lines.push('💡 ملاحظات تقنية:');
      s.techniqueNotes.forEach((n: string) => lines.push(`  • ${n}`));
    }
    // التهدئة
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
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? colors.border : isFuture ? 'border-blue-700/40' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday  && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
              {KB_EVENT_LABELS[rec.eventType] || rec.eventType}
            </span>
            {s.coachNote && <span className="text-gray-600">{open ? '▲' : '▼'}</span>}
            {!s.coachNote && <span className="text-gray-600">{open ? '▲' : '▼'}</span>}
          </div>
          <div className="text-right min-w-0">
            <div className="font-semibold text-white text-sm truncate">{s.title || 'جلسة Kettlebell'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* Share buttons */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-semibold">
              📲 واتساب
            </button>
            <button onClick={copyText} className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs text-yellow-300">💬 {s.coachNote}</div>}
          {s.breathingPattern && <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-300">🌬️ {s.breathingPattern}</div>}

          {/* Warmup */}
          {s.warmup?.movements?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration}</h3>
              <div className="space-y-1.5">
                {s.warmup.movements.map((m: any, i: number) => (
                  typeof m === 'string'
                    ? <span key={i} className="inline-block text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg mr-1 mb-1">{m}</span>
                    : <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400">{m.sets && `${m.sets}×`}{m.reps}</span>
                        <span className="text-sm text-white">{m.name}</span>
                      </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Work */}
          {s.mainWork?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-yellow-400 mb-2">🔔 العمل الرئيسي</h3>
              <div className="space-y-2">
                {s.mainWork.map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-yellow-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <a href={ytLink(ex.exercise || ex.exerciseAr, 'kettlebell')} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">▶ يوتيوب</a>
                      <div className="font-semibold text-white text-sm">{ex.exerciseAr || ex.exercise}</div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end flex-wrap">
                      {ex.sets && <span>{ex.sets} مجموعة</span>}
                      {ex.reps && <span>{ex.reps}</span>}
                      {ex.weight && <span>⚖️ {ex.weight}</span>}
                      {ex.targetRPM && <span>🔄 {ex.targetRPM} RPM</span>}
                      {ex.restBetweenSets && <span>راحة {ex.restBetweenSets}</span>}
                    </div>
                    {ex.technique && <p className="text-xs text-yellow-300 mt-1 text-right">💡 {ex.technique}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.techniqueNotes?.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-3 space-y-1">
              <h4 className="text-xs font-semibold text-gray-400 mb-1">💡 ملاحظات تقنية</h4>
              {s.techniqueNotes.map((n: string, i: number) => (
                <p key={i} className="text-xs text-gray-300">• {n}</p>
              ))}
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-teal-400 mb-2">🧘 التهدئة</h3>
              <div className="space-y-1">
                {s.cooldown.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">{ex.duration}</span>
                    <div className="text-right"><span className="text-sm text-white">{ex.name}</span>{ex.focus && <span className="text-xs text-teal-400 mr-2">({ex.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.progressionNote && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
              📈 {s.progressionNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Calisthenics Session Card ────────────────────────────────────────────────
function CalisthenicsCard({ rec }: { rec: any }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = rec.sessionData || rec;
  const today = new Date().toISOString().split('T')[0];
  const isFuture = rec.date > today;
  const isToday  = rec.date === today;
  const colors   = SPORT_COLORS.calisthenics;

  function buildText() {
    const lines: string[] = [];
    lines.push(`🤸 Calisthenics — ${formatDate(rec.date)}`);
    const typeLabel = CALIS_TYPE_LABELS[rec.sessionType] || rec.sessionType || '';
    lines.push(`📌 ${s.title || 'جلسة Calisthenics'}${typeLabel ? ' | ' + typeLabel : ''}${s.totalDuration ? ' | ⏱' + s.totalDuration + 'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    // الإحماء
    if (s.warmup?.exercises?.length) {
      lines.push(''); lines.push(`🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.sets ? ' — ' + ex.sets + '×' : ''}${ex.reps || ''}${ex.notes ? ' | ' + ex.notes : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
      });
    }
    // عمل المهارات
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
    // العمل الرئيسي
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
    // الميتكون
    if (s.metcon?.exercises?.length) {
      lines.push(''); lines.push(`🔥 ${s.metcon.format || 'الميتكون'}${s.metcon.duration ? ' — ' + s.metcon.duration + 'د' : ''}:`);
      s.metcon.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i + 1}. ${ex.name}${ex.reps ? ' — ' + ex.reps : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn, 'calisthenics')}`);
        if (ex.notes)  lines.push(`     💡 ${ex.notes}`);
      });
    }
    // التهدئة
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
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? colors.border : isFuture ? 'border-blue-700/40' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday  && <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">قادم</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
              {CALIS_TYPE_LABELS[rec.sessionType] || rec.sessionType}
            </span>
            {s.totalDuration && <span className="text-xs text-gray-500">⏱{s.totalDuration}د</span>}
            <span className="text-gray-600">{open ? '▲' : '▼'}</span>
          </div>
          <div className="text-right min-w-0">
            <div className="font-semibold text-white text-sm truncate">{s.title || 'جلسة Calisthenics'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDate(rec.date)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* Share buttons */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-semibold">
              📲 واتساب
            </button>
            <button onClick={copyText} className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 text-xs text-emerald-300">💬 {s.coachNote}</div>}

          {/* Warmup */}
          {s.warmup?.exercises?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration} د</h3>
              <div className="space-y-1">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:text-red-300">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.sets}×{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Work */}
          {s.skillWork?.exercises?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-purple-400 mb-2">🤸 {s.skillWork.title || 'عمل المهارة'} — {s.skillWork.duration} د</h3>
              <div className="space-y-2">
                {s.skillWork.exercises.map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-purple-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300">▶ يوتيوب</a>
                      <div className="font-semibold text-white text-sm">{ex.name}</div>
                    </div>
                    {ex.regression && <p className="text-xs text-blue-300 text-right">⬇️ {ex.regression}</p>}
                    {ex.progression && <p className="text-xs text-green-300 text-right">⬆️ {ex.progression}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Work — يدعم البنية الجديدة (object) والقديمة (array) */}
          {s.mainWork && (Array.isArray(s.mainWork) ? s.mainWork.length > 0 : s.mainWork.exercises?.length > 0) && (
            <div>
              <h3 className="font-semibold text-sm text-emerald-400 mb-2">💪 {Array.isArray(s.mainWork) ? 'العمل الرئيسي' : (s.mainWork.title || 'العمل الرئيسي')} {!Array.isArray(s.mainWork) && s.mainWork.duration ? `— ${s.mainWork.duration} د` : ''}</h3>
              <div className="space-y-2">
                {(Array.isArray(s.mainWork) ? s.mainWork : s.mainWork.exercises).map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-emerald-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300">▶ يوتيوب</a>
                      <div className="font-semibold text-white text-sm">{ex.name}</div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end">
                      {ex.sets && <span>{ex.sets} مج</span>}
                      {ex.reps && <span>{ex.reps}</span>}
                      {ex.rest && <span>راحة {ex.rest}</span>}
                    </div>
                    {ex.regression && <p className="text-xs text-blue-300 text-right mt-1">⬇️ {ex.regression}</p>}
                    {ex.progression && <p className="text-xs text-green-300 text-right mt-1">⬆️ {ex.progression}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metcon */}
          {s.metcon?.exercises?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-orange-400 mb-2">🔥 {s.metcon.format} — {s.metcon.duration} د</h3>
              <div className="space-y-1">
                {s.metcon.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <a href={ytLink(ex.nameEn, 'calisthenics')} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:text-red-300">▶ يوتيوب</a>
                    <div className="text-right">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.stretches?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-teal-400 mb-2">🧘 التهدئة — {s.cooldown.duration} د</h3>
              <div className="space-y-1">
                {s.cooldown.stretches.map((st: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">{st.duration}</span>
                    <div className="text-right"><span className="text-sm text-white">{st.name}</span>{st.focus && <span className="text-xs text-teal-400 mr-2">({st.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition + Progression */}
          {s.nutritionTips && (
            <div className="bg-green-900/10 border border-green-700/20 rounded-xl p-3 text-xs text-gray-300">
              🥗 <span className="text-green-400 font-semibold">تغذية: </span>{s.nutritionTips}
            </div>
          )}
          {s.progressionPath && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
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
  const today = new Date().toISOString().split('T')[0];

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
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="text-gray-400 hover:text-white px-2">›</button>
        <span className="font-bold text-white">{MONTHS_AR[month]} {year}</span>
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="text-gray-400 hover:text-white px-2">‹</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_AR.map(d => <div key={d} className="text-center text-xs text-gray-600 py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
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
              className={`aspect-square rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center gap-0.5
                ${isToday ? 'ring-2 ring-white' : ''}
                ${hasAny ? 'hover:brightness-125 cursor-pointer' : 'cursor-default'}
                ${isRest ? 'bg-gray-800/40' : ''}
                ${!hasAny && !isRest ? 'text-gray-600' : 'text-white'}
              `}>
              <span className={isToday ? 'text-white font-bold' : ''}>{day}</span>
              <div className="flex gap-0.5">
                {hasCF  && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                {hasHX  && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {hasKB  && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                {hasCal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {isRest && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> CrossFit</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Hyrox</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Kettlebell</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Calisthenics</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> راحة</span>
      </div>
    </div>
  );
}

// ── الصفحة الرئيسية ──────────────────────────────────────────────────────────
type MainTab = 'crossfit' | 'calisthenics' | 'hyrox' | 'kettlebell' | 'calendar';
type CrossfitSubTab = 'upcoming' | 'past';

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
  const today = new Date().toISOString().split('T')[0];

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
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> سجل التمارين
            </h1>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{totalCount} جلسة</span>
          </div>

          {/* Main Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {([
              { id: 'crossfit',     label: '🏋️',  sublabel: 'CrossFit',     active: 'bg-orange-500' },
              { id: 'calisthenics', label: '🤸',  sublabel: 'Calisthenics', active: 'bg-emerald-600' },
              { id: 'hyrox',        label: '🏁',  sublabel: 'Hyrox',        active: 'bg-red-600' },
              { id: 'kettlebell',   label: '🔔',  sublabel: 'Kettlebell',   active: 'bg-yellow-600' },
              { id: 'calendar',     label: '🗓️',  sublabel: 'تقويم',        active: 'bg-purple-600' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setMainTab(t.id); setSearch(''); }}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-colors ${mainTab === t.id ? t.active + ' text-white' : 'text-gray-400 hover:text-white'}`}>
                <span className="text-base">{t.label}</span>
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
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          )}

          {/* ── CrossFit ── */}
          {mainTab === 'crossfit' && (
            <div className="space-y-4">
              <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button onClick={() => { setCfTab('upcoming'); setSearch(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${cfTab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  📅 القادمة ({cfUpcoming.length})
                </button>
                <button onClick={() => { setCfTab('past'); setSearch(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${cfTab === 'past' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                  📚 السابقة ({cfPast.length})
                </button>
              </div>
              {cfTab === 'upcoming' && cfUpcoming.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <div className="text-4xl">📭</div>
                  <p className="text-gray-500">لا تمارين مجدولة — استخدم الإدارة ← خطة CrossFit</p>
                </div>
              )}
              {cfTab === 'past' && cfPast.length === 0 && (
                <div className="text-center py-12"><div className="text-4xl mb-2">📭</div><p className="text-gray-500">لا تمارين سابقة</p></div>
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
      <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
        <button onClick={() => setSub('upcoming')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${sub === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          📅 القادمة ({upcoming.length})
        </button>
        <button onClick={() => setSub('past')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${sub === 'past' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          📚 السابقة ({past.length})
        </button>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">📭</div>
          <p className="text-gray-500 text-sm">{sub === 'upcoming' ? emptyMsg : 'لا جلسات سابقة'}</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(rec => renderCard(rec))}</div>
      )}
    </div>
  );
}




