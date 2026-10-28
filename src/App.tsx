// tslint:disable
/* eslint-disable */
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {
  Activity,
  Play,
  Pause,
  Award,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Sparkles,
  Users,
  Wrench,
  CheckCircle2,
  FastForward,
  Armchair,
  Lightbulb,
  Building2,
  TrendingUp,
  Receipt,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Layers,
  Shield,
  DoorOpen,
  Hammer,
  Scissors,
  Shirt,
  Wind,
  Trash2,
  Brush,
  Bath,
  Thermometer,
  Gauge,
  Sparkle,
} from 'lucide-react';
import Game from './Game';
import {
  CivicLogoIcon,
  ChairmanOnboardingModal,
} from './components/ChairmanOnboardingModal';
import { CivicInspectorModal } from './components/CivicInspectorModal';
import { VenueValidator } from './utils/venueValidator';
import {
  WallViewMode,
  LabelViewMode,
  TheaterBrandConfig,
  PlacedStage,
  PlacedWing,
  CivicLogoId,
  CIVIC_PALETTE,
  BuildingAuditResult,
  TutorialPhase,
  StageTier,
  STAGE_CONFIGS,
  DragBoxState,
} from './types';
import {
  Eye,
  EyeOff,
  Stamp,
  ShieldCheck,
  Focus,
} from 'lucide-react';
import {
  getConfig,
  SCRIPT_LIBRARY,
  INITIAL_STAFF,
  INITIAL_VOLUNTEERS,
  INITIAL_GRID_ITEMS,
  FURNITURE_CATALOG,
  ROOM_CAMERA_PRESETS,
  INITIAL_BOARD_MEMBERS,
  SEASONAL_TOWN_RUMORS,
  ROOM_DEFINITIONS,
  ROOM_MIN_DIMENSIONS,
} from './constants';
import {
  GameState,
  ProductionPhase,
  Season,
  ScriptDef,
  StaffMember,
  VolunteerActor,
  ProductionSliders,
  ProductionStats,
  ActiveFlubBug,
  FloatingPointItem,
  GridTileItem,
  CriticReview,
  TheaterRoomZone,
  HeatmapMode,
  BoardMember,
  TheatricalCrisis,
  GalaReport,
  RoomType,
  TileEnvironmentalData,
  FacilityAudit,
} from './types';
import {
  createDefaultTileRooms,
  computeEnvironmentalState,
  auditFacility,
} from './utils/environmentalSimulation';
import { THEATRICAL_CRISES } from './data/crises';
import { generateAuditionCandidates } from './data/auditionCandidates';
import {
  gameAudio,
  useAutoFocus,
  useIsMobile,
  MenuOverlay,
} from './utils';
import {usePlayground, usePlaygroundGameLifecycle} from './utils/usePlayground';
import BackgroundMusic from './utils/BackgroundMusic';

const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];

export default function App() {
  const {sdk} = usePlayground();
  const isMobile = useIsMobile();

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
  });
  usePlaygroundGameLifecycle(gameState, sdk);

  // Currencies & Progression
  const [funds, setFunds] = useState<number>(getConfig('initialFunds'));
  const [acumen, setAcumen] = useState<number>(getConfig('initialAcumen'));
  const [prestige, setPrestige] = useState<number>(getConfig('initialPrestige'));
  const [year, setYear] = useState(1);
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [month, setMonth] = useState(1);
  const [week, setWeek] = useState(1);

  // Board of Directors & Lore
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(INITIAL_BOARD_MEMBERS);
  const [isGhostLightLit, setIsGhostLightLit] = useState<boolean>(true);
  const [isScottishCurseActive, setIsScottishCurseActive] = useState<boolean>(false);
  const [curseDuration, setCurseDuration] = useState<number>(0);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Staff & Volunteers
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [volunteers, setVolunteers] = useState<VolunteerActor[]>(INITIAL_VOLUNTEERS);

  // Active Production State
  const [phase, setPhase] = useState<ProductionPhase>('SEASON_IDLE');
  const [selectedScript, setSelectedScript] = useState<ScriptDef | null>(null);
  const [sliders, setSliders] = useState<ProductionSliders>({
    actingHeart: 5,
    setsScenery: 5,
    costumesProps: 5,
    lightingSound: 5,
  });
  const [assignedCastIds, setAssignedCastIds] = useState<string[]>([]);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 - 100
  const [scenicCheckpointNotified, setScenicCheckpointNotified] = useState(false);
  const [techCheckpointNotified, setTechCheckpointNotified] = useState(false);

  const [productionStats, setProductionStats] = useState<ProductionStats>({
    acting: 0,
    scenic: 0,
    costumes: 0,
    lighting: 0,
    flubsSpawned: 0,
    flubsCleared: 0,
    activeFlubs: 0,
  });

  // Tech Week Flub Squashing & Crisis State
  const [activeFlubs, setActiveFlubs] = useState<ActiveFlubBug[]>([]);
  const [techWeekTimeLeft, setTechWeekTimeLeft] = useState(100);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [activeCrisis, setActiveCrisis] = useState<TheatricalCrisis | null>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  // Critic Reviews & Repertoire (Hall of Fame) & Annual Gala
  const [reviewScores, setReviewScores] = useState<CriticReview[]>([]);
  const [totalReviewScore, setTotalReviewScore] = useState(0);
  const [isRepertoireInducted, setIsRepertoireInducted] = useState(false);
  const [seasonReviewHistory, setSeasonReviewHistory] = useState<number[]>([]);
  const [repertoireCatalog, setRepertoireCatalog] = useState<ScriptDef[]>([]);
  const [annualGalaReport, setAnnualGalaReport] = useState<GalaReport | null>(null);

  // Box Office Live Run
  const [ticketPrice, setTicketPrice] = useState<number>(getConfig('ticketPriceDefault'));
  const [runWeek, setRunWeek] = useState(1);
  const [weeklyOccupancy, setWeeklyOccupancy] = useState(0);
  const [weeklyGross, setWeeklyGross] = useState(0);
  const [weeklyConcessions, setWeeklyConcessions] = useState(0);
  const [totalRunGross, setTotalRunGross] = useState(0);
  const [totalRunAttendance, setTotalRunAttendance] = useState(0);

  // Build Mode, Architecture & Storefront Unit 12B Grid Items (16x24 tiles)
  const [gridItems, setGridItems] = useState<GridTileItem[]>([]);
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [selectedBuildItem, setSelectedBuildItem] = useState<GridTileItem['itemId']>('seat_folding');
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('NONE');

  // Room Zoning & Architectural Segregation State
  const [tileRooms, setTileRooms] = useState<Record<string, RoomType>>({});
  const [activeZoningBrush, setActiveZoningBrush] = useState<RoomType | null>(null);
  const [buildSubTab, setBuildSubTab] = useState<'CATALOG' | 'ZONING' | 'AUDIT'>('CATALOG');
  const [selectedBuildCategory, setSelectedBuildCategory] = useState<
    'ALL' | 'SEATING' | 'ROOM_STRUCTURE' | 'SHOP_EQUIPMENT' | 'HVAC_ACOUSTICS' | 'HOSPITALITY_DECOR'
  >('ALL');

  // Navigation Tabs in Management Bottom Console
  const [activeTab, setActiveTab] = useState<'PRODUCE' | 'BUILD' | 'CAST_CREW' | 'FINANCES'>('PRODUCE');

  // Camera Orbit & Pan
  const [currentZonePreset, setCurrentZonePreset] = useState<TheaterRoomZone>('OVERVIEW');
  const [cameraOrbit, setCameraOrbit] = useState({
    rotY: ROOM_CAMERA_PRESETS.OVERVIEW.rotY,
    zoom: ROOM_CAMERA_PRESETS.OVERVIEW.zoom,
    panX: ROOM_CAMERA_PRESETS.OVERVIEW.panX,
    panZ: ROOM_CAMERA_PRESETS.OVERVIEW.panZ,
  });

  // Simulation Controls & Audio
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);

  // Floating point particles
  const [floatingBubbles, setFloatingBubbles] = useState<FloatingPointItem[]>([]);
  const startBtnRef = useAutoFocus<HTMLButtonElement>(gameState.status === 'START');

  const currentSeason = SEASONS[seasonIndex];
  const currentTownRumor = SEASONAL_TOWN_RUMORS[currentSeason];

  // 4-Layer Environmental State Machine (Continuous Matrix Calculation)
  const envMatrix = useMemo(() => {
    return computeEnvironmentalState(gridItems, tileRooms, currentSeason, phase);
  }, [gridItems, tileRooms, currentSeason, phase]);

  // Comprehensive Facility Audit (Segregation, Parallel Pipeline, Intermission Flow)
  const facilityAudit = useMemo(() => {
    return auditFacility(gridItems, tileRooms, envMatrix);
  }, [gridItems, tileRooms, envMatrix]);

  // Total seat capacity calculated from placed seating tiles
  const totalSeatCapacity = useMemo(() => {
    return gridItems.reduce((acc, item) => {
      const catalogDef = FURNITURE_CATALOG.find((f) => f.id === item.itemId);
      return acc + (catalogDef?.seatCapacityBonus || 0);
    }, 0);
  }, [gridItems]);

  // Chairman Induction & Brand Configuration
  const [brandConfig, setBrandConfig] = useState<TheaterBrandConfig>({
    theaterName: 'Curtain Call Playhouse',
    logoId: 'MASKS',
    primaryColor: '#881337',
    skipTutorial: false,
    funds: 5000,
  });
  const [isChairmanModalOpen, setIsChairmanModalOpen] = useState(false);

  // Player Sightline Controls
  const [wallViewMode, setWallViewMode] = useState<WallViewMode>('CUTAWAY');
  const [labelViewMode, setLabelViewMode] = useState<LabelViewMode>('ALL');

  // Stage Platform Archetypes & Wings
  const [placedStage, setPlacedStage] = useState<PlacedStage | null>(null);
  const [placedWings, setPlacedWings] = useState<PlacedWing[]>([]);

  // Guided Tutorial FSM / Civic Inspector State
  const [tutorialPhase, setTutorialPhase] = useState<TutorialPhase>('TUTORIAL_COMPLETE');
  const [civicAuditResult, setCivicAuditResult] = useState<BuildingAuditResult | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [hasClaimedCivicGrant, setHasClaimedCivicGrant] = useState(false);

  // Drag-to-Box Room Construction Ghost State
  const [dragBox, setDragBox] = useState<DragBoxState | null>(null);
  const [isHeatmapMenuOpen, setIsHeatmapMenuOpen] = useState(false);

  // Backstage and auditorium amenities check
  const hasMakeupVanity = useMemo(() => gridItems.some((i) => i.itemId === 'makeup_vanity'), [gridItems]);
  const hasSnackTable = useMemo(() => gridItems.some((i) => i.itemId === 'table_snack'), [gridItems]);
  const hasCocktailBar = useMemo(() => gridItems.some((i) => i.itemId === 'bar_cocktail'), [gridItems]);
  const hasAcousticPanels = useMemo(() => gridItems.some((i) => i.itemId === 'acoustic_panel'), [gridItems]);
  const hasElectricRadiator = useMemo(() => gridItems.some((i) => i.itemId === 'electric_radiator'), [gridItems]);
  const hasProsceniumArch = useMemo(() => gridItems.some((i) => i.itemId === 'proscenium_arch'), [gridItems]);

  // Luxury comfort score derived from seat tiers
  const luxurySeatFactor = useMemo(() => {
    let score = 0;
    gridItems.forEach((i) => {
      if (i.itemId === 'seat_plush') score += 1;
      if (i.itemId === 'seat_rocker') score += 2.5;
    });
    return score;
  }, [gridItems]);

  // Fair market ticket price based on reviews, town rumor alignment, seat comfort, and prestige
  const fairTicketPrice = useMemo(() => {
    const base = 12 + (totalReviewScore / 40) * 16 + (prestige / 100) * 8;
    const luxuryBonus = Math.min(10, luxurySeatFactor * 0.35);
    const rumorBonus = currentTownRumor.favoredGenre === selectedScript?.genre ? 3 : 0;
    return Math.max(10, Math.round(base + luxuryBonus + rumorBonus));
  }, [totalReviewScore, prestige, luxurySeatFactor, currentTownRumor, selectedScript]);

  // Sync score with funds, prestige & repertoire
  useEffect(() => {
    const calcScore = Math.max(0, Math.floor(funds + prestige * 300 + repertoireCatalog.length * 2500 + acumen * 20));
    setGameState((prev) => ({...prev, score: calcScore, level: year}));
  }, [funds, prestige, repertoireCatalog.length, acumen, year]);

  // Window back key support
  useEffect(() => {
    (window as unknown as Record<string, unknown>).canHandleBackKey = ['PLAYING', 'PAUSED'].includes(gameState.status);
  }, [gameState.status]);

  // Keyboard navigation for Camera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHowToPlayOpen) setIsHowToPlayOpen(false);
        else if (gameState.status === 'PLAYING') setIsGameMenuOpen((p) => !p);
      }
      if (gameState.status === 'PLAYING') {
        if (e.key.toLowerCase() === 'q') setCameraOrbit((c) => ({...c, rotY: c.rotY - 0.2}));
        else if (e.key.toLowerCase() === 'e') setCameraOrbit((c) => ({...c, rotY: c.rotY + 0.2}));
        else if (e.key.toLowerCase() === 'w') setCameraOrbit((c) => ({...c, panZ: c.panZ - 1}));
        else if (e.key.toLowerCase() === 's') setCameraOrbit((c) => ({...c, panZ: c.panZ + 1}));
        else if (e.key.toLowerCase() === 'a') setCameraOrbit((c) => ({...c, panX: c.panX - 1}));
        else if (e.key.toLowerCase() === 'd') setCameraOrbit((c) => ({...c, panX: c.panX + 1}));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, isHowToPlayOpen]);

  // Toast notification timer
  useEffect(() => {
    if (!activeNotification) return;
    const t = setTimeout(() => setActiveNotification(null), 4000);
    return () => clearTimeout(t);
  }, [activeNotification]);

  // Start New Career - opens Chairman Onboarding
  const handleStartGame = () => {
    gameAudio.playConfirmSelect();
    setGridItems([]);
    setTileRooms({});
    setPlacedStage(null);
    setPlacedWings([]);
    setIsChairmanModalOpen(true);
  };

  // Confirm Chairman Oath & Initialize Venue
  const handleConfirmChairman = (config: TheaterBrandConfig) => {
    setBrandConfig(config);
    setIsChairmanModalOpen(false);
    if (sdk) sdk.startGame();
    setGameState((prev) => ({...prev, status: 'PLAYING'}));

    const initialCash = config.skipTutorial ? 10000 : 5000;
    setFunds(initialCash);
    setAcumen(getConfig('initialAcumen'));
    setPrestige(getConfig('initialPrestige'));
    setYear(1);
    setSeasonIndex(0);
    setMonth(1);
    setWeek(1);
    setStaff(INITIAL_STAFF);
    setVolunteers(INITIAL_VOLUNTEERS);
    setGridItems([]);
    setTileRooms({});
    setPlacedStage(null);
    setPlacedWings([]);
    setPhase('SEASON_IDLE');
    setSelectedScript(null);
    setAssignedCastIds([]);
    setActiveFlubs([]);
    setReviewScores([]);
    setSeasonReviewHistory([]);
    setRepertoireCatalog([]);
    setIsBuildMode(false);
    setActiveTab('PRODUCE');
    setIsGhostLightLit(true);
    setIsScottishCurseActive(false);

    if (config.skipTutorial) {
      setTutorialPhase('TUTORIAL_COMPLETE');
      setHasClaimedCivicGrant(true);
      setActiveNotification(
        `🏛️ Welcome, Chairman! Freeform Architect Mode enabled for ${config.theaterName}. $10,000 liquid capital ready!`
      );
    } else {
      setTutorialPhase('PHASE_1_ANCHOR_STAGE');
      setHasClaimedCivicGrant(false);
      setActiveNotification(
        `🏛️ Welcome, Chairman! Guided Step 1: Anchor the Stage Platform to establish proscenium orientation.`
      );
    }
  };

  // Call Civic Inspector & Audit Building
  const handleCallCivicInspector = () => {
    gameAudio.playCrispClick();
    const uniqueRoomTypes = Array.from(new Set(Object.values(tileRooms)));
    const roomsList = uniqueRoomTypes.map((type) => {
      let minX = 16, maxX = 0, minZ = 24, maxZ = 0;
      Object.entries(tileRooms).forEach(([key, rType]) => {
        if (rType === type) {
          const [gx, gz] = key.split('_').map(Number);
          minX = Math.min(minX, gx);
          maxX = Math.max(maxX, gx);
          minZ = Math.min(minZ, gz);
          maxZ = Math.max(maxZ, gz);
        }
      });
      return {
        id: `room_${type}`,
        type: (type === 'AUDITORIUM' ? 'HOUSE' : type) as any,
        name: ROOM_DEFINITIONS[type]?.name || type,
        bounds: { x1: minX, z1: minZ, x2: maxX, z2: maxZ },
        doors: [],
        placedItemIds: gridItems.map((i) => i.itemId),
      };
    });

    const shopDoorsList = gridItems
      .filter((i) => i.itemId.startsWith('door_shop_'))
      .map((i) => ({
        id: i.id,
        tier: (i.itemId === 'door_shop_rollup'
          ? 'ROLLUP_3X1'
          : i.itemId === 'door_shop_double'
          ? 'DOUBLE_2X1'
          : 'STANDARD_1X1') as any,
        widthTiles: i.itemId === 'door_shop_rollup' ? 3 : i.itemId === 'door_shop_double' ? 2 : 1,
        x: i.x,
        z: i.z,
        connectsShopToStage: true,
        maxSetStars: 5,
      }));

    const result = VenueValidator.audit(
      placedStage,
      roomsList as any,
      placedWings,
      shopDoorsList,
      totalSeatCapacity,
      gridItems
    );
    setCivicAuditResult(result);
    setIsAuditModalOpen(true);
  };

  // Claim Inaugural Municipal Grant
  const handleClaimCivicGrant = () => {
    if (hasClaimedCivicGrant) return;
    setFunds((f) => f + 5000);
    setHasClaimedCivicGrant(true);
    setTutorialPhase('TUTORIAL_COMPLETE');
    gameAudio.playLevelUpStinger();
    setActiveNotification('🏆 Municipal Arts Grant Awarded! +$5,000 deposited into liquid reserves.');
  };

  // Switch Room Zone Camera Preset
  const handleSelectRoomZone = (zone: TheaterRoomZone) => {
    gameAudio.playCrispClick();
    setCurrentZonePreset(zone);
    const preset = ROOM_CAMERA_PRESETS[zone];
    if (preset) {
      setCameraOrbit({
        rotY: preset.rotY,
        zoom: preset.zoom,
        panX: preset.panX,
        panZ: preset.panZ,
      });
    }
  };

  // Toggle Ghost Light
  const handleToggleGhostLight = () => {
    gameAudio.playCrispClick();
    setIsGhostLightLit((prev) => {
      const next = !prev;
      if (next) {
        setActiveNotification('🕯️ Ghost Light illuminated center stage! Spirit contentment restored.');
      } else {
        setActiveNotification('⚠️ Ghost Light extinguished! Overnight accidents and cold chills risk increased.');
      }
      return next;
    });
  };

  // The Scottish Play Curse & Cleansing
  const handleTriggerCurse = () => {
    gameAudio.playErrorBuzz();
    setIsScottishCurseActive(true);
    setCurseDuration(3);
    setActiveNotification('Curse of the Scottish Play! "Macbeth" was spoken on stage! Fuses blown and ankle sprains occur!');
  };

  const handleCleanseCurse = () => {
    gameAudio.playPowerupChime();
    setIsScottishCurseActive(false);
    setCurseDuration(0);
    setActiveNotification('Cast went outside, spun three times, and spat! The theatrical curse is broken!');
  };

  // Phase 1: Select Script & Initialize Proposal
  const handleChooseScript = (script: ScriptDef) => {
    gameAudio.playCrispClick();
    setSelectedScript(script);

    // Auto-select best matching 3 volunteers
    const topVolunteers = [...volunteers]
      .sort((a, b) => b.stagePresence + b.memorization - (a.stagePresence + a.memorization))
      .slice(0, 3)
      .map((v) => v.id);
    setAssignedCastIds(topVolunteers);

    // Assign roles
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === topVolunteers[0]) return {...v, assignedRole: 'Lead 1'};
        if (v.id === topVolunteers[1]) return {...v, assignedRole: 'Lead 2'};
        if (v.id === topVolunteers[2]) return {...v, assignedRole: 'Ensemble'};
        return {...v, assignedRole: 'None'};
      })
    );
    setPhase('PROPOSAL');
  };

  // Adjust Cast Role Assignment Manually
  const handleReassignRole = (actorId: string, newRole: VolunteerActor['assignedRole']) => {
    gameAudio.playCrispClick();
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === actorId) {
          return {...v, assignedRole: newRole};
        }
        // If assigning a lead role that is already taken, swap to ensemble
        if (newRole !== 'None' && newRole !== 'Ensemble' && newRole !== 'Understudy' && v.assignedRole === newRole) {
          return {...v, assignedRole: 'Ensemble'};
        }
        return v;
      })
    );

    // Update assigned cast array
    if (newRole === 'None' || newRole === 'Understudy') {
      setAssignedCastIds((prev) => prev.filter((id) => id !== actorId));
    } else {
      setAssignedCastIds((prev) => (prev.includes(actorId) ? prev : [...prev, actorId]));
    }
  };

  // Adjust Focus Sliders (Total sum pool capped at 20)
  const handleSliderChange = (key: keyof ProductionSliders, newVal: number) => {
    const currentVal = sliders[key];
    const diff = newVal - currentVal;
    const currentSum = sliders.actingHeart + sliders.setsScenery + sliders.costumesProps + sliders.lightingSound;
    if (currentSum + diff > 20) return; // Pool limit is 20 points
    setSliders((s) => ({...s, [key]: Math.max(0, newVal)}));
  };

  // Launch Alpha Pre-Production Phase
  const handleStartPreProduction = () => {
    if (!selectedScript) return;
    const royaltyCost = selectedScript.baseRoyalty;
    if (funds < royaltyCost) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Insufficient capital to clear script licensing rights!');
      return;
    }
    gameAudio.playPowerupChime();
    setFunds((f) => f - royaltyCost);
    setPhase('PRE_PROD_ALPHA');
    setPhaseProgress(0);
    setScenicCheckpointNotified(false);
    setTechCheckpointNotified(false);
    setProductionStats({
      acting: Math.floor(sliders.actingHeart * 2),
      scenic: Math.floor(sliders.setsScenery * 2.5),
      costumes: Math.floor(sliders.costumesProps * 2.5),
      lighting: Math.floor(sliders.lightingSound * 2.5),
      flubsSpawned: 0,
      flubsCleared: 0,
      activeFlubs: 0,
    });
    handleSelectRoomZone('STAGE');
    setActiveNotification(`Rights secured for "${selectedScript.title}"! Technical crew framing sets.`);
  };

  // Production Simulation Step Loop (Alpha Pre-Production & Beta Rehearsals)
  useEffect(() => {
    if (
      (phase !== 'PRE_PROD_ALPHA' && phase !== 'REHEARSAL_BETA' && phase !== 'TECH_WEEK') ||
      isSimulationPaused ||
      gameState.status !== 'PLAYING'
    )
      return;

    const interval = setInterval(() => {
      const speedMult = simSpeed;
      if (phase === 'PRE_PROD_ALPHA') {
        setPhaseProgress((prog) => {
          const velocityMult = facilityAudit.parallelPipelineActive ? 1.4 : facilityAudit.isSceneShopSegregated ? 1.2 : 1.0;
          const next = prog + 2.5 * speedMult * velocityMult;

          const milo = staff.find((s) => s.id === 'milo_tech');
          const carpentry = milo ? milo.carpentry : 5;

          // Room Multipliers: Scene Shop (2.5x Build Velocity) & Wardrobe Loft (2.5x Stitch Speed)
          const shopMult = facilityAudit.isSceneShopSegregated ? 2.5 : 1.0;
          const wardrobeMult = facilityAudit.isWardrobeLoftActive ? 2.5 : 1.0;
          const inTheZone = facilityAudit.crewInTheZoneBonus ? 1.3 : 1.0;

          const addedScenic = Math.floor((carpentry * 0.4 + (sliders.setsScenery / 5)) * speedMult * shopMult * inTheZone);
          const addedCostumes = Math.floor((sliders.costumesProps * 0.6) * speedMult * wardrobeMult * inTheZone);
          const addedLighting = Math.floor((sliders.lightingSound * 0.6 * (hasAcousticPanels ? 1.15 : 1.0)) * speedMult * inTheZone);

          // Checkpoint checks
          if (next >= 40 && !scenicCheckpointNotified) {
            setScenicCheckpointNotified(true);
            gameAudio.playCrispClick();
            setActiveNotification('40% Scenic Checkpoint reached! Flats framed on stage.');
          }
          if (next >= 80 && !techCheckpointNotified) {
            setTechCheckpointNotified(true);
            gameAudio.playCrispClick();
            setActiveNotification('80% Technical Checkpoint locked! Gels and footlights patched.');
          }

          setProductionStats((ps) => ({
            ...ps,
            scenic: ps.scenic + addedScenic,
            costumes: ps.costumes + addedCostumes,
            lighting: ps.lighting + addedLighting,
          }));

          // Floating bubbles during Alpha
          if (Math.random() < 0.25) {
            const bubble: FloatingPointItem = {
              id: `b_alpha_${Date.now()}`,
              type: 'scenic',
              text: `+${addedScenic} 🪵 Scenic Flats${facilityAudit.isSceneShopSegregated ? ' (2.5x Shop)' : ''}`,
              color: '#ea580c',
              x: -4.0,
              y: 2.2,
              z: -7.0,
            };
            setFloatingBubbles((b) => [...b.slice(-5), bubble]);
          }

          if (next >= 100) {
            gameAudio.playPowerupChime();
            setPhase('REHEARSAL_BETA');
            setActiveNotification('Sets fabricated! Volunteer performers arriving for Beta Rehearsals.');
            return 0;
          }
          return next;
        });
      } else if (phase === 'REHEARSAL_BETA') {
        setPhaseProgress((prog) => {
          // Rehearsal Studio unlocks concurrent parallel pipeline!
          const parallelMult = facilityAudit.isRehearsalStudioActive ? 1.5 : 1.0;
          const next = prog + 2.0 * speedMult * parallelMult;
          const cast = volunteers.filter((v) => assignedCastIds.includes(v.id));

          let newFlubsCount = 0;
          let addedActing = 0;

          // Environmental Checks
          const isSharedPenalty = facilityAudit.sharedResourcePenaltyActive;
          const isAcousticRisk = facilityAudit.acousticInterferenceRisk;
          const isColdStage = facilityAudit.averageStageTemp < 60;
          const isHotStage = facilityAudit.averageStageTemp > 82;
          const studioPointMult = facilityAudit.isRehearsalStudioActive ? 2.0 : 1.0;

          cast.forEach((actor) => {
            const presenceMult = actor.stagePresence / 5;
            const roll = Math.random() * 10;
            // Auditory Interference penalty (-40% focus, flubs quadrupled)
            const interferencePenalty = isSharedPenalty ? 3 : 0;
            const acousticPenalty = isAcousticRisk ? 2 : 0;
            const coldPenalty = isColdStage ? 2 : 0;
            const cursePenalty = isScottishCurseActive ? 3 : 0;

            const threshold = actor.memorization + (hasMakeupVanity ? 2 : 0) - cursePenalty - coldPenalty - interferencePenalty - acousticPenalty;

            if (roll > threshold) {
              newFlubsCount += isSharedPenalty ? 2 : 1;
            } else {
              const isSpark = Math.random() < 0.18;
              let pt = Math.floor((3 * presenceMult * (isSpark ? 2 : 1) + (sliders.actingHeart / 4)) * speedMult * studioPointMult);
              if (isSharedPenalty) pt = Math.floor(pt * 0.6); // Auditory Interference Debuff (-40% Focus)
              if (isAcousticRisk) pt = Math.floor(pt * 0.5); // 50% coaching efficiency penalty
              if (isHotStage) pt = Math.floor(pt * 0.65); // Overheating makeup runs (-35% Focus)
              if (facilityAudit.crewInTheZoneBonus) pt = Math.floor(pt * 1.3);
              addedActing += pt;
            }
          });

          // Understudy skill growth: actors assigned as 'Understudy' absorb blocking and gain +1 memo
          if (Math.random() < 0.12 * speedMult) {
            setVolunteers((prev) =>
              prev.map((v) => {
                if (v.assignedRole === 'Understudy' && v.memorization < 10) {
                  return {...v, memorization: v.memorization + 1};
                }
                return v;
              })
            );
          }

          // Backstage treats from snack table boosts troupe morale
          if (hasSnackTable && Math.random() < 0.08 * speedMult) {
            const bubble: FloatingPointItem = {
              id: `snack_${Date.now()}`,
              type: 'acting',
              text: '☕ Troupe Coffee & Morale!',
              color: '#10b981',
              x: 0,
              y: 2.2,
              z: -4.0,
            };
            setFloatingBubbles((b) => [...b.slice(-5), bubble]);
          }

          setProductionStats((ps) => ({
            ...ps,
            acting: ps.acting + addedActing,
            flubsSpawned: ps.flubsSpawned + newFlubsCount,
            activeFlubs: ps.activeFlubs + newFlubsCount,
          }));

          // Spawn active flub on stage
          if (newFlubsCount > 0 && activeFlubs.length < 8) {
            let flubCategories: ActiveFlubBug['category'][] = [
              'dropped_line',
              'missed_cue',
              'jammed_flat',
              'torn_hemline',
              'flickering_dimmer',
            ];
            // Quick-Change Wing Meta: Eliminates Late Cue flubs!
            if (facilityAudit.quickChangeEliminatesLateCues) {
              flubCategories = flubCategories.filter((c) => c !== 'missed_cue');
            }
            const chosenCategory = flubCategories[Math.floor(Math.random() * flubCategories.length)];
            const titles: Record<ActiveFlubBug['category'], string> = {
              dropped_line: 'Dropped Line',
              missed_cue: 'Missed Cue',
              jammed_flat: 'Jammed Flat',
              torn_hemline: 'Torn Hemline',
              flickering_dimmer: 'Flickering Dimmer',
            };

            const newBug: ActiveFlubBug = {
              id: `flub_${Date.now()}_${Math.random()}`,
              title: titles[chosenCategory],
              category: chosenCategory,
              x: (Math.random() - 0.5) * 8.0,
              y: 0.8,
              z: -4.0 + (Math.random() - 0.5) * 3.0,
              timeRemaining: 100,
              acumenReward: Math.floor(Math.random() * 3 + 1),
            };
            setActiveFlubs((f) => [...f, newBug]);
          }

          if (next >= 100) {
            gameAudio.playLevelUpStinger();
            setPhase('TECH_WEEK');
            setTechWeekTimeLeft(100);
            setCrisisTriggered(false);
            setActiveNotification('Entering Tech Week! Click red markers on stage to squash flubs for 💡 Acumen.');
            return 0;
          }
          return next;
        });
      } else if (phase === 'TECH_WEEK') {
        setTechWeekTimeLeft((t) => {
          const nextTime = Math.max(0, t - 1.2 * speedMult);

          if (nextTime <= 50 && !crisisTriggered) {
            setCrisisTriggered(true);
            const chosenCrisis = THEATRICAL_CRISES[Math.floor(Math.random() * THEATRICAL_CRISES.length)];
            setActiveCrisis(chosenCrisis);
            setIsCrisisModalOpen(true);
          }

          const jasmine = staff.find((s) => s.id === 'jasmine_sm');
          if (jasmine && activeFlubs.length > 0 && Math.random() < 0.45 * speedMult) {
            const targetFlub = activeFlubs[0];
            handleSquashFlub(targetFlub.id, true);
          }

          if (nextTime <= 0) {
            handleOpenShow();
          }
          return nextTime;
        });
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase, isSimulationPaused, gameState.status, simSpeed, staff, volunteers, assignedCastIds, sliders, hasMakeupVanity, hasAcousticPanels, hasElectricRadiator, hasSnackTable, activeFlubs, crisisTriggered, isScottishCurseActive, scenicCheckpointNotified, techCheckpointNotified, facilityAudit]);

  // Squash a Flub Bug
  const handleSquashFlub = (flubId: string, byStaff = false) => {
    const flub = activeFlubs.find((f) => f.id === flubId);
    if (!flub) return;

    gameAudio.playCoinPickup();
    const acumenReward = flub.acumenReward;
    setAcumen((a) => a + acumenReward);
    setActiveFlubs((prev) => prev.filter((f) => f.id !== flubId));
    setProductionStats((ps) => ({
      ...ps,
      activeFlubs: Math.max(0, ps.activeFlubs - 1),
      flubsCleared: ps.flubsCleared + 1,
    }));

    const bubble: FloatingPointItem = {
      id: `flub_acumen_${Date.now()}`,
      type: 'acumen',
      text: `+${acumenReward} 💡 Acumen!`,
      color: '#38bdf8',
      x: flub.x,
      y: flub.y + 1.2,
      z: flub.z,
    };
    setFloatingBubbles((b) => [...b.slice(-5), bubble]);
  };

  // Handle Dynamic Theatrical Crisis Choice in Tech Week
  const handleResolveCrisis = (choice: 'A' | 'B') => {
    if (!activeCrisis) {
      setIsCrisisModalOpen(false);
      return;
    }
    setIsCrisisModalOpen(false);

    if (choice === 'A') {
      if (funds < activeCrisis.optionA.cost) {
        gameAudio.playErrorBuzz();
        setActiveNotification(`Insufficient capital for ${activeCrisis.optionA.label}! Forced to choose Option B.`);
        handleResolveCrisis('B');
        return;
      }
      gameAudio.playPowerupChime();
      setFunds((f) => f - activeCrisis.optionA.cost);
      if (activeCrisis.optionA.statBonus) {
        setProductionStats((ps) => ({
          ...ps,
          scenic: ps.scenic + (activeCrisis.optionA.statBonus?.scenic || 0),
          lighting: ps.lighting + (activeCrisis.optionA.statBonus?.lighting || 0),
          acting: ps.acting + (activeCrisis.optionA.statBonus?.acting || 0),
          costumes: ps.costumes + (activeCrisis.optionA.statBonus?.costumes || 0),
        }));
      }
      if (activeCrisis.optionA.acumenReward) {
        setAcumen((a) => a + activeCrisis.optionA.acumenReward!);
      }
      setActiveNotification(`Crisis Resolved: ${activeCrisis.optionA.label}`);
    } else {
      gameAudio.playErrorBuzz();
      setProductionStats((ps) => ({
        ...ps,
        activeFlubs: ps.activeFlubs + activeCrisis.optionB.flubsAdded,
      }));
      setActiveNotification(`Compromise Taken: ${activeCrisis.optionB.label} (+${activeCrisis.optionB.flubsAdded} Flubs)`);
    }
  };

  // Phase 5: Launch Opening Night & Calculate Critic Reviews
  const handleOpenShow = () => {
    if (!selectedScript) return;
    gameAudio.playVictoryFanfare();

    const targetMetrics = selectedScript.targetMetrics;
    const remainingFlubs = activeFlubs.length;
    const flubPenalty = remainingFlubs * 1.5;

    // Check town rumor synergy
    const hasRumorSynergy = currentTownRumor.favoredGenre === selectedScript.genre;
    const rumorBonus = hasRumorSynergy ? 1.0 : 0;
    const archBonus = hasProsceniumArch ? 1.2 : 0;

    const actingScore = Math.max(1, Math.min(10, Math.floor(((productionStats.acting - flubPenalty) / targetMetrics.acting) * 10 + rumorBonus)));
    const stagingScore = Math.max(1, Math.min(10, Math.floor((productionStats.scenic / targetMetrics.scenic) * 10 + archBonus)));
    const visualsScore = Math.max(1, Math.min(10, Math.floor((productionStats.costumes / targetMetrics.costumes) * 10)));
    const pacingScore = Math.max(1, Math.min(10, Math.floor(((productionStats.lighting - flubPenalty * 0.5) / targetMetrics.lighting) * 10)));
    const totalScore = actingScore + stagingScore + visualsScore + pacingScore;
    const isInducted = totalScore >= 32;

    const reviews: CriticReview[] = [
      {
        criticName: 'Harold Finch',
        publication: 'The Oakwood Gazette',
        specialty: 'Acting & Heart',
        score: actingScore,
        comment: actingScore >= 8 ? 'Electrifying emotional chemistry on stage!' : 'Ensemble stumbled on several dramatic beats.',
        stampColor: actingScore >= 8 ? '#10b981' : '#f59e0b',
      },
      {
        criticName: 'Brenda Cross',
        publication: 'Tri-County Arts Dispatch',
        specialty: 'Staging & Sets',
        score: stagingScore,
        comment: stagingScore >= 8 ? 'Stunning scenic craft in such an intimate room!' : 'Cardboard flats wobbled during entrances.',
        stampColor: stagingScore >= 8 ? '#10b981' : '#f59e0b',
      },
      {
        criticName: 'Evelyn Montgomery',
        publication: 'Stage & Spotlight Weekly',
        specialty: 'Visuals & Costumes',
        score: visualsScore,
        comment: visualsScore >= 8 ? 'Splendid wardrobe and period-accurate props!' : 'Costumes felt somewhat rushed and generic.',
        stampColor: visualsScore >= 8 ? '#10b981' : '#f59e0b',
      },
      {
        criticName: 'Miles Standish',
        publication: 'Downtown Theater Review',
        specialty: 'Pacing & Tech',
        score: pacingScore,
        comment: remainingFlubs === 0 ? 'Spotless tech cues and immaculate lighting!' : `Hampered by ${remainingFlubs} unresolved stage flubs.`,
        stampColor: pacingScore >= 8 ? '#10b981' : '#ef4444',
      },
    ];

    setReviewScores(reviews);
    setTotalReviewScore(totalScore);
    setIsRepertoireInducted(isInducted);
    setSeasonReviewHistory((h) => [...h, totalScore]);

    // Update Board Approval based on show reception
    setBoardMembers((prev) =>
      prev.map((b) => {
        let delta = totalScore >= 28 ? 5 : -5;
        if (b.preferredGenre === selectedScript.genre) delta += 6;
        if (b.dislikedGenre === selectedScript.genre) delta -= 8;
        return {...b, approvalRating: Math.max(20, Math.min(100, b.approvalRating + delta))};
      })
    );

    if (isInducted && !repertoireCatalog.some((s) => s.id === selectedScript.id)) {
      setRepertoireCatalog((c) => [...c, selectedScript]);
      setPrestige((p) => Math.min(100, p + 15));
      setActiveNotification(`GLORIOUS TRIUMPH! Score of ${totalScore}/40 inducted into Repertoire Hall of Fame!`);
    } else {
      setActiveNotification(`Opening Night complete! Average critic score: ${totalScore}/40.`);
    }

    setPhase('OPENING_REVIEWS');
    handleSelectRoomZone('AUDITORIUM');
  };

  // Launch Box Office Run
  const handleStartBoxOfficeRun = () => {
    gameAudio.playConfirmSelect();
    setPhase('BOX_OFFICE_RUN');
    setRunWeek(1);
    setTotalRunGross(0);
    setTotalRunAttendance(0);
    const initialPriceRatio = ticketPrice / Math.max(1, fairTicketPrice);
    const initialPriceElasticity = initialPriceRatio <= 1.0 ? 1.0 + (1.0 - initialPriceRatio) * 0.35 : Math.max(0.12, 1.0 - (initialPriceRatio - 1.0) * 1.6);
    setWeeklyOccupancy(Math.min(1.0, (totalReviewScore / 40) * initialPriceElasticity));
    handleSelectRoomZone('AUDITORIUM');
  };

  // Box Office Run Weekly Tick Loop with Elasticity & Amenities
  useEffect(() => {
    if (phase !== 'BOX_OFFICE_RUN' || isSimulationPaused || gameState.status !== 'PLAYING') return;

    const interval = setInterval(() => {
      // Elasticity & decay
      const priceRatio = ticketPrice / Math.max(1, fairTicketPrice);
      const priceElasticity = priceRatio <= 1.0
        ? 1.0 + (1.0 - priceRatio) * 0.35
        : Math.max(0.12, 1.0 - (priceRatio - 1.0) * 1.6);

      const decayFactor = Math.pow(0.85, runWeek - 1);
      const currentOccupancy = Math.min(1.0, Math.max(0.08, (totalReviewScore / 40) * decayFactor * priceElasticity));
      setWeeklyOccupancy(currentOccupancy);

      const patrons = Math.floor(totalSeatCapacity * currentOccupancy);
      const ticketRevenue = patrons * ticketPrice;

      let concessionPerPatron = 0;
      if (hasCocktailBar) concessionPerPatron = 4.5;
      else if (hasSnackTable) concessionPerPatron = 1.5;
      const concessionRevenue = patrons * concessionPerPatron;

      const weeklyRent = getConfig('storefrontRentWeekly');
      const payroll = staff.reduce((acc, s) => acc + s.salaryPerWeek, 0);
      const totalWeeklyExpenses = weeklyRent + payroll;
      const netWeekRevenue = ticketRevenue + concessionRevenue - totalWeeklyExpenses;

      setFunds((f) => f + netWeekRevenue);
      setWeeklyGross(ticketRevenue);
      setWeeklyConcessions(concessionRevenue);
      setTotalRunGross((tg) => tg + ticketRevenue + concessionRevenue);
      setTotalRunAttendance((ta) => ta + patrons);
      setRunWeek((w) => w + 1);
      setWeek((w) => (w % 4) + 1);

      if (ticketRevenue + concessionRevenue > 0) {
        gameAudio.playCoinPickup();
      }

      if (currentOccupancy < 0.15 && runWeek > 4) {
        handleStrikeSet();
      }
    }, 1500 / simSpeed);

    return () => clearInterval(interval);
  }, [phase, isSimulationPaused, gameState.status, simSpeed, runWeek, totalReviewScore, totalSeatCapacity, ticketPrice, fairTicketPrice, hasCocktailBar, hasSnackTable, staff]);

  // Strike Set & Close Show
  const handleStrikeSet = () => {
    gameAudio.playPowerupChime();
    setPhase('SEASON_END');
    setActiveNotification('Show run concluded. Midnight strike executed and stage cleared.');
  };

  // Advance Season or Trigger Annual Municipal Arts Grant & Board Gala
  const handleAdvanceSeason = () => {
    gameAudio.playConfirmSelect();
    if (seasonIndex < 3) {
      setSeasonIndex((s) => s + 1);
      setMonth((m) => m + 3);
      setPhase('SEASON_IDLE');
      setSelectedScript(null);
      setActiveFlubs([]);
      handleSelectRoomZone('OVERVIEW');
      setActiveNotification(`Welcome to ${SEASONS[seasonIndex + 1]}! Check local news rumors in [PRODUCE].`);
    } else {
      gameAudio.playVictoryFanfare();
      const avgReview = seasonReviewHistory.length
        ? Math.round(seasonReviewHistory.reduce((a, b) => a + b, 0) / seasonReviewHistory.length)
        : 26;
      const grantAmount = Math.floor(2500 + avgReview * 120);
      const memberEndowments = boardMembers.map((m) => ({
        member: m,
        payout: Math.floor(m.annualEndowment * (m.approvalRating / 100)),
      }));
      const totalEndowments = memberEndowments.reduce((sum, e) => sum + e.payout, 0);
      const grandTotal = grantAmount + totalEndowments;

      setAnnualGalaReport({
        year: year,
        totalGrant: grantAmount,
        boardEndowments: memberEndowments,
        totalPayout: grandTotal,
        averageSeasonReview: avgReview,
        hallOfFameInductions: repertoireCatalog.length,
      });
    }
  };

  // Claim Annual Board Gala Awards and advance year
  const handleClaimAnnualGala = () => {
    if (!annualGalaReport) return;
    gameAudio.playLevelUpStinger();
    setFunds((f) => f + annualGalaReport.totalPayout);
    setYear((y) => y + 1);
    setSeasonIndex(0);
    setMonth(1);
    setWeek(1);
    setSeasonReviewHistory([]);
    setPhase('SEASON_IDLE');
    setSelectedScript(null);
    setAnnualGalaReport(null);
    handleSelectRoomZone('OVERVIEW');
    setActiveNotification(`🎉 Annual Awards Gala Concluded! $${annualGalaReport.totalPayout.toLocaleString()} endowment & grant deposited!`);
  };

  // Hold Open Community Auditions
  const handleHoldAuditions = () => {
    const cashCost = 100;
    const acumenCost = 10;
    if (funds < cashCost && acumen < acumenCost) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Need $100 cash or 10 💡 Acumen to advertise open auditions in town!');
      return;
    }

    gameAudio.playPowerupChime();
    if (funds >= cashCost) {
      setFunds((f) => f - cashCost);
    } else {
      setAcumen((a) => a - acumenCost);
    }

    const newApplicants = generateAuditionCandidates(3);
    setVolunteers((prev) => [...prev, ...newApplicants]);
    setActiveNotification(`📢 3 new performers arrived at Unit 12B for auditions! Review them below.`);
  };

  // Acumen Pep Talk
  const handleAcumenPepTalk = (actorId: string) => {
    const cost = 5;
    if (acumen < cost) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Need 5 💡 Acumen for a one-on-one coaching session!');
      return;
    }
    gameAudio.playPowerupChime();
    setAcumen((a) => a - cost);
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === actorId ? {...v, morale: Math.min(100, v.morale + 20), memorization: Math.min(10, v.memorization + 1)} : v
      )
    );
    const target = volunteers.find((v) => v.id === actorId);
    setActiveNotification(`Coached ${target?.name}! Morale boosted to ${Math.min(100, (target?.morale || 80) + 20)}%.`);
  };

  // Host Board Champagne Reception in Finances
  const handleHostBoardReception = () => {
    if (funds < 200 || acumen < 15) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Need $200 cash and 15 💡 Acumen to host a Champagne & Cheese Board Reception!');
      return;
    }
    gameAudio.playVictoryFanfare();
    setFunds((f) => f - 200);
    setAcumen((a) => a - 15);
    setBoardMembers((prev) =>
      prev.map((b) => ({...b, approvalRating: Math.min(100, b.approvalRating + 10)}))
    );
    setActiveNotification('🍾 Board of Directors Champagne Reception was a splendid success! (+10% Approval across all trustees)');
  };

  // Stage Encore Revival
  const handleReviveRepertoireScript = (script: ScriptDef) => {
    gameAudio.playPowerupChime();
    setSelectedScript(script);
    const topVolunteers = [...volunteers]
      .sort((a, b) => b.stagePresence + b.memorization - (a.stagePresence + a.memorization))
      .slice(0, 3)
      .map((v) => v.id);
    setAssignedCastIds(topVolunteers);
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === topVolunteers[0]) return {...v, assignedRole: 'Lead 1'};
        if (v.id === topVolunteers[1]) return {...v, assignedRole: 'Lead 2'};
        if (v.id === topVolunteers[2]) return {...v, assignedRole: 'Ensemble'};
        return {...v, assignedRole: 'None'};
      })
    );
    setPhase('PROPOSAL');
    setActiveNotification(`Encore Revival of "${script.title}" launched! $0 licensing royalties + 15% starting excitement!`);
  };

  // Room Zoning Painter: Paint tile coordinate with selected functional room type
  const handleZoneTile = (gridX: number, gridZ: number) => {
    if (!activeZoningBrush) return;
    const key = `${gridX}_${gridZ}`;
    setTileRooms((prev) => ({
      ...prev,
      [key]: activeZoningBrush,
    }));
    gameAudio.playCrispClick();
  };

  // Quick Action: Apply Recommended Blueprint (Spatial Segregation & Acoustic Buffers)
  const handleApplyRecommendedBlueprint = () => {
    setTileRooms(createDefaultTileRooms());
    gameAudio.playVictoryFanfare();
    setActiveNotification('📐 Recommended Blueprint Applied: Scene Shop, Wardrobe Loft, Rehearsal Studio, Green Room, Wings & Restrooms zoned!');
  };

  // Custodial Sweep Action: Clear sawdust, makeup debris, and aisle soda spills
  const handleCustodialSweep = () => {
    const cost = 25;
    if (funds < cost) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Need $25 to fund an emergency custodial sweep & mop!');
      return;
    }
    gameAudio.playCrispClick();
    setFunds((f) => f - cost);
    setActiveNotification('🧹 Custodial Sweep complete! Sawdust, makeup debris, and aisle soda spills cleared! (+15% Sanitary Inspection)');
  };

  // Reset all tiles to Generic Hall
  const handleClearAllZones = () => {
    setTileRooms({});
    gameAudio.playCrispClick();
    setActiveNotification('⬜ All floor tiles reverted to Generic Multi-Use Stage / Hall.');
  };

  // Build Mode: Place or Remove Tile on Grid
  const handleTileClick = (gridX: number, gridZ: number) => {
    // If a zoning brush is active, route click to room zoning painter
    if (activeZoningBrush) {
      handleZoneTile(gridX, gridZ);
      return;
    }
    if (!isBuildMode) return;
    const existingIndex = gridItems.findIndex((i) => i.x === gridX && i.z === gridZ);
    if (existingIndex >= 0) {
      const existing = gridItems[existingIndex];
      gameAudio.playCrispClick();
      setFunds((f) => f + Math.floor(existing.price * 0.75));
      setGridItems((prev) => prev.filter((_, idx) => idx !== existingIndex));
      setActiveNotification(`Removed ${existing.name} (refunded $${Math.floor(existing.price * 0.75)})`);
    } else {
      const catalogItem = FURNITURE_CATALOG.find((f) => f.id === selectedBuildItem);
      if (!catalogItem) return;
      if (funds < catalogItem.cost) {
        gameAudio.playErrorBuzz();
        setActiveNotification(`Insufficient capital! ${catalogItem.name} costs $${catalogItem.cost}.`);
        return;
      }
      gameAudio.playFootstepWood();
      setFunds((f) => f - catalogItem.cost);
      const zone = gridZ < 6 ? 'BACKSTAGE' : gridZ < 12 ? 'STAGE' : 'AUDITORIUM';
      const newItem: GridTileItem = {
        id: `placed_${Date.now()}_${Math.random()}`,
        itemId: catalogItem.id,
        name: catalogItem.name,
        x: gridX,
        z: gridZ,
        zone: zone,
        price: catalogItem.cost,
      };
      setGridItems((prev) => [...prev, newItem]);
      setActiveNotification(`Installed ${catalogItem.name} at grid (${gridX}, ${gridZ})`);
    }
  };

  // Drag-to-Box Room Construction Event Handlers (Mad Game Tycoon style)
  const handleDragStart = (gx: number, gz: number) => {
    if (!isBuildMode && !activeZoningBrush) return;
    const targetRoomType = activeZoningBrush || 'SCENE_SHOP';
    setDragBox({
      start: { gx, gz },
      current: { gx, gz },
      isDragging: true,
      roomType: targetRoomType,
    });
  };

  const dragBoxRef = useRef(dragBox);
  dragBoxRef.current = dragBox;
  const fundsRef = useRef(funds);
  fundsRef.current = funds;

  const handleDragMove = (gx: number, gz: number) => {
    setDragBox((prev) => {
      if (!prev || !prev.isDragging) return prev;
      if (prev.current.gx === gx && prev.current.gz === gz) return prev;
      return {
        ...prev,
        current: { gx, gz },
      };
    });
  };

  const handleDragEnd = useCallback(() => {
    const currentDrag = dragBoxRef.current;
    if (!currentDrag || !currentDrag.isDragging) return;
    const currentFunds = fundsRef.current;

    const minX = Math.min(currentDrag.start.gx, currentDrag.current.gx);
    const maxX = Math.max(currentDrag.start.gx, currentDrag.current.gx);
    const minZ = Math.min(currentDrag.start.gz, currentDrag.current.gz);
    const maxZ = Math.max(currentDrag.start.gz, currentDrag.current.gz);
    const wTiles = maxX - minX + 1;
    const dTiles = maxZ - minZ + 1;
    const totalTiles = wTiles * dTiles;
    const cost = totalTiles * 25;

    const minReq = ROOM_MIN_DIMENSIONS[currentDrag.roomType] || { minW: 2, minD: 2 };
    const isValid = wTiles >= minReq.minW && dTiles >= minReq.minD;
    const canAfford = currentFunds >= cost;

    if (isValid && canAfford) {
      gameAudio.playVictoryFanfare();
      setFunds((f) => f - cost);
      setTileRooms((prev) => {
        const updated = { ...prev };
        for (let x = minX; x <= maxX; x++) {
          for (let z = minZ; z <= maxZ; z++) {
            updated[`${x}_${z}`] = currentDrag.roomType;
          }
        }
        return updated;
      });
      setActiveNotification(
        `📐 Constructed ${ROOM_DEFINITIONS[currentDrag.roomType]?.name || currentDrag.roomType} (${wTiles}×${dTiles}, ${totalTiles} tiles, -$${cost})`
      );
    } else if (!isValid) {
      gameAudio.playErrorBuzz();
      setActiveNotification(
        `⚠️ Invalid room size! ${ROOM_DEFINITIONS[currentDrag.roomType]?.name || currentDrag.roomType} requires at least ${minReq.minW}×${minReq.minD} tiles.`
      );
    } else if (!canAfford) {
      gameAudio.playErrorBuzz();
      setActiveNotification(`⚠️ Insufficient capital! Room construction costs $${cost} ($25/tile).`);
    }

    setDragBox(null);
  }, []);

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (dragBoxRef.current?.isDragging) {
        handleDragEnd();
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [handleDragEnd]);

  // Staff Training with Acumen
  const handleTrainStaff = (staffId: string, attr: 'vision' | 'composure' | 'carpentry' | 'speed') => {
    const cost = 15;
    if (acumen < cost) {
      gameAudio.playErrorBuzz();
      setActiveNotification('Need 15 💡 Acumen to fund masterclass training! Squash flubs in Tech Week.');
      return;
    }
    gameAudio.playLevelUpStinger();
    setAcumen((a) => a - cost);
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            [attr]: Math.min(10, s[attr] + 1),
          };
        }
        return s;
      })
    );
    const targetStaff = staff.find((s) => s.id === staffId);
    setActiveNotification(`${targetStaff?.name} boosted ${attr.toUpperCase()} to level ${Math.min(10, (targetStaff?.[attr] || 0) + 1)}!`);
  };

  // 3D Canvas Pointer Drag & Wheel Zoom Controls
  const isOrbitDragging = useRef(false);
  const orbitPointerStart = useRef({ x: 0, y: 0, rotY: 0, panZ: 0 });

  const handleOrbitPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBuildMode) return;
    if ((e.target as HTMLElement).closest('button, select, input, a')) return;
    isOrbitDragging.current = true;
    orbitPointerStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: cameraOrbit.rotY,
      panZ: cameraOrbit.panZ,
    };
  };

  const handleOrbitPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isOrbitDragging.current) return;
    const dx = e.clientX - orbitPointerStart.current.x;
    const dy = e.clientY - orbitPointerStart.current.y;
    setCameraOrbit((prev) => ({
      ...prev,
      rotY: orbitPointerStart.current.rotY + dx * 0.007,
      panZ: Math.max(-10, Math.min(15, orbitPointerStart.current.panZ - dy * 0.02)),
    }));
  };

  const handleOrbitPointerUp = () => {
    isOrbitDragging.current = false;
  };

  const handleOrbitWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setCameraOrbit((c) => ({
      ...c,
      zoom: Math.max(0.45, Math.min(1.8, c.zoom + e.deltaY * 0.0008)),
    }));
  };

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col bg-slate-950 text-white font-sans select-none">
      <BackgroundMusic
        url={getConfig('backgroundMusicUrl')}
        isPlaying={gameState.status === 'PLAYING'}
        isMuted={isMusicMuted}
      />

      {/* TOP COMPACT RIBBON HUD */}
      <header className="w-full bg-slate-900/95 border-b border-amber-500/40 px-3 py-1.5 flex flex-wrap items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-3 text-xs md:text-sm font-semibold">
          {/* Brand Emblem & Name */}
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <div
              className="w-6 h-6 rounded flex items-center justify-center border shadow-sm"
              style={{ backgroundColor: brandConfig.primaryColor, borderColor: '#f59e0b' }}
              title={`Branded Civic Logo: ${brandConfig.logoId}`}
            >
              <CivicLogoIcon logoId={brandConfig.logoId} className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <span className="font-bold text-amber-300 font-serif tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
              {brandConfig.theaterName}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>Y{year}</span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-200">{currentSeason}</span>
            <span className="text-slate-400 font-normal">(Wk {week})</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
            <span className="font-bold text-xs">$</span>
            <span>{funds.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-500/40">
            <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
            <span>{acumen} Acumen</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-yellow-300 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>{prestige} Prestige</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <Armchair className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalSeatCapacity} Seats</span>
          </div>

          {/* Civic Inspector Button */}
          <button
            onClick={handleCallCivicInspector}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
            title="Inspect Building: Evaluate against 8 Municipal Codes and Claim $5,000 Grant"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Civic Inspector</span>
          </button>

          {/* Ghost Light Status Button */}
          <button
            onClick={handleToggleGhostLight}
            className={`hidden lg:flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold cursor-pointer transition-colors ${
              isGhostLightLit
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Ghost Light: center-stage safety bulb protecting against industrial mishaps and spirits"
          >
            <Flame className={`w-3.5 h-3.5 ${isGhostLightLit ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{isGhostLightLit ? 'Ghost Light: Lit' : 'Ghost Light: Dark'}</span>
          </button>

          {/* Scottish Play Curse indicator */}
          {isScottishCurseActive && (
            <button
              onClick={handleCleanseCurse}
              className="px-2 py-0.5 bg-rose-900/80 border border-rose-500 text-rose-200 text-[11px] font-bold rounded animate-pulse cursor-pointer"
              title="Click to spin 3 times outside and spit to cleanse curse!"
            >
              ⚠️ Curse Active! Cleanse
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {gameState.status === 'PLAYING' && (
            <>
              <button
                onClick={() => setSimSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : s === 4 ? 8 : 1))}
                className="px-2.5 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded text-amber-300 font-black flex items-center gap-1 cursor-pointer"
                title="Simulation Speed Fast Forward"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{simSpeed}x FF</span>
              </button>
              <button
                onClick={() => setIsSimulationPaused((p) => !p)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-200 cursor-pointer"
                title={isSimulationPaused ? 'Resume' : 'Pause'}
              >
                {isSimulationPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
              </button>
            </>
          )}

          <button
            onClick={() => {
              gameAudio.playCrispClick();
              setIsGameMenuOpen(true);
            }}
            data-testid="game-menu-button"
            className="px-3 py-1 text-xs md:text-sm bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md shadow flex items-center gap-1.5 min-w-[48px] min-h-[32px] cursor-pointer"
          >
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* 3D PLAYHOUSE VIEWPORT CONTAINER */}
      <div
        className="w-full min-h-0 relative bg-slate-950 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing flex-[1_1_50%]"
        onPointerDown={handleOrbitPointerDown}
        onPointerMove={handleOrbitPointerMove}
        onPointerUp={handleOrbitPointerUp}
        onWheel={handleOrbitWheel}
      >
        <Canvas
          shadows
          camera={{
            position: [getConfig('cameraX'), getConfig('cameraY'), getConfig('cameraZ')],
            fov: getConfig('fov'),
          }}
          className="w-full h-full block"
        >
          <Game
            phase={phase}
            phaseProgress={phaseProgress}
            script={selectedScript}
            staff={staff}
            volunteers={volunteers}
            assignedCastIds={assignedCastIds}
            gridItems={gridItems}
            activeFlubs={activeFlubs}
            floatingBubbles={floatingBubbles}
            occupancyRate={weeklyOccupancy}
            isBuildMode={isBuildMode}
            selectedBuildItem={selectedBuildItem}
            cameraOrbit={cameraOrbit}
            heatmapMode={heatmapMode}
            isGhostLightLit={isGhostLightLit}
            tileRooms={tileRooms}
            envMatrix={envMatrix}
            activeZoningBrush={activeZoningBrush}
            brandConfig={brandConfig}
            wallViewMode={wallViewMode}
            labelViewMode={labelViewMode}
            placedStage={placedStage}
            placedWings={placedWings}
            dragBox={dragBox}
            onTileClick={handleTileClick}
            onZoneTile={handleZoneTile}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onSquashFlub={(id) => handleSquashFlub(id, false)}
            onSelectRoom={(rm) => handleSelectRoomZone(rm)}
            facilityAudit={facilityAudit}
          />
        </Canvas>

        {/* Floating Controls Dropdown Pill in Top-Left Corner */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-auto">
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-700/80 shadow-2xl">
            {/* 1. Walls Toggle (Eye): cycles FULL -> CUTAWAY -> DOWN */}
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setWallViewMode((prev) => (prev === 'FULL' ? 'CUTAWAY' : prev === 'CUTAWAY' ? 'DOWN' : 'FULL'));
              }}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              title={`Walls: ${wallViewMode} (Click to cycle Full -> Cutaway -> Down)`}
            >
              <Eye className={`w-4 h-4 ${wallViewMode === 'FULL' ? 'text-amber-400' : wallViewMode === 'CUTAWAY' ? 'text-sky-400' : 'text-slate-500'}`} />
              <span className="sr-only">Toggle Walls</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

            {/* 2. Layers Toggle (Layers): opens tiny popover strip with 5 heatmap icons */}
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setIsHeatmapMenuOpen((p) => !p);
              }}
              className={`p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer ${
                heatmapMode !== 'NONE' || isHeatmapMenuOpen
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-300 hover:text-amber-300'
              }`}
              title="Heatmap & Environmental Layers"
            >
              <Layers className="w-4 h-4" />
              <span className="sr-only">Heatmap Layers</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

            {/* 3. Center Preset Focus (Focus): resets camera orbit to current room preset */}
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                const preset = ROOM_CAMERA_PRESETS[currentZonePreset] || ROOM_CAMERA_PRESETS.OVERVIEW;
                setCameraOrbit({
                  rotY: preset.rotY,
                  zoom: preset.zoom,
                  panX: preset.panX,
                  panZ: preset.panZ,
                });
                setActiveNotification(`Camera centered on ${preset.label}`);
              }}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              title={`Reset Camera to ${ROOM_CAMERA_PRESETS[currentZonePreset]?.label || 'Preset'}`}
            >
              <Focus className="w-4 h-4" />
              <span className="sr-only">Center Camera</span>
            </button>
          </div>

          {/* Tiny Popover Strip with 5 Heatmap Icons */}
          {isHeatmapMenuOpen && (
            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('NONE');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'NONE' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Normal View (Layers Off)"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
              {/* 1. Thermal */}
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('THERMAL');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'THERMAL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-300'
                }`}
                title="Thermal Heatmap (HVAC Temperature Comfort)"
              >
                <Thermometer className="w-3.5 h-3.5" />
              </button>
              {/* 2. Acoustic */}
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('ACOUSTIC');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'ACOUSTIC' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Acoustic Decibel Heatmap (Noise Isolation)"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              {/* 3. Cleanliness / Sanitation */}
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('SANITATION');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'SANITATION' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="Sanitation & Cleanliness Heatmap"
              >
                <Sparkle className="w-3.5 h-3.5" />
              </button>
              {/* 4. Aesthetic Quality Aura */}
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('AESTHETIC');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'AESTHETIC' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
                }`}
                title="Aesthetic Quality Aura"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              {/* 5. Functional Zoning */}
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setHeatmapMode('ZONING');
                  setIsBuildMode(true);
                  setActiveTab('BUILD');
                  setBuildSubTab('ZONING');
                  setIsHeatmapMenuOpen(false);
                }}
                className={`p-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  heatmapMode === 'ZONING' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-purple-300'
                }`}
                title="Room Zoning Blueprint Layer"
              >
                <Building2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Fixed Drag Dimensions HUD Pill (Stitch style) */}
        {dragBox && dragBox.isDragging && (() => {
          const minX = Math.min(dragBox.start.gx, dragBox.current.gx);
          const maxX = Math.max(dragBox.start.gx, dragBox.current.gx);
          const minZ = Math.min(dragBox.start.gz, dragBox.current.gz);
          const maxZ = Math.max(dragBox.start.gz, dragBox.current.gz);
          const wTiles = maxX - minX + 1;
          const dTiles = maxZ - minZ + 1;
          const totalTiles = wTiles * dTiles;
          const cost = totalTiles * 25;
          const roomName = ROOM_DEFINITIONS[dragBox.roomType]?.name || dragBox.roomType;

          return (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-bold pointer-events-none z-30 shadow-2xl">
              {roomName}: {wTiles} × {dTiles} ({totalTiles} tiles) • ${cost}
            </div>
          );
        })()}

        {/* Floating Toast Notification */}
        {activeNotification && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-md bg-slate-900/95 border border-amber-500/70 text-amber-200 text-xs px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in duration-150">
            <span>📢</span>
            <span>{activeNotification}</span>
            <button
              onClick={() => setActiveNotification(null)}
              className="ml-auto text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TECH WEEK FLUB SQUASHING DASHBOARD OVERLAY */}
        {phase === 'TECH_WEEK' && (
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur p-3 rounded-xl border-2 border-rose-500 shadow-2xl z-20 min-w-[220px] pointer-events-auto">
            <div className="flex items-center justify-between text-xs font-black text-rose-400 border-b border-slate-700 pb-1">
              <span className="flex items-center gap-1">
                <Wrench className="w-4 h-4 text-rose-400 animate-spin" />
                TECH WEEK (FLUB SQUASHING)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold bg-rose-950/60 p-1.5 rounded border border-rose-500/40">
              <span>Active Flub Bugs:</span>
              <span className="text-sm font-black text-rose-300">{activeFlubs.length} 🐛</span>
            </div>
            <div className="text-[11px] text-slate-300 italic">
              Click red markers on stage to squash flubs for 💡 Acumen, or let Jasmine Reed clear them!
            </div>
            <button
              onClick={handleOpenShow}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>OPEN SHOW NIGHT!</span>
            </button>
          </div>
        )}
      </div>

      {/* DEDICATED MANAGEMENT BOTTOM UI CONSOLE */}
      {gameState.status === 'PLAYING' && (
        <div className="w-full bg-slate-900/95 border-t border-slate-700 z-30 flex flex-col max-h-[45vh] overflow-hidden">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-slate-950 border-b border-slate-800 px-2 pt-1 gap-1">
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setActiveTab('PRODUCE');
                setIsBuildMode(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PRODUCE'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 shadow'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>[PRODUCE]</span>
            </button>
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setActiveTab('BUILD');
                setIsBuildMode(true);
                handleSelectRoomZone('AUDITORIUM');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'BUILD'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 shadow'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>[BUILD]</span>
            </button>
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setActiveTab('CAST_CREW');
                setIsBuildMode(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'CAST_CREW'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 shadow'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>[CAST/CREW]</span>
            </button>
            <button
              onClick={() => {
                gameAudio.playCrispClick();
                setActiveTab('FINANCES');
                setIsBuildMode(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'FINANCES'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 shadow'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>[GOVERNANCE & LEDGER]</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="p-2.5 md:p-3 overflow-y-auto flex-1 scroll-smooth">
            {/* TAB 1: [PRODUCE] */}
            {activeTab === 'PRODUCE' && (
              <div className="flex flex-col gap-2">
                {/* Town Gazette Rumor Banner */}
                <div className="bg-amber-950/40 border border-amber-500/40 p-2 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold uppercase text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded">
                      Town Gazette Rumor ({currentSeason})
                    </span>
                    <span className="text-stone-200">{currentTownRumor.headline}</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-mono font-bold">
                    Favors: {currentTownRumor.favoredGenre} (+25% Buzz)
                  </span>
                </div>

                {phase === 'SEASON_IDLE' && (
                  <div className="flex flex-col gap-3">
                    {/* Repertoire Hall of Fame (Encore Revivals) */}
                    {repertoireCatalog.length > 0 && (
                      <div className="bg-amber-950/50 border border-amber-500/60 p-2.5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-400" />
                            REPERTOIRE HALL OF FAME (ENCORE REVIVALS - $0 ROYALTIES!)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            +15% Starting Buzz & Nostalgia
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {repertoireCatalog.map((repScript) => (
                            <div
                              key={`rep_${repScript.id}`}
                              onClick={() => handleReviveRepertoireScript(repScript)}
                              className="bg-slate-900/90 hover:bg-slate-800 p-2 rounded-lg border border-amber-500/50 hover:border-amber-300 cursor-pointer flex flex-col justify-between shadow transition-transform hover:-translate-y-0.5"
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                                  <span>{repScript.title}</span>
                                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                                    CLASSIC
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">{repScript.genre}</span>
                                <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 italic">
                                  {repScript.description}
                                </p>
                              </div>
                              <button className="mt-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded cursor-pointer">
                                STAGE ENCORE REVIVAL ($0)
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Script Licensing Library */}
                    <div>
                      <div className="text-xs md:text-sm font-bold text-amber-400 mb-1 flex items-center justify-between">
                        <span>Choose Script to License ({currentSeason} Season):</span>
                        <span className="text-[10px] text-slate-400">Match town rumor genre for +25% attendance</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {SCRIPT_LIBRARY.map((script) => {
                          const isRumorFavored = script.genre === currentTownRumor.favoredGenre;
                          return (
                            <div
                              key={script.id}
                              onClick={() => handleChooseScript(script)}
                              className={`p-2.5 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                                isRumorFavored
                                  ? 'bg-amber-950/30 border-amber-500/70 hover:border-amber-400 ring-1 ring-amber-500/30'
                                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-amber-400'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                                  <span>{script.title}</span>
                                  <span className="text-[10px] text-sky-400 bg-sky-950 px-1 rounded">
                                    {script.genre}
                                  </span>
                                </div>
                                {isRumorFavored && (
                                  <div className="text-[9px] font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                                    <span>🔥 Town Gazette Buzz (+25%)</span>
                                  </div>
                                )}
                                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                                  {script.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/60 text-[10px]">
                                <span className="text-slate-400">Target: {script.targetDemographic}</span>
                                <span className="text-emerald-400 font-bold">${script.baseRoyalty}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'PROPOSAL' && selectedScript && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-2">
                          <span>Director's Proposal: {selectedScript.title}</span>
                          <span className="text-[10px] text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40 font-mono">
                            Genre: {selectedScript.genre}
                          </span>
                        </span>
                        <div className="text-[11px] text-slate-300 flex items-center gap-3 mt-0.5">
                          <span>
                            Points Left:{' '}
                            <strong className="text-amber-400 font-mono">
                              {20 - (sliders.actingHeart + sliders.setsScenery + sliders.costumesProps + sliders.lightingSound)}
                            </strong>{' '}
                            / 20
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-300">
                            Demands: Acting ({selectedScript.targetMetrics.acting}) • Sets ({selectedScript.targetMetrics.scenic}) • Costumes ({selectedScript.targetMetrics.costumes}) • Tech ({selectedScript.targetMetrics.lighting})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSliders({ actingHeart: 5, setsScenery: 5, costumesProps: 5, lightingSound: 5 })}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-600 cursor-pointer"
                        >
                          Balance (5/5/5/5)
                        </button>
                        <button
                          onClick={() => {
                            if (selectedScript.genre === 'Musical') {
                              setSliders({ actingHeart: 6, setsScenery: 4, costumesProps: 6, lightingSound: 4 });
                            } else {
                              setSliders({ actingHeart: 7, setsScenery: 4, costumesProps: 4, lightingSound: 5 });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-sky-900/70 hover:bg-sky-800 text-sky-300 text-xs font-bold rounded-lg border border-sky-600/50 cursor-pointer"
                        >
                          Preset Synergy
                        </button>
                        <button
                          onClick={handleStartPreProduction}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs md:text-sm rounded-lg shadow-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start Pre-Production (${selectedScript.baseRoyalty})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Acting & Heart</span>
                          <span className="text-amber-400">{sliders.actingHeart}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={sliders.actingHeart}
                          onChange={(e) => handleSliderChange('actingHeart', Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Sets & Scenery</span>
                          <span className="text-amber-400">{sliders.setsScenery}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={sliders.setsScenery}
                          onChange={(e) => handleSliderChange('setsScenery', Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Costumes & Props</span>
                          <span className="text-amber-400">{sliders.costumesProps}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={sliders.costumesProps}
                          onChange={(e) => handleSliderChange('costumesProps', Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Lighting & Sound</span>
                          <span className="text-amber-400">{sliders.lightingSound}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={sliders.lightingSound}
                          onChange={(e) => handleSliderChange('lightingSound', Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(phase === 'PRE_PROD_ALPHA' || phase === 'REHEARSAL_BETA') && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
                        {phase === 'PRE_PROD_ALPHA' ? 'Alpha: Pre-Production & Fabrication' : 'Beta: Cast Rehearsals'}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">{Math.floor(phaseProgress)}% Complete</span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-150"
                        style={{width: `${phaseProgress}%`}}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                      <div className="bg-sky-950/60 p-1.5 rounded border border-sky-500/30 flex justify-between">
                        <span>🎭 Acting/Heart:</span>
                        <span>{productionStats.acting}</span>
                      </div>
                      <div className="bg-amber-950/60 p-1.5 rounded border border-amber-500/30 flex justify-between">
                        <span>🪵 Scenic (40% Check):</span>
                        <span>{productionStats.scenic}</span>
                      </div>
                      <div className="bg-emerald-950/60 p-1.5 rounded border border-emerald-500/30 flex justify-between">
                        <span>👗 Costumes:</span>
                        <span>{productionStats.costumes}</span>
                      </div>
                      <div className="bg-yellow-950/60 p-1.5 rounded border border-yellow-500/30 flex justify-between">
                        <span>💡 Tech (80% Check):</span>
                        <span>{productionStats.lighting}</span>
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'OPENING_REVIEWS' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-amber-400">
                          CRITIC SCORECARDS (Total: {totalReviewScore} / 40)
                        </span>
                        {isRepertoireInducted && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow animate-bounce">
                            🏆 REPERTOIRE INDUCTED! (32+)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleStartBoxOfficeRun}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs md:text-sm rounded-lg shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>START BOX OFFICE RUN</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {reviewScores.map((rev, idx) => (
                        <div key={idx} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                              <span>{rev.publication}</span>
                              <span className="text-base font-black" style={{color: rev.stampColor}}>
                                {rev.score}/10
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-300 font-semibold">{rev.specialty}</span>
                            <p className="text-[11px] text-slate-300 italic mt-1 leading-snug">
                              "{rev.comment}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {phase === 'BOX_OFFICE_RUN' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Live Run: {selectedScript?.title} (Week {runWeek})
                        </span>
                        <div className="text-[11px] text-slate-300">
                          Occupancy: <strong className="text-amber-300">{Math.round(weeklyOccupancy * 100)}%</strong> • Ticket Revenue: <strong className="text-emerald-400">${weeklyGross}</strong>
                        </div>
                      </div>
                      <button
                        onClick={handleStrikeSet}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs md:text-sm rounded-lg shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>POST CLOSING NOTICE & STRIKE SET</span>
                      </button>
                    </div>

                    {/* Interactive Ticket Price Elasticity Controller */}
                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">
                          Admission Price: <strong className="text-emerald-400 font-mono text-sm">${ticketPrice}</strong>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Fair Town Value: <strong className="text-amber-300 font-mono">${fairTicketPrice}</strong>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="50"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            ticketPrice <= fairTicketPrice * 0.85
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : ticketPrice <= fairTicketPrice * 1.15
                              ? 'bg-sky-950 text-sky-300 border border-sky-500/50'
                              : ticketPrice <= fairTicketPrice * 1.4
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          }`}
                        >
                          {ticketPrice <= fairTicketPrice * 0.85
                            ? '🔥 Steal of the Town! (High Attendance)'
                            : ticketPrice <= fairTicketPrice * 1.15
                            ? '✅ Fair Price. Steady Crowds'
                            : ticketPrice <= fairTicketPrice * 1.4
                            ? '⚠️ Pricey Ticket. Lower Demand'
                            : '❌ Price Gouging! Rapid Dropoff'}
                        </span>
                        <span className="text-slate-300">
                          Weekly Net:{' '}
                          <strong
                            className={
                              weeklyGross + weeklyConcessions - 540 >= 0
                                ? 'text-emerald-400 font-mono'
                                : 'text-rose-400 font-mono'
                            }
                          >
                            ${(weeklyGross + weeklyConcessions - 540).toLocaleString()}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Gross</span>
                        <div className="text-emerald-400 font-black text-sm">${totalRunGross.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Attendance</span>
                        <div className="text-sky-300 font-black text-sm">{totalRunAttendance} Patrons</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Concession Net</span>
                        <div className="text-amber-300 font-black text-sm">+${weeklyConcessions} / wk</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Weekly Rent + Wages</span>
                        <div className="text-rose-400 font-black text-sm">-$540 / wk</div>
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'SEASON_END' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs md:text-sm font-bold text-amber-400">
                          {currentSeason} Season Concluded!
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Set struck and stored. Ready for the next season production.
                        </p>
                      </div>
                      <button
                        onClick={handleAdvanceSeason}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs md:text-sm rounded-lg shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>{seasonIndex < 3 ? 'NEXT SEASON' : 'COMPLETE YEAR & ATTEND GALA'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: [BUILD] - ISOMETRIC ARCHITECTURE, ROOM ZONING & FACILITY AUDIT */}
            {activeTab === 'BUILD' && (
              <div className="flex flex-col gap-2.5">
                {/* Sub-Tab Navigation Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setBuildSubTab('CATALOG');
                        setActiveZoningBrush(null);
                        setIsBuildMode(true);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        buildSubTab === 'CATALOG'
                          ? 'bg-amber-600 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      <span>1. Architectural Catalog</span>
                    </button>

                    <button
                      onClick={() => {
                        setBuildSubTab('ZONING');
                        setActiveZoningBrush('SCENE_SHOP');
                        setIsBuildMode(true);
                        setHeatmapMode('ZONING');
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        buildSubTab === 'ZONING'
                          ? 'bg-purple-600 text-white shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>2. Room Typing & Zoning</span>
                    </button>

                    <button
                      onClick={() => {
                        setBuildSubTab('AUDIT');
                        setActiveZoningBrush(null);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        buildSubTab === 'AUDIT'
                          ? 'bg-sky-600 text-white shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>3. Facility Optimization Audit</span>
                      {facilityAudit.sharedResourcePenaltyActive && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-300 bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700 font-bold">
                      {totalSeatCapacity} Seats
                    </span>
                    <span className="text-emerald-400 bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700 font-bold">
                      ${funds.toLocaleString()} Funds
                    </span>
                  </div>
                </div>

                {/* SUBTAB 1: ARCHITECTURAL CATALOG */}
                {buildSubTab === 'CATALOG' && (
                  <div className="flex flex-col gap-2">
                    {/* Category Filter Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-slate-400 font-semibold mr-1">Category:</span>
                        {(
                          [
                            {id: 'ALL', label: 'All Items'},
                            {id: 'SEATING', label: '🪑 Seating'},
                            {id: 'ROOM_STRUCTURE', label: '🧱 Walls & Doors'},
                            {id: 'SHOP_EQUIPMENT', label: '⚙️ Shop Apparatus'},
                            {id: 'HVAC_ACOUSTICS', label: '🌡️ HVAC & Acoustics'},
                            {id: 'HOSPITALITY_DECOR', label: '✨ Decor & Sanitation'},
                          ] as const
                        ).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedBuildCategory(cat.id)}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              selectedBuildCategory === cat.id
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      <span className="text-[10px] text-slate-400">
                        Click tile to place • Click existing item to demolish (75% refund)
                      </span>
                    </div>

                    {/* Catalog Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                      {FURNITURE_CATALOG.filter((item) =>
                        selectedBuildCategory === 'ALL' ? true : item.category === selectedBuildCategory
                      ).map((item) => {
                        const isSelected = selectedBuildItem === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedBuildItem(item.id);
                              setActiveZoningBrush(null);
                              setIsBuildMode(true);
                              gameAudio.playCrispClick();
                            }}
                            className={`p-2 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400 shadow-lg'
                                : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-amber-200 truncate">{item.name}</span>
                                <span className="text-emerald-400 font-mono font-bold">${item.cost}</span>
                              </div>
                              <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-tight">
                                {item.description}
                              </p>
                            </div>

                            {/* Stat Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-1 border-t border-slate-700/60 text-[9px]">
                              {item.seatCapacityBonus && (
                                <span className="bg-amber-950 text-amber-300 px-1 py-0.2 rounded font-bold">
                                  +{item.seatCapacityBonus} Seat
                                </span>
                              )}
                              {item.soundAbsorption && (
                                <span className="bg-sky-950 text-sky-300 px-1 py-0.2 rounded font-bold">
                                  -{item.soundAbsorption}dB Sound
                                </span>
                              )}
                              {item.acousticIsolation && (
                                <span className="bg-indigo-950 text-indigo-300 px-1 py-0.2 rounded font-bold">
                                  -{item.acousticIsolation}dB Barrier
                                </span>
                              )}
                              {item.heatOutput && (
                                <span className="bg-rose-950 text-rose-300 px-1 py-0.2 rounded font-bold">
                                  +{item.heatOutput}°F Heat
                                </span>
                              )}
                              {item.coolingOutput && (
                                <span className="bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded font-bold">
                                  -{item.coolingOutput}°F Cool
                                </span>
                              )}
                              {item.aestheticBonus && (
                                <span className="bg-yellow-950 text-yellow-300 px-1 py-0.2 rounded font-bold">
                                  +{item.aestheticBonus} Aura
                                </span>
                              )}
                              {item.comfortRating && item.comfortRating > 0 && (
                                <span className="bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded font-bold">
                                  +{item.comfortRating} Comfort
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: ROOM TYPING & GRID ZONING */}
                {buildSubTab === 'ZONING' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300">Room Zoning Brush:</span>
                        <span className="text-[11px] text-slate-300">
                          {activeZoningBrush
                            ? `Active: ${ROOM_DEFINITIONS[activeZoningBrush].name}`
                            : 'Select a room zone below, then click any grid tile to paint.'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleApplyRecommendedBlueprint}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded shadow flex items-center gap-1 cursor-pointer"
                          title="Apply Storefront 12B Recommended Layout with Scene Shop, Wardrobe Loft, Rehearsal Studio, Green Room, Wings & Restrooms"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Apply Recommended Blueprint</span>
                        </button>
                        <button
                          onClick={handleClearAllZones}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded border border-slate-700 cursor-pointer"
                        >
                          Clear to Generic
                        </button>
                      </div>
                    </div>

                    {/* Stage Archetype Configuration Strip */}
                    <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                          Stage Platform Archetype:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(['BLACK_BOX', 'MAIN_STAGE', 'GRAND_STAGE'] as StageTier[]).map((tier) => {
                            const cfg = STAGE_CONFIGS[tier];
                            const isSelected = placedStage?.tier === tier;
                            return (
                              <button
                                key={tier}
                                onClick={() => {
                                  gameAudio.playCrispClick();
                                  setPlacedStage({
                                    tier,
                                    originX: 0,
                                    originZ: 0,
                                    width: cfg.width,
                                    depth: cfg.depth,
                                    curtainZ: cfg.depth,
                                  });
                                  setActiveNotification(
                                    `Anchored ${cfg.name} (${cfg.width}×${cfg.depth} tiles). Proscenium line facing South!`
                                  );
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300 font-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                }`}
                              >
                                {cfg.name} (${cfg.cost.toLocaleString()})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        House rule: Auditorium Width ≥ {placedStage?.width || 15} tiles
                      </div>
                    </div>

                    {/* Room Brush Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                      {(Object.keys(ROOM_DEFINITIONS) as RoomType[]).map((rType) => {
                        const def = ROOM_DEFINITIONS[rType];
                        const isActive = activeZoningBrush === rType;
                        return (
                          <div
                            key={rType}
                            onClick={() => {
                              setActiveZoningBrush(rType);
                              setIsBuildMode(true);
                              setHeatmapMode('ZONING');
                              gameAudio.playCrispClick();
                            }}
                            className={`p-2 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                              isActive
                                ? 'ring-2 shadow-lg border-white'
                                : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700'
                            }`}
                            style={{
                              backgroundColor: isActive ? def.color : undefined,
                              color: isActive ? def.textColor : undefined,
                            }}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>{def.shortName}</span>
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/30"
                                  style={{backgroundColor: def.color}}
                                />
                              </div>
                              <p
                                className={`text-[9px] mt-1 line-clamp-2 leading-tight ${
                                  isActive ? 'opacity-90' : 'text-slate-400'
                                }`}
                              >
                                {def.multiplierEffect}
                              </p>
                            </div>
                            <div
                              className={`text-[8.5px] mt-2 font-mono font-semibold truncate ${
                                isActive ? 'opacity-80' : 'text-slate-500'
                              }`}
                            >
                              Occupant: {def.primaryOccupant}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: FACILITY & OPTIMIZATION AUDIT */}
                {buildSubTab === 'AUDIT' && (
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1 text-xs">
                    {/* Top Alert Banner if Shared-Resource Interference is active */}
                    {facilityAudit.sharedResourcePenaltyActive ? (
                      <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/70 text-rose-200 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-bold text-xs">
                            ⚠️ Progression Gate: The Shared-Resource Penalty Active!
                          </strong>
                          <p className="text-[11px] text-rose-300 mt-0.5">
                            Sets are being hammered on the main stage while actors rehearse. Auditory Interference (-40% Focus) is quadrupling dropped-line flubs. Build partition walls or zone a dedicated <strong>Scene Shop</strong> and <strong>Rehearsal Studio</strong> to unlock parallel pipelines!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-bold text-xs">
                            ✨ Task Segregation Unlocked: Concurrent Parallel Pipeline Active!
                          </strong>
                          <p className="text-[11px] text-emerald-300 mt-0.5">
                            Rehearsals decoupled from stage construction. Sets framed offstage in Scene Shop without disturbing line memorization. Main stage freed for lighting cues and run-throughs!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 3 Pillar Summary Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {/* Pillar 1: Specialized Room Multipliers */}
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-amber-300 border-b border-slate-700 pb-1 mb-2 flex items-center justify-between">
                            <span>1. Room Multipliers</span>
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <ul className="space-y-1.5 text-[11px]">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Scene Shop Segregated:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.isSceneShopSegregated
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {facilityAudit.isSceneShopSegregated ? '2.5x Build Velocity' : 'Generic Hall (1.0x)'}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Rehearsal Studio:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.isRehearsalStudioActive
                                    ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {facilityAudit.isRehearsalStudioActive ? '2.0x Memorization' : 'Stage Only'}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Wardrobe Loft:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.isWardrobeLoftActive
                                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {facilityAudit.isWardrobeLoftActive ? '2.5x Stitch Speed' : 'Card Table'}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Green Room Sanctuary:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.isGreenRoomActive
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {facilityAudit.isGreenRoomActive ? '3.0x Morale Recovery' : 'Hallway Floor'}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Pillar 2: Pathfinding & Micro-Economy of Time */}
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-sky-300 border-b border-slate-700 pb-1 mb-2 flex items-center justify-between">
                            <span>2. Pathfinding & Intermission</span>
                            <Gauge className="w-3.5 h-3.5 text-sky-400" />
                          </div>
                          <ul className="space-y-1.5 text-[11px]">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Quick-Change Wings:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.quickChangeEliminatesLateCues
                                    ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {facilityAudit.quickChangeEliminatesLateCues ? 'Zero Late Cues' : '12s Transit Delay'}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Intermission Flow Rating:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.intermissionFlowRating >= 80
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : facilityAudit.intermissionFlowRating >= 50
                                    ? 'bg-amber-950 text-amber-300'
                                    : 'bg-rose-950 text-rose-300'
                                }`}
                              >
                                {facilityAudit.intermissionFlowRating}% Flow
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Aisle Bottlenecks:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.aisleBottleneckCount === 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400 font-bold'
                                }`}
                              >
                                {facilityAudit.aisleBottleneckCount === 0
                                  ? 'Clean 2-Tile Aisles'
                                  : `${facilityAudit.aisleBottleneckCount} Obstructions!`}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Concession Sales at Risk:</span>
                              <span className="text-amber-400 font-mono font-bold">
                                {facilityAudit.concessionLossRisk}% loss risk
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Pillar 3: Environmental State Machine */}
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-emerald-300 border-b border-slate-700 pb-1 mb-2 flex items-center justify-between">
                            <span>3. Environmental State</span>
                            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <ul className="space-y-1.5 text-[11px]">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Thermal Comfort Index:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.thermalComfortScore >= 80
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : 'bg-amber-950 text-amber-300'
                                }`}
                              >
                                {facilityAudit.averageStageTemp}°F Stage (Comfort: {facilityAudit.thermalComfortScore}%)
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Acoustic Decibel Check:</span>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  facilityAudit.acousticInterferenceRisk
                                    ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                                    : 'bg-emerald-950 text-emerald-300'
                                }`}
                              >
                                {facilityAudit.maxRehearsalNoiseDb} dB {facilityAudit.acousticInterferenceRisk ? '(>55dB Bleed!)' : '(Quiet)'}
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Lobby Pre-Show Aura:</span>
                              <span className="text-yellow-400 font-bold">
                                +{facilityAudit.lobbyAestheticPrestige} pts (Review Forgiveness)
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Cleanliness & Sanitation:</span>
                              <span className="text-teal-300 font-bold">
                                {facilityAudit.cleanlinessSanitaryRating}% Inspection Rating
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Custodial Sweep Action */}
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Clear sawdust & aisle soda:</span>
                          <button
                            onClick={handleCustodialSweep}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white font-bold text-[10px] rounded shadow cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Custodial Sweep ($25)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: [CAST/CREW] */}
            {activeTab === 'CAST_CREW' && (
              <div className="flex flex-col gap-3">
                {/* Paid Technical Staff Section */}
                <div>
                  <div className="text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
                    <span>PAID TECHNICAL STAFF (Payroll: $290 / Wk)</span>
                    <span className="text-[10px] text-sky-400 font-normal">Train attributes using 💡 Acumen (15 💡 / lvl)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {staff.map((member) => (
                      <div key={member.id} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{member.name}</span>
                            <span className="text-[10px] text-amber-400">${member.salaryPerWeek}/wk</span>
                          </div>
                          <span className="text-[10px] text-amber-300 font-semibold">{member.roleTitle}</span>
                          <div className="grid grid-cols-2 gap-1 text-[10px] mt-1.5 text-slate-300">
                            <div>Vision: {member.vision}/10</div>
                            <div>Composure: {member.composure}/10</div>
                            <div>Carpentry: {member.carpentry}/10</div>
                            <div>Speed: {member.speed}/10</div>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 pt-1 border-t border-slate-700">
                          <button
                            onClick={() => handleTrainStaff(member.id, 'vision')}
                            className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-[10px] font-bold rounded text-amber-300 cursor-pointer"
                          >
                            +Vision (15💡)
                          </button>
                          <button
                            onClick={() => handleTrainStaff(member.id, 'composure')}
                            className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-[10px] font-bold rounded text-sky-300 cursor-pointer"
                          >
                            +Comp (15💡)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volunteer Actor Audition & Assignment Board */}
                <div>
                  <div className="text-xs font-bold text-amber-400 mb-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span>VOLUNTEER AUDITION POOL & CASTING ({volunteers.length} Actors)</span>
                    </div>
                    <button
                      onClick={handleHoldAuditions}
                      className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📢 Hold Open Auditions ($100 / 10 💡)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {volunteers.map((vol) => {
                      const isEgoClash = vol.ego === 'High' && vol.assignedRole === 'Ensemble';
                      const isUnderstudy = vol.assignedRole === 'Understudy';
                      return (
                        <div key={vol.id} className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-200">{vol.name}</span>
                              <select
                                value={vol.assignedRole}
                                onChange={(e) => handleReassignRole(vol.id, e.target.value as VolunteerActor['assignedRole'])}
                                className="bg-slate-900 border border-slate-600 text-[10px] text-amber-300 font-bold rounded px-1 py-0.5 cursor-pointer"
                              >
                                <option value="None">Resting</option>
                                <option value="Lead 1">★ Lead 1</option>
                                <option value="Lead 2">Lead 2</option>
                                <option value="Ensemble">Ensemble</option>
                                <option value="Understudy">Understudy</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400">{vol.job}</span>
                              <span className={`text-[9px] px-1 rounded ${vol.ego === 'High' ? 'bg-rose-950 text-rose-300' : 'bg-slate-700 text-slate-300'}`}>
                                {vol.ego} Ego
                              </span>
                              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded font-bold">
                                {vol.morale}% Morale
                              </span>
                            </div>

                            {isUnderstudy && (
                              <div className="text-[9px] text-sky-300 font-bold mt-1 bg-sky-950/80 p-0.5 rounded text-center border border-sky-500/40">
                                🛡️ Understudy Trainee (+1 Memo/rehearsal)
                              </div>
                            )}

                            {isEgoClash && (
                              <div className="flex flex-col gap-1 mt-1">
                                <div className="text-[9px] text-rose-400 font-bold bg-rose-950/80 p-0.5 rounded text-center">
                                  ⚠️ Diva in Ensemble!
                                </div>
                                <button
                                  onClick={() => handleAcumenPepTalk(vol.id)}
                                  className="w-full py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-[9px] text-amber-300 font-bold rounded border border-amber-500/50 cursor-pointer"
                                >
                                  Coaching Pep Talk (5💡)
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-amber-300 font-bold mt-1">
                              <span>🎭 Presence: {vol.stagePresence}/10</span>
                              <span>📖 Memo: {vol.memorization}/10</span>
                            </div>
                            <p className="text-[10px] text-slate-300 italic mt-1 line-clamp-2">{vol.quirk}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: [FINANCES & GOVERNANCE] */}
            {activeTab === 'FINANCES' && (
              <div className="flex flex-col gap-3">
                {/* Board of Directors Section */}
                <div>
                  <div className="text-xs font-bold text-amber-400 mb-1 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span>NON-PROFIT BOARD OF DIRECTORS</span>
                      <span className="text-[10px] text-slate-400">High approval unlocks seasonal benefactor gifts and endowment grants</span>
                    </div>
                    <button
                      onClick={handleHostBoardReception}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 rounded text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>🍾 Host Champagne Reception ($200 + 15 💡)</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {boardMembers.map((member) => (
                      <div key={member.id} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{member.name}</span>
                            <span className="text-amber-300 font-mono">{member.approvalRating}% Approval</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-semibold">{member.role}</span>
                          <p className="text-[10px] text-slate-300 mt-1 leading-snug">{member.agendaDescription}</p>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] flex items-center justify-between text-slate-400">
                          <span>Favored: <strong className="text-emerald-400">{member.preferredGenre}</strong></span>
                          <span>Gift: <strong className="text-amber-300">${member.annualEndowment}/yr</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating Ledger & Grants */}
                <div>
                  <span className="text-xs md:text-sm font-bold text-amber-400 mb-1 block">
                    Weekly Operating Ledger & Municipal Grants
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Weekly Operating Overhead</span>
                      <div className="text-rose-400 font-black text-sm mt-1">
                        -${getConfig('storefrontRentWeekly') + staff.reduce((a, s) => a + s.salaryPerWeek, 0)} / wk
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Storefront Rent ($250) + Staff Wages ($290)
                      </div>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Annual Municipal Arts Grant</span>
                      <div className="text-emerald-400 font-black text-sm mt-1">
                        Est. +$4,500 / yr
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Awarded at the end of Winter based on average critic reviews.
                      </div>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Repertoire Catalog (Hall of Fame)</span>
                      <div className="text-amber-300 font-black text-sm mt-1">
                        {repertoireCatalog.length} Inducted Plays
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Encore revivals staged without re-licensing costs!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TECH WEEK DYNAMIC CRISIS MODAL OVERLAY */}
      {isCrisisModalOpen && activeCrisis && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500 rounded-xl p-5 shadow-2xl text-center flex flex-col gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-2xl mx-auto shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-rose-400 font-serif uppercase tracking-wide">
              {activeCrisis.title}
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeCrisis.description}
            </p>
            <p className="text-[11px] text-amber-300 italic bg-slate-950/70 p-2 rounded border border-slate-800">
              {activeCrisis.quote}
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => handleResolveCrisis('A')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-98"
              >
                <span className="font-black text-sm">{activeCrisis.optionA.label}</span>
                <span className="text-[10px] text-emerald-950 font-medium">{activeCrisis.optionA.description}</span>
              </button>
              <button
                onClick={() => handleResolveCrisis('B')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-lg border border-slate-600 cursor-pointer flex flex-col items-center justify-center transition-transform active:scale-98"
              >
                <span className="font-bold text-xs text-rose-300">{activeCrisis.optionB.label}</span>
                <span className="text-[10px] text-slate-400">{activeCrisis.optionB.description}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNUAL BOARD OF DIRECTORS GALA & MUNICIPAL GRANT CEREMONY MODAL */}
      {annualGalaReport && (
        <div className="fixed inset-0 bg-black/92 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl mx-auto shadow-xl">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300 font-mono font-bold">
                COMMUNITY THEATER ANNUAL GALA
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-amber-400 font-serif">
                YEAR {annualGalaReport.year} AWARDS BANQUET
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                The Board of Trustees and Municipal Arts Council convene to assess the troupe's seasonal achievements!
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Season Review Average</span>
                <div className="text-base font-black text-amber-300">{annualGalaReport.averageSeasonReview} / 40</div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Municipal Grant Award</span>
                <div className="text-base font-black text-emerald-400">+${annualGalaReport.totalGrant.toLocaleString()}</div>
              </div>
            </div>

            {/* Board Trustee Endowments */}
            <div className="flex flex-col gap-1.5 text-left bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                <span>TRUSTEE ENDOWMENT CHECKS</span>
                <span className="text-slate-400 font-normal">Tied to Board Approval Rating</span>
              </div>
              {annualGalaReport.boardEndowments.map(({ member, payout }) => (
                <div key={member.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                  <div>
                    <span className="font-bold text-slate-200">{member.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({member.approvalRating}% approval)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+${payout.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total Grand Payout Lockup */}
            <div className="bg-amber-950/60 border border-amber-500/60 p-3 rounded-xl flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-amber-300">Total Endowment & Grant Award</div>
                <div className="text-xs text-slate-300">Deposited directly into liquid operating capital</div>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                +${annualGalaReport.totalPayout.toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleClaimAnnualGala}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>ACCEPT ENDOWMENTS & LAUNCH YEAR {annualGalaReport.year + 1} SPRING!</span>
            </button>
          </div>
        </div>
      )}

      {/* START SCREEN OVERLAY */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-md flex flex-col items-center bg-slate-900 border-2 border-amber-500/60 rounded-xl p-6 shadow-2xl text-center">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl mb-3 shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-amber-400 tracking-wide mb-1 font-serif">
              CURTAIN CALL
            </h1>
            <div className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-3">
              COMMUNITY THEATER TYCOON
            </div>
            <p className="text-xs md:text-sm text-slate-300 mb-6 max-w-sm">
              Lead your scrappy troupe in Unit 12B! License parody scripts, coordinate pre-production & rehearsals, squash flubs in Tech Week for Acumen (💡), and run profitable box office seasons!
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                ref={startBtnRef}
                autoFocus
                onClick={handleStartGame}
                data-testid="start-button"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base md:text-lg rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                START THEATER CAREER
              </button>
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setIsHowToPlayOpen(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs md:text-sm rounded-lg border border-slate-600 cursor-pointer"
              >
                HOW TO PLAY & GUIDE
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* IN-GAME MENU / PAUSE OVERLAY */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="w-full max-w-md flex flex-col items-center bg-slate-900 border-2 border-slate-700 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-amber-400 mb-6 font-serif">THEATER DIRECTORY</h2>
            <div className="flex flex-col gap-3 w-full">
              <button
                autoFocus
                onClick={() => {
                  gameAudio.playCrispClick();
                  setIsGameMenuOpen(false);
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
              >
                RESUME PLAY
              </button>
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => {
                    const newMute = gameAudio.toggleMute();
                    setIsSfxMuted(newMute);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSfxMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>SFX: {isSfxMuted ? 'Off' : 'On'}</span>
                </button>
                <button
                  onClick={() => setIsMusicMuted((m) => !m)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isMusicMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>Music: {isMusicMuted ? 'Off' : 'On'}</span>
                </button>
              </div>
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  setIsHowToPlayOpen(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
              >
                HOW TO PLAY
              </button>
              <button
                onClick={() => {
                  gameAudio.playCrispClick();
                  handleStartGame();
                  setIsGameMenuOpen(false);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-rose-300 text-xs font-bold rounded-lg cursor-pointer"
              >
                RESTART CAREER
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY MODAL */}
      {isHowToPlayOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500 rounded-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="text-xl font-bold text-amber-400 font-serif">HOW TO PLAY</h2>
              <button
                onClick={() => setIsHowToPlayOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div>
                <span className="font-bold text-amber-300">1. The 5-Phase Pipeline:</span> License a parody script, allocate Director focus slider points, build sets in Alpha Pre-Production (with 40% Scenic and 80% Tech checkpoints), rehearse volunteer actors in Beta, squash flubs in Tech Week, and open the show to critical reviews!
              </div>
              <div>
                <span className="font-bold text-amber-300">2. Tech Week Flub Squashing:</span> Missed lines and lighting glitches appear on stage. Click them in 3D to squash them and harvest 💡 Acumen research currency!
              </div>
              <div>
                <span className="font-bold text-amber-300">3. Staff Training:</span> Spend 💡 Acumen in [CAST/CREW] to boost Director Vision, Stage Manager Composure, and Tech Carpentry!
              </div>
              <div>
                <span className="font-bold text-amber-300">4. Interactive Storefront Grid [BUILD]:</span> Click tiles to place folding chairs, plush seating, snack card tables, water coolers, lighted makeup vanities, and the legendary Ghost Light!
              </div>
              <div>
                <span className="font-bold text-amber-300">5. 3D Heatmaps & Ghost Light:</span> Toggle Thermal, Acoustic, and Aesthetic layers to monitor drafty backstage rooms and workshop saw noise bleed. Keep the Ghost Light illuminated on center stage!
              </div>
              <div>
                <span className="font-bold text-amber-300">6. Reviews & Box Office Run:</span> 4 local critics stamp scorecards out of 40. Score 32+ to enter the Repertoire Hall of Fame! Run weekly box office in fast-forward until tickets dwindle!
              </div>
            </div>
            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg cursor-pointer"
            >
              LET'S PRODUCE A SHOW!
            </button>
          </div>
        </div>
      )}

      {/* CHAIRMAN INDUCTION & PLAYHOUSE BRANDING MODAL */}
      <ChairmanOnboardingModal
        isOpen={isChairmanModalOpen}
        defaultName={brandConfig.theaterName}
        onConfirm={handleConfirmChairman}
      />

      {/* CIVIC INSPECTOR BUILDING CODE AUDIT MODAL */}
      <CivicInspectorModal
        isOpen={isAuditModalOpen}
        auditResult={civicAuditResult}
        onClose={() => setIsAuditModalOpen(false)}
        hasClaimedGrant={hasClaimedCivicGrant}
        onClaimGrant={handleClaimCivicGrant}
      />
    </div>
  );
}
