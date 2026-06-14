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

interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
  exercise?: Exercise;
  levels?: {
    beginner?: LevelSpec;
    intermediate?: LevelSpec;
    advanced?: LevelSpec;
    elite?: LevelSpec;
  };
}

const LEVEL_TABS = [
  { key: 'beginner',     label: 'مبتدئ',  color: 'bg-green-700  text-white', activeRing: 'ring-green-500'  },
  { key: 'intermediate', label: 'متوسط',  color: 'bg-blue-700   text-white', activeRing: 'ring-blue-500'   },
  { key: 'advanced',     label: 'متقدم',  color: 'bg-orange-600 text-white', activeRing: 'ring-orange-400' },
  { key: 'elite',        label: 'نخبة',   color: 'bg-red-700    text-white', activeRing: 'ring-red-400'    },
] as const;

export default function ExerciseCard({ item, index }: { item: WodExercise; index: number }) {
  const [showGif, setShowGif] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [activeLevel, setActiveLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'elite'>('intermediate');
  const ex = item.exercise;
  const hasLevels = !!item.levels && Object.keys(item.levels).length > 0;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center gap-3 p-3">
        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">
            {ex?.nameAr || item.exerciseId}
          </div>
          {ex && (
            <div className="text-xs text-gray-400">{ex.nameEn} • {ex.muscles}</div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Spec badge */}
          <div className="text-xs bg-gray-700 px-2 py-1 rounded-lg text-orange-300 font-mono">
            {item.reps && `${item.reps} تكرار`}
            {item.weight && ` × ${item.weight}`}
            {item.distance && `${item.distance}`}
            {item.time && `${item.time}`}
          </div>

          {/* Levels toggle */}
          {hasLevels && (
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${showLevels ? 'bg-purple-600 text-white' : 'bg-gray-700 text-purple-400 hover:bg-purple-800'}`}
              title="عرض المستويات"
            >
              {showLevels ? '×' : '⚡'}
            </button>
          )}

          {/* GIF toggle */}
          {ex && (
            <button
              onClick={() => setShowGif(!showGif)}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-sm transition-colors"
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
              className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 flex items-center justify-center text-sm transition-colors"
              title="شرح يوتيوب"
            >
              ▶
            </a>
          )}
        </div>
      </div>

      {/* GIF section */}
      {showGif && ex?.gif && (
        <div className="border-t border-gray-700">
          <div className="relative bg-gray-900 flex items-center justify-center" style={{ minHeight: 200 }}>
            <img
              src={ex.gif}
              alt={ex.nameAr}
              className="max-h-64 w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="p-2 flex gap-2">
            <a
              href={ex.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs py-2 rounded-lg transition-colors font-semibold"
            >
              <span>▶</span>
              <span>شرح مفصل على يوتيوب</span>
            </a>
            <button
              onClick={() => setShowGif(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {item.notes && (
        <div className="px-3 pb-3 text-xs text-yellow-400 bg-yellow-900/20 mx-3 mb-3 rounded-lg py-2">
          💡 {item.notes}
        </div>
      )}

      {/* Levels section */}
      {hasLevels && showLevels && (
        <div className="border-t border-gray-700 px-3 py-3">
          {/* Level tabs */}
          <div className="flex gap-1.5 mb-3">
            {LEVEL_TABS.map(t => {
              const levelData = item.levels?.[t.key];
              if (!levelData) return null;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveLevel(t.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${t.color} ${activeLevel === t.key ? `ring-2 ${t.activeRing} opacity-100` : 'opacity-50 hover:opacity-75'}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Active level details */}
          {item.levels?.[activeLevel] && (() => {
            const lv = item.levels![activeLevel]!;
            return (
              <div className="bg-gray-900 rounded-xl p-3 space-y-2 text-right">
                <div className="flex gap-2 flex-wrap justify-end">
                  {lv.weight && (
                    <span className="bg-gray-800 text-orange-300 text-xs px-2.5 py-1 rounded-lg font-mono">
                      ⚖️ {lv.weight}
                    </span>
                  )}
                  {lv.reps && (
                    <span className="bg-gray-800 text-blue-300 text-xs px-2.5 py-1 rounded-lg font-mono">
                      🔁 {lv.reps}
                    </span>
                  )}
                </div>
                {(lv.cue || lv.scaling) && (
                  <p className="text-xs text-gray-300 leading-relaxed">
                    💬 {lv.cue || lv.scaling}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
