'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function LogbookClient({ member }: { member: any }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    wodTitle: '', result: '', weight: '', rounds: '', time: '', reps: '',
    notes: '', rxd: false, date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetch('/api/logbook').then(r => r.json()).then(data => { setEntries(data); setLoading(false); });
  }, []);

  async function saveEntry() {
    setSaving(true);
    const res = await fetch('/api/logbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const entry = await res.json();
      setEntries(prev => [entry, ...prev]);
      setShowForm(false);
      setForm({ wodTitle: '', result: '', weight: '', rounds: '', time: '', reps: '', notes: '', rxd: false, date: new Date().toISOString().split('T')[0] });
    }
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    if (!confirm('حذف هذا التسجيل؟')) return;
    await fetch(`/api/logbook?id=${id}`, { method: 'DELETE' });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">📓 سجل التمارين</h1>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              + تسجيل جلسة
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-orange-700 space-y-3">
              <h2 className="font-semibold text-orange-400">تسجيل جلسة تمرين</h2>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">اسم التمرين / WOD</label>
                <input type="text" value={form.wodTitle} onChange={e => setForm(p => ({ ...p, wodTitle: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="مثال: فران، أو WOD اليوم" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">الوقت (دقيقة:ثانية)</label>
                  <input type="text" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: 8:32" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">الراوندات</label>
                  <input type="text" value={form.rounds} onChange={e => setForm(p => ({ ...p, rounds: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: 8+5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">الوزن المستخدم</label>
                  <input type="text" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: 60 كجم" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">عدد التكرارات</label>
                  <input type="text" value={form.reps} onChange={e => setForm(p => ({ ...p, reps: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: 150" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">النتيجة الكاملة</label>
                <input type="text" value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="مثال: 8:32 Rx'd أو 7 rounds + 5 reps" />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                  rows={2} placeholder="كيف كان التمرين؟ أي إصابات؟ نقاط للتطوير؟" />
              </div>

              <div className="flex items-center gap-3">
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.rxd} onChange={e => setForm(p => ({ ...p, rxd: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500" />
                  Rx'd ✅
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={saveEntry} disabled={!form.wodTitle || saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                  {saving ? 'جاري الحفظ...' : 'حفظ الجلسة 📓'}
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
          ) : entries.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
              <div className="text-5xl mb-4">📓</div>
              <div className="text-gray-400">لا توجد تمارين مسجلة بعد</div>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry: any) => (
                <div key={entry.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{entry.wodTitle}</span>
                        {entry.rxd && <span className="text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full">Rx'd</span>}
                      </div>
                      {entry.result && (
                        <div className="text-orange-400 font-mono text-sm mt-1">{entry.result}</div>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {entry.time && <span className="text-xs text-gray-400">⏱ {entry.time}</span>}
                        {entry.rounds && <span className="text-xs text-gray-400">🔄 {entry.rounds} راوندات</span>}
                        {entry.weight && <span className="text-xs text-gray-400">🏋️ {entry.weight}</span>}
                        {entry.reps && <span className="text-xs text-gray-400">× {entry.reps} تكرار</span>}
                      </div>
                      {entry.notes && (
                        <div className="text-xs text-gray-500 mt-2 italic">"{entry.notes}"</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{entry.date}</span>
                      <button onClick={() => deleteEntry(entry.id)}
                        className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-red-800 flex items-center justify-center text-xs transition-colors">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
