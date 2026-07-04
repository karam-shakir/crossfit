'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="text-orange-400 font-bold text-sm">{payload[0]?.value} {payload[0]?.payload?.unit}</div>
    </div>
  );
}

export default function PRHistoryChart({
  data, bestVal,
}: {
  data: { date: string; value: number; unit: string }[];
  bestVal: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
          domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={bestVal} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} />
        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5}
          dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#111827' }}
          activeDot={{ r: 6, fill: '#fb923c' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
