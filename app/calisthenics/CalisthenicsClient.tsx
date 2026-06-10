'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

// ── أنواع الجلسات ────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { id: 'strength',    label: 'قوة',         labelEn: 'Strength',  icon: '💪', desc: 'بناء القوة المطلقة بالوزن الذاتي', color: 'border-blue-500 bg-blue-900/20 text-blue-300',     activeColor: 'border-blue-400 bg-blue-500/30 text-white'    },
  { id: 'skills',      label: 'مهارات',      labelEn: 'Skills',    icon: '🤸', desc: 'وقوف على يدين، ليفر، بلانش',       color: 'border-purple-500 bg-purple-900/20 text-purple-300', activeColor: 'border-purple-400 bg-purple-500/30 text-white' },
  { id: 'endurance',   label: 'تحمل',        labelEn: 'Endurance', icon: '🔄', desc: 'تكرارات عالية وكثافة قلبية',       color: 'border-green-500 bg-green-900/20 text-green-300',   activeColor: 'border-green-400 bg-green-500/30 text-white'   },
  { id: 'mixed',       label: 'مختلط',       labelEn: 'Mixed',     icon: '⚡', desc: 'قوة + مهارات + تحمل',              color: 'border-orange-500 bg-orange-900/20 text-orange-300', activeColor: 'border-orange-400 bg-orange-500/30 text-white' },
  { id: 'hiit',        label: 'HIIT',        labelEn: 'HIIT',      icon: '🔥', desc: 'تدريب متقطع عالي الكثافة',         color: 'border-red-500 bg-red-900/20 text-red-300',         activeColor: 'border-red-400 bg-red-500/30 text-white'       },
];
const FOCUS_OPTIONS     = ['كامل الجسم','الجزء العلوي','الجزء السفلي','القلب والكور','مهارات الجمناستيكس','الكتفين والضغط','الظهر والسحب','تدريب الحلقات'];
const DIFFICULTY_OPTIONS = ['مبتدئ','متوسط','متقدم','نخبة'];

// ── مكوّن بطاقة التمرين ────────────────────────────────────────────────────
function ExerciseRow({ ex, index }: { ex: any; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-800/60 rounded-xl overflow-hidden border border-gray-700">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-right">
        <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{ex.name}</div>
          {ex.nameEn && <div className="text-xs text-gray-500">{ex.nameEn}</div>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {ex.sets && <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{ex.sets} مج</span>}
          {ex.reps && <span className="text-xs bg-orange-900/40 text-orange-300 px-2 py-0.5 rounded-full">{ex.reps}</span>}
          <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-700 pt-3">
          {ex.rest      && <div className="text-xs text-gray-400">⏱ راحة: <span className="text-white">{ex.rest}</span></div>}
          {ex.tempo     && <div className="text-xs text-gray-400">🎵 إيقاع: <span className="text-white">{ex.tempo}</span></div>}
          {ex.target    && <div className="text-xs text-gray-400">🎯 الهدف: <span className="text-white">{ex.target}</span></div>}
          {ex.notes     && <div className="text-xs text-gray-400">💡 {ex.notes}</div>}
          {ex.cues      && <div className="text-xs text-gray-400">🔑 {ex.cues}</div>}
          {ex.duration  && <div className="text-xs text-gray-400">⏳ المدة: <span className="text-white">{ex.duration}</span></div>}
          {ex.scaling && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ex.scaling.easier && <div className="bg-green-900/20 border border-green-800/50 rounded-lg px-2 py-1.5"><div className="text-xs text-green-400 font-medium mb-0.5">↓ أسهل</div><div className="text-xs text-gray-300">{ex.scaling.easier}</div></div>}
              {ex.scaling.harder && <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-2 py-1.5"><div className="text-xs text-red-400 font-medium mb-0.5">↑ أصعب</div><div className="text-xs text-gray-300">{ex.scaling.harder}</div></div>}
            </div>
          )}
          {ex.progression && <div className="text-xs bg-purple-900/20 border border-purple-800/40 rounded-lg px-2 py-1.5 text-purple-300">🚀 التطور: {ex.progression}</div>}
          {ex.regression  && <div className="text-xs bg-blue-900/20 border border-blue-800/40 rounded-lg px-2 py-1.5 text-blue-300">📉 البديل: {ex.regression}</div>}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, colorClass, children }: { title: string; icon: string; colorClass: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${colorClass}`}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span>{icon}</span><span className="font-bold text-sm">{title}</span>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

// ── بطاقة جلسة محفوظة ─────────────────────────────────────────────────────
function SavedCard({ rec, onDelete, onView }: { rec: any; onDelete: () => void; onView: () => void }) {
  return (
    <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{rec.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{rec.date} · {rec.sessionType} · {rec.difficulty}</div>
      </div>
      <button onClick={onView}  className="text-xs bg-emerald-700/40 hover:bg-emerald-600/50 text-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors">عرض</button>
      <button onClick={onDelete} className="text-xs bg-red-900/40 hover:bg-red-800/50 text-red-400 px-2 py-1.5 rounded-lg transition-colors">🗑</button>
    </div>
  );
}

// ── الصفحة الرئيسية ───────────────────────────────────────────────────────
export default function CalisthenicsClient({ member }: { member: any }) {
  const [tab,          setTab]          = useState<'generate'|'history'>('generate');
  const [sessionType,  setSessionType]  = useState('strength');
  const [difficulty,   setDifficulty]   = useState('متوسط');
  const [focus,        setFocus]        = useState('كامل الجسم');
  const [date,         setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState('');
  const [session,      setSession]      = useState<any>(null);
  const [history,      setHistory]      = useState<any[]>([]);
  const [historyLoad,  setHistoryLoad]  = useState(false);

  const selectedType = SESSION_TYPES.find(t => t.id === sessionType)!;

  // جلب السجل عند فتح تبويب السجل
  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  async function loadHistory() {
    setHistoryLoad(true);
    try {
      const res = await fetch('/api/calisthenics/sessions');
      const data = await res.json();
      setHistory(data.sessions || []);
    } catch {}
    setHistoryLoad(false);
  }

  async function generate() {
    setLoading(true); setError(''); setSession(null); setSaved(false);
    try {
      const res  = await fetch('/api/calisthenics/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, difficulty, sessionType, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في التوليد');
      setSession(data.session);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  async function saveSession() {
    if (!session || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calisthenics/sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionData: session, date, sessionType, difficulty }),
      });
      if (res.ok) setSaved(true);
    } catch {}
    setSaving(false);
  }

  async function deleteSession(id: string) {
    await fetch('/api/calisthenics/sessions', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setHistory(h => h.filter(r => r.id !== id));
  }

  function viewSaved(rec: any) {
    setSession(rec.sessionData);
    setDate(rec.date);
    setSessionType(rec.sessionType);
    setDifficulty(rec.difficulty);
    setSaved(true);
    setTab('generate');
  }

  function buildWhatsApp() {
    if (!session) return '';
    const lines = [`🤸 *${session.title}*`, `📅 ${date}  |  🎯 ${session.focus}  |  ⚡ ${session.difficulty}`, `⏱ المدة: ${session.totalDuration} دقيقة`, ''];
    if (session.metcon) {
      lines.push(`🔥 *الميتكون — ${session.metcon.format}*`);
      if (session.metcon.timecap) lines.push(`تايم كاب: ${session.metcon.timecap} دقيقة`);
      (session.metcon.exercises || []).forEach((e: any) => lines.push(`• ${e.reps} ${e.name}`));
      lines.push('');
    }
    if (session.coachNote) lines.push(`💬 ${session.coachNote}`);
    return lines.join('\n');
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      <Navbar member={member}/>
      <main className="flex-1 lg:mr-56 pb-safe-nav lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">🤸</div>
              <div>
                <h1 className="text-xl font-bold text-white">Calisthenics</h1>
                <p className="text-xs text-gray-400">توليد تمارين وزن الجسم بالذكاء الاصطناعي</p>
              </div>
            </div>
            {/* تبويبات */}
            <div className="flex gap-1 bg-gray-800 p-1 rounded-xl">
              <button onClick={() => setTab('generate')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab==='generate' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>توليد</button>
              <button onClick={() => setTab('history')}  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab==='history'  ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>السجل</button>
            </div>
          </div>

          {/* ════════════════ تبويب السجل ════════════════ */}
          {tab === 'history' && (
            <div className="space-y-3">
              {historyLoad ? (
                <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                  <div className="text-4xl mb-3">🤸</div>
                  <div className="text-gray-400 text-sm">لا توجد جلسات محفوظة بعد</div>
                  <button onClick={() => setTab('generate')} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">توليد جلسة الآن</button>
                </div>
              ) : history.map(rec => (
                <SavedCard key={rec.id} rec={rec} onDelete={() => deleteSession(rec.id)} onView={() => viewSaved(rec)}/>
              ))}
            </div>
          )}

          {/* ════════════════ تبويب التوليد ════════════════ */}
          {tab === 'generate' && (
            <>
              {/* إعدادات الجلسة */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-5">
                <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">⚙️ إعدادات الجلسة</h2>

                {/* نوع الجلسة */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">نوع الجلسة</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SESSION_TYPES.map(t => (
                      <button key={t.id} onClick={() => setSessionType(t.id)}
                        className={`flex flex-col gap-1 p-3 rounded-xl border text-right transition-all ${sessionType===t.id ? t.activeColor : t.color+' opacity-70 hover:opacity-100'}`}>
                        <div className="flex items-center gap-2"><span className="text-base">{t.icon}</span><span className="font-bold text-sm">{t.label}</span></div>
                        <span className="text-xs opacity-80">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">الصعوبة</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DIFFICULTY_OPTIONS.map(d => (
                        <button key={d} onClick={() => setDifficulty(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${difficulty===d ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">التاريخ</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">التركيز</label>
                  <div className="flex gap-2 flex-wrap">
                    {FOCUS_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFocus(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${focus===f ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <button onClick={generate} disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/40'}`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      جاري توليد الجلسة...
                    </span>
                  ) : `🤸 توليد جلسة ${selectedType.label}`}
                </button>

                {error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-sm text-red-300 text-center">⚠️ {error}</div>}
              </div>

              {/* ── نتيجة الجلسة ── */}
              {session && (
                <div className="space-y-4">

                  {/* Header + أزرار */}
                  <div className="bg-gradient-to-l from-emerald-900/30 to-gray-900 rounded-2xl border border-emerald-700/40 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-white leading-tight">{session.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-700">🤸 {session.sessionType}</span>
                          <span className="text-xs text-gray-400">⚡ {session.difficulty}</span>
                          <span className="text-xs text-gray-400">🎯 {session.focus}</span>
                          {session.totalDuration && <span className="text-xs text-gray-400">⏱ {session.totalDuration} دقيقة</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {/* زر الحفظ */}
                        <button onClick={saveSession} disabled={saving || saved}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            saved   ? 'bg-emerald-800 text-emerald-300 cursor-default' :
                            saving  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                                      'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}>
                          {saved ? '✓ محفوظ' : saving ? '...' : (
                            <>
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                              </svg>
                              حفظ
                            </>
                          )}
                        </button>
                        {/* واتساب */}
                        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsApp())}`, '_blank')}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          واتساب
                        </button>
                      </div>
                    </div>
                    {session.equipment?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {session.equipment.map((eq: string, i: number) => <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">🔧 {eq}</span>)}
                      </div>
                    )}
                  </div>

                  {/* الإحماء */}
                  {session.warmup?.exercises?.length > 0 && (
                    <Section title={`الإحماء — ${session.warmup.duration} دقيقة`} icon="🔆" colorClass="border-yellow-700/40 bg-yellow-900/10">
                      {session.warmup.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i}/>)}
                    </Section>
                  )}

                  {/* المهارة */}
                  {session.skillWork?.exercises?.length > 0 && (
                    <Section title={`${session.skillWork.title || 'العمل على المهارة'} — ${session.skillWork.duration} دقيقة`} icon="🤸" colorClass="border-purple-700/40 bg-purple-900/10">
                      {session.skillWork.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i}/>)}
                    </Section>
                  )}

                  {/* العمل الرئيسي */}
                  {session.mainWork?.map((block: any, bi: number) => (
                    <Section key={bi} title={`${block.block}${block.duration ? ` — ${block.duration} دقيقة` : ''}`} icon="💪" colorClass="border-blue-700/40 bg-blue-900/10">
                      {block.type && <div className="text-xs text-blue-400 font-medium mb-2 uppercase tracking-wider">{block.type}</div>}
                      {block.exercises?.map((ex: any, ei: number) => <ExerciseRow key={ei} ex={ex} index={ei}/>)}
                    </Section>
                  ))}

                  {/* الميتكون */}
                  {session.metcon && (
                    <div className="rounded-2xl border border-orange-700/40 bg-orange-900/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-orange-700/30 flex items-center justify-between">
                        <div className="flex items-center gap-2"><span>🔥</span><span className="font-bold text-sm text-orange-300">{session.metcon.title || 'الميتكون'}</span></div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-700">{session.metcon.format}</span>
                          {session.metcon.timecap && <span className="text-xs text-gray-400">⏱ {session.metcon.timecap} دقيقة</span>}
                          {session.metcon.rounds && <span className="text-xs text-gray-400">🔄 {session.metcon.rounds} جولات</span>}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {session.metcon.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                            <div className="flex-1"><span className="text-white text-sm font-medium">{ex.name}</span>{ex.nameEn && <span className="text-gray-500 text-xs mr-2">{ex.nameEn}</span>}</div>
                            {ex.reps && <span className="text-orange-300 font-bold text-sm">{ex.reps}</span>}
                          </div>
                        ))}
                        {session.metcon.scoreType && <div className="text-xs text-gray-500 mt-2">📊 النتيجة: {session.metcon.scoreType}</div>}
                      </div>
                    </div>
                  )}

                  {/* التهدئة */}
                  {session.cooldown?.stretches?.length > 0 && (
                    <Section title={`التهدئة والتمطيط — ${session.cooldown.duration} دقيقة`} icon="🧘" colorClass="border-teal-700/40 bg-teal-900/10">
                      {session.cooldown.stretches.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                          <span className="text-teal-400">•</span>
                          <div className="flex-1"><span className="text-white text-sm">{s.name}</span>{s.focus && <span className="text-gray-500 text-xs mr-2">— {s.focus}</span>}</div>
                          {s.duration && <span className="text-teal-300 text-xs">{s.duration}</span>}
                        </div>
                      ))}
                    </Section>
                  )}

                  {/* معلومات إضافية */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {session.weeklyPlacement && <div className="bg-gray-900 rounded-xl border border-gray-800 p-4"><div className="text-xs text-gray-500 mb-1.5">📅 الترتيب في الأسبوع</div><div className="text-sm text-gray-200">{session.weeklyPlacement}</div></div>}
                    {session.progressionPath  && <div className="bg-gray-900 rounded-xl border border-gray-800 p-4"><div className="text-xs text-gray-500 mb-1.5">🚀 مسار التطور</div><div className="text-sm text-gray-200">{session.progressionPath}</div></div>}
                    {session.nutritionTips   && <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 sm:col-span-2"><div className="text-xs text-amber-400 mb-1.5">🥗 التغذية</div><div className="text-sm text-gray-300">{session.nutritionTips}</div></div>}
                    {session.coachNote       && <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 sm:col-span-2"><div className="text-xs text-emerald-400 mb-1.5">💬 ملاحظة المدرب</div><div className="text-sm text-gray-300">{session.coachNote}</div></div>}
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
