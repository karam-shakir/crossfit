'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

type AdminTab = 'wod' | 'members' | 'weekly';

const WOD_TYPES = ['AMRAP', 'للوقت', 'قوة', 'تدريب'];
const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const FOCUS_OPTIONS = [
  '', 'الأرجل والمؤخرة', 'الأكتاف والضغط', 'الجمناستيك', 'رفع الأثقال الأولمبي',
  'التحمل والقلب', 'الرفعة الميتة', 'القرفصاء', 'الظهر والسحب', 'كامل الجسم'
];

function emptyWod(date: string) {
  return { date, title: '', type: 'للوقت', duration: '', rounds: '', notes: '', warmup: [], strength: [], metcon: [], cooldown: [] };
}

function emptyExercise() {
  return { exerciseId: '', reps: '', weight: '', distance: '', time: '', notes: '' };
}

export default function AdminClient({ member, exercises }: { member: any; exercises: any[] }) {
  const [tab, setTab] = useState<AdminTab>('wod');
  const [wod, setWod] = useState<any>(emptyWod(new Date().toISOString().split('T')[0]));
  const [wodLoading, setWodLoading] = useState(false);
  const [wodSaved, setWodSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('metcon');
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newMember, setNewMember] = useState({ username: '', nameAr: '', password: '' });
  const [addingMember, setAddingMember] = useState(false);

  // Weekly AI plan state
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [weeklyError, setWeeklyError] = useState('');
  const [weeklyFromDate, setWeeklyFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyDays, setWeeklyDays] = useState(7);

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiTheme, setAiTheme] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('متوسط');
  const [aiFocus, setAiFocus] = useState('');

  // Load WOD for selected date
  async function loadWod(date: string) {
    setWodLoading(true);
    const res = await fetch(`/api/wod?date=${date}`);
    const data = await res.json();
    if (data) {
      setWod({ ...data, duration: data.duration || '', rounds: data.rounds || '' });
      if (data.aiTheme) setAiTheme(data.aiTheme);
      else setAiTheme('');
    } else {
      setWod(emptyWod(date));
      setAiTheme('');
    }
    setWodLoading(false);
  }

  useEffect(() => {
    loadWod(wod.date);
  }, []);

  async function saveWod() {
    setWodLoading(true);
    await fetch('/api/wod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...wod,
        duration: wod.duration ? Number(wod.duration) : undefined,
        rounds: wod.rounds ? Number(wod.rounds) : undefined,
      }),
    });
    setWodSaved(true);
    setTimeout(() => setWodSaved(false), 2000);
    setWodLoading(false);
  }

  function addExercise(section: string) {
    setWod((p: any) => ({ ...p, [section]: [...p[section], emptyExercise()] }));
  }

  function updateExercise(section: string, idx: number, field: string, value: string) {
    setWod((p: any) => ({
      ...p,
      [section]: p[section].map((e: any, i: number) => i === idx ? { ...e, [field]: value } : e)
    }));
  }

  function removeExercise(section: string, idx: number) {
    setWod((p: any) => ({ ...p, [section]: p[section].filter((_: any, i: number) => i !== idx) }));
  }

  // AI Generate WOD
  async function generateAiWod() {
    setAiGenerating(true);
    setAiError('');
    setAiTheme('');
    try {
      const res = await fetch('/api/wod/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: wod.date,
          difficulty: aiDifficulty,
          focus: aiFocus || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'حدث خطأ في التوليد');
        return;
      }
      const generated = data.wod;
      setWod({
        ...generated,
        duration: generated.duration ? String(generated.duration) : '',
        rounds: generated.rounds ? String(generated.rounds) : '',
      });
      if (data.theme) setAiTheme(data.theme);
      setShowAiPanel(false);
      setActiveSection('strength');
    } catch (e: any) {
      setAiError(e.message || 'فشل الاتصال بالذكاء الاصطناعي');
    } finally {
      setAiGenerating(false);
    }
  }

  // Weekly AI plan
  async function generateWeeklyPlan() {
    setWeeklyLoading(true);
    setWeeklyError('');
    try {
      const res = await fetch('/api/wod/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: weeklyFromDate, days: weeklyDays }),
      });
      const data = await res.json();
      if (!res.ok) { setWeeklyError(data.error || 'خطأ'); return; }
      setWeeklyPlan(data);
    } catch (e: any) {
      setWeeklyError(e.message);
    } finally {
      setWeeklyLoading(false);
    }
  }

  // Members
  useEffect(() => {
    if (tab === 'members') {
      setMembersLoading(true);
      fetch('/api/members').then(r => r.json()).then(d => { setMembers(d); setMembersLoading(false); });
    }
  }, [tab]);

  async function addMember() {
    setAddingMember(true);
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember),
    });
    if (res.ok) {
      const m = await res.json();
      setMembers(prev => [...prev, m]);
      setNewMember({ username: '', nameAr: '', password: '' });
    } else {
      const err = await res.json();
      alert(err.error || 'خطأ في إضافة العضو');
    }
    setAddingMember(false);
  }

  async function deleteMember(id: string) {
    if (!confirm('حذف هذا العضو؟')) return;
    await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  const sections = [
    { key: 'warmup', label: 'الإحماء 🔆' },
    { key: 'strength', label: 'القوة 🏋️' },
    { key: 'metcon', label: 'الـ WOD 🔥' },
    { key: 'cooldown', label: 'التهدئة 🧘' },
  ];

  return (
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          <h1 className="text-xl font-bold text-white">⚙️ لوحة الإدارة</h1>

          <div className="flex gap-2">
            <button onClick={() => setTab('wod')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'wod' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🔥 WOD اليومي
            </button>
            <button onClick={() => setTab('weekly')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🤖 الخطة الأسبوعية
            </button>
            <button onClick={() => setTab('members')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'members' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              👥 الأعضاء
            </button>
          </div>

          {/* WOD Builder */}
          {tab === 'wod' && (
            <div className="space-y-4">
              {/* Date picker + Save */}
              <div className="flex gap-3">
                <input type="date" value={wod.date}
                  onChange={e => { setWod((p: any) => ({ ...p, date: e.target.value })); loadWod(e.target.value); }}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                <button onClick={saveWod} disabled={wodLoading}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${wodSaved ? 'bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white disabled:bg-gray-700'}`}>
                  {wodSaved ? '✅ تم الحفظ' : wodLoading ? '...' : 'حفظ WOD'}
                </button>
              </div>

              {/* AI Generation Button */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAiPanel(p => !p)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg">
                  <span className="text-lg">🤖</span>
                  توليد تلقائي بالذكاء الاصطناعي
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">CompTrain Style</span>
                </button>

                {/* AI Panel */}
                {showAiPanel && (
                  <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl border border-purple-700/50 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-lg">🧠</span>
                      <h3 className="text-purple-300 font-semibold text-sm">إعدادات توليد التمرين</h3>
                    </div>

                    <div className="text-xs text-gray-400 bg-purple-900/30 rounded-xl p-3 border border-purple-800/40">
                      سيقوم الذكاء الاصطناعي بتوليد <strong className="text-purple-300">تمرين قوة</strong> و<strong className="text-purple-300">ميتكون</strong> مترابطَين بأسلوب CompTrain وPRVN Athletics
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">مستوى الصعوبة</label>
                        <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)}
                          className="w-full bg-gray-800 border border-purple-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">التركيز (اختياري)</label>
                        <select value={aiFocus} onChange={e => setAiFocus(e.target.value)}
                          className="w-full bg-gray-800 border border-purple-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                          <option value="">بدون تركيز محدد</option>
                          {FOCUS_OPTIONS.filter(f => f).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>

                    {aiError && (
                      <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">
                        ⚠️ {aiError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={generateAiWod}
                        disabled={aiGenerating}
                        className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                        {aiGenerating ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            جاري التوليد...
                          </>
                        ) : (
                          <>🤖 توليد التمرين</>
                        )}
                      </button>
                      <button
                        onClick={() => setShowAiPanel(false)}
                        className="px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors">
                        إلغاء
                      </button>
                    </div>

                    {aiGenerating && (
                      <div className="text-center text-xs text-purple-400 animate-pulse">
                        🏋️ يتم تحليل مبادئ البرمجة العالمية وتوليد تمرين متكامل...
                      </div>
                    )}
                  </div>
                )}

                {/* AI Theme Banner */}
                {aiTheme && !showAiPanel && (
                  <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">🔗</span>
                    <div>
                      <div className="text-xs text-purple-400 font-semibold mb-0.5">الرابط بين القوة والميتكون</div>
                      <div className="text-xs text-gray-300">{aiTheme}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* WOD info */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">عنوان التمرين</label>
                  <input type="text" value={wod.title} onChange={e => setWod((p: any) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: تمرين يوم الاثنين — تحمل + قوة" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">نوع WOD</label>
                    <select value={wod.type} onChange={e => setWod((p: any) => ({ ...p, type: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                      {WOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">المدة (دقائق)</label>
                    <input type="number" value={wod.duration} onChange={e => setWod((p: any) => ({ ...p, duration: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">الراوندات</label>
                    <input type="number" value={wod.rounds} onChange={e => setWod((p: any) => ({ ...p, rounds: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="3" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ملاحظات للأعضاء</label>
                  <input type="text" value={wod.notes} onChange={e => setWod((p: any) => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: ركّزوا على التقنية اليوم" />
                </div>
              </div>

              {/* Section tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {sections.map(s => (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === s.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}>
                    {s.label}
                    {wod[s.key]?.length > 0 && (
                      <span className="mr-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{wod[s.key].length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Exercise builder */}
              {sections.map(s => (
                <div key={s.key} className={activeSection === s.key ? 'space-y-3' : 'hidden'}>
                  {wod[s.key]?.map((ex: any, i: number) => {
                    const exInfo = exercises.find((e: any) => e.id === ex.exerciseId);
                    return (
                      <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-bold w-6">#{i + 1}</span>
                          <select value={ex.exerciseId}
                            onChange={e => updateExercise(s.key, i, 'exerciseId', e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                            <option value="">اختر التمرين</option>
                            {exercises.map((e: any) => (
                              <option key={e.id} value={e.id}>{e.nameAr} ({e.nameEn})</option>
                            ))}
                          </select>
                          <button onClick={() => removeExercise(s.key, i)}
                            className="w-8 h-8 rounded-lg bg-red-900 hover:bg-red-700 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                            ×
                          </button>
                        </div>
                        {exInfo && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>💪 {exInfo.muscles}</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded-full">{exInfo.category}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={ex.reps} onChange={e => updateExercise(s.key, i, 'reps', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="تكرارات (مثال: 21-15-9)" />
                          <input type="text" value={ex.weight} onChange={e => updateExercise(s.key, i, 'weight', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="وزن (مثال: 60 كجم)" />
                          <input type="text" value={ex.distance} onChange={e => updateExercise(s.key, i, 'distance', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="مسافة (مثال: 400م)" />
                          <input type="text" value={ex.time} onChange={e => updateExercise(s.key, i, 'time', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="وقت (مثال: 3 دقائق)" />
                        </div>
                        <input type="text" value={ex.notes} onChange={e => updateExercise(s.key, i, 'notes', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                          placeholder="ملاحظة خاصة بهذا التمرين" />
                      </div>
                    );
                  })}
                  <button onClick={() => addExercise(s.key)}
                    className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400 text-sm transition-colors">
                    + إضافة تمرين
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Weekly AI Plan */}
          {tab === 'weekly' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl border border-indigo-700/40 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <h2 className="font-bold text-white">التخطيط الأسبوعي بالذكاء الاصطناعي</h2>
                    <p className="text-xs text-indigo-300">يحلل تمارينك السابقة ويضع خطة متوازنة تشمل CrossFit + Hyrox + Kettlebell + أيام راحة</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">من تاريخ</label>
                    <input type="date" value={weeklyFromDate} onChange={e => setWeeklyFromDate(e.target.value)}
                      className="w-full bg-gray-800 border border-indigo-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">عدد الأيام</label>
                    <select value={weeklyDays} onChange={e => setWeeklyDays(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-indigo-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value={7}>أسبوع (7 أيام)</option>
                      <option value={14}>أسبوعان (14 يوم)</option>
                    </select>
                  </div>
                </div>

                {weeklyError && (
                  <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {weeklyError}</div>
                )}

                <button onClick={generateWeeklyPlan} disabled={weeklyLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                  {weeklyLoading ? (
                    <><span className="animate-spin">⚙️</span> يتم تحليل التمارين السابقة وبناء الخطة...</>
                  ) : (
                    <><span>🤖</span> توليد الخطة الأسبوعية</>
                  )}
                </button>
                {weeklyLoading && (
                  <p className="text-center text-xs text-indigo-400 animate-pulse">
                    📊 يحلل الذكاء الاصطناعي سجل التمارين ويوازن بين القوة والتحمل والراحة...
                  </p>
                )}
              </div>

              {/* Weekly Plan Result */}
              {weeklyPlan && (
                <div className="space-y-4">
                  {/* Week Summary */}
                  {weeklyPlan.weekSummary && (
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                        <span>📋</span> فلسفة الأسبوع
                      </h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.weekSummary}</p>
                    </div>
                  )}

                  {/* Days */}
                  <div className="space-y-3">
                    {weeklyPlan.plan?.map((day: any, i: number) => {
                      const typeConfig: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
                        crossfit: { emoji: '🔥', color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-700/30' },
                        hyrox: { emoji: '🏁', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700/30' },
                        kettlebell: { emoji: '🏋️', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700/30' },
                        rest: { emoji: '😴', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700/30' },
                        active_recovery: { emoji: '🧘', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700/30' },
                      };
                      const cfg = typeConfig[day.type] || typeConfig.crossfit;
                      const intensityColors: Record<string, string> = {
                        'خفيف': 'text-green-400 bg-green-900/30',
                        'متوسط': 'text-yellow-400 bg-yellow-900/30',
                        'مرتفع': 'text-red-400 bg-red-900/30',
                        'راحة': 'text-blue-400 bg-blue-900/30',
                      };
                      return (
                        <div key={i} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{cfg.emoji}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-sm">{day.dayName}</span>
                                  <span className="text-xs text-gray-500">{day.date}</span>
                                </div>
                                <div className={`text-xs font-semibold ${cfg.color}`}>{day.title}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {day.intensity && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${intensityColors[day.intensity] || 'text-gray-400 bg-gray-800'}`}>
                                  {day.intensity}
                                </span>
                              )}
                              {(day.type === 'hyrox' || day.type === 'kettlebell') && (
                                <a href={`/${day.type}`}
                                  className={`text-xs px-2 py-1 rounded-lg ${cfg.color} bg-black/20 hover:bg-black/40 transition-colors`}>
                                  فتح ←
                                </a>
                              )}
                            </div>
                          </div>

                          {day.focus && (
                            <div className="text-xs text-gray-400 mb-2">🎯 {day.focus}</div>
                          )}

                          {day.aiInsight && (
                            <div className="bg-black/20 rounded-xl p-2 text-xs text-gray-300 mb-2">
                              💡 {day.aiInsight}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {day.muscleGroups?.length > 0 && (
                              <span>💪 {day.muscleGroups.join('، ')}</span>
                            )}
                            {day.recommendedTime && (
                              <span>⏰ {day.recommendedTime}</span>
                            )}
                          </div>

                          {day.reason && (
                            <div className="mt-2 text-xs text-gray-500 border-t border-white/5 pt-2">
                              🔍 {day.reason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Recovery Tips */}
                  {weeklyPlan.recoveryTips?.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <span>🌿</span> نصائح التعافي
                      </h3>
                      <div className="space-y-2">
                        {weeklyPlan.recoveryTips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Note */}
                  {weeklyPlan.nutritionNote && (
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                        <span>🥗</span> ملاحظة تغذوية للأسبوع
                      </h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.nutritionNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Members management */}
          {tab === 'members' && (
            <div className="space-y-4">
              {/* Add member form */}
              <div className="bg-gray-900 rounded-2xl p-4 border border-purple-700 space-y-3">
                <h2 className="font-semibold text-purple-400">إضافة عضو جديد</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">الاسم بالعربي</label>
                    <input type="text" value={newMember.nameAr} onChange={e => setNewMember(p => ({ ...p, nameAr: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="مثال: محمد أحمد" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">اسم المستخدم</label>
                    <input type="text" value={newMember.username} onChange={e => setNewMember(p => ({ ...p, username: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="مثال: mohammed" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">كلمة المرور</label>
                  <input type="text" value={newMember.password} onChange={e => setNewMember(p => ({ ...p, password: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="كلمة مرور مؤقتة" />
                </div>
                <button onClick={addMember} disabled={!newMember.nameAr || !newMember.username || !newMember.password || addingMember}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                  {addingMember ? 'جاري الإضافة...' : 'إضافة العضو 👥'}
                </button>
              </div>

              {/* Members list */}
              {membersLoading ? (
                <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
              ) : (
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 bg-gray-900 rounded-xl border border-gray-800 p-4">
                      <span className="text-2xl">{m.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{m.nameAr}</div>
                        <div className="text-xs text-gray-400">@{m.username} • {m.role === 'admin' ? 'مدير' : 'عضو'} • انضم {m.joinDate}</div>
                      </div>
                      {m.id !== 'admin' && (
                        <button onClick={() => deleteMember(m.id)}
                          className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-red-800 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                          🗑
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
