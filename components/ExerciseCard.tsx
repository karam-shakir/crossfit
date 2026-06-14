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
  const hasLevels = !!item.levels && Object.keys(item.levels).length > 0;

  // Level to show: either from parent (section-level selector) or internal toggle
  const displayLevel = selectedLevel ?? (showLevels ? activeLevel : null);
  const levelData = displayLevel && item.levels?.[displayLevel];

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 text-base">
            {ex?.nameEn || item.exerciseId}
          </div>
          {ex?.muscles && (
            <div className="text-sm text-slate-500">{ex.muscles}</div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Spec badge — default weight/reps */}
          {!levelData && (item.reps || item.weight || item.distance || item.time) && (
            <div className="text-sm bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg text-orange-700 font-mono">
              {item.reps && `${item.reps}`}
              {item.weight && ` × ${item.weight}`}
              {item.distance && `${item.distance}`}
              {item.time && `${item.time}`}
            </div>
          )}

          {/* Level data badge (when level selected from section selector) */}
          {levelData && (
            <div className="flex items-center gap-1.5">
              {levelData.weight && (
                <span className="text-sm bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg text-slate-700 font-mono">
                  ⚖️ {levelData.weight}
                </span>
              )}
              {levelData.reps && (
                <span className="text-sm bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-blue-700 font-mono">
                  🔁 {levelData.reps}
                </span>
              )}
            </div>
          )}

          {/* Internal ⚡ toggle — only when no parent selectedLevel */}
          {!selectedLevel && hasLevels && (
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                showLevels ? 'bg-purple-500 text-white' : 'bg-slate-100 text-purple-500 hover:bg-purple-100'
              }`}
              title="عرض المستويات"
            >
              {showLevels ? '×' : '⚡'}
            </button>
          )}

          {/* GIF toggle */}
          {ex?.gif && (
            <button
              onClick={() => setShowGif(!showGif)}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-sm transition-colors text-white"
              title="شاهد الأداء"
            >
              {showGif ? '×' : '▶'}
            </button>
          )}

          {/* YouTube link */}
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

      {/* Coaching cue from level (when level selected) */}
      {levelData && (levelData.cue || levelData.scaling) && (
        <div className="px-3 pb-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
            💬 {levelData.cue || levelData.scaling}
          </div>
        </div>
      )}

      {/* Notes */}
      {item.notes && !levelData && (
        <div className="px-3 pb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 mx-3 mb-3 rounded-lg py-2">
          💡 {item.notes}
        </div>
      )}

      {/* GIF section */}
      {showGif && ex?.gif && (
        <div className="border-t border-slate-200">
          <div className="relative bg-slate-50 flex items-center justify-center" style={{ minHeight: 200 }}>
            <img
              src={ex.gif}
              alt={ex.nameEn}
              className="max-h-64 w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="p-2 flex gap-2">
            <a
              href={ex.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition-colors font-semibold"
            >
              <span>▶</span>
              <span>شرح مفصل على يوتيوب</span>
            </a>
            <button
              onClick={() => setShowGif(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Internal levels section (when no parent selectedLevel) */}
      {!selectedLevel && hasLevels && showLevels && (
        <div className="border-t border-slate-200 px-3 py-3 bg-slate-50">
          <div className="flex gap-1.5 mb-3">
            {LEVEL_TABS.map(t => {
              if (!item.levels?.[t.key]) return null;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveLevel(t.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${t.color} ${
                    activeLevel === t.key ? `ring-2 ${t.activeRing}` : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {item.levels?.[activeLevel] && (() => {
            const lv = item.levels![activeLevel]!;
            return (
              <div className="bg-white rounded-xl p-3 space-y-2 text-right border border-slate-200">
                <div className="flex gap-2 flex-wrap justify-end">
                  {lv.weight && (
                    <span className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-2.5 py-1 rounded-lg font-mono">
                      ⚖️ {lv.weight}
                    </span>
                  )}
                  {lv.reps && (
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-2.5 py-1 rounded-lg font-mono">
                      🔁 {lv.reps}
                    </span>
                  )}
                </div>
                {(lv.cue || lv.scaling) && (
                  <p className="text-sm text-slate-600 leading-relaxed">💬 {lv.cue || lv.scaling}</p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
