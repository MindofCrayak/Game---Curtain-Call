import React, { useEffect } from 'react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        sound.playCueChime();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 flex flex-col justify-between p-8 select-none">
      {/* Background Image with Cinematic Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/curtain_call_marquee_1792019206731.jpg"
          alt="Curtain Call Playhouse Marquee"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-45 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        <div className="absolute inset-0 bg-stone-950/30" />
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>EST. 1928 · MUNICIPAL ARTS DISTRICT</span>
        </div>
        <div className="flex items-center gap-4">
          <span>STOREFRONT UNIT 12B</span>
          <span>·</span>
          <span>TIER 1 PLAYHOUSE</span>
        </div>
      </div>

      {/* Center Hero Lockup */}
      <div className="relative z-10 max-w-2xl space-y-6 my-auto">
        {/* Bespoke Theatrical SVG Lockup */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold tracking-widest uppercase">
            <span>🎭</span>
            <span>Community Theater Management Simulator</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight text-white uppercase drop-shadow-xl">
            Curtain Call
          </h1>
          <p className="text-base sm:text-lg text-stone-300 font-light max-w-xl leading-relaxed">
            From the chaotic drafting of parody scripts to the frantic scramble of Tech Week and midnight set strikes, command every facet of grassroots theatrical production.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-mono text-stone-400">
          <span className="bg-stone-900/80 px-2.5 py-1 rounded border border-stone-800">
            5-Phase Production Pipeline
          </span>
          <span className="bg-stone-900/80 px-2.5 py-1 rounded border border-stone-800">
            Spatial Acoustic & Thermal Grid
          </span>
          <span className="bg-stone-900/80 px-2.5 py-1 rounded border border-stone-800">
            Volunteer Cast & Flub Remediation
          </span>
        </div>

        {/* Start Button */}
        <div className="pt-4 flex items-center gap-4">
          <button
            onClick={() => {
              sound.playCueChime();
              onStartGame();
            }}
            className="px-8 py-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-xl hover:shadow-amber-600/30 cursor-pointer flex items-center gap-2"
          >
            <span>Enter Playhouse</span>
            <span>→</span>
          </button>
          <span className="text-xs font-mono text-stone-500 hidden sm:inline">
            Press [Enter] or [Space]
          </span>
        </div>
      </div>

      {/* Bottom Flat Control Hint */}
      <div className="relative z-10 pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 font-mono gap-2">
        <div>
          <span>WASD / Drag Pan · Space / Pause · Click to Clear Stage Flubs · [1-4] Hotkeys</span>
        </div>
        <div className="text-stone-600">
          Curtain Call v1.0 · A Non-Profit Arts Simulation
        </div>
      </div>
    </div>
  );
};
