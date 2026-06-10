'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const SESSION_TYPES = [
  { value: 'full',       label: 'كامل 🏁',        desc: 'السباق الكامل 8 محطات + 8 كم' },
  { value: 'simulation', label: 'محاكاة 🎯',       desc: 'نفس البنية بأوزان تدريبية' },
  { value: 'strength',   label: 'قوة المحطات 💪', desc: 'تركيز على محطات القوة فقط' },
  { value: 'running',    label: 'جري + مقاطع 🏃',  desc: 'الجري مع مقاطع سرعة' },
];

const SESSION_TYPE_LABELS: Record<string, string> = {
  full: 'كامل 🏁', simulation: 'محاكاة 🎯', strength: 'قوة المحطات 💪', running: 'جري + مقاطع 🏃',
};

// ——— بناء نص المشاركة ———
function buildShareText(s: any, meta: { date: string; sessionType: string; difficulty: string }): string {
  const typeLabel = SESSION_TYPE_LABELS[meta.sessionType] || meta.sessionType;
  const lines: string[] = [
    `🏁 *${s.title}*`,
    `📅 ${meta.date}  |  ${typeLabel}  |  ${meta.difficulty}`,
    `⏱ المدة: ${s.totalDuration} دقيقة`,
    '',
  ];

  if (s.coachNote) {
    lines.push(`💬 *ملاحظة المدرب:*`);
    lines.push(s.coachNote);
    lines.push('');
  }

  if (s.warmup?.exercises?.length) {
    lines.push(`🔆 *الإحماء — ${s.warmup.duration}*`);
    s.warmup.exercises.forEach((ex: any) => {
      lines.push(`  • ${ex.name} — ${ex.duration || ex.reps || ''}`);
    });
    lines.push('');
  }

  if (s.stations?.length) {
    lines.push(`🏁 *المحطات:*`);
    s.stations.forEach((st: any) => {
      const weight = st.weight ? `  ⚖️ ${st.weight}` : '';
      const time   = st.targetTime ? `  ⏱ ${st.targetTime}` : '';
      lines.push(`${st.number}. 🏃 ${st.runBefore} ← *${st.name}* — ${st.target}${weight}${time}`);
      if (st.tips) lines.push(`   💡 ${st.tips}`);
    });
    lines.push('');
  }

  if (s.targetTimes) {
    const labels: Record<string, string> = {
      elite: 'نخبة 🥇', advanced: 'متقدم 🥈', intermediate: 'متوسط 🥉', beginner: 'مبتدئ',
    };
    lines.push(`⏱ *أوقات الأداء المرجعية:*`);
    Object.entries(s.targetTimes).forEach(([k, v]) => {
      if (labels[k]) lines.push(`  ${labels[k]}: ${v}`);
    });
    lines.push('');
  }

  if (s.nutritionBefore || s.nutritionAfter) {
    lines.push(`🥗 *التغذية:*`);
    if (s.nutritionBefore) lines.push(`  قبل: ${s.nutritionBefore}`);
    if (s.nutritionAfter)  lines.push(`  بعد: ${s.nutritionAfter}`);
    lines.push('');
  }

  lines.push(`#Hyrox #مجموعة_المطانيخ #CrossFit`);
  return lines.join('\n');
}

// ——— بطاقة الجلسة المحفوظة ———
function HistoryCard({
  rec, onView, onDelete,
}: {
  rec: any;
  onView: () => void;
  onDelete: () => void;
}) {
  const typeLabel = SESSION_TYPE_LABELS[rec.sessionType] || rec.sessionType;
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">
            {rec.sessionData?.title || 'جلسة Hyrox'}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-500">{rec.date}</span>
            <span className="text-xs bg-red-900/30 text-red-300 border border-red-700/30 px-2 py-0.5 rounded-full">
              {typeLabel}
            </span>
            <span className="text-xs bg-orange-900/30 text-orange-300 border border-orange-700/30 px-2 py-0.5 rounded-full">
              {rec.difficulty}
            </span>
            {rec.sessionData?.totalDuration && (
              <span className="text-xs text-gray-500">⏱ {rec.sessionData.totalDuration} د</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={onView}
            className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 border border-red-700/30 px-3 py-1.5 rounded-lg transition-colors">
            عرض
          </button>
          <button onClick={onDelete}
            className="text-xs text-gray-500 hover:text-red-400 bg-gray-800 px-2 py-1.5 rounded-lg transition-colors">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HyroxClient({ member }: { member: any }) {
  // ——— توليد ———
  const [generating, setGenerating]   = useState(false);
  const [session, setSession]         = useState<any>(null);
  const [sessionMeta, setSessionMeta] = useState<{ date: string; sessionType: string; difficulty: string } | null>(null);
  const [error, setError]             = useState('');
  const [difficulty, setDifficulty]   = useState('متوسط');
  const [sessionType, setSessionType] = useState('simulation');
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [showSettings, setShowSettings] = useState(true);

  // ——— حفظ ———
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // ——— سجل ———
  const [activeTab,    setActiveTab]    = useState<'generate' | 'history'>('generate');
  const [history,      setHistory]      = useState<any[]>([]);
  const [historyLoad,  setHistoryLoad]  = useState(false);

  // ——— مشاركة ———
  const [copied, setCopied] = useState(false);

  // تحميل السجل عند فتح التبويب
  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  async function loadHistory() {
    setHistoryLoad(true);
    try {
      const res = await fetch('/api/hyrox/sessions');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
    setHistoryLoad(false);
  }

  async function generate() {
    setGenerating(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/hyrox/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, difficulty, sessionType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSession(data.session);
      setSessionMeta({ date, sessionType, difficulty });
      setShowSettings(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function saveSession() {
    if (!session || saving || saved) return;
    setSaving(true);
    try {
      await fetch('/api/hyrox/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: sessionMeta?.date || date,
          sessionType: sessionMeta?.sessionType || sessionType,
          difficulty: sessionMeta?.difficulty || difficulty,
          sessionData: session,
        }),
      });
      setSaved(true);
    } catch {}
    setSaving(false);
  }

  async function deleteRecord(id: string) {
    await fetch(`/api/hyrox/sessions?id=${id}`, { method: 'DELETE' });
    setHistory(h => h.filter(r => r.id !== id));
  }

  function viewRecord(rec: any) {
    setSession(rec.sessionData);
    setSessionMeta({ date: rec.date, sessionType: rec.sessionType, difficulty: rec.difficulty });
    setSaved(true);
    setShowSettings(false);
    setActiveTab('generate');
  }

  function shareWhatsApp() {
    if (!session || !sessionMeta) return;
    const text = buildShareText(session, sessionMeta);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  async function copyText() {
    if (!session || !sessionMeta) return;
    const text = buildShareText(session, sessionMeta);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="min-h-dvh flex w-full">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-red-900/40 to-orange-900/40 rounded-2xl border border-red-700/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏁</span>
              <div>
                <h1 className="text-xl font-bold text-white">Hyrox Training</h1>
                <p className="text-sm text-red-300">تدريب الهايروكس — القوة والتحمل</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">8 محطات × 1 كم جري — رياضة لياقة تنافسية عالمية</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-gray-700">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'generate' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              🤖 توليد جلسة
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'history' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              📂 سجل الجلسات
              {history.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
              )}
            </button>
          </div>

          {/* ══════════ تبويب التوليد ══════════ */}
          {activeTab === 'generate' && (
            <>
              {/* Settings Panel */}
              {(showSettings || !session) && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span>⚙️</span> إعدادات الجلسة
                  </h2>

                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">نوع الجلسة</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SESSION_TYPES.map(t => (
                        <button key={t.value} onClick={() => setSessionType(t.value)}
                          className={`p-3 rounded-xl border text-right transition-all ${
                            sessionType === t.value
                              ? 'border-red-500 bg-red-900/20 text-white'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                          }`}>
                          <div className="font-semibold text-sm">{t.label}</div>
                          <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">مستوى الصعوبة</label>
                      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
                        {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">تاريخ الجلسة</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {error}</div>
                  )}

                  <button onClick={generate} disabled={generating}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                    {generating ? (
                      <><span className="animate-spin">⚙️</span> يتم توليد الجلسة بالذكاء الاصطناعي...</>
                    ) : (
                      <><span>🤖</span> توليد جلسة Hyrox</>
                    )}
                  </button>
                  {generating && (
                    <p className="text-center text-xs text-red-400 animate-pulse">
                      🏃 يحلل الذكاء الاصطناعي أفضل برمجة هايروكس لمستواك...
                    </p>
                  )}
                </div>
              )}

              {/* Generated Session */}
              {session && !showSettings && (
                <div className="space-y-4">

                  {/* Action Bar: حفظ + مشاركة + جلسة جديدة */}
                  <div className="flex gap-2">
                    {/* زر الحفظ */}
                    <button
                      onClick={saveSession}
                      disabled={saving || saved}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        saved
                          ? 'bg-green-700/40 border border-green-600/40 text-green-300'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                      }`}>
                      {saved ? '✅ محفوظة' : saving ? '⏳...' : '💾 حفظ'}
                    </button>

                    {/* واتساب */}
                    <button
                      onClick={shareWhatsApp}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] transition-colors flex items-center justify-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      واتساب
                    </button>

                    {/* نسخ */}
                    <button
                      onClick={copyText}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        copied
                          ? 'bg-blue-700/40 border border-blue-600/40 text-blue-300'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                      }`}>
                      {copied ? '✅ تم النسخ' : '📋 نسخ'}
                    </button>

                    {/* جلسة جديدة */}
                    <button
                      onClick={() => { setShowSettings(true); setSaved(false); }}
                      className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
                      🔄
                    </button>
                  </div>

                  {/* Session Header */}
                  <div className="bg-gradient-to-l from-red-900/30 to-orange-900/30 rounded-2xl border border-red-700/30 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{session.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-red-900/50 border border-red-700/40 text-red-300 px-2 py-0.5 rounded-full">
                            ⏱ {session.totalDuration} دقيقة
                          </span>
                          <span className="text-xs bg-orange-900/50 border border-orange-700/40 text-orange-300 px-2 py-0.5 rounded-full">
                            {session.difficulty}
                          </span>
                          {sessionMeta && (
                            <span className="text-xs text-gray-500">{sessionMeta.date}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {session.coachNote && (
                      <div className="mt-3 bg-black/20 rounded-xl p-3">
                        <p className="text-xs text-gray-300">💬 {session.coachNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Warmup */}
                  {session.warmup && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                        <span>🔆</span> الإحماء — {session.warmup.duration}
                      </h3>
                      <div className="space-y-2">
                        {session.warmup.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                            <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                            <div className="flex-1">
                              <span className="text-sm text-white">{ex.name}</span>
                              <span className="text-xs text-gray-500 mr-2">— {ex.duration || ex.reps}</span>
                            </div>
                            {ex.notes && <span className="text-xs text-gray-500">{ex.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stations */}
                  {session.stations && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-red-400 flex items-center gap-2">
                        <span>🏁</span> المحطات الثمانية
                      </h3>
                      {session.stations.map((st: any, i: number) => (
                        <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                          <div className="bg-blue-900/20 border-b border-blue-800/30 px-4 py-2 flex items-center gap-2">
                            <span>🏃</span>
                            <span className="text-xs text-blue-400 font-semibold">جري {st.runBefore}</span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">{st.number}</span>
                                <div>
                                  <div className="font-semibold text-white text-sm">{st.name}</div>
                                  <div className="text-xs text-gray-500">{st.nameEn}</div>
                                </div>
                              </div>
                              {st.targetTime && (
                                <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded-lg">⏱ {st.targetTime}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <div className="bg-gray-800 rounded-xl p-2 text-center">
                                <div className="text-xs text-gray-500">الهدف</div>
                                <div className="text-sm text-white font-semibold">{st.target}</div>
                              </div>
                              {st.weight && (
                                <div className="bg-gray-800 rounded-xl p-2 text-center">
                                  <div className="text-xs text-gray-500">الوزن</div>
                                  <div className="text-sm text-white font-semibold">{st.weight}</div>
                                </div>
                              )}
                              {st.scaling && (
                                <div className="bg-green-900/20 rounded-xl p-2 text-center">
                                  <div className="text-xs text-gray-500">تعديل</div>
                                  <div className="text-xs text-green-400">{st.scaling}</div>
                                </div>
                              )}
                            </div>
                            {st.tips && (
                              <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/10 rounded-lg p-2">
                                💡 {st.tips}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Target Times */}
                  {session.targetTimes && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <span>⏱</span> أوقات الأداء المرجعية
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(session.targetTimes).map(([level, time]: [string, any]) => {
                          const labels: Record<string, { ar: string; color: string }> = {
                            elite:        { ar: 'نخبة 🥇',   color: 'text-purple-400 bg-purple-900/20 border-purple-700/30' },
                            advanced:     { ar: 'متقدم 🥈',  color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                            intermediate: { ar: 'متوسط 🥉',  color: 'text-green-400 bg-green-900/20 border-green-700/30' },
                            beginner:     { ar: 'مبتدئ',     color: 'text-gray-400 bg-gray-800 border-gray-700' },
                          };
                          const l = labels[level] || { ar: level, color: 'text-gray-400 bg-gray-800 border-gray-700' };
                          return (
                            <div key={level} className={`rounded-xl border p-3 text-center ${l.color}`}>
                              <div className="text-xs mb-1">{l.ar}</div>
                              <div className="font-bold text-sm">{time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cooldown */}
                  {session.cooldown && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <span>🧘</span> التهدئة
                      </h3>
                      <div className="space-y-2">
                        {session.cooldown.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                            <span className="text-gray-600">•</span>
                            <span>{ex.name}</span>
                            <span className="text-gray-500 text-xs">— {ex.duration}</span>
                          </div>
                        ))}
                        {Array.isArray(session.cooldown) && session.cooldown.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                            <span className="text-gray-600">•</span>
                            <span>{ex.name}</span>
                            <span className="text-gray-500 text-xs">— {ex.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutrition */}
                  {(session.nutritionBefore || session.nutritionAfter) && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                      <h3 className="font-semibold text-green-400 flex items-center gap-2">
                        <span>🥗</span> التغذية
                      </h3>
                      {session.nutritionBefore && (
                        <div className="bg-green-900/10 rounded-xl p-3">
                          <div className="text-xs text-green-400 font-semibold mb-1">قبل التمرين</div>
                          <p className="text-xs text-gray-300">{session.nutritionBefore}</p>
                        </div>
                      )}
                      {session.nutritionAfter && (
                        <div className="bg-blue-900/10 rounded-xl p-3">
                          <div className="text-xs text-blue-400 font-semibold mb-1">بعد التمرين</div>
                          <p className="text-xs text-gray-300">{session.nutritionAfter}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next recommendation */}
                  {session.nextSessionRecommendation && (
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <span>🔮</span> توصية الجلسة القادمة
                      </h3>
                      <p className="text-sm text-gray-300">{session.nextSessionRecommendation}</p>
                    </div>
                  )}

                  {/* Share bar at bottom too */}
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span>📤</span> مشاركة الجلسة
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={shareWhatsApp}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] transition-colors flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        مشاركة عبر واتساب
                      </button>
                      <button onClick={copyText}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          copied
                            ? 'bg-blue-700/40 border border-blue-600/40 text-blue-300'
                            : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                        }`}>
                        {copied ? '✅ تم النسخ!' : '📋 نسخ النص'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                      يُنسَّق التمرين تلقائياً ليكون جاهزاً للمشاركة
                    </p>
                  </div>

                </div>
              )}
            </>
          )}

          {/* ══════════ تبويب السجل ══════════ */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {historyLoad ? (
                <div className="text-center text-gray-500 py-10 text-sm">جاري التحميل...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-5xl">🏁</div>
                  <p className="text-gray-500 text-sm">لا توجد جلسات محفوظة بعد</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="text-sm text-red-400 hover:text-red-300 underline">
                    ابدأ بتوليد جلسة الآن
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">
                      📂 الجلسات المحفوظة ({history.length})
                    </h3>
                    <button onClick={loadHistory}
                      className="text-xs text-gray-500 hover:text-white transition-colors">
                      🔄 تحديث
                    </button>
                  </div>
                  {history.map(rec => (
                    <HistoryCard
                      key={rec.id}
                      rec={rec}
                      onView={() => viewRecord(rec)}
                      onDelete={() => deleteRecord(rec.id)}
                    />
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



