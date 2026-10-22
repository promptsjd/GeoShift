import {
  DifficultyConfig,
  PhysicsConfig,
  PlayerEntity,
  VerticalTierId,
} from '../config/types';

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
 * Triggers a Single Jump (from ground) or Double Jump (in mid-air).
 * - Single Jump reaches an apex bottom height of ~118px (cleanly above the 82px Middle pillar).
 * - Double Jump dynamically computes upward velocity so the player's bottom always reaches
 *   an apex of ~210px above the floor (cleanly above the 166px Top pillar), even if the player
 *   double-taps Space rapidly right after leaving the ground.
 */
export function triggerPlayerJump(
  player: PlayerEntity,
  physics: PhysicsConfig,
  nowMs: number
): PlayerEntity {
  if (player.isGrounded || player.jumpsUsed === 0) {
    return {
      ...player,
      velocityY: physics.singleJumpVelocity,
      jumpsUsed: 1,
      isGrounded: false,
      lastJumpTimeMs: nowMs,
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

    return {
      ...player,
      velocityY: Math.max(physics.doubleJumpVelocity * 0.85, requiredVelocity),
      jumpsUsed: player.jumpsUsed + 1,
      isGrounded: false,
      lastJumpTimeMs: nowMs,
    };
  }

  return player;
}

/**
 * Advances vertical jump physics by dtSeconds.
 */
export function stepPlayerPhysics(
  player: PlayerEntity,
  physics: PhysicsConfig,
  dtSeconds: number
): PlayerEntity {
  if (player.isGrounded && player.velocityY === 0 && player.heightAboveFloor === 0) {
    return player;
  }

  let nextHeight = player.heightAboveFloor + player.velocityY * dtSeconds;
  let nextVelocity = player.velocityY - physics.gravity * dtSeconds;
  let isGrounded = false;
  let jumpsUsed = player.jumpsUsed;

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
  }

  return {
    ...player,
    heightAboveFloor: nextHeight,
    velocityY: nextVelocity,
    isGrounded,
    jumpsUsed,
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
