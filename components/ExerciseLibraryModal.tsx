'use client';
import { useState, useEffect } from 'react';
import { Puzzle, Trash2, Sparkles, ArrowUpCircle, Loader2, Sun, Dumbbell, Flame, Wind } from 'lucide-react';

const SECTIONS = [
  { key: 'warmup',    label: 'الإحماء',   icon: Sun },
  { key: 'strength',  label: 'القوة',     icon: Dumbbell },
  { key: 'metcon',    label: 'الـ WOD',   icon: Flame },
  { key: 'accessory', label: 'الأكسسوار', icon: Dumbbell },
  { key: 'cooldown',  label: 'الإطالات',  icon: Wind },
];

const CATEGORIES = [
  { value: 'strength',   label: 'قوة' },
  { value: 'olympic',    label: 'أولمبي' },
  { value: 'gymnastics', label: 'جمناستيك' },
  { value: 'cardio',     label: 'كارديو' },
  { value: 'wod',        label: 'وود' },
  { value: 'mobility',   label: 'إطالة' },
];

const FOCUS_CLASSES = [
  { value: 'concentrated', label: 'مركّز', hint: 'يُعامَل دائماً كحركة ثقيلة — يمنع تكراره مع تمرين ثقيل آخر من نفس المجموعة العضلية في نفس اليوم' },
  { value: 'variable',     label: 'متغيّر', hint: 'ثقله يعتمد على وصفة الويد نفسها — لا قيد صارم' },
  { value: 'diffuse',      label: 'منتشر', hint: 'وزن جسم أو خفيف عادة — مسموح دائماً، لا يدخل في محظورات الدمج' },
];

const MUSCLE_GROUPS = [
  { value: 'squat', label: 'القرفصاء (Squat)' },
  { value: 'hinge', label: 'مفصل الورك (Hinge)' },
  { value: 'chest', label: 'الصدر (Chest)' },
  { value: 'overhead-push', label: 'الدفع فوق الرأس (Overhead Push)' },
  { value: 'back-pull', label: 'سحب الظهر (Back Pull)' },
  { value: 'grip', label: 'القبضة (Grip)' },
  { value: 'core', label: 'الجذع (Core)' },
  { value: 'arms-isolation', label: 'عزل الذراعين (Arms Isolation)' },
  { value: 'full-body-concentrated', label: 'الجسم الكامل المركّز (Full-Body Concentrated)' },
  { value: 'full-body-variable', label: 'الجسم الكامل المتغيّر (Full-Body Variable)' },
  { value: 'cardio', label: 'كارديو (Cardio)' },
  { value: 'warmup-activation', label: 'تفعيل الإحماء (Warmup Activation)' },
];

const METCON_CATEGORIES = [
  { value: 'push',        label: 'دفع (Push)' },
  { value: 'pull',        label: 'سحب (Pull)' },
  { value: 'hip-explode', label: 'انفجار الورك (Hip/Explode)' },
  { value: 'mono',        label: 'مونو/آلة (Mono)' },
];

function emptyForm() {
  return { nameAr: '', nameEn: '', category: 'strength', youtube: '', muscles: '', sections: [] as string[] };
}

export default function ExerciseLibraryModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteForm, setPromoteForm] = useState({ focusClass: '', muscleGroup: '', metconStimulusCategory: '' });

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch('/api/exercises');
      if (r.ok) setList(await r.json());
    } catch {}
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function addExercise() {
    setError('');
    if (!form.nameAr || !form.nameEn) { setError('الاسم بالعربي والإنجليزي مطلوبان'); return; }
    if (!form.sections.length) { setError('اختر قسماً واحداً على الأقل يظهر فيه التمرين'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/exercises', {
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

  async function deleteExercise(id: string) {
    if (!confirm('حذف هذا التمرين نهائياً؟ لن يظهر بعدها في أي قائمة تعديل يدوي.')) return;
    await fetch(`/api/exercises?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  }

  async function toggleSection(id: string, sections: string[], key: string) {
    const next = sections.includes(key) ? sections.filter(s => s !== key) : [...sections, key];
    await fetch('/api/exercises', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, sections: next }),
    });
    await refresh();
  }

  function startPromote(ex: any) {
    setPromoteId(ex.id);
    setPromoteForm({
      focusClass: ex.focusClass || '',
      muscleGroup: ex.muscleGroup || '',
      metconStimulusCategory: ex.metconStimulusCategory || '',
    });
  }

  async function submitPromote(ex: any) {
    setError('');
    if (!promoteForm.focusClass || !promoteForm.muscleGroup) {
      setError('فئة التركيز والمجموعة العضلية مطلوبتان للترقية'); return;
    }
    if ((ex.sections || []).includes('metcon') && !promoteForm.metconStimulusCategory) {
      setError('فئة محفز الميتكون مطلوبة لأن هذا التمرين مخصص لقسم الميتكون'); return;
    }
    setSaving(true);
    const r = await fetch('/api/exercises', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ex.id, aiEligible: true, ...promoteForm }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { setError(data.error || 'فشلت الترقية'); setSaving(false); return; }
    setPromoteId(null);
    setSaving(false);
    await refresh();
  }

  async function revokeEligibility(id: string) {
    await fetch('/api/exercises', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, aiEligible: false }),
    });
    await refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-white flex items-center gap-2"><Puzzle className="w-5 h-5" /> مكتبة التمارين</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none px-2">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            التمارين هنا تُضاف لاستخدامك اليدوي فوراً في أي قسم تختاره. الذكاء الاصطناعي لن يختارها تلقائياً إلا بعد
            "ترقيتها" بتصنيف دقيق (فئة التركيز والمجموعة العضلية) — هذا يحمي جودة التوليد من تصنيف غير مضبوط.
          </p>

          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-sm font-bold transition-colors">
              + إضافة تمرين جديد
            </button>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="الاسم بالعربي" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Name in English" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" dir="ltr" />
              </div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <div>
                <div className="text-xs text-gray-500 mb-1.5">يظهر في قوائم:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SECTIONS.map(s => (
                    <button key={s.key} type="button"
                      onClick={() => setForm(f => ({ ...f, sections: f.sections.includes(s.key) ? f.sections.filter(x => x !== s.key) : [...f.sections, s.key] }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${form.sections.includes(s.key) ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <input value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))}
                placeholder="رابط يوتيوب (اختياري)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" dir="ltr" />
              <input value={form.muscles} onChange={e => setForm(f => ({ ...f, muscles: e.target.value }))}
                placeholder="العضلات المستهدفة (اختياري)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
              {error && <div className="text-xs text-red-400">{error}</div>}
              <div className="flex gap-2">
                <button onClick={addExercise} disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-1.5">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</> : 'حفظ التمرين'}
                </button>
                <button onClick={() => { setShowAddForm(false); setError(''); setForm(emptyForm()); }}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {loading ? (
              <div className="text-center text-gray-500 py-8 text-sm">جاري التحميل...</div>
            ) : list.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">لا توجد تمارين مضافة بعد</div>
            ) : list.map(ex => (
              <div key={ex.id} className="bg-gray-900 rounded-xl border border-gray-800 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm">{ex.nameAr} <span className="text-gray-500 font-normal">({ex.nameEn})</span></div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(ex.sections || []).map((s: string) => {
                        const sec = SECTIONS.find(sec => sec.key === s);
                        return (
                          <span key={s} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            {sec ? <><sec.icon className="w-3 h-3" /> {sec.label}</> : s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={() => deleteExercise(ex.id)}
                    className="w-7 h-7 flex-shrink-0 rounded-lg bg-red-900/40 hover:bg-red-700 text-red-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {ex.aiEligible ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> مؤهل للذكاء الاصطناعي</span>
                    <button onClick={() => revokeEligibility(ex.id)} className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
                      إلغاء التأهيل
                    </button>
                  </div>
                ) : promoteId === ex.id ? (
                  <div className="bg-gray-950 rounded-lg border border-gray-800 p-2.5 space-y-2">
                    <div>
                      <select value={promoteForm.focusClass} onChange={e => setPromoteForm(f => ({ ...f, focusClass: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500">
                        <option value="">فئة التركيز...</option>
                        {FOCUS_CLASSES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      {promoteForm.focusClass && (
                        <div className="text-[10px] text-gray-500 mt-1">{FOCUS_CLASSES.find(f => f.value === promoteForm.focusClass)?.hint}</div>
                      )}
                    </div>
                    <select value={promoteForm.muscleGroup} onChange={e => setPromoteForm(f => ({ ...f, muscleGroup: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500">
                      <option value="">المجموعة العضلية...</option>
                      {MUSCLE_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    {(ex.sections || []).includes('metcon') && (
                      <select value={promoteForm.metconStimulusCategory} onChange={e => setPromoteForm(f => ({ ...f, metconStimulusCategory: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500">
                        <option value="">فئة محفز الميتكون...</option>
                        {METCON_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    )}
                    {error && <div className="text-[11px] text-red-400">{error}</div>}
                    <div className="flex gap-2">
                      <button onClick={() => submitPromote(ex)} disabled={saving}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold transition-colors">
                        تأكيد الترقية
                      </button>
                      <button onClick={() => { setPromoteId(null); setError(''); }}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startPromote(ex)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors inline-flex items-center gap-1">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> ترقية للذكاء الاصطناعي
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
