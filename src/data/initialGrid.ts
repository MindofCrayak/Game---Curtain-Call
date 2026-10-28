import { StageTile, RoomType } from '../types/theater';

export const GRID_WIDTH = 16;
export const GRID_HEIGHT = 14;

export function createInitialGrid(): StageTile[] {
  const tiles: StageTile[] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      let roomType: RoomType = 'EMPTY_FLOOR';
      let fixtureId: string | null = null;
      let hasPartitionWall = false;

      // Outer bounding walls
      if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
        // Leave doorway at bottom center for patrons
        if (!(y === GRID_HEIGHT - 1 && (x === 7 || x === 8))) {
          hasPartitionWall = true;
        }
      }

      // Zone designations
      if (x >= 4 && x <= 11 && y >= 1 && y <= 4) {
        roomType = 'MAIN_STAGE';
      } else if (x >= 1 && x <= 3 && y >= 1 && y <= 4) {
        roomType = 'SCENE_SHOP';
      } else if (x >= 12 && x <= 14 && y >= 1 && y <= 4) {
        roomType = 'WARDROBE_LOFT';
      } else if (x >= 1 && x <= 3 && y >= 6 && y <= 8) {
        roomType = 'REHEARSAL_STUDIO';
      } else if (x >= 1 && x <= 3 && y >= 9 && y <= 12) {
        roomType = 'GREEN_ROOM';
      } else if ((x === 4 || x === 11) && y === 5) {
        roomType = 'QUICK_CHANGE';
      } else if (x >= 4 && x <= 11 && y >= 6 && y <= 9) {
        roomType = 'AUDITORIUM';
      } else if (x >= 12 && x <= 14 && y >= 9 && y <= 12) {
        roomType = 'CONCESSIONS';
      } else if (x >= 4 && x <= 11 && y >= 10 && y <= 12) {
        roomType = 'FOYER';
      }

      // Partition walls between zones (with doorways)
      // Horizontal divide below stage (y = 5)
      if (y === 5 && (x <= 3 || x >= 12)) {
        hasPartitionWall = true;
      }
      // Wall between Scene shop and Stage (x = 3, y = 1..4, door at y=3)
      if (x === 3 && y >= 1 && y <= 4 && y !== 3) {
        hasPartitionWall = true;
      }
      // Wall between Stage and Wardrobe (x = 12, y = 1..4, door at y=3)
      if (x === 12 && y >= 1 && y <= 4 && y !== 3) {
        hasPartitionWall = true;
      }
      // Wall dividing Left backstage rooms (y = 8, x = 1..3, door at x=2)
      if (y === 8 && x >= 1 && x <= 3 && x !== 2) {
        hasPartitionWall = true;
      }
      // Wall separating Rehearsal & Green room from Auditorium (x = 3, y = 6..12, door at y=9)
      if (x === 3 && y >= 6 && y <= 12 && y !== 9) {
        hasPartitionWall = true;
      }
      // Wall separating Concessions from Auditorium (x = 12, y = 6..12, door at y=10)
      if (x === 12 && y >= 6 && y <= 12 && y !== 10) {
        hasPartitionWall = true;
      }

      // Initial Fixtures placement
      // Center stage Ghost Light (Center Stage x=7, y=2)
      if (x === 7 && y === 2) {
        fixtureId = 'ghost_light';
      }
      // Stage wings clip-on lights
      if (x === 4 && y === 1) fixtureId = 'light_clip_on';
      if (x === 11 && y === 1) fixtureId = 'light_clip_on';
      // Scene shop cardboard flat & card table
      if (x === 2 && y === 1) fixtureId = 'scenic_cardboard_flat';
      if (x === 1 && y === 2) fixtureId = 'stage_card_table';
      // Green room water cooler
      if (x === 1 && y === 10) fixtureId = 'water_cooler';
      // Concessions card table
      if (x === 13 && y === 10) fixtureId = 'concession_table';
      // Acoustic panel on the Scene Shop dividing wall
      if (x === 3 && y === 4) fixtureId = 'acoustic_panel';

      // Auditorium folding chairs (18 starter seats across rows y=7, 8, 9)
      if (y >= 7 && y <= 9 && x >= 5 && x <= 10) {
        fixtureId = 'seat_folding';
      }

      // Baseline environmental conditions
      // Main stage is warm from lights; shop has saw dust & noise
      let temp = 70.0;
      let noiseDb = 42;
      let dirt = 0.02;
      let aesthetic = 25;

      if (roomType === 'MAIN_STAGE') {
        temp = 71.5;
        aesthetic = 40;
      } else if (roomType === 'SCENE_SHOP') {
        noiseDb = 54; // carpentry shop noise
        dirt = 0.15;  // sawdust
        temp = 67.5;
      } else if (roomType === 'GREEN_ROOM') {
        temp = 70.0;
        aesthetic = 35;
      } else if (roomType === 'AUDITORIUM') {
        temp = 69.5;
        aesthetic = 45;
      }

      tiles.push({
        x,
        y,
        roomType,
        fixtureId,
        hasPartitionWall,
        temp,
        noiseDb,
        dirt,
        aesthetic
      });
    }
  }

  return tiles;
}
