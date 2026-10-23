import {
  DifficultyConfig,
  GameModeProfile,
  PhysicsConfig,
  PracticeSubModeId,
  RunModeId,
} from './types';

/**
 * Physics & Arena Dimensions Configuration
 * Tuned so that:
 * - Single jump apex = v1^2 / (2 * g) = 525^2 / (2 * 1450) ≈ 95px bottom height (center = 123px -> MIDDLE tier)
 * - Double jump reaches TOP tier smoothly (center ≈ 214px)
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  corridorWidth: 880,
  corridorHeight: 320,
  playerX: 165,
  playerRadius: 26,
  obstacleWidth: 48,
  obstacleShapeRadius: 27,
  gravity: 1300,
  singleJumpVelocity: 555,
  doubleJumpVelocity: 620,
  maxJumps: 2,
};

/**
 * Core Game Progression Curve (Starts slow and increases speed every 10 obstacles)
 */
export const CORE_GAME_DIFFICULTY: DifficultyConfig = {
  id: 'game',
  name: 'GeoShift Engine',
  description: 'Starts slow and increases speed every 10 obstacles.',
  baseScrollSpeed: 215,
  obstaclesPerSpeedStep: 10,
  speedIncrementPerStep: 28,
  maxScrollSpeed: 520,
  reactionTimeBufferSec: 0.72,
  minReactionTimeBufferSec: 0.34,
};

export const JUMP_MATCH_DIFFICULTY: DifficultyConfig = {
  id: 'jump-match',
  name: 'Auto-Jump Match Engine',
  description: 'Automatic double jumps—tightens jump window slightly every 10 matches.',
  baseScrollSpeed: 200,
  obstaclesPerSpeedStep: 10,
  speedIncrementPerStep: 18,
  maxScrollSpeed: 380,
  reactionTimeBufferSec: 0.85,
  minReactionTimeBufferSec: 0.45,
};

const PRACTICE_ISOLATED_DIFFICULTY: DifficultyConfig = {
  id: 'practice-isolated',
  name: 'Practice Pace',
  description: 'Focused training pace for isolated skill mastery.',
  baseScrollSpeed: 190,
  obstaclesPerSpeedStep: 10,
  speedIncrementPerStep: 0,
  maxScrollSpeed: 190,
  reactionTimeBufferSec: 0.9,
  minReactionTimeBufferSec: 0.9,
};

const PRACTICE_FULL_DIFFICULTY: DifficultyConfig = {
  id: 'practice-full',
  name: 'Guided Full Practice Pace',
  description: 'Slower speed with proximity pause so you can match Color + Shape first, then Jump.',
  baseScrollSpeed: 165,
  obstaclesPerSpeedStep: 10,
  speedIncrementPerStep: 0,
  maxScrollSpeed: 165,
  reactionTimeBufferSec: 1.05,
  minReactionTimeBufferSec: 1.05,
};

/**
 * Declarative Registry of Game and Practice Modes
 * Changing, adding, or removing any mode requires only updating this registry.
 */
export const MODE_PROFILE_REGISTRY: GameModeProfile[] = [
  {
    id: 'GAME',
    isPractice: false,
    isAutoJumpMode: false,
    name: 'Run Mode',
    shortLabel: 'Run Mode',
    menuSubtitle: 'Hard to Play: Match Color, Shape & Jump',
    description: 'Full progressive corridor run—shift Color, Shape, and time your Jumps as speed increases every 10 gates.',
    allowColorShift: true,
    allowShapeShift: true,
    allowJump: true,
    allowedTiers: ['GROUND', 'MIDDLE', 'TOP'],
    initialLives: 1,
    useStartCountdown: true,
    batchObstacleTarget: null,
    forgivingRetryOnFail: false,
    stopAtProximityUntilMatched: false,
    proximityStopOffsetPx: 0,
    difficulty: CORE_GAME_DIFFICULTY,
  },
  {
    id: 'JUMP_MATCH',
    isPractice: false,
    isAutoJumpMode: true,
    name: 'Jump Mode',
    shortLabel: 'Jump Mode',
    menuSubtitle: 'Easier to Play: Match Color & Shape',
    description: 'Your shape double-jumps automatically—match the target Color and Shape before landing. Jump space tightens slightly every 10 matches.',
    allowColorShift: true,
    allowShapeShift: true,
    allowJump: false,
    allowedTiers: ['TOP'],
    initialLives: 3,
    useStartCountdown: true,
    batchObstacleTarget: null,
    forgivingRetryOnFail: false,
    stopAtProximityUntilMatched: false,
    proximityStopOffsetPx: 0,
    difficulty: JUMP_MATCH_DIFFICULTY,
  },
  {
    id: 'PRACTICE_SHAPE',
    isPractice: true,
    practiceSubMode: 'SHAPE',
    name: 'Shape Practice',
    shortLabel: 'Shape',
    description: 'Match only the Shape (↑ / ↓ or W / S). Color and Jump are locked; all obstacles stay on the ground in one color.',
    allowColorShift: false,
    allowShapeShift: true,
    allowJump: false,
    allowedTiers: ['GROUND'],
    batchObstacleTarget: 5,
    forgivingRetryOnFail: true,
    stopAtProximityUntilMatched: false,
    proximityStopOffsetPx: 0,
    difficulty: PRACTICE_ISOLATED_DIFFICULTY,
  },
  {
    id: 'PRACTICE_COLOR',
    isPractice: true,
    practiceSubMode: 'COLOR',
    name: 'Color Practice',
    shortLabel: 'Color',
    description: 'Match only the Color (← / → or A / D). Shape and Jump are locked; all obstacles stay on the ground in one shape.',
    allowColorShift: true,
    allowShapeShift: false,
    allowJump: false,
    allowedTiers: ['GROUND'],
    batchObstacleTarget: 5,
    forgivingRetryOnFail: true,
    stopAtProximityUntilMatched: false,
    proximityStopOffsetPx: 0,
    difficulty: PRACTICE_ISOLATED_DIFFICULTY,
  },
  {
    id: 'PRACTICE_JUMP',
    isPractice: true,
    practiceSubMode: 'JUMP',
    name: 'Jump Practice',
    shortLabel: 'Jump',
    description: 'Practice Ground, Single Jump (Space), and Double Jump (2× Space). Color and Shape are locked.',
    allowColorShift: false,
    allowShapeShift: false,
    allowJump: true,
    allowedTiers: ['GROUND', 'MIDDLE', 'TOP'],
    batchObstacleTarget: 5,
    forgivingRetryOnFail: true,
    stopAtProximityUntilMatched: false,
    proximityStopOffsetPx: 0,
    difficulty: PRACTICE_ISOLATED_DIFFICULTY,
  },
  {
    id: 'PRACTICE_FULL',
    isPractice: true,
    practiceSubMode: 'FULL',
    name: 'Full Practice',
    shortLabel: 'Full',
    description: 'Match Color, Shape, and Jump at a slower speed. Approaching walls pause at a proximity threshold until you match Color and Shape, then resume so you can time your Jump.',
    allowColorShift: true,
    allowShapeShift: true,
    allowJump: true,
    allowedTiers: ['GROUND', 'MIDDLE', 'TOP'],
    batchObstacleTarget: 5,
    forgivingRetryOnFail: true,
    stopAtProximityUntilMatched: true,
    // 210px ahead of playerCenterX gives ample runway to execute a Single or Double Jump once unlocked
    proximityStopOffsetPx: 210,
    difficulty: PRACTICE_FULL_DIFFICULTY,
  },
];

export const PRACTICE_MODE_PROFILES: GameModeProfile[] =
  MODE_PROFILE_REGISTRY.filter((m) => m.isPractice);

export function getModeProfileById(id: RunModeId): GameModeProfile {
  return MODE_PROFILE_REGISTRY.find((m) => m.id === id) || MODE_PROFILE_REGISTRY[0];
}

export function getPracticeModeBySubMode(subMode: PracticeSubModeId): GameModeProfile {
  return (
    PRACTICE_MODE_PROFILES.find((m) => m.practiceSubMode === subMode) ||
    PRACTICE_MODE_PROFILES[0]
  );
}

export function getRemainingPracticeModes(
  currentSubMode: PracticeSubModeId
): GameModeProfile[] {
  return PRACTICE_MODE_PROFILES.filter((m) => m.practiceSubMode !== currentSubMode);
}
