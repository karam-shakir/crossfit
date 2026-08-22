'use client';
import { useState, useMemo, useEffect, useContext, createContext } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const GymExerciseProgressChart = dynamic(() => import('@/components/charts/GymExerciseProgressChart'), {
  ssr: false,
  loading: () => <div className="h-[150px] bg-slate-50 rounded-xl animate-pulse" />,
});

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; emoji: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ',  emoji: '🟢', active: 'bg-green-600 text-white shadow-lg shadow-green-900/40',    idle: 'bg-green-50 text-green-700 border border-green-300' },
  { key: 'intermediate', label: 'متوسط',  emoji: '🔵', active: 'bg-blue-600 text-white shadow-lg shadow-blue-900/40',     idle: 'bg-blue-50 text-blue-700 border border-blue-300' },
  { key: 'advanced',     label: 'متقدم',  emoji: '🟠', active: 'bg-orange-500 text-white shadow-lg shadow-orange-900/40', idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'محترف',  emoji: '🔴', active: 'bg-red-600 text-white shadow-lg shadow-red-900/40',       idle: 'bg-red-50 text-red-700 border border-red-300' },
];

const SPLIT_THEME: Record<string, { accent: string; badge: string; icon: string }> = {
  Push:       { accent: 'bg-orange-500',   badge: 'bg-orange-100 text-orange-700 border border-orange-200',   icon: '🟠' },
  Pull:       { accent: 'bg-blue-500',     badge: 'bg-blue-100 text-blue-700 border border-blue-200',         icon: '🔵' },
  Legs:       { accent: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: '🟢' },
  Upper:      { accent: 'bg-violet-500',   badge: 'bg-violet-100 text-violet-700 border border-violet-200',   icon: '🟣' },
  Lower:      { accent: 'bg-amber-500',    badge: 'bg-amber-100 text-amber-700 border border-amber-200',      icon: '🟡' },
  'Full Body':{ accent: 'bg-indigo-500',   badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',   icon: '🔷' },
  Rest:       { accent: 'bg-slate-300',    badge: 'bg-slate-100 text-slate-500 border border-slate-200',      icon: '😴' },
};

// روابط شرح لكل جهاز معروف بمكتبة الأساس — بلا أي علامة تجارية، تصلح لأي صالة. لأي تمرين مضاف عبر
// لوحة التحكم لاحقاً وغير موجود هنا، انظر دالة ytFallback أدناه (بحث عام باسم التمرين الإنجليزي)
const MACHINE_YOUTUBE: Record<string, string> = {
  'leg-press':        'https://www.youtube.com/results?search_query=leg+press+machine+how+to+use+proper+form',
  'leg-extension':    'https://www.youtube.com/results?search_query=leg+extension+machine+how+to+use',
  'leg-curl':         'https://www.youtube.com/results?search_query=leg+curl+machine+how+to+use',
  'hack-squat':       'https://www.youtube.com/results?search_query=hack+squat+machine+proper+form',
  'hip-thrust':       'https://www.youtube.com/results?search_query=hip+thrust+machine+glute+how+to+use',
  'calf-raise':       'https://www.youtube.com/results?search_query=calf+raise+machine+how+to+use',
  'lat-pulldown':     'https://www.youtube.com/results?search_query=lat+pulldown+how+to+use+proper+form',
  'seated-row':       'https://www.youtube.com/results?search_query=seated+cable+row+machine+proper+form',
  'cable-row':        'https://www.youtube.com/results?search_query=cable+row+machine+back+how+to+use',
  'chest-press':      'https://www.youtube.com/results?search_query=chest+press+machine+how+to+use',
  'pec-deck':         'https://www.youtube.com/results?search_query=pec+deck+machine+chest+fly+how+to+use',
  'cable-fly':        'https://www.youtube.com/results?search_query=cable+crossover+fly+chest+how+to+use',
  'shoulder-press':   'https://www.youtube.com/results?search_query=shoulder+press+machine+how+to+use',
  'cable-lateral':    'https://www.youtube.com/results?search_query=cable+lateral+raise+shoulder+how+to+use',
  'rear-delt':        'https://www.youtube.com/results?search_query=rear+delt+machine+reverse+fly+how+to+use',
  'bicep-machine':    'https://www.youtube.com/results?search_query=bicep+curl+machine+how+to+use',
  'tricep-pushdown':  'https://www.youtube.com/results?search_query=cable+tricep+pushdown+rope+how+to+use+proper+form',
  'tricep-overhead':  'https://www.youtube.com/results?search_query=overhead+cable+tricep+extension+how+to+use',
  'ab-crunch':        'https://www.youtube.com/results?search_query=ab+crunch+machine+how+to+use',
  'cable-crunch':     'https://www.youtube.com/results?search_query=cable+crunch+abs+how+to+use+proper+form',
  'back-extension':   'https://www.youtube.com/results?search_query=back+extension+machine+lower+back+how+to+use',
  'hip-abduction':    'https://www.youtube.com/results?search_query=hip+abduction+machine+outer+thigh+how+to+use',
  'hip-adduction':    'https://www.youtube.com/results?search_query=hip+adduction+machine+inner+thigh+how+to+use',
  'treadmill':        'https://www.youtube.com/results?search_query=treadmill+how+to+use+settings',
  'bike':             'https://www.youtube.com/results?search_query=stationary+bike+how+to+use',
  'elliptical':       'https://www.youtube.com/results?search_query=elliptical+crosstrainer+how+to+use',
  'rower':            'https://www.youtube.com/results?search_query=rowing+machine+proper+form+technique',
  'barbell-squat':    'https://www.youtube.com/results?search_query=barbell+back+squat+proper+form+tutorial',
  'barbell-deadlift': 'https://www.youtube.com/results?search_query=conventional+deadlift+proper+form+tutorial',
  'barbell-bench':    'https://www.youtube.com/results?search_query=barbell+bench+press+proper+form+tutorial',
  'barbell-row':      'https://www.youtube.com/results?search_query=bent+over+barbell+row+proper+form+tutorial',
  'barbell-ohp':      'https://www.youtube.com/results?search_query=overhead+press+barbell+proper+form+tutorial',
  'smith-squat':      'https://www.youtube.com/results?search_query=smith+machine+squat+how+to+use+proper+form',
  'smith-bench':      'https://www.youtube.com/results?search_query=smith+machine+bench+press+how+to+use',
  'dumbbell-curl':    'https://www.youtube.com/results?search_query=dumbbell+bicep+curl+proper+form+tutorial',
  'dumbbell-extension':'https://www.youtube.com/results?search_query=dumbbell+tricep+overhead+extension+proper+form',
  'dumbbell-lateral': 'https://www.youtube.com/results?search_query=dumbbell+lateral+raise+proper+form+tutorial',
  'dumbbell-fly':     'https://www.youtube.com/results?search_query=dumbbell+chest+fly+proper+form+tutorial',
  'dumbbell-row':     'https://www.youtube.com/results?search_query=single+arm+dumbbell+row+proper+form+tutorial',
};

function ytFallback(nameEn: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(nameEn + ' gym exercise how to use proper form')}`;
}

// روابط شرح من كتالوج الجيم (لوحة التحكم) — مصدر الحقيقة الأساسي، يتفوّق على الخريطة الثابتة MACHINE_YOUTUBE
// أعلاه لأي جهاز يملك رابطاً مخصصاً محفوظاً؛ يُملأ عبر GymClient ويُقرأ من ExerciseCard بلا تمرير props عبر SessionCard
const GymCatalogYoutubeContext = createContext<Record<string, string>>({});

const GOAL_LABEL: Record<string, string> = {
  weight_loss: 'خسارة الوزن 🔥', muscle_gain: 'بناء العضلة 💪',
  strength: 'القوة 🏋️', general_fitness: 'لياقة عامة ⚡', body_recomp: 'إعادة تشكيل 🎯',
};

const LEVEL_DISPLAY: Record<string, string> = {
  beginner: '🟢 مبتدئ', intermediate: '🔵 متوسط', advanced: '🟠 متقدم', elite: '🔴 محترف',
};

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
}

// يستخرج أول رقم من نص وزن حر مثل "75كجم" أو "22.5 كجم" — لعرضه في الرسم البياني
function parseWeightNumber(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function groupByWeek(sessions: any[]) {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: { key: string; label: string; sessions: any[] }[] = [];
  const seen = new Set<string>();
  for (const s of sorted) {
    const d = new Date(s.date + 'T00:00:00');
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().split('T')[0];
    if (!seen.has(key)) {
      seen.add(key);
      const weekNum = weeks.length + 1;
      const end = new Date(monday); end.setDate(monday.getDate() + 6);
      const fmt = (dt: Date) => dt.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      weeks.push({ key, label: `الأسبوع ${weekNum} • ${fmt(monday)} – ${fmt(end)}`, sessions: [] });
    }
    weeks[weeks.length - 1].sessions.push(s);
  }
  return weeks;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
    </svg>
  );
}

function ExerciseCard({
  ex, level, index, sessionDate, existingLog, machineLogs, onLogged, onUnlogged,
}: {
  ex: any; level: LevelKey; index: number; sessionDate: string;
  existingLog?: any; machineLogs: any[];
  onLogged: (log: any) => void; onUnlogged: (date: string, machineId: string) => void;
}) {
  const lvl = ex.levels?.[level];
  const [expanded, setExpanded] = useState(false);
  const [manualMode, setManualMode] = useState<'less' | 'more' | null>(null);
  const [manualWeight, setManualWeight] = useState('');
  const [manualReps, setManualReps] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const catalogYoutube = useContext(GymCatalogYoutubeContext);

  async function submitLog(comparison: 'same' | 'less' | 'more', actualWeight?: string, actualReps?: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/gym/exercise-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: sessionDate, machineId: ex.machineId, level,
          suggestedWeight: lvl?.weight || '', suggestedReps: lvl?.reps || '',
          actualWeight, actualReps, comparison,
        }),
      });
      if (res.ok) {
        const log = await res.json();
        onLogged(log);
        setExpanded(false); setManualMode(null); setManualWeight(''); setManualReps('');
      }
    } finally {
      setSaving(false);
    }
  }

  async function unlog() {
    setSaving(true);
    try {
      const res = await fetch(`/api/gym/exercise-log?date=${sessionDate}&machineId=${ex.machineId}`, { method: 'DELETE' });
      if (res.ok) onUnlogged(sessionDate, ex.machineId);
    } finally {
      setSaving(false);
    }
  }

  const trendData = useMemo(() => {
    return [...machineLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => ({ date: l.date.slice(5), value: parseWeightNumber(l.actualWeight), comparison: l.comparison }))
      .filter((d): d is { date: string; value: number; comparison: string } => d.value !== null);
  }, [machineLogs]);
  const suggestedNum = parseWeightNumber(lvl?.weight);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Header */}
      <div className="px-3.5 py-3.5 flex items-start gap-3">
        <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-700">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-800 text-[15px] leading-tight">{ex.nameAr}</div>
              <div className="text-xs text-slate-500 mt-0.5">{ex.nameEn}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {trendData.length >= 2 && (
                <button onClick={() => setShowTrend(t => !t)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${showTrend ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                  📈 تطوري
                </button>
              )}
              <a href={catalogYoutube[ex.machineId] || MACHINE_YOUTUBE[ex.machineId] || ytFallback(ex.nameEn)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                <YoutubeIcon />
                <span>شرح</span>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
              💪 {ex.muscleGroup}
            </span>
            <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
              {ex.sets} مجموعات
            </span>
          </div>
        </div>
      </div>

      {/* Progress trend */}
      {showTrend && trendData.length >= 2 && (
        <div className="mx-3 mb-3 rounded-xl bg-indigo-50/50 border border-indigo-200 p-3">
          <div className="text-xs text-indigo-700 font-bold mb-2">📈 الوزن الفعلي عبر الوقت (الخط المتقطع = المقترح الحالي)</div>
          <GymExerciseProgressChart data={trendData} suggestedValue={suggestedNum ?? undefined} />
        </div>
      )}

      {/* Stats */}
      {lvl && (
        <div className="mx-3 mb-3 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-200">
            <div className="text-center py-3.5 px-2">
              <div className="text-xs text-slate-500 mb-1.5 font-medium">الوزن</div>
              <div className="text-xl font-extrabold text-blue-600 leading-none">{lvl.weight}</div>
            </div>
            <div className="text-center py-3.5 px-2">
              <div className="text-xs text-slate-500 mb-1.5 font-medium">التكرارات</div>
              <div className="text-xl font-extrabold text-orange-600 leading-none">{lvl.reps}</div>
            </div>
            <div className="text-center py-3.5 px-2">
              <div className="text-xs text-slate-500 mb-1.5 font-medium">الراحة</div>
              <div className="text-xl font-extrabold text-teal-600 leading-none">{lvl.rest}</div>
            </div>
          </div>
          {lvl.cue && (
            <div className="border-t border-amber-200 px-3 py-3 bg-amber-50 flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">💬</span>
              <span className="text-sm text-amber-800 leading-relaxed font-medium">{lvl.cue}</span>
            </div>
          )}

          {/* توثيق الإنجاز الفعلي — اختياري */}
          <div className="border-t border-slate-200 p-3">
            {existingLog ? (
              <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border ${
                existingLog.comparison === 'more' ? 'bg-emerald-50 border-emerald-200' :
                existingLog.comparison === 'less' ? 'bg-amber-50 border-amber-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <button onClick={unlog} disabled={saving}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold px-1.5 flex-shrink-0">✕</button>
                <div className="text-right flex-1 min-w-0">
                  <span className={`text-sm font-bold ${
                    existingLog.comparison === 'more' ? 'text-emerald-700' :
                    existingLog.comparison === 'less' ? 'text-amber-700' : 'text-slate-700'
                  }`}>
                    ✅ أنجزت — {existingLog.actualWeight} × {existingLog.actualReps}
                  </span>
                  {existingLog.comparison === 'more' && <span className="text-emerald-600 text-xs mr-2">⬆ أعلى من المقترح</span>}
                  {existingLog.comparison === 'less' && <span className="text-amber-600 text-xs mr-2">⬇ أقل من المقترح</span>}
                </div>
              </div>
            ) : !expanded ? (
              <button onClick={() => setExpanded(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all">
                ✅ سجّل إنجازك (اختياري)
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setManualMode('less')} disabled={saving}
                    className={`py-2 rounded-xl border text-sm font-bold transition-all ${manualMode === 'less' ? 'bg-amber-500 text-white border-transparent' : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'}`}>
                    ⬇ أقل
                  </button>
                  <button onClick={() => submitLog('same')} disabled={saving}
                    className="py-2 rounded-xl border bg-slate-100 border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all">
                    = نفسه
                  </button>
                  <button onClick={() => setManualMode('more')} disabled={saving}
                    className={`py-2 rounded-xl border text-sm font-bold transition-all ${manualMode === 'more' ? 'bg-emerald-600 text-white border-transparent' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'}`}>
                    ⬆ أكثر
                  </button>
                </div>
                {manualMode && (
                  <div className="flex gap-2 items-center">
                    <input value={manualWeight} onChange={e => setManualWeight(e.target.value)} placeholder="الوزن الفعلي"
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-400" />
                    <input value={manualReps} onChange={e => setManualReps(e.target.value)} placeholder="التكرار الفعلي"
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-400" />
                    <button onClick={() => submitLog(manualMode, manualWeight, manualReps)} disabled={saving || !manualWeight}
                      className="flex-shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white text-sm font-bold">
                      حفظ
                    </button>
                  </div>
                )}
                <button onClick={() => { setExpanded(false); setManualMode(null); }} className="text-xs text-slate-400 hover:text-slate-600">إلغاء</button>
              </div>
            )}
          </div>
        </div>
      )}

      {ex.notes && (
        <div className="px-4 pb-3.5 text-sm text-slate-600 flex items-start gap-1.5 leading-relaxed">
          <span className="flex-shrink-0">📌</span><span>{ex.notes}</span>
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, isToday, logs, onLogged, onUnlogged }: {
  s: any; isToday: boolean; logs: any[];
  onLogged: (log: any) => void; onUnlogged: (date: string, machineId: string) => void;
}) {
  const [open, setOpen] = useState(isToday && !s.isRest);
  const [level, setLevel] = useState<LevelKey>('intermediate');
  const [bulkSaving, setBulkSaving] = useState(false);
  const isRest = s.isRest;
  const splitKey = s.splitType?.split(' ')[0] || 'Full Body';
  const theme = SPLIT_THEME[splitKey] || SPLIT_THEME['Full Body'];

  const logsByKey = useMemo(() => {
    const map: Record<string, any> = {};
    logs.forEach(l => { map[`${l.date}__${l.machineId}`] = l; });
    return map;
  }, [logs]);
  const logsByMachine = useMemo(() => {
    const map: Record<string, any[]> = {};
    logs.forEach(l => { (map[l.machineId] ||= []).push(l); });
    return map;
  }, [logs]);

  const unloggedExercises = (s.exercises || []).filter((ex: any) => !logsByKey[`${s.date}__${ex.machineId}`] && ex.levels?.[level]);

  async function markAllSuggested() {
    setBulkSaving(true);
    try {
      for (const ex of unloggedExercises) {
        const lvl = ex.levels[level];
        const res = await fetch('/api/gym/exercise-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: s.date, machineId: ex.machineId, level,
            suggestedWeight: lvl.weight, suggestedReps: lvl.reps,
            comparison: 'same',
          }),
        });
        if (res.ok) onLogged(await res.json());
      }
    } finally {
      setBulkSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}>
      {/* Colored accent top bar */}
      <div className={`h-1.5 ${theme.accent}`} />

      {/* Today badge */}
      {isToday && (
        <div className="bg-indigo-600 text-white text-sm font-bold text-center py-2 tracking-widest">
          ✨ تمرين اليوم
        </div>
      )}
      {/* Intensity badge */}
      {!isRest && s.intensity && (
        <div className={`text-sm font-bold text-center py-1.5 ${
          s.intensity === 'Heavy'    ? 'bg-red-500 text-white' :
          s.intensity === 'Moderate' ? 'bg-amber-500 text-white' :
          s.intensity === 'Light'    ? 'bg-emerald-500 text-white' :
          s.intensity === 'Cardio'   ? 'bg-sky-500 text-white' : 'hidden'
        }`}>
          {s.intensity === 'Heavy' ? '🔴 شدة عالية' : s.intensity === 'Moderate' ? '🟡 شدة متوسطة' : s.intensity === 'Light' ? '🟢 خفيف / حجم' : s.intensity === 'Cardio' ? '🔵 كارديو' : ''}
        </div>
      )}

      {/* Card header */}
      <button
        onClick={() => !isRest && setOpen(o => !o)}
        className={`w-full px-4 py-3.5 text-right flex items-center gap-3 ${!isRest ? 'active:bg-black/5 cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-2xl flex-shrink-0">{theme.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-extrabold text-slate-800 text-[17px] leading-tight">{s.dayName}</span>
            <span className="text-xs text-slate-500">{new Date(s.date + 'T00:00:00').toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {!isRest && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {s.splitType}
              </span>
            )}
            {isRest ? (
              <span className="text-sm text-slate-500">😴 يوم راحة</span>
            ) : s.title ? (
              <span className="text-xs text-slate-600 leading-relaxed line-clamp-1">{s.title}</span>
            ) : null}
          </div>
        </div>
        {!isRest && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {s.exercises?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-center min-w-[36px] shadow-sm">
                <div className="text-sm font-bold text-slate-800 leading-none">{s.exercises.length}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">تمرين</div>
              </div>
            )}
            {s.duration && (
              <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-center min-w-[36px] shadow-sm">
                <div className="text-sm font-bold text-slate-800 leading-none">{s.duration}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">دقيقة</div>
              </div>
            )}
            <div className="text-slate-400">
              <ChevronIcon open={open} />
            </div>
          </div>
        )}
      </button>

      {/* Expanded content */}
      {open && !isRest && (
        <div className="border-t border-slate-200 space-y-5 p-4">

          {/* Session notes */}
          {s.notes && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-base flex-shrink-0">📋</span>
              <p className="text-[15px] text-slate-700 leading-relaxed">{s.notes}</p>
            </div>
          )}

          {/* Level selector */}
          <div>
            <p className="text-sm text-gray-400 mb-3 font-medium">اختر مستواك لعرض الأوزان المناسبة:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LEVEL_TABS.map(t => (
                <button key={t.key} onClick={() => setLevel(t.key)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${level === t.key ? t.active : t.idle}`}>
                  <div className="text-lg">{t.emoji}</div>
                  <div className="mt-1">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Warmup */}
          {s.warmup?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-[15px] font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🔆</span> الإحماء
              </h4>
              <ol className="space-y-2 list-none">
                {s.warmup.map((w: string, i: number) => (
                  <li key={i} className="flex items-baseline gap-2.5 text-right">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center font-bold leading-none">{i + 1}</span>
                    <span className="flex-1 text-[14px] text-slate-700 leading-relaxed break-words">{w}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <h4 className="text-[15px] font-bold text-blue-700 flex items-center gap-2">
                  <span className="text-xl">💪</span>
                  <span>التمارين</span>
                  <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold">
                    {s.exercises.length} تمرين
                  </span>
                </h4>
                {unloggedExercises.length > 0 && (
                  <button onClick={markAllSuggested} disabled={bulkSaving}
                    className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                    {bulkSaving ? '⏳ جارٍ الحفظ...' : '✅ أنجزت الكل بالمقترح'}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {s.exercises.map((ex: any, i: number) => (
                  <ExerciseCard key={i} ex={ex} level={level} index={i}
                    sessionDate={s.date}
                    existingLog={logsByKey[`${s.date}__${ex.machineId}`]}
                    machineLogs={logsByMachine[ex.machineId] || []}
                    onLogged={onLogged} onUnlogged={onUnlogged}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.length > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <h4 className="text-[15px] font-bold text-teal-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🧘</span> التهدئة والإطالة
              </h4>
              <ol className="space-y-2 list-none">
                {s.cooldown.map((c: string, i: number) => (
                  <li key={i} className="flex items-baseline gap-2.5 text-right">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] flex items-center justify-center font-bold leading-none">{i + 1}</span>
                    <span className="flex-1 text-[14px] text-slate-700 leading-relaxed break-words">{c}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Coach note */}
          {s.coachNote && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🧠</span>
              <div>
                <div className="text-sm text-indigo-700 font-bold mb-1.5">ملاحظة المدرب</div>
                <p className="text-[15px] text-slate-700 leading-relaxed">{s.coachNote}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GymClient({ member, profile, sessions }: { member: any; profile: any; sessions: any[] }) {
  const today = todayStr();
  const weeks = useMemo(() => groupByWeek(sessions), [sessions]);

  const todayWeekIdx = useMemo(() => {
    return weeks.findIndex(w => w.sessions.some(s => s.date === today));
  }, [weeks, today]);

  const [activeWeek, setActiveWeek] = useState(() => todayWeekIdx >= 0 ? todayWeekIdx : 0);
  const currentSessions = weeks[activeWeek]?.sessions || [];

  const totalExercises = currentSessions.reduce((n, s) => n + (s.exercises?.length || 0), 0);
  const trainingDays = currentSessions.filter(s => !s.isRest).length;

  // توثيق الإنجاز الفعلي — اختياري بالكامل
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/gym/exercise-log').then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // روابط الشرح المخصصة من كتالوج الجيم — راجع GymCatalogYoutubeContext أعلاه
  const [catalogYoutube, setCatalogYoutube] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch('/api/gym/catalog').then(r => r.json()).then((list: any[]) => {
      const map: Record<string, string> = {};
      (Array.isArray(list) ? list : []).forEach(e => { if (e.youtube) map[e.id] = e.youtube; });
      setCatalogYoutube(map);
    }).catch(() => {});
  }, []);
  function handleLogged(log: any) {
    setLogs(prev => [log, ...prev.filter(l => !(l.date === log.date && l.machineId === log.machineId))]);
  }
  function handleUnlogged(date: string, machineId: string) {
    setLogs(prev => prev.filter(l => !(l.date === date && l.machineId === machineId)));
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="text-7xl">🏋️</div>
            <h2 className="text-2xl font-extrabold text-white">ابدأ رحلتك في الجيم</h2>
            <p className="text-gray-400 text-base leading-relaxed">
              عبّئ بروفايلك التدريبي وسيقوم المدرب بتصميم جدول أسبوعي مخصص لك بأجهزة الجيم المتوفرة في أي صالة
            </p>
            <Link href="/gym/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-base shadow-lg shadow-indigo-900/40">
              إعداد البروفايل التدريبي →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <GymCatalogYoutubeContext.Provider value={catalogYoutube}>
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-xl leading-tight mb-0.5">
                  🏋️ جدول الجيم
                </h1>
                <p style={{color:'rgba(255,255,255,0.85)'}} className="text-sm font-semibold">{GOAL_LABEL[profile.goal]}</p>
                <p style={{color:'rgba(255,255,255,0.70)'}} className="text-xs mt-0.5">{LEVEL_DISPLAY[profile.level]} • {profile.daysPerWeek} أيام/أسبوع</p>
              </div>
              <Link href="/gym/profile"
                className="flex-shrink-0 text-xs bg-white/20 border border-white/30 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all font-semibold">
                ✏️ البروفايل
              </Link>
            </div>

            {sessions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{trainingDays}</div>
                  <div className="text-[11px] mt-0.5" style={{color:'rgba(255,255,255,0.70)'}}>أيام تمرين</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-2xl font-extrabold text-white">{totalExercises}</div>
                  <div className="text-[11px] mt-0.5" style={{color:'rgba(255,255,255,0.70)'}}>تمرين / أسبوع</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{currentSessions.find(s => s.date === today) ? '🔥' : '📅'}</div>
                  <div className="text-[11px] mt-0.5" style={{color:'rgba(255,255,255,0.70)'}}>
                    {currentSessions.find(s => s.date === today) ? 'اليوم تمرين!' : 'استمر'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="text-6xl">📋</div>
              <p className="text-slate-800 font-bold text-lg">لا يوجد جدول بعد</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                بروفايلك جاهز ✅ — انتظر المدرب ليولّد لك جدولك الأسبوعي المخصص
              </p>
            </div>
          ) : (
            <>
              {/* Week tabs */}
              {weeks.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium px-1">اختر الأسبوع:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {weeks.map((w, i) => {
                      const hasToday = w.sessions.some(s => s.date === today);
                      return (
                        <button key={i} onClick={() => setActiveWeek(i)}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                            activeWeek === i
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                              : 'bg-white text-slate-600 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
                          }`}>
                          {hasToday && <span className="ml-1">🔥</span>}
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sessions */}
              <div className="space-y-3">
                {currentSessions.map((s, i) => (
                  <SessionCard key={i} s={s} isToday={s.date === today}
                    logs={logs} onLogged={handleLogged} onUnlogged={handleUnlogged} />
                ))}
              </div>

              {/* Week summary */}
              {weeks[activeWeek] && (
                <div className="text-center py-2 text-xs text-gray-600">
                  {trainingDays} أيام تمرين • {currentSessions.filter(s => s.isRest).length} أيام راحة
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
    </GymCatalogYoutubeContext.Provider>
  );
}
