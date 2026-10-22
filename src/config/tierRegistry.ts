import { VerticalTierDefinition, VerticalTierId } from './types';

/**
 * Decoupled Vertical Tiers Registry
 * Defines the three vertical positions within the corridor walls:
 * - GROUND: Target shape sits on the floor; a black overhang drops from the ceiling.
 * - MIDDLE: Target shape sits atop a medium black floor pillar; requires a Single Jump (Space).
 * - TOP: Target shape sits atop a tall black floor pillar; requires a Double Jump (Space x2).
 *
 * Corridor height is 320px, player radius is 26px (diameter 52px).
 */
export const VERTICAL_TIER_REGISTRY: VerticalTierDefinition[] = [
  {
    id: 'GROUND',
    label: 'Ground Position',
    shortHint: 'Stay Grounded',
    requiredJumps: 0,
    targetCenterHeightAboveFloor: 28,
    verticalTolerance: 38,
    wallGeometry: {
      bottomPillarHeight: 0,
      topCeilingDrop: 195,
    },
  },
  {
    id: 'MIDDLE',
    label: 'Middle Position',
    shortHint: 'Single Jump (Space)',
    requiredJumps: 1,
    targetCenterHeightAboveFloor: 112,
    verticalTolerance: 52,
    wallGeometry: {
      bottomPillarHeight: 82, // Target shape sits cleanly atop the 82px pillar
      topCeilingDrop: 0,
    },
  },
  {
    id: 'TOP',
    label: 'Top Position',
    shortHint: 'Double Jump (Space × 2)',
    requiredJumps: 2,
    targetCenterHeightAboveFloor: 198,
    verticalTolerance: 58,
    wallGeometry: {
      bottomPillarHeight: 166, // Target shape sits cleanly atop the 166px tall pillar
      topCeilingDrop: 0,
    },
  },
];

export function getTierById(id: VerticalTierId): VerticalTierDefinition {
  return VERTICAL_TIER_REGISTRY.find((t) => t.id === id) || VERTICAL_TIER_REGISTRY[0];
}
