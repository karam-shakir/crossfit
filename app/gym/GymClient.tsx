'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ',  active: 'bg-green-600 text-white',  idle: 'bg-gray-800 text-green-400 border border-green-700' },
  { key: 'intermediate', label: 'متوسط',  active: 'bg-blue-600 text-white',   idle: 'bg-gray-800 text-blue-400 border border-blue-700' },
  { key: 'advanced',     label: 'متقدم',  active: 'bg-orange-500 text-white', idle: 'bg-gray-800 text-orange-400 border border-orange-700' },
  { key: 'elite',        label: 'محترف',  active: 'bg-red-600 text-white',    idle: 'bg-gray-800 text-red-400 border border-red-700' },
];

const SPLIT_COLORS: Record<string, string> = {
  Push:       'border-orange-700/50 bg-orange-900/10',
  Pull:       'border-blue-700/50 bg-blue-900/10',
  Legs:       'border-green-700/50 bg-green-900/10',
  Upper:      'border-purple-700/50 bg-purple-900/10',
  Lower:      'border-yellow-700/50 bg-yellow-900/10',
  'Full Body':'border-indigo-700/50 bg-indigo-900/10',
  Rest:       'border-gray-700/30 bg-gray-900/30',
};

const SPLIT_ICONS: Record<string, string> = {
  Push: '🔴', Pull: '🔵', Legs: '🟢', Upper: '🟣',
  Lower: '🟡', 'Full Body': '🔷', Rest: '😴',
};

// روابط يوتيوب لكل جهاز Technogym
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

function groupByWeek(sessions: any[]) {
  const weeks: { label: string; sessions: any[] }[] = [];
  const seen = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.date + 'T00:00:00');
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().split('T')[0];
    if (!seen.has(key)) {
      seen.add(key);
      weeks.push({ label: `أسبوع ${key}`, sessions: [] });
    }
    weeks[weeks.length - 1].sessions.push(s);
  }
  return weeks;
}

function SessionCard({ s }: { s: any }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<LevelKey>('intermediate');
  const isRest = s.isRest;
  const splitKey = s.splitType?.split(' ')[0] || 'Full Body';

  return (
    <div className={`rounded-2xl border overflow-hidden ${SPLIT_COLORS[splitKey] || SPLIT_COLORS['Full Body']}`}>
      <button onClick={() => !isRest && setOpen(o => !o)}
        className="w-full p-4 text-right flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{SPLIT_ICONS[splitKey] || '🏋️'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">{s.dayName}</span>
              <span className="text-xs text-gray-500">{s.date}</span>
              {!isRest && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">{s.splitType}</span>}
            </div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{isRest ? '😴 يوم راحة' : s.title}</div>
          </div>
        </div>
        {!isRest && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {s.duration && <span className="text-xs text-gray-500">⏱{s.duration}د</span>}
            <span className="text-gray-600 text-sm">{open ? '▲' : '▼'}</span>
          </div>
        )}
      </button>

      {open && !isRest && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {s.notes && <p className="text-xs text-gray-400 bg-gray-800/50 rounded-xl px-3 py-2">📝 {s.notes}</p>}

          {/* Level tabs */}
          <div className="flex gap-1.5">
            {LEVEL_TABS.map(t => (
              <button key={t.key} onClick={() => setLevel(t.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${level === t.key ? t.active : t.idle}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Warmup */}
          {s.warmup?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-yellow-400 mb-2">🔆 الإحماء</h4>
              <div className="space-y-1">
                {s.warmup.map((w: string, i: number) => (
                  <div key={i} className="text-xs text-gray-300 bg-yellow-900/10 rounded-lg px-3 py-1.5">• {w}</div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-blue-400 mb-2">💪 التمارين ({s.exercises.length})</h4>
              <div className="space-y-3">
                {s.exercises.map((ex: any, i: number) => {
                  const lvl = ex.levels?.[level];
                  return (
                    <div key={i} className="bg-gray-800/60 rounded-xl overflow-hidden border border-white/5">
                      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{ex.nameAr}</div>
                          <div className="text-xs text-gray-500">{ex.nameEn} • {ex.muscleGroup} • {ex.sets} مجموعات</div>
                        </div>
                        {MACHINE_YOUTUBE[ex.machineId] && (
                          <a href={MACHINE_YOUTUBE[ex.machineId]} target="_blank" rel="noopener noreferrer"
                            className="flex-shrink-0 flex items-center gap-1 bg-red-900/40 hover:bg-red-700/60 border border-red-700/40 text-red-400 hover:text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
                              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
                            </svg>
                            <span>شرح</span>
                          </a>
                        )}
                      </div>
                      {lvl && (
                        <div className="border-t border-white/5 px-3 py-2 bg-gray-900/40 grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500">الوزن</div>
                            <div className="text-sm font-bold text-blue-400">{lvl.weight}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500">التكرارات</div>
                            <div className="text-sm font-bold text-orange-400">{lvl.reps}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500">الراحة</div>
                            <div className="text-sm font-bold text-teal-400">{lvl.rest}</div>
                          </div>
                          {lvl.cue && (
                            <div className="col-span-3 text-xs text-yellow-300 bg-yellow-900/20 rounded-lg px-2 py-1 mt-1">
                              💬 {lvl.cue}
                            </div>
                          )}
                        </div>
                      )}
                      {ex.notes && <div className="px-3 py-1.5 text-xs text-gray-500 border-t border-white/5">{ex.notes}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {s.cooldown?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-teal-400 mb-2">🧘 التهدئة</h4>
              <div className="space-y-1">
                {s.cooldown.map((c: string, i: number) => (
                  <div key={i} className="text-xs text-gray-300 bg-teal-900/10 rounded-lg px-3 py-1.5">• {c}</div>
                ))}
              </div>
            </div>
          )}

          {s.coachNote && (
            <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-3 py-2 text-xs text-indigo-300">
              🧠 {s.coachNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GymClient({ member, profile, sessions }: { member: any; profile: any; sessions: any[] }) {
  const weeks = groupByWeek(sessions);
  const [activeWeek, setActiveWeek] = useState(0);
  const currentSessions = weeks[activeWeek]?.sessions || sessions.slice(0, 7);

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="text-6xl">🏋️</div>
            <h2 className="text-xl font-bold text-white">لم يتم إعداد بروفايلك بعد</h2>
            <p className="text-gray-400 text-sm">عبّئ بروفايلك التدريبي وسيقوم المدرب بتصميم جدول مخصص لك</p>
            <Link href="/gym/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
              إعداد البروفايل التدريبي
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-24 lg:pb-6">
        <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl border border-indigo-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-white text-lg">🏋️ جدولك في الجيم</h1>
                <p className="text-xs text-indigo-300 mt-0.5">{GOAL_LABEL[profile.goal]} • {profile.daysPerWeek} أيام/أسبوع</p>
              </div>
              <Link href="/gym/profile"
                className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-xl hover:border-indigo-500 transition-colors">
                ✏️ تعديل البروفايل
              </Link>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">📋</div>
              <p className="text-white font-semibold">لا يوجد جدول بعد</p>
              <p className="text-gray-400 text-sm">بروفايلك جاهز — انتظر المدرب ليولّد لك الجدول</p>
            </div>
          ) : (
            <>
              {/* Week selector */}
              {weeks.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {weeks.map((w, i) => (
                    <button key={i} onClick={() => setActiveWeek(i)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeWeek === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                      {w.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Sessions */}
              <div className="space-y-3">
                {(weeks.length > 0 ? currentSessions : sessions).map((s, i) => (
                  <SessionCard key={i} s={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
