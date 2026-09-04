'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Hand, Anchor, Footprints, PersonStanding, Box, Dumbbell, RefreshCw, Moon,
  Building2, Flame, TrendingUp, MessageCircle, X, CheckCircle2, ArrowUp,
  ArrowDown, Pin, Sparkles, ClipboardList, Sun, Wind, Brain, Loader2,
  Target, Calendar, PenLine,
} from 'lucide-react';

const CalisthenicsProgressChart = dynamic(() => import('@/components/charts/CalisthenicsProgressChart'), {
  ssr: false,
  loading: () => <div className="h-[150px] bg-slate-50 rounded-xl animate-pulse" />,
});

// مفتاح ثابت لمطابقة السجل عبر الأسابيع — يفضّل exerciseKey القادم من الـ AI، وإلا يُطبَّع من nameEn (توافق مع الجلسات القديمة)
function getExerciseKey(ex: any): string {
  if (ex.exerciseKey) return ex.exerciseKey;
  return (ex.nameEn || ex.name || 'exercise').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// يستخرج رقماً تمثيلياً من نص حر: مدة ثبات بالثواني إن وُجدت، وإلا أعلى رقم تكرار (نطاق مثل 8-12 يُقرأ 12)
function parseRepsOrHold(s: string | undefined): { value: number; unit: string } | null {
  if (!s) return null;
  const secMatch = s.match(/(\d+)\s*ث/);
  if (secMatch) return { value: parseInt(secMatch[1]), unit: 'ثانية' };
  const nums = s.match(/\d+/g);
  if (nums?.length) return { value: parseInt(nums[nums.length - 1]), unit: 'تكرار' };
  return null;
}

// رابط بحث يوتيوب لشرح التمرين — التمارين هنا نص حر مولَّد وليست من كتالوج ثابت، فبحث ديناميكي يغطي الكل دائماً
function ytLink(ex: any): string {
  const q = ex.nameEn || ex.name || 'calisthenics exercise';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' calisthenics tutorial')}`;
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
    </svg>
  );
}

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; dot: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', dot: 'bg-green-500',  active: 'bg-green-600 text-white shadow-lg',  idle: 'bg-green-50 text-green-700 border border-green-300' },
  { key: 'intermediate', label: 'متوسط', dot: 'bg-blue-500',   active: 'bg-blue-600 text-white shadow-lg',   idle: 'bg-blue-50 text-blue-700 border border-blue-300' },
  { key: 'advanced',     label: 'متقدم', dot: 'bg-orange-500', active: 'bg-orange-500 text-white shadow-lg', idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'نخبة',  dot: 'bg-red-500',    active: 'bg-red-600 text-white shadow-lg',    idle: 'bg-red-50 text-red-700 border border-red-300' },
];

const TYPE_THEME: Record<string, { accent: string; badge: string; icon: any; label: string }> = {
  Push:      { accent: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700 border border-orange-200',   icon: Hand,           label: 'دفع' },
  Pull:      { accent: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700 border border-blue-200',         icon: Anchor,         label: 'سحب' },
  Legs:      { accent: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: Footprints,     label: 'أرجل' },
  Skills:    { accent: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700 border border-violet-200',   icon: PersonStanding, label: 'مهارات' },
  Core:      { accent: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 border border-amber-200',      icon: Box,            label: 'جذع' },
  FullBody:  { accent: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',   icon: Dumbbell,       label: 'كامل الجسم' },
  Endurance: { accent: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700 border border-rose-200',         icon: RefreshCw,      label: 'تحمل' },
  Rest:      { accent: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-500 border border-slate-200',      icon: Moon,           label: 'راحة' },
};

const GOAL_LABEL: Record<string, string> = {
  strength: 'قوة بوزن الجسم', skills: 'مهارات', muscle_gain: 'بناء عضلي',
  endurance: 'تحمل عضلي', fat_burn: 'حرق الدهون',
};
const GOAL_ICON: Record<string, any> = {
  strength: Dumbbell, skills: PersonStanding, muscle_gain: Building2,
  endurance: RefreshCw, fat_burn: Flame,
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'نخبة',
};
const LEVEL_DOT: Record<string, string> = {
  beginner: 'bg-green-500', intermediate: 'bg-blue-500', advanced: 'bg-orange-500', elite: 'bg-red-500',
};

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
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

function ExerciseCard({
  ex, level, index, isSkill, sessionDate, existingLog, exerciseLogs, onLogged, onUnlogged,
}: {
  ex: any; level: LevelKey; index: number; isSkill?: boolean; sessionDate: string;
  existingLog?: any; exerciseLogs: any[];
  onLogged: (log: any) => void; onUnlogged: (date: string, exerciseKey: string) => void;
}) {
  const lvl = ex.levels?.[level];
  const exerciseKey = getExerciseKey(ex);
  const [expanded, setExpanded] = useState(false);
  const [manualMode, setManualMode] = useState<'easier' | 'harder' | null>(null);
  const [manualVariation, setManualVariation] = useState('');
  const [manualReps, setManualReps] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  async function submitLog(comparison: 'as_suggested' | 'easier' | 'harder', actualVariation?: string, actualReps?: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/calisthenics/exercise-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: sessionDate, exerciseKey, level,
          movementType: ex.type, isSkillWork: !!isSkill,
          suggestedVariation: lvl?.variation || '', suggestedReps: lvl?.reps || '',
          actualVariation, actualReps, comparison,
        }),
      });
      if (res.ok) {
        const log = await res.json();
        onLogged(log);
        setExpanded(false); setManualMode(null); setManualVariation(''); setManualReps('');
      }
    } finally {
      setSaving(false);
    }
  }

  async function unlog() {
    setSaving(true);
    try {
      const res = await fetch(`/api/calisthenics/exercise-log?date=${sessionDate}&exerciseKey=${exerciseKey}`, { method: 'DELETE' });
      if (res.ok) onUnlogged(sessionDate, exerciseKey);
    } finally {
      setSaving(false);
    }
  }

  const trendData = useMemo(() => {
    return [...exerciseLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => {
        const parsed = parseRepsOrHold(l.actualReps);
        return parsed ? { date: l.date.slice(5), value: parsed.value, unit: parsed.unit, variation: l.actualVariation } : null;
      })
      .filter((d): d is { date: string; value: number; unit: string; variation: string } => d !== null);
  }, [exerciseLogs]);
  const trendUnit = trendData[trendData.length - 1]?.unit || 'تكرار';

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border shadow-sm ${isSkill ? 'border-violet-200' : 'border-slate-200'}`}>
      <div className="px-3.5 py-3 flex items-start gap-3">
        <span className={`mt-0.5 w-7 h-7 flex-shrink-0 rounded-full border flex items-center justify-center text-xs font-bold ${isSkill ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-emerald-100 border-emerald-300 text-emerald-700'}`}>
          {isSkill ? <PersonStanding className="w-4 h-4" /> : index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-800 text-[15px] leading-tight">{ex.name}</div>
              <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{ex.nameEn}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {trendData.length >= 2 && (
                <button onClick={() => setShowTrend(t => !t)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${showTrend ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}>
                  <TrendingUp className="w-4 h-4" /> تطوري
                </button>
              )}
              <a href={ytLink(ex)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                <YoutubeIcon />
                <span>شرح</span>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {ex.targetMuscles && (
              <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1">
                <Dumbbell className="w-4 h-4" /> {ex.targetMuscles}
              </span>
            )}
            {ex.sets > 0 && (
              <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
                {ex.sets} مجموعات
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress trend */}
      {showTrend && trendData.length >= 2 && (
        <div className="mx-3 mb-3 rounded-xl bg-violet-50/50 border border-violet-200 p-3">
          <div className="text-xs text-violet-700 font-bold mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {trendUnit === 'ثانية' ? 'مدة الثبات' : 'التكرارات'} الفعلية عبر الوقت</div>
          <CalisthenicsProgressChart data={trendData} unitLabel={trendUnit} />
        </div>
      )}

      {lvl && (
        <div className="mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
          {/* التدرج المناسب للمستوى */}
          <div className={`px-3 py-2.5 border-b ${isSkill ? 'bg-violet-50 border-violet-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="text-[11px] text-slate-500 font-medium mb-0.5">التدرج المناسب لمستواك:</div>
            <div className={`text-sm font-extrabold ${isSkill ? 'text-violet-700' : 'text-emerald-700'}`}>{lvl.variation}</div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-200">
            <div className="text-center py-3 px-1.5">
              <div className="text-[11px] text-slate-500 mb-1 font-medium">التكرارات</div>
              <div className="text-sm font-extrabold text-orange-600 leading-tight">{lvl.reps}</div>
            </div>
            <div className="text-center py-3 px-1.5">
              <div className="text-[11px] text-slate-500 mb-1 font-medium">الراحة</div>
              <div className="text-sm font-extrabold text-teal-600 leading-tight">{lvl.rest}</div>
            </div>
          </div>
          {lvl.cue && (
            <div className="border-t border-amber-200 px-3 py-2.5 bg-amber-50 flex items-start gap-2">
              <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span className="text-[13px] text-amber-800 leading-relaxed font-medium">{lvl.cue}</span>
            </div>
          )}

          {/* توثيق الإنجاز الفعلي — اختياري */}
          <div className="border-t border-slate-200 p-3">
            {existingLog ? (
              <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border ${
                existingLog.comparison === 'harder' ? 'bg-emerald-50 border-emerald-200' :
                existingLog.comparison === 'easier' ? 'bg-amber-50 border-amber-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <button onClick={unlog} disabled={saving}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold px-1.5 flex-shrink-0"><X className="w-4 h-4" /></button>
                <div className="text-right flex-1 min-w-0">
                  <span className={`text-sm font-bold inline-flex items-center gap-1 ${
                    existingLog.comparison === 'harder' ? 'text-emerald-700' :
                    existingLog.comparison === 'easier' ? 'text-amber-700' : 'text-slate-700'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> أنجزت — {existingLog.actualVariation} ({existingLog.actualReps})
                  </span>
                  {existingLog.comparison === 'harder' && <span className="text-emerald-600 text-xs mr-2 inline-flex items-center gap-0.5"><ArrowUp className="w-3.5 h-3.5" /> أصعب من المقترح</span>}
                  {existingLog.comparison === 'easier' && <span className="text-amber-600 text-xs mr-2 inline-flex items-center gap-0.5"><ArrowDown className="w-3.5 h-3.5" /> أسهل من المقترح</span>}
                </div>
              </div>
            ) : !expanded ? (
              <button onClick={() => setExpanded(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-violet-400 hover:text-violet-600 transition-all inline-flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> سجّل إنجازك (اختياري)
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setManualMode('easier')} disabled={saving}
                    className={`py-2 rounded-xl border text-sm font-bold transition-all inline-flex items-center justify-center gap-1 ${manualMode === 'easier' ? 'bg-amber-500 text-white border-transparent' : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'}`}>
                    <ArrowDown className="w-4 h-4" /> أسهل
                  </button>
                  <button onClick={() => submitLog('as_suggested', lvl.variation, lvl.reps)} disabled={saving}
                    className="py-2 rounded-xl border bg-slate-100 border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all">
                    = كما هو مقترح
                  </button>
                  <button onClick={() => setManualMode('harder')} disabled={saving}
                    className={`py-2 rounded-xl border text-sm font-bold transition-all inline-flex items-center justify-center gap-1 ${manualMode === 'harder' ? 'bg-emerald-600 text-white border-transparent' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'}`}>
                    <ArrowUp className="w-4 h-4" /> أصعب
                  </button>
                </div>
                {manualMode && (
                  <div className="flex gap-2 items-center">
                    <input value={manualVariation} onChange={e => setManualVariation(e.target.value)} placeholder="التدرّج الفعلي (مثال: ضغط عادي)"
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-400" />
                    <input value={manualReps} onChange={e => setManualReps(e.target.value)} placeholder={isSkill ? 'مدة الثبات' : 'التكرار الفعلي'}
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-400" />
                    <button onClick={() => submitLog(manualMode, manualVariation, manualReps)} disabled={saving || !manualVariation}
                      className="flex-shrink-0 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 text-white text-sm font-bold">
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
        <div className="px-4 pb-3 text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
          <Pin className="w-4 h-4 flex-shrink-0" /><span>{ex.notes}</span>
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, isToday, logs, onLogged, onUnlogged }: {
  s: any; isToday: boolean; logs: any[];
  onLogged: (log: any) => void; onUnlogged: (date: string, exerciseKey: string) => void;
}) {
  const [open, setOpen] = useState(isToday && !s.isRest);
  const [level, setLevel] = useState<LevelKey>('intermediate');
  const [bulkSaving, setBulkSaving] = useState(false);
  const isRest = s.isRest;
  const theme = TYPE_THEME[s.sessionType] || TYPE_THEME['FullBody'];

  const logsByKey = useMemo(() => {
    const map: Record<string, any> = {};
    logs.forEach(l => { map[`${l.date}__${l.exerciseKey}`] = l; });
    return map;
  }, [logs]);
  const logsByExercise = useMemo(() => {
    const map: Record<string, any[]> = {};
    logs.forEach(l => { (map[l.exerciseKey] ||= []).push(l); });
    return map;
  }, [logs]);

  const allSessionExercises = [...(s.skillWork || []).map((ex: any) => ({ ...ex, isSkill: true })), ...(s.exercises || [])];
  const unloggedExercises = allSessionExercises.filter((ex: any) => !logsByKey[`${s.date}__${getExerciseKey(ex)}`] && ex.levels?.[level]);

  async function markAllSuggested() {
    setBulkSaving(true);
    try {
      for (const ex of unloggedExercises) {
        const lvl = ex.levels[level];
        const res = await fetch('/api/calisthenics/exercise-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: s.date, exerciseKey: getExerciseKey(ex), level,
            movementType: ex.type, isSkillWork: !!ex.isSkill,
            suggestedVariation: lvl.variation, suggestedReps: lvl.reps,
            actualVariation: lvl.variation, actualReps: lvl.reps,
            comparison: 'as_suggested',
          }),
        });
        if (res.ok) onLogged(await res.json());
      }
    } finally {
      setBulkSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
      <div className={`h-1.5 ${theme.accent}`} />

      {isToday && (
        <div className="bg-emerald-600 text-white text-sm font-bold text-center py-2 tracking-widest inline-flex items-center justify-center gap-1.5 w-full">
          <Sparkles className="w-4 h-4" /> جلسة اليوم
        </div>
      )}

      {!isRest && s.intensity && (
        <div className={`text-sm font-bold text-center py-1.5 inline-flex items-center justify-center gap-1.5 w-full ${
          s.intensity === 'Heavy'    ? 'bg-red-500 text-white' :
          s.intensity === 'Moderate' ? 'bg-amber-500 text-white' :
          s.intensity === 'Light'    ? 'bg-emerald-500 text-white' : 'hidden'
        }`}>
          {(s.intensity === 'Heavy' || s.intensity === 'Moderate' || s.intensity === 'Light') && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white/70" />
          )}
          {s.intensity === 'Heavy' ? 'شدة عالية' : s.intensity === 'Moderate' ? 'شدة متوسطة' : s.intensity === 'Light' ? 'خفيف' : ''}
        </div>
      )}

      {/* Card header */}
      <button
        onClick={() => !isRest && setOpen(o => !o)}
        className={`w-full px-4 py-3.5 text-right flex items-center gap-3 ${!isRest ? 'active:bg-black/5 cursor-pointer' : 'cursor-default'}`}
      >
        <theme.icon className="w-6 h-6 flex-shrink-0 text-slate-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-extrabold text-slate-800 text-[17px] leading-tight">{s.dayName}</span>
            <span className="text-xs text-slate-500">{new Date(s.date + 'T00:00:00').toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {!isRest && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                {theme.label}
              </span>
            )}
            {isRest ? (
              <span className="text-sm text-slate-500 inline-flex items-center gap-1"><Moon className="w-4 h-4" /> يوم راحة</span>
            ) : s.title ? (
              <span className="text-xs text-slate-600 leading-relaxed line-clamp-1">{s.title}</span>
            ) : null}
          </div>
        </div>
        {!isRest && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(s.exercises?.length || 0) + (s.skillWork?.length || 0) > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-center min-w-[36px] shadow-sm">
                <div className="text-sm font-bold text-slate-800 leading-none">{(s.exercises?.length || 0) + (s.skillWork?.length || 0)}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">تمرين</div>
              </div>
            )}
            {s.duration > 0 && (
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

          {s.notes && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <ClipboardList className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <p className="text-[14px] text-slate-700 leading-relaxed">{s.notes}</p>
            </div>
          )}

          {/* Level selector */}
          <div>
            <p className="text-sm text-slate-500 mb-3 font-medium">اختر مستواك لعرض التدرجات المناسبة:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LEVEL_TABS.map(t => (
                <button key={t.key} onClick={() => setLevel(t.key)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${level === t.key ? t.active : t.idle}`}>
                  <div className="flex justify-center"><span className={`inline-block w-2.5 h-2.5 rounded-full ${t.dot}`} /></div>
                  <div className="mt-1">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Warmup */}
          {s.warmup?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-[15px] font-bold text-amber-800 mb-3 flex items-center gap-2">
                <Sun className="w-5 h-5" /> الإحماء
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

          {unloggedExercises.length > 0 && (
            <div className="flex justify-end">
              <button onClick={markAllSuggested} disabled={bulkSaving}
                className="text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 inline-flex items-center gap-1.5">
                {bulkSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 className="w-4 h-4" /> أنجزت الكل بالمقترح</>}
              </button>
            </div>
          )}

          {/* Skill Work */}
          {s.skillWork?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-violet-700 mb-3 flex items-center gap-2">
                <PersonStanding className="w-5 h-5" />
                <span>تدريب المهارات</span>
                <span className="bg-violet-100 text-violet-700 border border-violet-200 text-xs px-2.5 py-1 rounded-full font-bold">أول الجلسة</span>
              </h4>
              <div className="space-y-3">
                {s.skillWork.map((ex: any, i: number) => (
                  <ExerciseCard key={i} ex={ex} level={level} index={i} isSkill
                    sessionDate={s.date}
                    existingLog={logsByKey[`${s.date}__${getExerciseKey(ex)}`]}
                    exerciseLogs={logsByExercise[getExerciseKey(ex)] || []}
                    onLogged={onLogged} onUnlogged={onUnlogged}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                <span>التمارين</span>
                <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">
                  {s.exercises.length} تمرين
                </span>
              </h4>
              <div className="space-y-3">
                {s.exercises.map((ex: any, i: number) => (
                  <ExerciseCard key={i} ex={ex} level={level} index={i}
                    sessionDate={s.date}
                    existingLog={logsByKey[`${s.date}__${getExerciseKey(ex)}`]}
                    exerciseLogs={logsByExercise[getExerciseKey(ex)] || []}
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
                <Wind className="w-5 h-5" /> التهدئة والإطالة
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <Brain className="w-6 h-6 flex-shrink-0 text-emerald-600" />
              <div>
                <div className="text-sm text-emerald-700 font-bold mb-1.5">ملاحظة المدرب</div>
                <p className="text-[14px] text-slate-700 leading-relaxed">{s.coachNote}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalisthenicsClient({ member, profile, sessions }: { member: any; profile: any; sessions: any[] }) {
  const today = todayStr();
  const weeks = useMemo(() => groupByWeek(sessions), [sessions]);

  const todayWeekIdx = useMemo(() => {
    return weeks.findIndex(w => w.sessions.some(s => s.date === today));
  }, [weeks, today]);

  const [activeWeek, setActiveWeek] = useState(() => todayWeekIdx >= 0 ? todayWeekIdx : 0);
  const currentSessions = weeks[activeWeek]?.sessions || [];

  const totalExercises = currentSessions.reduce((n, s) => n + (s.exercises?.length || 0) + (s.skillWork?.length || 0), 0);
  const trainDays = currentSessions.filter(s => !s.isRest).length;

  // توثيق الإنجاز الفعلي — اختياري بالكامل
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/calisthenics/exercise-log').then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  function handleLogged(log: any) {
    setLogs(prev => [log, ...prev.filter(l => !(l.date === log.date && l.exerciseKey === log.exerciseKey))]);
  }
  function handleUnlogged(date: string, exerciseKey: string) {
    setLogs(prev => prev.filter(l => !(l.date === date && l.exerciseKey === exerciseKey)));
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <PersonStanding className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">ابدأ رحلة الكاليسثنكس</h2>
            <p className="text-slate-500 text-base leading-relaxed">
              عبّئ بروفايلك (قدراتك الحالية، مهاراتك المستهدفة، معداتك) وسيصمم المدرب برنامجاً أسبوعياً مخصصاً لك بوزن الجسم
            </p>
            <Link href="/calisthenics/profile"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-base shadow-lg shadow-emerald-200">
              إعداد البروفايل →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-emerald-600 rounded-2xl p-5 shadow-lg shadow-emerald-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-xl leading-tight mb-0.5 flex items-center gap-2">
                  <PersonStanding className="w-5 h-5" /> برنامج الكاليسثنكس
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)' }} className="text-sm font-semibold inline-flex items-center gap-1">
                  {GOAL_ICON[profile.goal] && (() => { const GoalIcon = GOAL_ICON[profile.goal]; return <GoalIcon className="w-4 h-4" />; })()}
                  {GOAL_LABEL[profile.goal]}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.70)' }} className="text-xs mt-0.5 inline-flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${LEVEL_DOT[profile.level]}`} />
                  {LEVEL_LABEL[profile.level]} • {profile.daysPerWeek} أيام/أسبوع
                </p>
                {profile.skillGoals?.length > 0 && (
                  <p style={{ color: 'rgba(255,255,255,0.70)' }} className="text-xs mt-0.5 inline-flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {profile.skillGoals.join(' • ')}</p>
                )}
              </div>
              <Link href="/calisthenics/profile"
                className="flex-shrink-0 text-xs bg-white/20 border border-white/30 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all font-semibold inline-flex items-center gap-1.5">
                <PenLine className="w-4 h-4" /> البروفايل
              </Link>
            </div>

            {sessions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{trainDays}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>أيام تدريب</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-2xl font-extrabold text-white">{totalExercises}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>تمرين / أسبوع</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    {currentSessions.find(s => s.date === today)
                      ? <Flame className="w-6 h-6 text-white" />
                      : <Calendar className="w-6 h-6 text-white/70" />}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>
                    {currentSessions.find(s => s.date === today) ? 'اليوم تدريب!' : 'استمر'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-slate-800 font-bold text-lg">لا يوجد برنامج بعد</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto inline-flex items-center gap-1 justify-center">
                بروفايلك جاهز <CheckCircle2 className="w-4 h-4 text-green-500" /> — انتظر المدرب ليولّد لك برنامجك الأسبوعي المخصص
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
                              ? 'bg-emerald-600 text-white shadow-lg'
                              : 'bg-white text-slate-600 border border-slate-300 hover:border-emerald-400'
                          }`}>
                          {hasToday && <Flame className="w-3.5 h-3.5 inline ml-1 text-emerald-500" />}
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sessions */}
              <div className="space-y-3">
                {currentSessions.map((s: any) => (
                  <SessionCard key={s.id || s.date} s={s} isToday={s.date === today}
                    logs={logs} onLogged={handleLogged} onUnlogged={handleUnlogged} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
