import { ColorDefinition } from './types';

/**
 * Decoupled Color Palette Registry
 * Each color defines its primary fill (`hex`), outer rim highlight (`strokeHex`),
 * and inner concentric shape facet (`innerFacetHex` & `innerFacetAlpha`) so every
 * color—including Solar Yellow—displays a bold, unmistakable inner facet across
 * the corridor canvas, carousels, and modal diagrams.
 */
export const COLOR_REGISTRY: ColorDefinition[] = [
  {
    id: 'cyan',
    name: 'Sky Cyan',
    hex: '#00A8E8',
    strokeHex: '#7DD3FC',
    innerFacetHex: '#BAE6FD',
    innerFacetAlpha: 0.48,
    enabledByDefault: true,
  },
  {
    id: 'purple',
    name: 'Vivid Violet',
    hex: '#9B2FAE',
    strokeHex: '#E9D5FF',
    innerFacetHex: '#F3E8FF',
    innerFacetAlpha: 0.44,
    enabledByDefault: true,
  },
  {
    id: 'green',
    name: 'Emerald Green',
    hex: '#166E3D',
    strokeHex: '#4ADE80',
    innerFacetHex: '#86EFAC',
    innerFacetAlpha: 0.45,
    enabledByDefault: true,
  },
  {
    id: 'yellow',
    name: 'Solar Yellow',
    hex: '#F5E614',
    strokeHex: '#FEF9C3',
    innerFacetHex: '#A16207',
    innerFacetAlpha: 0.50,
    enabledByDefault: true,
  },
  {
    id: 'red',
    name: 'Crimson Red',
    hex: '#E12D2D',
    strokeHex: '#FCA5A5',
    innerFacetHex: '#FECACA',
    innerFacetAlpha: 0.46,
    enabledByDefault: true,
  },
  {
    id: 'orange',
    name: 'Amber Blaze',
    hex: '#F97316',
    strokeHex: '#FDBA74',
    innerFacetHex: '#FFEDD5',
    innerFacetAlpha: 0.46,
    enabledByDefault: false,
  },
  {
    id: 'teal',
    name: 'Mint Teal',
    hex: '#14B8A6',
    strokeHex: '#99F6E4',
    innerFacetHex: '#CCFBF1',
    innerFacetAlpha: 0.46,
    enabledByDefault: false,
  },
];

export function getActiveColors(enabledIds?: string[]): ColorDefinition[] {
  if (enabledIds && enabledIds.length >= 2) {
    const filtered = COLOR_REGISTRY.filter((c) => enabledIds.includes(c.id));
    if (filtered.length >= 2) return filtered;
  }
  return COLOR_REGISTRY.filter((c) => c.enabledByDefault);
}

export function getColorById(id: string): ColorDefinition {
  return COLOR_REGISTRY.find((c) => c.id === id) || COLOR_REGISTRY[0];
}
