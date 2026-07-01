'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; emoji: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ',  emoji: '🟢', active: 'bg-green-600 text-white shadow-lg shadow-green-900/40',    idle: 'bg-green-50 text-green-700 border border-green-300' },
  { key: 'intermediate', label: 'متوسط',  emoji: '🔵', active: 'bg-blue-600 text-white shadow-lg shadow-blue-900/40',     idle: 'bg-blue-50 text-blue-700 border border-blue-300' },
  { key: 'advanced',     label: 'متقدم',  emoji: '🟠', active: 'bg-orange-500 text-white shadow-lg shadow-orange-900/40', idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'محترف',  emoji: '🔴', active: 'bg-red-600 text-white shadow-lg shadow-red-900/40',       idle: 'bg-red-50 text-red-700 border border-red-300' },
];

const SPLIT_THEME: Record<string, { border: string; bg: string; badge: string; glow: string; icon: string }> = {
  Push:       { border: 'border-orange-400/60', bg: 'bg-orange-50/80',   badge: 'bg-orange-100 text-orange-700 border border-orange-300',  glow: 'shadow-orange-100', icon: '🔴' },
  Pull:       { border: 'border-blue-400/60',   bg: 'bg-blue-50/80',     badge: 'bg-blue-100 text-blue-700 border border-blue-300',        glow: 'shadow-blue-100',   icon: '🔵' },
  Legs:       { border: 'border-green-400/60',  bg: 'bg-green-50/80',    badge: 'bg-green-100 text-green-700 border border-green-300',     glow: 'shadow-green-100',  icon: '🟢' },
  Upper:      { border: 'border-purple-400/60', bg: 'bg-purple-50/80',   badge: 'bg-purple-100 text-purple-700 border border-purple-300',  glow: 'shadow-purple-100', icon: '🟣' },
  Lower:      { border: 'border-yellow-400/60', bg: 'bg-yellow-50/80',   badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300',  glow: 'shadow-yellow-100', icon: '🟡' },
  'Full Body':{ border: 'border-indigo-400/60', bg: 'bg-indigo-50/80',   badge: 'bg-indigo-100 text-indigo-700 border border-indigo-300',  glow: 'shadow-indigo-100', icon: '🔷' },
  Rest:       { border: 'border-slate-300',     bg: 'bg-slate-50',       badge: 'bg-slate-100 text-slate-600 border border-slate-300',     glow: '',                  icon: '😴' },
};

const MACHINE_YOUTUBE: Record<string, string> = {
  'leg-press':        'https://www.youtube.com/results?search_query=technogym+leg+press+how+to+use+proper+form',
  'leg-extension':    'https://www.youtube.com/results?search_query=technogym+leg+extension+machine+how+to+use',
  'leg-curl':         'https://www.youtube.com/results?search_query=technogym+leg+curl+machine+how+to+use',
  'hack-squat':       'https://www.youtube.com/results?search_query=hack+squat+machine+proper+form+technogym',
  'hip-thrust':       'https://www.youtube.com/results?search_query=hip+thrust+machine+glute+how+to+use',
  'calf-raise':       'https://www.youtube.com/results?search_query=calf+raise+machine+how+to+use+technogym',
  'lat-pulldown':     'https://www.youtube.com/results?search_query=technogym+lat+pulldown+how+to+use+proper+form',
  'seated-row':       'https://www.youtube.com/results?search_query=seated+cable+row+machine+proper+form+technogym',
  'cable-row':        'https://www.youtube.com/results?search_query=cable+row+machine+back+how+to+use',
  'chest-press':      'https://www.youtube.com/results?search_query=technogym+chest+press+machine+how+to+use',
  'pec-deck':         'https://www.youtube.com/results?search_query=pec+deck+machine+chest+fly+how+to+use+technogym',
  'cable-fly':        'https://www.youtube.com/results?search_query=cable+crossover+fly+chest+how+to+use',
  'shoulder-press':   'https://www.youtube.com/results?search_query=technogym+shoulder+press+machine+how+to+use',
  'cable-lateral':    'https://www.youtube.com/results?search_query=cable+lateral+raise+shoulder+how+to+use',
  'rear-delt':        'https://www.youtube.com/results?search_query=rear+delt+machine+reverse+fly+how+to+use+technogym',
  'bicep-machine':    'https://www.youtube.com/results?search_query=technogym+bicep+curl+machine+how+to+use',
  'tricep-pushdown':  'https://www.youtube.com/results?search_query=cable+tricep+pushdown+rope+how+to+use+proper+form',
  'tricep-overhead':  'https://www.youtube.com/results?search_query=overhead+cable+tricep+extension+how+to+use',
  'ab-crunch':        'https://www.youtube.com/results?search_query=ab+crunch+machine+how+to+use+technogym',
  'cable-crunch':     'https://www.youtube.com/results?search_query=cable+crunch+abs+how+to+use+proper+form',
  'back-extension':   'https://www.youtube.com/results?search_query=back+extension+machine+lower+back+how+to+use',
  'hip-abduction':    'https://www.youtube.com/results?search_query=hip+abduction+machine+outer+thigh+how+to+use+technogym',
  'hip-adduction':    'https://www.youtube.com/results?search_query=hip+adduction+machine+inner+thigh+how+to+use+technogym',
  'treadmill':        'https://www.youtube.com/results?search_query=technogym+treadmill+how+to+use+settings',
  'bike':             'https://www.youtube.com/results?search_query=technogym+stationary+bike+how+to+use',
  'elliptical':       'https://www.youtube.com/results?search_query=technogym+elliptical+crosstrainer+how+to+use',
  'rower':            'https://www.youtube.com/results?search_query=technogym+rowing+machine+proper+form+technique',
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

function ExerciseCard({ ex, level, index }: { ex: any; level: LevelKey; index: number }) {
  const lvl = ex.levels?.[level];
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Header */}
      <div className="px-4 py-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 w-8 h-8 flex-shrink-0 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-sm font-bold text-indigo-700">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-slate-800 text-[16px] leading-tight">{ex.nameAr}</div>
            <div className="text-sm text-slate-500 mt-0.5">{ex.nameEn}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                💪 {ex.muscleGroup}
              </span>
              <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                {ex.sets} مجموعات
              </span>
            </div>
          </div>
        </div>
        {MACHINE_YOUTUBE[ex.machineId] && (
          <a href={MACHINE_YOUTUBE[ex.machineId]} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-red-800 hover:bg-red-700 border border-red-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
            <YoutubeIcon />
            <span>شرح</span>
          </a>
        )}
      </div>

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

function SessionCard({ s, isToday }: { s: any; isToday: boolean }) {
  const [open, setOpen] = useState(isToday && !s.isRest);
  const [level, setLevel] = useState<LevelKey>('intermediate');
  const isRest = s.isRest;
  const splitKey = s.splitType?.split(' ')[0] || 'Full Body';
  const theme = SPLIT_THEME[splitKey] || SPLIT_THEME['Full Body'];

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${theme.border} ${theme.bg} ${isToday ? 'ring-2 ring-indigo-500/80' : ''}`}>
      {/* Today badge */}
      {isToday && (
        <div className="bg-indigo-600 text-white text-base font-bold text-center py-2.5 tracking-wide">
          ✨ تمرين اليوم
        </div>
      )}
      {/* Intensity badge */}
      {!isRest && s.intensity && (
        <div className={`text-sm font-bold text-center py-1.5 ${
          s.intensity === 'Heavy'    ? 'bg-red-800/80 text-red-100' :
          s.intensity === 'Moderate' ? 'bg-orange-800/80 text-orange-100' :
          s.intensity === 'Light'    ? 'bg-green-800/80 text-green-100' :
          s.intensity === 'Cardio'   ? 'bg-blue-800/80 text-blue-100' : 'hidden'
        }`}>
          {s.intensity === 'Heavy' ? '🔴 شدة عالية' : s.intensity === 'Moderate' ? '🟠 شدة متوسطة' : s.intensity === 'Light' ? '🟢 خفيف / حجم' : s.intensity === 'Cardio' ? '🔵 كارديو' : ''}
        </div>
      )}

      {/* Card header */}
      <button
        onClick={() => !isRest && setOpen(o => !o)}
        className={`w-full px-4 py-4 text-right flex items-center justify-between gap-3 ${!isRest ? 'active:bg-white/5 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{theme.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-extrabold text-white text-lg leading-tight">{s.dayName}</span>
              <span className="text-sm text-gray-400">{new Date(s.date + 'T00:00:00').toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!isRest && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${theme.badge}`}>
                  {s.splitType}
                </span>
              )}
              {isRest ? (
                <span className="text-base text-gray-300">😴 يوم راحة — استرح واشرب ماء</span>
              ) : (
                <span className="text-sm text-gray-300 leading-relaxed">{s.title}</span>
              )}
            </div>
          </div>
        </div>
        {!isRest && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {s.exercises?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-center min-w-[44px] shadow-sm">
                <div className="text-base font-bold text-slate-800 leading-none">{s.exercises.length}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">تمرين</div>
              </div>
            )}
            {s.duration && (
              <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-center min-w-[44px] shadow-sm">
                <div className="text-base font-bold text-slate-800 leading-none">{s.duration}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">دقيقة</div>
              </div>
            )}
            <div className="text-slate-400 w-8">
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
              <div className="space-y-2.5">
                {s.warmup.map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-[15px] text-slate-700 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-blue-700 mb-3 flex items-center gap-2">
                <span className="text-xl">💪</span>
                <span>التمارين</span>
                <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold">
                  {s.exercises.length} تمرين
                </span>
              </h4>
              <div className="space-y-3">
                {s.exercises.map((ex: any, i: number) => (
                  <ExerciseCard key={i} ex={ex} level={level} index={i} />
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
              <div className="space-y-2.5">
                {s.cooldown.map((c: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-[15px] text-slate-700 leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
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

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="text-7xl">🏋️</div>
            <h2 className="text-2xl font-extrabold text-white">ابدأ رحلتك في الجيم</h2>
            <p className="text-gray-400 text-base leading-relaxed">
              عبّئ بروفايلك التدريبي وسيقوم المدرب بتصميم جدول أسبوعي مخصص لك على أجهزة Technogym
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
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl border border-indigo-500 p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-xl leading-tight mb-1">
                  🏋️ جدول الجيم
                </h1>
                <p className="text-indigo-100 text-sm font-medium">{GOAL_LABEL[profile.goal]}</p>
                <p className="text-indigo-200 text-sm mt-0.5">{LEVEL_DISPLAY[profile.level]} • {profile.daysPerWeek} أيام/أسبوع</p>
              </div>
              <Link href="/gym/profile"
                className="flex-shrink-0 text-sm bg-white/20 border border-white/30 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all font-medium">
                ✏️ البروفايل
              </Link>
            </div>

            {sessions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{trainingDays}</div>
                  <div className="text-xs text-indigo-100 mt-0.5">أيام تمرين</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-2xl font-extrabold text-white">{totalExercises}</div>
                  <div className="text-xs text-indigo-100 mt-0.5">تمرين هذا الأسبوع</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{currentSessions.find(s => s.date === today) ? '🔥' : '📅'}</div>
                  <div className="text-xs text-indigo-100 mt-0.5">
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
                  <SessionCard key={i} s={s} isToday={s.date === today} />
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
  );
}
