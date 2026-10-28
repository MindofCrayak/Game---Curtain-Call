import React from 'react';
import { BuildingAuditResult } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Award, FileText } from 'lucide-react';
import { sound } from '../utils/audio';

interface CivicInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: BuildingAuditResult | null;
  onClaimGrant?: () => void;
  hasClaimedGrant?: boolean;
}

export const CivicInspectorModal: React.FC<CivicInspectorModalProps> = ({
  isOpen,
  onClose,
  auditResult,
  onClaimGrant,
  hasClaimedGrant = false,
}) => {
  if (!isOpen || !auditResult) return null;

  const checks = [
    {
      title: 'Stage Platform Anchor',
      passed: auditResult.stageValid,
      detail: auditResult.stageValid
        ? 'Platform anchored with south-facing proscenium line.'
        : 'Stage Platform missing. Place a Black Box, Main Stage, or Grand Stage platform.',
    },
    {
      title: 'Stage Left & Right Wings',
      passed: auditResult.wingsValid,
      detail: auditResult.wingsValid
        ? 'Both lateral wings zoned at least 2 tiles wide for offstage traffic.'
        : 'Stage wings must flank the deck (minimum 2 tiles wide on each side).',
    },
    {
      title: 'Auditorium Proscenium Geometry',
      passed: auditResult.houseValid,
      detail: auditResult.houseValid
        ? 'The House width matches or exceeds stage width and aligns to curtain line.'
        : 'The House must be at least as wide as the stage and touch the proscenium.',
    },
    {
      title: `Audience Seating (${auditResult.seatingCapacity} / 10 seats)`,
      passed: auditResult.seatingCapacity >= 10,
      detail:
        auditResult.seatingCapacity >= 10
          ? `Sufficient ticket-yielding audience capacity (${auditResult.seatingCapacity} seats).`
          : `Minimum 10 audience seats required for ticket licensing. Current: ${auditResult.seatingCapacity}.`,
    },
    {
      title: 'Front of House Lobby & Box Office',
      passed: auditResult.lobbyValid,
      detail: auditResult.lobbyValid
        ? 'Lobby encloses exterior street doors and routes public to House.'
        : 'Zoned Lobby room required to buffer street access from auditorium.',
    },
    {
      title: 'Scene Shop & Load-In Door',
      passed: auditResult.shopDoorValid,
      detail: auditResult.shopDoorValid
        ? 'Scene Shop connects to deck via load-in door (Standard, Double, or Roll-up).'
        : 'Scene Shop must connect to stage or wings via a specialized Shop Door.',
    },
    {
      title: 'Municipal Restroom Code',
      passed: auditResult.restroomValid,
      detail: auditResult.restroomValid
        ? 'Sanitary facility verified with working plumbing fixtures.'
        : 'Municipal building code requires at least one working Restroom.',
    },
    {
      title: auditResult.isMakeshiftDressing ? 'Actor Green Room (Makeshift Dressing)' : 'Dedicated Actor Dressing Facility',
      passed: auditResult.hasDressingFacility,
      detail: auditResult.hasDressingFacility
        ? auditResult.isMakeshiftDressing
          ? 'Using Green Room with garment racks. High-ego actors may suffer minor morale decay.'
          : 'Dedicated dressing room with private vanities verified.'
        : 'Actors require a dressing room or green room with rolling garment racks.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-stone-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-left text-stone-100 max-h-[90vh] overflow-y-auto">
        {/* Inspection Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl text-stone-950 font-black ${
                auditResult.passed ? 'bg-emerald-400' : 'bg-rose-500 text-white'
              }`}
            >
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                DEPARTMENT OF BUILDINGS & SAFETY
              </div>
              <h2 className="text-xl font-black text-stone-100 font-serif">
                Civic Playhouse Certificate of Occupancy
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Verdict Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            auditResult.passed
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/80 text-rose-200'
          }`}
        >
          <div>
            <div className="text-xs uppercase font-mono font-bold tracking-wider">
              {auditResult.passed ? '★ OCCUPANCY PERMIT GRANTED ★' : '⚠️ CIVIC CITATION ISSUED'}
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {auditResult.passed
                ? 'Your venue satisfies all 8 architectural and municipal fire codes. The season may officially begin!'
                : `${auditResult.criticalErrors.length} building safety violations must be corrected before season launch.`}
            </p>
          </div>
          <div
            className={`text-lg font-black font-mono px-3 py-1 rounded border ${
              auditResult.passed
                ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                : 'bg-rose-900 border-rose-400 text-rose-200'
            }`}
          >
            {auditResult.passed ? 'PASSED' : 'FAILED'}
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="flex flex-col gap-2 bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 max-h-64 overflow-y-auto">
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Inspector Checklist (8 Code Requirements)</span>
            <span className="font-mono text-stone-400 text-[10px]">
              {checks.filter((c) => c.passed).length} / 8 Complete
            </span>
          </div>

          {checks.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 ${
                item.passed
                  ? 'bg-stone-900/60 border-stone-800 text-stone-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span className={item.passed ? 'text-stone-200' : 'text-rose-200'}>{item.title}</span>
                  <span className="text-[10px] font-mono">{item.passed ? 'OK' : 'VIOLATION'}</span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{item.detail}</div>
              </div>
            </div>
          ))}

          {/* Advisory Warnings */}
          {auditResult.advisoryWarnings.length > 0 && (
            <div className="mt-1 pt-2 border-t border-stone-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Advisory Notes:</span>
              {auditResult.advisoryWarnings.map((warn, i) => (
                <div key={i} className="text-[11px] text-amber-200/90 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-800">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Close Report
          </button>

          {auditResult.passed ? (
            <button
              onClick={() => {
                sound.playCueChime();
                if (onClaimGrant && !hasClaimedGrant) {
                  onClaimGrant();
                }
                onClose();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Award className="w-4 h-4 fill-current" />
              <span>{hasClaimedGrant ? 'PERMIT VERIFIED • RESUME SEASON' : 'CLAIM $5,000 GRANT & LAUNCH SEASON!'}</span>
            </button>
          ) : (
            <span className="text-xs text-rose-400 font-mono italic">
              Fix marked violations to pass inspection.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
