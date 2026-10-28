import React from 'react';
import { useGame } from '../context/GameContext';
import { FIXTURES_CATALOG } from '../data/fixtures';

export const BoardFinancesView: React.FC = () => {
  const {
    cash,
    calendar,
    boardMembers,
    boardApprovalAvg,
    staff,
    tiles,
    production,
    productionHistory
  } = useGame();

  // Weekly Overhead calculations
  const weeklyPayroll = staff.reduce((sum, s) => sum + s.weeklySalary, 0);
  const weeklyUtilities = 85;
  const weeklyUpkeep = tiles.reduce((sum, t) => {
    if (!t.fixtureId) return sum;
    const fix = FIXTURES_CATALOG.find((f) => f.id === t.fixtureId);
    return sum + (fix?.weeklyUpkeep || 0);
  }, 0);
  const totalWeeklyOverhead = weeklyPayroll + weeklyUtilities + weeklyUpkeep;

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-900/60 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="border-b border-stone-800 pb-4">
          <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
            Governance & Financial Solvency
          </span>
          <h2 className="font-display text-2xl font-black text-stone-100">
            Board of Directors & Financial Ledger
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Manage relationships with local civic trustees and maintain liquidity across pre-production and dark weeks.
          </p>
        </div>

        {/* Board of Directors Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
              <span>🏛️</span>
              <span>Non-Profit Board of Directors</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              Composite Board Approval: {boardApprovalAvg}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boardMembers.map((member) => (
              <div
                key={member.id}
                className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-stone-200 text-sm">{member.name}</h4>
                      <span className="text-[10px] text-stone-500 uppercase font-mono block">
                        {member.role}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        member.approvalRating >= 75 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {member.approvalRating}%
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">{member.agendaDescription}</p>
                </div>

                <div className="pt-2 border-t border-stone-800/80 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Favored Genre:</span>
                    <span className="text-amber-400 font-bold">{member.preferredGenre}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Annual Gift:</span>
                    <span className="text-emerald-400 font-bold">${member.annualEndowment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Cash Flow & Overhead Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
          {/* Weekly Overhead */}
          <div className="bg-stone-950 border border-stone-800 rounded-lg p-5 space-y-3">
            <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
              <span>📉</span>
              <span>Weekly Fixed Operating Overhead</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Staff Payroll ({staff.length} employees)</span>
                <span className="text-red-400">-${weeklyPayroll}/wk</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Building Lease & Utilities</span>
                <span className="text-red-400">-${weeklyUtilities}/wk</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Fixtures & Climate Upkeep</span>
                <span className="text-red-400">-${weeklyUpkeep}/wk</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold border-t border-stone-800">
                <span className="text-stone-200">Total Fixed Burn</span>
                <span className="text-red-400">-${totalWeeklyOverhead}/wk</span>
              </div>
            </div>
          </div>

          {/* Revenue & Solvency */}
          <div className="bg-stone-950 border border-stone-800 rounded-lg p-5 space-y-3">
            <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
              <span>📈</span>
              <span>Liquid Assets & Grant Equity</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Current Liquid Cash Reserves</span>
                <span className="text-emerald-400 font-bold">
                  ${cash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Current Season Box Office Take</span>
                <span className="text-stone-300">
                  ${production?.totalBoxOfficeGross.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-900 text-stone-300">
                <span>Concession Net Margin</span>
                <span className="text-amber-400">
                  +${production?.totalConcessionGross.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-xs text-stone-400 border-t border-stone-800">
                <span>Annual Municipal Grant (Month 12)</span>
                <span className="text-emerald-400 font-bold">~$3,800 forecast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Production Ledger */}
        {productionHistory.length > 0 && (
          <div className="bg-stone-950 border border-stone-800 rounded-lg p-5 space-y-3">
            <h3 className="font-bold text-stone-200 text-sm">Archived Seasons Production History</h3>
            <div className="divide-y divide-stone-800 text-xs font-mono">
              {productionHistory.map((h, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-stone-300">
                  <div>
                    <strong className="text-stone-100">{h.scriptTitle}</strong>
                    <span className="text-stone-500 text-[11px] ml-2">Season Year {h.seasonYear}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-400">Score: {h.finalScore}/40</span>
                    <span className="text-emerald-400 font-bold">Gross: ${h.gross.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
