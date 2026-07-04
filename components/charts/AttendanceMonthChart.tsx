'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AttendanceMonthChart({ data, maxCount }: { data: { month: string; count: number; isCurrent: boolean }[]; maxCount: number }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
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
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isCurrent ? '#f97316' : entry.count >= maxCount * 0.7 ? '#fb923c' : '#374151'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
