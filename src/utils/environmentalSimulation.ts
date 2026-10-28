import {
  GridTileItem,
  RoomType,
  TileEnvironmentalData,
  FacilityAudit,
  Season,
  ProductionPhase,
} from '../types';

export const GRID_WIDTH = 16;
export const GRID_DEPTH = 24;

// Default Room Layout for Unit 12B Storefront
export function createDefaultTileRooms(): Record<string, RoomType> {
  const rooms: Record<string, RoomType> = {};
  for (let z = 0; z < GRID_DEPTH; z++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const key = `${x}_${z}`;
      if (z <= 4) {
        // Backstage
        if (x < 6) rooms[key] = 'SCENE_SHOP';
        else if (x > 10) rooms[key] = 'WARDROBE_LOFT';
        else rooms[key] = 'GREEN_ROOM';
      } else if (z >= 5 && z <= 11) {
        // Stage & Wings
        if (x < 3) rooms[key] = 'QUICK_CHANGE';
        else if (x > 12) rooms[key] = 'QUICK_CHANGE';
        else rooms[key] = 'UNZONED'; // Performance Stage
      } else if (z >= 12 && z <= 19) {
        // Auditorium Seating
        rooms[key] = 'AUDITORIUM';
      } else {
        // Lobby & Front of House
        if (x <= 4) rooms[key] = 'RESTROOM';
        else if (x >= 12) rooms[key] = 'RESTROOM';
        else rooms[key] = 'LOBBY';
      }
    }
  }
  return rooms;
}

// Compute the 4-layer Environmental State Machine for all 16x24 tiles
export function computeEnvironmentalState(
  gridItems: GridTileItem[],
  tileRooms: Record<string, RoomType>,
  season: Season = 'Spring',
  phase: ProductionPhase = 'SEASON_IDLE'
): TileEnvironmentalData[][] {
  const matrix: TileEnvironmentalData[][] = [];

  // Seasonal baseline outdoor temperature
  let baseTemp = 68;
  if (season === 'Winter') baseTemp = 52;
  else if (season === 'Summer') baseTemp = 83;
  else if (season === 'Fall') baseTemp = 64;
  else if (season === 'Spring') baseTemp = 68;

  // Item indexing for fast spatial queries
  const wallSet = new Set<string>();
  const soundproofWallSet = new Set<string>();
  const doorSet = new Set<string>();
  const acousticDoorSet = new Set<string>();

  const radiators: { x: number; z: number }[] = [];
  const hvacUnits: { x: number; z: number }[] = [];
  const saws: { x: number; z: number }[] = [];
  const sewingStations: { x: number; z: number }[] = [];
  const acousticPanels: { x: number; z: number }[] = [];
  const chandeliers: { x: number; z: number }[] = [];
  const playbills: { x: number; z: number }[] = [];
  const velvetRopes: { x: number; z: number }[] = [];
  const trashCans: { x: number; z: number }[] = [];
  const janitorClosets: { x: number; z: number }[] = [];
  const vanities: { x: number; z: number }[] = [];
  const snackBars: { x: number; z: number }[] = [];

  for (const item of gridItems) {
    const key = `${item.x}_${item.z}`;
    if (item.itemId === 'wall_partition') wallSet.add(key);
    else if (item.itemId === 'wall_soundproof') soundproofWallSet.add(key);
    else if (item.itemId === 'door_standard') doorSet.add(key);
    else if (item.itemId === 'door_acoustic') acousticDoorSet.add(key);
    else if (item.itemId === 'electric_radiator') radiators.push({ x: item.x, z: item.z });
    else if (item.itemId === 'hvac_blower') hvacUnits.push({ x: item.x, z: item.z });
    else if (item.itemId === 'scene_shop_saw') saws.push({ x: item.x, z: item.z });
    else if (item.itemId === 'wardrobe_sewing') sewingStations.push({ x: item.x, z: item.z });
    else if (item.itemId === 'acoustic_panel') acousticPanels.push({ x: item.x, z: item.z });
    else if (item.itemId === 'chandelier_lobby') chandeliers.push({ x: item.x, z: item.z });
    else if (item.itemId === 'framed_playbill') playbills.push({ x: item.x, z: item.z });
    else if (item.itemId === 'velvet_rope') velvetRopes.push({ x: item.x, z: item.z });
    else if (item.itemId === 'trash_can') trashCans.push({ x: item.x, z: item.z });
    else if (item.itemId === 'janitor_closet') janitorClosets.push({ x: item.x, z: item.z });
    else if (item.itemId === 'makeup_vanity') vanities.push({ x: item.x, z: item.z });
    else if (item.itemId === 'table_snack' || item.itemId === 'bar_cocktail') {
      snackBars.push({ x: item.x, z: item.z });
    }
  }

  // Helper distance
  const dist = (x1: number, z1: number, x2: number, z2: number) =>
    Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2);

  // Stage lights emit heat during active rehearsal or show phases
  const isShowActive =
    phase === 'PRE_PROD_ALPHA' ||
    phase === 'REHEARSAL_BETA' ||
    phase === 'TECH_WEEK' ||
    phase === 'BOX_OFFICE_RUN';

  for (let x = 0; x < GRID_WIDTH; x++) {
    matrix[x] = [];
    for (let z = 0; z < GRID_DEPTH; z++) {
      const key = `${x}_${z}`;
      const roomType = tileRooms[key] || 'UNZONED';
      const isWall = wallSet.has(key) || soundproofWallSet.has(key);
      const isSoundproof = soundproofWallSet.has(key);
      const isDoor = doorSet.has(key) || acousticDoorSet.has(key);

      // --- 1. Temperature Index (°F) Target: 68°F ---
      let temp = baseTemp;
      // Loading dock / back wall draft in winter
      if (season === 'Winter' && z <= 3) temp -= 6;
      // Stage lighting heat emission
      if (isShowActive && z >= 5 && z <= 11 && x >= 3 && x <= 12) {
        temp += 8;
      }
      // Radiator heating effect (+16°F with radius 4 falloff)
      for (const rad of radiators) {
        const d = dist(x, z, rad.x, rad.z);
        if (d < 4.5) {
          temp += Math.max(0, (4.5 - d) * 3.8);
        }
      }
      // HVAC blower climate stabilization (pulls towards 68°F within radius 5.5)
      for (const hvac of hvacUnits) {
        const d = dist(x, z, hvac.x, hvac.z);
        if (d < 5.5) {
          const power = (5.5 - d) / 5.5;
          temp = temp * (1 - power * 0.7) + 68 * (power * 0.7);
        }
      }
      temp = Math.round(temp * 10) / 10;

      // --- 2. Acoustic Decibel Layer (Target < 45 dB) ---
      let noiseDb = 32; // baseline quiet indoor ambient
      // Table saws emit 85 dB
      for (const saw of saws) {
        const d = dist(x, z, saw.x, saw.z);
        if (d < 9) {
          let soundPower = Math.max(0, 85 - d * 5.5);
          // Check if shielded by soundproof or standard walls between
          if (isWall || isSoundproof) soundPower -= 25;
          noiseDb = Math.max(noiseDb, soundPower);
        }
      }
      // Stage rehearsal noise (65 dB)
      if (isShowActive && z >= 5 && z <= 11) {
        noiseDb = Math.max(noiseDb, 65);
      }
      // Sewing machines (52 dB)
      for (const sew of sewingStations) {
        const d = dist(x, z, sew.x, sew.z);
        if (d < 4) noiseDb = Math.max(noiseDb, 52 - d * 4);
      }
      // Acoustic panels dampen room noise by -8 dB
      for (const panel of acousticPanels) {
        const d = dist(x, z, panel.x, panel.z);
        if (d < 4) noiseDb = Math.max(28, noiseDb - 6);
      }
      noiseDb = Math.round(noiseDb);

      // --- 3. Aesthetic Quality Aura (0 to 100) ---
      let aesthetic = 12; // base
      if (roomType === 'AUDITORIUM') aesthetic += 15;
      if (roomType === 'LOBBY') aesthetic += 20;

      for (const ch of chandeliers) {
        const d = dist(x, z, ch.x, ch.z);
        if (d < 6) aesthetic += Math.max(0, Math.round((6 - d) * 7));
      }
      for (const pb of playbills) {
        const d = dist(x, z, pb.x, pb.z);
        if (d < 4) aesthetic += Math.max(0, Math.round((4 - d) * 5));
      }
      for (const vr of velvetRopes) {
        const d = dist(x, z, vr.x, vr.z);
        if (d < 3) aesthetic += Math.max(0, Math.round((3 - d) * 6));
      }
      aesthetic = Math.min(100, aesthetic);

      // --- 4. Cleanliness & Clutter Matrix (0 to 100) ---
      let cleanliness = 95; // base spotless
      // Sawdust generation near saws
      for (const saw of saws) {
        const d = dist(x, z, saw.x, saw.z);
        if (d < 4) cleanliness -= Math.round((4 - d) * 7);
      }
      // Cosmetic trash near vanity
      for (const v of vanities) {
        const d = dist(x, z, v.x, v.z);
        if (d < 3) cleanliness -= Math.round((3 - d) * 5);
      }
      // Snack wrappers near bars / auditorium seats
      for (const sb of snackBars) {
        const d = dist(x, z, sb.x, sb.z);
        if (d < 3) cleanliness -= Math.round((3 - d) * 4);
      }
      // Trash cans localize & clean debris
      for (const tc of trashCans) {
        const d = dist(x, z, tc.x, tc.z);
        if (d < 4.5) cleanliness += Math.round((4.5 - d) * 6);
      }
      // Janitor closet sweeps the facility
      if (janitorClosets.length > 0) {
        cleanliness += 15 * janitorClosets.length;
      }
      cleanliness = Math.max(10, Math.min(100, cleanliness));

      matrix[x][z] = {
        temperature: temp,
        noiseDecibels: noiseDb,
        aesthetic,
        cleanliness,
        roomType,
        hasWall: isWall,
        isSoundproofWall: isSoundproof,
        isDoor,
        isWalkable: !isWall || isDoor,
      };
    }
  }

  return matrix;
}

// Audit Facility Layout Meta, Task Segregation, and Pathfinding Bottlenecks
export function auditFacility(
  gridItems: GridTileItem[],
  tileRooms: Record<string, RoomType>,
  envMatrix: TileEnvironmentalData[][]
): FacilityAudit {
  // 1. Specialized Room Presence
  const roomCounts: Record<RoomType, number> = {
    UNZONED: 0,
    SCENE_SHOP: 0,
    WARDROBE_LOFT: 0,
    REHEARSAL_STUDIO: 0,
    TECH_BOOTH: 0,
    GREEN_ROOM: 0,
    DRESSING_ROOM: 0,
    QUICK_CHANGE: 0,
    AUDITORIUM: 0,
    LOBBY: 0,
    RESTROOM: 0,
    STAGE_LEFT_WING: 0,
    STAGE_RIGHT_WING: 0,
  };

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let z = 0; z < GRID_DEPTH; z++) {
      const rt = tileRooms[`${x}_${z}`] || 'UNZONED';
      roomCounts[rt]++;
    }
  }

  const isSceneShopZoned = roomCounts.SCENE_SHOP >= 4;
  const isRehearsalStudioActive = roomCounts.REHEARSAL_STUDIO >= 6;
  const isWardrobeLoftActive = roomCounts.WARDROBE_LOFT >= 4;
  const isSoundBoothIsolated = roomCounts.TECH_BOOTH >= 2;
  const isGreenRoomActive = roomCounts.GREEN_ROOM >= 4;

  // Check if Scene Shop has physical partition walls or acoustic isolation
  const hasWalls = gridItems.some(
    (i) => i.itemId === 'wall_partition' || i.itemId === 'wall_soundproof'
  );
  const isSceneShopSegregated = isSceneShopZoned && hasWalls;

  // The Progression Gate: Tier 1 Shared Resource Penalty vs Parallel Pipeline
  // If scene shop saw exists and actors rehearse on bare stage without a Rehearsal Studio or walls:
  const hasSaw = gridItems.some((i) => i.itemId === 'scene_shop_saw');
  const sharedResourcePenaltyActive = hasSaw && !isSceneShopSegregated && !isRehearsalStudioActive;
  const parallelPipelineActive = isRehearsalStudioActive;

  // 2. Quick-Change Wing Meta Check
  // Stage Left wing: X: 0-3, Z: 5-11
  // Stage Right wing: X: 12-15, Z: 5-11
  const hasQuickChangeWingLeft = gridItems.some(
    (i) => i.itemId === 'quick_change_booth' && i.x <= 3 && i.z >= 5 && i.z <= 11
  );
  const hasQuickChangeWingRight = gridItems.some(
    (i) => i.itemId === 'quick_change_booth' && i.x >= 12 && i.z >= 5 && i.z <= 11
  );
  const quickChangeEliminatesLateCues = hasQuickChangeWingLeft || hasQuickChangeWingRight;

  // 3. Environmental Temperature & Acoustic Audit
  let audTempSum = 0;
  let audTempCount = 0;
  let stageTempSum = 0;
  let stageTempCount = 0;
  let rehearsalNoiseMax = 0;
  let lobbyAestheticSum = 0;
  let lobbyAestheticCount = 0;
  let backstageAestheticSum = 0;
  let backstageAestheticCount = 0;
  let cleanlinessSum = 0;
  let totalTiles = 0;

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let z = 0; z < GRID_DEPTH; z++) {
      const tile = envMatrix[x]?.[z];
      if (!tile) continue;
      totalTiles++;
      cleanlinessSum += tile.cleanliness;

      if (tile.roomType === 'AUDITORIUM') {
        audTempSum += tile.temperature;
        audTempCount++;
      } else if (tile.roomType === 'UNZONED' && z >= 5 && z <= 11) {
        stageTempSum += tile.temperature;
        stageTempCount++;
      }

      if (tile.roomType === 'REHEARSAL_STUDIO' || tile.roomType === 'TECH_BOOTH') {
        if (tile.noiseDecibels > rehearsalNoiseMax) {
          rehearsalNoiseMax = tile.noiseDecibels;
        }
      }

      if (tile.roomType === 'LOBBY') {
        lobbyAestheticSum += tile.aesthetic;
        lobbyAestheticCount++;
      }

      if (
        tile.roomType === 'SCENE_SHOP' ||
        tile.roomType === 'WARDROBE_LOFT' ||
        tile.roomType === 'GREEN_ROOM'
      ) {
        backstageAestheticSum += tile.aesthetic;
        backstageAestheticCount++;
      }
    }
  }

  const averageAuditoriumTemp = audTempCount > 0 ? Math.round(audTempSum / audTempCount) : 68;
  const averageStageTemp = stageTempCount > 0 ? Math.round(stageTempSum / stageTempCount) : 68;

  // Thermal comfort score: 100 if temp is 68°F, penalizes if <60°F or >82°F
  const tempDeviation = Math.abs(averageAuditoriumTemp - 68);
  const thermalComfortScore = Math.max(0, Math.min(100, Math.round(100 - tempDeviation * 4)));

  // Acoustic interference risk: if noise > 55 dB in rehearsal studio
  const acousticInterferenceRisk = rehearsalNoiseMax > 55;

  const lobbyAestheticPrestige =
    lobbyAestheticCount > 0 ? Math.round(lobbyAestheticSum / lobbyAestheticCount) : 25;
  const backstageAestheticAvg =
    backstageAestheticCount > 0 ? Math.round(backstageAestheticSum / backstageAestheticCount) : 20;

  // Crew In the Zone Bonus if backstage aesthetic > 60
  const crewInTheZoneBonus = backstageAestheticAvg >= 55;

  const cleanlinessSanitaryRating =
    totalTiles > 0 ? Math.round(cleanlinessSum / totalTiles) : 85;

  // 4. Intermission Rush & Fluid Dynamics
  const restroomStallCount = gridItems.filter((i) => i.itemId === 'restroom_stall').length;
  const concessionBarCount = gridItems.filter(
    (i) => i.itemId === 'bar_cocktail' || i.itemId === 'table_snack'
  ).length;

  // Aisle width check: Check if center aisle (X: 7, 8) and cross-aisle (Z: 15, 16) are clear of furniture
  let aisleBlockedTiles = 0;
  for (const item of gridItems) {
    if (item.itemId !== 'aisle_carpet') {
      if ((item.x === 7 || item.x === 8) && item.z >= 12 && item.z <= 19) {
        aisleBlockedTiles++;
      }
      if ((item.z === 15 || item.z === 16) && item.x >= 2 && item.x <= 13) {
        aisleBlockedTiles++;
      }
    }
  }

  // Intermission Flow Rating
  let intermissionFlow = 70;
  if (restroomStallCount >= 2) intermissionFlow += 15;
  else if (restroomStallCount === 0) intermissionFlow -= 25;

  if (concessionBarCount >= 2) intermissionFlow += 15;
  else if (concessionBarCount === 0) intermissionFlow -= 20;

  if (aisleBlockedTiles > 0) intermissionFlow -= aisleBlockedTiles * 10;
  else intermissionFlow += 10;

  intermissionFlow = Math.max(15, Math.min(100, intermissionFlow));
  const concessionLossRisk = Math.max(0, Math.min(65, Math.round((100 - intermissionFlow) * 0.55)));

  return {
    isSceneShopSegregated,
    isRehearsalStudioActive,
    isWardrobeLoftActive,
    isSoundBoothIsolated,
    isGreenRoomActive,
    hasQuickChangeWingLeft,
    hasQuickChangeWingRight,
    quickChangeEliminatesLateCues,
    parallelPipelineActive,
    sharedResourcePenaltyActive,
    averageAuditoriumTemp,
    averageStageTemp,
    thermalComfortScore,
    acousticInterferenceRisk,
    maxRehearsalNoiseDb: rehearsalNoiseMax,
    lobbyAestheticPrestige,
    crewInTheZoneBonus,
    cleanlinessSanitaryRating,
    intermissionFlowRating: intermissionFlow,
    concessionLossRisk,
    restroomStallCount,
    concessionBarCount,
    aisleBottleneckCount: aisleBlockedTiles,
  };
}
