'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

type AdminTab = 'wod' | 'members' | 'weekly' | 'sports' | 'logs';

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
  const [wod, setWod] = useState<any>(emptyWod(todaySA()));
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
  const [weeklyFromDate, setWeeklyFromDate] = useState(todaySA());
  const [weeklyDays, setWeeklyDays] = useState(7);
  const [weekMode, setWeekMode] = useState<'crossfit' | 'mixed'>('crossfit');
  const [calisthenicsDays, setCalisthenicsDays] = useState(1);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [viewingSaved, setViewingSaved] = useState<any>(null);
  const [savedLoading, setSavedLoading] = useState(false);

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiTheme, setAiTheme] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('متوسط');
  const [aiFocus, setAiFocus] = useState('');
  const [wodMode, setWodMode] = useState<'crossfit' | 'calisthenics'>('crossfit');
  const [aiGeneratedMode, setAiGeneratedMode] = useState<'crossfit' | 'calisthenics'>('crossfit');

  // ===== Fix Cooldown =====
  const [fixCooldownFrom, setFixCooldownFrom] = useState(todaySA());
  const [fixCooldownTo, setFixCooldownTo] = useState(todaySA());
  const [fixCooldownLoading, setFixCooldownLoading] = useState(false);
  const [fixCooldownResult, setFixCooldownResult] = useState<any>(null);
  const [fixCooldownError, setFixCooldownError] = useState('');

  async function handleFixCooldown() {
    setFixCooldownLoading(true); setFixCooldownResult(null); setFixCooldownError('');
    try {
      const res = await fetch('/api/wod/fix-cooldown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: fixCooldownFrom, toDate: fixCooldownTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل');
      setFixCooldownResult(data);
    } catch (e: any) {
      setFixCooldownError(e.message);
    } finally {
      setFixCooldownLoading(false);
    }
  }

  // ===== Sports Weekly Plans =====
  type SportsTab = 'hyrox' | 'kettlebell' | 'calisthenics';
  const [sportsTab, setSportsTab] = useState<SportsTab>('hyrox');
  const [sportsFromDate, setSportsFromDate] = useState(todaySA());
  const [sportsDays, setSportsDays] = useState(5);
  const [sportsDifficulty, setSportsDifficulty] = useState('متوسط');
  const [sportsLoading, setSportsLoading] = useState(false);
  const [sportsPlan, setSportsPlan] = useState<any>(null);
  const [sportsError, setSportsError] = useState('');
  const [sportsSaving, setSportsSaving] = useState(false);
  const [sportsSaved, setSportsSaved] = useState(false);

  async function generateSportsPlan() {
    setSportsLoading(true); setSportsError(''); setSportsPlan(null); setSportsSaved(false);
    try {
      const res = await fetch(`/api/${sportsTab}/generate-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: sportsFromDate, days: sportsDays, ...(sportsTab !== 'calisthenics' && { difficulty: sportsDifficulty }) }),
      });
      const data = await res.json();
      if (!res.ok) { setSportsError(data.error || 'خطأ في التوليد'); return; }
      setSportsPlan(data);
    } catch (e: any) { setSportsError(e.message); }
    setSportsLoading(false);
  }

  async function saveSportsPlan() {
    if (!sportsPlan) return;
    setSportsSaving(true);
    try {
      const res = await fetch(`/api/${sportsTab}/save-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: sportsPlan.sessions || [] }),
      });
      if (res.ok) setSportsSaved(true);
    } catch {}
    setSportsSaving(false);
  }

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
          wodMode,
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
      setAiGeneratedMode(wodMode);
      setShowAiPanel(false);
      setActiveSection('strength');
    } catch (e: any) {
      setAiError(e.message || 'فشل الاتصال بالذكاء الاصطناعي');
    } finally {
      setAiGenerating(false);
    }
  }

  // Weekly AI plan — full WODs
  async function generateWeeklyPlan() {
    setWeeklyLoading(true);
    setWeeklyError('');
    setWeeklyPlan(null);
    setPlanSaved(false);
    setViewingSaved(null);
    try {
      const res = await fetch('/api/wod/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: weeklyFromDate, days: weeklyDays, difficulty: aiDifficulty, weekMode, calisthenicsDays }),
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

  async function saveWeeklyPlan() {
    if (!weeklyPlan) return;
    setSavingPlan(true);
    try {
      const label = `خطة ${weeklyDays} أيام من ${weeklyFromDate}`;
      // 1. Save plan record
      await fetch('/api/weekly-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...weeklyPlan, label, fromDate: weeklyFromDate, days: weeklyDays }),
      });
      // 2. Save each WOD fully to the calendar
      for (const wod of weeklyPlan.wods || []) {
        await fetch('/api/wod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: wod.date,
            title: wod.title,
            titleEn: wod.titleEn || '',
            type: wod.type,
            duration: wod.duration,
            rounds: wod.rounds,
            notes: wod.notes || '',
            aiTheme: wod.aiTheme || '',
            isCalisthenics: wod.isCalisthenics || false,
            warmup: wod.warmup || [],
            strength: wod.strength || [],
            metcon: wod.metcon || [],
            cooldown: wod.cooldown || [],
          }),
        });
      }
      setPlanSaved(true);
      loadSavedPlans();
    } catch {}
    setSavingPlan(false);
  }

  async function loadSavedPlans() {
    setSavedLoading(true);
    const res = await fetch('/api/weekly-plans');
    const data = await res.json();
    setSavedPlans(Array.isArray(data) ? data : []);
    setSavedLoading(false);
  }

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function deleteSavedPlan(id: string, deleteWods: boolean) {
    setDeleteConfirm(null);
    await fetch(`/api/weekly-plans?id=${id}&deleteWods=${deleteWods}`, { method: 'DELETE' });
    setSavedPlans(p => p.filter(x => x.id !== id));
    if (viewingSaved?.id === id) setViewingSaved(null);
  }

  // Load saved plans when tab opens
  useEffect(() => {
    if (tab === 'weekly') loadSavedPlans();
  }, [tab]);

  // ===== Login Logs =====
  const [logs, setLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTab, setLogsTab] = useState<'stats' | 'detail'>('stats');
  const [logFilter, setLogFilter] = useState('');

  useEffect(() => {
    if (tab === 'logs') loadLogs();
  }, [tab]);

  async function loadLogs() {
    setLogsLoading(true);
    const res = await fetch('/api/login-logs');
    const data = await res.json();
    setLogs(data.logs || []);
    setLogStats(data.stats || []);
    setLogsLoading(false);
  }

  async function clearLogs() {
    if (!confirm('حذف كل سجل الدخول؟')) return;
    await fetch('/api/login-logs', { method: 'DELETE' });
    setLogs([]); setLogStats([]);
  }

  // Members
  const [memberStats, setMemberStats] = useState<any[]>([]);
  const [newMemberCredentials, setNewMemberCredentials] = useState<any>(null);

  useEffect(() => {
    if (tab === 'members') {
      setMembersLoading(true);
      Promise.all([
        fetch('/api/members').then(r => r.json()),
        fetch('/api/leaderboard').then(r => r.json()),
      ]).then(([m, s]) => {
        setMembers(Array.isArray(m) ? m : []);
        setMemberStats(Array.isArray(s) ? s : []);
        setMembersLoading(false);
      });
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
      setNewMemberCredentials({ nameAr: m.nameAr, username: newMember.username, password: newMember.password });
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

  async function togglePermission(id: string, perm: 'canViewWods' | 'canGenerateWod', current: boolean) {
    const res = await fetch(`/api/members/permissions?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [perm]: !current }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, [perm]: !current } : m));
    }
  }

  const sections = [
    { key: 'warmup', label: 'الإحماء 🔆' },
    { key: 'strength', label: 'القوة 🏋️' },
    { key: 'metcon', label: 'الـ WOD 🔥' },
    { key: 'cooldown', label: 'التهدئة 🧘' },
  ];

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <h1 className="text-xl font-bold text-white">⚙️ لوحة الإدارة</h1>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setTab('wod')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'wod' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🔥 WOD اليومي
            </button>
            <button onClick={() => setTab('weekly')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              📅 خطة CrossFit
            </button>
            <button onClick={() => setTab('sports')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'sports' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🏋️ خطة الرياضات
            </button>
            <button onClick={() => setTab('members')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'members' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              👥 الأعضاء
            </button>
            <button onClick={() => setTab('logs')}
              className={`col-span-2 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'logs' ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              📋 سجل الدخول
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
                  className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    wodMode === 'calisthenics'
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600'
                  }`}>
                  <span className="text-lg">{wodMode === 'calisthenics' ? '🤸' : '🤖'}</span>
                  توليد تلقائي بالذكاء الاصطناعي
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {wodMode === 'calisthenics' ? 'Calisthenics' : 'CompTrain Style'}
                  </span>
                </button>

                {/* AI Panel */}
                {showAiPanel && (
                  <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl border border-purple-700/50 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-lg">🧠</span>
                      <h3 className="text-purple-300 font-semibold text-sm">إعدادات توليد التمرين</h3>
                    </div>

                    {/* WOD Mode Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-purple-700/40">
                      <button
                        onClick={() => setWodMode('crossfit')}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          wodMode === 'crossfit'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'
                        }`}>
                        🔥 CrossFit
                      </button>
                      <button
                        onClick={() => setWodMode('calisthenics')}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          wodMode === 'calisthenics'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'
                        }`}>
                        🤸 Calisthenics
                      </button>
                    </div>

                    <div className="text-xs text-gray-400 bg-purple-900/30 rounded-xl p-3 border border-purple-800/40">
                      {wodMode === 'calisthenics'
                        ? <>سيولّد الذكاء الاصطناعي <strong className="text-emerald-300">تمرين Calisthenics</strong> كامل — وزن الجسم فقط بدون معدات</>
                        : <>سيقوم الذكاء الاصطناعي بتوليد <strong className="text-purple-300">تمرين قوة</strong> و<strong className="text-purple-300">ميتكون</strong> مترابطَين بأسلوب CompTrain وPRVN Athletics</>
                      }
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
                        className={`flex-1 py-3 rounded-xl disabled:bg-gray-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                          wodMode === 'calisthenics'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-purple-600 hover:bg-purple-500'
                        }`}>
                        {aiGenerating ? (
                          <><span className="animate-spin">⚙️</span> جاري التوليد...</>
                        ) : wodMode === 'calisthenics' ? (
                          <>🤸 توليد تمرين Calisthenics</>
                        ) : (
                          <>🤖 توليد تمرين CrossFit</>
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
                  <div className={`rounded-xl p-3 flex items-start gap-2 ${
                    aiGeneratedMode === 'calisthenics'
                      ? 'bg-emerald-900/20 border border-emerald-700/30'
                      : 'bg-purple-900/20 border border-purple-700/30'
                  }`}>
                    <span className={`mt-0.5 flex-shrink-0 ${aiGeneratedMode === 'calisthenics' ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {aiGeneratedMode === 'calisthenics' ? '🤸' : '🔗'}
                    </span>
                    <div>
                      <div className={`text-xs font-semibold mb-0.5 ${aiGeneratedMode === 'calisthenics' ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {aiGeneratedMode === 'calisthenics' ? 'هدف تمرين Calisthenics' : 'الرابط بين القوة والميتكون'}
                      </div>
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

                {/* Week Mode Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-indigo-700/50">
                  <button
                    onClick={() => setWeekMode('crossfit')}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      weekMode === 'crossfit'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'
                    }`}>
                    🔥 CrossFit كامل
                  </button>
                  <button
                    onClick={() => setWeekMode('mixed')}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      weekMode === 'mixed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'
                    }`}>
                    🤸 مختلط + Calisthenics
                  </button>
                </div>

                {/* Calisthenics days selector — shown only when mixed */}
                {weekMode === 'mixed' && (
                  <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-emerald-300 font-semibold">🤸 عدد أيام Calisthenics في الأسبوع</p>
                    <div className="flex gap-2">
                      {[1, 2].map(n => (
                        <button
                          key={n}
                          onClick={() => setCalisthenicsDays(n)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            calisthenicsDays === n
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
                          }`}>
                          {n === 1 ? 'يوم واحد 1️⃣' : 'يومان 2️⃣'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {calisthenicsDays === 1
                        ? 'يوم واحد مخصص لوزن الجسم + باقي الأيام CrossFit'
                        : 'يومان مخصصان لوزن الجسم + باقي الأيام CrossFit'}
                    </p>
                  </div>
                )}

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
                  className={`w-full py-3 rounded-xl disabled:bg-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2 ${
                    weekMode === 'mixed'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}>
                  {weeklyLoading ? (
                    <><span className="animate-spin">⚙️</span> يتم تحليل التمارين السابقة وبناء الخطة...</>
                  ) : weekMode === 'mixed' ? (
                    <><span>🤸</span> توليد أسبوع مختلط CrossFit + Calisthenics</>
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

              {/* Save button */}
              {weeklyPlan && (
                <button onClick={saveWeeklyPlan} disabled={savingPlan || planSaved}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    planSaved ? 'bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}>
                  {planSaved ? '✅ تم الحفظ وإضافة التمارين للتقويم' : savingPlan ? '⏳ جاري الحفظ وإنشاء التمارين...' : '💾 حفظ الخطة وإضافتها للتقويم'}
                </button>
              )}

              {/* Saved Plans List */}
              {savedPlans.length > 0 && !weeklyPlan && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <span>📁</span> الخطط المحفوظة ({savedPlans.length})
                  </h3>
                  {savedLoading ? (
                    <div className="text-center text-gray-500 py-4 text-sm">جاري التحميل...</div>
                  ) : (
                    savedPlans.map(p => (
                      <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-sm">{p.label}</span>
                          <div className="flex gap-2">
                            <button onClick={() => setViewingSaved(viewingSaved?.id === p.id ? null : p)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors">
                              {viewingSaved?.id === p.id ? 'إخفاء' : 'عرض'}
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)}
                              className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1 rounded-lg transition-colors">
                              🗑
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {' · '}{p.days} أيام
                        </div>

                        {/* Expanded saved plan */}
                        {viewingSaved?.id === p.id && (
                          <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                            {p.weekSummary && (
                              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3 text-xs text-gray-300">
                                📋 {p.weekSummary}
                              </div>
                            )}
                            {p.plan?.map((day: any, i: number) => {
                              const icons: Record<string, string> = { crossfit: '🔥', hyrox: '🏁', kettlebell: '🏋️', rest: '😴', active_recovery: '🧘' };
                              const colors: Record<string, string> = { crossfit: 'border-orange-700/40', hyrox: 'border-red-700/40', kettlebell: 'border-yellow-700/40', rest: 'border-blue-700/40', active_recovery: 'border-green-700/40' };
                              return (
                                <div key={i} className={`rounded-xl border p-3 bg-gray-800/50 ${colors[day.type] || 'border-gray-700'}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span>{icons[day.type] || '📅'}</span>
                                    <span className="font-semibold text-white text-sm">{day.dayName}</span>
                                    <span className="text-xs text-gray-500">{day.date}</span>
                                    <span className="text-xs text-gray-400 mr-auto">{day.intensity}</span>
                                  </div>
                                  <div className="text-xs text-gray-300">{day.title}</div>
                                  {day.aiInsight && <div className="text-xs text-gray-500 mt-1">💡 {day.aiInsight}</div>}
                                </div>
                              );
                            })}
                            {p.nutritionNote && (
                              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-xs text-gray-300">
                                🥗 {p.nutritionNote}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Weekly Plan Result */}
              {weeklyPlan && (
                <div className="space-y-4">
                  {weeklyPlan.weekSummary && (
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-indigo-300 mb-2">📋 فلسفة الأسبوع</h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.weekSummary}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {weeklyPlan.wods?.map((wod: any, i: number) => {
                      const isRest = wod.isRest || wod.type === 'راحة' || wod.type === 'راحة نشطة';
                      const isCalis = wod.isCalisthenics === true;
                      const SECTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
                        warmup:   { label: 'الإحماء',  icon: '🔆', color: 'text-yellow-400' },
                        strength: { label: 'القوة',    icon: '🏋️', color: 'text-blue-400' },
                        metcon:   { label: 'الـ WOD',  icon: '🔥', color: 'text-orange-400' },
                        cooldown: { label: 'التهدئة',  icon: '🧘', color: 'text-teal-400' },
                      };
                      return (
                        <div key={i} className={`rounded-2xl border overflow-hidden ${
                          isRest ? 'border-blue-700/30 bg-blue-900/10'
                          : isCalis ? 'border-emerald-700/50 bg-emerald-900/10'
                          : 'border-gray-700 bg-gray-900'
                        }`}>
                          {/* Header */}
                          <div className={`p-4 border-b ${isCalis ? 'border-emerald-800/40' : 'border-gray-800'}`}>
                            {isCalis && (
                              <div className="mb-2 inline-flex items-center gap-1.5 bg-emerald-700/30 border border-emerald-600/40 rounded-full px-2.5 py-0.5 text-xs text-emerald-300 font-semibold">
                                🤸 يوم Calisthenics
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{isRest ? '😴' : isCalis ? '🤸' : '🔥'}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{wod.dayName}</span>
                                    <span className="text-xs text-gray-500">{wod.date}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">{wod.titleEn || wod.title}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{wod.type}</span>
                                {wod.duration && <span className="text-xs text-gray-500">⏱ {wod.duration}د</span>}
                                {wod.rounds && <span className="text-xs text-gray-500">🔄 {wod.rounds}</span>}
                              </div>
                            </div>
                            {wod.aiTheme && (
                              <div className="mt-2 bg-purple-900/20 rounded-lg p-2 text-xs text-purple-300">
                                🔗 {wod.aiTheme}
                              </div>
                            )}
                            {wod.notes && (
                              <div className="mt-2 text-xs text-gray-400">📝 {wod.notes}</div>
                            )}
                          </div>

                          {/* Sections */}
                          {!isRest && (
                            <div className="p-4 space-y-4">
                              {(['warmup', 'strength', 'metcon', 'cooldown'] as const).map(sec => {
                                const items = (wod[sec] || []).filter((e: any) => e.exerciseId);
                                if (!items.length) return null;
                                const { label, icon, color } = SECTION_LABELS[sec];
                                return (
                                  <div key={sec}>
                                    <h4 className={`font-semibold text-xs mb-2 flex items-center gap-1 ${color}`}>
                                      <span>{icon}</span>{label} ({items.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {items.map((ex: any, j: number) => (
                                        <div key={j} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2 text-xs">
                                          <span className="text-gray-500 font-mono w-4">{j + 1}</span>
                                          <span className="text-white font-medium flex-1">{ex.exerciseId}</span>
                                          {ex.reps && <span className="text-orange-300 bg-orange-900/30 px-2 py-0.5 rounded">{ex.reps}</span>}
                                          {ex.weight && <span className="text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">{ex.weight}</span>}
                                          {ex.notes && <span className="text-gray-400">· {ex.notes}</span>}
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
                    })}
                  </div>

                  {weeklyPlan.recoveryTips?.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-green-400 mb-2">🌿 نصائح التعافي</h3>
                      {weeklyPlan.recoveryTips.map((t: string, i: number) => (
                        <div key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">•</span>{t}</div>
                      ))}
                    </div>
                  )}
                  {weeklyPlan.nutritionNote && (
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-amber-400 mb-2">🥗 التغذية</h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.nutritionNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Fix Cooldown Section */}
              <div className="bg-gray-900 border border-yellow-700/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧘</span>
                  <div>
                    <h2 className="font-bold text-yellow-300 text-base">إصلاح التهدئة للجلسات الحالية</h2>
                    <p className="text-xs text-gray-400">يصلح قسم التهدئة فقط للجلسات المولَّدة دون إعادة توليد التمرين كاملاً</p>
                  </div>
                </div>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">من تاريخ</label>
                    <input type="date" value={fixCooldownFrom} onChange={e => setFixCooldownFrom(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">إلى تاريخ</label>
                    <input type="date" value={fixCooldownTo} onChange={e => setFixCooldownTo(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
                  </div>
                  <button onClick={handleFixCooldown} disabled={fixCooldownLoading}
                    className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
                    {fixCooldownLoading ? '⏳ جاري الإصلاح...' : '🔧 إصلاح التهدئة'}
                  </button>
                </div>
                {fixCooldownError && (
                  <p className="text-red-400 text-sm">{fixCooldownError}</p>
                )}
                {fixCooldownResult && (
                  <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                    <p className="text-green-400 font-semibold text-sm">
                      تم إصلاح {fixCooldownResult.fixed} من أصل {fixCooldownResult.total} جلسة
                    </p>
                    <div className="space-y-1">
                      {fixCooldownResult.results?.map((r: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{r.date}</span>
                          <span className={r.status.startsWith('تم') ? 'text-green-400' : r.status.startsWith('خطأ') ? 'text-red-400' : 'text-gray-500'}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sports Weekly Plans */}
          {tab === 'sports' && (
            <div className="space-y-4">
              {/* Sport selector */}
              <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                {([
                  { id: 'hyrox',       label: '🏁 Hyrox',       active: 'bg-red-600' },
                  { id: 'kettlebell',  label: '🔔 Kettlebell',   active: 'bg-yellow-600' },
                  { id: 'calisthenics',label: '🤸 Calisthenics', active: 'bg-emerald-600' },
                ] as const).map(s => (
                  <button key={s.id}
                    onClick={() => { setSportsTab(s.id); setSportsPlan(null); setSportsSaved(false); setSportsError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${sportsTab === s.id ? s.active + ' text-white' : 'text-gray-400 hover:text-white'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Settings */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <h2 className="font-semibold text-emerald-400 text-sm">⚙️ إعدادات الخطة الأسبوعية</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">من تاريخ</label>
                    <input type="date" value={sportsFromDate} onChange={e => setSportsFromDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">عدد الأيام</label>
                    <select value={sportsDays} onChange={e => setSportsDays(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500">
                      {[3,4,5,6,7].map(n => <option key={n} value={n}>{n} أيام</option>)}
                    </select>
                  </div>
                </div>
                {sportsTab !== 'calisthenics' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">مستوى الصعوبة</label>
                    <div className="flex gap-2">
                      {DIFFICULTY_OPTIONS.map(d => (
                        <button key={d} onClick={() => setSportsDifficulty(d)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sportsDifficulty === d ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={generateSportsPlan} disabled={sportsLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {sportsLoading ? (
                    <><span className="animate-spin">⏳</span> جاري التوليد...</>
                  ) : (
                    <><span>🤖</span> توليد الخطة الأسبوعية</>
                  )}
                </button>
                {sportsError && <p className="text-red-400 text-xs text-center">{sportsError}</p>}
              </div>

              {/* Results */}
              {sportsPlan && (
                <div className="space-y-3">
                  {/* Summary */}
                  {sportsPlan.weekSummary && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 text-xs text-emerald-300">
                      🎯 {sportsPlan.weekSummary}
                    </div>
                  )}

                  {/* Sessions */}
                  {(sportsPlan.sessions || []).map((s: any, i: number) => (
                    <div key={i} className={`rounded-xl border p-3 space-y-1 ${s.isRest ? 'border-gray-700 bg-gray-900/40' : 'border-emerald-700/30 bg-emerald-900/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.isRest ? 'bg-gray-700 text-gray-400' : 'bg-emerald-700/40 text-emerald-300'}`}>
                            {s.isRest ? '😴 راحة' : sportsTab === 'hyrox' ? s.sessionType : sportsTab === 'kettlebell' ? s.eventType : s.sessionType}
                          </span>
                          <span className="text-xs text-gray-400">{s.dayName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{s.date}</span>
                      </div>
                      {!s.isRest && (
                        <>
                          <div className="text-sm font-semibold text-white">{s.title}</div>
                          {s.coachNote && <div className="text-xs text-gray-400">💬 {s.coachNote}</div>}
                          <div className="flex gap-2 flex-wrap mt-1">
                            {s.difficulty && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s.difficulty}</span>}
                            {s.totalDuration && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">⏱ {s.totalDuration} د</span>}
                            {s.focus && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s.focus}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Save button */}
                  <button onClick={saveSportsPlan} disabled={sportsSaving || sportsSaved}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${sportsSaved ? 'bg-green-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'}`}>
                    {sportsSaved ? '✅ تم الحفظ — ستظهر في سجل التمارين' : sportsSaving ? '⏳ جاري الحفظ...' : '💾 حفظ الخطة في التقويم'}
                  </button>
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
                    <div key={m.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
                      {/* معلومات العضو */}
                      {(() => {
                        const st = memberStats.find(s => s.id === m.id);
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{m.avatar}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white">{m.nameAr}</div>
                                <div className="text-xs text-gray-400">@{m.username} • {m.role === 'admin' ? '👑 مدير' : '🏋️ عضو'} • انضم {m.joinDate}</div>
                              </div>
                              {m.id !== 'admin' && (
                                <button onClick={() => deleteMember(m.id)}
                                  className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-red-800 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                                  🗑
                                </button>
                              )}
                            </div>
                            {st && (
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { label: 'هذا الشهر', value: st.monthSessions, unit: 'جلسة', color: 'text-orange-400' },
                                  { label: 'الإجمالي',  value: st.totalSessions, unit: 'جلسة', color: 'text-blue-400' },
                                  { label: 'الأرقام',   value: st.totalPRs,      unit: 'PR',   color: 'text-yellow-400' },
                                  { label: 'التواصل',   value: st.streak,        unit: 'يوم',  color: 'text-green-400' },
                                ].map(item => (
                                  <div key={item.label} className="bg-gray-800/60 rounded-lg p-2 text-center">
                                    <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                                    <div className="text-xs text-gray-500">{item.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {/* صلاحيات العضو */}
                      {m.role !== 'admin' && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                          <span className="text-xs text-gray-500 flex items-center self-center">🔐 الصلاحيات:</span>
                          <button
                            onClick={() => togglePermission(m.id, 'canViewWods', m.canViewWods !== false)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                              m.canViewWods !== false
                                ? 'bg-green-900/40 border-green-700/50 text-green-400 hover:bg-red-900/40 hover:border-red-700/50 hover:text-red-400'
                                : 'bg-red-900/40 border-red-700/50 text-red-400 hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-400'
                            }`}
                          >
                            {m.canViewWods !== false ? '✅ سجل التمارين' : '🚫 سجل التمارين'}
                          </button>
                          <button
                            onClick={() => togglePermission(m.id, 'canGenerateWod', m.canGenerateWod !== false)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                              m.canGenerateWod !== false
                                ? 'bg-green-900/40 border-green-700/50 text-green-400 hover:bg-red-900/40 hover:border-red-700/50 hover:text-red-400'
                                : 'bg-red-900/40 border-red-700/50 text-red-400 hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-400'
                            }`}
                          >
                            {m.canGenerateWod !== false ? '✅ توليد التمرين' : '🚫 توليد التمرين'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Login Logs */}
          {tab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">📋 سجل الدخول للمنصة</h2>
                <button onClick={clearLogs} className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  🗑 مسح السجل
                </button>
              </div>

              {/* Sub tabs */}
              <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button onClick={() => setLogsTab('stats')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${logsTab === 'stats' ? 'bg-teal-600 text-white' : 'text-gray-400'}`}>
                  📊 إحصائيات الأعضاء
                </button>
                <button onClick={() => setLogsTab('detail')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${logsTab === 'detail' ? 'bg-teal-600 text-white' : 'text-gray-400'}`}>
                  🕒 السجل التفصيلي
                </button>
              </div>

              {logsLoading ? (
                <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
              ) : logsTab === 'stats' ? (
                /* ===== إحصائيات لكل عضو ===== */
                <div className="space-y-3">
                  {logStats.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">لا توجد بيانات بعد — انتظر أول دخول للأعضاء</div>
                  ) : logStats.map((s, i) => (
                    <div key={s.memberId} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-teal-400 w-8">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white">{s.memberName}</div>
                          <div className="text-xs text-gray-500">@{s.username} • {s.role === 'admin' ? '👑 مدير' : '🏋️ عضو'}</div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-2xl font-bold text-teal-400">{s.totalLogins}</div>
                          <div className="text-xs text-gray-500">دخول</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-600">أول دخول: </span>
                          <span className="text-gray-400">{new Date(s.firstLogin).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">آخر دخول: </span>
                          <span className="text-teal-400 font-medium">{new Date(s.lastLogin).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })} — {new Date(s.lastLogin).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ===== السجل التفصيلي ===== */
                <div className="space-y-3">
                  {/* فلتر */}
                  <input
                    value={logFilter}
                    onChange={e => setLogFilter(e.target.value)}
                    placeholder="🔍 ابحث باسم العضو أو اسم المستخدم..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <div className="text-xs text-gray-600 text-left">{logs.length} سجل</div>
                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">لا توجد سجلات</div>
                  ) : (
                    <div className="space-y-2">
                      {logs
                        .filter(l => !logFilter || l.memberName?.includes(logFilter) || l.username?.includes(logFilter))
                        .map((l, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">{l.memberName}</span>
                                <span className="text-xs text-gray-600">@{l.username}</span>
                                {l.role === 'admin' && <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 rounded">مدير</span>}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                🌐 {l.ip !== 'unknown' ? l.ip : 'غير معروف'}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-teal-400 font-medium">
                                {new Date(l.loginAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(l.loginAt).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg text-center">🗑 حذف الخطة</h3>
            <p className="text-sm text-gray-400 text-center">
              هل تريد حذف سجل الخطة فقط، أم حذف التمارين من التقويم أيضاً؟
            </p>
            <div className="space-y-2">
              <button
                onClick={() => deleteSavedPlan(deleteConfirm, true)}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                🗑 حذف الخطة والتمارين من التقويم
              </button>
              <button
                onClick={() => deleteSavedPlan(deleteConfirm, false)}
                className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
              >
                📁 حذف السجل فقط (إبقاء التمارين)
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: بيانات العضو الجديد */}
      {newMemberCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-green-700/50 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg text-center">✅ تم إضافة العضو</h3>
            <p className="text-sm text-gray-400 text-center">احتفظ ببيانات الدخول وشاركها مع العضو</p>
            <div className="bg-gray-800 rounded-xl p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الاسم</span>
                <span className="text-white">{newMemberCredentials.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">اسم المستخدم</span>
                <span className="text-green-400">{newMemberCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">كلمة المرور</span>
                <span className="text-orange-400">{newMemberCredentials.password}</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const text = `🏋️ بيانات دخول منصة المطانيخ CrossFit\n\nالاسم: ${newMemberCredentials.nameAr}\nاسم المستخدم: ${newMemberCredentials.username}\nكلمة المرور: ${newMemberCredentials.password}\n\n📱 الرابط: ${window.location.origin}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.547 5.874L0 24l6.304-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.358-.214-3.742.904.938-3.64-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
              إرسال عبر واتساب
            </button>
            <button onClick={() => setNewMemberCredentials(null)}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




