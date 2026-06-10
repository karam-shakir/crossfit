'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function AttendanceClient({ member }: { member: any }) {
  const [records, setRecords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/attendance')
      .then(r => r.json())
      .then((data: any[]) => {
        setRecords(Array.isArray(data) ? data.map(r => r.date) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const attended = new Set(records);
  const checkedInToday = attended.has(today);

  async function checkIn() {
    setChecking(true);
    setMsg('');
    try {
      const res = await fetch('/api/attendance', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'حدث خطأ');
      } else {
        setRecords(prev => [...prev, today]);
        setMsg('✅ تم تسجيل حضورك اليوم!');
      }
    } catch {
      setMsg('حدث خطأ في الاتصال');
    } finally {
      setChecking(false);
    }
  }

  const thisMonth = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthDays = records.filter(d => d.startsWith(thisMonth)).length;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (attended.has(ds)) streak++;
    else if (i > 0) break;
  }

  // بيانات آخر 6 أشهر للرسم البياني
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const count = records.filter(r => r.startsWith(key)).length;
    return { month: MONTHS_AR[m].slice(0, 3), count, isCurrent: i === 5 };
  });

  const maxCount = Math.max(...last6Months.map(m => m.count), 1);

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <h1 className="text-xl font-bold text-white">📅 سجل الحضور</h1>

          {/* زر تسجيل الحضور */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              {checkedInToday ? '✅ سجّلت حضورك اليوم' : `اليوم: ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            </p>
            {!checkedInToday ? (
              <button
                onClick={checkIn}
                disabled={checking || loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-800 text-white font-bold py-4 rounded-xl text-lg transition-colors"
              >
                {checking ? '⏳ جاري التسجيل...' : '✋ سجّل حضوري الآن'}
              </button>
            ) : (
              <div className="bg-green-900/40 border border-green-700 rounded-xl py-4 text-green-400 font-bold text-lg">
                🎉 أحسنت! حضورك مسجّل اليوم
              </div>
            )}
            {msg && !checkedInToday && (
              <p className="text-sm text-red-400">{msg}</p>
            )}
            {msg && checkedInToday && (
              <p className="text-sm text-green-400">{msg}</p>
            )}
          </div>

          {/* رسم بياني — آخر 6 أشهر */}
          {!loading && records.length > 0 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">📊 الحضور — آخر 6 أشهر</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last6Months} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
                        <div className="text-gray-400">{label}</div>
                        <div className="text-orange-400 font-bold text-sm">{payload[0].value} يوم</div>
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {last6Months.map((entry, i) => (
                      <Cell key={i} fill={entry.isCurrent ? '#f97316' : entry.count >= maxCount * 0.7 ? '#fb923c' : '#374151'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
                <span>أقل شهر: {Math.min(...last6Months.map(m => m.count))} يوم</span>
                <span>أفضل شهر: {maxCount} يوم</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-orange-400">{monthDays}</div>
              <div className="text-xs text-gray-400 mt-1">هذا الشهر</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-red-400">🔥 {streak}</div>
              <div className="text-xs text-gray-400 mt-1">أيام متتالية</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-blue-400">{records.length}</div>
              <div className="text-xs text-gray-400 mt-1">إجمالي الحضور</div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-colors">‹</button>
              <h2 className="font-semibold text-white">{MONTHS_AR[viewMonth]} {viewYear}</h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-colors">›</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === today;
                  const isAttended = attended.has(dateStr);
                  const isFuture = dateStr > today;
                  return (
                    <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      isAttended ? 'bg-orange-500 text-white'
                      : isToday ? 'bg-gray-700 text-white border-2 border-orange-500'
                      : isFuture ? 'text-gray-700'
                      : 'text-gray-500'
                    }`}>
                      {isAttended ? '✓' : day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}




