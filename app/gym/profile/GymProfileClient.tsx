'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const GOALS = [
  {
    value: 'muscle_gain',
    label: 'بناء العضلة',
    icon: '💪',
    desc: 'زيادة الكتلة العضلية والحجم',
    detail: 'أحمال ثقيلة • 8-12 تكرار • بروتين عالٍ',
    color: 'border-blue-500 bg-blue-900/20',
    active: 'ring-2 ring-blue-500',
  },
  {
    value: 'weight_loss',
    label: 'خسارة الوزن',
    icon: '🔥',
    desc: 'حرق الدهون والتخسيس',
    detail: 'كارديو + قوة • 12-20 تكرار • راحة قصيرة',
    color: 'border-orange-500 bg-orange-900/20',
    active: 'ring-2 ring-orange-500',
  },
  {
    value: 'strength',
    label: 'بناء القوة',
    icon: '🏋️',
    desc: 'رفع أثقال — الأرقام القياسية',
    detail: 'Compound ثقيل • 3-6 تكرار • راحة طويلة',
    color: 'border-red-500 bg-red-900/20',
    active: 'ring-2 ring-red-500',
  },
  {
    value: 'body_recomp',
    label: 'إعادة تشكيل الجسم',
    icon: '🎯',
    desc: 'بناء عضل + حرق دهون معاً',
    detail: 'توازن بين القوة والكارديو',
    color: 'border-purple-500 bg-purple-900/20',
    active: 'ring-2 ring-purple-500',
  },
  {
    value: 'general_fitness',
    label: 'لياقة عامة',
    icon: '⚡',
    desc: 'صحة عامة وتنويع شامل',
    detail: 'تمارين متنوعة • قلب وعضلات',
    color: 'border-teal-500 bg-teal-900/20',
    active: 'ring-2 ring-teal-500',
  },
  {
    value: 'senior_fitness',
    label: 'لياقة وقوة آمنة لكبار السن',
    icon: '🧓',
    desc: 'محافظة على القوة والاستقلالية بأمان تام — لا أرقام قياسية',
    detail: 'أجهزة مسنودة فقط • 12-20 تكرار خفيف • راحة يوم كامل بين الجلسات',
    color: 'border-amber-500 bg-amber-900/20',
    active: 'ring-2 ring-amber-500',
  },
];

// مستويات مختلفة تماماً لبرنامج كبار السن — لا علاقة لها بسنوات التدريب أو الأوزان،
// بل بمستوى النشاط البدني الحالي الذي يحدد نقطة انطلاق آمنة (نفس فكرة SENIOR_LEVELS في قسم الجري)
const SENIOR_LEVELS = [
  { value: 'beginner',     label: 'خامل حالياً',      icon: '🟢', desc: 'لا أمارس رياضة منتظمة',           detail: 'نبدأ بأخف الأوزان وأبسط الحركات',  color: 'border-green-500 bg-green-900/20 text-green-300' },
  { value: 'intermediate', label: 'نشيط خفيف',        icon: '🔵', desc: 'أمشي أو أتحرك بانتظام',           detail: 'نبدأ بأجهزة أساسية بحمل خفيف جداً', color: 'border-blue-500 bg-blue-900/20 text-blue-300' },
  { value: 'advanced',     label: 'يتمرن بانتظام',    icon: '🟠', desc: 'أمارس نشاطاً بدنياً منتظماً',      detail: 'نبدأ بحمل خفيف-متوسط',              color: 'border-orange-500 bg-orange-900/20 text-orange-300' },
  { value: 'elite',        label: 'معتاد على المقاومة', icon: '🔴', desc: 'جرّبت تمارين المقاومة من قبل',    detail: 'نبدأ من نقطة أعلى قليلاً — يبقى خفيفاً دوماً', color: 'border-red-500 bg-red-900/20 text-red-300' },
];

const LEVELS = [
  {
    value: 'beginner',
    label: 'مبتدئ',
    icon: '🟢',
    desc: 'أقل من سنة تدريب',
    detail: 'تعلّم الحركات الأساسية، أوزان خفيفة، التركيز على التقنية',
    color: 'border-green-500 bg-green-900/20 text-green-300',
  },
  {
    value: 'intermediate',
    label: 'متوسط',
    icon: '🔵',
    desc: '1-3 سنوات تدريب منتظم',
    detail: 'تقنية جيدة، قادر على الأوزان الحرة، يعرف Split مناسب',
    color: 'border-blue-500 bg-blue-900/20 text-blue-300',
  },
  {
    value: 'advanced',
    label: 'متقدم',
    icon: '🟠',
    desc: '3-5 سنوات تدريب',
    detail: 'أوزان عالية، يستخدم Drop Sets و Supersets، يفهم Progressive Overload',
    color: 'border-orange-500 bg-orange-900/20 text-orange-300',
  },
  {
    value: 'elite',
    label: 'محترف',
    icon: '🔴',
    desc: '+5 سنوات تدريب جدي',
    detail: 'قريب من أقصى إمكاناته، يحتاج برمجة متقدمة ودورات',
    color: 'border-red-500 bg-red-900/20 text-red-300',
  },
];

const FOCUS_AREAS = [
  { label: 'الصدر',         icon: '🫁' },
  { label: 'الظهر',         icon: '🔙' },
  { label: 'الأرجل',        icon: '🦵' },
  { label: 'الأكتاف',       icon: '🎽' },
  { label: 'الذراعين',      icon: '💪' },
  { label: 'البطن والجذع',  icon: '🔥' },
  { label: 'المؤخرة',       icon: '🍑' },
  { label: 'الساق السفلى',  icon: '🦶' },
];

const DAYS_INFO: Record<number, { split: string; desc: string }> = {
  3: { split: 'Full Body × 3',      desc: 'الأنسب للمبتدئين والمشغولين — كل جلسة للجسم كامل' },
  4: { split: 'Upper / Lower × 2',  desc: 'يومان أعلى الجسم + يومان أسفله — توزيع مثالي' },
  5: { split: 'Push / Pull / Legs', desc: 'التقسيم الأمثل — كل عضلة تتدرب مرتين أسبوعياً' },
  6: { split: 'PPL مزدوج',          desc: 'للمحترفين — حجم عالٍ وتكرار مزدوج لكل عضلة' },
};

export default function GymProfileClient({ member, initialProfile }: { member: any; initialProfile: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [gender, setGender] = useState<'male' | 'female'>((initialProfile as any)?.gender || 'male');
  const [goal, setGoal] = useState(initialProfile?.goal || 'muscle_gain');
  const [level, setLevel] = useState(initialProfile?.level || 'beginner');
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(initialProfile?.height?.toString() || '');
  const [experienceYears, setExperienceYears] = useState((initialProfile as any)?.experienceYears?.toString() || '');
  const [daysPerWeek, setDaysPerWeek] = useState(initialProfile?.daysPerWeek || 3);
  const [focusAreas, setFocusAreas] = useState<string[]>(initialProfile?.focusAreas || []);
  const [limitations, setLimitations] = useState(initialProfile?.limitations || '');

  function toggleFocus(area: string) {
    setFocusAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  const bmi = weight && height
    ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)
    : null;

  async function save() {
    setSaving(true);
    await fetch('/api/gym/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender, goal, level, age, weight, height, experienceYears, daysPerWeek, focusAreas, limitations }),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/gym'); }, 1500);
    setSaving(false);
  }

  return (
    <div className="min-h-dvh flex w-full bg-gray-950">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-8">
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 rounded-2xl border border-indigo-700/40 p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-3xl flex-shrink-0">
                🏋️
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">البروفايل التدريبي</h1>
                <p className="text-sm text-indigo-300 mt-0.5">
                  {member.nameAr} — يساعد المدرب على تصميم جدولك المثالي
                </p>
                {initialProfile && (
                  <p className="text-xs text-gray-500 mt-0.5">آخر تحديث: {new Date(initialProfile.updatedAt).toLocaleDateString('ar-SA')}</p>
                )}
              </div>
            </div>
          </div>

          {/* الجنس */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>👤</span> الجنس
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'male',   label: 'ذكر',   icon: '♂️', desc: 'أوزان الذكور' },
                { value: 'female', label: 'أنثى',  icon: '♀️', desc: 'أوزان الإناث' },
              ].map(g => (
                <button key={g.value} onClick={() => setGender(g.value as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${gender === g.value ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="font-bold text-base">{g.label}</div>
                    <div className="text-xs text-gray-500">{g.desc}</div>
                  </div>
                  {gender === g.value && <span className="mr-auto text-indigo-400 text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>🎯</span> هدفك من التدريب
            </h2>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-right transition-all ${goal === g.value ? `${g.color} ${g.active} text-white` : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600'}`}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base">{g.label}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{g.desc}</div>
                    {goal === g.value && <div className="text-xs text-gray-300 mt-1.5 bg-black/20 rounded-lg px-2 py-1">{g.detail}</div>}
                  </div>
                  {goal === g.value && <span className="text-green-400 text-xl flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* المستوى */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>📊</span> مستواك الحالي
            </h2>
            <div className="space-y-2">
              {(goal === 'senior_fitness' ? SENIOR_LEVELS : LEVELS).map(l => (
                <button key={l.value} onClick={() => setLevel(l.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-right transition-all ${level === l.value ? `${l.color} ring-2 ring-offset-0` : 'border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-600'}`}>
                  <span className="text-2xl flex-shrink-0">{l.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-white">{l.label}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{l.desc}</div>
                    {level === l.value && <div className="text-xs text-gray-300 mt-1.5">{l.detail}</div>}
                  </div>
                  {level === l.value && <span className="text-green-400 text-xl flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* أيام التدريب */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>📅</span> أيام التدريب أسبوعياً
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setDaysPerWeek(n)}
                  className={`py-4 rounded-xl border font-extrabold text-2xl transition-all ${daysPerWeek === n ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                  {n}
                </button>
              ))}
            </div>
            {goal === 'senior_fitness' && (
              <p className="text-xs text-amber-500 bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2">
                ⚠️ لأسباب السلامة، برنامج كبار السن لن يتجاوز 3 أيام نشطة أسبوعياً مع راحة كاملة بين كل جلستين — بغض النظر عن اختيارك هنا
              </p>
            )}
            {DAYS_INFO[daysPerWeek] && (
              <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3">
                <div className="font-bold text-indigo-300 text-sm">{DAYS_INFO[daysPerWeek].split}</div>
                <div className="text-xs text-gray-400 mt-1">{DAYS_INFO[daysPerWeek].desc}</div>
              </div>
            )}
          </div>

          {/* مناطق التركيز */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <span>💪</span> مناطق التركيز
              </h2>
              {focusAreas.length > 0 && (
                <span className="text-xs bg-orange-900/40 text-orange-400 border border-orange-800/40 px-2 py-1 rounded-lg">
                  {focusAreas.length} محدد
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">اختر العضلات التي تريد تضخيم التركيز عليها — ستأخذ حجماً أكبر في جدولك</p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_AREAS.map(area => (
                <button key={area.label} onClick={() => toggleFocus(area.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-right text-sm font-semibold transition-all ${focusAreas.includes(area.label) ? 'border-orange-500 bg-orange-900/30 text-orange-200' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                  <span className="text-lg">{area.icon}</span>
                  <span>{area.label}</span>
                  {focusAreas.includes(area.label) && <span className="mr-auto text-orange-400">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* البيانات الجسدية */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>📏</span> بياناتك الجسدية
              <span className="text-xs text-gray-500 font-normal">(تحسّن دقة الأوزان المقترحة)</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'العمر', value: age, set: setAge, placeholder: '25', unit: 'سنة', icon: '🧑' },
                { label: 'سنوات التدريب', value: experienceYears, set: setExperienceYears, placeholder: '2', unit: 'سنة', icon: '📅' },
                { label: 'الوزن', value: weight, set: setWeight, placeholder: '80', unit: 'كجم', icon: '⚖️' },
                { label: 'الطول', value: height, set: setHeight, placeholder: '175', unit: 'سم', icon: '📐' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-sm text-gray-400 font-medium flex items-center gap-1.5">
                    <span>{f.icon}</span>{f.label}
                  </label>
                  <div className="relative">
                    <input type="number" value={f.value} onChange={e => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-base font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 pr-12" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {bmi && (
              <div className={`rounded-xl px-4 py-3 border text-sm font-semibold ${
                Number(bmi) < 18.5 ? 'bg-blue-900/20 border-blue-700/40 text-blue-300' :
                Number(bmi) < 25   ? 'bg-green-900/20 border-green-700/40 text-green-300' :
                Number(bmi) < 30   ? 'bg-yellow-900/20 border-yellow-700/40 text-yellow-300' :
                                     'bg-red-900/20 border-red-700/40 text-red-300'
              }`}>
                مؤشر كتلة الجسم (BMI): {bmi} — {
                  Number(bmi) < 18.5 ? 'نحيف — قد تحتاج زيادة السعرات' :
                  Number(bmi) < 25   ? 'وزن مثالي ✅' :
                  Number(bmi) < 30   ? 'زيادة طفيفة في الوزن' :
                                       'يُنصح بالتركيز على خسارة الوزن'
                }
              </div>
            )}
          </div>

          {/* تنبيه تلقائي — عمر متقدم مع هدف غير مخصص لكبار السن (نفس فكرة التنبيه في بروفايل الجري) */}
          {Number(age) >= 60 && goal !== 'senior_fitness' && (
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🧓</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-amber-400 text-sm">هل برنامج "لياقة وقوة آمنة لكبار السن" أنسب لك؟</div>
                  <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                    بعمر {age} سنة، هذا البرنامج أكثر أماناً — أجهزة مسنودة فقط بدل الأوزان الحرة القائمة، تكرارات خفيفة (12-20)، وراحة يوم كامل بين الجلسات. يمكنك تجاهل هذا التنبيه ومتابعة هدفك الحالي إن كنت متأكداً من ملاءمته لحالتك.
                  </p>
                  <button onClick={() => setGoal('senior_fitness')}
                    className="mt-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                    التبديل لبرنامج كبار السن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* الإصابات والقيود */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>⚠️</span> إصابات أو قيود
              <span className="text-xs text-gray-500 font-normal">(مهم جداً للسلامة)</span>
            </h2>
            <textarea value={limitations} onChange={e => setLimitations(e.target.value)}
              placeholder="مثال: ألم في الركبة اليسرى — لا أستطيع Leg Extension&#10;مثال: ديسك في الظهر — أتجنب القرفصاء&#10;مثال: إصابة في الكتف الأيمن"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 resize-none leading-relaxed" />
            <p className="text-xs text-gray-600">سيتجنب البرنامج التمارين التي تضر بهذه المناطق</p>
          </div>

          {/* Save button */}
          <button onClick={save} disabled={saving}
            className="w-full py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/40">
            {saved ? '✅ تم الحفظ! جاري التوجيه للجدول...' : saving ? '⏳ جاري الحفظ...' : '💾 حفظ البروفايل'}
          </button>

        </div>
      </main>
    </div>
  );
}
