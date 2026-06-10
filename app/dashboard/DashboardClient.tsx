'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExerciseCard from '@/components/ExerciseCard';

const YOUTUBE_LINKS: Record<string, string> = {
  'back-squat':       'https://www.youtube.com/results?search_query=back+squat+crossfit+tutorial',
  'front-squat':      'https://www.youtube.com/results?search_query=front+squat+crossfit+tutorial',
  'deadlift':         'https://www.youtube.com/results?search_query=deadlift+crossfit+tutorial',
  'power-clean':      'https://www.youtube.com/results?search_query=power+clean+crossfit+tutorial',
  'clean-and-jerk':   'https://www.youtube.com/results?search_query=clean+and+jerk+crossfit+tutorial',
  'snatch':           'https://www.youtube.com/results?search_query=snatch+crossfit+tutorial',
  'overhead-squat':   'https://www.youtube.com/results?search_query=overhead+squat+crossfit+tutorial',
  'shoulder-press':   'https://www.youtube.com/results?search_query=shoulder+press+crossfit+tutorial',
  'push-press':       'https://www.youtube.com/results?search_query=push+press+crossfit+tutorial',
  'thruster':         'https://www.youtube.com/results?search_query=thruster+crossfit+tutorial',
  'pull-up':          'https://www.youtube.com/results?search_query=pull+up+crossfit+tutorial',
  'kipping-pull-up':  'https://www.youtube.com/results?search_query=kipping+pull+up+crossfit+tutorial',
  'muscle-up':        'https://www.youtube.com/results?search_query=muscle+up+crossfit+tutorial',
  'handstand-pushup': 'https://www.youtube.com/results?search_query=handstand+push+up+crossfit+tutorial',
  'handstand-walk':   'https://www.youtube.com/results?search_query=handstand+walk+crossfit+tutorial',
  'toes-to-bar':      'https://www.youtube.com/results?search_query=toes+to+bar+crossfit+tutorial',
  'double-under':     'https://www.youtube.com/results?search_query=double+under+jump+rope+crossfit+tutorial',
  'box-jump':         'https://www.youtube.com/results?search_query=box+jump+crossfit+tutorial',
  'burpee':           'https://www.youtube.com/results?search_query=burpee+crossfit+tutorial',
  'wall-ball':        'https://www.youtube.com/results?search_query=wall+ball+crossfit+tutorial',
  'kettle-bell-swing':'https://www.youtube.com/results?search_query=kettlebell+swing+crossfit+tutorial',
  'row':              'https://www.youtube.com/results?search_query=rowing+machine+crossfit+tutorial',
  'run':              'https://www.youtube.com/results?search_query=crossfit+running+technique',
  'push-up':          'https://www.youtube.com/results?search_query=push+up+crossfit+tutorial',
  'sit-up':           'https://www.youtube.com/results?search_query=sit+up+abmat+crossfit+tutorial',
  'rope-climb':       'https://www.youtube.com/results?search_query=rope+climb+crossfit+tutorial',
};

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const REACTION_EMOJIS = ['💪', '🔥', '😤', '🏆', '💀', '😅', '👊', '🙌'];

// ── مساعد: رابط يوتيوب ──────────────────────────────────────────────────────
function YtBtn({ nameEn, sport }: { nameEn: string; sport: string }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(nameEn + ' ' + sport + ' tutorial')}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex-shrink-0 hover:opacity-80 transition-opacity" title="شاهد الشرح">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    </a>
  );
}

// ── بطاقة Hyrox اليوم ────────────────────────────────────────────────────────
function HyroxTodayCard({ sessions }: { sessions: any[] }) {
  const [open, setOpen]     = useState(false);
  const [tab,  setTab]      = useState('stations');
  const [copied, setCopied] = useState(false);
  if (!sessions.length) return null;
  const rec = sessions[0];
  const s   = rec.sessionData || rec;

  function ytLink(nameEn: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(nameEn + ' hyrox tutorial')}`;
  }
  function buildText() {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    const lines: string[] = [];
    lines.push(`🏁 Hyrox — ${dateStr}`);
    lines.push(`📌 ${s.title || 'جلسة Hyrox'}${s.totalDuration ? ' | ⏱'+s.totalDuration+'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    if (s.warmup?.exercises?.length) {
      lines.push(`\n🔆 الإحماء${s.warmup.duration ? ' — '+s.warmup.duration+'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i+1}. ${ex.name}${ex.reps ? ' — '+ex.reps : ''}${ex.duration ? ' — '+ex.duration : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn)}`);
      });
    }
    if (s.stations?.length) {
      lines.push('\n🏁 المحطات:');
      s.stations.forEach((st: any, i: number) => {
        lines.push(`  ${i+1}. ${st.name}${st.runBefore ? ' | جري '+st.runBefore : ''}${st.weight ? ' | ⚖️ '+st.weight : ''}${st.target ? ' | 🎯 '+st.target : ''}`);
        if (st.tips) lines.push(`     💡 ${st.tips}`);
        if (st.nameEn || st.name) lines.push(`     ▶️ ${ytLink(st.nameEn || st.name)}`);
      });
    }
    if (s.nutritionBefore) lines.push(`\n🥗 قبل: ${s.nutritionBefore}`);
    if (s.nutritionAfter)  lines.push(`🥗 بعد: ${s.nutritionAfter}`);
    lines.push('\n💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const tabs = [
    s.warmup?.exercises?.length   && { key: 'warmup',   label: '🔆 إحماء' },
    s.stations?.length            && { key: 'stations', label: '🏁 محطات' },
    s.targetTimes                 && { key: 'times',    label: '⏱ أوقات'  },
    true                          && { key: 'all',      label: '🌐 الكل'   },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${open ? 'border-red-600/50' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full">{rec.sessionType || 'simulation'}</span>
            {s.totalDuration && <span className="text-xs text-gray-500">⏱{s.totalDuration}د</span>}
            <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0">
              <div className="text-xs text-gray-400">Hyrox اليوم</div>
              <div className="text-sm font-semibold text-white truncate">{s.title || 'جلسة Hyrox'}</div>
            </div>
            <span className="text-2xl flex-shrink-0">🏁</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* أزرار المشاركة */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="tap-scale flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              📲 واتساب
            </button>
            <button onClick={copyText}
              className="tap-scale px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors min-w-[72px]">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-xs text-red-300">💬 {s.coachNote}</div>}

          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tab === t.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Warmup */}
          {(tab === 'warmup' || tab === 'all') && s.warmup?.exercises?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration}</h4>}
              <div className="space-y-1.5">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2.5">
                    <YtBtn nameEn={ex.nameEn || ex.name} sport="hyrox" />
                    <div className="text-right min-w-0">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.duration || ex.reps || ''}</span>
                      {ex.notes && <p className="text-xs text-gray-500 mt-0.5">{ex.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stations */}
          {(tab === 'stations' || tab === 'all') && s.stations?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-red-400 mb-2">🏁 المحطات</h4>}
              <div className="space-y-2">
                {s.stations.map((st: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <YtBtn nameEn={st.nameEn || st.name} sport="hyrox" />
                      <div className="text-right">
                        <span className="text-xs text-gray-500">#{st.number} 🏃 {st.runBefore} ←</span>
                        <span className="font-semibold text-white text-sm mr-1">{st.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end flex-wrap">
                      <span>🎯 {st.target}</span>
                      {st.weight     && <span>⚖️ {st.weight}</span>}
                      {st.targetTime && <span>⏱ {st.targetTime}</span>}
                    </div>
                    {st.tips && <p className="text-xs text-yellow-300 mt-1.5 text-right">💡 {st.tips}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target times */}
          {(tab === 'times' || tab === 'all') && s.targetTimes && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-gray-400 mb-2">⏱ أوقات الأداء المرجعية</h4>}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(s.targetTimes).map(([k, v]: [string, any]) => {
                  const labels: Record<string,string> = {elite:'نخبة 🥇',advanced:'متقدم 🥈',intermediate:'متوسط 🥉',beginner:'مبتدئ'};
                  return (
                    <div key={k} className="bg-gray-800/60 rounded-lg px-3 py-2 text-right">
                      <div className="text-xs text-gray-400">{labels[k]||k}</div>
                      <div className="text-sm font-semibold text-white">{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── بطاقة Kettlebell اليوم ───────────────────────────────────────────────────
function KettlebellTodayCard({ sessions }: { sessions: any[] }) {
  const [open, setOpen]     = useState(false);
  const [tab,  setTab]      = useState('main');
  const [copied, setCopied] = useState(false);
  if (!sessions.length) return null;
  const rec = sessions[0];
  const s   = rec.sessionData || rec;

  function ytLink(nameEn: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(nameEn + ' kettlebell tutorial')}`;
  }
  function buildText() {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    const lines: string[] = [];
    lines.push(`🔔 Kettlebell — ${dateStr}`);
    lines.push(`📌 ${s.title || 'جلسة Kettlebell'}`);
    if (s.coachNote)        lines.push(`💬 ${s.coachNote}`);
    if (s.breathingPattern) lines.push(`🌬️ ${s.breathingPattern}`);
    if (s.warmup?.movements?.length) {
      lines.push(`\n🔆 الإحماء${s.warmup.duration ? ' — '+s.warmup.duration+'د' : ''}:`);
      s.warmup.movements.forEach((m: any, i: number) => {
        if (typeof m === 'string') {
          lines.push(`  ${i+1}. ${m}`);
        } else {
          lines.push(`  ${i+1}. ${m.name}${m.sets ? ' — '+m.sets+'×' : ''}${m.reps || ''}${m.notes ? ' | '+m.notes : ''}`);
          if (m.nameEn) lines.push(`     ▶️ ${ytLink(m.nameEn)}`);
        }
      });
    }
    if (s.mainWork?.length) {
      lines.push('\n🔔 العمل الرئيسي:');
      s.mainWork.forEach((ex: any, i: number) => {
        const name = ex.exerciseAr || ex.exercise;
        lines.push(`  ${i+1}. ${name}${ex.sets ? ' | '+ex.sets+' مج' : ''}${ex.reps ? ' × '+ex.reps : ''}${ex.weight ? ' | ⚖️ '+ex.weight : ''}${ex.targetRPM ? ' | 🔄 '+ex.targetRPM+' RPM' : ''}${ex.restBetweenSets ? ' | راحة '+ex.restBetweenSets : ''}`);
        if (ex.technique)   lines.push(`     💡 ${ex.technique}`);
        if (ex.exercise)    lines.push(`     ▶️ ${ytLink(ex.exercise)}`);
      });
    }
    if (s.techniqueNotes?.length) {
      lines.push('\n💡 ملاحظات تقنية:');
      s.techniqueNotes.forEach((n: string) => lines.push(`  • ${n}`));
    }
    lines.push('\n💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const tabs = [
    s.warmup?.movements?.length   && { key: 'warmup', label: '🔆 إحماء'    },
    s.mainWork?.length            && { key: 'main',   label: '🔔 التمرين'   },
    s.techniqueNotes?.length      && { key: 'notes',  label: '💡 تقنية'     },
    true                          && { key: 'all',    label: '🌐 الكل'      },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${open ? 'border-yellow-600/50' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded-full">{rec.eventType || 'biathlon'}</span>
            {s.focus && <span className="text-xs text-gray-500">{s.focus}</span>}
            <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0">
              <div className="text-xs text-gray-400">Kettlebell اليوم</div>
              <div className="text-sm font-semibold text-white truncate">{s.title || 'جلسة Kettlebell'}</div>
            </div>
            <span className="text-2xl flex-shrink-0">🔔</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* أزرار المشاركة */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="tap-scale flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              📲 واتساب
            </button>
            <button onClick={copyText}
              className="tap-scale px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors min-w-[72px]">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs text-yellow-300">💬 {s.coachNote}</div>}
          {s.breathingPattern && <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-300">🌬️ {s.breathingPattern}</div>}

          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tab === t.key ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Warmup */}
          {(tab === 'warmup' || tab === 'all') && s.warmup?.movements?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration}</h4>}
              <div className="space-y-1.5">
                {s.warmup.movements.map((m: any, i: number) => (
                  typeof m === 'string'
                    ? <span key={i} className="inline-block text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg mr-1 mb-1">{m}</span>
                    : <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-400">{m.sets && `${m.sets}×`}{m.reps}</span>
                        <div className="text-right"><span className="text-sm text-white">{m.name}</span></div>
                      </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {(tab === 'all') && s.cooldown?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-teal-400 mb-2">🧘 التهدئة</h4>
              <div className="space-y-1.5">
                {s.cooldown.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-400">{ex.duration}</span>
                    <div className="text-right"><span className="text-sm text-white">{ex.name}</span>{ex.focus && <span className="text-xs text-teal-400 mr-2">({ex.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Work */}
          {(tab === 'main' || tab === 'all') && s.mainWork?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-yellow-400 mb-2">🔔 العمل الرئيسي</h4>}
              <div className="space-y-2">
                {s.mainWork.map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-yellow-900/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <YtBtn nameEn={ex.exercise || ex.exerciseAr || ''} sport="kettlebell" />
                      <div className="font-semibold text-white text-sm">{ex.exerciseAr || ex.exercise}</div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end flex-wrap">
                      {ex.sets      && <span>{ex.sets} مجموعة</span>}
                      {ex.reps      && <span>{ex.reps} تكرار</span>}
                      {ex.weight    && <span>⚖️ {ex.weight}</span>}
                      {ex.targetRPM && <span>🔄 {ex.targetRPM} RPM</span>}
                      {ex.restBetweenSets && <span>راحة {ex.restBetweenSets}</span>}
                    </div>
                    {ex.technique && <p className="text-xs text-yellow-300 mt-1.5 text-right">💡 {ex.technique}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technique Notes */}
          {(tab === 'notes' || tab === 'all') && s.techniqueNotes?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-gray-400 mb-2">💡 ملاحظات تقنية</h4>}
              <div className="bg-gray-800/40 rounded-xl p-3 space-y-1.5">
                {s.techniqueNotes.map((n: string, i: number) => (
                  <p key={i} className="text-xs text-gray-300">• {n}</p>
                ))}
              </div>
            </div>
          )}

          {s.progressionNote && tab === 'all' && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
              📈 {s.progressionNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── بطاقة Calisthenics اليوم ─────────────────────────────────────────────────
function CalisthenicsTodayCard({ sessions }: { sessions: any[] }) {
  const [open, setOpen]     = useState(false);
  const [tab,  setTab]      = useState('main');
  const [copied, setCopied] = useState(false);
  if (!sessions.length) return null;
  const rec = sessions[0];
  const s   = rec.sessionData || rec;

  function ytLink(nameEn: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(nameEn + ' calisthenics tutorial')}`;
  }
  function buildText() {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    const lines: string[] = [];
    lines.push(`🤸 Calisthenics — ${dateStr}`);
    lines.push(`📌 ${s.title || 'جلسة Calisthenics'}${rec.sessionType ? ' | ' + rec.sessionType : ''}${s.totalDuration ? ' | ⏱' + s.totalDuration + 'د' : ''}`);
    if (s.coachNote) lines.push(`💬 ${s.coachNote}`);
    if (s.warmup?.exercises?.length) {
      lines.push(`\n🔆 الإحماء${s.warmup.duration ? ' — ' + s.warmup.duration + 'د' : ''}:`);
      s.warmup.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i+1}. ${ex.name}${ex.sets ? ' — '+ex.sets+'×' : ''}${ex.reps || ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn)}`);
      });
    }
    if (s.skillWork?.exercises?.length) {
      lines.push(`\n🤸 ${s.skillWork.title || 'مهارات'}${s.skillWork.duration ? ' — '+s.skillWork.duration+'د' : ''}:`);
      s.skillWork.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i+1}. ${ex.name}${ex.target ? ' — '+ex.target : ''}`);
        if (ex.nameEn)      lines.push(`     ▶️ ${ytLink(ex.nameEn)}`);
        if (ex.regression)  lines.push(`     ⬇️ ${ex.regression}`);
        if (ex.progression) lines.push(`     ⬆️ ${ex.progression}`);
      });
    }
    const mainEx = Array.isArray(s.mainWork) ? s.mainWork : (s.mainWork?.exercises || []);
    if (mainEx.length) {
      const mwTitle = !Array.isArray(s.mainWork) ? (s.mainWork?.title || 'العمل الرئيسي') : 'العمل الرئيسي';
      lines.push(`\n💪 ${mwTitle}:`);
      if (!Array.isArray(s.mainWork) && s.mainWork?.format) lines.push(`  📋 ${s.mainWork.format}`);
      mainEx.forEach((ex: any, i: number) => {
        lines.push(`  ${i+1}. ${ex.name}${ex.sets ? ' | '+ex.sets+' مج' : ''}${ex.reps ? ' × '+ex.reps : ''}${ex.rest ? ' | راحة '+ex.rest : ''}`);
        if (ex.nameEn)                             lines.push(`     ▶️ ${ytLink(ex.nameEn)}`);
        if (ex.cues)                               lines.push(`     💡 ${ex.cues}`);
        if (ex.regression || ex.scaling?.easier)   lines.push(`     ⬇️ ${ex.regression || ex.scaling?.easier}`);
        if (ex.progression || ex.scaling?.harder)  lines.push(`     ⬆️ ${ex.progression || ex.scaling?.harder}`);
      });
    }
    if (s.metcon?.exercises?.length) {
      lines.push(`\n🔥 ${s.metcon.format || 'Metcon'}${s.metcon.duration ? ' — '+s.metcon.duration+'د' : ''}:`);
      s.metcon.exercises.forEach((ex: any, i: number) => {
        lines.push(`  ${i+1}. ${ex.name}${ex.reps ? ' — '+ex.reps : ''}`);
        if (ex.nameEn) lines.push(`     ▶️ ${ytLink(ex.nameEn)}`);
      });
    }
    if (s.cooldown?.stretches?.length) {
      lines.push(`\n🧘 التهدئة:`);
      s.cooldown.stretches.forEach((st: any, i: number) => {
        lines.push(`  ${i+1}. ${st.name}${st.duration ? ' — '+st.duration : ''}${st.focus ? ' | '+st.focus : ''}`);
      });
    }
    lines.push('\n💪 مجموعة المطانيخ CrossFit');
    return lines.join('\n');
  }
  async function copyText() {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const tabs = [
    s.warmup?.exercises?.length      && { key: 'warmup',  label: '🔆 إحماء'    },
    s.skillWork?.exercises?.length   && { key: 'skill',   label: '🤸 مهارات'   },
    s.mainWork?.exercises?.length    && { key: 'main',    label: '💪 التمرين'   },
    s.metcon?.exercises?.length      && { key: 'metcon',  label: '🔥 WOD'       },
    true                             && { key: 'all',     label: '🌐 الكل'      },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${open ? 'border-emerald-600/50' : 'border-gray-800'}`}>
      <button className="w-full p-4 text-right" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full">{rec.sessionType || 'strength'}</span>
            {s.totalDuration && <span className="text-xs text-gray-500">⏱{s.totalDuration}د</span>}
            <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0">
              <div className="text-xs text-gray-400">Calisthenics اليوم</div>
              <div className="text-sm font-semibold text-white truncate">{s.title || 'جلسة Calisthenics'}</div>
            </div>
            <span className="text-2xl flex-shrink-0">🤸</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* أزرار المشاركة */}
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank')}
              className="tap-scale flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              📲 واتساب
            </button>
            <button onClick={copyText}
              className="tap-scale px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors min-w-[72px]">
              {copied ? '✅' : '📋'} نسخ
            </button>
          </div>

          {s.coachNote && <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 text-xs text-emerald-300">💬 {s.coachNote}</div>}

          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tab === t.key ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Warmup */}
          {(tab === 'warmup' || tab === 'all') && s.warmup?.exercises?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-yellow-400 mb-2">🔆 الإحماء — {s.warmup.duration} د</h4>}
              <div className="space-y-1.5">
                {s.warmup.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2.5">
                    <YtBtn nameEn={ex.nameEn || ex.name} sport="calisthenics" />
                    <div className="text-right min-w-0">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.sets}×{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Work */}
          {(tab === 'skill' || tab === 'all') && s.skillWork?.exercises?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-purple-400 mb-2">🤸 {s.skillWork.title || 'مهارات'} — {s.skillWork.duration} د</h4>}
              <div className="space-y-2">
                {s.skillWork.exercises.map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-purple-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <YtBtn nameEn={ex.nameEn || ex.name} sport="calisthenics" />
                      <div className="font-semibold text-white text-sm">{ex.name}</div>
                    </div>
                    {ex.regression  && <p className="text-xs text-blue-300 text-right">⬇️ مبسّط: {ex.regression}</p>}
                    {ex.progression && <p className="text-xs text-green-300 text-right">⬆️ متقدم: {ex.progression}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Work — يدعم البنية الجديدة (object) والقديمة (array) */}
          {(tab === 'main' || tab === 'all') && s.mainWork && (Array.isArray(s.mainWork) ? s.mainWork.length > 0 : s.mainWork.exercises?.length > 0) && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-emerald-400 mb-2">💪 {Array.isArray(s.mainWork) ? 'العمل الرئيسي' : (s.mainWork.title || 'العمل الرئيسي')} {!Array.isArray(s.mainWork) && s.mainWork.duration ? `— ${s.mainWork.duration} د` : ''}</h4>}
              <div className="space-y-2">
                {(Array.isArray(s.mainWork) ? s.mainWork : s.mainWork.exercises).map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3 border border-emerald-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <YtBtn nameEn={ex.nameEn || ex.name} sport="calisthenics" />
                      <div className="font-semibold text-white text-sm">{ex.name}</div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 justify-end">
                      {ex.sets && <span>{ex.sets} مج</span>}
                      {ex.reps && <span>{ex.reps}</span>}
                      {ex.rest && <span>راحة {ex.rest}</span>}
                    </div>
                    {ex.regression  && <p className="text-xs text-blue-300 text-right mt-1">⬇️ {ex.regression}</p>}
                    {ex.progression && <p className="text-xs text-green-300 text-right mt-1">⬆️ {ex.progression}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metcon */}
          {(tab === 'metcon' || tab === 'all') && s.metcon?.exercises?.length > 0 && (
            <div>
              {tab === 'all' && <h4 className="text-xs font-semibold text-orange-400 mb-2">🔥 {s.metcon.format} — {s.metcon.duration} د</h4>}
              <div className="space-y-1.5">
                {s.metcon.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2.5">
                    <YtBtn nameEn={ex.nameEn || ex.name} sport="calisthenics" />
                    <div className="text-right">
                      <span className="text-sm text-white">{ex.name}</span>
                      <span className="text-xs text-gray-400 mr-2">{ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {tab === 'all' && s.cooldown?.stretches?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-teal-400 mb-2">🧘 التهدئة — {s.cooldown.duration} د</h4>
              <div className="space-y-1.5">
                {s.cooldown.stretches.map((st: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-400">{st.duration}</span>
                    <div className="text-right"><span className="text-sm text-white">{st.name}</span>{st.focus && <span className="text-xs text-teal-400 mr-2">({st.focus})</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.progressionNote && tab === 'all' && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
              📈 {s.progressionNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({ member, wod, todayHyrox = [], todayKettlebell = [], todayCalisthenics = [], stats }: {
  member: any;
  wod: any;
  todayHyrox?: any[];
  todayKettlebell?: any[];
  todayCalisthenics?: any[];
  stats: { totalSessions: number; totalPRs: number; monthSessions: number; checkedInToday: boolean };
}) {
  const [checkedIn, setCheckedIn] = useState(stats.checkedInToday);
  const [checkLoading, setCheckLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('metcon');
  const [copied, setCopied] = useState(false);
  const [sportTab, setSportTab] = useState<'crossfit' | 'hyrox' | 'kettlebell' | 'calisthenics'>('crossfit');
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentResult, setCommentResult] = useState('');
  const [commentEmoji, setCommentEmoji] = useState('');
  const [commentRxd, setCommentRxd] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const dateStr = `${DAYS_AR[now.getDay()]}، ${now.getDate()} ${MONTHS_AR[now.getMonth()]} ${now.getFullYear()}`;

  useEffect(() => {
    if (wod) {
      fetch(`/api/wod/comments?date=${wod.date}`).then(r => r.json()).then(d => setComments(Array.isArray(d) ? d : []));
    }
  }, [wod]);

  async function checkIn() {
    setCheckLoading(true);
    try {
      const res = await fetch('/api/attendance', { method: 'POST' });
      if (res.ok) setCheckedIn(true);
    } finally { setCheckLoading(false); }
  }

  async function postComment() {
    if (!commentText.trim() && !commentResult) return;
    setPosting(true);
    const res = await fetch('/api/wod/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: wod.date, text: commentText, result: commentResult, rxd: commentRxd, emoji: commentEmoji }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [...prev, c]);
      setCommentText(''); setCommentResult(''); setCommentEmoji(''); setCommentRxd(false);
    }
    setPosting(false);
  }

  async function deleteComment(id: string) {
    await fetch(`/api/wod/comments?id=${id}`, { method: 'DELETE' });
    setComments(prev => prev.filter(c => c.id !== id));
  }

  const sections = [
    { key: 'warmup',   label: 'الإحماء 🔆', labelEn: 'Warm-Up',  items: wod?.warmup   || [] },
    { key: 'strength', label: 'القوة 🏋️',   labelEn: 'Strength', items: wod?.strength || [] },
    { key: 'metcon',   label: 'الـ WOD 🔥', labelEn: 'WOD',      items: wod?.metcon   || [] },
    { key: 'cooldown', label: 'التهدئة 🧘', labelEn: 'Cool-Down',items: wod?.cooldown || [] },
  ].filter(s => s.items.length > 0);

  function buildEnglishText() {
    if (!wod) return '';
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const lines: string[] = [];
    lines.push(`💪 Matanikeh CrossFit — WOD`);
    lines.push(`📅 ${dateStr}`);
    lines.push(`📌 ${wod.title || 'Today\'s Workout'}`);
    if (wod.type)     lines.push(`⚡ Type: ${wod.type}`);
    if (wod.duration) lines.push(`⏱ Duration: ${wod.duration} min`);
    if (wod.rounds)   lines.push(`🔄 Rounds: ${wod.rounds}`);
    if (wod.aiTheme)  lines.push(`\n🔗 ${wod.aiTheme}`);

    const ICONS: Record<string, string> = { warmup: '🔆', strength: '🏋️', metcon: '🔥', cooldown: '🧘' };
    for (const sec of sections) {
      lines.push(`\n${ICONS[sec.key] || '▸'} ${sec.labelEn.toUpperCase()}:`);
      sec.items.forEach((ex: any, i: number) => {
        const name = ex.exercise?.nameEn || ex.exerciseId || ex.exercise?.nameAr || '';
        const reps   = ex.reps   ? ` — ${ex.reps}`   : '';
        const weight = ex.weight ? ` (${ex.weight})`  : '';
        const note   = ex.notes  ? ` · ${ex.notes}`   : '';
        lines.push(`  ${i + 1}. ${name}${reps}${weight}${note}`);
      });
    }
    if (wod.notes) lines.push(`\n📝 ${wod.notes}`);
    lines.push(`\n🏋️ Matanikeh CrossFit Group`);
    return lines.join('\n');
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildEnglishText())}`, '_blank');
  }

  async function copyEnglish() {
    await navigator.clipboard.writeText(buildEnglishText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />

      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-gray-500">{dateStr}</div>
              <h1 className="text-lg font-bold text-white truncate">أهلاً {member.nameAr} {member.avatar}</h1>
            </div>
            <button onClick={checkIn} disabled={checkedIn || checkLoading}
              className={`tap-scale flex-shrink-0 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                checkedIn ? 'bg-green-900/60 text-green-400 border border-green-800' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}>
              {checkedIn ? '✅ حضرت' : checkLoading ? '...' : '📅 سجّل'}
            </button>
          </div>

          {/* Stats — شريط إحصائيات بشكل app */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: stats.monthSessions, label: 'هذا الشهر', color: 'text-orange-400', icon: '🔥' },
              { val: stats.totalPRs,      label: 'رقم شخصي',  color: 'text-yellow-400', icon: '🏆' },
              { val: stats.totalSessions, label: 'إجمالي',     color: 'text-blue-400',   icon: '📊' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-3 text-center border border-gray-800/80">
                <div className="text-base mb-0.5">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ══ تمارين اليوم — تبويبات الرياضات ══ */}
          {(wod || todayHyrox.length > 0 || todayKettlebell.length > 0 || todayCalisthenics.length > 0) && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-400">📅 تمارين اليوم</h2>

              {/* Sport tabs */}
              <div className="grid grid-cols-4 gap-1 bg-gray-900 p-1 rounded-2xl border border-gray-800 w-full">
                {([
                  { id: 'crossfit',     emoji: '🏋️', label: 'CF',    color: 'bg-orange-500',  has: !!wod },
                  { id: 'hyrox',        emoji: '🏁', label: 'Hyrox', color: 'bg-red-600',     has: todayHyrox.length > 0 },
                  { id: 'kettlebell',   emoji: '🔔', label: 'KB',    color: 'bg-yellow-500',  has: todayKettlebell.length > 0 },
                  { id: 'calisthenics', emoji: '🤸', label: 'Calis', color: 'bg-emerald-600', has: todayCalisthenics.length > 0 },
                ] as const).map(t => (
                  <button key={t.id} onClick={() => setSportTab(t.id)}
                    className={`tap-scale relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl overflow-hidden transition-all ${
                      sportTab === t.id ? t.color + ' text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    <span className="text-xl leading-none">{t.emoji}</span>
                    <span className="mt-0.5 text-[9px] font-semibold truncate w-full text-center leading-none">{t.label}</span>
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${t.has ? (sportTab === t.id ? 'bg-white/70' : 'bg-green-400') : 'bg-gray-700'}`} />
                  </button>
                ))}
              </div>

              {/* CrossFit tab — no separate WOD block below */}
              {sportTab === 'crossfit' && !wod && (
                <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
                  <div className="text-4xl mb-3">😴</div>
                  <div className="text-gray-400 font-semibold">لا يوجد تمرين CrossFit لهذا اليوم</div>
                </div>
              )}

              {/* Hyrox tab */}
              {sportTab === 'hyrox' && (
                todayHyrox.length > 0
                  ? <HyroxTodayCard sessions={todayHyrox} />
                  : <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
                      <div className="text-4xl mb-3">🏁</div>
                      <div className="text-gray-400">لا يوجد جلسة Hyrox لهذا اليوم</div>
                    </div>
              )}

              {/* Kettlebell tab */}
              {sportTab === 'kettlebell' && (
                todayKettlebell.length > 0
                  ? <KettlebellTodayCard sessions={todayKettlebell} />
                  : <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
                      <div className="text-4xl mb-3">🔔</div>
                      <div className="text-gray-400">لا يوجد جلسة Kettlebell لهذا اليوم</div>
                    </div>
              )}

              {/* Calisthenics tab */}
              {sportTab === 'calisthenics' && (
                todayCalisthenics.length > 0
                  ? <CalisthenicsTodayCard sessions={todayCalisthenics} />
                  : <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
                      <div className="text-4xl mb-3">🤸</div>
                      <div className="text-gray-400">لا يوجد جلسة Calisthenics لهذا اليوم</div>
                    </div>
              )}
            </div>
          )}

          {/* WOD — CrossFit (يظهر فقط عند تبويب CrossFit) */}
          {wod && sportTab === 'crossfit' ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-l from-orange-900/30 to-gray-900 rounded-2xl p-4 border border-orange-800/50">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-orange-400">🔥 تمرين اليوم</h2>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-700">{wod.type}</span>
                    {wod.duration && <span className="text-xs text-gray-400">⏱ {wod.duration} دقيقة</span>}
                    {wod.rounds && <span className="text-xs text-gray-400">🔄 {wod.rounds} جولات</span>}
                  </div>
                </div>
                <div className="text-white font-semibold">{wod.title}</div>
                {wod.notes && (
                  <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 rounded-lg px-3 py-2">💡 {wod.notes}</div>
                )}
                {wod.aiTheme && (
                  <div className="mt-2 text-xs text-purple-300 bg-purple-900/20 rounded-lg px-3 py-2">🤖 {wod.aiTheme}</div>
                )}
              </div>

              {sections.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {sections.map(s => (
                    <button key={s.key} onClick={() => setActiveSection(s.key)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeSection === s.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                  {/* تبويب الكل - English */}
                  <button onClick={() => setActiveSection('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}>
                    🌐 الكل
                  </button>
                </div>
              )}

              {sections.map(s => (
                <div key={s.key} className={activeSection === s.key ? 'space-y-3' : 'hidden'}>
                  <h3 className="text-sm font-semibold text-gray-400">{s.label}</h3>
                  {s.items.map((item: any, i: number) => (
                    <ExerciseCard key={i} item={item} index={i} />
                  ))}
                </div>
              ))}

              {/* تبويب الكل — العرض الكامل بالإنجليزية */}
              {activeSection === 'all' && (
                <div className="space-y-4">
                  {/* أزرار المشاركة */}
                  <div className="flex gap-2">
                    <button onClick={shareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.547 5.874L0 24l6.304-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.358-.214-3.742.904.938-3.64-.234-.374A9.818 9.818 0 1112 21.818z"/>
                      </svg>
                      Share on WhatsApp
                    </button>
                    <button onClick={copyEnglish}
                      className="px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors min-w-[90px]">
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>

                  {/* العنوان */}
                  <div className="bg-gray-900 rounded-2xl border border-blue-800/40 overflow-hidden">
                    <div className="bg-blue-900/20 px-4 py-3 border-b border-blue-800/30">
                      <div className="font-bold text-white text-base">{wod.title}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {wod.type     && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{wod.type}</span>}
                        {wod.duration && <span className="text-xs text-gray-400">⏱ {wod.duration} min</span>}
                        {wod.rounds   && <span className="text-xs text-gray-400">🔄 {wod.rounds} rounds</span>}
                      </div>
                      {wod.aiTheme && (
                        <div className="mt-2 text-xs text-blue-300">🔗 {wod.aiTheme}</div>
                      )}
                    </div>

                    {/* المقاطع بالإنجليزية */}
                    <div className="p-4 space-y-5">
                      {sections.map(sec => {
                        const SECTION_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
                          warmup:   { icon: '🔆', color: 'text-yellow-400', bg: 'bg-yellow-900/10' },
                          strength: { icon: '🏋️', color: 'text-blue-400',   bg: 'bg-blue-900/10'   },
                          metcon:   { icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-900/10' },
                          cooldown: { icon: '🧘', color: 'text-teal-400',   bg: 'bg-teal-900/10'   },
                        };
                        const style = SECTION_STYLE[sec.key] || { icon: '▸', color: 'text-gray-400', bg: 'bg-gray-800/30' };
                        return (
                          <div key={sec.key}>
                            <h4 className={`font-bold text-sm mb-2 flex items-center gap-2 ${style.color}`}>
                              <span>{style.icon}</span>
                              <span>{sec.labelEn.toUpperCase()}</span>
                              <span className="text-gray-600 font-normal text-xs">({sec.items.length} exercises)</span>
                            </h4>
                            <div className="space-y-2">
                              {sec.items.map((ex: any, i: number) => {
                                const nameEn = ex.exercise?.nameEn || ex.exerciseId || '—';
                                const nameAr = ex.exercise?.nameAr || '';
                                const ytUrl = YOUTUBE_LINKS[ex.exerciseId] ||
                                  `https://www.youtube.com/results?search_query=${encodeURIComponent((nameEn) + ' crossfit tutorial')}`;
                                return (
                                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${style.bg} border border-white/5`}>
                                    <span className="text-gray-500 font-mono text-xs w-5">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-white text-sm">{nameEn}</div>
                                      {nameAr && <div className="text-xs text-gray-500">{nameAr}</div>}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {ex.reps && (
                                        <span className="text-xs bg-orange-900/40 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded-lg font-mono">
                                          {ex.reps}
                                        </span>
                                      )}
                                      {ex.weight && (
                                        <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-lg font-mono">
                                          {ex.weight}
                                        </span>
                                      )}
                                      {/* YouTube icon */}
                                      <a href={ytUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                        title={`Watch ${nameEn} tutorial`}>
                                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF0000">
                                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {sec.key !== sections[sections.length - 1].key && (
                              <div className="mt-4 border-t border-gray-800" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {wod.notes && (
                      <div className="px-4 pb-4">
                        <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-xl p-3 text-xs text-yellow-300">
                          📝 {wod.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 💬 Comments / Results Section */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-right"
                  onClick={() => setShowComments(p => !p)}>
                  <span className="text-gray-500">{showComments ? '▲' : '▼'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">💬 نتائج الأعضاء</span>
                    {comments.length > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
                    )}
                  </div>
                </button>

                {showComments && (
                  <div className="border-t border-gray-800 p-4 space-y-4">
                    {/* Post form */}
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {REACTION_EMOJIS.map(e => (
                          <button key={e} onClick={() => setCommentEmoji(commentEmoji === e ? '' : e)}
                            className={`text-xl p-1.5 rounded-lg transition-all ${
                              commentEmoji === e ? 'bg-orange-500 scale-110' : 'bg-gray-800 hover:bg-gray-700'
                            }`}>
                            {e}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={commentResult} onChange={e => setCommentResult(e.target.value)}
                          className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                          placeholder="النتيجة" />
                        <button onClick={() => setCommentRxd(p => !p)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                            commentRxd ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                          RX'd
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && postComment()}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                          placeholder="اكتب تعليقك أو نتيجتك هنا..." />
                        <button onClick={postComment} disabled={posting || (!commentText.trim() && !commentResult)}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors">
                          {posting ? '...' : '📤'}
                        </button>
                      </div>
                    </div>

                    {/* Comments list */}
                    {comments.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-4">لا توجد تعليقات بعد — كن الأول! 💪</p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map(c => (
                          <div key={c.id} className="bg-gray-800/60 rounded-xl p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-lg">{c.memberAvatar}</span>
                                  <span className="font-semibold text-white text-sm">{c.memberName}</span>
                                  {c.emoji && <span className="text-lg">{c.emoji}</span>}
                                  {c.result && (
                                    <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded-full border border-orange-700/30">
                                      {c.result}
                                    </span>
                                  )}
                                  {c.rxd && (
                                    <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full border border-green-700/30">
                                      RX'd ✅
                                    </span>
                                  )}
                                </div>
                                {c.text && <p className="text-sm text-gray-300 mt-1">{c.text}</p>}
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(c.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {(c.memberId === member.id || member.role === 'admin') && (
                                <button onClick={() => deleteComment(c.id)}
                                  className="text-gray-600 hover:text-red-400 text-xs transition-colors flex-shrink-0">✕</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}


