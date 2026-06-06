'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const EVENT_TYPES = [
  { value: 'biathlon', label: 'Biathlon 🏆', desc: 'Jerk + Snatch — ثنائي الأحداث' },
  { value: 'long_cycle', label: 'Long Cycle 🔄', desc: 'Clean & Jerk — الدورة الطويلة' },
  { value: 'snatch', label: 'Snatch ⚡', desc: 'الانتزاع — حدث واحد' },
  { value: 'strength', label: 'قوة 💪', desc: 'تطوير القوة الأساسية' },
  { value: 'conditioning', label: 'تكييف 🔥', desc: 'تحمل وتكييف عضلي' },
];
const FOCUS_OPTIONS = ['التحمل', 'القوة', 'التقنية', 'السرعة', 'الراحة النشطة'];

export default function KettlebellClient({ member }: { member: any }) {
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [eventType, setEventType] = useState('biathlon');
  const [focus, setFocus] = useState('التحمل');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSettings, setShowSettings] = useState(true);

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/kettlebell/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, difficulty, eventType, focus }),
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
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-yellow-900/40 to-amber-900/40 rounded-2xl border border-yellow-700/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏋️</span>
              <div>
                <h1 className="text-xl font-bold text-white">Kettlebell Athletics</h1>
                <p className="text-sm text-yellow-300">رياضة الجيرك — القوة التنافسية</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              IUKL — الاتحاد الدولي لرفع الكيتل بيل | Biathlon · Long Cycle · Snatch
            </p>
          </div>

          {/* Settings Panel */}
          {showSettings || !session ? (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span>⚙️</span> إعدادات الجلسة
              </h2>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">نوع الحدث</label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setEventType(t.value)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        eventType === t.value
                          ? 'border-yellow-500 bg-yellow-900/20 text-white'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}>
                      <div className="font-semibold text-sm">{t.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">الصعوبة</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500">
                    {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">التركيز</label>
                  <select value={focus} onChange={e => setFocus(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500">
                    {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">التاريخ</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {error}</div>
              )}

              <button onClick={generate} disabled={generating}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                {generating ? (
                  <><span className="animate-spin">⚙️</span> يتم توليد الجلسة بالذكاء الاصطناعي...</>
                ) : (
                  <><span>🤖</span> توليد جلسة Kettlebell Athletics</>
                )}
              </button>
              {generating && (
                <p className="text-center text-xs text-yellow-400 animate-pulse">
                  🏋️ يحلل الذكاء الاصطناعي مبادئ IUKL ويضع برنامجك التنافسي...
                </p>
              )}
            </div>
          ) : null}

          {/* Generated Session */}
          {session && !showSettings && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-gradient-to-l from-yellow-900/30 to-amber-900/30 rounded-2xl border border-yellow-700/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{session.title}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-yellow-900/50 border border-yellow-700/40 text-yellow-300 px-2 py-0.5 rounded-full">
                        ⏱ {session.totalDuration}
                      </span>
                      <span className="text-xs bg-amber-900/50 border border-amber-700/40 text-amber-300 px-2 py-0.5 rounded-full">
                        {session.eventType}
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

              {/* Breathing Pattern */}
              {session.breathingPattern && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3">
                  <div className="text-xs text-blue-400 font-semibold mb-1">🫁 نمط التنفس الصحيح</div>
                  <p className="text-xs text-gray-300">{session.breathingPattern}</p>
                </div>
              )}

              {/* Warmup */}
              {session.warmup && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <span>🔆</span> الإحماء — {session.warmup.duration}
                  </h3>
                  <div className="space-y-2">
                    {session.warmup.movements?.map((ex: any, i: number) => (
                      <div key={i} className="bg-gray-800/50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-white">{ex.name}</span>
                            <span className="text-xs text-gray-500 mr-2">({ex.nameEn})</span>
                          </div>
                          <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded-full">
                            {ex.sets && `${ex.sets}×`}{ex.reps}
                          </span>
                        </div>
                        {ex.notes && <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Work */}
              {session.mainWork && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span>💪</span> العمل الرئيسي
                  </h3>
                  {session.mainWork.map((block: any, i: number) => (
                    <div key={i} className="bg-gray-900 rounded-2xl border border-yellow-700/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white">{block.movement}</div>
                          <div className="text-xs text-gray-500">{block.movementEn}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">{block.weight}</div>
                          <div className="text-xs text-gray-500">الوزن</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-800 rounded-xl p-2 text-center">
                          <div className="text-xs text-gray-500">المجموعات</div>
                          <div className="text-sm text-white font-semibold">{block.sets}</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-2 text-center">
                          <div className="text-xs text-gray-500">التكرارات / الوقت</div>
                          <div className="text-sm text-white font-semibold">{block.reps}</div>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-2 text-center">
                          <div className="text-xs text-gray-500">الراحة</div>
                          <div className="text-sm text-white font-semibold">{block.restBetweenSets}</div>
                        </div>
                      </div>
                      {block.targetRPM && (
                        <div className="mt-2 bg-orange-900/20 rounded-xl p-2 text-center">
                          <span className="text-xs text-orange-400">🎯 الهدف: {block.targetRPM}</span>
                        </div>
                      )}
                      {block.technique && (
                        <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/10 rounded-lg p-2">
                          💡 {block.technique}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Grip Work */}
              {session.gripwork && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                    <span>✋</span> تقوية القبضة
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">{session.gripwork.note}</p>
                  <div className="space-y-2">
                    {session.gripwork.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{ex.name}</span>
                        <span className="text-orange-400 text-xs">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technique Notes */}
              {session.techniqueNotes?.length > 0 && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <span>📋</span> نقاط تقنية مهمة
                  </h3>
                  <div className="space-y-2">
                    {session.techniqueNotes.map((note: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
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
                    {(Array.isArray(session.cooldown) ? session.cooldown : session.cooldown.exercises || []).map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-gray-600">•</span>
                        <span>{ex.name}</span>
                        <span className="text-gray-500 text-xs">— {ex.duration}</span>
                        {ex.focus && <span className="text-xs text-blue-400">({ex.focus})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Placement */}
              {session.weeklyPlan && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-4 space-y-3">
                  <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
                    <span>📅</span> التوصية الأسبوعية
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">📌</span>
                      <div>
                        <span className="text-gray-400 text-xs">عدد الجلسات الأسبوعية: </span>
                        <span className="text-white">{session.weeklyPlan.sessionsPerWeek}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✅</span>
                      <div>
                        <span className="text-gray-400 text-xs">متى تُدرجها: </span>
                        <span className="text-white text-xs">{session.weeklyPlan.placement}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">⚠️</span>
                      <div>
                        <span className="text-gray-400 text-xs">تجنب قبلها: </span>
                        <span className="text-white text-xs">{session.weeklyPlan.avoidAfter}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progression */}
              {session.progressionNote && (
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <span>📈</span> كيف تتطور
                  </h3>
                  <p className="text-sm text-gray-300">{session.progressionNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
