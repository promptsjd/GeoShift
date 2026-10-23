import { getColorById } from '../config/colorRegistry';
import { getShapeById } from '../config/shapeRegistry';
import {
  ColorDefinition,
  DifficultyConfig,
  FailureDiagnostic,
  PhysicsConfig,
  PlayerEntity,
  ShapeDefinition,
  TargetPromptEntity,
} from '../config/types';

/**
 * Computes progressive single-jump apex height & timing for Jump Mode.
 * Requirement:
 * - Raises the entity to a high apex in one single continuous jump.
 * - Every 10 correct matches, reduces the height of the jump a little
 *   (not too much, not like half—just enough to make it progressively challenging yet fair).
 * - Includes a brief, natural ground rebound pause before the next jump.
 */
export function getAutoJumpProgression(
  matchesCompleted: number,
  difficulty: DifficultyConfig
): {
  speedLevel: number;
  matchesUntilNextStep: number;
  /** Target jump apex height (px above floor) reached in one go; reduces slightly every 10 matches */
  targetApexHeight: number;
  /** Time scale for the airborne jump arc */
  flightTimeScale: number;
  /** Brief pause on the ground (ms) after landing before the next automatic jump starts */
  groundSettlePauseMs: number;
  /** Horizontal X position of the target on the right side */
  targetCenterX: number;
} {
  const stepSize = Math.max(1, difficulty.obstaclesPerSpeedStep); // 10 matches
  const completedSteps = Math.floor(matchesCompleted / stepSize);
  const speedLevel = completedSteps + 1;
  const inStep = matchesCompleted % stepSize;

  // Starts high in the corridor (238px above floor) in one continuous jump,
  // and reduces by 16px every 10 correct matches (floored at 134px so it never halves or feels overwhelming).
  const targetApexHeight = Math.max(134, Math.round(238 - completedSteps * 16));

  // Smooth, readable airborne pace so the single continuous jump gives comfortable time to match Color & Shape,
  // while the reduced apex height every 10 matches naturally shortens the jump arc a bit.
  const flightTimeScale = Math.min(0.78, 0.54 + completedSteps * 0.022);

  // Brief fraction-of-a-second pause on the floor so landing squash-and-rebound feels natural before re-jumping
  const groundSettlePauseMs = Math.max(195, Math.round(270 - completedSteps * 12));

  // Keep target cleanly positioned on the right side
  const targetCenterX = 685;

  return {
    speedLevel,
    matchesUntilNextStep: stepSize - inStep,
    targetApexHeight,
    flightTimeScale,
    groundSettlePauseMs,
    targetCenterX,
  };
}

/**
 * Generates the next Target Color & Shape for Jump Mode.
 * Guarantees that the new target never matches BOTH the player's current Color and Shape
 * (so the player always has to actively shift at least one dimension during the jump).
 */
export function createNextTargetPrompt(params: {
  sequenceNumber: number;
  currentPlayerColorId: string;
  currentPlayerShapeId: string;
  previousTarget: TargetPromptEntity | null;
  activeColors: ColorDefinition[];
  activeShapes: ShapeDefinition[];
}): TargetPromptEntity {
  const {
    sequenceNumber,
    currentPlayerColorId,
    currentPlayerShapeId,
    previousTarget,
    activeColors,
    activeShapes,
  } = params;

  const combinations: Array<{ colorId: string; shapeId: string }> = [];

  for (const col of activeColors) {
    for (const shp of activeShapes) {
      // Never spawn a target that is already identical to the player's current color + shape
      if (col.id === currentPlayerColorId && shp.id === currentPlayerShapeId) {
        continue;
      }
      // Also avoid repeating the exact previous target combo back-to-back
      if (
        previousTarget &&
        col.id === previousTarget.colorId &&
        shp.id === previousTarget.shapeId
      ) {
        continue;
      }
      combinations.push({ colorId: col.id, shapeId: shp.id });
    }
  }

  // Prefer combinations where BOTH color and shape differ most of the time so both carousels are engaged
  const bothDifferent = combinations.filter(
    (c) =>
      c.colorId !== currentPlayerColorId && c.shapeId !== currentPlayerShapeId
  );

  const pool =
    bothDifferent.length > 0 && Math.random() < 0.78
      ? bothDifferent
      : combinations.length > 0
      ? combinations
      : [
          {
            colorId: activeColors[0].id,
            shapeId: activeShapes[0].id,
          },
        ];

  const chosen = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `target-${sequenceNumber}-${Date.now()}`,
    sequenceNumber,
    colorId: chosen.colorId,
    shapeId: chosen.shapeId,
    flightProgress: 0,
    lastOutcome: previousTarget?.lastOutcome || 'NONE',
    lastOutcomeTimeMs: previousTarget?.lastOutcomeTimeMs,
  };
}

/**
 * Evaluates whether the player's active Color and Shape match the Target Prompt upon landing.
 */
export function evaluateAutoJumpLanding(params: {
  player: PlayerEntity;
  target: TargetPromptEntity;
  activeColors: ColorDefinition[];
  activeShapes: ShapeDefinition[];
}): {
  matched: boolean;
  diagnostic: FailureDiagnostic;
} {
  const { player, target, activeColors, activeShapes } = params;
  const playerColor = activeColors[player.colorIndex] || activeColors[0];
  const playerShape = activeShapes[player.shapeIndex] || activeShapes[0];

  const colorMatched = playerColor.id === target.colorId;
  const shapeMatched = playerShape.id === target.shapeId;
  const matched = colorMatched && shapeMatched;

  const expectedColor = getColorById(target.colorId);
  const actualColor = getColorById(playerColor.id);
  const expectedShape = getShapeById(target.shapeId);
  const actualShape = getShapeById(playerShape.id);

  let headline = 'Target Matched';
  let detail = `Matched ${expectedColor.name} ${expectedShape.name}.`;
  let type: FailureDiagnostic['type'] = 'MULTI_MISMATCH';

  if (!colorMatched && !shapeMatched) {
    type = 'MULTI_MISMATCH';
    headline = 'Color & Shape Mismatch';
    detail = `Target was ${expectedColor.name} ${expectedShape.name}, landed as ${actualColor.name} ${actualShape.name}.`;
  } else if (!colorMatched) {
    type = 'COLOR_MISMATCH';
    headline = 'Color Mismatch';
    detail = `Target was ${expectedColor.name}, landed as ${actualColor.name}.`;
  } else if (!shapeMatched) {
    type = 'SHAPE_MISMATCH';
    headline = 'Shape Mismatch';
    detail = `Target was ${expectedShape.name}, landed as ${actualShape.name}.`;
  }

  return {
    matched,
    diagnostic: {
      type,
      headline,
      detail,
      expectedColorId: target.colorId,
      actualColorId: playerColor.id,
      expectedShapeId: target.shapeId,
      actualShapeId: playerShape.id,
      expectedTierId: 'TOP',
      actualHeightAboveFloor: 0,
      colorMatched,
      shapeMatched,
      heightMatched: true,
    },
  };
}

/**
 * Estimates normalized 0..1 progress through the single continuous jump arc
 * using instantaneous vertical velocity relative to launch velocity.
 */
export function estimateAutoJumpFlightProgress(
  player: PlayerEntity,
  physics: PhysicsConfig,
  targetApexHeight: number = 238
): number {
  if (player.isGrounded && player.jumpsUsed === 0) {
    return 0;
  }

  const launchV = Math.sqrt(2 * physics.gravity * Math.max(80, targetApexHeight));
  if (launchV <= 1) return 0;

  if (player.velocityY >= 0) {
    const riseFrac = 1 - Math.min(1, player.velocityY / launchV);
    return Math.max(0.01, Math.min(0.5, riseFrac * 0.5));
  } else {
    const fallFrac = Math.min(1, Math.abs(player.velocityY) / launchV);
    return Math.max(0.5, Math.min(1, 0.5 + fallFrac * 0.5));
  }
}
