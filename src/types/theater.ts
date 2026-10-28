/**
 * Type definitions for Curtain Call: Community Theater Tycoon
 */

export type ProductionPhase =
  | 'IDLE'               // Selecting script, setting focus sliders, auditions
  | 'PRE_PRODUCTION'     // Alpha: Shop fabrication (40% scenic checkpoint, 80% tech checkpoint)
  | 'REHEARSALS'         // Beta: Cast blocking, line memorization, flub generation
  | 'TECH_WEEK'          // Hell Week: Stage flub clearing, Acumen generation, crisis dilemma
  | 'OPENING_NIGHT'      // 4 critics review, community repertoire evaluation
  | 'THE_RUN'            // Weekend performances, occupancy decay, concessions, weekly expenses
  | 'STRIKE'             // Midnight set strike: Scrapping, Salvage (-35% materials), Wardrobe archive
  | 'GRANT_EVALUATION';  // Annual municipal grant review

export type Genre =
  | 'Farce'
  | 'Musical Comedy'
  | 'Tragic Drama'
  | 'Experimental'
  | 'Mystery'
  | 'Historical Pageant';

export interface Script {
  id: string;
  title: string;
  playwright: string;
  genre: Genre;
  setting: string;
  licensingCost: number;
  royaltyPercent: number; // e.g., 0.12 = 12% of ticket gross
  demographicAppeal: {
    seniors: number;
    families: number;
    youngAdults: number;
    critics: number;
  };
  baselineScenicReq: number; // minimum scenic points for good reviews
  castSlots: {
    leadCount: number;
    supportingCount: number;
    ensembleCount: number;
  };
  description: string;
  synopsis: string;
  isOriginalIP?: boolean;
}

export interface FocusSliders {
  acting: number;      // Acting & Memorization
  scenic: number;      // Scenic & Stage Architecture
  costume: number;     // Costume, Prop & Makeup Detail
  lighting: number;    // Lighting, Soundscapes & Effects
}

export interface CastMember {
  id: string;
  name: string;
  assignedRole: 'LEAD' | 'SUPPORTING' | 'ENSEMBLE' | 'UNASSIGNED';
  talent: number;       // 1 - 100
  memorization: number; // 1 - 100 (affects flub rate during rehearsal)
  chemistry: number;    // 1 - 100 (synergy with castmates)
  stamina: number;      // 0 - 100
  morale: number;       // 0 - 100
  conflictRisk: number; // probability of rehearsal conflict/absence (0-1)
  bio: string;
  clothingColor: string;
  hairColor: string;
  isAbsent?: boolean;
}

export type StaffRole =
  | 'DIRECTOR'
  | 'SHOP_STEWARD'
  | 'COSTUME_MASTER'
  | 'LIGHTING_DIRECTOR'
  | 'STAGE_MANAGER';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  title: string;
  skillLevel: number;   // 1 - 100
  stamina: number;      // 0 - 100
  weeklySalary: number;
  acumenTrainingCost: number;
  specialization: string;
  description: string;
}

export type RoomType =
  | 'MAIN_STAGE'
  | 'SCENE_SHOP'
  | 'WARDROBE_LOFT'
  | 'REHEARSAL_STUDIO'
  | 'GREEN_ROOM'
  | 'QUICK_CHANGE'
  | 'AUDITORIUM'
  | 'CONCESSIONS'
  | 'FOYER'
  | 'RESTROOM'
  | 'STORAGE'
  | 'EMPTY_FLOOR';

export interface Fixture {
  id: string;
  name: string;
  category: 'SEATING' | 'SCENIC' | 'TECH' | 'AMENITY' | 'ACOUSTIC' | 'CLIMATE' | 'SUPERSTITION';
  cost: number;
  weeklyUpkeep: number;
  mechanicalBuff: string;
  tempDelta?: number;
  noiseDampenDb?: number;
  noiseEmissionDb?: number;
  dirtRate?: number;
  aestheticDelta?: number;
  capacity?: number;
  spriteSymbol: string;
  iconBg: string;
  description: string;
}

export interface StageTile {
  x: number;
  y: number;
  roomType: RoomType;
  fixtureId: string | null;
  hasPartitionWall?: boolean;
  temp: number;      // °F (Target 68 - 72°F)
  noiseDb: number;   // dB (Baseline < 45 dB)
  dirt: number;      // 0.0 to 1.0 (Sanitation target 0)
  aesthetic: number; // +0 to +100
}

export interface FlubMarker {
  id: string;
  tileX: number;
  tileY: number;
  type: 'MISSED_LINE' | 'STUCK_FLAT' | 'MISALIGNED_MIC' | 'DROPPED_PROP' | 'LATE_CUE';
  label: string;
  acumenReward: number;
  createdAtProgress: number;
}

export interface CriticReview {
  criticName: string;
  publication: string;
  actingScore: number;    // 1 - 10
  scenicScore: number;    // 1 - 10
  costumeScore: number;   // 1 - 10
  pacingScore: number;    // 1 - 10
  totalScore: number;     // 4 - 40
  quote: string;
  recommends: boolean;
}

export interface TechCrisis {
  id: string;
  title: string;
  description: string;
  optionA: {
    label: string;
    cost: number;
    effectDescription: string;
    apply: () => void;
  };
  optionB: {
    label: string;
    cost: number;
    effectDescription: string;
    apply: () => void;
  };
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  personality: 'TRADITIONALIST' | 'CIVIC_BOOSTER' | 'MEDDLING_PATRON';
  approvalRating: number; // 0 - 100
  annualEndowment: number;
  agendaDescription: string;
  preferredGenre: Genre;
  dislikedGenre?: Genre;
}

export interface ActiveProduction {
  script: Script;
  sliders: FocusSliders;
  phase: ProductionPhase;
  phaseProgress: number;     // 0 - 100%
  // Accumulated milestone points
  points: {
    acting: number;
    scenery: number;
    costumes: number;
    atmosphere: number;
  };
  flubs: FlubMarker[];
  unresolvedFlubCount: number;
  clearedFlubCount: number;
  assignedCast: CastMember[];
  scenicCheckpointReached: boolean;
  techCheckpointReached: boolean;
  techCrisisTriggered: boolean;
  // Opening night and Run stats
  reviews?: CriticReview[];
  averageScore?: number;
  inductedIntoRepertoire?: boolean;
  runWeek: number;           // Current week of the run (1, 2, 3...)
  totalAttendance: number;
  totalBoxOfficeGross: number;
  totalConcessionGross: number;
  weeklyOccupancyRate: number; // 0.0 to 1.0
  ticketPrice: number;
  salvageDiscountNextProduction: number; // e.g. 0.35 from salvage
}

export interface TheaterCalendar {
  seasonYear: number;
  month: number; // 1 - 12
  week: number;  // 1 - 4
}

export type HeatmapMode = 'STANDARD' | 'THERMAL' | 'ACOUSTIC' | 'SANITATION' | 'AESTHETIC';

export interface CivicTrend {
  id: string;
  headline: string;
  favoredGenre: Genre;
  multiplier: number;
  blurb: string;
  durationWeeks: number;
}
