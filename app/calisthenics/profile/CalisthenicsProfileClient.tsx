'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const GOALS = [
  { value: 'strength',    label: 'قوة بوزن الجسم',  icon: '💪', desc: 'تدرجات صعبة وقوة مطلقة',            detail: 'تكرارات منخفضة 3-6 • راحة طويلة • تدرجات متقدمة' },
  { value: 'skills',      label: 'مهارات',           icon: '🤸', desc: 'وقوف على اليدين، ماسل أب، رافعات',  detail: 'Skill Work أول كل جلسة + قوة داعمة' },
  { value: 'muscle_gain', label: 'بناء عضلي',        icon: '🏗️', desc: 'تضخيم بوزن الجسم',                  detail: '8-15 تكرار • Tempo بطيء • حجم عالٍ' },
  { value: 'endurance',   label: 'تحمل عضلي',        icon: '🔄', desc: 'تكرارات عالية ولياقة',              detail: 'Circuits + EMOM + AMRAP • راحة قصيرة' },
  { value: 'fat_burn',    label: 'حرق الدهون',       icon: '🔥', desc: 'خسارة وزن بتمارين مكثفة',           detail: 'HIIT بوزن الجسم + دوائر متكاملة' },
];

const LEVELS = [
  { value: 'beginner',     label: 'مبتدئ', icon: '🟢', desc: 'أقل من 10 ضغط أو 0-2 عقلة',   detail: 'تعلم الحركات الأساسية بتدرجات مساعدة' },
  { value: 'intermediate', label: 'متوسط', icon: '🔵', desc: '15+ ضغط، 5+ عقلة',             detail: 'التدرجات القياسية وبداية المهارات' },
  { value: 'advanced',     label: 'متقدم', icon: '🟠', desc: '30+ ضغط، 12+ عقلة، ديبس قوي',  detail: 'تدرجات صعبة: Archer، L-sit، بداية الرافعات' },
  { value: 'elite',        label: 'نخبة',  icon: '🔴', desc: 'مهارات متمكنة ورافعات',        detail: 'Planche/Lever work وبرمجة نخبوية' },
];

const SKILLS = [
  { label: 'Handstand',    ar: 'وقوف على اليدين', icon: '🤸' },
  { label: 'Muscle-up',    ar: 'ماسل أب',          icon: '💥' },
  { label: 'Front Lever',  ar: 'فرونت ليفر',       icon: '➖' },
  { label: 'Back Lever',   ar: 'باك ليفر',         icon: '🔙' },
  { label: 'Planche',      ar: 'بلانش',            icon: '🛸' },
  { label: 'Pistol Squat', ar: 'سكوات مسدس',       icon: '🦵' },
  { label: 'Human Flag',   ar: 'علم بشري',         icon: '🚩' },
  { label: 'L-sit',        ar: 'جلسة L',           icon: '🪑' },
  { label: 'Dragon Flag',  ar: 'علم التنين',       icon: '🐉' },
];

const EQUIPMENT = [
  { label: 'بار عقلة',       icon: '🏗️' },
  { label: 'متوازي/باراليتس', icon: '🤾' },
  { label: 'حلقات',           icon: '⭕' },
  { label: 'أربطة مقاومة',    icon: '🎗️' },
  { label: 'جدار',            icon: '🧱' },
  { label: 'لا شيء (أرض فقط)', icon: '🏠' },
];

const DAYS_INFO: Record<number, { split: string; desc: string }> = {
  3: { split: 'Full Body × 3',            desc: 'الأنسب للمبتدئ — كل جلسة للجسم كامل' },
  4: { split: 'Upper / Lower',            desc: 'يومان علوي + يومان سفلي مع الكور' },
  5: { split: 'Push / Pull / Legs +',     desc: 'يوم مخصص للمهارات ويوم للجذع' },
  6: { split: 'PPL × 2',                  desc: 'للمتقدم — كل نمط حركة مرتان أسبوعياً' },
};

export default function CalisthenicsProfileClient({ member, initialProfile }: { member: any; initialProfile: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [goal, setGoal] = useState(initialProfile?.goal || 'strength');
  const [level, setLevel] = useState(initialProfile?.level || 'beginner');
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(initialProfile?.height?.toString() || '');
  const [daysPerWeek, setDaysPerWeek] = useState(initialProfile?.daysPerWeek || 3);
  const [maxPushups, setMaxPushups] = useState(initialProfile?.maxPushups?.toString() || '');
  const [maxPullups, setMaxPullups] = useState(initialProfile?.maxPullups?.toString() ?? '');
  const [maxDips, setMaxDips] = useState(initialProfile?.maxDips?.toString() ?? '');
  const [plankSeconds, setPlankSeconds] = useState(initialProfile?.plankSeconds?.toString() || '');
  const [skillGoals, setSkillGoals] = useState<string[]>(initialProfile?.skillGoals || []);
  const [equipment, setEquipment] = useState<string[]>(initialProfile?.equipment || []);
  const [limitations, setLimitations] = useState(initialProfile?.limitations || '');

  function toggleSkill(s: string) {
    setSkillGoals(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length >= 3 ? prev : [...prev, s]);
  }
  function toggleEquipment(e: string) {
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/calisthenics/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender, goal, level, age, weight, height, daysPerWeek, maxPushups, maxPullups, maxDips, plankSeconds, skillGoals, equipment, limitations }),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/calisthenics'); }, 1500);
    setSaving(false);
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-emerald-600 rounded-2xl p-5 shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl flex-shrink-0">
                🤸
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">بروفايل الكاليسثنكس</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {member.nameAr} — يساعد المدرب على تصميم برنامجك بوزن الجسم
                </p>
              </div>
            </div>
          </div>

          {/* الجنس */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>👤</span> الجنس</h2>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'male', label: 'ذكر', icon: '♂️' }, { value: 'female', label: 'أنثى', icon: '♀️' }].map(g => (
                <button key={g.value} onClick={() => setGender(g.value as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${gender === g.value ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-bold text-base">{g.label}</span>
                  {gender === g.value && <span className="mr-auto text-emerald-600 text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>🎯</span> هدفك من التدريب</h2>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${goal === g.value ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${goal === g.value ? 'text-emerald-800' : 'text-slate-700'}`}>{g.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{g.desc}</div>
                    {goal === g.value && <div className="text-xs text-emerald-700 mt-1.5 bg-emerald-100 rounded-lg px-2 py-1">{g.detail}</div>}
                  </div>
                  {goal === g.value && <span className="text-emerald-600 text-xl flex-shrink-0">✓</span>}
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
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${level === l.value ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <span className="text-2xl flex-shrink-0">{l.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${level === l.value ? 'text-emerald-800' : 'text-slate-700'}`}>{l.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{l.desc}</div>
                    {level === l.value && <div className="text-xs text-emerald-700 mt-1.5">{l.detail}</div>}
                  </div>
                  {level === l.value && <span className="text-emerald-600 text-xl flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* القدرات الحالية */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>🧪</span> اختبر نفسك — أرقامك الحالية
              <span className="text-xs text-slate-400 font-normal">(أهم بيانات لمعايرة البرنامج)</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-3 py-2">اختبر أقصى تكرارات متواصلة بتقنية صحيحة لكل تمرين — إن لم تستطع أداء عقلة أو ديبس اكتب 0</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '🙌 أقصى ضغط', value: maxPushups, set: setMaxPushups, placeholder: '15', unit: 'تكرار' },
                { label: '🏗️ أقصى عقلة', value: maxPullups, set: setMaxPullups, placeholder: '3', unit: 'تكرار' },
                { label: '💺 أقصى ديبس', value: maxDips, set: setMaxDips, placeholder: '5', unit: 'تكرار' },
                { label: '🧱 أقصى بلانك', value: plankSeconds, set: setPlankSeconds, placeholder: '45', unit: 'ثانية' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium">{f.label}</label>
                  <div className="relative">
                    <input type="number" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-emerald-500" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أيام التدريب */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>📅</span> أيام التدريب أسبوعياً</h2>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setDaysPerWeek(n)}
                  className={`py-4 rounded-xl border font-extrabold text-2xl transition-all ${daysPerWeek === n ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {n}
                </button>
              ))}
            </div>
            {DAYS_INFO[daysPerWeek] && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="font-bold text-emerald-800 text-sm">{DAYS_INFO[daysPerWeek].split}</div>
                <div className="text-xs text-slate-500 mt-1">{DAYS_INFO[daysPerWeek].desc}</div>
              </div>
            )}
          </div>

          {/* المهارات المستهدفة */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>🤸</span> مهارات تريد إتقانها</h2>
              {skillGoals.length > 0 && (
                <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2 py-1 rounded-lg">{skillGoals.length}/3</span>
              )}
            </div>
            <p className="text-xs text-slate-500">اختر حتى 3 مهارات — سيضع البرنامج تدريباً مخصصاً لها أول كل جلسة</p>
            <div className="grid grid-cols-3 gap-2">
              {SKILLS.map(s => (
                <button key={s.label} onClick={() => toggleSkill(s.label)}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-all ${skillGoals.includes(s.label) ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{s.ar}</span>
                  <span className="text-[9px] text-slate-400" dir="ltr">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* المعدات */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><span>🛠️</span> المعدات المتاحة لديك</h2>
            <p className="text-xs text-slate-500">سيقتصر البرنامج على تمارين ممكنة بمعداتك فقط</p>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT.map(e => (
                <button key={e.label} onClick={() => toggleEquipment(e.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-right text-sm font-semibold transition-all ${equipment.includes(e.label) ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="text-lg">{e.icon}</span>
                  <span>{e.label}</span>
                  {equipment.includes(e.label) && <span className="mr-auto text-emerald-600">✓</span>}
                </button>
              ))}
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-emerald-500" />
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
              placeholder="مثال: ألم في الرسغ — أحتاج بدائل الضغط على القبضة&#10;مثال: إصابة كتف سابقة — أتجنب الديبس العميق"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed" />
            <p className="text-xs text-slate-400">سيتكيّف البرنامج بالكامل مع هذه القيود</p>
          </div>

          {/* Save */}
          <button onClick={save} disabled={saving}
            className="w-full py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg disabled:opacity-60 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200">
            {saved ? '✅ تم الحفظ! جاري التوجيه للبرنامج...' : saving ? '⏳ جاري الحفظ...' : '💾 حفظ البروفايل'}
          </button>

        </div>
      </main>
    </div>
  );
}
