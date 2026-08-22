'use client';
import { useState, useEffect } from 'react';

const CATEGORIES = [
  { value: 'legs',        label: '🦵 الساق والورك' },
  { value: 'free-weight', label: '🏆 القوة الحرة (الأوزان الحرة)' },
  { value: 'chest',       label: '🏠 الصدر' },
  { value: 'back',        label: '🔙 الظهر' },
  { value: 'shoulders',   label: '🎯 الكتفين' },
  { value: 'arms',        label: '💪 الذراعين' },
  { value: 'core',        label: '🔥 البطن والجذع' },
  { value: 'cardio',      label: '🏃 الكارديو' },
];

function emptyForm() {
  return { nameAr: '', nameEn: '', category: 'legs', muscleGroup: '', youtube: '' };
}

export default function GymCatalogModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm());

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch('/api/gym/catalog');
      if (r.ok) setList(await r.json());
    } catch {}
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function addExercise() {
    setError('');
    if (!form.nameEn) { setError('الاسم بالإنجليزي مطلوب'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/gym/catalog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'فشلت الإضافة'); setSaving(false); return; }
      setForm(emptyForm());
      setShowAddForm(false);
      await refresh();
    } catch {
      setError('فشلت الإضافة');
    }
    setSaving(false);
  }

  function startEdit(ex: any) {
    setEditId(ex.id);
    setEditForm({ nameAr: ex.nameAr || '', nameEn: ex.nameEn, category: ex.category, muscleGroup: ex.muscleGroup || '', youtube: ex.youtube || '' });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch('/api/gym/catalog', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    });
    setEditId(null);
    setSaving(false);
    await refresh();
  }

  async function deleteExercise(id: string) {
    if (!confirm('حذف هذا التمرين من كتالوج الجيم نهائياً؟ لن يستخدمه توليد الذكاء الاصطناعي بعدها.')) return;
    await fetch(`/api/gym/catalog?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  }

  const grouped = CATEGORIES.map(c => ({ ...c, items: list.filter(e => e.category === c.value) })).filter(c => c.items.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-white flex items-center gap-2">🏋️ مكتبة تمارين الجيم</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none px-2">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            هذا الكتالوج يغذّي توليد الذكاء الاصطناعي لجدول الجيم مباشرة — أي تمرين تضيفه هنا يدخل ضمن خيارات
            التوليد فوراً لكل الأعضاء، بلا حاجة لتعديل كود أو نشر جديد.
          </p>

          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-bold transition-colors">
              + إضافة تمرين/جهاز جديد
            </button>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="الاسم بالعربي (اختياري)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
                <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Name in English" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" dir="ltr" />
              </div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input value={form.muscleGroup} onChange={e => setForm(f => ({ ...f, muscleGroup: e.target.value }))}
                placeholder="العضلة المستهدفة (مثال: الرباعية والمؤخرة)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              <input value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))}
                placeholder="رابط شرح يوتيوب (اختياري — بحث عام تلقائي إن تُرك فارغاً)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" dir="ltr" />
              {error && <div className="text-xs text-red-400">{error}</div>}
              <div className="flex gap-2">
                <button onClick={addExercise} disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving ? '⏳ جارٍ الحفظ...' : 'حفظ التمرين'}
                </button>
                <button onClick={() => { setShowAddForm(false); setError(''); setForm(emptyForm()); }}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8 text-sm">جاري التحميل...</div>
            ) : list.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">لا توجد تمارين في الكتالوج بعد</div>
            ) : grouped.map(cat => (
              <div key={cat.value}>
                <div className="text-xs font-bold text-violet-400 mb-1.5">{cat.label}</div>
                <div className="space-y-1.5">
                  {cat.items.map(ex => (
                    <div key={ex.id} className="bg-gray-900 rounded-xl border border-gray-800 p-2.5">
                      {editId === ex.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={editForm.nameAr} onChange={e => setEditForm(f => ({ ...f, nameAr: e.target.value }))}
                              className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs" placeholder="الاسم بالعربي" />
                            <input value={editForm.nameEn} onChange={e => setEditForm(f => ({ ...f, nameEn: e.target.value }))}
                              className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs" dir="ltr" placeholder="Name in English" />
                          </div>
                          <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs">
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                          <input value={editForm.muscleGroup} onChange={e => setEditForm(f => ({ ...f, muscleGroup: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs" placeholder="العضلة المستهدفة" />
                          <input value={editForm.youtube} onChange={e => setEditForm(f => ({ ...f, youtube: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs" dir="ltr" placeholder="رابط شرح يوتيوب" />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(ex.id)} disabled={saving}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
                              حفظ
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-sm">
                              {ex.nameAr || ex.nameEn} <span className="text-gray-500 font-normal">({ex.nameEn})</span>
                            </div>
                            {ex.muscleGroup && <div className="text-[11px] text-gray-500 mt-0.5">💪 {ex.muscleGroup}</div>}
                            {ex.youtube ? (
                              <a href={ex.youtube} target="_blank" rel="noopener noreferrer" className="text-[11px] text-red-400 hover:text-red-300 mt-0.5 inline-block">🎬 رابط الشرح</a>
                            ) : (
                              <div className="text-[11px] text-amber-500 mt-0.5">⚠️ لا يوجد رابط شرح مخصص</div>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => startEdit(ex)}
                              className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-xs transition-colors">
                              ✏️
                            </button>
                            <button onClick={() => deleteExercise(ex.id)}
                              className="w-7 h-7 rounded-lg bg-red-900/40 hover:bg-red-700 text-red-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                              🗑
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
