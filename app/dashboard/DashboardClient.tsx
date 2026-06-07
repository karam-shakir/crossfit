'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExerciseCard from '@/components/ExerciseCard';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const REACTION_EMOJIS = ['💪', '🔥', '😤', '🏆', '💀', '😅', '👊', '🙌'];

export default function DashboardClient({ member, wod, stats }: {
  member: any;
  wod: any;
  stats: { totalSessions: number; totalPRs: number; monthSessions: number; checkedInToday: boolean };
}) {
  const [checkedIn, setCheckedIn] = useState(stats.checkedInToday);
  const [checkLoading, setCheckLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('metcon');
  const [copied, setCopied] = useState(false);
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
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">{dateStr}</div>
              <h1 className="text-xl font-bold text-white mt-1">أهلاً {member.nameAr} {member.avatar}</h1>
            </div>
            <button onClick={checkIn} disabled={checkedIn || checkLoading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                checkedIn ? 'bg-green-800 text-green-300 cursor-default' : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}>
              {checkedIn ? '✅ حضرت اليوم' : checkLoading ? '...' : '📅 سجّل حضور'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-orange-400">{stats.monthSessions}</div>
              <div className="text-xs text-gray-400 mt-1">تمرين هذا الشهر</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalPRs}</div>
              <div className="text-xs text-gray-400 mt-1">رقم شخصي</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
              <div className="text-2xl font-bold text-blue-400">{stats.totalSessions}</div>
              <div className="text-xs text-gray-400 mt-1">إجمالي التمارين</div>
            </div>
          </div>

          {/* WOD */}
          {wod ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-l from-orange-900/30 to-gray-900 rounded-2xl p-4 border border-orange-800/50">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-orange-400">🔥 تمرين اليوم</h2>
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-700">
                    {wod.type}{wod.duration && ` • ${wod.duration} دقيقة`}{wod.rounds && ` • ${wod.rounds} راوندات`}
                  </span>
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
                                return (
                                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${style.bg} border border-white/5`}>
                                    <span className="text-gray-500 font-mono text-xs w-5">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-white text-sm">{nameEn}</div>
                                      {nameAr && <div className="text-xs text-gray-500">{nameAr}</div>}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
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
          ) : (
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
              <div className="text-5xl mb-4">😴</div>
              <div className="text-gray-400 font-semibold">لا يوجد تمرين لهذا اليوم</div>
              <div className="text-gray-600 text-sm mt-1">تواصل مع المدير لإضافة WOD</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
