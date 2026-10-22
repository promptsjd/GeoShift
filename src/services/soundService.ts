import { getSoundEffectById } from '../config/soundConfig';
import { SoundEffectDefinition, SoundEventId } from '../config/types';

const SOUND_MUTED_STORAGE_KEY = 'geoshift_sound_muted_v1';

let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioContext = new AudioCtx();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // Ignore autoplay restrictions until next user gesture
    });
  }

  return sharedAudioContext;
}

export function loadSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveSoundMuted(isMuted: boolean): boolean {
  try {
    localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(isMuted));
  } catch {
    // ignore storage errors
  }
  return isMuted;
}

/**
 * Plays any declarative SoundEffectDefinition through the Web Audio synthesizer.
 */
export function playSoundDefinition(
  definition: SoundEffectDefinition,
  isMuted: boolean
): void {
  if (isMuted || !definition.enabled || definition.steps.length === 0) {
    return;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const baseNow = ctx.currentTime;

  for (const step of definition.steps) {
    const stepStart = baseNow + (step.startOffsetSec || 0);
    const stepEnd = stepStart + Math.max(0.01, step.durationSec);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = step.waveform;
    osc.frequency.setValueAtTime(Math.max(20, step.startFrequencyHz), stepStart);

    if (
      typeof step.endFrequencyHz === 'number' &&
      step.endFrequencyHz !== step.startFrequencyHz
    ) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, step.endFrequencyHz),
        stepEnd
      );
    }

    // Fast 8-bit attack and clean exponential decay to prevent speaker clicks
    gain.gain.setValueAtTime(0.0001, stepStart);
    gain.gain.linearRampToValueAtTime(
      Math.max(0.001, Math.min(1, step.peakGain)),
      stepStart + Math.min(0.006, step.durationSec * 0.2)
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, stepEnd);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(stepStart);
    osc.stop(stepEnd + 0.005);
  }
}

/**
 * Resolves a SoundEventId from the central soundConfig registry and plays it.
 */
export function playSoundEvent(eventId: SoundEventId, isMuted: boolean): void {
  const definition = getSoundEffectById(eventId);
  if (!definition) return;
  playSoundDefinition(definition, isMuted);
}
