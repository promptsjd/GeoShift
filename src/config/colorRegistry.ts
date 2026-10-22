import { ColorDefinition } from './types';

/**
 * Decoupled Color Palette Registry
 * Matches the core flat vector colors from the GeoShift specification,
 * plus optional extra colors that can be enabled dynamically without changing engine logic.
 */
export const COLOR_REGISTRY: ColorDefinition[] = [
  {
    id: 'cyan',
    name: 'Sky Cyan',
    hex: '#00A8E8',
    strokeHex: '#7DD3FC',
    enabledByDefault: true,
  },
  {
    id: 'purple',
    name: 'Vivid Violet',
    hex: '#9B2FAE',
    strokeHex: '#D8B4FE',
    enabledByDefault: true,
  },
  {
    id: 'green',
    name: 'Emerald Green',
    hex: '#166E3D',
    strokeHex: '#4ADE80',
    enabledByDefault: true,
  },
  {
    id: 'yellow',
    name: 'Solar Yellow',
    hex: '#F5E614',
    strokeHex: '#FEF08A',
    enabledByDefault: true,
  },
  {
    id: 'red',
    name: 'Crimson Red',
    hex: '#E12D2D',
    strokeHex: '#FCA5A5',
    enabledByDefault: true,
  },
  {
    id: 'orange',
    name: 'Amber Blaze',
    hex: '#F97316',
    strokeHex: '#FDBA74',
    enabledByDefault: false,
  },
  {
    id: 'teal',
    name: 'Mint Teal',
    hex: '#14B8A6',
    strokeHex: '#99F6E4',
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
