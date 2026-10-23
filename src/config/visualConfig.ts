import { ArenaVisualConfig, ShapeAnimationProfile } from './types';

/**
 * Decoupled Per-Shape Animation Registry
 * - Controls exact jump rotation counts (e.g., 1 full 360° turn on single jump, 2 full turns = 720° on double jump).
 * - Controls takeoff squeeze/stretch and landing elastic squash-and-rebound per shape.
 * - Modify any value here to tune a specific shape's physical feel without touching physics or rendering code.
 */
export const SHAPE_ANIMATION_REGISTRY: Record<string, ShapeAnimationProfile> = {
  triangle: {
    shapeId: 'triangle',
    singleJumpRotations: 1, // 360° full flip on single jump
    doubleJumpRotations: 2, // 720° double flip on double jump
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.84,
      scaleY: 1.20,
      durationMs: 155,
    },
    landingDeformation: {
      scaleX: 1.24,
      scaleY: 0.76,
      durationMs: 260,
      damping: 5.2,
      oscillations: 1.6,
    },
    airborneVelocityStretchFactor: 0.00018,
    shiftPulseScale: 1.14,
    shiftPulseDurationMs: 140,
    showDirectionalBevelCore: true,
  },
  diamond: {
    shapeId: 'diamond',
    singleJumpRotations: 1, // 360° crisp spin on single jump
    doubleJumpRotations: 2, // 720° spin on double jump
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.82,
      scaleY: 1.22,
      durationMs: 150,
    },
    landingDeformation: {
      scaleX: 1.22,
      scaleY: 0.78,
      durationMs: 250,
      damping: 5.5,
      oscillations: 1.5,
    },
    airborneVelocityStretchFactor: 0.0002,
    shiftPulseScale: 1.14,
    shiftPulseDurationMs: 140,
    showDirectionalBevelCore: true,
  },
  circle: {
    shapeId: 'circle',
    // Circle emphasizes a plush, tactile squeeze on takeoff and landing plus a 360°/720° inner bevel spin
    singleJumpRotations: 1,
    doubleJumpRotations: 2,
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.78,
      scaleY: 1.26,
      durationMs: 175,
    },
    landingDeformation: {
      scaleX: 1.30,
      scaleY: 0.72,
      durationMs: 310,
      damping: 4.4,
      oscillations: 2.1,
    },
    airborneVelocityStretchFactor: 0.00026,
    shiftPulseScale: 1.16,
    shiftPulseDurationMs: 150,
    showDirectionalBevelCore: true,
  },
  pentagon: {
    shapeId: 'pentagon',
    singleJumpRotations: 1,
    doubleJumpRotations: 2,
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.85,
      scaleY: 1.18,
      durationMs: 150,
    },
    landingDeformation: {
      scaleX: 1.22,
      scaleY: 0.79,
      durationMs: 250,
      damping: 5.4,
      oscillations: 1.6,
    },
    airborneVelocityStretchFactor: 0.00016,
    shiftPulseScale: 1.14,
    shiftPulseDurationMs: 140,
    showDirectionalBevelCore: true,
  },
  star: {
    shapeId: 'star',
    singleJumpRotations: 1, // 360° star spin on single jump
    doubleJumpRotations: 2, // 720° double spin on double jump
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.83,
      scaleY: 1.21,
      durationMs: 160,
    },
    landingDeformation: {
      scaleX: 1.25,
      scaleY: 0.76,
      durationMs: 270,
      damping: 5.0,
      oscillations: 1.7,
    },
    airborneVelocityStretchFactor: 0.00018,
    shiftPulseScale: 1.15,
    shiftPulseDurationMs: 145,
    showDirectionalBevelCore: true,
  },
  hexagon: {
    shapeId: 'hexagon',
    singleJumpRotations: 1,
    doubleJumpRotations: 2,
    rotationDirection: 1,
    takeoffDeformation: {
      scaleX: 0.85,
      scaleY: 1.18,
      durationMs: 150,
    },
    landingDeformation: {
      scaleX: 1.21,
      scaleY: 0.80,
      durationMs: 245,
      damping: 5.5,
      oscillations: 1.5,
    },
    airborneVelocityStretchFactor: 0.00016,
    shiftPulseScale: 1.14,
    shiftPulseDurationMs: 140,
    showDirectionalBevelCore: true,
  },
};

export const DEFAULT_SHAPE_ANIMATION_PROFILE: ShapeAnimationProfile =
  SHAPE_ANIMATION_REGISTRY.circle;

export function getShapeAnimationProfile(shapeId: string): ShapeAnimationProfile {
  return SHAPE_ANIMATION_REGISTRY[shapeId] || DEFAULT_SHAPE_ANIMATION_PROFILE;
}

/**
 * Tactile Arcade Studio Arena Visual Configuration
 * Governs the atmospheric depth gradient, subtle architectural grid,
 * bevelled monolith obstacle pillars, and dimensional shape shading.
 */
export const ARENA_VISUAL_CONFIG: ArenaVisualConfig = {
  corridorTopHex: '#18163E',
  corridorBottomHex: '#25215E',
  gridLineColor: 'rgba(148, 163, 184, 0.06)',
  gridSpacingPx: 46,
  floorDeckHeightPx: 4,
  floorSurfaceHex: '#0B0E17',
  floorHighlightHex: 'rgba(56, 189, 248, 0.32)',
  wallFillHex: '#080B12',
  wallInnerPanelHex: '#131A2E',
  wallBevelHighlightColor: 'rgba(148, 163, 184, 0.28)',
  wallBevelShadowColor: 'rgba(0, 0, 0, 0.65)',
  wallCornerRadiusPx: 4,
  shapeShadowBlurPx: 14,
  shapeInnerBevelScale: 0.62,
  shapeInnerBevelAlpha: 0.45,
  enableJumpMotionTrail: true,
  motionTrailSteps: 3,
};

/**
 * Decoupled UI Facet Theme Tokens
 * Ensures every button, mode card, keycap, and window in the UI shares the exact same
 * outer-body + offset-inner-facet aesthetic as the playable geometric shapes.
 */
export interface FacetSurfaceStyle {
  outerBg: string;
  outerBorder: string;
  innerFacetBg: string;
  innerFacetAlpha: number;
  textHex: string;
  subtextHex: string;
}

export type FacetButtonVariant =
  | 'emerald'
  | 'cyan'
  | 'indigo'
  | 'slate'
  | 'crimson';

export const UI_FACET_VARIANTS: Record<FacetButtonVariant, FacetSurfaceStyle> = {
  emerald: {
    outerBg: '#166E3D',
    outerBorder: '#4ADE80',
    innerFacetBg: '#86EFAC',
    innerFacetAlpha: 0.34,
    textHex: '#FFFFFF',
    subtextHex: '#ECFDF5',
  },
  cyan: {
    outerBg: '#0284C7',
    outerBorder: '#7DD3FC',
    innerFacetBg: '#BAE6FD',
    innerFacetAlpha: 0.34,
    textHex: '#FFFFFF',
    subtextHex: '#E0F2FE',
  },
  indigo: {
    outerBg: '#1E1B4B',
    outerBorder: '#6366F1',
    innerFacetBg: '#818CF8',
    innerFacetAlpha: 0.24,
    textHex: '#F8FAFC',
    subtextHex: '#C7D2FE',
  },
  slate: {
    outerBg: '#0F1523',
    outerBorder: '#334155',
    innerFacetBg: '#475569',
    innerFacetAlpha: 0.28,
    textHex: '#F8FAFC',
    subtextHex: '#CBD5E1',
  },
  crimson: {
    outerBg: '#991B1B',
    outerBorder: '#FCA5A5',
    innerFacetBg: '#FECACA',
    innerFacetAlpha: 0.30,
    textHex: '#FFFFFF',
    subtextHex: '#FEE2E2',
  },
};
