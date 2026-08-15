'use client';
import ExerciseCard from './ExerciseCard';

interface WodExercise {
  exerciseId: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  notes?: string;
  executionNote?: string;
  exercise?: any;
  levels?: any;
}

interface WodBlock {
  format?: string;
  scoreType?: string;
  movements: WodExercise[];
}

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// يعرض أقسام الـ WOD الجديدة (مصفوفة بلوكات) — كل بلوك بعنوان صيغته (AMRAP x 6 MIN، EVERY 2:30...)
// ثم حركاته كبطاقات ExerciseCard. يُستخدم في كل مكان يعرض WOD بدل تكرار نفس منطق العرض 3 مرات.
export default function WodBlockList({ blocks, selectedLevel }: { blocks: WodBlock[]; selectedLevel?: LevelKey }) {
  if (!blocks || blocks.length === 0) return null;
  let globalIndex = 0;

  return (
    <div className="space-y-4">
      {blocks.map((block, bi) => (
        <div key={bi}>
          {(block.format || block.scoreType) && (
            <div className="flex items-center justify-between mb-2 px-0.5">
              {block.format && (
                <span className="text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1 font-mono">
                  {block.format}
                </span>
              )}
              {block.scoreType && (
                <span className="text-xs text-slate-500">النتيجة: {block.scoreType}</span>
              )}
            </div>
          )}
          <div className="space-y-2">
            {block.movements.map((m) => {
              const idx = globalIndex++;
              return <ExerciseCard key={`${bi}-${idx}`} item={m} index={idx} selectedLevel={selectedLevel} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
