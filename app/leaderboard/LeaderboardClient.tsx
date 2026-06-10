'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardClient({ member, currentUserId }: { member: any; currentUserId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'month' | 'total' | 'prs' | 'streak'>('month');

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) => {
    if (tab === 'month') return b.monthSessions - a.monthSessions || b.totalPRs - a.totalPRs;
    if (tab === 'total') return b.totalSessions - a.totalSessions;
    if (tab === 'prs') return b.totalPRs - a.totalPRs;
    if (tab === 'streak') return b.streak - a.streak;
    return 0;
  });

  const tabs = [
    { key: 'month', label: 'هذا الشهر', icon: '📅' },
    { key: 'total', label: 'الكل', icon: '📊' },
    { key: 'prs', label: 'الأرقام', icon: '🏆' },
    { key: 'streak', label: 'الاستمرارية', icon: '🔥' },
  ];

  function getValue(item: any) {
    if (tab === 'month') return `${item.monthSessions} جلسة`;
    if (tab === 'total') return `${item.totalSessions} جلسة`;
    if (tab === 'prs') return `${item.totalPRs} رقم`;
    if (tab === 'streak') return `${item.streak} يوم`;
    return '';
  }

  function getRawValue(item: any) {
    if (tab === 'month') return item.monthSessions;
    if (tab === 'total') return item.totalSessions;
    if (tab === 'prs') return item.totalPRs;
    if (tab === 'streak') return item.streak;
    return 0;
  }

  const chartData = sorted.slice(0, 8).map(item => ({
    name: item.nameAr?.split(' ')[0] || item.name,
    value: getRawValue(item),
    isMe: item.id === currentUserId,
  }));

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <h1 className="text-xl font-bold text-white">🥇 لوحة الترتيب</h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* رسم بياني مقارنة الأعضاء */}
          {!loading && chartData.length > 0 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">
                {tabs.find(t => t.key === tab)?.icon} مقارنة {tabs.find(t => t.key === tab)?.label}
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }} barCategoryGap="25%">
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
                        <div className="text-orange-400 font-bold">{payload[0].value} {tab === 'prs' ? 'رقم' : tab === 'streak' ? 'يوم' : 'جلسة'}</div>
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    <LabelList dataKey="value" position="right" style={{ fill: '#9ca3af', fontSize: 10 }} />
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isMe ? '#f97316' : i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#374151'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : (
            <div className="space-y-3">
              {sorted.map((item, idx) => (
                <div key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    item.id === currentUserId
                      ? 'bg-orange-900/30 border-orange-700'
                      : 'bg-gray-900 border-gray-800'
                  }`}>
                  <div className="w-8 text-center flex-shrink-0">
                    {idx < 3 ? (
                      <span className="text-2xl">{MEDALS[idx]}</span>
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">#{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-2xl flex-shrink-0">{item.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {item.nameAr}
                      {item.id === currentUserId && <span className="text-xs text-orange-400">(أنت)</span>}
                    </div>
                    <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                      <span>🔥 {item.streak} يوم</span>
                      <span>✅ {item.rxdCount} Rx'd</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="text-xl font-bold text-orange-400">{getValue(item)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}




