'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const CATEGORY_LABELS: Record<string, string> = {
  gymnastics: '🤸 جمناستيك',
  olympic: '🏋️ رفع أثقال أولمبي',
};

const LEVEL_COLORS = [
  'bg-gray-700 text-gray-400',
  'bg-red-900/60 text-red-300',
  'bg-yellow-900/60 text-yellow-300',
  'bg-blue-900/60 text-blue-300',
  'bg-green-900/60 text-green-300',
];

export default function SkillsClient({ member }: { member: any }) {
  const [skills, setSkills] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('gymnastics');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(d => {
      setSkills(d.skills || []);
      setRecords(d.records || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function getRecord(skillId: string) {
    return records.find(r => r.skillId === skillId);
  }

  async function setLevel(skillId: string, level: number) {
    setSaving(skillId);
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, level }),
    });
    const data = await res.json();
    setRecords(prev => {
      const idx = prev.findIndex(r => r.skillId === skillId);
      if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
      return [...prev, data];
    });
    setSaving(null);
  }

  const categories = Array.from(new Set(skills.map((s: any) => s.category)));
  const filtered = skills.filter(s => s.category === activeCategory);

  // Stats
  const total = skills.length;
  const mastered = records.filter(r => {
    const sk = skills.find(s => s.id === r.skillId);
    return sk && r.level === sk.levels.length - 1;
  }).length;
  const inProgress = records.filter(r => r.level > 0).length;

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-teal-900/40 to-cyan-900/40 rounded-2xl border border-teal-700/30 p-5">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span> متتبع المهارات
            </h1>
            <p className="text-sm text-gray-400 mt-1">سجّل مستواك في كل مهارة وتابع تطورك</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-xs text-gray-500">إجمالي المهارات</div>
            </div>
            <div className="bg-blue-900/20 rounded-xl border border-blue-700/30 p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{inProgress}</div>
              <div className="text-xs text-gray-500">قيد التطوير</div>
            </div>
            <div className="bg-green-900/20 rounded-xl border border-green-700/30 p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{mastered}</div>
              <div className="text-xs text-gray-500">مُتقنة ✅</div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeCategory === cat ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Skills List */}
          {loading ? (
            <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(skill => {
                const record = getRecord(skill.id);
                const currentLevel = record?.level ?? -1;
                const isExpanded = expandedSkill === skill.id;
                const pct = currentLevel >= 0 ? Math.round(((currentLevel + 1) / skill.levels.length) * 100) : 0;

                return (
                  <div key={skill.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    {/* Skill Header */}
                    <button className="w-full p-4 text-right" onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Progress circle */}
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#374151" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15" fill="none"
                                stroke={currentLevel < 0 ? '#374151' : currentLevel === skill.levels.length - 1 ? '#10b981' : '#3b82f6'}
                                strokeWidth="3"
                                strokeDasharray={`${pct * 0.942} 94.2`}
                                strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                              {currentLevel < 0 ? '—' : `${pct}%`}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {isExpanded ? '▲' : '▼'}
                              {currentLevel === skill.levels.length - 1 && <span className="text-green-400">✅</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">{skill.nameAr}</div>
                          <div className="text-xs text-gray-500">{skill.nameEn}</div>
                          {currentLevel >= 0 && (
                            <div className="text-xs text-teal-400 mt-0.5">{skill.levels[currentLevel]}</div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Levels */}
                    {isExpanded && (
                      <div className="border-t border-gray-800 p-4 space-y-2">
                        <p className="text-xs text-gray-500 mb-3">اختر مستواك الحالي في هذه المهارة:</p>
                        {skill.levels.map((lvl: string, idx: number) => (
                          <button key={idx}
                            onClick={() => setLevel(skill.id, idx)}
                            disabled={saving === skill.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-right ${
                              currentLevel === idx
                                ? `${LEVEL_COLORS[idx]} border-current`
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                            }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              currentLevel >= idx ? LEVEL_COLORS[Math.min(idx, 4)] : 'bg-gray-700 text-gray-500'
                            }`}>
                              {currentLevel >= idx ? '✓' : idx}
                            </div>
                            <span className="text-sm">{lvl}</span>
                            {currentLevel === idx && saving !== skill.id && (
                              <span className="mr-auto text-xs opacity-60">← مستواك الحالي</span>
                            )}
                            {saving === skill.id && currentLevel === idx && (
                              <span className="mr-auto text-xs animate-pulse">جاري الحفظ...</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}




