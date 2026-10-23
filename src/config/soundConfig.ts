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

  MATCH_SUCCESS: {
    id: 'MATCH_SUCCESS',
    label: 'Target Matched',
    description: 'Bright 2-note ascending chime played when landing with the matching shape and color.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 523.25,
        endFrequencyHz: 659.25,
        durationSec: 0.065,
        startOffsetSec: 0,
        peakGain: 0.09,
      },
      {
        waveform: 'square',
        startFrequencyHz: 659.25,
        endFrequencyHz: 880,
        durationSec: 0.09,
        startOffsetSec: 0.065,
        peakGain: 0.1,
      },
    ],
  },

  LIFE_LOST: {
    id: 'LIFE_LOST',
    label: 'Life Lost',
    description: 'Short low 8-bit buzz played when landing without matching the target.',
    enabled: true,
    steps: [
      {
        waveform: 'sawtooth',
        startFrequencyHz: 290,
        endFrequencyHz: 185,
        durationSec: 0.14,
        startOffsetSec: 0,
        peakGain: 0.11,
      },
      {
        waveform: 'square',
        startFrequencyHz: 185,
        endFrequencyHz: 130,
        durationSec: 0.16,
        startOffsetSec: 0.12,
        peakGain: 0.11,
      },
    ],
  },

  COUNTDOWN_TICK: {
    id: 'COUNTDOWN_TICK',
    label: 'Countdown Tick',
    description: 'Crisp arcade beep played on each 3-2-1 countdown step.',
    enabled: true,
    steps: [
      {
        waveform: 'square',
        startFrequencyHz: 440,
        endFrequencyHz: 480,
        durationSec: 0.07,
        startOffsetSec: 0,
        peakGain: 0.08,
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
