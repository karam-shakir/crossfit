'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; emoji: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', emoji: '🟢', active: 'bg-green-600 text-white shadow-lg',  idle: 'bg-green-50 text-green-700 border border-green-300' },
  { key: 'intermediate', label: 'متوسط', emoji: '🔵', active: 'bg-blue-600 text-white shadow-lg',   idle: 'bg-blue-50 text-blue-700 border border-blue-300' },
  { key: 'advanced',     label: 'متقدم', emoji: '🟠', active: 'bg-orange-500 text-white shadow-lg', idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'نخبة',  emoji: '🔴', active: 'bg-red-600 text-white shadow-lg',    idle: 'bg-red-50 text-red-700 border border-red-300' },
];

const TYPE_THEME: Record<string, { accent: string; badge: string; icon: string; label: string }> = {
  Push:      { accent: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700 border border-orange-200',   icon: '🙌', label: 'دفع' },
  Pull:      { accent: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700 border border-blue-200',         icon: '🏗️', label: 'سحب' },
  Legs:      { accent: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: '🦵', label: 'أرجل' },
  Skills:    { accent: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700 border border-violet-200',   icon: '🤸', label: 'مهارات' },
  Core:      { accent: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 border border-amber-200',      icon: '🧱', label: 'جذع' },
  FullBody:  { accent: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',   icon: '💪', label: 'كامل الجسم' },
  Endurance: { accent: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700 border border-rose-200',         icon: '🔄', label: 'تحمل' },
  Rest:      { accent: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-500 border border-slate-200',      icon: '😴', label: 'راحة' },
};

const GOAL_LABEL: Record<string, string> = {
  strength: 'قوة بوزن الجسم 💪', skills: 'مهارات 🤸', muscle_gain: 'بناء عضلي 🏗️',
  endurance: 'تحمل عضلي 🔄', fat_burn: 'حرق الدهون 🔥',
};

const LEVEL_DISPLAY: Record<string, string> = {
  beginner: '🟢 مبتدئ', intermediate: '🔵 متوسط', advanced: '🟠 متقدم', elite: '🔴 نخبة',
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

function ExerciseCard({ ex, level, index, isSkill }: { ex: any; level: LevelKey; index: number; isSkill?: boolean }) {
  const lvl = ex.levels?.[level];
  return (
    <div className={`bg-white rounded-2xl overflow-hidden border shadow-sm ${isSkill ? 'border-violet-200' : 'border-slate-200'}`}>
      <div className="px-3.5 py-3 flex items-start gap-3">
        <span className={`mt-0.5 w-7 h-7 flex-shrink-0 rounded-full border flex items-center justify-center text-xs font-bold ${isSkill ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-emerald-100 border-emerald-300 text-emerald-700'}`}>
          {isSkill ? '🤸' : index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 text-[15px] leading-tight">{ex.name}</div>
          <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{ex.nameEn}</div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {ex.targetMuscles && (
              <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
                💪 {ex.targetMuscles}
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
              <span className="text-sm flex-shrink-0 mt-0.5">💬</span>
              <span className="text-[13px] text-amber-800 leading-relaxed font-medium">{lvl.cue}</span>
            </div>
          )}
        </div>
      )}

      {ex.notes && (
        <div className="px-4 pb-3 text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
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
  const theme = TYPE_THEME[s.sessionType] || TYPE_THEME['FullBody'];

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
      <div className={`h-1.5 ${theme.accent}`} />

      {isToday && (
        <div className="bg-emerald-600 text-white text-sm font-bold text-center py-2 tracking-widest">
          ✨ جلسة اليوم
        </div>
      )}

      {!isRest && s.intensity && (
        <div className={`text-sm font-bold text-center py-1.5 ${
          s.intensity === 'Heavy'    ? 'bg-red-500 text-white' :
          s.intensity === 'Moderate' ? 'bg-amber-500 text-white' :
          s.intensity === 'Light'    ? 'bg-emerald-500 text-white' : 'hidden'
        }`}>
          {s.intensity === 'Heavy' ? '🔴 شدة عالية' : s.intensity === 'Moderate' ? '🟡 شدة متوسطة' : s.intensity === 'Light' ? '🟢 خفيف' : ''}
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
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                {theme.label}
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
              <span className="text-base flex-shrink-0">📋</span>
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

          {/* Skill Work */}
          {s.skillWork?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-violet-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🤸</span>
                <span>تدريب المهارات</span>
                <span className="bg-violet-100 text-violet-700 border border-violet-200 text-xs px-2.5 py-1 rounded-full font-bold">أول الجلسة</span>
              </h4>
              <div className="space-y-3">
                {s.skillWork.map((ex: any, i: number) => (
                  <ExerciseCard key={i} ex={ex} level={level} index={i} isSkill />
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {s.exercises?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <span className="text-xl">💪</span>
                <span>التمارين</span>
                <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">
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
              <span className="text-2xl flex-shrink-0">🧠</span>
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

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="text-7xl">🤸</div>
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
                <h1 className="font-extrabold text-white text-xl leading-tight mb-0.5">
                  🤸 برنامج الكاليسثنكس
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)' }} className="text-sm font-semibold">{GOAL_LABEL[profile.goal]}</p>
                <p style={{ color: 'rgba(255,255,255,0.70)' }} className="text-xs mt-0.5">{LEVEL_DISPLAY[profile.level]} • {profile.daysPerWeek} أيام/أسبوع</p>
                {profile.skillGoals?.length > 0 && (
                  <p style={{ color: 'rgba(255,255,255,0.70)' }} className="text-xs mt-0.5">🎯 {profile.skillGoals.join(' • ')}</p>
                )}
              </div>
              <Link href="/calisthenics/profile"
                className="flex-shrink-0 text-xs bg-white/20 border border-white/30 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all font-semibold">
                ✏️ البروفايل
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
                  <div className="text-2xl font-extrabold text-white">{currentSessions.find(s => s.date === today) ? '🔥' : '📅'}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>
                    {currentSessions.find(s => s.date === today) ? 'اليوم تدريب!' : 'استمر'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="text-6xl">📋</div>
              <p className="text-slate-800 font-bold text-lg">لا يوجد برنامج بعد</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                بروفايلك جاهز ✅ — انتظر المدرب ليولّد لك برنامجك الأسبوعي المخصص
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
                {currentSessions.map((s: any) => (
                  <SessionCard key={s.id || s.date} s={s} isToday={s.date === today} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
