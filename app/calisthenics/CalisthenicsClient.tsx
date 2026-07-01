'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const SESSION_TYPES = [
  { id: 'strength',  label: 'قوة',      icon: '💪', desc: 'بناء القوة المطلقة بالوزن الذاتي',
    color: 'border-blue-700/50 bg-blue-900/30 text-blue-300',       active: 'border-blue-500 bg-blue-600 text-white'    },
  { id: 'skills',    label: 'مهارات',   icon: '🤸', desc: 'وقوف على يدين، ليفر، بلانش',
    color: 'border-purple-700/50 bg-purple-900/30 text-purple-300', active: 'border-purple-500 bg-purple-600 text-white' },
  { id: 'endurance', label: 'تحمل',     icon: '🔄', desc: 'تكرارات عالية وكثافة قلبية',
    color: 'border-green-700/50 bg-green-900/30 text-green-300',    active: 'border-green-500 bg-green-600 text-white'   },
  { id: 'mixed',     label: 'مختلط',    icon: '⚡', desc: 'قوة + مهارات + تحمل',
    color: 'border-orange-700/50 bg-orange-900/30 text-orange-300', active: 'border-orange-500 bg-orange-600 text-white' },
  { id: 'hiit',      label: 'HIIT',     icon: '🔥', desc: 'تدريب متقطع عالي الكثافة',
    color: 'border-red-700/50 bg-red-900/30 text-red-300',          active: 'border-red-500 bg-red-600 text-white'       },
];

const FOCUS_OPTIONS     = ['كامل الجسم','الجزء العلوي','الجزء السفلي','القلب والكور','مهارات الجمناستيكس','الكتفين والضغط','الظهر والسحب','تدريب الحلقات'];
const LEVEL_TABS = [
  { key: 'beginner'     as const, label: 'مبتدئ', active: 'bg-green-600 text-white',  idle: 'bg-gray-800 text-green-400 border border-green-700'  },
  { key: 'intermediate' as const, label: 'متوسط', active: 'bg-blue-600 text-white',   idle: 'bg-gray-800 text-blue-400 border border-blue-700'    },
  { key: 'advanced'     as const, label: 'متقدم', active: 'bg-orange-500 text-white',  idle: 'bg-gray-800 text-orange-400 border border-orange-700' },
  { key: 'elite'        as const, label: 'نخبة',  active: 'bg-red-600 text-white',     idle: 'bg-gray-800 text-red-400 border border-red-700'      },
];

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// ── بطاقة تمرين ────────────────────────────────────────────────────────────
function ExerciseRow({ ex, index, selectedLevel }: { ex: any; index: number; selectedLevel?: LevelKey }) {
  const [open, setOpen] = useState(false);

  const lvl = selectedLevel && ex.levels ? ex.levels[selectedLevel] : null;

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-sm">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 text-right active:bg-white/5">
        <span className="w-7 h-7 rounded-full bg-orange-800/50 text-orange-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-[15px]">{ex.name}</div>
          {ex.nameEn && <div className="text-xs text-gray-400 mt-0.5">{ex.nameEn}</div>}
          {lvl && (
            <div className="text-xs text-gray-300 mt-0.5 font-medium">
              {lvl.reps || lvl.scaling || ''}{lvl.weight ? ` · ${lvl.weight}` : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!selectedLevel && ex.sets && <span className="text-xs bg-gray-800 border border-gray-600 text-gray-300 px-2 py-0.5 rounded-full">{ex.sets} مج</span>}
          {!selectedLevel && ex.reps && <span className="text-xs bg-orange-900/50 border border-orange-700 text-orange-300 px-2 py-0.5 rounded-full font-mono">{ex.reps}</span>}
          {ex.levels && <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700 px-1.5 py-0.5 rounded-full">4 مستويات</span>}
          <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-700 pt-3 bg-gray-800/50">
          {ex.rest     && <div className="text-sm text-gray-400">⏱ راحة: <span className="text-gray-100 font-semibold">{ex.rest}</span></div>}
          {ex.tempo    && <div className="text-sm text-gray-400">🎵 إيقاع: <span className="text-gray-100 font-semibold">{ex.tempo}</span></div>}
          {ex.notes    && <div className="text-sm text-gray-300">💡 {ex.notes}</div>}
          {ex.cues     && <div className="text-sm text-gray-300">🔑 {ex.cues}</div>}
          {ex.duration && <div className="text-sm text-gray-400">⏳ المدة: <span className="text-gray-100 font-semibold">{ex.duration}</span></div>}

          {selectedLevel && lvl && (
            <div className="mt-2 rounded-xl border border-gray-600 bg-gray-800 overflow-hidden">
              <div className="px-3 py-2.5 space-y-1.5">
                {lvl.weight  && <div className="text-sm text-gray-400">⚖️ الوزن: <span className="font-bold text-white">{lvl.weight}</span></div>}
                {(lvl.reps || lvl.scaling) && <div className="text-sm text-gray-400">🔢 التكرار: <span className="font-bold text-white">{lvl.reps || lvl.scaling}</span></div>}
                {lvl.cue && <div className="text-sm text-amber-50 bg-amber-900/60 border border-amber-700/50 rounded-lg px-3 py-2">💬 {lvl.cue}</div>}
              </div>
            </div>
          )}

          {!selectedLevel && ex.levels && (
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {LEVEL_TABS.map(t => {
                const d = ex.levels[t.key];
                if (!d) return null;
                return (
                  <div key={t.key} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                    <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 ${t.active}`}>{t.label}</div>
                    <div className="text-sm text-gray-200">
                      {d.weight && <span className="ml-2">⚖️ {d.weight}</span>}
                      {(d.reps || d.scaling) && <span>· {d.reps || d.scaling}</span>}
                      {d.cue && <div className="text-gray-400 mt-1">💬 {d.cue}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {ex.progression && <div className="text-sm bg-purple-900/40 border border-purple-700/50 rounded-lg px-3 py-2 text-purple-200">🚀 التطور: {ex.progression}</div>}
          {ex.regression  && <div className="text-sm bg-blue-900/40 border border-blue-700/50 rounded-lg px-3 py-2 text-blue-200">📉 البديل: {ex.regression}</div>}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, bg, border, titleColor, children }: {
  title: string; icon: string; bg: string; border: string; titleColor: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-700 overflow-hidden bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2 bg-gray-800/60">
        <span className="text-lg">{icon}</span>
        <span className={`font-bold text-[15px] ${titleColor}`}>{title}</span>
      </div>
      <div className="p-4 space-y-2.5">{children}</div>
    </div>
  );
}

function SavedCard({ rec, onDelete, onView }: { rec: any; onDelete: () => void; onView: () => void }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-3.5 flex items-center gap-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-white truncate">{rec.title}</div>
        <div className="text-xs text-gray-400 mt-1">{rec.date} · {rec.sessionType} · {rec.difficulty}</div>
      </div>
      <button onClick={onView}  className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">عرض</button>
      <button onClick={onDelete} className="text-xs bg-gray-700 hover:bg-red-800 text-gray-300 hover:text-white px-2 py-1.5 rounded-lg transition-colors">🗑</button>
    </div>
  );
}

export default function CalisthenicsClient({ member }: { member: any }) {
  const isAdmin = member.role === 'admin';
  const [tab,           setTab]           = useState<'generate'|'history'>(isAdmin ? 'generate' : 'history');
  const [sessionType,   setSessionType]   = useState('strength');
  const [focus,         setFocus]         = useState('كامل الجسم');
  const [date,          setDate]          = useState(todaySA());
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState('');
  const [session,       setSession]       = useState<any>(null);
  const [history,       setHistory]       = useState<any[]>([]);
  const [historyLoad,   setHistoryLoad]   = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | undefined>(undefined);

  const selectedType = SESSION_TYPES.find(t => t.id === sessionType)!;

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab]);

  async function loadHistory() {
    setHistoryLoad(true);
    try {
      const res  = await fetch('/api/calisthenics/sessions');
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
        body: JSON.stringify({ date, sessionType, focus }),
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
        body: JSON.stringify({ sessionData: session, date, sessionType, difficulty: 'جميع المستويات' }),
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
    setSaved(true);
    setTab('generate');
  }

  function buildWhatsApp() {
    if (!session) return '';
    const lines = [`🤸 *${session.title}*`, `📅 ${date}  |  🎯 ${session.focus}`, `⏱ المدة: ${session.totalDuration} دقيقة`, ''];
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
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member}/>
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-l from-emerald-900/50 to-teal-900/40 rounded-2xl border border-emerald-700/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700/40 border border-emerald-600/40 flex items-center justify-center text-2xl">🤸</div>
                <div>
                  <h1 className="text-xl font-bold text-white">Calisthenics</h1>
                  <p className="text-sm text-emerald-300">تمارين وزن الجسم والجمناستيكس</p>
                </div>
              </div>
              <div className="flex gap-1 bg-gray-800 border border-gray-700 p-1 rounded-xl">
                {isAdmin && (
                  <button onClick={() => setTab('generate')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab==='generate' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>توليد</button>
                )}
                <button onClick={() => setTab('history')}  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab==='history'  ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>السجل</button>
              </div>
            </div>
          </div>

          {/* تبويب السجل */}
          {tab === 'history' && (
            <div className="space-y-3">
              {historyLoad ? (
                <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-700">
                  <div className="text-5xl mb-3">🤸</div>
                  <div className="text-gray-400 text-sm">لا توجد جلسات محفوظة بعد</div>
                  {isAdmin ? (
                    <button onClick={() => setTab('generate')} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">توليد جلسة الآن</button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-600">سيقوم المدرب بإضافة الجلسات قريباً</p>
                  )}
                </div>
              ) : history.map(rec => (
                <SavedCard key={rec.id} rec={rec} onDelete={() => deleteSession(rec.id)} onView={() => viewSaved(rec)}/>
              ))}
            </div>
          )}

          {/* تبويب التوليد */}
          {tab === 'generate' && isAdmin && (
            <>
              {/* إعدادات */}
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5 space-y-5">
                <h2 className="text-[15px] font-bold text-white flex items-center gap-2">⚙️ إعدادات الجلسة</h2>

                {/* نوع الجلسة */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">نوع الجلسة</label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {SESSION_TYPES.map(t => (
                      <button key={t.id} onClick={() => setSessionType(t.id)}
                        className={`flex flex-col gap-1 p-3.5 rounded-xl border text-right transition-all ${sessionType===t.id ? t.active : t.color}`}>
                        <div className="flex items-center gap-2"><span className="text-lg">{t.icon}</span><span className="font-bold text-[15px]">{t.label}</span></div>
                        <span className="text-xs opacity-80 leading-relaxed">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">التاريخ</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">التركيز</label>
                  <div className="flex gap-2 flex-wrap">
                    {FOCUS_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFocus(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${focus===f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-emerald-600'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <button onClick={generate} disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'}`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      جاري توليد الجلسة...
                    </span>
                  ) : `🤸 توليد جلسة ${selectedType.label}`}
                </button>

                {error && <div className="bg-red-900/40 border border-red-700/50 rounded-xl p-3 text-sm text-red-300 text-center">⚠️ {error}</div>}
              </div>

              {/* نتيجة الجلسة */}
              {session && (
                <div className="space-y-4">

                  {/* Level Tabs */}
                  {(session.strength?.some((e: any) => e.levels) || session.skillWork?.some((e: any) => e.levels) || session.metcon?.some((e: any) => e.levels)) && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4">
                      <div className="text-sm text-gray-400 font-medium mb-3">اختر مستواك لعرض التفاصيل المخصصة</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {LEVEL_TABS.map(t => (
                          <button key={t.key}
                            onClick={() => setSelectedLevel(selectedLevel === t.key ? undefined : t.key)}
                            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${selectedLevel === t.key ? t.active : t.idle}`}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="bg-gradient-to-l from-emerald-900/50 to-gray-900 rounded-2xl border border-emerald-700/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-white leading-tight">{session.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-emerald-800/60 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-700/50 font-medium">🤸 {session.sessionType}</span>
                          <span className="text-xs text-gray-400">🎯 {session.focus}</span>
                          {session.totalDuration && <span className="text-xs text-gray-400">⏱ {session.totalDuration} دقيقة</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={saveSession} disabled={saving || saved}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            saved  ? 'bg-emerald-800/50 text-emerald-300 cursor-default' :
                            saving ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                                     'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}>
                          {saved ? '✓ محفوظ' : saving ? '...' : '💾 حفظ'}
                        </button>
                        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsApp())}`, '_blank')}
                          className="flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                          واتساب
                        </button>
                      </div>
                    </div>
                    {session.equipment?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {session.equipment.map((eq: string, i: number) => <span key={i} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-lg">🔧 {eq}</span>)}
                      </div>
                    )}
                  </div>

                  {/* الإحماء */}
                  {session.warmup?.exercises?.length > 0 && (
                    <Section title={`الإحماء — ${session.warmup.duration} دقيقة`} icon="🔆"
                      bg="" border="" titleColor="text-amber-300">
                      {session.warmup.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i} selectedLevel={selectedLevel}/>)}
                    </Section>
                  )}

                  {/* المهارة */}
                  {session.skillWork?.exercises?.length > 0 && (
                    <Section title={`${session.skillWork.title || 'العمل على المهارة'} — ${session.skillWork.duration} دقيقة`} icon="🤸"
                      bg="" border="" titleColor="text-purple-300">
                      {session.skillWork.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i} selectedLevel={selectedLevel}/>)}
                    </Section>
                  )}

                  {/* العمل الرئيسي */}
                  {session.mainWork && (
                    Array.isArray(session.mainWork)
                      ? session.mainWork.map((block: any, bi: number) => (
                          <Section key={bi} title={`${block.block || block.title || 'العمل الرئيسي'}${block.duration ? ` — ${block.duration} دقيقة` : ''}`} icon="💪"
                            bg="" border="" titleColor="text-blue-300">
                            {block.type && <div className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wider">{block.type}</div>}
                            {(block.exercises || []).map((ex: any, ei: number) => <ExerciseRow key={ei} ex={ex} index={ei} selectedLevel={selectedLevel}/>)}
                          </Section>
                        ))
                      : (
                          <Section title={`${(session.mainWork as any).title || 'العمل الرئيسي'}${(session.mainWork as any).duration ? ` — ${(session.mainWork as any).duration} دقيقة` : ''}`} icon="💪"
                            bg="" border="" titleColor="text-blue-300">
                            {(session.mainWork as any).format && <div className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wider">{(session.mainWork as any).format}</div>}
                            {((session.mainWork as any).exercises || []).map((ex: any, ei: number) => <ExerciseRow key={ei} ex={ex} index={ei} selectedLevel={selectedLevel}/>)}
                          </Section>
                        )
                  )}

                  {/* الميتكون */}
                  {session.metcon && (
                    <div className="rounded-2xl border border-orange-700/50 bg-orange-900/30 overflow-hidden">
                      <div className="px-4 py-3 border-b border-orange-700/40 flex items-center justify-between bg-orange-900/40">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔥</span>
                          <span className="font-bold text-[15px] text-orange-200">{session.metcon.title || 'الميتكون'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-800/60 text-orange-200 px-2 py-0.5 rounded-full border border-orange-700/50 font-medium">{session.metcon.format}</span>
                          {session.metcon.timecap && <span className="text-xs text-gray-400">⏱ {session.metcon.timecap} د</span>}
                          {session.metcon.rounds && <span className="text-xs text-gray-400">🔄 {session.metcon.rounds} جولات</span>}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        {session.metcon.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-orange-800/30 last:border-0">
                            <span className="w-7 h-7 rounded-full bg-orange-800/60 text-orange-200 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                            <div className="flex-1">
                              <span className="text-white text-[15px] font-medium">{ex.name}</span>
                              {ex.nameEn && <span className="text-gray-400 text-xs mr-2">{ex.nameEn}</span>}
                            </div>
                            {ex.reps && <span className="text-orange-300 font-bold text-sm">{ex.reps}</span>}
                          </div>
                        ))}
                        {session.metcon.scoreType && <div className="text-sm text-gray-400 mt-2">📊 النتيجة: {session.metcon.scoreType}</div>}
                      </div>
                    </div>
                  )}

                  {/* التهدئة */}
                  {session.cooldown?.stretches?.length > 0 && (
                    <Section title={`التهدئة والتمطيط — ${session.cooldown.duration} دقيقة`} icon="🧘"
                      bg="" border="" titleColor="text-teal-300">
                      {session.cooldown.stretches.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-700 last:border-0">
                          <span className="text-teal-400">•</span>
                          <div className="flex-1">
                            <span className="text-gray-100 text-[15px]">{s.name}</span>
                            {s.focus && <span className="text-gray-400 text-xs mr-2">— {s.focus}</span>}
                          </div>
                          {s.duration && <span className="text-teal-300 text-sm font-medium">{s.duration}</span>}
                        </div>
                      ))}
                    </Section>
                  )}

                  {/* معلومات إضافية */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {session.weeklyPlacement && (
                      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                        <div className="text-xs text-gray-500 font-medium mb-1.5">📅 الترتيب في الأسبوع</div>
                        <div className="text-[15px] text-gray-200">{session.weeklyPlacement}</div>
                      </div>
                    )}
                    {session.progressionPath && (
                      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                        <div className="text-xs text-gray-500 font-medium mb-1.5">🚀 مسار التطور</div>
                        <div className="text-[15px] text-gray-200">{session.progressionPath}</div>
                      </div>
                    )}
                    {session.nutritionTips && (
                      <div className="bg-amber-900/40 border border-amber-700/50 rounded-xl p-4 sm:col-span-2">
                        <div className="text-sm text-amber-300 font-semibold mb-1.5">🥗 التغذية</div>
                        <div className="text-[15px] text-amber-50">{session.nutritionTips}</div>
                      </div>
                    )}
                    {session.coachNote && (
                      <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4 sm:col-span-2">
                        <div className="text-sm text-emerald-300 font-semibold mb-1.5">💬 ملاحظة المدرب</div>
                        <div className="text-[15px] text-emerald-50">{session.coachNote}</div>
                      </div>
                    )}
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
