import React, { useEffect, useRef } from 'react';
import { getColorById } from '../config/colorRegistry';
import {
  drawTactileShapeOnCanvas,
  getShapeById,
} from '../config/shapeRegistry';
import { getTierById } from '../config/tierRegistry';
import {
  ColorDefinition,
  FailureDiagnostic,
  GameModeProfile,
  GameState,
  GateClearEffect,
  ObstacleEntity,
  PhysicsConfig,
  PlayerEntity,
  ShapeDefinition,
} from '../config/types';
import {
  ARENA_VISUAL_CONFIG,
  getShapeAnimationProfile,
} from '../config/visualConfig';
import { computePlayerVisualTransform } from '../engine/animationEngine';

interface GameArenaCanvasProps {
  gameState: GameState;
  modeProfile: GameModeProfile;
  player: PlayerEntity;
  obstacles: ObstacleEntity[];
  effects: GateClearEffect[];
  activeColors: ColorDefinition[];
  activeShapes: ShapeDefinition[];
  physics: PhysicsConfig;
  currentSpeedPxPerSec: number;
  speedUpFlashProgress: number;
  failureDiagnostic: FailureDiagnostic | null;
  showJumpGuides: boolean;
  isProximityPaused: boolean;
  practiceRetryMessage: string | null;
}

/**
 * Helper to draw a Tactile Arcade Studio Monolith Wall (floor pillar or ceiling overhang)
 * with dimensional bevel edges and recessed inner structural panel.
 */
function drawTactileWallMonolith(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isFloorPillar: boolean
) {
  if (h <= 0) return;
  const cfg = ARENA_VISUAL_CONFIG;

  ctx.save();
  // Drop shadow into corridor
  ctx.shadowColor = cfg.wallBevelShadowColor;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = -4;
  ctx.fillStyle = cfg.wallFillHex;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // Recessed inner structural plate
  const inset = 6;
  if (w > inset * 2 && h > inset * 2) {
    ctx.fillStyle = cfg.wallInnerPanelHex;
    ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }

  // Outer Bevel Highlight along leading edge & cap
  ctx.strokeStyle = cfg.wallBevelHighlightColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);

  // Crisp specular cap bar at the gate-facing edge (top of floor pillar, bottom of ceiling drop)
  ctx.fillStyle = 'rgba(148, 163, 184, 0.24)';
  if (isFloorPillar) {
    ctx.fillRect(x + 1, y + 1, w - 2, 3);
  } else {
    ctx.fillRect(x + 1, y + h - 4, w - 2, 3);
  }
}

/**
 * Tactile Arcade Studio Canvas Renderer for the GeoShift Corridor
 * - Renders the atmospheric indigo-slate studio corridor with subtle architectural grid & floor rail.
 * - Renders dimensional monolith obstacle walls and bevelled target shapes.
 * - Evaluates per-shape 360°/720° jump spin and takeoff/landing squash-and-stretch via `animationEngine`.
 */
export const GameArenaCanvas: React.FC<GameArenaCanvasProps> = ({
  gameState,
  modeProfile,
  player,
  obstacles,
  effects,
  activeColors,
  activeShapes,
  physics,
  speedUpFlashProgress,
  failureDiagnostic,
  isProximityPaused,
  practiceRetryMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = physics.corridorWidth;
    const height = physics.corridorHeight;
    const vCfg = ARENA_VISUAL_CONFIG;
    const nowMs = performance.now();

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Atmospheric Studio Corridor Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, vCfg.corridorTopHex);
    bgGrad.addColorStop(1, vCfg.corridorBottomHex);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 1B. Subtle Architectural Studio Grid
    ctx.strokeStyle = vCfg.gridLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = vCfg.gridSpacingPx; gx < width; gx += vCfg.gridSpacingPx) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
    }
    for (let gy = vCfg.gridSpacingPx; gy < height; gy += vCfg.gridSpacingPx) {
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
    }
    ctx.stroke();

    // 1C. Subtle Top & Bottom Studio Vignette + Floor Track Line
    ctx.fillStyle = vCfg.floorHighlightHex;
    ctx.fillRect(0, height - 2, width, 2);

    // 2. Proximity Stop Threshold Line (Only in Full Practice Mode)
    if (modeProfile.stopAtProximityUntilMatched) {
      const stopX = physics.playerX + modeProfile.proximityStopOffsetPx;
      ctx.strokeStyle = isProximityPaused
        ? 'rgba(250, 204, 21, 0.65)'
        : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = isProximityPaused ? 2 : 1.25;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(stopX, 0);
      ctx.lineTo(stopX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Render Obstacles (Tactile Monolith Pillars/Ceilings + Target Colored Shapes)
    for (const obs of obstacles) {
      if (obs.x + obs.width < -20 || obs.x > width + 40) continue;

      const tier = getTierById(obs.tierId);
      const obsColor = getColorById(obs.colorId);
      const obsShape = getShapeById(obs.shapeId);
      const obsCenterX = obs.x + obs.width / 2;

      // 3A. Draw Tactile Monolith Floor Pillar (for MIDDLE and TOP tiers)
      if (tier.wallGeometry.bottomPillarHeight > 0) {
        const pillarH = tier.wallGeometry.bottomPillarHeight;
        const pillarY = height - pillarH;
        drawTactileWallMonolith(ctx, obs.x, pillarY, obs.width, pillarH, true);
      }

      // 3B. Draw Tactile Monolith Ceiling Overhang (for GROUND tier when jump is enabled)
      if (modeProfile.allowJump && tier.wallGeometry.topCeilingDrop > 0) {
        const dropH = tier.wallGeometry.topCeilingDrop;
        drawTactileWallMonolith(ctx, obs.x, 0, obs.width, dropH, false);
      }

      // 3C. Draw Target Gate Socket & Bevelled Shape at the Tier's Target Elevation
      const shapeCenterY = height - tier.targetCenterHeightAboveFloor;
      if (!obs.cleared) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(
          obsCenterX,
          shapeCenterY,
          physics.obstacleShapeRadius * 1.18,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      drawTactileShapeOnCanvas({
        ctx,
        shape: obsShape,
        color: obsColor,
        cx: obsCenterX,
        cy: shapeCenterY,
        radius: physics.obstacleShapeRadius,
        alpha: obs.cleared ? 0.22 : 1.0,
        showDirectionalCore: true,
      });
    }

    // 4. Silent Visual-Only Gate Clear Ripple Effects
    for (const fx of effects) {
      const fxShape = getShapeById(fx.shapeId);
      const radius = physics.obstacleShapeRadius * (1 + fx.progress * 1.15);
      const alpha = Math.max(0, 1 - fx.progress);

      ctx.save();
      ctx.globalAlpha = alpha * 0.72;
      ctx.strokeStyle = fx.colorHex;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary inner geometric echo with subtle spin
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.progress * Math.PI * 0.5);
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = fx.colorHex;
      fxShape.drawCanvas(ctx, 0, 0, radius * 0.8);
      ctx.restore();
    }

    // 5. Evaluate Player Animation Transform (Spin + Takeoff/Landing Squeeze)
    const playerColor = activeColors[player.colorIndex] || activeColors[0];
    const playerShape = activeShapes[player.shapeIndex] || activeShapes[0];
    const animProfile = getShapeAnimationProfile(playerShape.id);
    const transform = computePlayerVisualTransform(player, animProfile, nowMs);

    const playerCenterX = physics.playerX;
    // Anchor vertical squash-and-stretch to the floor when grounded so landing squeeze compresses against the floor
    const rawCenterY =
      height - (player.heightAboveFloor + physics.playerRadius);
    const groundedFootOffset = player.isGrounded
      ? physics.playerRadius * (1 - transform.scaleY)
      : 0;
    const playerCenterY = rawCenterY + groundedFootOffset;

    // 5A. Subtle Landing Floor Contact Ripple when touching down
    if (transform.landingImpactProgress > 0 && transform.landingImpactProgress < 1) {
      const rippleAlpha = (1 - transform.landingImpactProgress) * 0.55;
      const rippleHalfWidth =
        physics.playerRadius * (0.9 + transform.landingImpactProgress * 1.1);
      ctx.save();
      ctx.strokeStyle = playerColor.strokeHex;
      ctx.globalAlpha = rippleAlpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        playerCenterX,
        height - 3,
        rippleHalfWidth,
        3.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
    }

    // 5B. Subtle Airborne Jump Motion Trail Afterimages
    if (
      vCfg.enableJumpMotionTrail &&
      !player.isGrounded &&
      Math.abs(player.velocityY) > 60
    ) {
      for (let step = vCfg.motionTrailSteps; step >= 1; step--) {
        const trailDt = step * 0.024;
        const trailX = playerCenterX - step * 9;
        const trailY = playerCenterY + player.velocityY * trailDt * 0.45;
        const trailRot =
          transform.rotationRad -
          step * 0.22 * animProfile.rotationDirection;
        const trailAlpha = 0.07 * (vCfg.motionTrailSteps + 1 - step);

        drawTactileShapeOnCanvas({
          ctx,
          shape: playerShape,
          color: playerColor,
          cx: trailX,
          cy: trailY,
          radius: physics.playerRadius * (1 - step * 0.06),
          rotationRad: trailRot,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
          alpha: trailAlpha,
          showDirectionalCore: false,
        });
      }
    }

    // 5C. Render Active Player Shape with 360°/720° Spin, Squeeze, and Bevels
    drawTactileShapeOnCanvas({
      ctx,
      shape: playerShape,
      color: playerColor,
      cx: playerCenterX,
      cy: playerCenterY,
      radius: physics.playerRadius,
      rotationRad: transform.rotationRad,
      scaleX: transform.scaleX,
      scaleY: transform.scaleY,
      alpha: 1,
      showDirectionalCore: animProfile.showDirectionalBevelCore,
    });

    // 6. Silent Visual Feedback: Collision Freeze Highlight on Game Over
    if (gameState === 'GAME_OVER' && failureDiagnostic) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        playerCenterX,
        playerCenterY,
        physics.playerRadius + 10,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // 7. Silent Visual Feedback: 10-Obstacle Speed Milestone Border Pulse
    if (speedUpFlashProgress > 0) {
      const alpha = Math.sin(speedUpFlashProgress * Math.PI) * 0.8;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    }

    ctx.restore();
  }, [
    gameState,
    modeProfile,
    player,
    obstacles,
    effects,
    activeColors,
    activeShapes,
    physics,
    speedUpFlashProgress,
    failureDiagnostic,
    isProximityPaused,
  ]);

  return (
    <div className="relative rounded-2xl border-2 border-[#384766] bg-[#0B0F1A] shadow-[0_24px_56px_-12px_rgba(0,0,0,0.85)] overflow-hidden p-2">
      <div className="relative rounded-xl overflow-hidden border border-[#4F638C]/45">
        <canvas
          ref={canvasRef}
          style={{
            width: `${physics.corridorWidth}px`,
            height: `${physics.corridorHeight}px`,
          }}
          className="block"
        />

        {/* Full Practice Proximity Auto-Pause Prompt */}
        {gameState === 'PLAYING' && isProximityPaused && (
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-xl bg-[#0B0F1A] border-2 border-amber-400 text-base font-bold font-display tracking-wide text-amber-300 whitespace-nowrap pointer-events-none shadow-lg">
            Wall Paused · Match Color & Shape to Resume
          </div>
        )}

        {/* Forgiving Practice Retry Banner */}
        {gameState === 'PLAYING' &&
          !isProximityPaused &&
          practiceRetryMessage && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-xl bg-[#0B0F1A] border-2 border-sky-400 text-base font-bold font-display tracking-wide text-sky-300 whitespace-nowrap pointer-events-none shadow-lg">
              {practiceRetryMessage}
            </div>
          )}
      </div>
    </div>
  );
};
