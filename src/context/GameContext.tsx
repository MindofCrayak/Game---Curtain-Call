import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActiveProduction,
  BoardMember,
  CastMember,
  CriticReview,
  Fixture,
  FocusSliders,
  HeatmapMode,
  ProductionPhase,
  Script,
  StaffMember,
  StageTile,
  TechCrisis,
  TheaterCalendar
} from '../types/theater';
import { SCRIPTS_CATALOG } from '../data/scripts';
import { FIXTURES_CATALOG } from '../data/fixtures';
import { INITIAL_CAST, INITIAL_STAFF } from '../data/initialStaffAndCast';
import { BOARD_MEMBERS } from '../data/boardMembers';
import { createInitialGrid, GRID_WIDTH, GRID_HEIGHT } from '../data/initialGrid';
import { sound } from '../utils/audio';

interface GameContextType {
  // Financial & Currencies
  cash: number;
  acumen: number;
  calendar: TheaterCalendar;
  boardMembers: BoardMember[];
  boardApprovalAvg: number;
  venueTier: number;

  // Active Production
  production: ActiveProduction | null;
  phase: ProductionPhase;
  repertoire: Script[];
  productionHistory: { scriptTitle: string; finalScore: number; gross: number; seasonYear: number }[];

  // Facility & Grid
  tiles: StageTile[];
  heatmapMode: HeatmapMode;
  setHeatmapMode: (mode: HeatmapMode) => void;
  selectedTile: StageTile | null;
  setSelectedTile: (tile: StageTile | null) => void;
  buildFixtureId: string | null;
  setBuildFixtureId: (id: string | null) => void;
  placeFixture: (tile: StageTile, fixtureId: string) => void;
  removeFixture: (tile: StageTile) => void;

  // Theatrical Lore
  isGhostLightLit: boolean;
  toggleGhostLight: () => void;
  triggerScottishPlayCurse: () => void;
  cleanseScottishPlayCurse: () => void;
  isScottishPlayCursed: boolean;

  // Roster
  staff: StaffMember[];
  cast: CastMember[];
  trainStaffWithAcumen: (staffId: string) => void;
  assignCastMember: (actorId: string, role: 'LEAD' | 'SUPPORTING' | 'ENSEMBLE' | 'UNASSIGNED') => void;

  // Production Pipeline Actions
  startNewProductionProposal: (script: Script, sliders: FocusSliders) => void;
  clearFlub: (flubId: string) => void;
  resolveTechCrisis: (choice: 'A' | 'B') => void;
  activeTechCrisis: TechCrisis | null;
  proceedToTheRun: () => void;
  closeShowAndStrike: (strategy: 'SCRAP' | 'SALVAGE' | 'WARDROBE') => void;
  remountRepertoireShow: (script: Script) => void;

  // Game Engine & Simulation Control
  gameSpeed: number; // 0 = pause, 1 = 1x, 2 = 2x, 5 = 5x
  setGameSpeed: (speed: number) => void;
  manualNextWeek: () => void;
  totalSeats: number;
  activeTab: 'STAGE' | 'PRODUCE' | 'FACILITY' | 'ROSTER' | 'BOARD' | 'FINANCES';
  setActiveTab: (tab: 'STAGE' | 'PRODUCE' | 'FACILITY' | 'ROSTER' | 'BOARD' | 'FINANCES') => void;
  notification: string | null;
  dismissNotification: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Financial State
  const [cash, setCash] = useState<number>(5400.0);
  const [acumen, setAcumen] = useState<number>(65);
  const [calendar, setCalendar] = useState<TheaterCalendar>({ seasonYear: 1, month: 3, week: 1 });
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(BOARD_MEMBERS);
  const [venueTier, setVenueTier] = useState<number>(1);

  // Active Production State
  const [production, setProduction] = useState<ActiveProduction | null>(null);
  const [repertoire, setRepertoire] = useState<Script[]>([]);
  const [productionHistory, setProductionHistory] = useState<
    { scriptTitle: string; finalScore: number; gross: number; seasonYear: number }[]
  >([]);
  const [salvageDiscount, setSalvageDiscount] = useState<number>(0);

  // Facility & Grid
  const [tiles, setTiles] = useState<StageTile[]>(createInitialGrid);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('STANDARD');
  const [selectedTile, setSelectedTile] = useState<StageTile | null>(null);
  const [buildFixtureId, setBuildFixtureId] = useState<string | null>(null);

  // Theatrical Lore
  const [isGhostLightLit, setIsGhostLightLit] = useState<boolean>(true);
  const [isScottishPlayCursed, setIsScottishPlayCursed] = useState<boolean>(false);
  const [curseDuration, setCurseDuration] = useState<number>(0);
  const [activeTechCrisis, setActiveTechCrisis] = useState<TechCrisis | null>(null);

  // Roster
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [cast, setCast] = useState<CastMember[]>(INITIAL_CAST);

  // Controls & UI
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'STAGE' | 'PRODUCE' | 'FACILITY' | 'ROSTER' | 'BOARD' | 'FINANCES'>('PRODUCE');
  const [notification, setNotification] = useState<string | null>(
    'Welcome to Curtain Call! Select an opening script in [PRODUCE] to launch your inaugural season.'
  );

  const dismissNotification = () => setNotification(null);

  // Calculate total auditorium seats
  const totalSeats = tiles.reduce((acc, t) => {
    if (t.fixtureId === 'seat_folding') return acc + 1;
    if (t.fixtureId === 'seat_velvet') return acc + 1;
    return acc;
  }, 0);

  // Board Approval Average
  const boardApprovalAvg = Math.round(
    boardMembers.reduce((sum, b) => sum + b.approvalRating, 0) / boardMembers.length
  );

  // Toggle Ghost Light
  const toggleGhostLight = () => {
    sound.playClick();
    setIsGhostLightLit((prev) => {
      const next = !prev;
      if (next) {
        setNotification('The Ghost Light glows on center stage. Staff feel safe and spirits are appeased.');
      } else {
        setNotification('Warning: The stage is left in pitch blackness! Overnight accident risk increased.');
      }
      return next;
    });
  };

  // The Scottish Play Easter Egg
  const triggerScottishPlayCurse = () => {
    sound.playFlubBuzzer();
    setIsScottishPlayCursed(true);
    setCurseDuration(3);
    setNotification('Curse of the Scottish Play! Someone spoke the forbidden tragedy inside the auditorium. Blown fuses and ankle sprains occur!');
  };

  const cleanseScottishPlayCurse = () => {
    sound.playCueChime();
    setIsScottishPlayCursed(false);
    setCurseDuration(0);
    setNotification('The cast walked outside, spun around three times, and spat over their left shoulder. The curse is broken!');
  };

  // Place Fixture on Tile
  const placeFixture = (targetTile: StageTile, fixtureId: string) => {
    const fixture = FIXTURES_CATALOG.find((f) => f.id === fixtureId);
    if (!fixture) return;

    if (cash < fixture.cost) {
      setNotification(`Insufficient capital! ${fixture.name} costs $${fixture.cost}.`);
      return;
    }

    sound.playCashRegister();
    setCash((c) => c - fixture.cost);

    setTiles((prev) =>
      prev.map((t) => {
        if (t.x === targetTile.x && t.y === targetTile.y) {
          return {
            ...t,
            fixtureId,
            temp: t.temp + (fixture.tempDelta || 0),
            noiseDb: Math.max(30, t.noiseDb - (fixture.noiseDampenDb || 0) + (fixture.noiseEmissionDb || 0)),
            aesthetic: Math.min(100, t.aesthetic + (fixture.aestheticDelta || 0))
          };
        }
        return t;
      })
    );

    setNotification(`Installed ${fixture.name} at (${targetTile.x}, ${targetTile.y}).`);
  };

  // Remove Fixture
  const removeFixture = (targetTile: StageTile) => {
    if (!targetTile.fixtureId) return;
    sound.playClick();
    setTiles((prev) =>
      prev.map((t) => (t.x === targetTile.x && t.y === targetTile.y ? { ...t, fixtureId: null } : t))
    );
    setSelectedTile((prev) => (prev ? { ...prev, fixtureId: null } : null));
  };

  // Train Staff with Acumen
  const trainStaffWithAcumen = (staffId: string) => {
    const s = staff.find((st) => st.id === staffId);
    if (!s) return;

    if (acumen < s.acumenTrainingCost) {
      setNotification(`Need ${s.acumenTrainingCost} Acumen (💡) to train ${s.name}. Resolve more Tech Week flubs!`);
      return;
    }

    sound.playFlubCleared();
    setAcumen((a) => a - s.acumenTrainingCost);
    setStaff((prev) =>
      prev.map((item) => {
        if (item.id === staffId) {
          const nextSkill = Math.min(99, item.skillLevel + 7);
          return {
            ...item,
            skillLevel: nextSkill,
            acumenTrainingCost: Math.round(item.acumenTrainingCost * 1.35)
          };
        }
        return item;
      })
    );
    setNotification(`${s.name} completed masterclass training! Skill increased to ${Math.min(99, s.skillLevel + 7)}.`);
  };

  // Assign Cast Member
  const assignCastMember = (actorId: string, role: 'LEAD' | 'SUPPORTING' | 'ENSEMBLE' | 'UNASSIGNED') => {
    sound.playClick();
    setCast((prev) =>
      prev.map((a) => (a.id === actorId ? { ...a, assignedRole: role } : a))
    );
  };

  // Start New Production Proposal
  const startNewProductionProposal = (script: Script, sliders: FocusSliders) => {
    const discountedLicensing = Math.round(script.licensingCost * (1 - salvageDiscount));
    if (cash < discountedLicensing) {
      setNotification(`Not enough capital! Licensing rights cost $${discountedLicensing}.`);
      return;
    }

    sound.playCashRegister();
    setCash((c) => c - discountedLicensing);
    setSalvageDiscount(0); // consume discount

    // Assign available cast automatically if not assigned
    const assignedActors = cast.filter((a) => a.assignedRole !== 'UNASSIGNED');
    const autoCast = assignedActors.length > 0 ? assignedActors : cast.slice(0, 5);

    const newProd: ActiveProduction = {
      script,
      sliders,
      phase: 'PRE_PRODUCTION',
      phaseProgress: 0,
      points: {
        acting: 0,
        scenery: 0,
        costumes: 0,
        atmosphere: 0
      },
      flubs: [],
      unresolvedFlubCount: 0,
      clearedFlubCount: 0,
      assignedCast: autoCast,
      scenicCheckpointReached: false,
      techCheckpointReached: false,
      techCrisisTriggered: false,
      runWeek: 0,
      totalAttendance: 0,
      totalBoxOfficeGross: 0,
      totalConcessionGross: 0,
      weeklyOccupancyRate: 0.95,
      ticketPrice: 18.0,
      salvageDiscountNextProduction: 0
    };

    setProduction(newProd);
    setActiveTab('STAGE');
    sound.playCueChime();
    setNotification(
      `Rights cleared for "${script.title}"! Technical crew has begun Pre-Production (Alpha) fabrication.`
    );
  };

  // Clear Flub Marker
  const clearFlub = (flubId: string) => {
    if (!production) return;
    const targetFlub = production.flubs.find((f) => f.id === flubId);
    const reward = targetFlub ? targetFlub.acumenReward : 10;

    setAcumen((a) => a + reward);
    setProduction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        flubs: prev.flubs.filter((f) => f.id !== flubId),
        unresolvedFlubCount: Math.max(0, prev.unresolvedFlubCount - 1),
        clearedFlubCount: prev.clearedFlubCount + 1
      };
    });
  };

  // Resolve Mid-Tech Crisis
  const resolveTechCrisis = (choice: 'A' | 'B') => {
    if (!activeTechCrisis || !production) return;
    if (choice === 'A') {
      if (cash < activeTechCrisis.optionA.cost) {
        setNotification(`Not enough funds for Option A ($${activeTechCrisis.optionA.cost}).`);
        return;
      }
      setCash((c) => c - activeTechCrisis.optionA.cost);
      activeTechCrisis.optionA.apply();
      sound.playCashRegister();
      setNotification(`Tech Crisis resolved: ${activeTechCrisis.optionA.label}.`);
    } else {
      activeTechCrisis.optionB.apply();
      sound.playFlubBuzzer();
      setNotification(`Tech Crisis resolved: ${activeTechCrisis.optionB.label}.`);
    }
    setActiveTechCrisis(null);
  };

  // Generate Critic Reviews for Opening Night
  const generateCriticReviews = useCallback((prod: ActiveProduction): CriticReview[] => {
    const shopSkill = staff.find((s) => s.role === 'SHOP_STEWARD')?.skillLevel || 50;
    const costumeSkill = staff.find((s) => s.role === 'COSTUME_MASTER')?.skillLevel || 50;
    const dirSkill = staff.find((s) => s.role === 'DIRECTOR')?.skillLevel || 50;

    // Acting score calculation based on cast talent, memorization, and flubs
    const castAvgTalent =
      prod.assignedCast.reduce((s, a) => s + a.talent, 0) / (prod.assignedCast.length || 1);
    const flubDeduction = prod.unresolvedFlubCount * 1.8;

    const baseActing = Math.min(10, Math.max(2, (castAvgTalent / 10 + prod.sliders.acting * 0.4) - flubDeduction / 3));
    const baseScenic = Math.min(10, Math.max(2, (shopSkill / 10 + prod.sliders.scenic * 0.4)));
    const baseCostume = Math.min(10, Math.max(2, (costumeSkill / 10 + prod.sliders.costume * 0.4)));
    const basePacing = Math.min(10, Math.max(2, (dirSkill / 10 + prod.sliders.lighting * 0.4)));

    const critics = [
      {
        name: 'Horace Vance',
        pub: 'The Daily Tribune',
        bias: 'Demands tight ensemble chemistry and memorization.'
      },
      {
        name: 'Penelope Sterling',
        pub: 'Civic Arts Gazette',
        bias: 'Loves lavish visual spectacle and period wardrobe.'
      },
      {
        name: 'Desmond Finch',
        pub: 'Metro Weekly Independent',
        bias: 'Harsh critic of directorial pacing and flubbed lines.'
      },
      {
        name: 'Maeve O’Connor',
        pub: 'Community Stage Round-up',
        bias: 'Warm supporter of volunteer grassroots theater.'
      }
    ];

    return critics.map((c, idx) => {
      const var1 = (Math.sin(idx * 2) * 0.8);
      const var2 = (Math.cos(idx * 3) * 0.8);

      const act = Math.min(10, Math.max(2, Math.round(baseActing + var1)));
      const scn = Math.min(10, Math.max(2, Math.round(baseScenic + var2)));
      const cos = Math.min(10, Math.max(2, Math.round(baseCostume - var1 * 0.5)));
      const pac = Math.min(10, Math.max(2, Math.round(basePacing + var2 * 0.5)));
      const total = act + scn + cos + pac;

      let quote = '';
      if (total >= 32) {
        quote = `A sparkling triumph! "${prod.script.title}" captures community theater magic at its grandest.`;
      } else if (total >= 24) {
        quote = `An earnest, charming staging, though minor line flubs and set wobbles kept it from soaring.`;
      } else {
        quote = `Hampered by forgotten dialogue and strained pacing. A well-intentioned but chaotic opening night.`;
      }

      return {
        criticName: c.name,
        publication: c.pub,
        actingScore: act,
        scenicScore: scn,
        costumeScore: cos,
        pacingScore: pac,
        totalScore: total,
        quote,
        recommends: total >= 25
      };
    });
  }, [staff]);

  // Proceed from Opening Night to The Run
  const proceedToTheRun = () => {
    if (!production) return;
    sound.playCueChime();
    setProduction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        phase: 'THE_RUN',
        runWeek: 1
      };
    });
    setNotification(`Opening weekend is a wrap! "${production.script.title}" is now running for ticket sales.`);
  };

  // Close Show and Perform Midnight Strike
  const closeShowAndStrike = (strategy: 'SCRAP' | 'SALVAGE' | 'WARDROBE') => {
    if (!production) return;
    sound.playCarpentryTap();

    let discount = 0;
    if (strategy === 'SCRAP') {
      setCash((c) => Math.max(0, c - 75)); // dumpster fee
      setNotification(`Midnight Strike: Scrapped stage flats in rented roll-off dumpster. Stage is immediately cleared.`);
    } else if (strategy === 'SALVAGE') {
      discount = 0.35; // 35% discount on next production
      setSalvageDiscount(0.35);
      setNotification(`Midnight Strike: Crew salvaged 2x4 framing lumber and stage screws! 35% discount applied to next script build.`);
    } else {
      setAcumen((a) => a + 30);
      setNotification(`Midnight Strike: Costumes cleaned and cataloged in the attic archive. Permanent collection expanded (+30 💡).`);
    }

    // Save to history
    setProductionHistory((prev) => [
      ...prev,
      {
        scriptTitle: production.script.title,
        finalScore: production.averageScore || 28,
        gross: production.totalBoxOfficeGross + production.totalConcessionGross,
        seasonYear: calendar.seasonYear
      }
    ]);

    setProduction(null);
    setActiveTab('PRODUCE');
  };

  // Remount Repertoire Revival
  const remountRepertoireShow = (script: Script) => {
    sound.playCueChime();
    startNewProductionProposal(script, { acting: 6, scenic: 5, costume: 5, lighting: 4 });
    setNotification(`Encore Revival! Staging community favorite "${script.title}". Baseline assets already in storage!`);
  };

  // Weekly Simulation Tick
  const runSimulationTick = useCallback(() => {
    // 1. Advance Calendar
    setCalendar((prev) => {
      let nextWeek = prev.week + 1;
      let nextMonth = prev.month;
      let nextYear = prev.seasonYear;

      if (nextWeek > 4) {
        nextWeek = 1;
        nextMonth += 1;
      }
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
        // Annual Grant Evaluation!
        const grantAmt = Math.round(2200 + boardApprovalAvg * 20);
        setCash((c) => c + grantAmt);
        sound.playFanfare();
        setNotification(`Annual Civic Grant Awarded: $${grantAmt} received from the Municipal Arts Endowment!`);
      }
      return { seasonYear: nextYear, month: nextMonth, week: nextWeek };
    });

    // Check curse duration
    if (isScottishPlayCursed) {
      setCurseDuration((d) => {
        if (d <= 1) {
          setIsScottishPlayCursed(false);
          return 0;
        }
        return d - 1;
      });
    }

    // 2. Fixed Weekly Overhead (Salaries, Utilities)
    const weeklyPayroll = staff.reduce((acc, s) => acc + s.weeklySalary, 0);
    const weeklyUtilities = 85.0;
    const weeklyUpkeep = tiles.reduce((acc, t) => {
      if (!t.fixtureId) return acc;
      const f = FIXTURES_CATALOG.find((fix) => fix.id === t.fixtureId);
      return acc + (f?.weeklyUpkeep || 0);
    }, 0);

    const totalWeeklyExpense = weeklyPayroll + weeklyUtilities + weeklyUpkeep;
    setCash((c) => Math.max(-2000, c - totalWeeklyExpense));

    // 3. Process Active Production Lifecycle
    setProduction((currentProd) => {
      if (!currentProd) return null;

      // Phase A: PRE-PRODUCTION (Alpha)
      if (currentProd.phase === 'PRE_PRODUCTION') {
        const nextProgress = Math.min(100, currentProd.phaseProgress + 35);
        const nextPoints = {
          ...currentProd.points,
          scenery: currentProd.points.scenery + Math.round(currentProd.sliders.scenic * 3.5),
          costumes: currentProd.points.costumes + Math.round(currentProd.sliders.costume * 3.2),
          atmosphere: currentProd.points.atmosphere + Math.round(currentProd.sliders.lighting * 2.8)
        };

        let scenicCheckpoint = currentProd.scenicCheckpointReached;
        let techCheckpoint = currentProd.techCheckpointReached;

        if (nextProgress >= 40 && !scenicCheckpoint) {
          scenicCheckpoint = true;
          sound.playCarpentryTap();
          setNotification('40% Scenic Checkpoint reached! Physical flats and stage architecture framed.');
        }
        if (nextProgress >= 80 && !techCheckpoint) {
          techCheckpoint = true;
          sound.playCueChime();
          setNotification('80% Technical Checkpoint locked! Lighting gels patched and sound channels leveled.');
        }

        if (nextProgress >= 100) {
          sound.playCueChime();
          setNotification('Alpha Pre-Production complete! Volunteer performers arriving for Cast Rehearsals (Beta).');
          return {
            ...currentProd,
            phase: 'REHEARSALS',
            phaseProgress: 0,
            points: nextPoints,
            scenicCheckpointReached: scenicCheckpoint,
            techCheckpointReached: techCheckpoint
          };
        }

        return {
          ...currentProd,
          phaseProgress: nextProgress,
          points: nextPoints,
          scenicCheckpointReached: scenicCheckpoint,
          techCheckpointReached: techCheckpoint
        };
      }

      // Phase B: REHEARSALS (Beta)
      if (currentProd.phase === 'REHEARSALS') {
        const nextProgress = Math.min(100, currentProd.phaseProgress + 35);

        // Generate Acting points & potential flubs
        const newFlubs = [...currentProd.flubs];
        currentProd.assignedCast.forEach((actor) => {
          // Memorization roll (actors with low memorization generate flub markers)
          const roll = Math.random() * 100;
          if (roll > actor.memorization) {
            sound.playFlubBuzzer();
            const flubX = 4 + Math.floor(Math.random() * 7);
            const flubY = 1 + Math.floor(Math.random() * 4);
            newFlubs.push({
              id: Math.random().toString(),
              tileX: flubX,
              tileY: flubY,
              type: 'MISSED_LINE',
              label: `${actor.name}: Flubbed line`,
              acumenReward: 12,
              createdAtProgress: nextProgress
            });
          }
        });

        const nextPoints = {
          ...currentProd.points,
          acting: currentProd.points.acting + Math.round(currentProd.sliders.acting * 3.8)
        };

        if (nextProgress >= 100) {
          sound.playCueChime();
          setNotification('Beta Rehearsals complete! Entering TECH WEEK ("Hell Week"). Clear stage flubs for Acumen (💡)!');
          return {
            ...currentProd,
            phase: 'TECH_WEEK',
            phaseProgress: 0,
            points: nextPoints,
            flubs: newFlubs,
            unresolvedFlubCount: newFlubs.length
          };
        }

        return {
          ...currentProd,
          phaseProgress: nextProgress,
          points: nextPoints,
          flubs: newFlubs,
          unresolvedFlubCount: newFlubs.length
        };
      }

      // Phase C: TECH WEEK ("Hell Week")
      if (currentProd.phase === 'TECH_WEEK') {
        const nextProgress = Math.min(100, currentProd.phaseProgress + 40);

        // Stage Manager auto-clears some flubs
        const stageMgr = staff.find((s) => s.role === 'STAGE_MANAGER');
        const clearCount = stageMgr ? Math.floor(stageMgr.skillLevel / 25) : 1;
        let remainingFlubs = [...currentProd.flubs];

        if (remainingFlubs.length > 0 && clearCount > 0) {
          const cleared = remainingFlubs.slice(0, clearCount);
          remainingFlubs = remainingFlubs.slice(clearCount);
          const gainedAcumen = cleared.reduce((sum, f) => sum + f.acumenReward, 0);
          setAcumen((a) => a + gainedAcumen);
        }

        // Trigger Mid-Tech Week Crisis dilemma at 50%
        if (nextProgress >= 40 && !currentProd.techCrisisTriggered && !activeTechCrisis) {
          setActiveTechCrisis({
            id: 'backdrop_tear',
            title: 'Mid-Tech Crisis: Hand-Painted Backdrop Torn!',
            description: 'During a cue-to-cue scene change, the scenic flat caught on a wing brace and tore down the center seam.',
            optionA: {
              label: 'Pay $250 for Commercial Muslin Patch',
              cost: 250,
              effectDescription: '+15 Scenic stat bonus; pristine visual presentation.',
              apply: () => {
                setProduction((p) => (p ? { ...p, points: { ...p.points, scenery: p.points.scenery + 15 } } : null));
              }
            },
            optionB: {
              label: 'Quick Gaffer Tape & Brown Paint (Free)',
              cost: 0,
              effectDescription: 'Saves funds, but creates 2 additional stage flub markers for opening night.',
              apply: () => {
                setProduction((p) => {
                  if (!p) return null;
                  const bonusFlubs = [
                    { id: Math.random().toString(), tileX: 6, tileY: 2, type: 'STUCK_FLAT' as const, label: 'Gaffer tape caught', acumenReward: 15, createdAtProgress: 50 },
                    { id: Math.random().toString(), tileX: 9, tileY: 3, type: 'DROPPED_PROP' as const, label: 'Tape peeling', acumenReward: 15, createdAtProgress: 50 }
                  ];
                  return {
                    ...p,
                    flubs: [...p.flubs, ...bonusFlubs],
                    unresolvedFlubCount: p.unresolvedFlubCount + 2
                  };
                });
              }
            }
          });
        }

        // Check if transition to OPENING NIGHT
        if (nextProgress >= 100) {
          sound.playFanfare();
          sound.playApplause();

          // Generate Reviews
          const reviews = generateCriticReviews(currentProd);
          const avgScore = Math.round(
            reviews.reduce((s, r) => s + r.totalScore, 0) / reviews.length
          );
          const isRepertoire = avgScore >= 32;

          if (isRepertoire && !repertoire.some((r) => r.id === currentProd.script.id)) {
            setRepertoire((prev) => [...prev, currentProd.script]);
            setNotification(
              `GLORIOUS TRIUMPH! Score of ${avgScore}/40 inducted "${currentProd.script.title}" into the Community Repertoire!`
            );
          } else {
            setNotification(`Opening Night reviews are in! Average score: ${avgScore}/40.`);
          }

          return {
            ...currentProd,
            phase: 'OPENING_NIGHT',
            phaseProgress: 100,
            flubs: remainingFlubs,
            unresolvedFlubCount: remainingFlubs.length,
            techCrisisTriggered: true,
            reviews,
            averageScore: avgScore,
            inductedIntoRepertoire: isRepertoire
          };
        }

        return {
          ...currentProd,
          phaseProgress: nextProgress,
          flubs: remainingFlubs,
          unresolvedFlubCount: remainingFlubs.length,
          techCrisisTriggered: true
        };
      }

      // Phase D: THE RUN (Weekend box office)
      if (currentProd.phase === 'THE_RUN') {
        const runW = currentProd.runWeek + 1;
        // Occupancy decay: Aw = A0 * (1 - lambda)^w
        const decayRate = 0.12;
        const currentOcc = Math.max(0.2, 0.95 * Math.pow(1 - decayRate, runW - 1));

        // Patrons this weekend
        const actualSeats = Math.max(12, totalSeats);
        const weeklyPatrons = Math.round(actualSeats * currentOcc);

        // Box office gross
        const ticketGross = weeklyPatrons * currentProd.ticketPrice;
        // Concession gross ($2.25 net per patron)
        const hasConcessions = tiles.some((t) => t.fixtureId === 'concession_table');
        const concessionGross = hasConcessions ? Math.round(weeklyPatrons * 2.25) : 0;

        // Licensing royalty share (e.g. 12-14% of gross)
        const royaltyPaid = Math.round(ticketGross * currentProd.script.royaltyPercent);
        const netTake = ticketGross + concessionGross - royaltyPaid;

        setCash((c) => c + netTake);
        sound.playCashRegister();

        return {
          ...currentProd,
          runWeek: runW,
          weeklyOccupancyRate: currentOcc,
          totalAttendance: currentProd.totalAttendance + weeklyPatrons,
          totalBoxOfficeGross: currentProd.totalBoxOfficeGross + ticketGross,
          totalConcessionGross: currentProd.totalConcessionGross + concessionGross
        };
      }

      return currentProd;
    });
  }, [
    staff,
    tiles,
    totalSeats,
    boardApprovalAvg,
    isScottishPlayCursed,
    activeTechCrisis,
    generateCriticReviews,
    repertoire
  ]);

  // Main Simulation Interval Timer based on gameSpeed
  useEffect(() => {
    if (gameSpeed === 0) return;

    // Interval: 1x = 3500ms, 2x = 1800ms, 5x = 750ms
    const intervalMs = gameSpeed === 1 ? 3500 : gameSpeed === 2 ? 1800 : 750;
    const timer = setInterval(() => {
      runSimulationTick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [gameSpeed, runSimulationTick]);

  const manualNextWeek = () => {
    sound.playClick();
    runSimulationTick();
  };

  return (
    <GameContext.Provider
      value={{
        cash,
        acumen,
        calendar,
        boardMembers,
        boardApprovalAvg,
        venueTier,
        production,
        phase: production ? production.phase : 'IDLE',
        repertoire,
        productionHistory,
        tiles,
        heatmapMode,
        setHeatmapMode,
        selectedTile,
        setSelectedTile,
        buildFixtureId,
        setBuildFixtureId,
        placeFixture,
        removeFixture,
        isGhostLightLit,
        toggleGhostLight,
        triggerScottishPlayCurse,
        cleanseScottishPlayCurse,
        isScottishPlayCursed,
        staff,
        cast,
        trainStaffWithAcumen,
        assignCastMember,
        startNewProductionProposal,
        clearFlub,
        resolveTechCrisis,
        activeTechCrisis,
        proceedToTheRun,
        closeShowAndStrike,
        remountRepertoireShow,
        gameSpeed,
        setGameSpeed,
        manualNextWeek,
        totalSeats,
        activeTab,
        setActiveTab,
        notification,
        dismissNotification
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
