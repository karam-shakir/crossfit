'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trophy } from 'lucide-react';

function formatVal(val: number, isTime: boolean): string {
  if (!isTime) return String(val);
  const m = Math.floor(val / 60);
  const s = val % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BenchmarkProgressChart({
  data, bestVal, isTime,
}: {
  data: { date: string; value: number; result: string }[];
  bestVal: number;
  isTime: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} axisLine={false}
          domain={['auto', 'auto']} tickFormatter={v => formatVal(v, isTime)} />
        <Tooltip content={({ active, payload }) => active && payload?.length ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-orange-400 font-bold">{payload[0]?.payload?.result}</div>
            {payload[0]?.payload?.result === formatVal(bestVal, isTime) && (
              <div className="text-green-400 text-xs flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> أفضل نتيجة</div>
            )}
          </div>
        ) : null} />
        <ReferenceLine y={bestVal} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: '🏆', position: 'right', fontSize: 10 }} />
        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5}
          dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#1f2937' }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
