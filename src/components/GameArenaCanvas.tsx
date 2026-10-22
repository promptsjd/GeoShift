import React, { useEffect, useRef } from 'react';
import { getColorById } from '../config/colorRegistry';
import { getShapeById } from '../config/shapeRegistry';
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
 * Pure Flat-Vector Canvas Renderer for the GeoShift Corridor
 * - Renders the deep indigo-slate corridor within the matte-black arena frame.
 * - Renders approaching obstacle walls (black floor pillars & overhanging ceiling blocks)
 *   and their target colored geometric shapes without text clutter inside the canvas.
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

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Corridor Background (Deep Indigo-Slate)
    ctx.fillStyle = '#242058';
    ctx.fillRect(0, 0, width, height);

    // 2. Proximity Stop Threshold Line (Only in Full Practice Mode)
    if (modeProfile.stopAtProximityUntilMatched) {
      const stopX = physics.playerX + modeProfile.proximityStopOffsetPx;
      ctx.strokeStyle = isProximityPaused
        ? 'rgba(250, 204, 21, 0.55)'
        : 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = isProximityPaused ? 2 : 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(stopX, 0);
      ctx.lineTo(stopX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Render Obstacles (Solid Black Pillars/Ceilings + Target Colored Shapes)
    for (const obs of obstacles) {
      if (obs.x + obs.width < -20 || obs.x > width + 40) continue;

      const tier = getTierById(obs.tierId);
      const obsColor = getColorById(obs.colorId);
      const obsShape = getShapeById(obs.shapeId);
      const obsCenterX = obs.x + obs.width / 2;

      // 3A. Draw Solid Black Floor Pillar (for MIDDLE and TOP tiers)
      if (tier.wallGeometry.bottomPillarHeight > 0) {
        const pillarH = tier.wallGeometry.bottomPillarHeight;
        const pillarY = height - pillarH;
        ctx.fillStyle = '#07080D';
        ctx.fillRect(obs.x, pillarY, obs.width, pillarH);
      }

      // 3B. Draw Solid Black Ceiling Overhang (for GROUND tier when jump is enabled)
      if (modeProfile.allowJump && tier.wallGeometry.topCeilingDrop > 0) {
        const dropH = tier.wallGeometry.topCeilingDrop;
        ctx.fillStyle = '#07080D';
        ctx.fillRect(obs.x, 0, obs.width, dropH);
      }

      // 3C. Draw Target Shape at the Tier's Target Elevation
      const shapeCenterY = height - tier.targetCenterHeightAboveFloor;
      ctx.save();
      ctx.globalAlpha = obs.cleared ? 0.22 : 1.0;
      ctx.fillStyle = obsColor.hex;
      obsShape.drawCanvas(ctx, obsCenterX, shapeCenterY, physics.obstacleShapeRadius);
      ctx.restore();
    }

    // 4. Silent Visual-Only Gate Clear Ripple Effects
    for (const fx of effects) {
      const fxShape = getShapeById(fx.shapeId);
      const radius = physics.obstacleShapeRadius * (1 + fx.progress * 0.95);
      const alpha = Math.max(0, 1 - fx.progress);

      ctx.save();
      ctx.globalAlpha = alpha * 0.65;
      ctx.strokeStyle = fx.colorHex;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.28;
      ctx.fillStyle = fx.colorHex;
      fxShape.drawCanvas(ctx, fx.x, fx.y, radius * 0.82);
      ctx.restore();
    }

    // 5. Draw Player Entity
    const playerColor = activeColors[player.colorIndex] || activeColors[0];
    const playerShape = activeShapes[player.shapeIndex] || activeShapes[0];
    const playerCenterX = physics.playerX;
    const playerCenterY =
      height - (player.heightAboveFloor + physics.playerRadius);

    // Render Player Shape in Active Color
    ctx.save();
    ctx.fillStyle = playerColor.hex;
    playerShape.drawCanvas(ctx, playerCenterX, playerCenterY, physics.playerRadius);
    ctx.restore();

    // 6. Silent Visual Feedback: Collision Freeze Highlight on Game Over
    if (gameState === 'GAME_OVER' && failureDiagnostic) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        playerCenterX,
        playerCenterY,
        physics.playerRadius + 9,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // 7. Silent Visual Feedback: 10-Obstacle Speed Milestone Border Pulse
    if (speedUpFlashProgress > 0) {
      const alpha = Math.sin(speedUpFlashProgress * Math.PI) * 0.75;
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
    <div className="relative rounded-none border border-slate-800/90 bg-[#07080D] shadow-2xl overflow-hidden">
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
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-lg bg-slate-950/90 border border-amber-400/60 text-xs font-medium text-amber-300 whitespace-nowrap pointer-events-none">
          Wall Paused · Match Color & Shape to Resume
        </div>
      )}

      {/* Forgiving Practice Retry Banner */}
      {gameState === 'PLAYING' && !isProximityPaused && practiceRetryMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-lg bg-slate-950/90 border border-sky-400/50 text-xs font-medium text-sky-300 whitespace-nowrap pointer-events-none">
          {practiceRetryMessage}
        </div>
      )}
    </div>
  );
};
