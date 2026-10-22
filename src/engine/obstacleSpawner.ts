import {
  ColorDefinition,
  GameModeProfile,
  ObstacleEntity,
  PhysicsConfig,
  ShapeDefinition,
  VerticalTierDefinition,
  VerticalTierId,
} from '../config/types';
import { estimateTierFlightDurationSec, getSpeedProgression } from './physicsEngine';

/**
 * Computes the logical horizontal distance (px) between the previous obstacle
 * and the next obstacle so the player can always land safely before initiating
 * the next jump, even at high speeds.
 */
export function computeLogicalObstacleSpacing(
  previousTierId: VerticalTierId,
  nextTierId: VerticalTierId,
  obstaclesCleared: number,
  modeProfile: GameModeProfile,
  physics: PhysicsConfig
): number {
  const { difficulty } = modeProfile;
  const { speedPxPerSec, speedLevel } = getSpeedProgression(obstaclesCleared, difficulty);

  // Time needed to finish landing from the previous obstacle's jump
  const landingTimeFromPrev = estimateTierFlightDurationSec(previousTierId, physics) * 0.58;

  // Time needed to ascend to the next obstacle's apex
  const ascentTimeToNext = estimateTierFlightDurationSec(nextTierId, physics) * 0.52;

  // Progressive reaction buffer: starts generous and tightens slightly each speed level
  const reactionDecay = Math.min(
    difficulty.reactionTimeBufferSec - difficulty.minReactionTimeBufferSec,
    (speedLevel - 1) * 0.045
  );
  const reactionBufferSec = Math.max(
    difficulty.minReactionTimeBufferSec,
    difficulty.reactionTimeBufferSec - reactionDecay
  );

  const totalRequiredTimeSec = landingTimeFromPrev + ascentTimeToNext + reactionBufferSec;
  const calculatedGapPx = speedPxPerSec * totalRequiredTimeSec + physics.obstacleWidth;

  // Enforce comfortable minimum and maximum visual spacing bounds inside the 880px corridor
  return Math.max(265, Math.min(540, Math.round(calculatedGapPx)));
}

/**
 * Spawns the next obstacle driven purely by the active GameModeProfile:
 * - Respects `modeProfile.allowedTiers` (e.g., GROUND only for Shape/Color practice)
 * - Respects `modeProfile.allowColorShift` (locks to `lockedColorId` when false)
 * - Respects `modeProfile.allowShapeShift` (locks to `lockedShapeId` when false)
 */
export function createNextObstacle(params: {
  sequenceNumber: number;
  previousObstacle: ObstacleEntity | null;
  obstaclesCleared: number;
  activeColors: ColorDefinition[];
  activeShapes: ShapeDefinition[];
  tiers: VerticalTierDefinition[];
  modeProfile: GameModeProfile;
  physics: PhysicsConfig;
  lockedColorId?: string;
  lockedShapeId?: string;
}): ObstacleEntity {
  const {
    sequenceNumber,
    previousObstacle,
    obstaclesCleared,
    activeColors,
    activeShapes,
    tiers,
    modeProfile,
    physics,
    lockedColorId,
    lockedShapeId,
  } = params;

  // 1. Filter tiers allowed by the active mode profile
  const permittedTiers = tiers.filter((t) => modeProfile.allowedTiers.includes(t.id));
  let candidateTiers = permittedTiers.length > 0 ? permittedTiers : [tiers[0]];

  if (!modeProfile.isPractice && sequenceNumber === 1) {
    const gentleStart = candidateTiers.filter(
      (t) => t.id === 'GROUND' || t.id === 'MIDDLE'
    );
    if (gentleStart.length > 0) candidateTiers = gentleStart;
  }

  // In Jump Practice, avoid repeating the exact same tier 3 times in a row so all jump heights are practiced
  if (
    modeProfile.practiceSubMode === 'JUMP' &&
    previousObstacle &&
    candidateTiers.length > 1
  ) {
    const variedTiers = candidateTiers.filter((t) => t.id !== previousObstacle.tierId);
    if (variedTiers.length > 0 && Math.random() < 0.75) {
      candidateTiers = variedTiers;
    }
  }

  const chosenTier =
    candidateTiers[Math.floor(Math.random() * candidateTiers.length)] || tiers[0];

  // 2. Determine Color based on modeProfile.allowColorShift
  let chosenColor: ColorDefinition;
  if (!modeProfile.allowColorShift) {
    chosenColor =
      activeColors.find((c) => c.id === lockedColorId) || activeColors[0];
  } else {
    let colorPool = activeColors;
    // In Color-only practice, ensure each new obstacle requires shifting to a different color
    if (previousObstacle && activeColors.length > 1 && !modeProfile.allowShapeShift) {
      colorPool = activeColors.filter((c) => c.id !== previousObstacle.colorId);
    }
    chosenColor =
      colorPool[Math.floor(Math.random() * colorPool.length)] || activeColors[0];
  }

  // 3. Determine Shape based on modeProfile.allowShapeShift
  let chosenShape: ShapeDefinition;
  if (!modeProfile.allowShapeShift) {
    chosenShape =
      activeShapes.find((s) => s.id === lockedShapeId) || activeShapes[0];
  } else {
    let shapePool = activeShapes;
    // In Shape-only practice, ensure each new obstacle requires shifting to a different shape
    if (previousObstacle && activeShapes.length > 1 && !modeProfile.allowColorShift) {
      shapePool = activeShapes.filter((s) => s.id !== previousObstacle.shapeId);
    }
    chosenShape =
      shapePool[Math.floor(Math.random() * shapePool.length)] || activeShapes[0];
  }

  // When both Color and Shape can shift, avoid identical back-to-back combo
  if (
    modeProfile.allowColorShift &&
    modeProfile.allowShapeShift &&
    previousObstacle &&
    activeColors.length > 1 &&
    activeShapes.length > 1 &&
    chosenColor.id === previousObstacle.colorId &&
    chosenShape.id === previousObstacle.shapeId
  ) {
    const otherColors = activeColors.filter((c) => c.id !== previousObstacle.colorId);
    chosenColor = otherColors[Math.floor(Math.random() * otherColors.length)];
  }

  const prevTierId: VerticalTierId = previousObstacle ? previousObstacle.tierId : 'GROUND';
  const spacing = computeLogicalObstacleSpacing(
    prevTierId,
    chosenTier.id,
    obstaclesCleared,
    modeProfile,
    physics
  );

  const startX = previousObstacle
    ? Math.max(physics.corridorWidth + 40, previousObstacle.x + spacing)
    : physics.corridorWidth - 60;

  return {
    id: `obs-${sequenceNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sequenceNumber,
    x: startX,
    width: physics.obstacleWidth,
    colorId: chosenColor.id,
    shapeId: chosenShape.id,
    tierId: chosenTier.id,
    cleared: false,
    proximityUnlocked: false,
  };
}
