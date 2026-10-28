import React from 'react';
import { useGame } from '../context/GameContext';

export const TechCrisisModal: React.FC = () => {
  const { activeTechCrisis, resolveTechCrisis, cash } = useGame();

  if (!activeTechCrisis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-amber-600 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
            <span>⚠️</span>
            <span>Theatrical Emergency</span>
          </div>
          <h3 className="font-display text-xl font-black text-stone-100">
            {activeTechCrisis.title}
          </h3>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/80 p-3 rounded-lg border border-stone-800">
          {activeTechCrisis.description}
        </p>

        {/* Choice Buttons */}
        <div className="space-y-3 pt-2">
          {/* Option A */}
          <div
            onClick={() => resolveTechCrisis('A')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col gap-1 ${
              cash >= activeTechCrisis.optionA.cost
                ? 'bg-stone-900 border-amber-700/60 hover:border-amber-500 hover:bg-stone-800'
                : 'bg-stone-900/40 border-stone-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-100 text-xs">
                {activeTechCrisis.optionA.label}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                ${activeTechCrisis.optionA.cost}
              </span>
            </div>
            <span className="text-[11px] text-stone-400">
              {activeTechCrisis.optionA.effectDescription}
            </span>
          </div>

          {/* Option B */}
          <div
            onClick={() => resolveTechCrisis('B')}
            className="p-3.5 rounded-lg border bg-stone-900 border-red-800/60 hover:border-red-500 hover:bg-stone-800 cursor-pointer transition-all flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-100 text-xs">
                {activeTechCrisis.optionB.label}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                ${activeTechCrisis.optionB.cost} (Free)
              </span>
            </div>
            <span className="text-[11px] text-stone-400">
              {activeTechCrisis.optionB.effectDescription}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
