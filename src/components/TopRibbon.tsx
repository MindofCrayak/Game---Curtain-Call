import React from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

export const TopRibbon: React.FC = () => {
  const {
    cash,
    acumen,
    calendar,
    boardApprovalAvg,
    production,
    phase,
    gameSpeed,
    setGameSpeed,
    manualNextWeek,
    isGhostLightLit,
    toggleGhostLight,
    isScottishPlayCursed,
    cleanseScottishPlayCurse,
    triggerScottishPlayCurse,
    totalSeats
  } = useGame();

  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'PRE_PRODUCTION':
        return 'Alpha: Pre-Production';
      case 'REHEARSALS':
        return 'Beta: Cast Rehearsals';
      case 'TECH_WEEK':
        return 'Tech Week ("Hell Week")';
      case 'OPENING_NIGHT':
        return 'Opening Night Reviews';
      case 'THE_RUN':
        return `Weekend Run (Week ${production?.runWeek || 1})`;
      default:
        return 'Season Idle (Proposal)';
    }
  };

  return (
    <header className="h-14 bg-stone-900 border-b border-stone-800 px-4 flex items-center justify-between gap-4 text-xs select-none shrink-0 z-20">
      {/* Brand & Calendar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-black tracking-wider text-amber-500 uppercase">
            Curtain Call
          </span>
          <span className="text-stone-500 font-mono">Storefront 12B</span>
        </div>

        <div className="h-5 w-[1px] bg-stone-800 hidden sm:block" />

        {/* Date Cluster */}
        <div className="flex items-center gap-2 text-stone-300 font-mono tabular-nums">
          <span className="text-stone-400">Y{calendar.seasonYear}</span>
          <span className="text-stone-500">·</span>
          <span>Month {calendar.month}</span>
          <span className="text-stone-500">·</span>
          <span className="text-amber-400 font-bold">Wk {calendar.week}</span>
        </div>
      </div>

      {/* Center Production Pipeline Ticker */}
      <div className="hidden lg:flex items-center gap-3 bg-stone-950/80 border border-stone-800 rounded-md px-3 py-1.5">
        <span className="text-stone-400 uppercase font-semibold tracking-wider text-[10px]">
          {production ? production.script.title : 'Dark Stage'}
        </span>
        <span className="text-stone-600">/</span>
        <span className={`font-medium ${phase === 'TECH_WEEK' ? 'text-red-400 animate-pulse' : 'text-stone-200'}`}>
          {getPhaseLabel()}
        </span>
        {production && (
          <div className="w-20 bg-stone-800 rounded-full h-1.5 overflow-hidden ml-1">
            <div
              className={`h-full transition-all duration-300 ${
                phase === 'TECH_WEEK' ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${production.phaseProgress}%` }}
            />
          </div>
        )}
        {production && production.unresolvedFlubCount > 0 && (
          <span className="text-red-400 font-mono font-bold flex items-center gap-1">
            <span>❌</span> {production.unresolvedFlubCount} flubs
          </span>
        )}
      </div>

      {/* Right Metrics & Controls */}
      <div className="flex items-center gap-4">
        {/* Cash Reserve */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <span className="text-emerald-500 font-bold">$</span>
          <span className={`font-bold text-sm ${cash < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {cash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Acumen Currency */}
        <div
          className="flex items-center gap-1 text-amber-300 font-mono tabular-nums font-semibold"
          title="Acumen (💡): Earned by clearing Tech Week flubs. Used for staff training."
        >
          <span>💡</span>
          <span>{acumen}</span>
        </div>

        {/* Board Approval */}
        <div
          className="hidden md:flex items-center gap-1 text-stone-300 font-mono tabular-nums"
          title="Board of Directors Approval Rating"
        >
          <span className="text-stone-400">Board:</span>
          <span className={boardApprovalAvg >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
            {boardApprovalAvg}%
          </span>
        </div>

        {/* Auditorium Seats */}
        <div
          className="hidden sm:flex items-center gap-1 text-stone-400 font-mono tabular-nums text-[11px]"
          title="Auditorium Seating Capacity"
        >
          <span>🪑 {totalSeats} seats</span>
        </div>

        {/* Curse Alert / Cleansing */}
        {isScottishPlayCursed ? (
          <button
            onClick={cleanseScottishPlayCurse}
            className="px-2 py-1 rounded bg-red-900/80 border border-red-500 text-red-200 text-[11px] font-bold animate-pulse hover:bg-red-800"
            title="Perform spinning ritual outside to cleanse the Scottish curse!"
          >
            Cleanse Curse!
          </button>
        ) : (
          <button
            onClick={triggerScottishPlayCurse}
            className="hidden xl:inline text-stone-600 hover:text-stone-400 text-[10px]"
            title="Curse of the Scottish Play: Mention the forbidden tragedy"
          >
            "Macbeth"
          </button>
        )}

        <div className="h-5 w-[1px] bg-stone-800" />

        {/* Simulation Speed & Step */}
        <div className="flex items-center bg-stone-950 border border-stone-800 rounded p-0.5">
          <button
            onClick={() => setGameSpeed(0)}
            className={`px-2 py-1 rounded font-mono ${gameSpeed === 0 ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            title="Pause Simulation"
          >
            ❚❚
          </button>
          <button
            onClick={() => setGameSpeed(1)}
            className={`px-2 py-1 rounded font-mono ${gameSpeed === 1 ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            title="Normal Speed (1x)"
          >
            ▶
          </button>
          <button
            onClick={() => setGameSpeed(2)}
            className={`px-2 py-1 rounded font-mono ${gameSpeed === 2 ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            title="Fast Speed (2x)"
          >
            ▶▶
          </button>
          <button
            onClick={() => setGameSpeed(5)}
            className={`px-2 py-1 rounded font-mono ${gameSpeed === 5 ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            title="Hyper Speed (5x)"
          >
            ▶▶▶
          </button>
          <button
            onClick={manualNextWeek}
            className="px-2 py-1 rounded text-stone-400 hover:text-white text-[11px] font-medium border-l border-stone-800 ml-1"
            title="Advance 1 Week"
          >
            +1W
          </button>
        </div>

        {/* Audio Mute */}
        <button
          onClick={handleMuteToggle}
          className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
};
