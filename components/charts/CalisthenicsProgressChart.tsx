'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CalisthenicsProgressChart({
  data, unitLabel,
}: {
  data: { date: string; value: number; variation: string }[];
  unitLabel: string; // "تكرار" أو "ثانية"
}) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
            <div className="text-slate-500">{label}</div>
            <div className="text-violet-700 font-bold text-sm">{payload[0]?.value} {unitLabel}</div>
            <div className="text-slate-400 mt-0.5">{(payload[0]?.payload as any)?.variation}</div>
          </div>
        ) : null} />
        <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5}
          dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
