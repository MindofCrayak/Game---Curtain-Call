import React, { useState } from 'react';
import { TheaterBrandConfig, CivicLogoId, CIVIC_PALETTE } from '../types';
import { Sparkles, Dices, Check, Shield, HelpCircle, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

interface ChairmanOnboardingModalProps {
  isOpen: boolean;
  onConfirm: (config: TheaterBrandConfig) => void;
  defaultName?: string;
}

const THEATER_NAME_SUGGESTIONS = [
  'Oakwood Civic Playhouse',
  'Starlight Community Theater',
  'Maple Valley Players',
  'Apollo Repertory Stage',
  'Curtain Call Civic Stage',
  'Orpheum Guild Theater',
  'Riverside Civic Playhouse',
  'Beacon Hill Dramatics',
];

export const CivicLogoIcon: React.FC<{ logoId: CivicLogoId; className?: string }> = ({
  logoId,
  className = 'w-8 h-8',
}) => {
  switch (logoId) {
    case 'MASKS':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Tragedy Mask */}
          <path d="M12 10C7.5 10 5 15 5 21C5 28 9 32 15 32C17.5 32 19.5 31 21 29.5" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 10C7.5 10 5 15 5 21C5 28 9 32 15 32C17.5 32 19.5 31 21 29.5" />
          <circle cx="10" cy="19" r="1.5" fill="currentColor" />
          <circle cx="16" cy="19" r="1.5" fill="currentColor" />
          <path d="M10 26C11.5 24 14.5 24 16 26" />
          {/* Comedy Mask */}
          <path d="M36 12C40.5 12 43 17 43 23C43 30 39 34 33 34C27 34 24 29 24 23C24 17 27 12 33 12C34.5 12 35.5 12 36 12Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M36 12C40.5 12 43 17 43 23C43 30 39 34 33 34C27 34 24 29 24 23C24 17 27 12 33 12C34.5 12 35.5 12 36 12Z" />
          <circle cx="30" cy="20" r="1.5" fill="currentColor" />
          <circle cx="37" cy="20" r="1.5" fill="currentColor" />
          <path d="M30 26C31.5 28.5 35.5 28.5 37 26" />
        </svg>
      );
    case 'SPOTLIGHT':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Vintage lamp body */}
          <path d="M14 16L24 10L34 16L30 26H18L14 16Z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="24" cy="18" r="4" fill="currentColor" />
          {/* Pivot bracket & yoke */}
          <path d="M18 10C18 6 30 6 30 10" />
          <line x1="24" y1="4" x2="24" y2="7" />
          {/* Radiant conic light beam */}
          <path d="M18 26L6 44H42L30 26" strokeDasharray="3 3" opacity="0.6" />
          <polygon points="18,26 6,44 42,44 30,26" fill="currentColor" fillOpacity="0.15" />
          <circle cx="24" cy="38" r="3" fill="#fef08a" />
        </svg>
      );
    case 'LYRE':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Classical Lyre Frame */}
          <path d="M14 12C12 20 12 32 24 38C36 32 36 20 34 12" fill="currentColor" fillOpacity="0.2" />
          <path d="M14 12C12 20 12 32 24 38C36 32 36 20 34 12" />
          <line x1="12" y1="12" x2="36" y2="12" />
          {/* Strings */}
          <line x1="20" y1="12" x2="20" y2="34" />
          <line x1="24" y1="12" x2="24" y2="36" />
          <line x1="28" y1="12" x2="28" y2="34" />
          {/* Base pedestal */}
          <path d="M20 38H28V43H20V38Z" fill="currentColor" />
          <line x1="16" y1="43" x2="32" y2="43" />
        </svg>
      );
    case 'PROSCENIUM':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Proscenium Framed Arch */}
          <rect x="8" y="10" width="32" height="30" rx="3" stroke="currentColor" />
          <path d="M14 40V24C14 18 19 14 24 14C29 14 34 18 34 24V40" fill="currentColor" fillOpacity="0.15" />
          <path d="M14 20C18 20 22 17 24 14C26 17 30 20 34 20" />
          {/* Draped Curtains */}
          <path d="M14 20C17 26 18 34 18 40" strokeDasharray="2 2" />
          <path d="M34 20C31 26 30 34 30 40" strokeDasharray="2 2" />
          {/* Keystone / Star */}
          <circle cx="24" cy="14" r="2" fill="currentColor" />
        </svg>
      );
    case 'MONOGRAM':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Ornate Monogram Crest Shield */}
          <path d="M24 6L38 12V24C38 34 24 42 24 42C24 42 10 34 10 24V12L24 6Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M24 6L38 12V24C38 34 24 42 24 42C24 42 10 34 10 24V12L24 6Z" />
          {/* Serif Initials Symbol */}
          <path d="M19 18H29M24 18V32M20 32H28" strokeWidth="3" />
        </svg>
      );
  }
};

export const ChairmanOnboardingModal: React.FC<ChairmanOnboardingModalProps> = ({
  isOpen,
  onConfirm,
  defaultName = 'Curtain Call Playhouse',
}) => {
  const [theaterName, setTheaterName] = useState(defaultName);
  const [selectedLogo, setSelectedLogo] = useState<CivicLogoId>('MASKS');
  const [selectedColor, setSelectedColor] = useState<string>('#881337'); // Burgundy
  const [skipTutorial, setSkipTutorial] = useState(false);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    sound.playClick();
    const filtered = THEATER_NAME_SUGGESTIONS.filter((n) => n !== theaterName);
    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    setTheaterName(chosen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCueChime();
    onConfirm({
      theaterName: theaterName.trim() || 'Civic Playhouse',
      logoId: selectedLogo,
      primaryColor: selectedColor,
      skipTutorial,
      funds: 5000,
    });
  };

  const logos: { id: CivicLogoId; label: string; desc: string }[] = [
    { id: 'MASKS', label: 'Classic Masks', desc: 'Thalia & Melpomene emblems of theatrical drama.' },
    { id: 'SPOTLIGHT', label: 'Vintage Beam', desc: 'Iconic stage lamp with focused radiant warm beam.' },
    { id: 'LYRE', label: 'Orpheum Lyre', desc: 'Classical Greek muse harp for prestigious revues.' },
    { id: 'PROSCENIUM', label: 'Proscenium Arch', desc: 'Framed grand architectural arch with valance.' },
    { id: 'MONOGRAM', label: 'Civic Crest', desc: 'Art deco heraldic shield with typeface monogram.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-925 to-stone-950 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-left text-stone-100 max-h-[92vh] overflow-y-auto">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-amber-400/50"
              style={{ backgroundColor: selectedColor }}
            >
              <CivicLogoIcon logoId={selectedLogo} className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Board of Trustees • Chairman Induction</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-tight">
                Establish Your Playhouse Identity
              </h2>
            </div>
          </div>
          <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded-full font-mono font-bold">
            Unit 12B Lot
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* STEP 1: THEATER NAME */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center justify-between">
              <span>1. Playhouse Name</span>
              <span className="text-[10px] text-stone-400 font-normal">Appears on exterior marquee & critic reviews</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={36}
                value={theaterName}
                onChange={(e) => setTheaterName(e.target.value)}
                placeholder="e.g. Starlight Civic Theater"
                className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-stone-100 outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={handleRandomizeName}
                title="Randomize Playhouse Name"
                className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-amber-300 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span className="hidden sm:inline">Random</span>
              </button>
            </div>
          </div>

          {/* STEP 2: CIVIC LOGO */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              2. Civic Logo Emblem
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {logos.map((logo) => {
                const isSelected = selectedLogo === logo.id;
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedLogo(logo.id);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/80 shadow-lg text-amber-200'
                        : 'bg-stone-900/80 hover:bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <CivicLogoIcon logoId={logo.id} className="w-8 h-8" />
                    <span className="text-[11px] font-bold leading-tight">{logo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: BRAND COLOR PALETTE */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                3. Primary Brand Palette
              </label>
              <span className="text-[11px] text-stone-400">
                Dyes stage proscenium curtain, FOH carpets & playbills
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CIVIC_PALETTE.map((swatch) => {
                const isSelected = selectedColor === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedColor(swatch.hex);
                    }}
                    title={`${swatch.name} (${swatch.hex})`}
                    className={`group relative h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-white scale-105 border-white shadow-xl'
                        : 'border-stone-800 hover:border-stone-600 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white drop-shadow" />}
                    <span className="absolute -bottom-5 text-[9px] font-semibold text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {swatch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REAL-TIME BRAND PREVIEW CARD */}
          <div
            className="mt-2 p-3.5 rounded-xl border flex items-center justify-between shadow-inner"
            style={{ backgroundColor: `${selectedColor}22`, borderColor: `${selectedColor}66` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg border"
                style={{ backgroundColor: selectedColor, borderColor: '#f59e0b' }}
              >
                <CivicLogoIcon logoId={selectedLogo} className="w-7 h-7 text-amber-200" />
              </div>
              <div>
                <div className="text-[10px] tracking-widest text-amber-300 font-mono font-bold uppercase">
                  Exterior Marquee & Season Playbill Preview
                </div>
                <div className="text-base font-black text-amber-200 font-serif">
                  {theaterName || 'Civic Playhouse'}
                </div>
                <div className="text-[10px] text-stone-300">
                  Proscenium Velvet: <span className="font-semibold text-amber-300">{selectedColor}</span> • Municipal Grant: <span className="font-mono text-emerald-400 font-bold">$5,000</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/50 px-2.5 py-1 rounded">
              APPROVED BY COUNCIL
            </span>
          </div>

          {/* STEP 4: SKIP TUTORIAL CHECKBOX */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 flex items-start gap-3 hover:border-stone-700 transition-colors">
            <input
              type="checkbox"
              id="skipTutorialCheck"
              checked={skipTutorial}
              onChange={(e) => setSkipTutorial(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700 cursor-pointer accent-amber-500"
            />
            <label htmlFor="skipTutorialCheck" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>Skip Guided Tutorial (Freeform Architect Mode)</span>
                <span className="text-[9px] bg-sky-950 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                  Sandbox Freedom
                </span>
              </span>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                Check this box to bypass the step-by-step room tutorial. You will immediately receive your $5,000 municipal grant and full access to place the stage, auditorium seating, and back-of-house rooms at your own pace without guided constraints.
              </p>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-sm sm:text-base rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>TAKE CHAIRMAN OATH & ENTER THEATER LOT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
