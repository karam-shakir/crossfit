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

interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
  exercise?: Exercise;
}

export default function ExerciseCard({ item, index }: { item: WodExercise; index: number }) {
  const [showGif, setShowGif] = useState(false);
  const ex = item.exercise;

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
    </div>
  );
}
