'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const FIELDS = [
  { key: 'weight',   label: 'الوزن (كجم)',     icon: '⚖️', lowerIsBetter: true  },
  { key: 'height',   label: 'الطول (سم)',       icon: '📏', lowerIsBetter: false },
  { key: 'bodyFat',  label: 'نسبة الدهون (%)',  icon: '💧', lowerIsBetter: true  },
  { key: 'chest',    label: 'الصدر (سم)',        icon: '💪', lowerIsBetter: false },
  { key: 'waist',    label: 'الخصر (سم)',        icon: '🎯', lowerIsBetter: true  },
  { key: 'hips',     label: 'الأرداف (سم)',      icon: '📐', lowerIsBetter: null  },
  { key: 'shoulders',label: 'الأكتاف (سم)',      icon: '🦅', lowerIsBetter: false },
  { key: 'arm',      label: 'الذراع (سم)',        icon: '💪', lowerIsBetter: false },
  { key: 'thigh',    label: 'الفخذ (سم)',         icon: '🦵', lowerIsBetter: false },
];

// Simple SVG line chart
function MiniChart({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 200, H = 50, PAD = 4;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - v) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

export default function MeasurementsClient({ member }: { member: any }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ date: new Date().toISOString().split('T')[0] });
  const [chartField, setChartField] = useState('weight');

  useEffect(() => {
    fetch('/api/measurements')
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    const body = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, k === 'date' ? v : v ? Number(v) : undefined])
    );
    const res = await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const record = await res.json();
      setRecords(prev => [record, ...prev]);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0] });
    }
    setSaving(false);
  }

  const latest = records[0];
  const prev = records[1];

  function diff(key: string) {
    if (!latest || !prev || !latest[key] || !prev[key]) return null;
    const d = latest[key] - prev[key];
    return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
  }

  // Chart data: oldest first
  const chartData = records
    .filter(r => r[chartField] != null)
    .map(r => ({ date: r.date, value: r[chartField] }))
    .reverse();

  const chartField_info = FIELDS.find(f => f.key === chartField);

  return (
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">📏 القياسات الجسدية</h1>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              + قياس جديد
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-orange-700 space-y-3">
              <h2 className="font-semibold text-orange-400">إضافة قياسات جديدة</h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">التاريخ</label>
                <input type="date" value={form.date} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.icon} {f.label}</label>
                    <input type="number" step="0.1" value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="—" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                  {saving ? 'جاري الحفظ...' : 'حفظ القياسات 📏'}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">إلغاء</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : !latest ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
              <div className="text-5xl mb-4">📏</div>
              <div className="text-gray-400">لا توجد قياسات بعد</div>
            </div>
          ) : (
            <>
              {/* Latest */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="font-semibold text-white">آخر قياس</h2>
                  <span className="text-xs text-gray-400">{latest.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-0">
                  {FIELDS.filter(f => latest[f.key]).map((f, i) => {
                    const d = diff(f.key);
                    const isGood = d ? (f.lowerIsBetter ? !d.startsWith('+') : d.startsWith('+')) : null;
                    return (
                      <div key={f.key} className={`p-3 text-center ${i % 3 !== 2 ? 'border-l border-gray-800' : ''} border-b border-gray-800`}>
                        <div className="text-lg font-bold text-white">{latest[f.key]}</div>
                        <div className="text-xs text-gray-500">{f.icon} {f.label.split(' ')[0]}</div>
                        {d && (
                          <div className={`text-xs font-semibold ${isGood === true ? 'text-green-400' : isGood === false ? 'text-red-400' : 'text-gray-400'}`}>
                            {d}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 📈 Progress Chart */}
              {records.length >= 2 && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span>📈</span> الرسم البياني للتقدم
                  </h2>

                  {/* Field selector */}
                  <div className="flex gap-2 flex-wrap">
                    {FIELDS.filter(f => records.some(r => r[f.key] != null)).map(f => (
                      <button key={f.key} onClick={() => setChartField(f.key)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          chartField === f.key
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}>
                        {f.icon} {f.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Chart */}
                  {chartData.length >= 2 ? (
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                        <span>{chartData[0]?.date}</span>
                        <span className="text-white font-semibold">
                          {chartField_info?.icon} {chartField_info?.label}
                        </span>
                        <span>{chartData[chartData.length - 1]?.date}</span>
                      </div>
                      <MiniChart
                        data={chartData.map(d => d.value)}
                        color={
                          chartField_info?.lowerIsBetter === true ? '#ef4444' :
                          chartField_info?.lowerIsBetter === false ? '#22c55e' : '#f97316'
                        }
                      />
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500">
                          أدنى: <span className="text-white">{Math.min(...chartData.map(d => d.value))}</span>
                        </span>
                        <span className="text-gray-500">
                          أعلى: <span className="text-white">{Math.max(...chartData.map(d => d.value))}</span>
                        </span>
                        <span className="text-gray-500">
                          التغيير: <span className={
                            chartData[chartData.length - 1]?.value > chartData[0]?.value
                              ? chartField_info?.lowerIsBetter ? 'text-red-400' : 'text-green-400'
                              : chartField_info?.lowerIsBetter ? 'text-green-400' : 'text-red-400'
                          }>
                            {((chartData[chartData.length - 1]?.value - chartData[0]?.value) > 0 ? '+' : '')}
                            {(chartData[chartData.length - 1]?.value - chartData[0]?.value).toFixed(1)}
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-3">أضف قياسَين على الأقل لعرض الرسم البياني</p>
                  )}
                </div>
              )}

              {/* History */}
              {records.length > 1 && (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-400">السجل التاريخي</h2>
                  {records.slice(1).map((r: any) => (
                    <div key={r.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                      <div className="text-xs text-gray-500 mb-2">{r.date}</div>
                      <div className="flex flex-wrap gap-3">
                        {FIELDS.filter(f => r[f.key]).map(f => (
                          <span key={f.key} className="text-xs bg-gray-800 px-2 py-1 rounded-lg text-gray-300">
                            {f.icon} {r[f.key]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
