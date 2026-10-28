// tslint:disable
/* eslint-disable */
import {
  PlacedStage,
  PlacedRoom,
  PlacedWing,
  ShopDoor,
  BuildingAuditResult,
  GridTileItem,
} from '../types';

export class VenueValidator {
  public static audit(
    stage: PlacedStage | null,
    rooms: PlacedRoom[],
    wings: PlacedWing[],
    shopDoors: ShopDoor[],
    seatCount: number,
    gridItems: GridTileItem[] = []
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
      result.criticalErrors.push('Stage Platform has not been anchored.');
      return result;
    }
    result.stageValid = true;

    // 2. Wings Check
    const leftWing = wings.find((w) => w.side === 'STAGE_LEFT') ||
      rooms.find((r) => r.type === 'STAGE_LEFT_WING');
    const rightWing = wings.find((w) => w.side === 'STAGE_RIGHT') ||
      rooms.find((r) => r.type === 'STAGE_RIGHT_WING');

    const leftWidth = leftWing
      ? ('width' in leftWing ? leftWing.width : leftWing.bounds.x2 - leftWing.bounds.x1 + 1)
      : 0;
    const rightWidth = rightWing
      ? ('width' in rightWing ? rightWing.width : rightWing.bounds.x2 - rightWing.bounds.x1 + 1)
      : 0;

    if (leftWidth < 2 || rightWidth < 2) {
      result.criticalErrors.push(
        `Both Stage Left and Stage Right wings must be at least 2 tiles wide. (Left: ${leftWidth}, Right: ${rightWidth})`
      );
    } else {
      result.wingsValid = true;
    }

    // 3. House (Auditorium) Check
    const house = rooms.find((r) => r.type === 'HOUSE' || (r.type as string) === 'AUDITORIUM');
    if (!house) {
      result.criticalErrors.push('Auditorium (The House) has not been enclosed.');
    } else {
      const houseWidth = house.bounds.x2 - house.bounds.x1 + 1;
      if (houseWidth < stage.width) {
        result.criticalErrors.push(
          `The House must be at least as wide as the stage (${stage.width} tiles). Current: ${houseWidth} tiles.`
        );
      } else if (house.bounds.z1 !== stage.curtainZ + 1 && house.bounds.z1 > stage.curtainZ + 2) {
        result.criticalErrors.push('The House front boundary must directly touch the proscenium line.');
      } else {
        result.houseValid = true;
      }
    }

    // 4. Seating Density
    if (seatCount < 10) {
      result.criticalErrors.push(`Auditorium must contain at least 10 accessible seats. (Current: ${seatCount})`);
    }

    // 5. Lobby Check
    const lobby = rooms.find((r) => r.type === 'LOBBY');
    if (!lobby) {
      result.criticalErrors.push('A Front of House Lobby must connect the exterior to the House.');
    } else {
      result.lobbyValid = true;
    }

    // 6. Scene Shop & Specialized Shop Door Check
    const shop = rooms.find((r) => r.type === 'SCENE_SHOP');
    if (!shop) {
      result.criticalErrors.push('A Scene Shop must be constructed in Back of House.');
    } else {
      // Check if any shop door exists in shopDoors or in shop.doors or in gridItems
      const hasDoor =
        shopDoors.some((d) => d.connectsShopToStage) ||
        shop.doors.some((d) => d.isShopDoor) ||
        gridItems.some((i) => i.itemId.startsWith('door_shop_'));

      if (!hasDoor) {
        result.criticalErrors.push('Scene Shop must connect to the stage or wings through a designated Shop Door.');
      } else {
        result.shopDoorValid = true;
      }
    }

    // 7. Restroom Check
    const restrooms = rooms.filter((r) => r.type === 'RESTROOM');
    const hasToilet = gridItems.some((i) => i.itemId === 'porcelain_toilet' || i.itemId === 'restroom_stall');
    if (restrooms.length === 0 && !hasToilet) {
      result.criticalErrors.push('Local municipal code requires at least one working Restroom.');
    } else {
      result.restroomValid = true;
    }

    // 8. Actor Dressing & Green Room Logistics
    const dedicatedDressing = rooms.find((r) => r.type === 'DRESSING_ROOM');
    const greenRoom = rooms.find((r) => r.type === 'GREEN_ROOM');
    const hasGarmentRack =
      (greenRoom && greenRoom.placedItemIds.some((id) => id.includes('garment') || id.includes('rack'))) ||
      gridItems.some((i) => i.itemId === 'rolling_garment_rack');
    const hasVanity = gridItems.some((i) => i.itemId === 'lighted_vanity' || i.itemId === 'makeup_vanity');

    if (dedicatedDressing || hasVanity) {
      result.hasDressingFacility = true;
      result.isMakeshiftDressing = false;
    } else if (greenRoom || hasGarmentRack) {
      result.hasDressingFacility = true;
      result.isMakeshiftDressing = true;
      result.advisoryWarnings.push(
        'Using Green Room with garment racks as makeshift dressing. High-ego actors will suffer weekly morale decay.'
      );
    } else {
      result.criticalErrors.push('No dressing facility or garment rack found. Actors have nowhere to change.');
    }

    // Overall check
    result.passed = result.criticalErrors.length === 0;
    return result;
  }
}
