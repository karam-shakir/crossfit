'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function MeasurementTrendChart({
  data, color, bestVal, unitLabel,
}: {
  data: { date: string; value: number }[];
  color: string;
  bestVal: number;
  unitLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-gray-400 mb-1">{label}</div>
            <div style={{ color }} className="font-bold text-sm">
              {payload[0]?.value} {unitLabel}
            </div>
          </div>
        ) : null} />
        <ReferenceLine y={bestVal} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          dot={{ fill: color, r: 4, strokeWidth: 2, stroke: '#111827' }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
