import { ControlAction, ControlBinding } from './types';

/**
 * Decoupled Input Keybindings Registry
 * Supports both Arrow keys and WASD so players can comfortably use either hand layout.
 */
export const DEFAULT_CONTROL_BINDINGS: ControlBinding[] = [
  {
    action: 'COLOR_LEFT',
    label: 'Shift Color Left',
    description: 'Moves the top color strip left to center the previous color.',
    codes: ['ArrowLeft', 'KeyA'],
    displayKeys: ['←', 'A'],
  },
  {
    action: 'COLOR_RIGHT',
    label: 'Shift Color Right',
    description: 'Moves the top color strip right to center the next color.',
    codes: ['ArrowRight', 'KeyD'],
    displayKeys: ['→', 'D'],
  },
  {
    action: 'SHAPE_UP',
    label: 'Shift Shape Up',
    description: 'Rotates the left shape strip upward.',
    codes: ['ArrowUp', 'KeyW'],
    displayKeys: ['↑', 'W'],
  },
  {
    action: 'SHAPE_DOWN',
    label: 'Shift Shape Down',
    description: 'Rotates the left shape strip downward.',
    codes: ['ArrowDown', 'KeyS'],
    displayKeys: ['↓', 'S'],
  },
  {
    action: 'JUMP',
    label: 'Jump / Double Jump',
    description: 'Press once for Middle tier; press again in mid-air for Top tier.',
    codes: ['Space'],
    displayKeys: ['Space'],
  },
  {
    action: 'PAUSE',
    label: 'Pause / Resume',
    description: 'Pauses or resumes the active run.',
    codes: ['KeyP', 'Escape'],
    displayKeys: ['P', 'Esc'],
  },
];

export function resolveControlAction(
  code: string,
  bindings: ControlBinding[] = DEFAULT_CONTROL_BINDINGS
): ControlAction | null {
  for (const binding of bindings) {
    if (binding.codes.includes(code)) {
      return binding.action;
    }
  }
  return null;
}
