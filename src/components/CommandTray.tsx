import React from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

interface NavTab {
  id: 'STAGE' | 'PRODUCE' | 'FACILITY' | 'ROSTER' | 'FINANCES';
  label: string;
  icon: string;
  badge?: string | null;
}

export const CommandTray: React.FC = () => {
  const { activeTab, setActiveTab, production, phase } = useGame();

  const tabs: NavTab[] = [
    { id: 'STAGE', label: 'Playhouse Stage', icon: '🏛️' },
    { id: 'PRODUCE', label: 'Production', icon: '📜', badge: phase === 'TECH_WEEK' ? 'HELL WEEK' : null },
    { id: 'FACILITY', label: 'Facility & Build', icon: '🔨' },
    { id: 'ROSTER', label: 'Personnel & Cast', icon: '👥' },
    { id: 'FINANCES', label: 'Board & Ledger', icon: '📊' }
  ];

  return (
    <nav className="h-14 bg-stone-900 border-t border-stone-800 px-4 flex items-center justify-between gap-2 shrink-0 z-20 select-none">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] bg-red-600 text-white font-mono px-1 rounded animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Production Phase Quick Indicator */}
      {production && (
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="text-stone-500">Active:</span>
          <span className="text-amber-400 font-bold truncate max-w-[180px]">
            {production.script.title}
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-emerald-400 font-bold">
            ${production.totalBoxOfficeGross.toLocaleString()} Gross
          </span>
        </div>
      )}
    </nav>
  );
};
