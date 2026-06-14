'use client';
import { useState } from 'react';

interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  gif: string;
  youtube: string;
  muscles: string;
  category: string;
}

interface LevelSpec {
  weight?: string;
  reps?: string;
  cue?: string;
  scaling?: string;
}

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
  exercise?: Exercise;
  levels?: Partial<Record<LevelKey, LevelSpec>>;
}

const LEVEL_TABS: { key: LevelKey; label: string; color: string; activeRing: string }[] = [
  { key: 'beginner',     label: 'مبتدئ', color: 'bg-green-600  text-white', activeRing: 'ring-green-500'  },
  { key: 'intermediate', label: 'متوسط', color: 'bg-blue-600   text-white', activeRing: 'ring-blue-500'   },
  { key: 'advanced',     label: 'متقدم', color: 'bg-orange-500 text-white', activeRing: 'ring-orange-400' },
  { key: 'elite',        label: 'نخبة',  color: 'bg-red-600    text-white', activeRing: 'ring-red-400'    },
];

const LEVEL_LABELS: Record<LevelKey, string> = {
  beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'نخبة',
};

// Detect if weight string contains multiple levels (old WOD format)
function isMultiLevelWeight(w: string): boolean {
  return w.includes('|') || w.includes('مبتدئ') || w.includes('متوسط');
}

// Parse "مبتدئ: 40كجم | متوسط: 60كجم | متقدم: 80كجم | نخبة: 95كجم" into object
function parseMultiLevelWeight(w: string): Partial<Record<LevelKey, string>> {
  const result: Partial<Record<LevelKey, string>> = {};
  const pairs = w.split('|');
  for (const p of pairs) {
    const cleaned = p.trim();
    if (cleaned.includes('مبتدئ'))     result.beginner     = cleaned.replace(/.*مبتدئ\s*[:：]?\s*/, '').trim();
    if (cleaned.includes('متوسط'))     result.intermediate = cleaned.replace(/.*متوسط\s*[:：]?\s*/, '').trim();
    if (cleaned.includes('متقدم'))     result.advanced     = cleaned.replace(/.*متقدم\s*[:：]?\s*/, '').trim();
    if (cleaned.includes('نخبة'))      result.elite        = cleaned.replace(/.*نخبة\s*[:：]?\s*/, '').trim();
  }
  return result;
}

export default function ExerciseCard({
  item,
  index,
  selectedLevel,
}: {
  item: WodExercise;
  index: number;
  selectedLevel?: LevelKey;
}) {
  const [showGif, setShowGif] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [activeLevel, setActiveLevel] = useState<LevelKey>('intermediate');
  const ex = item.exercise;

  // Structured levels (new WODs)
  const hasStructuredLevels = !!item.levels && Object.keys(item.levels).length > 0;

  // Legacy multi-level weight string (old WODs)
  const weightIsMultiLevel = item.weight ? isMultiLevelWeight(item.weight) : false;
  const parsedWeights = weightIsMultiLevel && item.weight ? parseMultiLevelWeight(item.weight) : null;

  const hasAnyLevels = hasStructuredLevels || !!parsedWeights;

  // What level data to show
  const displayLevel = selectedLevel ?? (showLevels ? activeLevel : null);

  // Get level data from structured levels OR parsed old weight
  function getLevelData(level: LevelKey): { weight?: string; reps?: string; cue?: string } | null {
    if (hasStructuredLevels && item.levels?.[level]) return item.levels[level]!;
    if (parsedWeights && parsedWeights[level]) {
      return { weight: parsedWeights[level], reps: item.reps || undefined };
    }
    return null;
  }

  const levelData = displayLevel ? getLevelData(displayLevel) : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">

      {/* ── Row 1: رقم + اسم + أزرار الإجراءات ── */}
      <div className="flex items-start gap-3 p-3 pb-2">
        {/* رقم */}
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white mt-0.5">
          {index + 1}
        </div>

        {/* اسم + عضلات */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 text-base leading-tight">
            {ex?.nameEn || item.exerciseId}
          </div>
          {ex?.muscles && (
            <div className="text-sm text-slate-500 mt-0.5">{ex.muscles}</div>
          )}
        </div>

        {/* أزرار فقط (بدون specs) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!selectedLevel && hasAnyLevels && (
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                showLevels ? 'bg-purple-500 text-white' : 'bg-slate-100 text-purple-600 hover:bg-purple-100'
              }`}
              title="عرض المستويات"
            >
              {showLevels ? '×' : '⚡'}
            </button>
          )}
          {ex?.gif && (
            <button
              onClick={() => setShowGif(!showGif)}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-sm transition-colors text-white"
              title="شاهد الأداء"
            >
              {showGif ? '×' : '▶'}
            </button>
          )}
          {ex?.youtube && (
            <a
              href={ex.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-sm transition-colors text-white"
              title="شرح يوتيوب"
            >
              ▶
            </a>
          )}
        </div>
      </div>

      {/* ── Row 2: specs (رپس + وزن) — تحت الاسم مباشرة ── */}
      <div className="px-3 pb-2">
        {!levelData && (
          <div className="flex flex-wrap gap-1.5">
            {item.reps && (
              <span className="text-sm bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-lg font-mono">
                🔁 {item.reps}
              </span>
            )}
            {item.weight && !weightIsMultiLevel && (
              <span className="text-sm bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-mono">
                ⚖️ {item.weight}
              </span>
            )}
            {item.distance && (
              <span className="text-sm bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-mono">
                📍 {item.distance}
              </span>
            )}
            {item.time && (
              <span className="text-sm bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-lg font-mono">
                ⏱ {item.time}
              </span>
            )}
          </div>
        )}

        {/* Level data (when section-level selector active) */}
        {levelData && (
          <div className="flex flex-wrap gap-1.5">
            {levelData.reps && (
              <span className="text-sm bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-lg font-mono">
                🔁 {levelData.reps}
              </span>
            )}
            {levelData.weight && (
              <span className="text-sm bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-lg font-mono font-bold">
                ⚖️ {levelData.weight}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Coaching cue from level ── */}
      {levelData && (levelData.cue || levelData.scaling) && (
        <div className="px-3 pb-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
            💬 {levelData.cue || levelData.scaling}
          </div>
        </div>
      )}

      {/* ── Notes (default, no level selected) ── */}
      {item.notes && !levelData && (
        <div className="px-3 pb-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-sm">
            💡 {item.notes}
          </div>
        </div>
      )}

      {/* ── GIF ── */}
      {showGif && ex?.gif && (
        <div className="border-t border-slate-200">
          <div className="bg-slate-50 flex items-center justify-center" style={{ minHeight: 200 }}>
            <img src={ex.gif} alt={ex.nameEn} className="max-h-64 w-full object-contain" loading="lazy" />
          </div>
          <div className="p-2 flex gap-2">
            <a href={ex.youtube} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg font-semibold">
              ▶ شرح على يوتيوب
            </a>
            <button onClick={() => setShowGif(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ── Internal levels toggle (when no section-level selected) ── */}
      {!selectedLevel && hasAnyLevels && showLevels && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-3">
            {LEVEL_TABS.map(t => {
              if (!getLevelData(t.key)) return null;
              return (
                <button key={t.key}
                  onClick={() => setActiveLevel(t.key)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${t.color} ${
                    activeLevel === t.key ? `ring-2 ${t.activeRing} opacity-100` : 'opacity-50 hover:opacity-80'
                  }`}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Active level content */}
          {(() => {
            const lv = getLevelData(activeLevel);
            if (!lv) return null;
            return (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-bold text-slate-500 text-right">{LEVEL_LABELS[activeLevel]}</div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {lv.reps && (
                    <span className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1 rounded-lg font-mono">
                      🔁 {lv.reps}
                    </span>
                  )}
                  {lv.weight && (
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-1 rounded-lg font-mono font-bold">
                      ⚖️ {lv.weight}
                    </span>
                  )}
                </div>
                {(lv.cue || lv.scaling) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                    💬 {lv.cue || lv.scaling}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
