'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import {
  Footprints, Flame, Zap, Target, Award, Trophy, Wind, PersonStanding,
  User, Mars, Venus, CheckCircle2, BarChart3, Calendar, AlertTriangle,
  Route, Trees, Landmark, Activity, RefreshCw, Heart, Timer, Flag, Ruler,
  Loader2, Save,
} from 'lucide-react';

const GOALS = [
  { value: 'general_endurance', label: 'تحمل عام',        icon: Footprints,     desc: 'بناء لياقة الجري والقاعدة الهوائية',    detail: '80% جري سهل • تدرج آمن في المسافات' },
  { value: 'fat_burn',          label: 'حرق الدهون',      icon: Flame,          desc: 'خسارة الوزن عبر الجري',                  detail: 'Zone 2 طويل + جلسة HIIT أسبوعية' },
  { value: 'race_5k',           label: 'سباق 5 كم',       icon: Zap,            desc: 'تحسين زمن الـ 5 كيلومتر',               detail: 'تكرارات سريعة + إيقاعي قصير' },
  { value: 'race_10k',          label: 'سباق 10 كم',      icon: Target,         desc: 'تحسين زمن الـ 10 كيلومتر',              detail: 'سرعة + تحمل — الجمع بينهما' },
  { value: 'half_marathon',     label: 'نصف ماراثون',     icon: Award,          desc: 'الاستعداد لـ 21.1 كم',                  detail: 'جري طويل متدرج حتى 19 كم' },
  { value: 'marathon',          label: 'ماراثون',         icon: Trophy,         desc: 'الاستعداد لـ 42.2 كم',                  detail: 'أحجام عالية + جري طويل حتى 34 كم' },
  { value: 'speed',             label: 'سرعة قصوى',       icon: Wind,           desc: 'تطوير السرعة الانفجارية',               detail: 'تكرارات قصيرة + Hill Sprints' },
  { value: 'senior_walk_run',   label: 'مشي وجري لكبار السن', icon: PersonStanding, desc: 'تحسين الصحة العامة بأمان — لا سباقات ولا أرقام', detail: 'تدرّج بطيء وآمن (مشي→جري) يُتابَع أسبوعياً' },
];

const LEVELS = [
  { value: 'beginner',     label: 'مبتدئ', dot: 'bg-green-500',  desc: 'أجري أحياناً أو أبدأ من الصفر', detail: 'مشي/جري متناوب، 15-25 كم أسبوعياً' },
  { value: 'intermediate', label: 'متوسط', dot: 'bg-blue-500',   desc: 'أجري بانتظام منذ 6 أشهر+',      detail: 'جري متواصل مريح، 25-45 كم أسبوعياً' },
  { value: 'advanced',     label: 'متقدم', dot: 'bg-orange-500', desc: 'سنتان+ وشاركت في سباقات',       detail: 'جلسات جودة منظمة، 45-70 كم أسبوعياً' },
  { value: 'elite',        label: 'نخبة',  dot: 'bg-red-500',    desc: 'عداء تنافسي جاد',               detail: 'أحجام عالية وجودة مزدوجة، 70+ كم' },
];

// مستويات مختلفة تماماً لبرنامج كبار السن — لا علاقة لها بالكيلومترات أو السباقات،
// بل بمستوى الحركة اليومية الحالي الذي يحدد نقطة انطلاق برنامج المشي/الجري
const SENIOR_LEVELS = [
  { value: 'beginner',     label: 'خامل حالياً', dot: 'bg-green-500',  desc: 'لا أمارس رياضة منتظمة حالياً', detail: 'نبدأ بمشي فقط قبل أي جري' },
  { value: 'intermediate', label: 'أمشي بانتظام', dot: 'bg-blue-500',   desc: 'أمشي بانتظام لكن لم أجرّب الجري', detail: 'نبدأ بمزيج مشي/جري خفيف' },
  { value: 'advanced',     label: 'نشيط ومتحرك',  dot: 'bg-orange-500', desc: 'نشيط ومشي مسافات طويلة بانتظام', detail: 'نبدأ بجري متقطع أطول' },
  { value: 'elite',        label: 'عائد للجري',   dot: 'bg-red-500',   desc: 'جرّبت الجري من قبل أو نشيط جداً لعمري', detail: 'نبدأ من مرحلة متقدمة أكثر' },
];

const SURFACES = [
  { value: 'outdoor',   label: 'خارجي',   icon: Trees,    desc: 'شوارع وممشى' },
  { value: 'treadmill', label: 'تريدميل', icon: Activity, desc: 'سير كهربائي' },
  { value: 'track',     label: 'مضمار',   icon: Landmark, desc: 'مضمار 400م' },
  { value: 'mixed',     label: 'مختلط',   icon: RefreshCw, desc: 'حسب الجلسة' },
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
          <div className="bg-gray-900 border border-gray-800 border-r-4 border-r-orange-500 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <Footprints className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">بروفايل العدّاء</h1>
                <p className="text-sm mt-0.5 text-gray-300">
                  {member.nameAr} — يساعد المدرب على تصميم برنامج جريك المثالي
                </p>
              </div>
            </div>
          </div>

          {/* الجنس */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><User className="w-5 h-5" /> الجنس</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'male',   label: 'ذكر',  icon: Mars },
                { value: 'female', label: 'أنثى', icon: Venus },
              ].map(g => (
                <button key={g.value} onClick={() => setGender(g.value as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${gender === g.value ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <g.icon className="w-6 h-6" />
                  <span className="font-bold text-base">{g.label}</span>
                  {gender === g.value && <CheckCircle2 className="mr-auto w-5 h-5 text-orange-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Target className="w-5 h-5" /> هدفك من الجري</h2>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${goal === g.value ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <g.icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${goal === g.value ? 'text-orange-800' : 'text-slate-700'}`}>{g.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{g.desc}</div>
                    {goal === g.value && <div className="text-xs text-orange-700 mt-1.5 bg-orange-100 rounded-lg px-2 py-1">{g.detail}</div>}
                  </div>
                  {goal === g.value && <CheckCircle2 className="text-orange-600 w-5 h-5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* المستوى */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><BarChart3 className="w-5 h-5" /> مستواك الحالي</h2>
            <div className="space-y-2">
              {(goal === 'senior_walk_run' ? SENIOR_LEVELS : LEVELS).map(l => (
                <button key={l.value} onClick={() => setLevel(l.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${level === l.value ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                  <span className={`mt-1.5 inline-block w-3 h-3 rounded-full flex-shrink-0 ${l.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${level === l.value ? 'text-orange-800' : 'text-slate-700'}`}>{l.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{l.desc}</div>
                    {level === l.value && <div className="text-xs text-orange-700 mt-1.5">{l.detail}</div>}
                  </div>
                  {level === l.value && <CheckCircle2 className="text-orange-600 w-5 h-5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* أيام الجري */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Calendar className="w-5 h-5" /> أيام الجري أسبوعياً</h2>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setDaysPerWeek(n)}
                  className={`py-4 rounded-xl border font-extrabold text-2xl transition-all ${daysPerWeek === n ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {n}
                </button>
              ))}
            </div>
            {goal === 'senior_walk_run' && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                لأسباب السلامة، برنامج كبار السن لن يتجاوز 3 أيام نشطة أسبوعياً مع راحة كاملة بين كل جلستين — بغض النظر عن اختيارك هنا
              </p>
            )}
            {DAYS_INFO[daysPerWeek] && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="font-bold text-orange-800 text-sm">{DAYS_INFO[daysPerWeek].split}</div>
                <div className="text-xs text-slate-500 mt-1">{DAYS_INFO[daysPerWeek].desc}</div>
              </div>
            )}
          </div>

          {/* السطح المفضل */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Route className="w-5 h-5" /> أين تجري غالباً؟</h2>
            <div className="grid grid-cols-2 gap-2">
              {SURFACES.map(s => (
                <button key={s.value} onClick={() => setSurface(s.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-right transition-all ${surface === s.value ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <s.icon className="w-5 h-5" />
                  <div>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </div>
                  {surface === s.value && <CheckCircle2 className="mr-auto w-4 h-4 text-orange-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* بيانات الجري الحالية — غير مناسبة لبرنامج كبار السن (لا إيقاعات ولا سباقات) */}
          {goal === 'senior_walk_run' ? (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 space-y-2 shadow-sm">
              <h2 className="font-bold text-emerald-800 text-base flex items-center gap-2"><Heart className="w-5 h-5" /> برنامج صحي بلا أرقام</h2>
              <p className="text-sm text-emerald-700 leading-relaxed">
                هذا البرنامج لا يعتمد على زمن سباق أو إيقاع محدد — فقط على مستوى حركتك الحالي (بالأعلى) والالتزام الأسبوعي.
                سيتابع مدربك تقدّمك أسبوعاً بعد أسبوع ويرفع مستوى الجلسة تدريجياً بأمان.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Timer className="w-5 h-5" /> مستواك الحالي في الجري
                <span className="text-xs text-slate-400 font-normal">(تحسّن دقة الإيقاعات المقترحة)</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium flex items-center gap-1"><Route className="w-4 h-4" /> كم تجري أسبوعياً؟</label>
                  <div className="relative">
                    <input type="number" value={currentWeeklyKm} onChange={e => setCurrentWeeklyKm(e.target.value)} placeholder="15"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-orange-500 pr-3" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">كم</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium flex items-center gap-1"><Zap className="w-4 h-4" /> أفضل زمن 5 كم</label>
                  <input type="text" value={best5kTime} onChange={e => setBest5kTime(e.target.value)} placeholder="28:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-orange-500 text-center font-mono" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium flex items-center gap-1"><Flag className="w-4 h-4" /> أفضل زمن 10 كم</label>
                  <input type="text" value={best10kTime} onChange={e => setBest10kTime(e.target.value)} placeholder="59:00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-orange-500 text-center font-mono" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-4 h-4" /> سباق مستهدف (اختياري)</label>
                  <input type="date" value={targetRaceDate} onChange={e => setTargetRaceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* البيانات الجسدية */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Ruler className="w-5 h-5" /> بياناتك الجسدية</h2>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-base font-semibold focus:outline-none focus:border-orange-500" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* تنبيه تلقائي — عمر متقدم مع هدف غير مخصص لكبار السن. لا يفرض التبديل، فقط يعرض الخيار الأنسب
              للسلامة بوضوح بدل الاعتماد كلياً على أن يتذكر العضو/المدرب اختيار الهدف الصحيح يدوياً */}
          {Number(age) >= 60 && goal !== 'senior_walk_run' && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <PersonStanding className="w-6 h-6 flex-shrink-0 text-amber-600" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-amber-800 text-sm">هل برنامج "مشي وجري لكبار السن" أنسب لك؟</div>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    بعمر {age} سنة، هذا البرنامج المخصص أكثر أماناً — بلا سباقات أو إيقاعات سريعة، بتدرّج بطيء (مشي→جري) يُتابَع أسبوعياً، وإرشادات سلامة صحية مخصصة (علامات تحذيرية، اختبار التحدث بدل مستهدفات النبض). يمكنك تجاهل هذا التنبيه ومتابعة هدفك الحالي إن كنت متأكداً من ملاءمته لحالتك.
                  </p>
                  <button onClick={() => setGoal('senior_walk_run')}
                    className="mt-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                    التبديل لبرنامج كبار السن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* الإصابات والقيود */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> إصابات أو قيود
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
            className="w-full py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg disabled:opacity-60 bg-orange-500 hover:bg-orange-400 text-white shadow-orange-900/40 inline-flex items-center justify-center gap-2">
            {saved ? <><CheckCircle2 className="w-5 h-5" /> تم الحفظ! جاري التوجيه للبرنامج...</> : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</> : <><Save className="w-5 h-5" /> حفظ البروفايل</>}
          </button>

        </div>
      </main>
    </div>
  );
}
