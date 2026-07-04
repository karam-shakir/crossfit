'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function LeaderboardBarChart({
  chartData, tab,
}: {
  chartData: { name: string; value: number; isMe: boolean }[];
  tab: 'month' | 'total' | 'prs' | 'streak';
}) {
  return (
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
  );
}
