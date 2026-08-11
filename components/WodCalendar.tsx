'use client';
import { useState, useEffect, useCallback } from 'react';
import ExerciseCard from './ExerciseCard';

const DAYS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export const FORMAT_META: Record<string, { icon: string; timeLabel: string }> = {
  'AMRAP':      { icon: '🔁', timeLabel: 'مدة AMRAP' },
  'EMOM':       { icon: '⏰', timeLabel: 'كل دقيقة لمدة' },
  'للوقت':      { icon: '⏱️', timeLabel: 'تايم كاب' },
  'قوة':        { icon: '🏋️', timeLabel: 'المدة التقديرية' },
  'تدريب':      { icon: '🎯', timeLabel: 'المدة التقديرية' },
  'راحة':       { icon: '😴', timeLabel: '' },
  'راحة نشطة':  { icon: '🚶', timeLabel: '' },
};
export function formatMeta(type: string) {
  return FORMAT_META[type] || { icon: '🔥', timeLabel: 'المدة' };
}

function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
}

interface MonthWod {
  date: string; title: string; titleEn?: string; type: string;
  duration: number | null; isRest: boolean; isCalisthenics: boolean; isPartnerWod?: boolean;
}

export default function WodCalendar({ onClose }: { onClose: () => void }) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => { const d = new Date(today + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [monthWods, setMonthWods] = useState<Record<string, MonthWod>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayWod, setDayWod] = useState<any>(null);
  const [dayLoading, setDayLoading] = useState(false);

  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`;

  const loadMonth = useCallback(async (key: string) => {
    setLoadingMonth(true);
    try {
      const res = await fetch(`/api/wod?month=${key}`);
      const data = await res.json();
      const map: Record<string, MonthWod> = {};
      if (Array.isArray(data)) data.forEach((w: MonthWod) => { map[w.date] = w; });
      setMonthWods(map);
    } catch {
      setMonthWods({});
    }
    setLoadingMonth(false);
  }, []);

  useEffect(() => { loadMonth(monthKey); }, [monthKey, loadMonth]);

  async function openDate(date: string) {
    setSelectedDate(date);
    setDayWod(null);
    setDayLoading(true);
    try {
      const res = await fetch(`/api/wod?date=${date}`);
      const data = await res.json();
      setDayWod(data);
    } catch {
      setDayWod(null);
    }
    setDayLoading(false);
  }

  function shiftMonth(delta: number) {
    setCursor(c => {
      let m = c.m + delta, y = c.y;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { y, m };
    });
  }

  // بناء شبكة الأيام (تبدأ الأحد)
  const firstOfMonth = new Date(cursor.y, cursor.m, 1);
  const startOffset = firstOfMonth.getDay(); // 0=أحد
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const sections = dayWod ? [
    { key: 'warmup',    label: 'الإحماء 🔆',   items: dayWod.warmup    || [] },
    { key: 'strength',  label: 'القوة 🏋️',     items: dayWod.strength  || [] },
    { key: 'metcon',    label: 'الـ WOD 🔥',   items: dayWod.metcon    || [] },
    { key: 'accessory', label: 'الأكسسوار 💪', items: dayWod.accessory || [] },
    { key: 'cooldown',  label: 'الإطالات 🧘',  items: dayWod.cooldown  || [] },
  ].filter(s => s.items.length > 0) : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-orange-600 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">✕</button>
          <h2 className="text-white font-extrabold text-lg">📅 تقويم التمارين</h2>
          <span className="w-8" />
        </div>

        {!selectedDate ? (
          <div className="overflow-y-auto flex-1">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <button onClick={() => shiftMonth(-1)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">‹</button>
              <div className="font-extrabold text-slate-800 text-base">{MONTHS_AR[cursor.m]} {cursor.y}</div>
              <button onClick={() => shiftMonth(1)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">›</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center">
              {DAYS_AR.map(d => <div key={d} className="text-[11px] font-bold text-slate-400">{d}</div>)}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1.5 px-3 pb-4 pt-1.5">
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const w = monthWods[date];
                const isToday = date === today;
                const dayNum = Number(date.split('-')[2]);
                return (
                  <button key={date} onClick={() => openDate(date)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${
                      isToday ? 'bg-orange-600 text-white shadow-md'
                      : w ? (w.isRest ? 'bg-slate-100 text-slate-500 border border-slate-200' : w.isPartnerWod ? 'bg-pink-50 text-pink-700 border border-pink-200' : w.isCalisthenics ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200')
                      : 'bg-white text-slate-300 border border-slate-100'
                    }`}>
                    {dayNum}
                    {w && !isToday && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${w.isRest ? 'bg-slate-400' : w.isPartnerWod ? 'bg-pink-500' : w.isCalisthenics ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    )}
                    {w?.isPartnerWod && !isToday && (
                      <span className="absolute top-0.5 right-0.5 text-[9px]">🤝</span>
                    )}
                  </button>
                );
              })}
            </div>

            {loadingMonth && <p className="text-center text-xs text-slate-400 pb-3">جاري التحميل...</p>}

            <div className="flex items-center gap-4 justify-center pb-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> CrossFit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> بارتنر 🤝</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Calisthenics</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> راحة</span>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
              <button onClick={() => setSelectedDate(null)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex-shrink-0">←</button>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-800 text-base">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {dayLoading ? (
                <p className="text-center text-slate-400 py-10">جاري التحميل...</p>
              ) : !dayWod ? (
                <div className="text-center py-14 space-y-2">
                  <div className="text-4xl">😴</div>
                  <p className="text-slate-500 font-semibold">لا يوجد تمرين مُسجَّل لهذا اليوم</p>
                </div>
              ) : (
                <>
                  {/* WOD info header */}
                  <div className={`rounded-2xl p-4 shadow-lg ${dayWod.isPartnerWod ? 'bg-pink-600 shadow-pink-100' : 'bg-orange-600 shadow-orange-100'}`}>
                    {dayWod.isPartnerWod && (
                      <div className="mb-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5 text-xs text-white font-semibold">
                        🤝 يوم بارتنر
                      </div>
                    )}
                    <div className="text-white font-extrabold text-lg leading-tight mb-2">{dayWod.titleEn || dayWod.title}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/20 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                        {formatMeta(dayWod.type).icon} {dayWod.type}
                      </span>
                      {dayWod.duration && formatMeta(dayWod.type).timeLabel && (
                        <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                          ⏱ {formatMeta(dayWod.type).timeLabel}: {dayWod.duration} دقيقة
                        </span>
                      )}
                      {dayWod.rounds && (
                        <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                          🔄 الجولات: {dayWod.rounds}
                        </span>
                      )}
                    </div>
                    {dayWod.notes && (
                      <div className="bg-white/15 rounded-xl px-3 py-2.5 text-sm text-white leading-relaxed mt-3">💡 {dayWod.notes}</div>
                    )}
                    {dayWod.aiTheme && (
                      <div className="bg-white/10 rounded-xl px-3 py-2.5 text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>🔗 {dayWod.aiTheme}</div>
                    )}
                  </div>

                  {sections.map(s => (
                    <div key={s.key} className="space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-500">{s.label}</h3>
                      {s.items.map((item: any, i: number) => (
                        <ExerciseCard key={i} item={item} index={i} />
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
