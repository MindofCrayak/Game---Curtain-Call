import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Script, FocusSliders } from '../types/theater';
import { SCRIPTS_CATALOG } from '../data/scripts';
import { sound } from '../utils/audio';

export const ProductionView: React.FC = () => {
  const {
    production,
    phase,
    cash,
    acumen,
    repertoire,
    startNewProductionProposal,
    clearFlub,
    proceedToTheRun,
    closeShowAndStrike,
    remountRepertoireShow,
    cast,
    assignCastMember
  } = useGame();

  // New Proposal Form State
  const [selectedScript, setSelectedScript] = useState<Script>(SCRIPTS_CATALOG[0]);
  const [sliders, setSliders] = useState<FocusSliders>({
    acting: 6,
    scenic: 5,
    costume: 5,
    lighting: 4
  });

  const totalPoints = sliders.acting + sliders.scenic + sliders.costume + sliders.lighting;
  const maxPoints = 20;

  const handleSliderChange = (key: keyof FocusSliders, val: number) => {
    sound.playClick();
    const otherKeys = (['acting', 'scenic', 'costume', 'lighting'] as (keyof FocusSliders)[]).filter(
      (k) => k !== key
    );
    const otherSum = otherKeys.reduce((sum, k) => sum + sliders[k], 0);

    // Clamp so total never exceeds 20
    const clampedVal = Math.min(Math.max(1, val), maxPoints - (otherKeys.length * 1));
    const newTotalWithVal = otherSum + clampedVal;

    if (newTotalWithVal <= maxPoints) {
      setSliders((prev) => ({ ...prev, [key]: clampedVal }));
    } else {
      // Scale down others proportionally
      const diff = newTotalWithVal - maxPoints;
      setSliders((prev) => {
        const next = { ...prev, [key]: clampedVal };
        // reduce first available
        for (const k of otherKeys) {
          if (next[k] > 1) {
            next[k] = Math.max(1, next[k] - diff);
            break;
          }
        }
        return next;
      });
    }
  };

  // 1. OPENING NIGHT VIEW
  if (phase === 'OPENING_NIGHT' && production && production.reviews) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2 border-b border-stone-800 pb-5">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
              Opening Night Review Ledger
            </span>
            <h2 className="font-display text-3xl font-black text-stone-100">
              "{production.script.title}"
            </h2>
            <div className="flex items-center justify-center gap-3 text-stone-400 text-sm">
              <span>By {production.script.playwright}</span>
              <span>·</span>
              <span className="text-amber-400 font-bold font-mono">
                Aggregate Score: {production.averageScore} / 40
              </span>
            </div>

            {production.inductedIntoRepertoire && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <span>🏆</span>
                <span>INDUCTED INTO COMMUNITY REPERTOIRE (Eligible for Encore Revivals)</span>
              </div>
            )}
          </div>

          {/* 4 Critic Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {production.reviews.map((r, i) => (
              <div
                key={i}
                className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-200 text-sm">{r.criticName}</h4>
                    <span className="text-xs text-stone-500">{r.publication}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {r.totalScore}
                      <span className="text-xs text-stone-500">/40</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 block">ACTING</span>
                    <span className="font-bold text-stone-300">{r.actingScore}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">SCENERY</span>
                    <span className="font-bold text-stone-300">{r.scenicScore}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">COSTUME</span>
                    <span className="font-bold text-stone-300">{r.costumeScore}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">PACING</span>
                    <span className="font-bold text-stone-300">{r.pacingScore}/10</span>
                  </div>
                </div>

                <p className="text-xs italic text-stone-400 pt-2 border-t border-stone-800/60">
                  "{r.quote}"
                </p>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={proceedToTheRun}
              className="px-8 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wide shadow-xl transition-colors cursor-pointer"
            >
              Open Weekend Performances (The Run) →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. THE RUN VIEW
  if (phase === 'THE_RUN' && production) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6">
          <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                Phase 5: The Run & Box Office Ledger
              </span>
              <h2 className="font-display text-2xl font-black text-stone-100">
                "{production.script.title}"
              </h2>
              <span className="text-xs text-stone-400">
                Performance Weekend #{production.runWeek} · Attendance Decay: 12%/week
              </span>
            </div>

            <button
              onClick={() => closeShowAndStrike('SALVAGE')}
              className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs tracking-wide transition-colors cursor-pointer self-start sm:self-auto"
            >
              Issue Closing Strike Notice
            </button>
          </div>

          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">Total Patrons</span>
              <span className="text-2xl font-bold font-mono text-stone-200">
                {production.totalAttendance.toLocaleString()}
              </span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">Box Office Gross</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                ${production.totalBoxOfficeGross.toLocaleString()}
              </span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">Concessions Net</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                ${production.totalConcessionGross.toLocaleString()}
              </span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">Weekend Occupancy</span>
              <span className="text-2xl font-bold font-mono text-sky-400">
                {Math.round(production.weeklyOccupancyRate * 100)}%
              </span>
            </div>
          </div>

          {/* Strike Teardown Options */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-5 space-y-4">
            <h3 className="font-bold text-stone-200 text-sm">Midnight Strike Strategy</h3>
            <p className="text-xs text-stone-400">
              When ticket margins decline below weekly overhead, conclude the production run and select a stage strike method:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => closeShowAndStrike('SALVAGE')}
                className="bg-stone-900 border border-amber-600/50 hover:border-amber-500 rounded-lg p-3 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                  <span>🪵</span>
                  <span>Lumber & Hardware Salvage</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Dismantle flats to recover 2x4s and screws. Gives <strong className="text-amber-300">35% discount</strong> on next production build!
                </p>
              </div>

              <div
                onClick={() => closeShowAndStrike('WARDROBE')}
                className="bg-stone-900 border border-purple-600/50 hover:border-purple-500 rounded-lg p-3 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-purple-400 text-xs">
                  <span>👗</span>
                  <span>Wardrobe Archiving</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Clean, press, and catalog costumes in attic storage. Generates <strong className="text-purple-300">+30 Acumen (💡)</strong>.
                </p>
              </div>

              <div
                onClick={() => closeShowAndStrike('SCRAP')}
                className="bg-stone-900 border border-stone-700 hover:border-stone-600 rounded-lg p-3 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-stone-300 text-xs">
                  <span>🗑️</span>
                  <span>Complete Scrap Dumpster</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Quick dumpster disposal. Costs $75 disposal fee, but clears the stage in 1 night.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. IN-PROGRESS ACTIVE PRODUCTION VIEW (Alpha, Beta, Tech Week)
  if (production) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6">
          {/* Header */}
          <div className="border-b border-stone-800 pb-4">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
              Active Production Pipeline
            </span>
            <h2 className="font-display text-2xl font-black text-stone-100">
              "{production.script.title}"
            </h2>
            <div className="text-xs text-stone-400 mt-1 flex items-center gap-3">
              <span>Setting: {production.script.setting}</span>
              <span>·</span>
              <span className="font-semibold text-amber-400">Phase: {production.phase}</span>
            </div>
          </div>

          {/* 5-Phase Breadcrumb */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-stone-800/80 border border-stone-700 text-stone-300">
              <span className="text-[10px] text-stone-500 block">1. PROPOSAL</span>
              <span className="font-bold text-emerald-400">Completed ✓</span>
            </div>
            <div
              className={`p-2.5 rounded border ${
                production.phase === 'PRE_PRODUCTION'
                  ? 'bg-amber-950 border-amber-600 text-amber-200'
                  : production.phase === 'REHEARSALS' || production.phase === 'TECH_WEEK'
                  ? 'bg-stone-800 border-stone-700 text-stone-300'
                  : 'bg-stone-950 border-stone-800 text-stone-600'
              }`}
            >
              <span className="text-[10px] block opacity-70">2. PRE-PRODUCTION</span>
              <span className="font-bold">
                {production.phase === 'PRE_PRODUCTION' ? `${production.phaseProgress}%` : 'Done ✓'}
              </span>
            </div>
            <div
              className={`p-2.5 rounded border ${
                production.phase === 'REHEARSALS'
                  ? 'bg-sky-950 border-sky-600 text-sky-200'
                  : production.phase === 'TECH_WEEK'
                  ? 'bg-stone-800 border-stone-700 text-stone-300'
                  : 'bg-stone-950 border-stone-800 text-stone-600'
              }`}
            >
              <span className="text-[10px] block opacity-70">3. REHEARSALS</span>
              <span className="font-bold">
                {production.phase === 'REHEARSALS' ? `${production.phaseProgress}%` : production.phase === 'TECH_WEEK' ? 'Done ✓' : 'Upcoming'}
              </span>
            </div>
            <div
              className={`p-2.5 rounded border ${
                production.phase === 'TECH_WEEK'
                  ? 'bg-red-950 border-red-600 text-red-200 animate-pulse'
                  : 'bg-stone-950 border-stone-800 text-stone-600'
              }`}
            >
              <span className="text-[10px] block opacity-70">4. TECH WEEK</span>
              <span className="font-bold">
                {production.phase === 'TECH_WEEK' ? `${production.phaseProgress}%` : 'Upcoming'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-stone-950 border border-stone-800 text-stone-600">
              <span className="text-[10px] block opacity-70">5. OPENING & RUN</span>
              <span className="font-bold">Pending</span>
            </div>
          </div>

          {/* Points Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">🎭 Acting Nuance</span>
              <span className="text-2xl font-bold font-mono text-sky-400">
                {production.points.acting}
              </span>
              <span className="text-[10px] text-stone-500 block">Slider: {production.sliders.acting} pts</span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">🪵 Scenic Splendor</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {production.points.scenery}
              </span>
              <span className="text-[10px] text-stone-500 block">Baseline req: {production.script.baselineScenicReq}</span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">👗 Wardrobe Detail</span>
              <span className="text-2xl font-bold font-mono text-purple-400">
                {production.points.costumes}
              </span>
              <span className="text-[10px] text-stone-500 block">Slider: {production.sliders.costume} pts</span>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase block">💡 Atmospheric Polish</span>
              <span className="text-2xl font-bold font-mono text-yellow-400">
                {production.points.atmosphere}
              </span>
              <span className="text-[10px] text-stone-500 block">Slider: {production.sliders.lighting} pts</span>
            </div>
          </div>

          {/* Active Flubs Section during Tech Week / Rehearsals */}
          {production.flubs.length > 0 && (
            <div className="bg-stone-950 border border-red-900/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">❌ Active Stage Flubs</span>
                  <span className="text-xs text-stone-400 font-mono">
                    ({production.flubs.length} errors remaining)
                  </span>
                </div>
                <span className="text-xs text-stone-500">
                  Each unresolved flub penalizes critic review scores by 1.8 pts!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {production.flubs.map((flub) => (
                  <div
                    key={flub.id}
                    className="flex items-center justify-between bg-stone-900 border border-red-800/40 rounded p-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-200 block">{flub.label}</span>
                      <span className="text-[10px] text-amber-400 font-mono">+{flub.acumenReward} 💡 Acumen</span>
                    </div>
                    <button
                      onClick={() => clearFlub(flub.id)}
                      className="px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. IDLE: NEW PROPOSAL & SCRIPT LICENSING
  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
              Administrative Office
            </span>
            <h2 className="font-display text-2xl font-black text-stone-100">
              License Script & Season Proposal
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Select an authorized script from the licensing agency catalog and allocate 20 Focus Points.
            </p>
          </div>

          {/* Repertoire Revivals count */}
          {repertoire.length > 0 && (
            <div className="text-xs text-amber-400 bg-amber-950/60 border border-amber-700/50 rounded-lg px-3 py-2">
              🏆 {repertoire.length} Community Repertoire Titles Available
            </div>
          )}
        </div>

        {/* Script Selection Carousel / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCRIPTS_CATALOG.map((s) => {
            const isSelected = selectedScript.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedScript(s);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                    {s.genre}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${s.licensingCost}
                  </span>
                </div>

                <h3 className="font-display font-bold text-stone-100 text-base mt-1">
                  {s.title}
                </h3>
                <span className="text-[11px] text-stone-500 block">By {s.playwright}</span>

                <p className="text-xs text-stone-400 mt-2 line-clamp-2">{s.description}</p>

                <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>Royalty: {Math.round(s.royaltyPercent * 100)}%</span>
                  <span>Scenic Min: {s.baselineScenicReq} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Script Detailed Brief & Focus Sliders */}
        <div className="bg-stone-950 border border-stone-800 rounded-lg p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Script Brief & Demographics */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                Selected Property
              </span>
              <h3 className="font-display text-xl font-bold text-stone-100">
                {selectedScript.title}
              </h3>
              <p className="text-xs text-stone-300 mt-1 italic">{selectedScript.synopsis}</p>
            </div>

            {/* Demographics Bar */}
            <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
              <span className="text-[11px] text-stone-400 font-semibold block">
                Target Demographic Appeal:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex justify-between bg-stone-900 p-1.5 rounded">
                  <span className="text-stone-400">Seniors</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(selectedScript.demographicAppeal.seniors * 100)}%
                  </span>
                </div>
                <div className="flex justify-between bg-stone-900 p-1.5 rounded">
                  <span className="text-stone-400">Families</span>
                  <span className="text-sky-400 font-bold">
                    {Math.round(selectedScript.demographicAppeal.families * 100)}%
                  </span>
                </div>
                <div className="flex justify-between bg-stone-900 p-1.5 rounded">
                  <span className="text-stone-400">Young Adults</span>
                  <span className="text-pink-400 font-bold">
                    {Math.round(selectedScript.demographicAppeal.youngAdults * 100)}%
                  </span>
                </div>
                <div className="flex justify-between bg-stone-900 p-1.5 rounded">
                  <span className="text-stone-400">Critics</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(selectedScript.demographicAppeal.critics * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 20-Point Focus Sliders */}
          <div className="space-y-4 bg-stone-900/60 p-4 rounded-lg border border-stone-800/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs uppercase tracking-wider">
                Artistic Focus Allocation
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  totalPoints === maxPoints ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {totalPoints} / {maxPoints} Focus Points
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                  <span>🎭 Acting & Memorization</span>
                  <span className="font-mono font-bold text-sky-400">{sliders.acting} pts</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={sliders.acting}
                  onChange={(e) => handleSliderChange('acting', parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                  <span>🪵 Scenic & Stage Architecture</span>
                  <span className="font-mono font-bold text-amber-400">{sliders.scenic} pts</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={sliders.scenic}
                  onChange={(e) => handleSliderChange('scenic', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                  <span>👗 Costume, Prop & Makeup</span>
                  <span className="font-mono font-bold text-purple-400">{sliders.costume} pts</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={sliders.costume}
                  onChange={(e) => handleSliderChange('costume', parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                  <span>💡 Lighting, Soundscapes & Effects</span>
                  <span className="font-mono font-bold text-yellow-400">{sliders.lighting} pts</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={sliders.lighting}
                  onChange={(e) => handleSliderChange('lighting', parseInt(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                onClick={() => startNewProductionProposal(selectedScript, sliders)}
                disabled={cash < selectedScript.licensingCost}
                className={`w-full py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-lg ${
                  cash >= selectedScript.licensingCost
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                Sign Licensing Contract (${selectedScript.licensingCost}) & Begin Alpha
              </button>
            </div>
          </div>
        </div>

        {/* Repertoire Revivals Section */}
        {repertoire.length > 0 && (
          <div className="bg-stone-950 border border-amber-900/40 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-amber-400 text-sm">
              Community Repertoire (Encore Revivals)
            </h3>
            <p className="text-xs text-stone-400">
              Past critical triumphs eligible to remount with zero script licensing fees:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {repertoire.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-stone-900 border border-stone-800 rounded p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-200 text-xs block">{rep.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">$0 Licensing Rights</span>
                  </div>
                  <button
                    onClick={() => remountRepertoireShow(rep)}
                    className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Remount
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
