'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const SESSION_TYPES = [
  { id: 'strength',  label: 'قوة',      icon: '💪', desc: 'بناء القوة المطلقة بالوزن الذاتي',
    color: 'border-blue-300 bg-blue-50 text-blue-700',       active: 'border-blue-500 bg-blue-500 text-white'    },
  { id: 'skills',    label: 'مهارات',   icon: '🤸', desc: 'وقوف على يدين، ليفر، بلانش',
    color: 'border-purple-300 bg-purple-50 text-purple-700', active: 'border-purple-500 bg-purple-500 text-white' },
  { id: 'endurance', label: 'تحمل',     icon: '🔄', desc: 'تكرارات عالية وكثافة قلبية',
    color: 'border-green-300 bg-green-50 text-green-700',    active: 'border-green-500 bg-green-600 text-white'   },
  { id: 'mixed',     label: 'مختلط',    icon: '⚡', desc: 'قوة + مهارات + تحمل',
    color: 'border-orange-300 bg-orange-50 text-orange-700', active: 'border-orange-500 bg-orange-500 text-white' },
  { id: 'hiit',      label: 'HIIT',     icon: '🔥', desc: 'تدريب متقطع عالي الكثافة',
    color: 'border-red-300 bg-red-50 text-red-700',          active: 'border-red-500 bg-red-500 text-white'       },
];

const FOCUS_OPTIONS     = ['كامل الجسم','الجزء العلوي','الجزء السفلي','القلب والكور','مهارات الجمناستيكس','الكتفين والضغط','الظهر والسحب','تدريب الحلقات'];
const LEVEL_TABS = [
  { key: 'beginner'     as const, label: 'مبتدئ', active: 'bg-green-600 text-white',  idle: 'bg-white text-green-700 border border-green-300'  },
  { key: 'intermediate' as const, label: 'متوسط', active: 'bg-blue-600 text-white',   idle: 'bg-white text-blue-700 border border-blue-300'    },
  { key: 'advanced'     as const, label: 'متقدم', active: 'bg-orange-500 text-white',  idle: 'bg-white text-orange-700 border border-orange-300' },
  { key: 'elite'        as const, label: 'نخبة',  active: 'bg-red-600 text-white',     idle: 'bg-white text-red-700 border border-red-300'      },
];

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// ── بطاقة تمرين ────────────────────────────────────────────────────────────
function ExerciseRow({ ex, index, selectedLevel }: { ex: any; index: number; selectedLevel?: LevelKey }) {
  const [open, setOpen] = useState(false);

  const lvl = selectedLevel && ex.levels ? ex.levels[selectedLevel] : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-right">
        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 text-sm">{ex.name}</div>
          {ex.nameEn && <div className="text-xs text-slate-400">{ex.nameEn}</div>}
          {lvl && (
            <div className="text-xs text-slate-600 mt-0.5 truncate">
              {lvl.reps || lvl.scaling || ''}{lvl.weight ? ` · ${lvl.weight}` : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!selectedLevel && ex.sets && <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{ex.sets} مج</span>}
          {!selectedLevel && ex.reps && <span className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-mono">{ex.reps}</span>}
          {ex.levels && <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded-full">4 مستويات</span>}
          <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3 bg-slate-50">
          {ex.rest     && <div className="text-xs text-slate-500">⏱ راحة: <span className="text-slate-800 font-medium">{ex.rest}</span></div>}
          {ex.tempo    && <div className="text-xs text-slate-500">🎵 إيقاع: <span className="text-slate-800 font-medium">{ex.tempo}</span></div>}
          {ex.notes    && <div className="text-xs text-slate-600">💡 {ex.notes}</div>}
          {ex.cues     && <div className="text-xs text-slate-600">🔑 {ex.cues}</div>}
          {ex.duration && <div className="text-xs text-slate-500">⏳ المدة: <span className="text-slate-800 font-medium">{ex.duration}</span></div>}

          {/* عرض المستوى المحدد */}
          {selectedLevel && lvl && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-3 py-2 space-y-1">
                {lvl.weight  && <div className="text-xs text-slate-500">⚖️ الوزن: <span className="font-semibold text-slate-800">{lvl.weight}</span></div>}
                {(lvl.reps || lvl.scaling) && <div className="text-xs text-slate-500">🔢 التكرار: <span className="font-semibold text-slate-800">{lvl.reps || lvl.scaling}</span></div>}
                {lvl.cue     && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">💬 {lvl.cue}</div>}
              </div>
            </div>
          )}

          {/* عرض جميع المستويات إذا لم يُحدد مستوى */}
          {!selectedLevel && ex.levels && (
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {LEVEL_TABS.map(t => {
                const d = ex.levels[t.key];
                if (!d) return null;
                return (
                  <div key={t.key} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${t.active}`}>{t.label}</div>
                    <div className="text-xs text-slate-700">
                      {d.weight && <span className="ml-2">⚖️ {d.weight}</span>}
                      {(d.reps || d.scaling) && <span>· {d.reps || d.scaling}</span>}
                      {d.cue && <div className="text-slate-500 mt-0.5">💬 {d.cue}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {ex.progression && <div className="text-xs bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-purple-800">🚀 التطور: {ex.progression}</div>}
          {ex.regression  && <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 text-blue-800">📉 البديل: {ex.regression}</div>}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, bg, border, titleColor, children }: {
  title: string; icon: string; bg: string; border: string; titleColor: string; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${bg} ${border}`}>
      <div className={`px-4 py-3 border-b ${border} flex items-center gap-2`}>
        <span>{icon}</span>
        <span className={`font-bold text-sm ${titleColor}`}>{title}</span>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function SavedCard({ rec, onDelete, onView }: { rec: any; onDelete: () => void; onView: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800 truncate">{rec.title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{rec.date} · {rec.sessionType} · {rec.difficulty}</div>
      </div>
      <button onClick={onView}  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg transition-colors font-medium">عرض</button>
      <button onClick={onDelete} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1.5 rounded-lg transition-colors">🗑</button>
    </div>
  );
}

export default function CalisthenicsClient({ member }: { member: any }) {
  const [tab,           setTab]           = useState<'generate'|'history'>('generate');
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🤸</div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Calisthenics</h1>
                <p className="text-xs text-slate-500">توليد تمارين وزن الجسم بالذكاء الاصطناعي</p>
              </div>
            </div>
            <div className="flex gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button onClick={() => setTab('generate')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab==='generate' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}>توليد</button>
              <button onClick={() => setTab('history')}  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab==='history'  ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}>السجل</button>
            </div>
          </div>

          {/* تبويب السجل */}
          {tab === 'history' && (
            <div className="space-y-3">
              {historyLoad ? (
                <div className="text-center py-12 text-slate-500">جاري التحميل...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <div className="text-4xl mb-3">🤸</div>
                  <div className="text-slate-500 text-sm">لا توجد جلسات محفوظة بعد</div>
                  <button onClick={() => setTab('generate')} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">توليد جلسة الآن</button>
                </div>
              ) : history.map(rec => (
                <SavedCard key={rec.id} rec={rec} onDelete={() => deleteSession(rec.id)} onView={() => viewSaved(rec)}/>
              ))}
            </div>
          )}

          {/* تبويب التوليد */}
          {tab === 'generate' && (
            <>
              {/* إعدادات */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">⚙️ إعدادات الجلسة</h2>

                {/* نوع الجلسة */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium">نوع الجلسة</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SESSION_TYPES.map(t => (
                      <button key={t.id} onClick={() => setSessionType(t.id)}
                        className={`flex flex-col gap-1 p-3 rounded-xl border text-right transition-all ${sessionType===t.id ? t.active : t.color}`}>
                        <div className="flex items-center gap-2"><span className="text-base">{t.icon}</span><span className="font-bold text-sm">{t.label}</span></div>
                        <span className="text-xs opacity-75">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-medium">التاريخ</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-emerald-400"/>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium">التركيز</label>
                  <div className="flex gap-2 flex-wrap">
                    {FOCUS_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFocus(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${focus===f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-emerald-300'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <button onClick={generate} disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      جاري توليد الجلسة...
                    </span>
                  ) : `🤸 توليد جلسة ${selectedType.label}`}
                </button>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">⚠️ {error}</div>}
              </div>

              {/* نتيجة الجلسة */}
              {session && (
                <div className="space-y-4">

                  {/* Level Tabs */}
                  {(session.strength?.some((e: any) => e.levels) || session.skillWork?.some((e: any) => e.levels) || session.metcon?.some((e: any) => e.levels)) && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium mb-3">اختر مستواك لعرض التفاصيل المخصصة</div>
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
                  )}

                  {/* Header */}
                  <div className="bg-gradient-to-l from-emerald-50 to-white rounded-2xl border border-emerald-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-slate-800 leading-tight">{session.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full border border-emerald-200 font-medium">🤸 {session.sessionType}</span>
                          <span className="text-xs text-slate-500">🎯 {session.focus}</span>
                          {session.totalDuration && <span className="text-xs text-slate-500">⏱ {session.totalDuration} دقيقة</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={saveSession} disabled={saving || saved}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            saved  ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                            saving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
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
                        {session.equipment.map((eq: string, i: number) => <span key={i} className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">🔧 {eq}</span>)}
                      </div>
                    )}
                  </div>

                  {/* الإحماء */}
                  {session.warmup?.exercises?.length > 0 && (
                    <Section title={`الإحماء — ${session.warmup.duration} دقيقة`} icon="🔆"
                      bg="bg-amber-50" border="border-amber-200" titleColor="text-amber-800">
                      {session.warmup.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i} selectedLevel={selectedLevel}/>)}
                    </Section>
                  )}

                  {/* المهارة */}
                  {session.skillWork?.exercises?.length > 0 && (
                    <Section title={`${session.skillWork.title || 'العمل على المهارة'} — ${session.skillWork.duration} دقيقة`} icon="🤸"
                      bg="bg-purple-50" border="border-purple-200" titleColor="text-purple-800">
                      {session.skillWork.exercises.map((ex: any, i: number) => <ExerciseRow key={i} ex={ex} index={i} selectedLevel={selectedLevel}/>)}
                    </Section>
                  )}

                  {/* العمل الرئيسي */}
                  {session.mainWork && (
                    Array.isArray(session.mainWork)
                      ? session.mainWork.map((block: any, bi: number) => (
                          <Section key={bi} title={`${block.block || block.title || 'العمل الرئيسي'}${block.duration ? ` — ${block.duration} دقيقة` : ''}`} icon="💪"
                            bg="bg-blue-50" border="border-blue-200" titleColor="text-blue-800">
                            {block.type && <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">{block.type}</div>}
                            {(block.exercises || []).map((ex: any, ei: number) => <ExerciseRow key={ei} ex={ex} index={ei} selectedLevel={selectedLevel}/>)}
                          </Section>
                        ))
                      : (
                          <Section title={`${(session.mainWork as any).title || 'العمل الرئيسي'}${(session.mainWork as any).duration ? ` — ${(session.mainWork as any).duration} دقيقة` : ''}`} icon="💪"
                            bg="bg-blue-50" border="border-blue-200" titleColor="text-blue-800">
                            {(session.mainWork as any).format && <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">{(session.mainWork as any).format}</div>}
                            {((session.mainWork as any).exercises || []).map((ex: any, ei: number) => <ExerciseRow key={ei} ex={ex} index={ei} selectedLevel={selectedLevel}/>)}
                          </Section>
                        )
                  )}

                  {/* الميتكون */}
                  {session.metcon && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-orange-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🔥</span>
                          <span className="font-bold text-sm text-orange-800">{session.metcon.title || 'الميتكون'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-300 font-medium">{session.metcon.format}</span>
                          {session.metcon.timecap && <span className="text-xs text-slate-500">⏱ {session.metcon.timecap} دقيقة</span>}
                          {session.metcon.rounds && <span className="text-xs text-slate-500">🔄 {session.metcon.rounds} جولات</span>}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        {session.metcon.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-orange-100 last:border-0">
                            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                            <div className="flex-1">
                              <span className="text-slate-800 text-sm font-medium">{ex.name}</span>
                              {ex.nameEn && <span className="text-slate-400 text-xs mr-2">{ex.nameEn}</span>}
                            </div>
                            {ex.reps && <span className="text-orange-700 font-bold text-sm">{ex.reps}</span>}
                          </div>
                        ))}
                        {session.metcon.scoreType && <div className="text-xs text-slate-500 mt-2">📊 النتيجة: {session.metcon.scoreType}</div>}
                      </div>
                    </div>
                  )}

                  {/* التهدئة */}
                  {session.cooldown?.stretches?.length > 0 && (
                    <Section title={`التهدئة والتمطيط — ${session.cooldown.duration} دقيقة`} icon="🧘"
                      bg="bg-teal-50" border="border-teal-200" titleColor="text-teal-800">
                      {session.cooldown.stretches.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-teal-100 last:border-0">
                          <span className="text-teal-600">•</span>
                          <div className="flex-1">
                            <span className="text-slate-800 text-sm">{s.name}</span>
                            {s.focus && <span className="text-slate-400 text-xs mr-2">— {s.focus}</span>}
                          </div>
                          {s.duration && <span className="text-teal-700 text-xs font-medium">{s.duration}</span>}
                        </div>
                      ))}
                    </Section>
                  )}

                  {/* معلومات إضافية */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {session.weeklyPlacement && (
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="text-xs text-slate-500 font-medium mb-1.5">📅 الترتيب في الأسبوع</div>
                        <div className="text-sm text-slate-800">{session.weeklyPlacement}</div>
                      </div>
                    )}
                    {session.progressionPath && (
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="text-xs text-slate-500 font-medium mb-1.5">🚀 مسار التطور</div>
                        <div className="text-sm text-slate-800">{session.progressionPath}</div>
                      </div>
                    )}
                    {session.nutritionTips && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:col-span-2">
                        <div className="text-xs text-amber-700 font-semibold mb-1.5">🥗 التغذية</div>
                        <div className="text-sm text-slate-800">{session.nutritionTips}</div>
                      </div>
                    )}
                    {session.coachNote && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:col-span-2">
                        <div className="text-xs text-emerald-700 font-semibold mb-1.5">💬 ملاحظة المدرب</div>
                        <div className="text-sm text-slate-800">{session.coachNote}</div>
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
