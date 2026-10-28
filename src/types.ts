// tslint:disable
/* eslint-disable */
/** 3D Vector. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 3D Position as a tuple. */
export type Position3D = [number, number, number];

/** Represents an object in the 3D scene. */
export interface Entity3D {
  id: string | number;
  type?: string;
  position: Vec3 | Position3D;
  rotation?: Vec3 | Position3D;
  scale?: Vec3 | Position3D;
  velocity?: Vec3;
  active?: boolean;
  [key: string]: any;
}

/** Represents a particle in a particle system. */
export interface Particle {
  id: string | number;
  position: Vec3 | Position3D;
  velocity?: Vec3 | Position3D;
  life: number;
  maxLife: number;
  color?: string;
  size?: number;
  [key: string]: any;
}

export interface GameState {
  status: 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY' | 'LEVEL_COMPLETE';
  score: number;
  level: number;
  timer?: number;
  moves?: number;
  lives?: number;
  [key: string]: any;
}

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type PlayGenre = 'Musical' | 'Drama' | 'Comedy' | 'Classical' | 'Avant-Garde';

export type ProductionPhase =
  | 'SEASON_IDLE'
  | 'PROPOSAL'
  | 'PRE_PROD_ALPHA'
  | 'REHEARSAL_BETA'
  | 'TECH_WEEK'
  | 'OPENING_REVIEWS'
  | 'BOX_OFFICE_RUN'
  | 'SEASON_END';

export type TheaterRoomZone = 'OVERVIEW' | 'STAGE' | 'BACKSTAGE' | 'AUDITORIUM' | 'LOBBY' | 'TECH_BOOTH';

export type HeatmapMode = 'NONE' | 'THERMAL' | 'ACOUSTIC' | 'SANITATION' | 'AESTHETIC' | 'ZONING';

export interface FloatingPointItem {
  id: string;
  type: 'acting' | 'scenic' | 'costume' | 'lighting' | 'acumen' | 'flub' | 'spark';
  text: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

export interface ActiveFlubBug {
  id: string;
  title: string;
  category: 'dropped_line' | 'missed_cue' | 'jammed_flat' | 'torn_hemline' | 'flickering_dimmer';
  x: number;
  y: number;
  z: number;
  timeRemaining: number;
  acumenReward: number;
}

export interface ScriptDef {
  id: string;
  title: string;
  genre: PlayGenre;
  setting: string;
  description: string;
  baseRoyalty: number;
  targetDemographic: string;
  castSize: number;
  difficulty: number;
  recommendedSeason: Season;
  targetMetrics: {
    acting: number;
    scenic: number;
    costumes: number;
    lighting: number;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  primaryAttribute: string;
  vision: number;       // Director proposal & coaching
  composure: number;    // Flub squashing speed
  carpentry: number;    // Set craft & scenery points
  speed: number;        // Task execution rate
  stamina: number;      // 0 - 100
  maxStamina: number;
  salaryPerWeek: number;
  bio: string;
  skinColor: string;
  clothesColor: string;
  pantsColor: string;
}

export type EgoLevel = 'Low' | 'Medium' | 'High';
export type CastRole = 'Lead 1' | 'Lead 2' | 'Ensemble' | 'Understudy' | 'None';

export interface VolunteerActor {
  id: string;
  name: string;
  job: string;
  stagePresence: number; // 1 to 10 (Acting points multiplier)
  memorization: number;  // 1 to 10 (Reduces flubs)
  ego: EgoLevel;         // Demands lead vs ensemble
  stamina: number;       // 0 - 100
  morale: number;        // 0 - 100
  assignedRole: CastRole;
  auditioned: boolean;
  quirk: string;
  skinColor: string;
  clothesColor: string;
  pantsColor: string;
  speechText?: string;
}

export interface ProductionSliders {
  actingHeart: number;   // 0 - 20 (Sum = 20)
  setsScenery: number;
  costumesProps: number;
  lightingSound: number;
}

export interface ProductionStats {
  acting: number;
  scenic: number;
  costumes: number;
  lighting: number;
  flubsSpawned: number;
  flubsCleared: number;
  activeFlubs: number;
}

export interface CriticReview {
  criticName: string;
  publication: string;
  specialty: 'Acting & Heart' | 'Staging & Sets' | 'Visuals & Costumes' | 'Pacing & Tech';
  score: number; // 1 to 10
  comment: string;
  stampColor: string;
}

export type RoomType =
  | 'UNZONED'
  | 'SCENE_SHOP'
  | 'WARDROBE_LOFT'
  | 'REHEARSAL_STUDIO'
  | 'TECH_BOOTH'
  | 'GREEN_ROOM'
  | 'DRESSING_ROOM'
  | 'QUICK_CHANGE'
  | 'AUDITORIUM'
  | 'LOBBY'
  | 'RESTROOM'
  | 'STAGE_LEFT_WING'
  | 'STAGE_RIGHT_WING';

export type CivicLogoId = 'MASKS' | 'SPOTLIGHT' | 'LYRE' | 'PROSCENIUM' | 'MONOGRAM';

export interface CivicColorOption {
  name: string;
  hex: string;
}

export const CIVIC_PALETTE: CivicColorOption[] = [
  { name: 'Burgundy', hex: '#881337' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Forest Green', hex: '#14532d' },
  { name: 'Imperial Plum', hex: '#581c87' },
  { name: 'Burnt Gold', hex: '#b45309' },
  { name: 'Terracotta', hex: '#c2410c' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Regal Teal', hex: '#0f766e' },
];

export interface TheaterBrandConfig {
  theaterName: string;
  logoId: CivicLogoId;
  primaryColor: string;
  skipTutorial: boolean;
  funds: number;
}

export type TutorialPhase =
  | 'PHASE_0_EMPTY_CANVAS'
  | 'PHASE_1_ANCHOR_STAGE'
  | 'PHASE_2_DESIGNATE_WINGS'
  | 'PHASE_3_FRAME_HOUSE'
  | 'PHASE_4_STAMP_SEATS'
  | 'PHASE_5_BUILD_LOBBY'
  | 'PHASE_6_SCENE_SHOP'
  | 'PHASE_7_GREEN_ROOM'
  | 'PHASE_8_RESTROOM'
  | 'PHASE_9_CIVIC_INSPECTION'
  | 'TUTORIAL_COMPLETE';

export type StageTier = 'BLACK_BOX' | 'MAIN_STAGE' | 'GRAND_STAGE';
export type ShopDoorTier = 'STANDARD_1X1' | 'DOUBLE_2X1' | 'ROLLUP_3X1';

export interface StageDefinition {
  tier: StageTier;
  name: string;
  width: number;
  depth: number;
  hasFlySystem: boolean;
  hasOrchestraPit: boolean;
  lightingTier: 'BASIC_PIPE' | 'STANDARD_FRONT' | 'OPULENT_SPOTLIGHTS';
  cost: number;
  description: string;
}

export const STAGE_CONFIGS: Record<StageTier, StageDefinition> = {
  BLACK_BOX: {
    tier: 'BLACK_BOX',
    name: 'Black Box Studio',
    width: 10,
    depth: 5,
    hasFlySystem: false,
    hasOrchestraPit: false,
    lightingTier: 'BASIC_PIPE',
    cost: 5000,
    description: 'Zero-elevation intimate space with basic pipe lighting grid. Minimalist and economical.',
  },
  MAIN_STAGE: {
    tier: 'MAIN_STAGE',
    name: 'Main Proscenium Stage',
    width: 15,
    depth: 10,
    hasFlySystem: true,
    hasOrchestraPit: false,
    lightingTier: 'STANDARD_FRONT',
    cost: 18000,
    description: 'Raised platform with manual counterweight fly system and front-of-house spotlight pipes.',
  },
  GRAND_STAGE: {
    tier: 'GRAND_STAGE',
    name: 'Grand Opera Stage',
    width: 20,
    depth: 15,
    hasFlySystem: true,
    hasOrchestraPit: true,
    lightingTier: 'OPULENT_SPOTLIGHTS',
    cost: 45000,
    description: 'Deep proscenium arch, motorized fly loft, footlight trough, and integrated sunken Orchestra Pit.',
  },
};

export interface GridRect {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface DragBoxState {
  start: { gx: number; gz: number };
  current: { gx: number; gz: number };
  isDragging: boolean;
  roomType: RoomType;
}

export interface PlacedStage {
  tier: StageTier;
  originX: number;
  originZ: number;
  width: number;
  depth: number;
  curtainZ: number; // Front proscenium edge
}

export interface PlacedWing {
  side: 'STAGE_LEFT' | 'STAGE_RIGHT';
  bounds: GridRect;
  width: number; // >= 2 tiles
}

export interface ShopDoor {
  id: string;
  tier: ShopDoorTier;
  widthTiles: number; // 1, 2, or 3
  x: number;
  z: number;
  connectsShopToStage: boolean;
  maxSetStars: number;
}

export interface PlacedDoor {
  id: string;
  x: number;
  z: number;
  isBackstageRestricted: boolean;
  isShopDoor: boolean;
  shopDoorTier?: ShopDoorTier;
}

export type RoomZoneType =
  | 'STAGE'
  | 'STAGE_LEFT_WING'
  | 'STAGE_RIGHT_WING'
  | 'HOUSE'
  | 'LOBBY'
  | 'SCENE_SHOP'
  | 'GREEN_ROOM'
  | 'DRESSING_ROOM'
  | 'RESTROOM'
  | 'REHEARSAL_STUDIO'
  | 'TECH_BOOTH';

export interface PlacedRoom {
  id: string;
  type: RoomZoneType;
  name: string;
  bounds: GridRect;
  doors: PlacedDoor[];
  placedItemIds: string[];
}

export interface BuildingAuditResult {
  passed: boolean;
  stageValid: boolean;
  wingsValid: boolean;
  houseValid: boolean;
  seatingCapacity: number;
  lobbyValid: boolean;
  shopDoorValid: boolean;
  restroomValid: boolean;
  hasDressingFacility: boolean;
  isMakeshiftDressing: boolean;
  criticalErrors: string[];
  advisoryWarnings: string[];
}

export type WallViewMode = 'FULL' | 'CUTAWAY' | 'DOWN';
export type LabelViewMode = 'ALL' | 'WARNINGS_ONLY' | 'OFF';


export interface RoomDefinition {
  type: RoomType;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  primaryOccupant: string;
  outputStat: string;
  multiplierEffect: string;
  description: string;
}

export type FixtureItemId =
  | 'seat_folding'
  | 'seat_plush'
  | 'seat_rocker'
  | 'aisle_carpet'
  | 'table_snack'
  | 'bar_cocktail'
  | 'water_cooler'
  | 'makeup_vanity'
  | 'acoustic_panel'
  | 'ghost_light'
  | 'electric_radiator'
  | 'proscenium_arch'
  // Architectural partition walls & doors
  | 'wall_partition'
  | 'wall_soundproof'
  | 'door_standard'
  | 'door_acoustic'
  | 'door_backstage'
  | 'door_shop_standard'
  | 'door_shop_double'
  | 'door_shop_rollup'
  // Specialized room apparatus & amenities
  | 'box_office_counter'
  | 'vending_machine'
  | 'rolling_garment_rack'
  | 'full_length_mirror'
  | 'lighted_vanity'
  | 'porcelain_toilet'
  | 'restroom_sink'
  | 'quick_change_booth'
  | 'scene_shop_saw'
  | 'wardrobe_sewing'
  | 'hvac_blower'
  | 'trash_can'
  | 'janitor_closet'
  | 'chandelier_lobby'
  | 'velvet_rope'
  | 'framed_playbill'
  | 'restroom_stall';

export interface GridTileItem {
  id: string;
  itemId: FixtureItemId;
  name: string;
  x: number; // Grid X (0 to 15)
  z: number; // Grid Z (0 to 23)
  zone: 'BACKSTAGE' | 'STAGE' | 'AUDITORIUM';
  price: number;
}

export interface TileEnvironmentalData {
  temperature: number; // in °F (Target: 68°F)
  noiseDecibels: number; // in dB (Target: <45 dB)
  aesthetic: number; // 0 to 100
  cleanliness: number; // 0 to 100 (100 = spotless)
  roomType: RoomType;
  hasWall: boolean;
  isSoundproofWall: boolean;
  isDoor: boolean;
  isWalkable: boolean;
}

export interface FacilityAudit {
  isSceneShopSegregated: boolean;
  isRehearsalStudioActive: boolean;
  isWardrobeLoftActive: boolean;
  isSoundBoothIsolated: boolean;
  isGreenRoomActive: boolean;
  hasQuickChangeWingLeft: boolean;
  hasQuickChangeWingRight: boolean;
  quickChangeEliminatesLateCues: boolean;
  parallelPipelineActive: boolean;
  sharedResourcePenaltyActive: boolean;
  averageAuditoriumTemp: number;
  averageStageTemp: number;
  thermalComfortScore: number; // 0 - 100
  acousticInterferenceRisk: boolean;
  maxRehearsalNoiseDb: number;
  lobbyAestheticPrestige: number; // 0 - 100
  crewInTheZoneBonus: boolean;
  cleanlinessSanitaryRating: number; // 0 - 100
  intermissionFlowRating: number; // 0 - 100
  concessionLossRisk: number; // percentage
  restroomStallCount: number;
  concessionBarCount: number;
  aisleBottleneckCount: number;
}

export interface CatalogFurnitureDef {
  id: FixtureItemId;
  name: string;
  zone: 'AUDITORIUM' | 'BACKSTAGE' | 'STAGE';
  category: 'SEATING' | 'ROOM_STRUCTURE' | 'SHOP_EQUIPMENT' | 'HVAC_ACOUSTICS' | 'HOSPITALITY_DECOR';
  cost: number;
  seatCapacityBonus: number;
  comfortRating: number; // 1 to 5
  description: string;
  iconName: string;
  soundDampening?: number;
  soundAbsorption?: number;
  acousticIsolation?: number;
  thermalEffect?: number; // +/- delta
  heatOutput?: number;
  coolingOutput?: number;
  aestheticBonus?: number;
  cleanlinessEffect?: number;
}

export interface ActiveProduction {
  script: ScriptDef | null;
  phase: ProductionPhase;
  phaseProgress: number; // 0 to 100
  sliders: ProductionSliders;
  stats: ProductionStats;
  assignedCastIds: string[]; // 3 actors
  assignedStaffIds: string[];
  techWeekTimeLeft: number;
  crisisTriggered: boolean;
  emergencyRentalChosen: 'rental' | 'duct_tape' | 'none';
  reviewScores: CriticReview[];
  totalReviewScore: number; // out of 40
  isRepertoireInducted: boolean;
  ticketPrice: number;
  runWeek: number;
  weeklyOccupancy: number; // 0 to 1.0
  weeklyRevenue: number;
  weeklyExpenses: number;
  totalRunGross: number;
  totalRunAttendance: number;
  isRunActive: boolean;
}

export interface CalendarDate {
  year: number;
  season: Season;
  month: number;
  week: number;
}

export interface MunicipalGrantState {
  lastYearAverageReview: number;
  grantAmount: number;
  isClaimed: boolean;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  personality: 'TRADITIONALIST' | 'CIVIC_BOOSTER' | 'MEDDLING_PATRON';
  approvalRating: number; // 0 - 100
  annualEndowment: number;
  agendaDescription: string;
  preferredGenre: PlayGenre;
  dislikedGenre?: PlayGenre;
}

export interface TownRumor {
  headline: string;
  blurb: string;
  favoredGenre: PlayGenre;
  attendanceMultiplier: number;
}

export interface TheatricalCrisis {
  id: string;
  title: string;
  description: string;
  quote: string;
  optionA: {
    label: string;
    description: string;
    cost: number;
    statBonus?: {scenic?: number; lighting?: number; acting?: number; costumes?: number};
    acumenReward?: number;
  };
  optionB: {
    label: string;
    description: string;
    cost: number;
    flubsAdded: number;
    moralePenalty?: number;
  };
}

export interface GalaReport {
  year: number;
  totalGrant: number;
  boardEndowments: {
    member: BoardMember;
    payout: number;
  }[];
  totalPayout: number;
  averageSeasonReview: number;
  hallOfFameInductions: number;
}
