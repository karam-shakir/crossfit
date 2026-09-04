'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

// يقصّ الاسم إن كان طويلاً حتى لا يتداخل مع باقي عناصر الرسم البياني على الشاشات الضيقة
function truncateName(name: string, max: number): string {
  if (!name) return '';
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export default function LeaderboardBarChart({
  chartData, tab,
}: {
  chartData: { name: string; value: number; isMe: boolean }[];
  tab: 'month' | 'total' | 'prs' | 'streak';
}) {
  // نتابع عرض الشاشة لتصغير محور الأسماء والخطوط على الجوال حتى لا تتداخل التسميات
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    function check() {
      setIsNarrow(window.innerWidth < 400);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const yAxisWidth = isNarrow ? 42 : 56;
  const tickFontSize = isNarrow ? 10 : 11;
  const maxNameChars = isNarrow ? 5 : 8;
  const rightMargin = isNarrow ? 28 : 36;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: rightMargin, left: 0, bottom: 4 }} barCategoryGap="25%">
        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#d1d5db', fontSize: tickFontSize }}
          tickLine={false}
          axisLine={false}
          width={yAxisWidth}
          tickFormatter={(value: string) => truncateName(value, maxNameChars)}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          content={({ active, payload }) => active && payload?.length ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
              <div className="text-white font-semibold mb-0.5">{payload[0].payload.name}</div>
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
  );
}
