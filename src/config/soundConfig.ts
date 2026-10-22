import { SoundEffectDefinition, SoundEventId } from './types';

/**
 * Declarative Sound Effects Registry
 * All audio parameters (waveform, pitch frequencies, duration, gain, and multi-note sequences)
 * are defined here so sound design can be swapped or tuned without touching engine or UI code.
 */
export const SOUND_EFFECT_REGISTRY: Record<SoundEventId, SoundEffectDefinition> = {
  SHIFT: {
    id: 'SHIFT',
    label: 'Shape / Color Shift',
    description: 'Crisp 8-bit blip played when shifting to a new shape or color slot.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 520,
        endFrequencyHz: 680,
        durationSec: 0.045,
        startOffsetSec: 0,
        peakGain: 0.08,
      },
    ],
  },

  JUMP_SINGLE: {
    id: 'JUMP_SINGLE',
    label: 'Single Jump',
    description: 'Rising 8-bit arcade sweep played on the first jump from the floor.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 240,
        endFrequencyHz: 540,
        durationSec: 0.11,
        startOffsetSec: 0,
        peakGain: 0.1,
      },
    ],
  },

  JUMP_DOUBLE: {
    id: 'JUMP_DOUBLE',
    label: 'Double Jump',
    description: 'Higher-pitched rising 8-bit sweep played on the second mid-air jump.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 420,
        endFrequencyHz: 860,
        durationSec: 0.12,
        startOffsetSec: 0,
        peakGain: 0.1,
      },
    ],
  },

  GAME_OVER: {
    id: 'GAME_OVER',
    label: 'Game Over',
    description: 'Classic 3-note descending 8-bit arcade cadence on obstacle collision.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 440,
        endFrequencyHz: 392,
        durationSec: 0.11,
        startOffsetSec: 0,
        peakGain: 0.11,
      },
      {
        waveform: 'square',
        startFrequencyHz: 349.23,
        endFrequencyHz: 311.13,
        durationSec: 0.11,
        startOffsetSec: 0.11,
        peakGain: 0.11,
      },
      {
        waveform: 'square',
        startFrequencyHz: 261.63,
        endFrequencyHz: 164.81,
        durationSec: 0.24,
        startOffsetSec: 0.22,
        peakGain: 0.12,
      },
    ],
  },
};

export function getSoundEffectById(id: SoundEventId): SoundEffectDefinition {
  return SOUND_EFFECT_REGISTRY[id];
}
