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
    { key: 'warmup', label: 'الإحماء 🔆', items: wod?.warmup || [] },
    { key: 'strength', label: 'القوة 🏋️', items: wod?.strength || [] },
    { key: 'metcon', label: 'الـ WOD 🔥', items: wod?.metcon || [] },
    { key: 'cooldown', label: 'التهدئة 🧘', items: wod?.cooldown || [] },
  ].filter(s => s.items.length > 0);

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
