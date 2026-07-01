'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; emoji: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ',  emoji: '🟢', active: 'bg-green-600 text-white shadow-lg shadow-green-900/40',    idle: 'bg-gray-800/80 text-green-400 border border-green-800' },
  { key: 'intermediate', label: 'متوسط',  emoji: '🔵', active: 'bg-blue-600 text-white shadow-lg shadow-blue-900/40',     idle: 'bg-gray-800/80 text-blue-400 border border-blue-800' },
  { key: 'advanced',     label: 'متقدم',  emoji: '🟠', active: 'bg-orange-500 text-white shadow-lg shadow-orange-900/40', idle: 'bg-gray-800/80 text-orange-400 border border-orange-800' },
  { key: 'elite',        label: 'محترف',  emoji: '🔴', active: 'bg-red-600 text-white shadow-lg shadow-red-900/40',       idle: 'bg-gray-800/80 text-red-400 border border-red-800' },
];

const SPLIT_THEME: Record<string, { border: string; bg: string; badge: string; glow: string; icon: string }> = {
  Push:       { border: 'border-orange-600/60', bg: 'bg-orange-950/40',  badge: 'bg-orange-600/30 text-orange-300 border-orange-600/40',  glow: 'shadow-orange-900/20', icon: '🔴' },
  Pull:       { border: 'border-blue-600/60',   bg: 'bg-blue-950/40',    badge: 'bg-blue-600/30 text-blue-300 border-blue-600/40',        glow: 'shadow-blue-900/20',   icon: '🔵' },
  Legs:       { border: 'border-green-600/60',  bg: 'bg-green-950/40',   badge: 'bg-green-600/30 text-green-300 border-green-600/40',     glow: 'shadow-green-900/20',  icon: '🟢' },
  Upper:      { border: 'border-purple-600/60', bg: 'bg-purple-950/40',  badge: 'bg-purple-600/30 text-purple-300 border-purple-600/40',  glow: 'shadow-purple-900/20', icon: '🟣' },
  Lower:      { border: 'border-yellow-600/60', bg: 'bg-yellow-950/40',  badge: 'bg-yellow-600/30 text-yellow-300 border-yellow-600/40',  glow: 'shadow-yellow-900/20', icon: '🟡' },
  'Full Body':{ border: 'border-indigo-600/60', bg: 'bg-indigo-950/40',  badge: 'bg-indigo-600/30 text-indigo-300 border-indigo-600/40',  glow: 'shadow-indigo-900/20', icon: '🔷' },
  Rest:       { border: 'border-gray-700/40',   bg: 'bg-gray-900/50',    badge: 'bg-gray-700/40 text-gray-400 border-gray-700/40',        glow: '',                     icon: '😴' },
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
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-white/8 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-white text-base leading-tight">{ex.nameAr}</div>
            <div className="text-sm text-gray-400 mt-0.5">{ex.nameEn}</div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-lg">
                💪 {ex.muscleGroup}
              </span>
              <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-lg">
                {ex.sets} مجموعات
              </span>
            </div>
          </div>
        </div>
        {MACHINE_YOUTUBE[ex.machineId] && (
          <a href={MACHINE_YOUTUBE[ex.machineId]} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-red-950/60 hover:bg-red-700 border border-red-700/50 text-red-400 hover:text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-all">
            <YoutubeIcon />
            <span>شرح</span>
          </a>
        )}
      </div>

      {/* Stats */}
      {lvl && (
        <div className="mx-3 mb-3 rounded-xl bg-gray-800/70 border border-white/5 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/5">
            <div className="text-center py-3 px-2">
              <div className="text-xs text-gray-500 mb-1">الوزن</div>
              <div className="text-xl font-extrabold text-blue-400 leading-none">{lvl.weight}</div>
            </div>
            <div className="text-center py-3 px-2">
              <div className="text-xs text-gray-500 mb-1">التكرارات</div>
              <div className="text-xl font-extrabold text-orange-400 leading-none">{lvl.reps}</div>
            </div>
            <div className="text-center py-3 px-2">
              <div className="text-xs text-gray-500 mb-1">الراحة</div>
              <div className="text-xl font-extrabold text-teal-400 leading-none">{lvl.rest}</div>
            </div>
          </div>
          {lvl.cue && (
            <div className="border-t border-white/5 px-3 py-2.5 bg-yellow-950/30 flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">💬</span>
              <span className="text-sm text-yellow-200 leading-relaxed">{lvl.cue}</span>
            </div>
          )}
        </div>
      )}

      {ex.notes && (
        <div className="px-4 pb-3 text-sm text-gray-500 flex items-start gap-1.5">
          <span>📌</span><span>{ex.notes}</span>
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
    <div className={`rounded-2xl border overflow-hidden shadow-md ${theme.border} ${theme.bg} ${isToday ? 'ring-2 ring-indigo-500/60' : ''}`}>
      {/* Today badge */}
      {isToday && (
        <div className="bg-indigo-600 text-white text-sm font-bold text-center py-2 tracking-wide">
          ✨ تمرين اليوم
        </div>
      )}
      {/* Intensity badge */}
      {!isRest && s.intensity && (
        <div className={`text-xs font-bold text-center py-1 ${
          s.intensity === 'Heavy'    ? 'bg-red-900/60 text-red-300' :
          s.intensity === 'Moderate' ? 'bg-orange-900/60 text-orange-300' :
          s.intensity === 'Light'    ? 'bg-green-900/60 text-green-300' :
          s.intensity === 'Cardio'   ? 'bg-blue-900/60 text-blue-300' : 'hidden'
        }`}>
          {s.intensity === 'Heavy' ? '🔴 شدة عالية' : s.intensity === 'Moderate' ? '🟠 شدة متوسطة' : s.intensity === 'Light' ? '🟢 خفيف / حجم' : s.intensity === 'Cardio' ? '🔵 كارديو' : ''}
        </div>
      )}

      {/* Card header */}
      <button
        onClick={() => !isRest && setOpen(o => !o)}
        className={`w-full px-4 py-4 text-right flex items-center justify-between gap-3 ${!isRest ? 'cursor-pointer' : 'cursor-default'}`}
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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${theme.badge}`}>
                  {s.splitType}
                </span>
              )}
              {isRest ? (
                <span className="text-base text-gray-400">😴 يوم راحة — استرح واشرب ماء</span>
              ) : (
                <span className="text-sm text-gray-300 truncate">{s.title}</span>
              )}
            </div>
          </div>
        </div>
        {!isRest && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {s.duration && (
              <div className="text-center hidden sm:block">
                <div className="text-xs text-gray-500">المدة</div>
                <div className="text-sm font-bold text-gray-300">⏱ {s.duration}د</div>
              </div>
            )}
            {s.exercises?.length > 0 && (
              <div className="text-center hidden sm:block">
                <div className="text-xs text-gray-500">التمارين</div>
                <div className="text-sm font-bold text-gray-300">{s.exercises.length} 💪</div>
              </div>
            )}
            <div className="text-gray-500">
              <ChevronIcon open={open} />
            </div>
          </div>
        )}
      </button>

      {/* Mobile stats row (for non-rest days) */}
      {!isRest && !open && s.exercises?.length > 0 && (
        <div className="flex gap-4 px-4 pb-3 sm:hidden">
          {s.duration && <span className="text-xs text-gray-500">⏱ {s.duration} دقيقة</span>}
          <span className="text-xs text-gray-500">💪 {s.exercises.length} تمارين</span>
        </div>
      )}

      {/* Expanded content */}
      {open && !isRest && (
        <div className="border-t border-white/8 space-y-5 p-4">

          {/* Session notes */}
          {s.notes && (
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-base flex-shrink-0">📋</span>
              <p className="text-sm text-gray-300 leading-relaxed">{s.notes}</p>
            </div>
          )}

          {/* Level selector */}
          <div>
            <p className="text-sm text-gray-400 mb-2 font-medium">اختر مستواك لعرض الأوزان المناسبة:</p>
            <div className="grid grid-cols-4 gap-2">
              {LEVEL_TABS.map(t => (
                <button key={t.key} onClick={() => setLevel(t.key)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${level === t.key ? t.active : t.idle}`}>
                  <div>{t.emoji}</div>
                  <div className="mt-0.5">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Warmup */}
          {s.warmup?.length > 0 && (
            <div className="bg-yellow-950/30 border border-yellow-800/30 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <span className="text-lg">🔆</span> الإحماء
              </h4>
              <div className="space-y-2">
                {s.warmup.map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-yellow-800/40 text-yellow-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-200 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                <span className="text-lg">💪</span>
                <span>التمارين</span>
                <span className="bg-blue-900/50 text-blue-400 border border-blue-800/50 text-xs px-2 py-0.5 rounded-full font-semibold">
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
            <div className="bg-teal-950/30 border border-teal-800/30 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2">
                <span className="text-lg">🧘</span> التهدئة والإطالة
              </h4>
              <div className="space-y-2">
                {s.cooldown.map((c: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-800/40 text-teal-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-200 leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coach note */}
          {s.coachNote && (
            <div className="bg-indigo-950/50 border border-indigo-700/40 rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🧠</span>
              <div>
                <div className="text-xs text-indigo-400 font-semibold mb-1">ملاحظة المدرب</div>
                <p className="text-sm text-indigo-200 leading-relaxed">{s.coachNote}</p>
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
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 rounded-2xl border border-indigo-700/40 p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-extrabold text-white text-xl leading-tight mb-1">
                  🏋️ جدول الجيم
                </h1>
                <p className="text-indigo-300 text-sm font-medium">{GOAL_LABEL[profile.goal]}</p>
                <p className="text-gray-400 text-sm mt-0.5">{LEVEL_DISPLAY[profile.level]} • {profile.daysPerWeek} أيام/أسبوع</p>
              </div>
              <Link href="/gym/profile"
                className="flex-shrink-0 text-sm bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl hover:border-indigo-500 hover:text-white transition-all font-medium">
                ✏️ البروفايل
              </Link>
            </div>

            {sessions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{trainingDays}</div>
                  <div className="text-xs text-gray-400 mt-0.5">أيام تمرين</div>
                </div>
                <div className="text-center border-x border-white/8">
                  <div className="text-2xl font-extrabold text-white">{totalExercises}</div>
                  <div className="text-xs text-gray-400 mt-0.5">تمرين هذا الأسبوع</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-indigo-400">{currentSessions.find(s => s.date === today) ? '🔥' : '📅'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {currentSessions.find(s => s.date === today) ? 'اليوم تمرين!' : 'استمر'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="text-6xl">📋</div>
              <p className="text-white font-bold text-lg">لا يوجد جدول بعد</p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                بروفايلك جاهز ✅ — انتظر المدرب ليولّد لك جدولك الأسبوعي المخصص
              </p>
            </div>
          ) : (
            <>
              {/* Week tabs */}
              {weeks.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium px-1">اختر الأسبوع:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {weeks.map((w, i) => {
                      const hasToday = w.sessions.some(s => s.date === today);
                      return (
                        <button key={i} onClick={() => setActiveWeek(i)}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                            activeWeek === i
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
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
