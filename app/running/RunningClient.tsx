'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Leaf, Flame, Zap, Route, Droplet, Mountain, Dices, Bike, Moon, Footprints,
  Target, Award, Trophy, Wind, MessageCircle, Sparkles, ClipboardList, Sun,
  Brain, Calendar, PenLine, CheckCircle2,
} from 'lucide-react';

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

const LEVEL_TABS: { key: LevelKey; label: string; dot: string; active: string; idle: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', dot: 'bg-green-500',  active: 'bg-green-600 text-white shadow-lg',  idle: 'bg-green-50 text-green-700 border border-green-300' },
  { key: 'intermediate', label: 'متوسط', dot: 'bg-blue-500',   active: 'bg-blue-600 text-white shadow-lg',   idle: 'bg-blue-50 text-blue-700 border border-blue-300' },
  { key: 'advanced',     label: 'متقدم', dot: 'bg-orange-500', active: 'bg-orange-500 text-white shadow-lg', idle: 'bg-orange-50 text-orange-700 border border-orange-300' },
  { key: 'elite',        label: 'نخبة',  dot: 'bg-red-500',    active: 'bg-red-600 text-white shadow-lg',    idle: 'bg-red-50 text-red-700 border border-red-300' },
];

const RUN_THEME: Record<string, { accent: string; badge: string; icon: any; label: string }> = {
  Easy:      { accent: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: Leaf,      label: 'جري سهل' },
  Tempo:     { accent: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700 border border-orange-200',    icon: Flame,     label: 'إيقاعي' },
  Intervals: { accent: 'bg-red-500',     badge: 'bg-red-100 text-red-700 border border-red-200',             icon: Zap,       label: 'تكرارات' },
  Long:      { accent: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',    icon: Route,     label: 'جري طويل' },
  Recovery:  { accent: 'bg-teal-400',    badge: 'bg-teal-100 text-teal-700 border border-teal-200',          icon: Droplet,   label: 'استرداد' },
  Hills:     { accent: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 border border-amber-200',       icon: Mountain,  label: 'تلال' },
  Fartlek:   { accent: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700 border border-violet-200',    icon: Dices,     label: 'فارتلك' },
  Cross:     { accent: 'bg-sky-500',     badge: 'bg-sky-100 text-sky-700 border border-sky-200',             icon: Bike,      label: 'تدريب متقاطع' },
  Rest:      { accent: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-500 border border-slate-200',       icon: Moon,      label: 'راحة' },
};

const GOAL_LABEL: Record<string, string> = {
  general_endurance: 'تحمل عام', fat_burn: 'حرق الدهون', race_5k: 'سباق 5 كم',
  race_10k: 'سباق 10 كم', half_marathon: 'نصف ماراثون', marathon: 'ماراثون', speed: 'سرعة قصوى',
};
const GOAL_ICON: Record<string, any> = {
  general_endurance: Footprints, fat_burn: Flame, race_5k: Zap,
  race_10k: Target, half_marathon: Award, marathon: Trophy, speed: Wind,
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

function SegmentCard({ seg, level, index }: { seg: any; level: LevelKey; index: number }) {
  const lvl = seg.levels?.[level];
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-3.5 py-3 flex items-start gap-3">
        <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-xs font-bold text-cyan-700">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 text-[15px] leading-tight">{seg.name}</div>
          {seg.description && <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{seg.description}</div>}
        </div>
      </div>

      {lvl && (
        <div className="mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-200">
            <div className="text-center py-3 px-1.5">
              <div className="text-[11px] text-slate-500 mb-1 font-medium">الإيقاع</div>
              <div className="text-sm font-extrabold text-cyan-700 leading-tight" dir="ltr">{lvl.pace}</div>
            </div>
            <div className="text-center py-3 px-1.5">
              <div className="text-[11px] text-slate-500 mb-1 font-medium">الهدف</div>
              <div className="text-sm font-extrabold text-orange-600 leading-tight">{lvl.target}</div>
            </div>
            <div className="text-center py-3 px-1.5">
              <div className="text-[11px] text-slate-500 mb-1 font-medium">الراحة</div>
              <div className="text-sm font-extrabold text-teal-600 leading-tight">{lvl.rest || '—'}</div>
            </div>
          </div>
          {lvl.cue && (
            <div className="border-t border-amber-200 px-3 py-2.5 bg-amber-50 flex items-start gap-2">
              <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span className="text-[13px] text-amber-800 leading-relaxed font-medium">{lvl.cue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, isToday }: { s: any; isToday: boolean }) {
  const [open, setOpen] = useState(isToday && !s.isRest);
  const [level, setLevel] = useState<LevelKey>('intermediate');
  const isRest = s.isRest;
  const theme = RUN_THEME[s.runType] || RUN_THEME['Easy'];

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isToday ? 'ring-2 ring-cyan-400 ring-offset-1' : ''}`}>
      <div className={`h-1.5 ${theme.accent}`} />

      {isToday && (
        <div className="bg-cyan-600 text-white text-sm font-bold text-center py-2 tracking-widest inline-flex items-center justify-center gap-1.5 w-full">
          <Sparkles className="w-4 h-4" /> جلسة اليوم
        </div>
      )}

      {!isRest && s.intensity && (
        <div className={`text-sm font-bold text-center py-1.5 inline-flex items-center justify-center gap-1.5 w-full ${
          s.intensity === 'Hard'     ? 'bg-red-500 text-white' :
          s.intensity === 'Moderate' ? 'bg-amber-500 text-white' :
          s.intensity === 'Easy'     ? 'bg-emerald-500 text-white' : 'hidden'
        }`}>
          {(s.intensity === 'Hard' || s.intensity === 'Moderate' || s.intensity === 'Easy') && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white/70" />
          )}
          {s.intensity === 'Hard' ? 'جلسة جودة — شدة عالية' : s.intensity === 'Moderate' ? 'شدة متوسطة' : s.intensity === 'Easy' ? 'إيقاع سهل' : ''}
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
            {s.totalDistanceKm > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-center min-w-[36px] shadow-sm">
                <div className="text-sm font-bold text-slate-800 leading-none">{s.totalDistanceKm}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">كم</div>
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
            <p className="text-sm text-slate-500 mb-3 font-medium">اختر مستواك لعرض الإيقاعات المناسبة:</p>
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

          {/* Segments */}
          {s.segments?.length > 0 && (
            <div>
              <h4 className="text-[15px] font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Footprints className="w-5 h-5" />
                <span>الجري الرئيسي</span>
              </h4>
              <div className="space-y-3">
                {s.segments.map((seg: any, i: number) => (
                  <SegmentCard key={i} seg={seg} level={level} index={i} />
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
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <Brain className="w-6 h-6 flex-shrink-0 text-cyan-600" />
              <div>
                <div className="text-sm text-cyan-700 font-bold mb-1.5">ملاحظة المدرب</div>
                <p className="text-[14px] text-slate-700 leading-relaxed">{s.coachNote}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RunningClient({ member, profile, sessions }: { member: any; profile: any; sessions: any[] }) {
  const today = todayStr();
  const weeks = useMemo(() => groupByWeek(sessions), [sessions]);

  const todayWeekIdx = useMemo(() => {
    return weeks.findIndex(w => w.sessions.some(s => s.date === today));
  }, [weeks, today]);

  const [activeWeek, setActiveWeek] = useState(() => todayWeekIdx >= 0 ? todayWeekIdx : 0);
  const currentSessions = weeks[activeWeek]?.sessions || [];

  const totalKm = currentSessions.reduce((n, s) => n + (s.totalDistanceKm || 0), 0);
  const runDays = currentSessions.filter(s => !s.isRest).length;

  if (!profile) {
    return (
      <div className="min-h-dvh flex w-full bg-gray-950">
        <Navbar member={member} />
        <main className="flex-1 lg:mr-56 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <Footprints className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">ابدأ رحلتك في الجري</h2>
            <p className="text-slate-500 text-base leading-relaxed">
              عبّئ بروفايل العدّاء وسيقوم المدرب بتصميم برنامج جري أسبوعي مخصص لك حسب هدفك ومستواك
            </p>
            <Link href="/running/profile"
              className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-base shadow-lg shadow-orange-900/40">
              إعداد بروفايل العدّاء →
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
          <div className="bg-gray-900 border border-gray-800 border-r-4 border-r-orange-500 rounded-2xl p-5 shadow-lg shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <Footprints className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-extrabold text-white text-xl leading-tight mb-0.5">
                    برنامج الجري
                  </h1>
                  <p className="text-sm font-semibold text-gray-300 inline-flex items-center gap-1">
                    {GOAL_ICON[profile.goal] && (() => { const GoalIcon = GOAL_ICON[profile.goal]; return <GoalIcon className="w-4 h-4 text-orange-500" />; })()}
                    {GOAL_LABEL[profile.goal]}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-500 inline-flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${LEVEL_DOT[profile.level]}`} />
                    {LEVEL_LABEL[profile.level]} • {profile.daysPerWeek} أيام/أسبوع
                  </p>
                </div>
              </div>
              <Link href="/running/profile"
                className="flex-shrink-0 text-xs bg-gray-800 border border-gray-700 text-gray-200 px-3 py-2 rounded-xl hover:bg-gray-700 transition-all font-semibold inline-flex items-center gap-1.5">
                <PenLine className="w-4 h-4" /> البروفايل
              </Link>
            </div>

            {sessions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">{runDays}</div>
                  <div className="text-[11px] mt-0.5 text-gray-500">أيام جري</div>
                </div>
                <div className="text-center border-x border-gray-800">
                  <div className="text-2xl font-extrabold text-white">{totalKm.toFixed(0)}</div>
                  <div className="text-[11px] mt-0.5 text-gray-500">كم / أسبوع</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    {currentSessions.find(s => s.date === today)
                      ? <Flame className="w-6 h-6 text-orange-500" />
                      : <Calendar className="w-6 h-6 text-gray-500" />}
                  </div>
                  <div className="text-[11px] mt-0.5 text-gray-500">
                    {currentSessions.find(s => s.date === today) ? 'اليوم جري!' : 'استمر'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Route className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-slate-800 font-bold text-lg">لا يوجد برنامج بعد</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto inline-flex items-center gap-1 justify-center">
                بروفايلك جاهز <CheckCircle2 className="w-4 h-4 text-green-500" /> — انتظر المدرب ليولّد لك برنامج الجري الأسبوعي المخصص
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
                              ? 'bg-cyan-600 text-white shadow-lg'
                              : 'bg-white text-slate-600 border border-slate-300 hover:border-cyan-400'
                          }`}>
                          {hasToday && <Flame className="w-3.5 h-3.5 inline ml-1 text-orange-500" />}
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
