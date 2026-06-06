'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ExerciseCard from '@/components/ExerciseCard';

const TYPE_COLORS: Record<string, string> = {
  'AMRAP': 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  'للوقت': 'bg-red-900/40 text-red-300 border-red-700/40',
  'قوة': 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  'تدريب': 'bg-green-900/40 text-green-300 border-green-700/40',
};

const SECTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  warmup:   { label: 'الإحماء',   icon: '🔆', color: 'text-yellow-400' },
  strength: { label: 'القوة',     icon: '🏋️', color: 'text-blue-400'   },
  metcon:   { label: 'الـ WOD',   icon: '🔥', color: 'text-orange-400' },
  cooldown: { label: 'التهدئة',   icon: '🧘', color: 'text-teal-400'   },
};

export default function WodHistoryClient({ member, wods }: { member: any; wods: any[] }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(wods[0]?.id || null);

  const filtered = wods.filter(w =>
    !search || w.title?.toLowerCase().includes(search.toLowerCase()) || w.date.includes(search)
  );

  function formatDate(date: string) {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> تاريخ التمارين
            </h1>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{wods.length} تمرين</span>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ابحث بالتاريخ أو العنوان..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
          />

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <div className="text-4xl mb-3">📭</div>
              <p>لا توجد تمارين</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(wod => {
              const isOpen = expandedId === wod.id;
              return (
                <div key={wod.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  {/* Header */}
                  <button className="w-full p-4 text-right" onClick={() => setExpandedId(isOpen ? null : wod.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[wod.type] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                          {wod.type}
                        </span>
                        {wod.duration && <span className="text-xs text-gray-500">⏱ {wod.duration}د</span>}
                        <span className="text-gray-600">{isOpen ? '▲' : '▼'}</span>
                      </div>
                      <div className="text-right min-w-0">
                        <div className="font-semibold text-white text-sm leading-tight truncate">{wod.title || 'تمرين'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatDate(wod.date)}</div>
                      </div>
                    </div>

                    {/* Mini preview */}
                    {!isOpen && (
                      <div className="flex gap-3 mt-2">
                        {(['strength', 'metcon'] as const).map(sec => {
                          const items = wod[sec]?.filter((e: any) => e.exerciseId);
                          if (!items?.length) return null;
                          const { icon, color } = SECTION_LABELS[sec];
                          return (
                            <div key={sec} className="text-xs text-gray-500 flex items-center gap-1">
                              <span className={color}>{icon}</span>
                              <span>{items.map((e: any) => e.exercise?.nameAr || e.exerciseId).slice(0, 2).join('، ')}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </button>

                  {/* Full Details */}
                  {isOpen && (
                    <div className="border-t border-gray-800 p-4 space-y-4">
                      {wod.notes && (
                        <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-300">
                          📝 {wod.notes}
                        </div>
                      )}
                      {wod.aiTheme && (
                        <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3 text-xs text-purple-300">
                          🤖 {wod.aiTheme}
                        </div>
                      )}

                      {(['warmup', 'strength', 'metcon', 'cooldown'] as const).map(sec => {
                        const items = wod[sec]?.filter((e: any) => e.exerciseId);
                        if (!items?.length) return null;
                        const { label, icon, color } = SECTION_LABELS[sec];
                        return (
                          <div key={sec}>
                            <h3 className={`font-semibold text-sm mb-2 flex items-center gap-2 ${color}`}>
                              <span>{icon}</span>{label}
                            </h3>
                            <div className="space-y-2">
                              {items.map((ex: any, i: number) => (
                                <ExerciseCard key={i} item={ex} index={i} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
