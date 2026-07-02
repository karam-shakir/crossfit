'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const GOALS = [
  { value: 'general_endurance', label: 'تحمل عام',        icon: '🏃', desc: 'بناء لياقة الجري والقاعدة الهوائية',    detail: '80% جري سهل • تدرج آمن في المسافات' },
  { value: 'fat_burn',          label: 'حرق الدهون',      icon: '🔥', desc: 'خسارة الوزن عبر الجري',                  detail: 'Zone 2 طويل + جلسة HIIT أسبوعية' },
  { value: 'race_5k',           label: 'سباق 5 كم',       icon: '⚡', desc: 'تحسين زمن الـ 5 كيلومتر',               detail: 'تكرارات سريعة + إيقاعي قصير' },
  { value: 'race_10k',          label: 'سباق 10 كم',      icon: '🎯', desc: 'تحسين زمن الـ 10 كيلومتر',              detail: 'سرعة + تحمل — الجمع بينهما' },
  { value: 'half_marathon',     label: 'نصف ماراثون',     icon: '🏅', desc: 'الاستعداد لـ 21.1 كم',                  detail: 'جري طويل متدرج حتى 19 كم' },
  { value: 'marathon',          label: 'ماراثون',         icon: '🏆', desc: 'الاستعداد لـ 42.2 كم',                  detail: 'أحجام عالية + جري طويل حتى 34 كم' },
  { value: 'speed',             label: 'سرعة قصوى',       icon: '💨', desc: 'تطوير السرعة الانفجارية',               detail: 'تكرارات قصيرة + Hill Sprints' },
];

const LEVELS = [
  { value: 'beginner',     label: 'مبتدئ', icon: '🟢', desc: 'أجري أحياناً أو أبدأ من الصفر', detail: 'مشي/جري متناوب، 15-25 كم أسبوعياً' },
  { value: 'intermediate', label: 'متوسط', icon: '🔵', desc: 'أجري بانتظام منذ 6 أشهر+',      detail: 'جري متواصل مريح، 25-45 كم أسبوعياً' },
  { value: 'advanced',     label: 'متقدم', icon: '🟠', desc: 'سنتان+ وشاركت في سباقات',       detail: 'جلسات جودة منظمة، 45-70 كم أسبوعياً' },
  { value: 'elite',        label: 'نخبة',  icon: '🔴', desc: 'عداء تنافسي جاد',               detail: 'أحجام عالية وجودة مزدوجة، 70+ كم' },
];

const SURFACES = [
  { value: 'outdoor',   label: 'خارجي',   icon: '🌳', desc: 'شوارع وممشى' },
  { value: 'treadmill', label: 'تريدميل', icon: '🏃', desc: 'سير كهربائي' },
  { value: 'track',     label: 'مضمار',   icon: '🏟️', desc: 'مضمار 400م' },
  { value: 'mixed',     label: 'مختلط',   icon: '🔄', desc: 'حسب الجلسة' },
];

const DAYS_INFO: Record<number, { split: string; desc: string }> = {
  3: { split: 'سهل + جودة + طويل',            desc: 'الأساس الذهبي — أفضل بداية بأقل خطر إصابة' },
  4: { split: 'سهل + تكرارات + إيقاعي + طويل', desc: 'توازن مثالي بين السرعة والتحمل' },
  5: { split: '+ جري استرداد',                 desc: 'للعداء الجاد — قاعدة 80/20 الكاملة' },
  6: { split: '+ تلال وانطلاقات',              desc: 'للمتقدم والنخبة — يوم راحة واحد إجباري' },
};

export default function RunningProfileClient({ member, initialProfile }: { member: any; initialProfile: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [goal, setGoal] = useState(initialProfile?.goal || 'general_endurance');
  const [level, setLevel] = useState(initialProfile?.level || 'beginner');
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(initialProfile?.height?.toString() || '');
  const [daysPerWeek, setDaysPerWeek] = useState(initialProfile?.daysPerWeek || 3);
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState(initialProfile?.currentWeeklyKm?.toString() || '');
  const [best5kTime, setBest5kTime] = useState(initialProfile?.best5kTime || '');
  const [best10kTime, setBest10kTime] = useState(initialProfile?.best10kTime || '');
  const [surface, setSurface] = useState(initialProfile?.surface || 'mixed');
  const [targetRaceDate, setTargetRaceDate] = useState(initialProfile?.targetRaceDate || '');
  const [limitations, setLimitations] = useState(initialProfile?.limitations || '');

  async function save() {
    setSaving(true);
    await fetch('/api/running/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender, goal, level, age, weight, height, daysPerWeek, currentWeeklyKm, best5kTime, best10kTime, surface, targetRaceDate, limitations }),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/running'); }, 1500);
    setSaving(false);
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-cyan-600 rounded-2xl p-5 shadow-lg shadow-cyan-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl flex-shrink-0">
                🏃
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">بروفايل العدّاء</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {member.nameAr} — يساعد المدرب على تصميم برنامج جريك المثالي
                </p>
              </div>
            </div>
          </div>

          {/* الجنس */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>👤</span> الجنس</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'male',   label: 'ذكر',  icon: '♂️' },
                { value: 'female', label: 'أنثى', icon: '♀️' },
              ].map(g => (
                <button key={g.value} onClick={() => setGender(g.value as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${gender === g.value ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-bold text-base">{g.label}</span>
                  {gender === g.value && <span className="mr-auto text-cyan-600 text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>🎯</span> هدفك من الجري</h2>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${goal === g.value ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${goal === g.value ? 'text-cyan-800' : 'text-slate-700'}`}>{g.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{g.desc}</div>
                    {goal === g.value && <div className="text-xs text-cyan-700 mt-1.5 bg-cyan-100 rounded-lg px-2 py-1">{g.detail}</div>}
                  </div>
                  {goal === g.value && <span className="text-cyan-600 text-xl flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* المستوى */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>📊</span> مستواك الحالي</h2>
            <div className="space-y-2">
              {LEVELS.map(l => (
                <button key={l.value} onClick={() => setLevel(l.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${level === l.value ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <span className="text-2xl flex-shrink-0">{l.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${level === l.value ? 'text-cyan-800' : 'text-slate-700'}`}>{l.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{l.desc}</div>
                    {level === l.value && <div className="text-xs text-cyan-700 mt-1.5">{l.detail}</div>}
                  </div>
                  {level === l.value && <span className="text-cyan-600 text-xl flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* أيام الجري */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>📅</span> أيام الجري أسبوعياً</h2>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setDaysPerWeek(n)}
                  className={`py-4 rounded-xl border font-extrabold text-2xl transition-all ${daysPerWeek === n ? 'border-cyan-500 bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {n}
                </button>
              ))}
            </div>
            {DAYS_INFO[daysPerWeek] && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3">
                <div className="font-bold text-cyan-800 text-sm">{DAYS_INFO[daysPerWeek].split}</div>
                <div className="text-xs text-slate-500 mt-1">{DAYS_INFO[daysPerWeek].desc}</div>
              </div>
            )}
          </div>

          {/* السطح المفضل */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>🛤️</span> أين تجري غالباً؟</h2>
            <div className="grid grid-cols-2 gap-2">
              {SURFACES.map(s => (
                <button key={s.value} onClick={() => setSurface(s.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-right transition-all ${surface === s.value ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </div>
                  {surface === s.value && <span className="mr-auto text-cyan-600">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* بيانات الجري الحالية */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>⏱️</span> مستواك الحالي في الجري
              <span className="text-xs text-slate-400 font-normal">(تحسّن دقة الإيقاعات المقترحة)</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-medium">🛣️ كم تجري أسبوعياً؟</label>
                <div className="relative">
                  <input type="number" value={currentWeeklyKm} onChange={e => setCurrentWeeklyKm(e.target.value)} placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-cyan-500 pr-3" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">كم</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-medium">⚡ أفضل زمن 5 كم</label>
                <input type="text" value={best5kTime} onChange={e => setBest5kTime(e.target.value)} placeholder="28:30"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-cyan-500 text-center font-mono" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-medium">🏁 أفضل زمن 10 كم</label>
                <input type="text" value={best10kTime} onChange={e => setBest10kTime(e.target.value)} placeholder="59:00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-cyan-500 text-center font-mono" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-500 font-medium">🗓️ سباق مستهدف (اختياري)</label>
                <input type="date" value={targetRaceDate} onChange={e => setTargetRaceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
          </div>

          {/* البيانات الجسدية */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>📏</span> بياناتك الجسدية</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'العمر', value: age, set: setAge, placeholder: '25', unit: 'سنة' },
                { label: 'الوزن', value: weight, set: setWeight, placeholder: '75', unit: 'كجم' },
                { label: 'الطول', value: height, set: setHeight, placeholder: '175', unit: 'سم' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium">{f.label}</label>
                  <div className="relative">
                    <input type="number" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-cyan-500" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الإصابات والقيود */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>⚠️</span> إصابات أو قيود
              <span className="text-xs text-slate-400 font-normal">(مهم جداً للسلامة)</span>
            </h2>
            <textarea value={limitations} onChange={e => setLimitations(e.target.value)}
              placeholder="مثال: ألم في الركبة عند النزول — أتجنب المنحدرات&#10;مثال: Shin Splints سابقة — أحتاج تدرج بطيء&#10;مثال: أستطيع الجري صباحاً فقط"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed" />
            <p className="text-xs text-slate-400">سيتكيّف البرنامج بالكامل مع هذه القيود</p>
          </div>

          {/* Save */}
          <button onClick={save} disabled={saving}
            className="w-full py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg disabled:opacity-60 bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200">
            {saved ? '✅ تم الحفظ! جاري التوجيه للبرنامج...' : saving ? '⏳ جاري الحفظ...' : '💾 حفظ البروفايل'}
          </button>

        </div>
      </main>
    </div>
  );
}
