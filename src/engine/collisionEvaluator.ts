import { getColorById } from '../config/colorRegistry';
import { getShapeById } from '../config/shapeRegistry';
import { getTierById } from '../config/tierRegistry';
import {
  ColorDefinition,
  FailureDiagnostic,
  ObstacleEntity,
  PhysicsConfig,
  PlayerEntity,
  ShapeDefinition,
} from '../config/types';

export interface ObstacleEvaluationResult {
  status: 'NONE' | 'CLEARED' | 'FAILED';
  diagnostic?: FailureDiagnostic;
}

/**
 * Evaluates whether the player clears or collides with an obstacle across all modes
 * (Standard Game, Jump Practice, Full Practice, Color Practice, Shape Practice).
 *
 * Vertical Clearance Rule:
 * - An obstacle is cleared vertically as long as the player does not collide with
 *   its physical black wall blocks (`!hitsBottomPillar && !hitsTopCeiling`).
 * - Therefore:
 *   • A MIDDLE obstacle (short floor pillar, open space above) can be legally cleared
 *     by EITHER a Single Jump OR a Double Jump.
 *   • A TOP obstacle (tall floor pillar) requires a Double Jump to clear the tall pillar.
 *   • A GROUND obstacle (overhanging ceiling wall) requires staying below the ceiling wall.
 */
export function evaluatePlayerObstacleInteraction(params: {
  player: PlayerEntity;
  obstacle: ObstacleEntity;
  activeColors: ColorDefinition[];
  activeShapes: ShapeDefinition[];
  physics: PhysicsConfig;
}): ObstacleEvaluationResult {
  const { player, obstacle, activeColors, activeShapes, physics } = params;

  if (obstacle.cleared) {
    return { status: 'NONE' };
  }

  const playerColor = activeColors[player.colorIndex] || activeColors[0];
  const playerShape = activeShapes[player.shapeIndex] || activeShapes[0];
  const tier = getTierById(obstacle.tierId);

  const playerCenterX = physics.playerX;

  // Forgiving horizontal hitbox for crisp arcade feel
  const horizontalHitRadius = physics.playerRadius * 0.65;
  const playerLeft = playerCenterX - horizontalHitRadius;
  const playerRight = playerCenterX + horizontalHitRadius;

  const obsLeft = obstacle.x;
  const obsRight = obstacle.x + obstacle.width;
  const obsCenterX = obstacle.x + obstacle.width / 2;

  // Not yet horizontally overlapping the obstacle column
  if (playerRight < obsLeft || playerLeft > obsRight) {
    return { status: 'NONE' };
  }

  const colorMatched = playerColor.id === obstacle.colorId;
  const shapeMatched = playerShape.id === obstacle.shapeId;

  // Check if player collides with the solid black floor pillar or ceiling overhang
  const playerBottom = player.heightAboveFloor + 6; // 6px grace margin
  const playerTop = player.heightAboveFloor + physics.playerRadius * 2 - 6;

  const hitsBottomPillar =
    tier.wallGeometry.bottomPillarHeight > 0 &&
    playerBottom < tier.wallGeometry.bottomPillarHeight;

  const ceilingBottomY = physics.corridorHeight - tier.wallGeometry.topCeilingDrop;
  const hitsTopCeiling =
    tier.wallGeometry.topCeilingDrop > 0 && playerTop > ceilingBottomY;

  // Any height that clears the bottom pillar and avoids the top ceiling is a legal jump clearance
  const heightMatched = !hitsBottomPillar && !hitsTopCeiling;

  // Check if player hit the black wall
  if (!heightMatched) {
    return {
      status: 'FAILED',
      diagnostic: buildFailureDiagnostic({
        obstacle,
        playerColorId: playerColor.id,
        playerShapeId: playerShape.id,
        playerHeightAboveFloor: Math.round(player.heightAboveFloor),
        colorMatched,
        shapeMatched,
        heightMatched: false,
        hitWall: true,
      }),
    };
  }

  // Gate verification plane: when the obstacle center reaches or passes the player's center X
  const reachedGateCenter = obsCenterX <= playerCenterX + 10;

  if (reachedGateCenter) {
    if (colorMatched && shapeMatched && heightMatched) {
      return { status: 'CLEARED' };
    }

    return {
      status: 'FAILED',
      diagnostic: buildFailureDiagnostic({
        obstacle,
        playerColorId: playerColor.id,
        playerShapeId: playerShape.id,
        playerHeightAboveFloor: Math.round(player.heightAboveFloor),
        colorMatched,
        shapeMatched,
        heightMatched,
        hitWall: false,
      }),
    };
  }

  return { status: 'NONE' };
}

function buildFailureDiagnostic(params: {
  obstacle: ObstacleEntity;
  playerColorId: string;
  playerShapeId: string;
  playerHeightAboveFloor: number;
  colorMatched: boolean;
  shapeMatched: boolean;
  heightMatched: boolean;
  hitWall: boolean;
}): FailureDiagnostic {
  const {
    obstacle,
    playerColorId,
    playerShapeId,
    playerHeightAboveFloor,
    colorMatched,
    shapeMatched,
    heightMatched,
    hitWall,
  } = params;

  const expectedColor = getColorById(obstacle.colorId);
  const actualColor = getColorById(playerColorId);
  const expectedShape = getShapeById(obstacle.shapeId);
  const actualShape = getShapeById(playerShapeId);
  const expectedTier = getTierById(obstacle.tierId);

  const mismatches: string[] = [];
  if (!colorMatched) mismatches.push('Color');
  if (!shapeMatched) mismatches.push('Shape');
  if (!heightMatched) mismatches.push('Jump');

  if (hitWall) {
    const wallAction =
      obstacle.tierId === 'GROUND'
        ? 'Overhanging wall required staying on Ground (no jump).'
        : obstacle.tierId === 'MIDDLE'
        ? 'Mid-height pillar required a Jump (Space).'
        : 'Tall pillar required a Double Jump (2× Space).';

    return {
      type: 'WALL_COLLISION',
      headline: 'Wall Impact',
      detail: wallAction,
      expectedColorId: obstacle.colorId,
      actualColorId: playerColorId,
      expectedShapeId: obstacle.shapeId,
      actualShapeId: playerShapeId,
      expectedTierId: obstacle.tierId,
      actualHeightAboveFloor: playerHeightAboveFloor,
      colorMatched,
      shapeMatched,
      heightMatched: false,
    };
  }

  if (mismatches.length > 1) {
    return {
      type: 'MULTI_MISMATCH',
      headline: `${mismatches.join(' & ')} Mismatch`,
      detail: `Gate required ${expectedColor.name} ${expectedShape.name} at ${expectedTier.label}.`,
      expectedColorId: obstacle.colorId,
      actualColorId: playerColorId,
      expectedShapeId: obstacle.shapeId,
      actualShapeId: playerShapeId,
      expectedTierId: obstacle.tierId,
      actualHeightAboveFloor: playerHeightAboveFloor,
      colorMatched,
      shapeMatched,
      heightMatched,
    };
  }

  if (!colorMatched) {
    return {
      type: 'COLOR_MISMATCH',
      headline: 'Color Mismatch',
      detail: `Expected ${expectedColor.name}, but active color was ${actualColor.name}.`,
      expectedColorId: obstacle.colorId,
      actualColorId: playerColorId,
      expectedShapeId: obstacle.shapeId,
      actualShapeId: playerShapeId,
      expectedTierId: obstacle.tierId,
      actualHeightAboveFloor: playerHeightAboveFloor,
      colorMatched,
      shapeMatched,
      heightMatched,
    };
  }

  if (!shapeMatched) {
    return {
      type: 'SHAPE_MISMATCH',
      headline: 'Shape Mismatch',
      detail: `Expected ${expectedShape.name}, but active shape was ${actualShape.name}.`,
      expectedColorId: obstacle.colorId,
      actualColorId: playerColorId,
      expectedShapeId: obstacle.shapeId,
      actualShapeId: playerShapeId,
      expectedTierId: obstacle.tierId,
      actualHeightAboveFloor: playerHeightAboveFloor,
      colorMatched,
      shapeMatched,
      heightMatched,
    };
  }

  return {
    type: 'HEIGHT_MISMATCH',
    headline: 'Jump Mismatch',
    detail: `Gate required ${expectedTier.label} (${expectedTier.shortHint}).`,
    expectedColorId: obstacle.colorId,
    actualColorId: playerColorId,
    expectedShapeId: obstacle.shapeId,
    actualShapeId: playerShapeId,
    expectedTierId: obstacle.tierId,
    actualHeightAboveFloor: playerHeightAboveFloor,
    colorMatched,
    shapeMatched,
    heightMatched,
  };
}
