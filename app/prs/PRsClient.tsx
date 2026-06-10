'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const UNITS = [
  { value: 'kg', label: 'كيلو (وزن)' },
  { value: 'min', label: 'دقائق (وقت)' },
  { value: 'sec', label: 'ثواني (وقت)' },
  { value: 'reps', label: 'تكرارات' },
];

export default function PRsClient({ member, exercises }: { member: any; exercises: any[] }) {
  const [prs, setPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ exerciseId: '', value: '', unit: 'kg', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/prs').then(r => r.json()).then(data => { setPRs(data); setLoading(false); });
  }, []);

  async function addPR() {
    setSaving(true);
    const res = await fetch('/api/prs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: Number(form.value) }),
    });
    if (res.ok) {
      const newPR = await res.json();
      const ex = exercises.find(e => e.id === newPR.exerciseId);
      setPRs(prev => [...prev, { ...newPR, exercise: ex }]);
      setShowForm(false);
      setForm({ exerciseId: '', value: '', unit: 'kg', date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setSaving(false);
  }

  async function deletePR(id: string) {
    if (!confirm('حذف هذا الرقم؟')) return;
    await fetch(`/api/prs?id=${id}`, { method: 'DELETE' });
    setPRs(prev => prev.filter(p => p.id !== id));
  }

  // Group PRs by exercise, keep best per exercise
  const bestPRs = exercises.map(ex => {
    const exPRs = prs.filter(p => p.exerciseId === ex.id).sort((a, b) => {
      if (a.unit === 'kg' || a.unit === 'reps') return b.value - a.value;
      return a.value - b.value;
    });
    return exPRs.length > 0 ? { ...exPRs[0], exercise: ex, history: exPRs } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-dvh flex overflow-x-clip">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-clip">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">🏆 أرقامي الشخصية</h1>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              + رقم جديد
            </button>
          </div>

          {/* Add PR form */}
          {showForm && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-orange-700 space-y-3">
              <h2 className="font-semibold text-orange-400">إضافة رقم شخصي جديد</h2>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">التمرين</label>
                <select value={form.exerciseId} onChange={e => setForm(p => ({ ...p, exerciseId: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                  <option value="">اختر التمرين</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.nameAr} ({ex.nameEn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">القيمة</label>
                  <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: 100" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">الوحدة</label>
                  <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">التاريخ</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">ملاحظات (اختياري)</label>
                <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="مثال: بحزام / بدون حزام" />
              </div>

              <div className="flex gap-3">
                <button onClick={addPR} disabled={!form.exerciseId || !form.value || saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                  {saving ? 'جاري الحفظ...' : 'حفظ الرقم 🏆'}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : prs.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-gray-400">لا توجد أرقام شخصية بعد</div>
              <div className="text-gray-600 text-sm mt-1">أضف أول رقم لك!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {bestPRs.map((pr: any) => (
                <div key={pr.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex-shrink-0">
                      {pr.exercise?.gif && (
                        <img src={pr.exercise.gif} alt={pr.exercise.nameAr}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{pr.exercise?.nameAr}</div>
                      <div className="text-xs text-gray-400">{pr.exercise?.nameEn}</div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <div className="text-2xl font-bold text-orange-400">
                        {pr.value}
                        <span className="text-sm text-gray-400 mr-1">{pr.unit === 'kg' ? 'كجم' : pr.unit === 'min' ? 'دقيقة' : pr.unit === 'sec' ? 'ثانية' : 'تكرار'}</span>
                      </div>
                      <div className="text-xs text-gray-500">{pr.date}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {pr.exercise?.youtube && (
                        <a href={pr.exercise.youtube} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 flex items-center justify-center text-xs transition-colors">▶</a>
                      )}
                      <button onClick={() => deletePR(pr.id)}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-red-800 flex items-center justify-center text-xs transition-colors">
                        🗑
                      </button>
                    </div>
                  </div>

                  {pr.history?.length > 1 && (
                    <div className="border-t border-gray-800 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                      {pr.history.slice(0, 5).map((h: any, i: number) => (
                        <div key={h.id} className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg ${i === 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-700' : 'bg-gray-800 text-gray-400'}`}>
                          {h.value} {h.unit} <span className="text-gray-600">— {h.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

