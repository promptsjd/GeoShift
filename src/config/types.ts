/**
 * Core Domain Types & Interfaces for GeoShift
 * Designed with strict separation of concerns so shapes, colors, tiers,
 * controls, and game/practice modes can be extended or modified independently.
 */

export type GameState =
  | 'TITLE_MENU'
  | 'PRACTICE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'PRACTICE_COMPLETE'
  | 'GAME_OVER';

export type VerticalTierId = 'GROUND' | 'MIDDLE' | 'TOP';

export type PracticeSubModeId = 'SHAPE' | 'COLOR' | 'JUMP' | 'FULL';

export type RunModeId =
  | 'GAME'
  | 'PRACTICE_SHAPE'
  | 'PRACTICE_COLOR'
  | 'PRACTICE_JUMP'
  | 'PRACTICE_FULL';

export interface ColorDefinition {
  id: string;
  name: string;
  hex: string;
  strokeHex: string;
  /** Whether enabled by default in standard rules */
  enabledByDefault: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ShapeDefinition {
  id: string;
  name: string;
  /**
   * True if this shape can appear as a player/obstacle shape.
   * False if reserved strictly for UI representation (e.g., the Rounded Square color swatch).
   */
  isPlayable: boolean;
  enabledByDefault: boolean;
  /**
   * Draws the shape centered at (cx, cy) with given radius onto a CanvasRenderingContext2D
   */
  drawCanvas: (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => void;
  /**
   * Returns an SVG path string centered inside a [0..size, 0..size] viewBox
   */
  getSvgPath: (size: number) => string;
}

export interface WallGeometryConfig {
  /** Height of the solid black pillar rising from the corridor floor (px) */
  bottomPillarHeight: number;
  /** Height of the solid black overhang dropping from the corridor ceiling (px) */
  topCeilingDrop: number;
}

export interface VerticalTierDefinition {
  id: VerticalTierId;
  label: string;
  shortHint: string;
  /** Required number of Spacebar presses to reach this tier's passage window */
  requiredJumps: 0 | 1 | 2;
  /** Center Y offset above the corridor floor (0 = resting on floor) */
  targetCenterHeightAboveFloor: number;
  /** Acceptable vertical tolerance (+/- px from targetCenterHeightAboveFloor) when passing gate */
  verticalTolerance: number;
  /** Blocking black wall structure associated with this obstacle tier */
  wallGeometry: WallGeometryConfig;
}

export interface DifficultyConfig {
  id: string;
  name: string;
  description: string;
  /** Initial horizontal obstacle speed in pixels per second */
  baseScrollSpeed: number;
  /** Number of cleared obstacles per speed increase milestone (requirement: every 10 obstacles) */
  obstaclesPerSpeedStep: number;
  /** Speed increase in pixels per second at every milestone */
  speedIncrementPerStep: number;
  /** Maximum scroll speed cap in pixels per second */
  maxScrollSpeed: number;
  /** Reaction buffer time in seconds added on top of physical jump landing duration */
  reactionTimeBufferSec: number;
  /** Minimum reaction time buffer at max difficulty */
  minReactionTimeBufferSec: number;
}

/**
 * Declarative Game / Practice Mode Profile
 * Controls which mechanics are enabled, which obstacle tiers spawn,
 * whether the wall stops at a proximity threshold until Color+Shape match,
 * and how many obstacles constitute a practice batch.
 */
export interface GameModeProfile {
  id: RunModeId;
  isPractice: boolean;
  practiceSubMode?: PracticeSubModeId;
  name: string;
  shortLabel: string;
  description: string;
  allowColorShift: boolean;
  allowShapeShift: boolean;
  allowJump: boolean;
  allowedTiers: VerticalTierId[];
  /** Number of obstacles per practice round (null for endless Game mode) */
  batchObstacleTarget: number | null;
  /** If true, mistakes rewind the current obstacle instead of triggering Game Over */
  forgivingRetryOnFail: boolean;
  /**
   * If true (Full Practice), an approaching obstacle stops at `proximityStopOffsetPx`
   * ahead of the player until the player matches both Color and Shape, then resumes moving
   * so the player can execute the required Jump.
   */
  stopAtProximityUntilMatched: boolean;
  /** Distance (px) in front of playerCenterX where the obstacle left edge stops in Full Practice */
  proximityStopOffsetPx: number;
  difficulty: DifficultyConfig;
}

export interface PhysicsConfig {
  corridorWidth: number;
  corridorHeight: number;
  playerX: number;
  playerRadius: number;
  obstacleWidth: number;
  obstacleShapeRadius: number;
  /** Downward gravitational acceleration (px / s^2) */
  gravity: number;
  /** Upward velocity on first jump from ground (px / s), tuned so apex reaches MIDDLE tier */
  singleJumpVelocity: number;
  /** Upward velocity on second mid-air jump (px / s), tuned so apex reaches TOP tier */
  doubleJumpVelocity: number;
  maxJumps: number;
}

export type ControlAction =
  | 'COLOR_LEFT'
  | 'COLOR_RIGHT'
  | 'SHAPE_UP'
  | 'SHAPE_DOWN'
  | 'JUMP'
  | 'PAUSE';

export interface ControlBinding {
  action: ControlAction;
  label: string;
  description: string;
  codes: string[];
  displayKeys: string[];
}

export interface PlayerEntity {
  colorIndex: number;
  shapeIndex: number;
  /** Height of player's bottom edge above corridor floor (0 = on floor) */
  heightAboveFloor: number;
  /** Vertical velocity (positive = upward, negative = downward) */
  velocityY: number;
  jumpsUsed: number;
  isGrounded: boolean;
  /** Timestamp of last jump for double-jump visual indicator */
  lastJumpTimeMs: number;
}

export type FailureType =
  | 'COLOR_MISMATCH'
  | 'SHAPE_MISMATCH'
  | 'HEIGHT_MISMATCH'
  | 'WALL_COLLISION'
  | 'MULTI_MISMATCH';

export interface FailureDiagnostic {
  type: FailureType;
  headline: string;
  detail: string;
  expectedColorId: string;
  actualColorId: string;
  expectedShapeId: string;
  actualShapeId: string;
  expectedTierId: VerticalTierId;
  actualHeightAboveFloor: number;
  colorMatched: boolean;
  shapeMatched: boolean;
  heightMatched: boolean;
}

export interface ObstacleEntity {
  id: string;
  sequenceNumber: number;
  /** Left edge X coordinate inside the corridor */
  x: number;
  width: number;
  colorId: string;
  shapeId: string;
  tierId: VerticalTierId;
  /** Whether the player has successfully cleared this obstacle's gate */
  cleared: boolean;
  /** True once the player has satisfied the proximity Color+Shape lock in Full Practice */
  proximityUnlocked?: boolean;
}

export interface GateClearEffect {
  id: string;
  x: number;
  y: number;
  colorHex: string;
  shapeId: string;
  progress: number; // 0 to 1
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  obstaclesCleared: number;
  speedLevelReached: number;
  modeId: string;
  createdAtISO: string;
}
