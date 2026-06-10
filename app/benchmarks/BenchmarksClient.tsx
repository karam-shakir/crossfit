'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExerciseCard from '@/components/ExerciseCard';

export default function BenchmarksClient({ member }: { member: any }) {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [showAddResult, setShowAddResult] = useState(false);
  const [resultForm, setResultForm] = useState({ result: '', rxd: false, date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'girls' | 'heroes'>('girls');

  useEffect(() => {
    fetch('/api/benchmarks').then(r => r.json()).then(d => { setBenchmarks(d); setLoading(false); });
  }, []);

  async function saveResult() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch('/api/benchmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resultForm, benchmarkId: selected.id }),
    });
    if (res.ok) {
      const result = await res.json();
      setBenchmarks(prev => prev.map(b =>
        b.id === selected.id ? { ...b, myResults: [...(b.myResults || []), result] } : b
      ));
      setSelected((prev: any) => prev ? { ...prev, myResults: [...(prev.myResults || []), result] } : prev);
      setShowAddResult(false);
      setResultForm({ result: '', rxd: false, date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setSaving(false);
  }

  const filtered = benchmarks.filter(b => b.category === tab);

  return (
    <div className="min-h-dvh flex w-full">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <h1 className="text-xl font-bold text-white">📊 البنشمارك الكلاسيكية</h1>

          <div className="flex gap-2">
            <button onClick={() => setTab('girls')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'girls' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              👧 البنات (Girls)
            </button>
            <button onClick={() => setTab('heroes')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'heroes' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🦸 الأبطال (Heroes)
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => {
                const best = b.myResults?.[b.myResults.length - 1];
                return (
                  <button key={b.id} onClick={() => setSelected(b)}
                    className="w-full bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 p-4 text-right transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {b.nameAr}
                          <span className="text-gray-500 text-sm">({b.nameEn})</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{b.description}</div>
                        <div className="text-xs text-orange-400 mt-1">{b.type} • {b.scheme}</div>
                      </div>
                      {best ? (
                        <div className="text-left flex-shrink-0">
                          <div className="text-orange-400 font-bold text-sm">{best.result}</div>
                          {best.rxd && <div className="text-xs text-green-400">Rx'd ✅</div>}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 flex-shrink-0">لم تُؤدَ بعد</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Benchmark detail modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/70 p-4">
              <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white text-lg">{selected.nameAr}</h2>
                    <div className="text-xs text-gray-400">{selected.description}</div>
                  </div>
                  <button onClick={() => { setSelected(null); setShowAddResult(false); }}
                    className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    ×
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Exercises */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">التمارين</h3>
                    <div className="space-y-3">
                      {selected.exercises?.filter(Boolean).map((ex: any, i: number) => (
                        <ExerciseCard key={i} item={{ exerciseId: ex.id, exercise: ex }} index={i} />
                      ))}
                    </div>
                  </div>

                  {/* My results */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400">نتائجي</h3>
                      <button onClick={() => setShowAddResult(!showAddResult)}
                        className="text-xs bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 rounded-lg transition-colors">
                        + إضافة نتيجة
                      </button>
                    </div>

                    {showAddResult && (
                      <div className="bg-gray-800 rounded-xl p-3 space-y-3 mb-3">
                        <input type="text" value={resultForm.result} onChange={e => setResultForm(p => ({ ...p, result: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                          placeholder="مثال: 3:45 أو 12 rounds + 5" />
                        <div className="flex gap-3">
                          <input type="date" value={resultForm.date} onChange={e => setResultForm(p => ({ ...p, date: e.target.value }))}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                          <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input type="checkbox" checked={resultForm.rxd} onChange={e => setResultForm(p => ({ ...p, rxd: e.target.checked }))}
                              className="accent-orange-500" /> Rx'd
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveResult} disabled={!resultForm.result || saving}
                            className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                            {saving ? '...' : 'حفظ'}
                          </button>
                          <button onClick={() => setShowAddResult(false)}
                            className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm transition-colors">
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    {selected.myResults?.length > 0 ? (
                      <div className="space-y-2">
                        {[...selected.myResults].reverse().map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2">
                            <div>
                              <span className="font-mono text-orange-400 font-semibold">{r.result}</span>
                              {r.rxd && <span className="text-xs text-green-400 mr-2">Rx'd</span>}
                            </div>
                            <span className="text-xs text-gray-500">{r.date}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-4">لم تُسجَّل نتيجة بعد</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


