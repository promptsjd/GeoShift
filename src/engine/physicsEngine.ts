import {
  DifficultyConfig,
  PhysicsConfig,
  PlayerEntity,
  ShapeAnimationProfile,
  VerticalTierId,
} from '../config/types';
import { DEFAULT_SHAPE_ANIMATION_PROFILE } from '../config/visualConfig';
import { computePlayerVisualTransform } from './animationEngine';

/**
 * Computes the current horizontal scroll speed (px/sec) and speed level (1-based)
 * based on obstacles cleared.
 * Requirement: Starts slow and increases speed every 10 obstacles.
 */
export function getSpeedProgression(
  obstaclesCleared: number,
  difficulty: DifficultyConfig
): {
  speedPxPerSec: number;
  speedLevel: number;
  obstaclesUntilNextSpeedUp: number;
  progressWithinStep: number;
} {
  const stepSize = Math.max(1, difficulty.obstaclesPerSpeedStep);
  const completedSteps = Math.floor(obstaclesCleared / stepSize);
  const rawSpeed =
    difficulty.baseScrollSpeed + completedSteps * difficulty.speedIncrementPerStep;
  const speedPxPerSec = Math.min(difficulty.maxScrollSpeed, rawSpeed);
  const inStep = obstaclesCleared % stepSize;

  return {
    speedPxPerSec,
    speedLevel: completedSteps + 1,
    obstaclesUntilNextSpeedUp: stepSize - inStep,
    progressWithinStep: inStep / stepSize,
  };
}

/**
 * Solves total airborne time (seconds) from current height & upward velocity until height reaches 0.
 * h(t) = h0 + v*t - 0.5*g*t^2 = 0  =>  t = (v + sqrt(v^2 + 2*g*h0)) / g
 */
export function solveRemainingAirTimeSec(
  heightAboveFloor: number,
  velocityY: number,
  gravity: number
): number {
  const h0 = Math.max(0, heightAboveFloor);
  const discriminant = Math.max(0, velocityY * velocityY + 2 * gravity * h0);
  return (velocityY + Math.sqrt(discriminant)) / gravity;
}

/**
 * Triggers a Single Jump (from ground) or Double Jump (in mid-air).
 * - Single Jump reaches an apex bottom height of ~118px (cleanly above the 82px Middle pillar)
 *   and schedules `singleJumpRotations * 360°` spin from the active shape's animation profile.
 * - Double Jump dynamically computes upward velocity so the player's bottom always reaches
 *   an apex of ~212px above the floor (cleanly above the 166px Top pillar), and schedules
 *   `doubleJumpRotations * 360°` total spin so the shape lands upright on the floor.
 */
export function triggerPlayerJump(
  player: PlayerEntity,
  physics: PhysicsConfig,
  nowMs: number,
  animProfile: ShapeAnimationProfile = DEFAULT_SHAPE_ANIMATION_PROFILE,
  timeScale: number = 1
): PlayerEntity {
  const safeScale = Math.max(0.25, timeScale);

  if (player.isGrounded || player.jumpsUsed === 0) {
    const velocityY = physics.singleJumpVelocity;
    const expectedFlightDurationSec =
      solveRemainingAirTimeSec(0, velocityY, physics.gravity) / safeScale;
    const targetRot =
      animProfile.singleJumpRotations *
      Math.PI *
      2 *
      animProfile.rotationDirection;

    return {
      ...player,
      velocityY,
      jumpsUsed: 1,
      isGrounded: false,
      lastJumpTimeMs: nowMs,
      jumpStartRotationRad: 0,
      targetJumpRotationRad: targetRot,
      expectedFlightDurationSec,
    };
  }

  if (player.jumpsUsed < physics.maxJumps) {
    // Target bottom height above floor at double-jump apex = 212px (center = 238px, well above 166px Top pillar)
    const targetDoubleApexBottom = 212;
    const remainingHeightNeeded = Math.max(
      75,
      targetDoubleApexBottom - player.heightAboveFloor
    );
    const requiredVelocity = Math.sqrt(
      2 * physics.gravity * remainingHeightNeeded
    );
    const velocityY = Math.max(
      physics.doubleJumpVelocity * 0.85,
      requiredVelocity
    );

    // Capture current mid-air rotation angle so the transition into double-jump spin is seamless
    const currentTransform = computePlayerVisualTransform(
      player,
      animProfile,
      nowMs
    );
    const expectedFlightDurationSec =
      solveRemainingAirTimeSec(
        player.heightAboveFloor,
        velocityY,
        physics.gravity
      ) / safeScale;
    const totalDoubleJumpTurns = Math.max(
      1,
      animProfile.doubleJumpRotations
    );
    const targetRot =
      totalDoubleJumpTurns * Math.PI * 2 * animProfile.rotationDirection;

    return {
      ...player,
      velocityY,
      jumpsUsed: player.jumpsUsed + 1,
      isGrounded: false,
      lastJumpTimeMs: nowMs,
      jumpStartRotationRad: currentTransform.rotationRad,
      targetJumpRotationRad: targetRot,
      expectedFlightDurationSec,
    };
  }

  return player;
}

/**
 * Triggers a single continuous jump from the ground to a specific `targetApexHeight` above the floor
 * in one go (used by Jump Mode, where jump height starts high and reduces slightly every 10 matches).
 */
export function triggerAutoSingleHighJump(
  player: PlayerEntity,
  physics: PhysicsConfig,
  targetApexHeight: number,
  nowMs: number,
  animProfile: ShapeAnimationProfile = DEFAULT_SHAPE_ANIMATION_PROFILE,
  timeScale: number = 1
): PlayerEntity {
  const safeScale = Math.max(0.25, timeScale);
  const clampedApex = Math.max(
    80,
    Math.min(
      physics.corridorHeight - physics.playerRadius * 2 - 6,
      targetApexHeight
    )
  );
  const velocityY = Math.sqrt(2 * physics.gravity * clampedApex);
  const expectedFlightDurationSec =
    solveRemainingAirTimeSec(0, velocityY, physics.gravity) / safeScale;

  const targetRot =
    animProfile.singleJumpRotations *
    Math.PI *
    2 *
    animProfile.rotationDirection;

  return {
    ...player,
    heightAboveFloor: 0,
    velocityY,
    jumpsUsed: 1,
    isGrounded: false,
    lastJumpTimeMs: nowMs,
    jumpStartRotationRad: 0,
    targetJumpRotationRad: targetRot,
    expectedFlightDurationSec,
  };
}

/**
 * Advances vertical jump physics by dtSeconds and records floor touchdown timestamp
 * so the landing squash-and-rebound spring fires automatically.
 */
export function stepPlayerPhysics(
  player: PlayerEntity,
  physics: PhysicsConfig,
  dtSeconds: number,
  nowMs: number = performance.now()
): PlayerEntity {
  if (player.isGrounded && player.velocityY === 0 && player.heightAboveFloor === 0) {
    return player;
  }

  const wasGrounded = player.isGrounded;
  let nextHeight = player.heightAboveFloor + player.velocityY * dtSeconds;
  let nextVelocity = player.velocityY - physics.gravity * dtSeconds;
  let isGrounded = false;
  let jumpsUsed = player.jumpsUsed;
  let lastLandedTimeMs = player.lastLandedTimeMs;

  // Ceiling clamp so double-jumping never clips above the play tunnel
  const maxHeightAboveFloor = physics.corridorHeight - physics.playerRadius * 2 - 4;
  if (nextHeight > maxHeightAboveFloor) {
    nextHeight = maxHeightAboveFloor;
    if (nextVelocity > 0) {
      nextVelocity = 0;
    }
  }

  // Floor landing check
  if (nextHeight <= 0) {
    nextHeight = 0;
    nextVelocity = 0;
    isGrounded = true;
    jumpsUsed = 0;
    if (!wasGrounded) {
      lastLandedTimeMs = nowMs;
    }
  }

  return {
    ...player,
    heightAboveFloor: nextHeight,
    velocityY: nextVelocity,
    isGrounded,
    jumpsUsed,
    lastLandedTimeMs,
  };
}

/**
 * Estimates total airborne duration (seconds) required to complete a jump for a given tier
 * and return cleanly to the corridor floor, so the obstacle spawner guarantees safe landing space.
 */
export function estimateTierFlightDurationSec(
  tierId: VerticalTierId,
  physics: PhysicsConfig
): number {
  const singleAirTime = (2 * physics.singleJumpVelocity) / physics.gravity;
  if (tierId === 'GROUND') {
    return 0.15;
  }
  if (tierId === 'MIDDLE') {
    return singleAirTime;
  }
  // TOP tier flight duration
  const targetDoubleApexBottom = 212;
  const timeUpAndDown = 2 * Math.sqrt((2 * targetDoubleApexBottom) / physics.gravity);
  return timeUpAndDown;
}

/**
 * Computes the horizontal lead distance (px) in front of the obstacle where the player
 * should press Space so the jump apex aligns with the obstacle center.
 */
export function computeOptimalJumpLeadDistance(
  tierId: VerticalTierId,
  scrollSpeedPxPerSec: number,
  physics: PhysicsConfig
): number {
  if (tierId === 'GROUND') return 0;
  const timeToFirstApex = physics.singleJumpVelocity / physics.gravity;
  if (tierId === 'MIDDLE') {
    return scrollSpeedPxPerSec * timeToFirstApex;
  }
  const targetDoubleApexBottom = 212;
  const timeToTopApex = Math.sqrt((2 * targetDoubleApexBottom) / physics.gravity);
  return scrollSpeedPxPerSec * timeToTopApex;
}
