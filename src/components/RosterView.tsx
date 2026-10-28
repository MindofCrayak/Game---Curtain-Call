import React from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

export const RosterView: React.FC = () => {
  const { staff, cast, acumen, trainStaffWithAcumen, assignCastMember } = useGame();

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="border-b border-stone-800 pb-4">
          <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
            Company Personnel
          </span>
          <h2 className="font-display text-2xl font-black text-stone-100">
            Technical Staff & Volunteer Cast Roster
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Train permanent technical staff using accumulated Acumen (💡) and cast volunteer actors by talent and memorization.
          </p>
        </div>

        {/* Technical Staff Career Trees */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
              <span>🛠️</span>
              <span>Permanent Technical Staff</span>
            </h3>
            <span className="text-xs text-amber-400 font-mono">
              Available Acumen: <strong>{acumen} 💡</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((s) => {
              const canTrain = acumen >= s.acumenTrainingCost;
              return (
                <div
                  key={s.id}
                  className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-stone-100 text-sm">{s.name}</h4>
                        <span className="text-[11px] text-amber-500 font-mono">{s.title}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-300">
                        Lv. {s.skillLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-snug">{s.description}</p>
                    <div className="text-[10px] text-stone-500 font-mono pt-1">
                      Spec: <span className="text-stone-300">{s.specialization}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 text-[11px]">Salary: ${s.weeklySalary}/wk</span>
                    <button
                      onClick={() => trainStaffWithAcumen(s.id)}
                      disabled={!canTrain}
                      className={`px-3 py-1.5 rounded font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                        canTrain
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Train</span>
                      <span className="opacity-80">({s.acumenTrainingCost} 💡)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteer Cast Roster */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
              <span>🎭</span>
              <span>Volunteer Community Performers</span>
            </h3>
            <span className="text-xs text-stone-500">
              High Memorization reduces stage flub markers; High Chemistry produces double point bursts.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cast.map((actor) => (
              <div
                key={actor.id}
                className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Color avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: actor.clothingColor }}
                    >
                      {actor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-200 text-sm">{actor.name}</h4>
                      <p className="text-[11px] text-stone-400 line-clamp-1">{actor.bio}</p>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <select
                    value={actor.assignedRole}
                    onChange={(e) =>
                      assignCastMember(
                        actor.id,
                        e.target.value as 'LEAD' | 'SUPPORTING' | 'ENSEMBLE' | 'UNASSIGNED'
                      )
                    }
                    className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs font-semibold text-stone-200 cursor-pointer"
                  >
                    <option value="UNASSIGNED">Unassigned</option>
                    <option value="LEAD">Lead Performer</option>
                    <option value="SUPPORTING">Supporting</option>
                    <option value="ENSEMBLE">Ensemble</option>
                  </select>
                </div>

                {/* Actor Attributes */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-stone-800/80">
                  <div className="bg-stone-900 p-1.5 rounded">
                    <span className="text-[10px] text-stone-500 block">TALENT</span>
                    <span className="font-bold text-sky-400">{actor.talent}</span>
                  </div>
                  <div className="bg-stone-900 p-1.5 rounded">
                    <span className="text-[10px] text-stone-500 block">MEMORIZATION</span>
                    <span
                      className={`font-bold ${
                        actor.memorization < 50 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {actor.memorization}
                    </span>
                  </div>
                  <div className="bg-stone-900 p-1.5 rounded">
                    <span className="text-[10px] text-stone-500 block">CHEMISTRY</span>
                    <span className="font-bold text-purple-400">{actor.chemistry}</span>
                  </div>
                  <div className="bg-stone-900 p-1.5 rounded">
                    <span className="text-[10px] text-stone-500 block">ABSENCE RISK</span>
                    <span className="font-bold text-amber-400">
                      {Math.round(actor.conflictRisk * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
