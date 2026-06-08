'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const SESSION_TYPES = [
  { value: 'full', label: 'كامل 🏁', desc: 'السباق الكامل 8 محطات + 8 كم' },
  { value: 'simulation', label: 'محاكاة 🎯', desc: 'نفس البنية بأوزان تدريبية' },
  { value: 'strength', label: 'قوة المحطات 💪', desc: 'تركيز على محطات القوة فقط' },
  { value: 'running', label: 'جري + مقاطع 🏃', desc: 'الجري مع مقاطع سرعة' },
];

const INTENSITY_COLORS: Record<string, string> = {
  'خفيف': 'text-green-400 bg-green-900/30 border-green-700/30',
  'متوسط': 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30',
  'مرتفع': 'text-red-400 bg-red-900/30 border-red-700/30',
  'نخبة': 'text-purple-400 bg-purple-900/30 border-purple-700/30',
};

export default function HyroxClient({ member }: { member: any }) {
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [sessionType, setSessionType] = useState('simulation');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSettings, setShowSettings] = useState(true);

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/hyrox/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, difficulty, sessionType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSession(data.session);
      setShowSettings(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-safe-nav lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-red-900/40 to-orange-900/40 rounded-2xl border border-red-700/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏁</span>
              <div>
                <h1 className="text-xl font-bold text-white">Hyrox Training</h1>
                <p className="text-sm text-red-300">تدريب الهايروكس — القوة والتحمل</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              8 محطات × 1 كم جري — رياضة لياقة تنافسية عالمية
            </p>
          </div>

          {/* Settings Panel */}
          {showSettings || !session ? (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span>⚙️</span> إعدادات الجلسة
              </h2>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">نوع الجلسة</label>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_TYPES.map(t => (
                    <button key={t.value} onClick={() => setSessionType(t.value)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        sessionType === t.value
                          ? 'border-red-500 bg-red-900/20 text-white'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}>
                      <div className="font-semibold text-sm">{t.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">مستوى الصعوبة</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
                    {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">تاريخ الجلسة</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {error}</div>
              )}

              <button onClick={generate} disabled={generating}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                {generating ? (
                  <><span className="animate-spin">⚙️</span> يتم توليد الجلسة بالذكاء الاصطناعي...</>
                ) : (
                  <><span>🤖</span> توليد جلسة Hyrox</>
                )}
              </button>
              {generating && (
                <p className="text-center text-xs text-red-400 animate-pulse">
                  🏃 يحلل الذكاء الاصطناعي أفضل برمجة هايروكس لمستواك...
                </p>
              )}
            </div>
          ) : null}

          {/* Generated Session */}
          {session && !showSettings && (
            <div className="space-y-4">
              {/* Session Header */}
              <div className="bg-gradient-to-l from-red-900/30 to-orange-900/30 rounded-2xl border border-red-700/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{session.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-red-900/50 border border-red-700/40 text-red-300 px-2 py-0.5 rounded-full">
                        ⏱ {session.totalDuration} دقيقة
                      </span>
                      <span className="text-xs bg-orange-900/50 border border-orange-700/40 text-orange-300 px-2 py-0.5 rounded-full">
                        {session.difficulty}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowSettings(true)}
                    className="text-xs text-gray-500 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
                    🔄 جلسة جديدة
                  </button>
                </div>
                {session.coachNote && (
                  <div className="mt-3 bg-black/20 rounded-xl p-3">
                    <p className="text-xs text-gray-300">💬 {session.coachNote}</p>
                  </div>
                )}
              </div>

              {/* Warmup */}
              {session.warmup && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <span>🔆</span> الإحماء — {session.warmup.duration}
                  </h3>
                  <div className="space-y-2">
                    {session.warmup.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                        <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                        <div className="flex-1">
                          <span className="text-sm text-white">{ex.name}</span>
                          <span className="text-xs text-gray-500 mr-2">— {ex.duration || ex.reps}</span>
                        </div>
                        {ex.notes && <span className="text-xs text-gray-500">{ex.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stations */}
              {session.stations && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-400 flex items-center gap-2">
                    <span>🏁</span> المحطات الثمانية
                  </h3>
                  {session.stations.map((st: any, i: number) => (
                    <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                      {/* Run indicator */}
                      <div className="bg-blue-900/20 border-b border-blue-800/30 px-4 py-2 flex items-center gap-2">
                        <span>🏃</span>
                        <span className="text-xs text-blue-400 font-semibold">جري {st.runBefore}</span>
                      </div>
                      {/* Station */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">{st.number}</span>
                            <div>
                              <div className="font-semibold text-white text-sm">{st.name}</div>
                              <div className="text-xs text-gray-500">{st.nameEn}</div>
                            </div>
                          </div>
                          {st.targetTime && (
                            <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded-lg">⏱ {st.targetTime}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="bg-gray-800 rounded-xl p-2 text-center">
                            <div className="text-xs text-gray-500">الهدف</div>
                            <div className="text-sm text-white font-semibold">{st.target}</div>
                          </div>
                          {st.weight && (
                            <div className="bg-gray-800 rounded-xl p-2 text-center">
                              <div className="text-xs text-gray-500">الوزن</div>
                              <div className="text-sm text-white font-semibold">{st.weight}</div>
                            </div>
                          )}
                          {st.scaling && (
                            <div className="bg-green-900/20 rounded-xl p-2 text-center">
                              <div className="text-xs text-gray-500">تعديل</div>
                              <div className="text-xs text-green-400">{st.scaling}</div>
                            </div>
                          )}
                        </div>
                        {st.tips && (
                          <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/10 rounded-lg p-2">
                            💡 {st.tips}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Target Times */}
              {session.targetTimes && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span>⏱</span> أوقات الأداء المرجعية
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(session.targetTimes).map(([level, time]: [string, any]) => {
                      const labels: Record<string, { ar: string; color: string }> = {
                        elite: { ar: 'نخبة 🥇', color: 'text-purple-400 bg-purple-900/20 border-purple-700/30' },
                        advanced: { ar: 'متقدم 🥈', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                        intermediate: { ar: 'متوسط 🥉', color: 'text-green-400 bg-green-900/20 border-green-700/30' },
                        beginner: { ar: 'مبتدئ', color: 'text-gray-400 bg-gray-800 border-gray-700' },
                      };
                      const l = labels[level] || { ar: level, color: 'text-gray-400 bg-gray-800 border-gray-700' };
                      return (
                        <div key={level} className={`rounded-xl border p-3 text-center ${l.color}`}>
                          <div className="text-xs mb-1">{l.ar}</div>
                          <div className="font-bold text-sm">{time}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cooldown */}
              {session.cooldown && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <span>🧘</span> التهدئة
                  </h3>
                  <div className="space-y-2">
                    {session.cooldown.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-gray-600">•</span>
                        <span>{ex.name}</span>
                        <span className="text-gray-500 text-xs">— {ex.duration}</span>
                      </div>
                    ))}
                    {Array.isArray(session.cooldown) && session.cooldown.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-gray-600">•</span>
                        <span>{ex.name}</span>
                        <span className="text-gray-500 text-xs">— {ex.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition */}
              {(session.nutritionBefore || session.nutritionAfter) && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                  <h3 className="font-semibold text-green-400 flex items-center gap-2">
                    <span>🥗</span> التغذية
                  </h3>
                  {session.nutritionBefore && (
                    <div className="bg-green-900/10 rounded-xl p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">قبل التمرين</div>
                      <p className="text-xs text-gray-300">{session.nutritionBefore}</p>
                    </div>
                  )}
                  {session.nutritionAfter && (
                    <div className="bg-blue-900/10 rounded-xl p-3">
                      <div className="text-xs text-blue-400 font-semibold mb-1">بعد التمرين</div>
                      <p className="text-xs text-gray-300">{session.nutritionAfter}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Next recommendation */}
              {session.nextSessionRecommendation && (
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <span>🔮</span> توصية الجلسة القادمة
                  </h3>
                  <p className="text-sm text-gray-300">{session.nextSessionRecommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
