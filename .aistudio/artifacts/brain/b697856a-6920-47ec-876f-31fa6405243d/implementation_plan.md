# Theater Tycoon: Core Lifecycle, Chairman Intro & Guided Building Engine

An end-to-end architectural construction, civic identity onboarding, and theatrical management simulation. The player steps in as Board Chairman, establishes company branding with an optional "Skip Tutorial" toggle for freeform building, progresses either through a guided 10-phase construction finite state machine (FSM) or unconstrained sandbox architecture, passes civic safety inspections, and drives an annual four-production theatrical season.

## User Review & Critical Decisions

> [!IMPORTANT]
> A **"Skip Tutorial (Freeform Architect Mode)"** checkbox has been added directly to the Chairman Induction screen. Players can now choose between the guided step-by-step tutorial or immediately jump into unrestricted sandbox building with all construction tools unlocked from the start.

- **1. Chairman Induction & "Skip Tutorial" Option**:
  - **Company Profile**: Theater Name input (`theaterName`), 5 civic SVG emblems (`MASKS`, `SPOTLIGHT`, `LYRE`, `PROSCENIUM`, `MONOGRAM`), and an 8-color civic palette (Burgundy, Navy, Forest Green, Imperial Plum, Burnt Gold, Terracotta, Charcoal, Regal Teal).
  - **"Skip Tutorial" Checkbox**:
    - *Unchecked (Default)*: Launches the 10-phase sequential guided tutorial FSM, stepping the player through Stage $\to$ Wings $\to$ House $\to$ Lobby $\to$ Shop $\to$ Green Room $\to$ Restrooms $\to$ Inspection.
    - *Checked (Freeform Mode)*: Bypasses the tutorial FSM immediately (`TUTORIAL_COMPLETE`), credits the $5,000 inaugural season grant, and unlocks all construction palettes (Stages, Wings, Rooms, Doors, Seats, Fixtures, Demolish) from minute one for total creative freedom. The "Call Civic Inspector" audit button remains accessible in the top bar whenever the player is ready to validate before launching Season 1.
  - **Cosmetic Material Binding**: Chosen brand color immediately tints the downstage proscenium main drape/valance (with gold accents), lobby aisle carpet tiles, outdoor marquee signs, and UI borders.
- **2. Annual Calendar & Production Pipeline**:
  - The calendar tracks 4 seasonal shows (Spring, Summer, Fall, Winter), bookended by the Municipal Grant & Board Objectives at New Year, and the Board Gala & Endowment Payouts at Year-End.
  - Each production runs a full 7-step pipeline: Proposal/Licensing $\to$ Alpha Pre-Prod (sets/costumes) $\to$ Beta Rehearsals (lines/chemistry) $\to$ Tech Week ("Hell Week" live stage flub squashing) $\to$ Opening Night (4 critic reviews) $\to$ Box Office Run (weekly ticket decay & concessions) $\to$ Midnight Strike (salvage & inventory).
- **3. Guided Building Tutorial FSM (When Tutorial Active)**:
  - *Phase 0 (Empty Shell)*: Unpartitioned concrete slab with static street double doors and camera tutorial (orbit, pan, zoom).
  - *Phase 1 (Anchor Stage Platform)*: Black Box ($10 \times 5$), Main Stage ($15 \times 10$), or Grand Stage ($20 \times 15$) with forward downstage lock.
  - *Phase 2 (Designate Stage Wings)*: Stage Left and Stage Right wings ($\ge 2$ tiles wide) to unlock actor and scenic entrances.
  - *Phase 3 (Frame The House)*: Auditorium enclosed with $\text{Width} \ge \text{Stage Width}$ and proscenium line alignment.
  - *Phase 4 (Stamp 1x1 Seats & Aisles)*: Individual chair stamping ($\ge 10$ accessible seats; empty tiles register as walkable aisles).
  - *Phase 5 (Build Front of House Lobby)*: Box Office counter and circulation path connecting street entrance to House doors.
  - *Phase 6 (BOH Scene Shop & Shop Door)*: Dedicated Shop Door ($1 \times 1$ Service, $2 \times 1$ Double, or $3 \times 1$ Industrial Roll-Up) connecting shop to stage/wings.
  - *Phase 7 (Establish Green Room)*: Actor lounge with makeshift garment rack/mirror vs dedicated dressing rooms.
  - *Phase 8 (Mandatory Restroom Audit)*: Enclosed restroom with toilet and sink accessible from Lobby via Public Door.
  - *Phase 9 (Civic Inspection & Launch)*: Player calls the Civic Inspector; passing the audit awards the $5,000 Inaugural Grant, plays the ribbon-cutting animation, and unlocks the Season 1 Proposal tab.
- **4. Script & Shop Door Synergy**:
  - Shop Door width gates maximum scenic flat scale: $1 \times 1$ unlocks royalty-free plays; $2 \times 1$ unlocks mid-tier musicals (*Dogs!*); $3 \times 1$ unlocks heavy spectacles (*The Phantom of the Annex*).
- **5. Sightline Visibility Controls**:
  - **Wall Height Modes (`W` Key)**: Full Walls (3.0m), Cutaway / Half-Walls (0.4m), and Blueprint Walls Down (0.05m).
  - **Label Modes (`L` Key)**: All Labels, Diagnostics / Warnings Only, and Clean View (Off).

---

## 1. Overview & Core Concept

- **What It Does**: Provides a unified management simulation that balances architectural construction with seasonal theatrical production. Players can either follow a structured 10-phase guided onboarding sequence or skip straight into freeform architect mode, pass municipal inspections, license scripts matching their physical stage and shop door constraints, navigate actor egos, and maximize box office revenue and concession sales.
- **Target Audience / Persona**: Simulation and tycoon gamers of all skill levels—offering gentle step-by-step guidance for beginners and instant unconstrained sandbox freedom for experienced players.
- **Key Value**: Direct gameplay connection between physical layout and theatrical production: proper wing access speeds up scene shifts, dedicated actor routes eliminate missed cues, and properly scaled restrooms optimize the high-stakes 15-minute intermission rush.

---

## 2. User Experience & Visual Design

### The Core Game Lifecycle

```
[ START OF YEAR: ANNUAL MUNICIPAL GRANT & BOARD OBJECTIVES ]
                          │
                          ▼
             [ 4-SHOW ANNUAL PRODUCTION CALENDAR ]
 ┌────────────────────────────────────────────────────────────┐
 │  SPRING SHOW   │   SUMMER SHOW   │   FALL SHOW   │ WINTER  │
 └───────┬────────────────────────────────────────────────────┘
         │
         ▼ (Each Season executes the 7-Step Production Loop)
 ┌────────────────────────────────────────────────────────────┐
 │ 1. Proposal & Licensing: Script selection, budget & sliders│
 │ 2. Pre-Production (Alpha): Scene shop flats & wardrobe     │
 │ 3. Rehearsals (Beta): Volunteer line memorization & chem   │
 │ 4. Tech Week ("Hell Week"): Squash active stage flubs      │
 │ 5. Opening Night: 4 Critic Reviews (Acting/Sets/Cost/Tech) │
 │ 6. Box Office Run: Weekly ticket decay & concession rushes │
 │ 7. Midnight Strike: Teardown, set salvage & scrap revenue  │
 └─────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
 [ YEAR-END GALA: BOARD ENDOWMENT PAYOUTS & EXPANSION OPTIONS ]
```

### Chairman Induction Screen & Setup Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CHAIRMAN INDUCTION & VENUE PROFILE                   │
│                                                                        │
│   Playhouse Name: [ Maple Valley Civic Playhouse            ]          │
│                                                                        │
│   Civic Crest:    [ (🎭 Masks)  (🔦 Spotlight)  (🪕 Lyre) ... ]        │
│                                                                        │
│   Brand Palette:  [ ■ Burgundy  ■ Navy  ■ Forest  ■ Gold ... ]         │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ [✓] Skip Building Tutorial (Freeform Architect Mode)           │   │
│   │     Immediately unlock all building tools and start placing    │   │
│   │     rooms without guided step-by-step milestones.              │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│                    [  TAKE OFFICE & ENTER LOT  ]                       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
      [Tutorial Checked: OFF]            [Skip Tutorial: ON]
                  │                                 │
                  ▼                                 ▼
       10-Phase Guided FSM               Freeform Sandbox Mode
     (Stage -> Wings -> House...)       (All Tools Unlocked Instantly)
```

### Visual Identity & Theme

- **Aesthetic Direction**: Vintage mid-century civic theater with rich brass trims, architectural drafting lines, and tactile wood and velvet surfaces.
- **Brand Palette Binding (8 Civic Swatches)**:
  - *Burgundy* (`#881337`), *Royal Navy* (`#1E3A8A`), *Forest Green* (`#14532D`), *Imperial Plum* (`#581C87`), *Burnt Gold* (`#B45309`), *Terracotta* (`#C2410C`), *Charcoal* (`#334155`), *Regal Teal* (`#0F766E`).
  - Dynamic procedural shader binding ensures the main drape, valance, lobby carpet tiles, outdoor marquee signs, and UI headers immediately adopt the selected brand palette.
- **Sightline Controls**:
  - `W` Key: Cycles Full Walls (3.0m) $\to$ Cutaway (0.4m) $\to$ Walls Down (0.05m).
  - `L` Key: Cycles All Labels $\to$ Warnings Only $\to$ Clean Off.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: "Skip Tutorial" Option vs. Mandatory Guided Pipeline
- **Chosen Approach**: A prominent checkbox on the onboarding screen allowing players to bypass the 10-phase tutorial.
- **Why**: Experienced players and players returning for subsequent playthroughs want immediate creative control without being forced through sequential step-by-step gates, while beginners still benefit from the structured flow.
- **Alternatives Considered**: Making the tutorial mandatory for everyone. Rejected because it creates friction and frustration for players who want to build custom layouts immediately.

### Decision 2: Sequential FSM Tutorial vs. Pure Freeform
- **Chosen Approach**: Offer both modes via the onboarding checkbox. When active, the FSM guarantees that the essentials (Stage $\to$ Wings $\to$ House $\to$ Lobby $\to$ Shop $\to$ Green Room $\to$ Restroom) are completed in an order that avoids invalid states.

### Decision 3: Shop Door Width Gating Script Licensing
- **Chosen Approach**: The installed Shop Door width ($1\times 1$, $2\times 1$, or $3\times 1$) directly dictates the maximum physical scale and visual stars of scripts the player can produce.
- **Why**: Creates a natural upgrade gate between early-game budget plays (hand props) and grand musical productions (rolling wagons and flying platforms).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CHAIRMAN ONBOARDING MODAL                       │
│   [ Name ] ──► [ Logos ] ──► [ Colors ] ──► [ [✓] Skip Tutorial ]      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        THEATER TYCOON VIEWPORT                         │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Top Display Bar: [ Wall Mode: Full/Cutaway/Down ] [ Labels: 🏷 ]│   │
│   │ Status: Freeform Mode or Tutorial Step Banner [ Phase X/9 ]    │   │
│   │ Quick Action: [ 📋 Audit Venue / Call Inspector ]              │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │                    3D Three.js Isometric Canvas                │   │
│   │                                                                │   │
│   │   [ Scene Shop ] ══(Shop Door)══► [ Stage Left Wing ]          │   │
│   │                                           │                    │   │
│   │   [ Green Room / Dressing ] ──(BOH Door)──┴──► [ STAGE ]       │   │
│   │                                                  │             │   │
│   │                                      (Proscenium Line)         │   │
│   │                                                  ▼             │   │
│   │                      [ THE HOUSE (1x1 Seats & Aisles) ]        │   │
│   │                                                  │             │   │
│   │                                            (Public Doors)      │   │
│   │                                                  ▼             │   │
│   │                      [ LOBBY & RESTROOMS ]                     │   │
│   │                               │                                │   │
│   │                               ▼                                │   │
│   │                      [ STREET DOUBLE-DOORS ]                   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      Unified Bottom Dock                       │   │
│   │   [Stage] [Wings] [House & Seats] [Rooms] [Doors] [Fixtures]   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

```typescript
// 1. Company Brand Configuration & Tutorial Skip
export type CivicLogoId = 'MASKS' | 'SPOTLIGHT' | 'LYRE' | 'PROSCENIUM' | 'MONOGRAM';

export const CIVIC_PALETTE = [
  { name: 'Burgundy', hex: '#881337' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Forest Green', hex: '#14532D' },
  { name: 'Imperial Plum', hex: '#581C87' },
  { name: 'Burnt Gold', hex: '#B45309' },
  { name: 'Terracotta', hex: '#C2410C' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Regal Teal', hex: '#0F766E' },
];

export interface TheaterBrandConfig {
  theaterName: string;
  logoId: CivicLogoId;
  primaryColor: string;
  skipTutorial: boolean; // When true: instantly unlocks all tools, credits $5,000 grant
  funds: number;
}

// 2. Tutorial Finite State Machine (FSM)
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

// 3. Stage & Shop Door Types
export type StageTier = 'BLACK_BOX' | 'MAIN_STAGE' | 'GRAND_STAGE';
export type ShopDoorTier = 'STANDARD_1X1' | 'DOUBLE_2X1' | 'ROLLUP_3X1';

export interface GridRect {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface PlacedStage {
  tier: StageTier;
  bounds: GridRect;
  width: number;
  depth: number;
  curtainZ: number; // Front proscenium edge
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
  | 'RESTROOM';

export interface PlacedRoom {
  id: string;
  type: RoomZoneType;
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
```

### Technical Validation Engine Implementation

```typescript
export class VenueValidator {
  public static audit(
    stage: PlacedStage | null,
    rooms: PlacedRoom[],
    seatCount: number
  ): BuildingAuditResult {
    const result: BuildingAuditResult = {
      passed: false,
      stageValid: false,
      wingsValid: false,
      houseValid: false,
      seatingCapacity: seatCount,
      lobbyValid: false,
      shopDoorValid: false,
      restroomValid: false,
      hasDressingFacility: false,
      isMakeshiftDressing: false,
      criticalErrors: [],
      advisoryWarnings: [],
    };

    // 1. Stage Check
    if (!stage) {
      result.criticalErrors.push("Stage Platform has not been anchored.");
      return result;
    }
    result.stageValid = true;

    // 2. Wings Check
    const leftWing = rooms.find(r => r.type === 'STAGE_LEFT_WING');
    const rightWing = rooms.find(r => r.type === 'STAGE_RIGHT_WING');
    const leftWingValid = leftWing && (leftWing.bounds.x2 - leftWing.bounds.x1 + 1) >= 2;
    const rightWingValid = rightWing && (rightWing.bounds.x2 - rightWing.bounds.x1 + 1) >= 2;

    if (!leftWingValid || !rightWingValid) {
      result.criticalErrors.push("Both Stage Left and Stage Right wings must be at least 2 tiles wide.");
    } else {
      result.wingsValid = true;
    }

    // 3. House Check
    const house = rooms.find(r => r.type === 'HOUSE');
    if (!house) {
      result.criticalErrors.push("Auditorium (The House) has not been enclosed.");
    } else {
      const houseWidth = house.bounds.x2 - house.bounds.x1 + 1;
      if (houseWidth < stage.width) {
        result.criticalErrors.push(
          `The House must be at least as wide as the stage (${stage.width} tiles). Current: ${houseWidth}.`
        );
      } else if (house.bounds.z1 !== stage.curtainZ + 1) {
        result.criticalErrors.push("The House front boundary must directly touch the proscenium line.");
      } else {
        result.houseValid = true;
      }
    }

    // 4. Seating Density
    if (seatCount < 10) {
      result.criticalErrors.push("Auditorium must contain at least 10 accessible seats.");
    }

    // 5. Lobby Check
    const lobby = rooms.find(r => r.type === 'LOBBY');
    if (!lobby) {
      result.criticalErrors.push("A Front of House Lobby must connect the exterior to the House.");
    } else {
      result.lobbyValid = true;
    }

    // 6. Scene Shop & Specialized Shop Door Check
    const shop = rooms.find(r => r.type === 'SCENE_SHOP');
    if (!shop) {
      result.criticalErrors.push("A Scene Shop must be constructed in Back of House.");
    } else {
      const validShopDoor = shop.doors.find(d => d.isShopDoor);
      if (!validShopDoor) {
        result.criticalErrors.push(
          "Scene Shop must connect to the stage or wings through a designated Shop Door."
        );
      } else {
        result.shopDoorValid = true;
      }
    }

    // 7. Restroom Check
    const restrooms = rooms.filter(r => r.type === 'RESTROOM');
    if (restrooms.length === 0) {
      result.criticalErrors.push("Local municipal code requires at least one working Restroom.");
    } else {
      result.restroomValid = true;
    }

    // 8. Actor Dressing & Green Room Logistics
    const dedicatedDressing = rooms.find(r => r.type === 'DRESSING_ROOM');
    const greenRoom = rooms.find(r => r.type === 'GREEN_ROOM');

    if (dedicatedDressing) {
      result.hasDressingFacility = true;
      result.isMakeshiftDressing = false;
    } else if (greenRoom && greenRoom.placedItemIds.includes('item_garment_rack')) {
      result.hasDressingFacility = true;
      result.isMakeshiftDressing = true;
      result.advisoryWarnings.push(
        "Using Green Room with garment racks as makeshift dressing. High-ego actors will suffer morale decay."
      );
    } else {
      result.criticalErrors.push(
        "No dressing facility or garment rack found. Actors have nowhere to change."
      );
    }

    // Final Gate
    result.passed = result.criticalErrors.length === 0;
    return result;
  }
}
```

### Script & Shop Door Compatibility Matrix

| Shop Door Tier | Door Width | Maximum Set Scale | Licensed Script Compatibility |
| :--- | :--- | :--- | :--- |
| **Standard Service Door** | $1 \times 1$ | Minimalist flats, handheld set props | *A Midsummer Night's Scheme*, *The Importance of Being Sincere* (Royalty-free public domain only) |
| **Double Load-In Doors** | $2 \times 1$ | Rigid box sets, rolling staircases, painted backdrops | *Dogs! The Musical*, *A Streetcar Named Expulsion* |
| **Industrial Roll-Up Bay** | $3 \times 1$ | Heavy wagons, multi-tier balconies, automated revolving turntables | *The Phantom of the Annex*, *Montana!* (High-tier spectacles) |

### Interactive Component & State Mapping

1. **`ChairmanOnboardingModal`**:
   - Manages the opening induction ceremony: text input for theater name, SVG cards for the 5 civic emblems, clickable swatches for the 8 civic brand colors, and the **"Skip Building Tutorial (Freeform Architect Mode)"** checkbox.
   - If "Skip Tutorial" is enabled, initializes `tutorialPhase = 'TUTORIAL_COMPLETE'`, unlocks all bottom dock build tabs, and awards the $5,000 inaugural funds.
2. **`TutorialFSMManager`**:
   - Governs the 10-phase sequential tutorial with an interactive top HUD banner when active, or displays a clean Freeform Architect mode status bar.
3. **`VenueValidator` Integration**:
   - Live audit service hooked up to the "Call Civic Inspector" button.
   - Validates all 8 building conditions, issues advisory warnings, and awards the $5,000 inaugural season grant (if not already claimed via tutorial skip).
4. **`ProductionPipelineController`**:
   - Unlocked upon completing the tutorial or immediately in Freeform mode once layout passes validation.
   - Manages the 4-show annual calendar (Spring, Summer, Fall, Winter) and executes the 7-step production pipeline.
5. **`SightlineVisibilityController`**:
   - Supports `W` (Wall height: Full, Cutaway, Down) and `L` (Label toggle: All, Warnings, Off) hotkeys for transparent interior inspection.
