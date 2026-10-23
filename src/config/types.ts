/**
 * Core Domain Types & Interfaces for GeoShift
 * Designed with strict separation of concerns so shapes, colors, tiers,
 * controls, visual themes, and per-shape animations can be extended or modified independently.
 */

export type GameState =
  | 'TITLE_MENU'
  | 'PRACTICE_MENU'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'PRACTICE_COMPLETE'
  | 'GAME_OVER';

export type VerticalTierId = 'GROUND' | 'MIDDLE' | 'TOP';

export type PracticeSubModeId = 'SHAPE' | 'COLOR' | 'JUMP' | 'FULL';

export type CompetitiveModeId = 'GAME' | 'JUMP_MATCH';

export type RunModeId =
  | 'GAME'
  | 'JUMP_MATCH'
  | 'PRACTICE_SHAPE'
  | 'PRACTICE_COLOR'
  | 'PRACTICE_JUMP'
  | 'PRACTICE_FULL';

export interface ColorDefinition {
  id: string;
  name: string;
  hex: string;
  strokeHex: string;
  /** Color of the inner concentric shape facet for dimensional contrast */
  innerFacetHex: string;
  /** Opacity (0..1) of the inner concentric shape facet */
  innerFacetAlpha: number;
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

/**
 * Decoupled Per-Shape Animation & Squeeze/Rotation Configuration
 * Allows tuning single-jump spin, double-jump spin, takeoff stretch,
 * landing squeeze-and-rebound, and shift pop per shape with zero hardcoding.
 */
export interface SquashStretchKeyframe {
  /** Horizontal scale multiplier at peak deformation (e.g., 0.84 on takeoff, 1.24 on landing) */
  scaleX: number;
  /** Vertical scale multiplier at peak deformation (e.g., 1.18 on takeoff, 0.78 on landing) */
  scaleY: number;
  /** Duration of the deformation and elastic recovery in milliseconds */
  durationMs: number;
}

export interface ShapeAnimationProfile {
  shapeId: string;
  /** Number of full 360-degree turns completed during a single jump (e.g., 1 = 360°, 2 = 720°) */
  singleJumpRotations: number;
  /** Number of full 360-degree turns completed during a double jump (e.g., 2 = 720°) */
  doubleJumpRotations: number;
  /** Rotation direction multiplier: 1 for clockwise, -1 for counter-clockwise */
  rotationDirection: 1 | -1;
  /** Elastic stretch applied immediately when jumping (takeoff squeeze/stretch) */
  takeoffDeformation: SquashStretchKeyframe;
  /** Elastic squeeze and harmonic rebound applied when landing on the corridor floor */
  landingDeformation: SquashStretchKeyframe & {
    /** Damping ratio for harmonic landing settle (higher = settles faster) */
    damping: number;
    /** Number of elastic oscillations during landing recovery */
    oscillations: number;
  };
  /** Proportional vertical stretch factor driven by mid-air vertical velocity */
  airborneVelocityStretchFactor: number;
  /** Scale pulse applied when the player shifts into this shape or shifts color */
  shiftPulseScale: number;
  /** Duration of the shape/color shift pop in milliseconds */
  shiftPulseDurationMs: number;
  /** Whether to render an inner rotating specular bevel core (gives circles visible spin cues) */
  showDirectionalBevelCore: boolean;
}

/**
 * Computed 60fps Visual Transform for the Player Entity
 * Kept strictly separate from physical hitbox coordinates so visual flair
 * never alters collision fairness.
 */
export interface PlayerVisualTransform {
  rotationRad: number;
  scaleX: number;
  scaleY: number;
  landingImpactProgress: number; // 0..1 when landing ripple is active, 0 otherwise
}

/**
 * Declarative Arena & Tactile Studio Visual Configuration
 */
export interface ArenaVisualConfig {
  corridorTopHex: string;
  corridorBottomHex: string;
  gridLineColor: string;
  gridSpacingPx: number;
  floorDeckHeightPx: number;
  floorSurfaceHex: string;
  floorHighlightHex: string;
  wallFillHex: string;
  wallInnerPanelHex: string;
  wallBevelHighlightColor: string;
  wallBevelShadowColor: string;
  wallCornerRadiusPx: number;
  shapeShadowBlurPx: number;
  shapeInnerBevelScale: number;
  shapeInnerBevelAlpha: number;
  enableJumpMotionTrail: boolean;
  motionTrailSteps: number;
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
  /** True for the automatic double-jump mode where the player matches Color & Shape before landing */
  isAutoJumpMode?: boolean;
  practiceSubMode?: PracticeSubModeId;
  name: string;
  shortLabel: string;
  /** Short difficulty & mechanic subtitle shown on the Main Menu button */
  menuSubtitle?: string;
  description: string;
  allowColorShift: boolean;
  allowShapeShift: boolean;
  allowJump: boolean;
  allowedTiers: VerticalTierId[];
  /** Number of lives before Game Over (defaults to 1 for standard corridor run, 3 for Jump Mode) */
  initialLives?: number;
  /** Whether launching this mode begins with a 3-2-1 arena countdown */
  useStartCountdown?: boolean;
  /** Number of obstacles per practice round (null for endless competitive modes) */
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

export interface TargetPromptEntity {
  id: string;
  sequenceNumber: number;
  colorId: string;
  shapeId: string;
  /** 0..1 normalized progress of the current automatic double-jump flight */
  flightProgress: number;
  /** Last landing outcome for brief visual feedback on the target station */
  lastOutcome?: 'NONE' | 'MATCHED' | 'MISSED';
  lastOutcomeTimeMs?: number;
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
  /** Timestamp of last jump for takeoff stretch & spin interpolation */
  lastJumpTimeMs: number;
  /** Timestamp when player last touched down on the floor (for landing squeeze) */
  lastLandedTimeMs?: number;
  /** Timestamp when player last shifted color or shape (for tactile pop animation) */
  lastShiftTimeMs?: number;
  /** Starting rotation angle (radians) at the moment the current jump was triggered */
  jumpStartRotationRad?: number;
  /** Target rotation angle (radians) to reach upon completing the current jump arc */
  targetJumpRotationRad?: number;
  /** Estimated total airborne duration (seconds) for the active jump phase */
  expectedFlightDurationSec?: number;
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

export type SoundEventId =
  | 'SHIFT'
  | 'JUMP_SINGLE'
  | 'JUMP_DOUBLE'
  | 'MATCH_SUCCESS'
  | 'LIFE_LOST'
  | 'COUNTDOWN_TICK'
  | 'GAME_OVER';

export interface SoundToneStep {
  /** Oscillator waveform type (e.g., 'square' for classic 8-bit chiptune) */
  waveform: OscillatorType;
  /** Starting frequency in Hz */
  startFrequencyHz: number;
  /** Optional ending frequency in Hz for pitch sweeps (defaults to startFrequencyHz) */
  endFrequencyHz?: number;
  /** Duration of this tone step in seconds */
  durationSec: number;
  /** Delay offset from the start of the sound effect in seconds */
  startOffsetSec?: number;
  /** Peak volume gain (0.0 to 1.0) */
  peakGain: number;
}

export interface SoundEffectDefinition {
  id: SoundEventId;
  label: string;
  description: string;
  enabled: boolean;
  steps: SoundToneStep[];
}
