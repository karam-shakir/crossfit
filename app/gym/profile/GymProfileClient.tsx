'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const GOALS = [
  { value: 'weight_loss',    label: 'خسارة الوزن',       icon: '🔥', desc: 'حرق دهون + كارديو' },
  { value: 'muscle_gain',    label: 'بناء العضلة',        icon: '💪', desc: 'أحمال ثقيلة + بروتين' },
  { value: 'strength',       label: 'القوة',              icon: '🏋️', desc: 'compound ثقيلة' },
  { value: 'general_fitness',label: 'لياقة عامة',         icon: '⚡', desc: 'تنويع شامل' },
  { value: 'body_recomp',    label: 'إعادة تشكيل الجسم', icon: '🎯', desc: 'قوة + كارديو' },
];

const LEVELS = [
  { value: 'beginner',     label: 'مبتدئ',   color: 'border-green-500 bg-green-900/20 text-green-300' },
  { value: 'intermediate', label: 'متوسط',   color: 'border-blue-500 bg-blue-900/20 text-blue-300' },
  { value: 'advanced',     label: 'متقدم',   color: 'border-orange-500 bg-orange-900/20 text-orange-300' },
  { value: 'elite',        label: 'محترف',   color: 'border-red-500 bg-red-900/20 text-red-300' },
];

const FOCUS_AREAS = ['الصدر', 'الظهر', 'الأرجل', 'الأكتاف', 'الذراعين', 'البطن والجذع', 'المؤخرة'];

export default function GymProfileClient({ member, initialProfile }: { member: any; initialProfile: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [goal, setGoal] = useState(initialProfile?.goal || 'general_fitness');
  const [level, setLevel] = useState(initialProfile?.level || 'beginner');
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(initialProfile?.height?.toString() || '');
  const [daysPerWeek, setDaysPerWeek] = useState(initialProfile?.daysPerWeek || 3);
  const [focusAreas, setFocusAreas] = useState<string[]>(initialProfile?.focusAreas || []);
  const [limitations, setLimitations] = useState(initialProfile?.limitations || '');

  function toggleFocus(area: string) {
    setFocusAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/gym/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, level, age, weight, height, daysPerWeek, focusAreas, limitations }),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/gym'); }, 1500);
    setSaving(false);
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-24 lg:pb-6">
        <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">

          <div className="flex items-center gap-3">
            <span className="text-3xl">🏋️</span>
            <div>
              <h1 className="text-xl font-bold text-white">البروفايل التدريبي</h1>
              <p className="text-xs text-gray-400">يساعد المدرب على تصميم جدول مخصص لك</p>
            </div>
          </div>

          {/* الهدف */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">🎯 هدفك من التدريب</h2>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-colors ${goal === g.value ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400'}`}>
                  <span className="text-xl">{g.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{g.label}</div>
                    <div className="text-xs text-gray-500">{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* المستوى */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">📊 مستواك الحالي</h2>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map(l => (
                <button key={l.value} onClick={() => setLevel(l.value)}
                  className={`py-3 rounded-xl border font-semibold text-sm transition-colors ${level === l.value ? l.color : 'border-gray-700 bg-gray-800/50 text-gray-500'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* أيام التدريب */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">📅 أيام التدريب أسبوعياً</h2>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setDaysPerWeek(n)}
                  className={`flex-1 py-3 rounded-xl border font-bold text-lg transition-colors ${daysPerWeek === n ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              {daysPerWeek === 3 ? '3 أيام — Full Body (كامل الجسم)' : daysPerWeek === 4 ? '4 أيام — Upper / Lower' : daysPerWeek === 5 ? '5 أيام — Push / Pull / Legs' : '6 أيام — PPL مزدوج'}
            </p>
          </div>

          {/* مناطق التركيز */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">💪 مناطق التركيز (اختر ما تريد تطويره)</h2>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map(area => (
                <button key={area} onClick={() => toggleFocus(area)}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors ${focusAreas.includes(area) ? 'border-orange-500 bg-orange-900/30 text-orange-300' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* القياسات */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">📏 بياناتك (اختياري)</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'العمر', value: age, set: setAge, placeholder: '25', unit: 'سنة' },
                { label: 'الوزن', value: weight, set: setWeight, placeholder: '80', unit: 'كجم' },
                { label: 'الطول', value: height, set: setHeight, placeholder: '175', unit: 'سم' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label} ({f.unit})</label>
                  <input type="number" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          {/* قيود */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-white text-sm">⚠️ إصابات أو قيود (اختياري)</h2>
            <textarea value={limitations} onChange={e => setLimitations(e.target.value)}
              placeholder="مثال: ألم في الركبة اليسرى — لا أستطيع Leg Extension"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>

          <button onClick={save} disabled={saving}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-bold text-base transition-colors">
            {saved ? '✅ تم الحفظ! جاري التوجيه...' : saving ? '⏳ جاري الحفظ...' : '💾 حفظ البروفايل'}
          </button>

        </div>
      </main>
    </div>
  );
}
