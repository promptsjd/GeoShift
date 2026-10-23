import {
  PlayerEntity,
  PlayerVisualTransform,
  ShapeAnimationProfile,
} from '../config/types';

/**
 * Smooth cubic ease-out helper for rotational settling
 */
function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * Smooth blend curve (0 -> 1 -> 0) for takeoff stretch impulse
 */
function impulseEnvelope(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return Math.sin(clamped * Math.PI);
}

/**
 * Damped harmonic spring envelope for landing squash-and-rebound
 */
function dampedSpringEnvelope(
  t: number,
  damping: number,
  oscillations: number
): number {
  const clamped = Math.max(0, Math.min(1, t));
  const decay = Math.exp(-damping * clamped);
  const wave = Math.cos(oscillations * Math.PI * 2 * clamped - Math.PI / 2);
  // First half-cycle is positive (initial squash), followed by a subtle rebound stretch
  return decay * Math.sin(clamped * Math.PI * oscillations);
}

/**
 * Pure Animation Evaluator
 * Computes the player's instantaneous visual rotation (360° / 720° jump spin)
 * and squash-and-stretch scale factors from the decoupled `ShapeAnimationProfile`.
 *
 * Keeping this pure and separate from `physicsEngine` and `collisionEvaluator`
 * guarantees that visual spin and squeeze can be customized freely without affecting hitboxes.
 */
export function computePlayerVisualTransform(
  player: PlayerEntity,
  animProfile: ShapeAnimationProfile,
  nowMs: number
): PlayerVisualTransform {
  let rotationRad = 0;
  let scaleX = 1;
  let scaleY = 1;
  let landingImpactProgress = 0;

  // 1. Mid-Air Rotation Interpolation (360° single jump / 720° double jump)
  if (!player.isGrounded && player.lastJumpTimeMs > 0) {
    const elapsedSec = Math.max(0, (nowMs - player.lastJumpTimeMs) / 1000);
    const totalFlightSec = Math.max(0.18, player.expectedFlightDurationSec || 0.48);
    const rawProgress = Math.min(1, elapsedSec / totalFlightSec);
    // Blend 65% linear + 35% easeOutCubic so the spin is brisk on launch and locks cleanly upright right as it lands
    const easedProgress = rawProgress * 0.65 + easeOutCubic(rawProgress) * 0.35;

    const startAngle = player.jumpStartRotationRad || 0;
    const targetAngle =
      player.targetJumpRotationRad ??
      animProfile.singleJumpRotations * Math.PI * 2 * animProfile.rotationDirection;

    rotationRad = startAngle + (targetAngle - startAngle) * easedProgress;
  }

  // 2. Takeoff Stretch & Horizontal Squeeze (when initiating a jump)
  if (!player.isGrounded && player.lastJumpTimeMs > 0) {
    const sinceJumpMs = Math.max(0, nowMs - player.lastJumpTimeMs);
    const takeoffDur = animProfile.takeoffDeformation.durationMs;

    if (sinceJumpMs < takeoffDur) {
      const env = impulseEnvelope(sinceJumpMs / takeoffDur);
      scaleX *= 1 + (animProfile.takeoffDeformation.scaleX - 1) * env;
      scaleY *= 1 + (animProfile.takeoffDeformation.scaleY - 1) * env;
    } else {
      // Subtle airborne velocity-driven elongation
      const speedStretch = Math.min(
        0.14,
        Math.abs(player.velocityY) * animProfile.airborneVelocityStretchFactor
      );
      scaleX *= 1 - speedStretch * 0.55;
      scaleY *= 1 + speedStretch;
    }
  }

  // 3. Landing Squash & Elastic Rebound (when touching down on the floor)
  if (
    player.isGrounded &&
    player.lastLandedTimeMs &&
    player.lastLandedTimeMs > 0
  ) {
    const sinceLandMs = Math.max(0, nowMs - player.lastLandedTimeMs);
    const landDur = animProfile.landingDeformation.durationMs;

    if (sinceLandMs < landDur) {
      const normT = sinceLandMs / landDur;
      landingImpactProgress = normT;
      const spring = dampedSpringEnvelope(
        normT,
        animProfile.landingDeformation.damping,
        animProfile.landingDeformation.oscillations
      );
      scaleX *= 1 + (animProfile.landingDeformation.scaleX - 1) * spring;
      scaleY *= 1 + (animProfile.landingDeformation.scaleY - 1) * spring;
    }
  }

  // 4. Shape / Color Shift Tactile Pop
  if (player.lastShiftTimeMs && player.lastShiftTimeMs > 0) {
    const sinceShiftMs = Math.max(0, nowMs - player.lastShiftTimeMs);
    const shiftDur = animProfile.shiftPulseDurationMs;
    if (sinceShiftMs < shiftDur) {
      const pop = impulseEnvelope(sinceShiftMs / shiftDur);
      const pulse = 1 + (animProfile.shiftPulseScale - 1) * pop;
      scaleX *= pulse;
      scaleY *= pulse;
    }
  }

  return {
    rotationRad,
    scaleX,
    scaleY,
    landingImpactProgress,
  };
}
