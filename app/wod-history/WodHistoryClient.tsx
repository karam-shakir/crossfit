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

function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function buildWhatsAppText(wod: any): string {
  const lines: string[] = [];
  lines.push(`🏋️ تمرين CrossFit — ${formatDate(wod.date)}`);
  lines.push(`📌 ${wod.title || 'تمرين'}`);
  if (wod.type) lines.push(`⚡ النوع: ${wod.type}`);
  if (wod.duration) lines.push(`⏱ المدة: ${wod.duration} دقيقة`);
  if (wod.rounds) lines.push(`🔄 الجولات: ${wod.rounds}`);
  if (wod.aiTheme) lines.push(`\n🔗 ${wod.aiTheme}`);

  const sections: { key: string; icon: string; label: string }[] = [
    { key: 'warmup',   icon: '🔆', label: 'الإحماء'  },
    { key: 'strength', icon: '🏋️', label: 'القوة'    },
    { key: 'metcon',   icon: '🔥', label: 'الـ WOD'  },
    { key: 'cooldown', icon: '🧘', label: 'التهدئة'  },
  ];
  for (const sec of sections) {
    const items = (wod[sec.key] || []).filter((e: any) => e.exerciseId);
    if (!items.length) continue;
    lines.push(`\n${sec.icon} ${sec.label}:`);
    items.forEach((ex: any, i: number) => {
      const name = ex.exercise?.nameAr || ex.exerciseId;
      const reps = ex.reps ? ` — ${ex.reps}` : '';
      const weight = ex.weight ? ` (${ex.weight})` : '';
      const note = ex.notes ? ` · ${ex.notes}` : '';
      lines.push(`  ${i + 1}. ${name}${reps}${weight}${note}`);
    });
  }
  if (wod.notes) lines.push(`\n📝 ${wod.notes}`);
  lines.push(`\n💪 مجموعة المطانيخ CrossFit`);
  return lines.join('\n');
}

function WodCard({ wod, defaultOpen = false }: { wod: any; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isFuture = wod.date > today;
  const isToday = wod.date === today;

  function shareWhatsApp() {
    const text = buildWhatsAppText(wod);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  async function copyText() {
    const text = buildWhatsAppText(wod);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden ${
      isToday ? 'border-orange-500/60' : isFuture ? 'border-blue-700/40' : 'border-gray-800'
    }`}>
      <button className="w-full p-4 text-right" onClick={() => setIsOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">اليوم</span>}
            {isFuture && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">قادم</span>}
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

      {isOpen && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.547 5.874L0 24l6.304-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.358-.214-3.742.904.938-3.64-.234-.374A9.818 9.818 0 1112 21.818z"/>
              </svg>
              مشاركة واتساب
            </button>
            <button
              onClick={copyText}
              className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition-colors"
            >
              {copied ? '✅ تم النسخ' : '📋 نسخ'}
            </button>
          </div>

          {wod.notes && (
            <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-300">📝 {wod.notes}</div>
          )}
          {wod.aiTheme && (
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3 text-xs text-purple-300">🤖 {wod.aiTheme}</div>
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
}

export default function WodHistoryClient({ member, wods }: { member: any; wods: any[] }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = new Date().toISOString().split('T')[0];

  const upcoming = wods.filter(w => w.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = wods.filter(w => w.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const filtered = (tab === 'upcoming' ? upcoming : past).filter(w =>
    !search || w.title?.toLowerCase().includes(search.toLowerCase()) || w.date.includes(search)
  );

  return (
    <div className="min-h-screen flex">
      <Navbar member={member} />
      <main className="flex-1 lg:mr-56 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> جدول التمارين
            </h1>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{wods.length} تمرين</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setTab('upcoming')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📅 القادمة ({upcoming.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'past' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📚 السابقة ({past.length})
            </button>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ابحث بالتاريخ أو العنوان..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
          />

          {tab === 'upcoming' && upcoming.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">📭</div>
              <p className="text-gray-500">لا توجد تمارين مجدولة للأيام القادمة</p>
              <p className="text-xs text-gray-600">استخدم لوحة الإدارة ← الخطة الأسبوعية لتوليد تمارين الأسبوع</p>
            </div>
          )}

          {tab === 'past' && past.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500">لا توجد تمارين سابقة</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((wod, i) => (
              <WodCard
                key={wod.id}
                wod={wod}
                defaultOpen={tab === 'upcoming' && i === 0}
              />
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
