'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { Trophy, Medal, Calendar, BarChart3, Flame, CheckCircle2 } from 'lucide-react';

// تحميل كسول لمكتبة recharts (~100kB) — لا تُحمَّل إلا عند عرض هذا القسم فعلياً
const LeaderboardBarChart = dynamic(() => import('@/components/charts/LeaderboardBarChart'), {
  ssr: false,
  loading: () => <div className="h-[180px] bg-gray-800/40 rounded-xl animate-pulse" />,
});

const MEDAL_COLORS = ['text-amber-400', 'text-gray-300', 'text-amber-700'];

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
    { key: 'month', label: 'هذا الشهر', icon: Calendar },
    { key: 'total', label: 'الكل', icon: BarChart3 },
    { key: 'prs', label: 'الأرقام', icon: Trophy },
    { key: 'streak', label: 'الاستمرارية', icon: Flame },
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

          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> لوحة الترتيب
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}>
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* رسم بياني مقارنة الأعضاء */}
          {!loading && chartData.length > 0 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                {(() => { const TabIcon = tabs.find(t => t.key === tab)?.icon; return TabIcon ? <TabIcon className="w-4 h-4" /> : null; })()}
                مقارنة {tabs.find(t => t.key === tab)?.label}
              </h2>
              <LeaderboardBarChart chartData={chartData} tab={tab} />
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
                  <div className="w-8 text-center flex-shrink-0 flex items-center justify-center">
                    {idx < 3 ? (
                      <Medal className={`w-6 h-6 ${MEDAL_COLORS[idx]}`} />
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
                      <span className="inline-flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {item.streak} يوم</span>
                      <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {item.rxdCount} Rx'd</span>
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




