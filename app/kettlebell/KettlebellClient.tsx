'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const LEVEL_TABS = [
  { key: 'beginner'     as const, label: 'مبتدئ', active: 'bg-green-600 text-white',  idle: 'bg-gray-800 text-green-400 border border-green-700'  },
  { key: 'intermediate' as const, label: 'متوسط', active: 'bg-blue-600 text-white',   idle: 'bg-gray-800 text-blue-400 border border-blue-700'    },
  { key: 'advanced'     as const, label: 'متقدم', active: 'bg-orange-500 text-white',  idle: 'bg-gray-800 text-orange-400 border border-orange-700' },
  { key: 'elite'        as const, label: 'نخبة',  active: 'bg-purple-600 text-white',  idle: 'bg-gray-800 text-purple-400 border border-purple-700' },
];
type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const EVENT_TYPES = [
  { value: 'biathlon',     label: 'Biathlon 🏆',     desc: 'Jerk + Snatch — ثنائي الأحداث' },
  { value: 'long_cycle',   label: 'Long Cycle 🔄',   desc: 'Clean & Jerk — الدورة الطويلة' },
  { value: 'snatch',       label: 'Snatch ⚡',        desc: 'الانتزاع — حدث واحد' },
  { value: 'strength',     label: 'قوة 💪',           desc: 'تطوير القوة الأساسية' },
  { value: 'conditioning', label: 'تكييف 🔥',         desc: 'تحمل وتكييف عضلي' },
];
const FOCUS_OPTIONS = ['التحمل', 'القوة', 'التقنية', 'السرعة', 'الراحة النشطة'];
const EVENT_LABELS: Record<string, string> = {
  biathlon: 'Biathlon 🏆', long_cycle: 'Long Cycle 🔄',
  snatch: 'Snatch ⚡', strength: 'قوة 💪', conditioning: 'تكييف 🔥',
};

function buildShareText(s: any, meta: { date: string; eventType: string; focus: string }): string {
  const lines: string[] = [
    `🏋️ *${s.title}*`,
    `📅 ${meta.date}  |  ${EVENT_LABELS[meta.eventType] || meta.eventType}`,
    `⏱ المدة: ${s.totalDuration}  |  التركيز: ${meta.focus}`,
    '',
  ];
  if (s.coachNote) { lines.push(`💬 *ملاحظة المدرب:*`); lines.push(s.coachNote); lines.push(''); }
  if (s.breathingPattern) { lines.push(`🫁 *نمط التنفس:* ${s.breathingPattern}`); lines.push(''); }
  if (s.warmup?.movements?.length) {
    lines.push(`🔆 *الإحماء — ${s.warmup.duration}*`);
    s.warmup.movements.forEach((ex: any) => lines.push(`  • ${ex.name} — ${ex.sets ? ex.sets + '×' : ''}${ex.reps}`));
    lines.push('');
  }
  if (s.mainWork?.length) {
    lines.push(`💪 *العمل الرئيسي:*`);
    s.mainWork.forEach((block: any) => {
      lines.push(`  🎯 *${block.exercise || block.movement}* — ${block.weight}`);
      lines.push(`     ${block.sets} مجموعات × ${block.reps}  |  راحة: ${block.restBetweenSets}`);
      if (block.targetRPM) lines.push(`     الهدف: ${block.targetRPM}`);
      if (block.technique) lines.push(`     💡 ${block.technique}`);
    });
    lines.push('');
  }
  if (s.techniqueNotes?.length) {
    lines.push(`📋 *نقاط تقنية:*`);
    s.techniqueNotes.forEach((n: string) => lines.push(`  • ${n}`));
    lines.push('');
  }
  if (s.progressionNote) { lines.push(`📈 *التطور:* ${s.progressionNote}`); lines.push(''); }
  lines.push(`#KettlebellAthletics #مجموعة_المطانيخ #IUKL`);
  return lines.join('\n');
}

function HistoryCard({ rec, onView, onDelete }: { rec: any; onView: () => void; onDelete: () => void }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{rec.sessionData?.title || 'جلسة Kettlebell'}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-500">{rec.date}</span>
            <span className="text-xs bg-yellow-900/30 text-yellow-300 border border-yellow-700/30 px-2 py-0.5 rounded-full">
              {EVENT_LABELS[rec.eventType] || rec.eventType}
            </span>
            <span className="text-xs bg-amber-900/30 text-amber-300 border border-amber-700/30 px-2 py-0.5 rounded-full">{rec.difficulty}</span>
            {rec.sessionData?.totalDuration && <span className="text-xs text-gray-500">⏱ {rec.sessionData.totalDuration}</span>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={onView} className="text-xs text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 px-3 py-1.5 rounded-lg transition-colors">عرض</button>
          <button onClick={onDelete} className="text-xs text-gray-500 hover:text-red-400 bg-gray-800 px-2 py-1.5 rounded-lg transition-colors">🗑</button>
        </div>
      </div>
    </div>
  );
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function KettlebellClient({ member }: { member: any }) {
  const isAdmin = member.role === 'admin';
  const [generating, setGenerating]   = useState(false);
  const [session, setSession]         = useState<any>(null);
  const [sessionMeta, setSessionMeta] = useState<{ date: string; eventType: string; focus: string } | null>(null);
  const [error, setError]             = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | undefined>(undefined);
  const [eventType, setEventType]     = useState('biathlon');
  const [focus, setFocus]             = useState('التحمل');
  const [date, setDate]               = useState(todaySA());
  const [showSettings, setShowSettings] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [activeTab, setActiveTab]     = useState<'generate' | 'history'>(isAdmin ? 'generate' : 'history');
  const [history, setHistory]         = useState<any[]>([]);
  const [historyLoad, setHistoryLoad] = useState(false);
  const [copied, setCopied]           = useState(false);

  useEffect(() => { if (activeTab === 'history') loadHistory(); }, [activeTab]);

  async function loadHistory() {
    setHistoryLoad(true);
    try { const res = await fetch('/api/kettlebell/sessions'); const data = await res.json(); setHistory(Array.isArray(data) ? data : []); } catch {}
    setHistoryLoad(false);
  }

  async function generate() {
    setGenerating(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/kettlebell/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, eventType, focus }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSession(data.session); setSessionMeta({ date, eventType, focus }); setSelectedLevel(undefined); setShowSettings(false);
    } catch (e: any) { setError(e.message); } finally { setGenerating(false); }
  }

  async function saveSession() {
    if (!session || saving || saved) return;
    setSaving(true);
    try {
      await fetch('/api/kettlebell/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: sessionMeta?.date || date, eventType: sessionMeta?.eventType || eventType, difficulty: 'جميع المستويات', focus: sessionMeta?.focus || focus, sessionData: session }) });
      setSaved(true);
    } catch {}
    setSaving(false);
  }

  async function deleteRecord(id: string) {
    await fetch(`/api/kettlebell/sessions?id=${id}`, { method: 'DELETE' });
    setHistory(h => h.filter(r => r.id !== id));
  }

  function viewRecord(rec: any) {
    setSession(rec.sessionData); setSessionMeta({ date: rec.date, eventType: rec.eventType, focus: rec.focus });
    setSelectedLevel(undefined); setSaved(true); setShowSettings(false); setActiveTab('generate');
  }

  function shareWhatsApp() {
    if (!session || !sessionMeta) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(session, sessionMeta))}`, '_blank');
  }

  async function copyText() {
    if (!session || !sessionMeta) return;
    const text = buildShareText(session, sessionMeta);
    try { await navigator.clipboard.writeText(text); } catch { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-yellow-900/40 to-amber-900/40 rounded-2xl border border-yellow-700/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏋️</span>
              <div>
                <h1 className="text-xl font-bold text-white">Kettlebell Athletics</h1>
                <p className="text-sm text-yellow-300">رياضة الجيرك — القوة التنافسية</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">IUKL — الاتحاد الدولي لرفع الكيتل بيل | Biathlon · Long Cycle · Snatch</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-gray-700">
            {isAdmin && (
              <button onClick={() => setActiveTab('generate')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'generate' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                🤖 توليد جلسة
              </button>
            )}
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              📂 سجل الجلسات
              {history.length > 0 && <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>}
            </button>
          </div>

          {/* ══ تبويب التوليد ══ */}
          {activeTab === 'generate' && isAdmin && (
            <>
              {(showSettings || !session) && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
                  <h2 className="font-semibold text-white flex items-center gap-2"><span>⚙️</span> إعدادات الجلسة</h2>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">نوع الحدث</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_TYPES.map(t => (
                        <button key={t.value} onClick={() => setEventType(t.value)}
                          className={`p-3 rounded-xl border text-right transition-all ${eventType === t.value ? 'border-yellow-500 bg-yellow-900/20 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                          <div className="font-semibold text-sm">{t.label}</div>
                          <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">التركيز</label>
                      <select value={focus} onChange={e => setFocus(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500">
                        {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">التاريخ</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                    </div>
                  </div>
                  {error && <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {error}</div>}
                  <button onClick={generate} disabled={generating}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                    {generating ? <><span className="animate-spin">⚙️</span> يتم توليد الجلسة بالذكاء الاصطناعي...</> : <><span>🤖</span> توليد جلسة Kettlebell Athletics</>}
                  </button>
                  {generating && <p className="text-center text-xs text-yellow-400 animate-pulse">🏋️ يحلل الذكاء الاصطناعي مبادئ IUKL ويضع برنامجك التنافسي...</p>}
                </div>
              )}

              {session && !showSettings && (
                <div className="space-y-4">

                  {/* Level Tabs */}
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                    <div className="text-xs text-gray-400 mb-3">اختر مستواك لعرض الأوزان والإيقاع المخصص</div>
                    <div className="grid grid-cols-4 gap-2">
                      {LEVEL_TABS.map(t => (
                        <button key={t.key}
                          onClick={() => setSelectedLevel(selectedLevel === t.key ? undefined : t.key)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${selectedLevel === t.key ? t.active : t.idle}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex gap-2">
                    <button onClick={saveSession} disabled={saving || saved}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${saved ? 'bg-green-700/40 border border-green-600/40 text-green-300' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'}`}>
                      {saved ? '✅ محفوظة' : saving ? '⏳...' : '💾 حفظ'}
                    </button>
                    <button onClick={shareWhatsApp} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] transition-colors flex items-center justify-center gap-1.5">
                      {WA_ICON} واتساب
                    </button>
                    <button onClick={copyText}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${copied ? 'bg-blue-700/40 border border-blue-600/40 text-blue-300' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'}`}>
                      {copied ? '✅ تم النسخ' : '📋 نسخ'}
                    </button>
                    <button onClick={() => { setShowSettings(true); setSaved(false); }} className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">🔄</button>
                  </div>

                  {/* Session Header */}
                  <div className="bg-gradient-to-l from-yellow-900/30 to-amber-900/30 rounded-2xl border border-yellow-700/30 p-4">
                    <h2 className="text-lg font-bold text-white">{session.title}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-yellow-900/50 border border-yellow-700/40 text-yellow-300 px-2 py-0.5 rounded-full">⏱ {session.totalDuration}</span>
                      <span className="text-xs bg-amber-900/50 border border-amber-700/40 text-amber-300 px-2 py-0.5 rounded-full">{session.eventType}</span>
                      {sessionMeta && <span className="text-xs text-gray-500">{sessionMeta.date}</span>}
                    </div>
                    {session.coachNote && <div className="mt-3 bg-black/20 rounded-xl p-3"><p className="text-xs text-gray-300">💬 {session.coachNote}</p></div>}
                  </div>

                  {/* Breathing */}
                  {session.breathingPattern && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3">
                      <div className="text-xs text-blue-400 font-semibold mb-1">🫁 نمط التنفس الصحيح</div>
                      <p className="text-xs text-gray-300">{session.breathingPattern}</p>
                    </div>
                  )}

                  {/* Warmup */}
                  {session.warmup && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2"><span>🔆</span> الإحماء — {session.warmup.duration}</h3>
                      <div className="space-y-2">
                        {session.warmup.movements?.map((ex: any, i: number) => (
                          <div key={i} className="bg-gray-800/50 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <div><span className="text-sm text-white">{ex.name}</span><span className="text-xs text-gray-500 mr-2">({ex.nameEn})</span></div>
                              <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded-full">{ex.sets && `${ex.sets}×`}{ex.reps}</span>
                            </div>
                            {ex.notes && <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Work */}
                  {session.mainWork && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-white flex items-center gap-2"><span>💪</span> العمل الرئيسي</h3>
                      {session.mainWork.map((block: any, i: number) => {
                        const lvl = selectedLevel && block.levels ? block.levels[selectedLevel] : null;
                        return (
                          <div key={i} className="bg-gray-900 rounded-2xl border border-yellow-700/20 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div><div className="font-semibold text-white">{block.exercise || block.movement}</div><div className="text-xs text-gray-500">{block.exerciseAr || block.movementEn}</div></div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-yellow-400">{lvl?.weight || block.weight}</div>
                                <div className="text-xs text-gray-500">الوزن</div>
                              </div>
                            </div>
                            {lvl ? (
                              <div className="bg-gray-800 rounded-xl p-3 space-y-1.5">
                                {lvl.rpm        && <div className="flex justify-between text-xs"><span className="text-gray-400">الإيقاع (RPM)</span><span className="text-orange-400 font-semibold">{lvl.rpm}</span></div>}
                                {lvl.totalLifts && <div className="flex justify-between text-xs"><span className="text-gray-400">إجمالي الرفعات</span><span className="text-white font-semibold">{lvl.totalLifts}</span></div>}
                                {lvl.sets       && <div className="flex justify-between text-xs"><span className="text-gray-400">المجموعات</span><span className="text-white font-semibold">{lvl.sets}</span></div>}
                                {lvl.rest       && <div className="flex justify-between text-xs"><span className="text-gray-400">الراحة</span><span className="text-white font-semibold">{lvl.rest}</span></div>}
                                {lvl.cue        && <div className="text-xs text-yellow-300 bg-yellow-900/20 rounded-lg px-2 py-1 mt-1">💬 {lvl.cue}</div>}
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-xs text-gray-500">المجموعات</div><div className="text-sm text-white font-semibold">{block.sets}</div></div>
                                <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-xs text-gray-500">التكرارات / الوقت</div><div className="text-sm text-white font-semibold">{block.reps}</div></div>
                                <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-xs text-gray-500">الراحة</div><div className="text-sm text-white font-semibold">{block.restBetweenSets}</div></div>
                              </div>
                            )}
                            {block.targetRPM && !lvl && <div className="mt-2 bg-orange-900/20 rounded-xl p-2 text-center"><span className="text-xs text-orange-400">🎯 الهدف: {block.targetRPM}</span></div>}
                            {block.technique && <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/10 rounded-lg p-2">💡 {block.technique}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Grip Work */}
                  {session.gripwork && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2"><span>✋</span> تقوية القبضة</h3>
                      <p className="text-xs text-gray-400 mb-3">{session.gripwork.note}</p>
                      <div className="space-y-2">
                        {session.gripwork.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{ex.name}</span>
                            <span className="text-orange-400 text-xs">{ex.sets}×{ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technique Notes */}
                  {session.techniqueNotes?.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2"><span>📋</span> نقاط تقنية مهمة</h3>
                      <div className="space-y-2">
                        {session.techniqueNotes.map((note: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-purple-400 mt-0.5">•</span><span>{note}</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cooldown */}
                  {session.cooldown && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2"><span>🧘</span> التهدئة</h3>
                      <div className="space-y-2">
                        {(Array.isArray(session.cooldown) ? session.cooldown : session.cooldown.exercises || []).map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                            <span className="text-gray-600">•</span><span>{ex.name}</span>
                            <span className="text-gray-500 text-xs">— {ex.duration}</span>
                            {ex.focus && <span className="text-xs text-blue-400">({ex.focus})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weekly Placement */}
                  {session.weeklyPlan && (
                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-4 space-y-3">
                      <h3 className="font-semibold text-yellow-400 flex items-center gap-2"><span>📅</span> التوصية الأسبوعية</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">📌</span><div><span className="text-gray-400 text-xs">عدد الجلسات: </span><span className="text-white">{session.weeklyPlan.sessionsPerWeek}</span></div></div>
                        <div className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✅</span><div><span className="text-gray-400 text-xs">متى تُدرجها: </span><span className="text-white text-xs">{session.weeklyPlan.placement}</span></div></div>
                        <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">⚠️</span><div><span className="text-gray-400 text-xs">تجنب قبلها: </span><span className="text-white text-xs">{session.weeklyPlan.avoidAfter}</span></div></div>
                      </div>
                    </div>
                  )}

                  {/* Progression */}
                  {session.progressionNote && (
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2"><span>📈</span> كيف تتطور</h3>
                      <p className="text-sm text-gray-300">{session.progressionNote}</p>
                    </div>
                  )}

                  {/* Share bar bottom */}
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2"><span>📤</span> مشاركة الجلسة</h3>
                    <div className="flex gap-2">
                      <button onClick={shareWhatsApp} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] transition-colors flex items-center justify-center gap-2">
                        {WA_ICON} مشاركة عبر واتساب
                      </button>
                      <button onClick={copyText}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${copied ? 'bg-blue-700/40 border border-blue-600/40 text-blue-300' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'}`}>
                        {copied ? '✅ تم النسخ!' : '📋 نسخ النص'}
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {/* ══ تبويب السجل ══ */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {historyLoad ? (
                <div className="text-center text-gray-500 py-10 text-sm">جاري التحميل...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-5xl">🏋️</div>
                  <p className="text-gray-500 text-sm">لا توجد جلسات محفوظة بعد</p>
                  {isAdmin ? (
                    <button onClick={() => setActiveTab('generate')} className="text-sm text-yellow-400 hover:text-yellow-300 underline">ابدأ بتوليد جلسة الآن</button>
                  ) : (
                    <p className="text-xs text-gray-600">سيقوم المدرب بإضافة الجلسات قريباً</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">📂 الجلسات المحفوظة ({history.length})</h3>
                    <button onClick={loadHistory} className="text-xs text-gray-500 hover:text-white transition-colors">🔄 تحديث</button>
                  </div>
                  {history.map(rec => (
                    <HistoryCard key={rec.id} rec={rec} onView={() => viewRecord(rec)} onDelete={() => deleteRecord(rec.id)} />
                  ))}
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}




