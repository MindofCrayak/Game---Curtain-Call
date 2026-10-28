import React from 'react';
import { useGame } from '../context/GameContext';
import { FIXTURES_CATALOG } from '../data/fixtures';
import { HeatmapMode } from '../types/theater';
import { sound } from '../utils/audio';

export const FacilityBuildView: React.FC = () => {
  const {
    cash,
    tiles,
    heatmapMode,
    setHeatmapMode,
    selectedTile,
    buildFixtureId,
    setBuildFixtureId,
    placeFixture,
    removeFixture,
    setActiveTab,
    totalSeats
  } = useGame();

  const handleSelectBuildFixture = (id: string) => {
    sound.playClick();
    if (buildFixtureId === id) {
      setBuildFixtureId(null);
    } else {
      setBuildFixtureId(id);
      setActiveTab('STAGE'); // Automatically switch to stage for placement!
    }
  };

  const getFixtureOnSelected = () => {
    if (!selectedTile || !selectedTile.fixtureId) return null;
    return FIXTURES_CATALOG.find((f) => f.id === selectedTile.fixtureId);
  };

  const selectedFixture = getFixtureOnSelected();

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
              Spatial Engineering & Facility Catalog
            </span>
            <h2 className="font-display text-2xl font-black text-stone-100">
              Fixtures, Seating & Environmental State
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Select fixtures to purchase and place on the stage grid, or inspect thermal and acoustic layers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-lg p-1">
            <span className="text-[11px] text-stone-400 px-2 font-mono">Heatmap Mode:</span>
            {(['STANDARD', 'THERMAL', 'ACOUSTIC', 'SANITATION', 'AESTHETIC'] as HeatmapMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sound.playClick();
                  setHeatmapMode(mode);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  heatmapMode === mode
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {mode === 'STANDARD'
                  ? 'Standard'
                  : mode === 'THERMAL'
                  ? '🌡️ Thermal'
                  : mode === 'ACOUSTIC'
                  ? '🔊 Acoustic'
                  : mode === 'SANITATION'
                  ? '🧹 Cleanliness'
                  : '✨ Aesthetic'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tile Inspector Panel */}
        {selectedTile && (
          <div className="bg-stone-950 border border-sky-800/80 rounded-lg p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold text-sm">
                  Inspector: Tile ({selectedTile.x}, {selectedTile.y})
                </span>
                <span className="text-xs bg-stone-900 px-2 py-0.5 rounded text-stone-300 font-mono">
                  {selectedTile.roomType.replace('_', ' ')}
                </span>
              </div>

              {selectedFixture && (
                <button
                  onClick={() => removeFixture(selectedTile)}
                  className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/60 text-xs font-semibold cursor-pointer"
                >
                  Remove {selectedFixture.name}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-stone-900 p-2 rounded">
                <span className="text-stone-500 block text-[10px]">TEMPERATURE</span>
                <span
                  className={`font-bold ${
                    selectedTile.temp < 66 || selectedTile.temp > 76 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedTile.temp.toFixed(1)}°F (Ideal: 68-72°)
                </span>
              </div>
              <div className="bg-stone-900 p-2 rounded">
                <span className="text-stone-500 block text-[10px]">ACOUSTIC BLEED</span>
                <span
                  className={`font-bold ${
                    selectedTile.noiseDb > 52 ? 'text-red-400' : 'text-stone-300'
                  }`}
                >
                  {selectedTile.noiseDb} dB (Baseline: &lt;45)
                </span>
              </div>
              <div className="bg-stone-900 p-2 rounded">
                <span className="text-stone-500 block text-[10px]">SURFACE DIRT</span>
                <span className="font-bold text-stone-300">
                  {Math.round(selectedTile.dirt * 100)}% debris
                </span>
              </div>
              <div className="bg-stone-900 p-2 rounded">
                <span className="text-stone-500 block text-[10px]">AESTHETIC AURA</span>
                <span className="font-bold text-amber-400">
                  +{selectedTile.aesthetic} pts
                </span>
              </div>
            </div>

            {selectedFixture && (
              <div className="text-xs text-stone-300 pt-1 border-t border-stone-800 flex items-center justify-between">
                <span>
                  Fixture: <strong>{selectedFixture.name}</strong> ({selectedFixture.mechanicalBuff})
                </span>
                <span className="text-stone-500 font-mono">Upkeep: ${selectedFixture.weeklyUpkeep}/wk</span>
              </div>
            )}
          </div>
        )}

        {/* Build Catalog Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-200 text-sm">
              Fixture & Equipment Catalog
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              Current Auditorium Capacity: <strong className="text-stone-300">{totalSeats} seats</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FIXTURES_CATALOG.map((fix) => {
              const isSelected = buildFixtureId === fix.id;
              const canAfford = cash >= fix.cost;

              return (
                <div
                  key={fix.id}
                  onClick={() => handleSelectBuildFixture(fix.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                      : canAfford
                      ? 'bg-stone-950 border-stone-800 hover:border-stone-700'
                      : 'bg-stone-950/50 border-stone-900 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{fix.spriteSymbol}</span>
                        <div>
                          <h4 className="font-bold text-stone-200 text-xs">{fix.name}</h4>
                          <span className="text-[10px] text-stone-500 uppercase font-mono block">
                            {fix.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        ${fix.cost}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-snug">{fix.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-medium">{fix.mechanicalBuff}</span>
                    <button
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {isSelected ? 'Ready to Place' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
