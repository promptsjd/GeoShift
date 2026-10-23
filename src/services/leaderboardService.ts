import { CompetitiveModeId, LeaderboardEntry } from '../config/types';

const LEADERBOARD_STORAGE_KEY = 'geoshift_leaderboard_v1';
const BEST_SCORE_STORAGE_PREFIX = 'geoshift_best_score_v1';
const SESSION_BEST_SCORE_PREFIX = 'geoshift_session_best_score_v1';
const LAST_PLAYER_NAME_KEY = 'geoshift_last_custom_player_name_v1';
const MAX_LEADERBOARD_ENTRIES_PER_MODE = 10;
const MAX_NAME_LENGTH = 15;

/**
 * Normalizes legacy or display mode strings into canonical CompetitiveModeId ('GAME' | 'JUMP_MATCH')
 */
export function normalizeCompetitiveModeId(rawModeId?: string): CompetitiveModeId {
  if (!rawModeId) return 'GAME';
  const upper = rawModeId.toUpperCase();
  if (upper === 'JUMP_MATCH' || upper === 'JUMP MODE' || upper === 'JUMP') {
    return 'JUMP_MATCH';
  }
  return 'GAME';
}

function getBestScoreKey(modeId: CompetitiveModeId, isSession: boolean): string {
  const base = isSession ? SESSION_BEST_SCORE_PREFIX : BEST_SCORE_STORAGE_PREFIX;
  return modeId === 'GAME' ? base : `${base}_${modeId}`;
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(
      (item): item is LeaderboardEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.score === 'number' &&
        typeof item.playerName === 'string'
    );

    const runEntries = valid
      .filter((e) => normalizeCompetitiveModeId(e.modeId) === 'GAME')
      .sort((a, b) => b.score - a.score || b.speedLevelReached - a.speedLevelReached)
      .slice(0, MAX_LEADERBOARD_ENTRIES_PER_MODE);

    const jumpEntries = valid
      .filter((e) => normalizeCompetitiveModeId(e.modeId) === 'JUMP_MATCH')
      .sort((a, b) => b.score - a.score || b.speedLevelReached - a.speedLevelReached)
      .slice(0, MAX_LEADERBOARD_ENTRIES_PER_MODE);

    return [...runEntries, ...jumpEntries];
  } catch {
    return [];
  }
}

export function loadBestScore(modeId: CompetitiveModeId = 'GAME'): number {
  let localBest = 0;
  let sessionBest = 0;

  try {
    const rawLocal = localStorage.getItem(getBestScoreKey(modeId, false));
    if (rawLocal !== null) {
      const parsed = Number(rawLocal);
      if (Number.isFinite(parsed) && parsed > 0) {
        localBest = Math.floor(parsed);
      }
    }
  } catch {
    // ignore storage errors
  }

  try {
    const rawSession = sessionStorage.getItem(getBestScoreKey(modeId, true));
    if (rawSession !== null) {
      const parsed = Number(rawSession);
      if (Number.isFinite(parsed) && parsed > 0) {
        sessionBest = Math.floor(parsed);
      }
    }
  } catch {
    // ignore storage errors
  }

  const modeEntries = loadLeaderboard().filter(
    (e) => normalizeCompetitiveModeId(e.modeId) === modeId
  );
  const leaderboardBest = modeEntries.length > 0 ? modeEntries[0].score : 0;

  return Math.max(localBest, sessionBest, leaderboardBest, 0);
}

export function saveBestScore(
  candidateScore: number,
  modeId: CompetitiveModeId = 'GAME'
): number {
  const sanitized = Math.max(0, Math.floor(candidateScore));
  const currentBest = loadBestScore(modeId);
  const nextBest = Math.max(currentBest, sanitized);

  try {
    sessionStorage.setItem(getBestScoreKey(modeId, true), String(nextBest));
  } catch {
    // ignore storage errors
  }

  try {
    localStorage.setItem(getBestScoreKey(modeId, false), String(nextBest));
  } catch {
    // ignore storage errors
  }

  return nextBest;
}

export function saveLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'createdAtISO'>
): LeaderboardEntry[] {
  const existing = loadLeaderboard();
  const trimmedInput = entry.playerName.slice(0, MAX_NAME_LENGTH).trim();

  // Only persist as the sticky default name if the user actually typed a name
  if (trimmedInput.length > 0) {
    try {
      localStorage.setItem(LAST_PLAYER_NAME_KEY, trimmedInput);
    } catch {
      // ignore storage errors
    }
  }

  // Industry-standard arcade fallback if saved without typing a name
  const resolvedName = trimmedInput.length > 0 ? trimmedInput : 'Player 1';
  const canonicalMode = normalizeCompetitiveModeId(entry.modeId);

  const newRecord: LeaderboardEntry = {
    ...entry,
    modeId: canonicalMode,
    playerName: resolvedName,
    id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAtISO: new Date().toISOString(),
  };

  const all = [...existing, newRecord];

  const runTop = all
    .filter((e) => normalizeCompetitiveModeId(e.modeId) === 'GAME')
    .sort((a, b) => b.score - a.score || b.speedLevelReached - a.speedLevelReached)
    .slice(0, MAX_LEADERBOARD_ENTRIES_PER_MODE);

  const jumpTop = all
    .filter((e) => normalizeCompetitiveModeId(e.modeId) === 'JUMP_MATCH')
    .sort((a, b) => b.score - a.score || b.speedLevelReached - a.speedLevelReached)
    .slice(0, MAX_LEADERBOARD_ENTRIES_PER_MODE);

  const updated = [...runTop, ...jumpTop];

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  saveBestScore(entry.score, canonicalMode);

  return updated;
}

export function clearLeaderboard(modeId?: CompetitiveModeId): LeaderboardEntry[] {
  if (!modeId) {
    try {
      localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
      localStorage.removeItem(getBestScoreKey('GAME', false));
      localStorage.removeItem(getBestScoreKey('JUMP_MATCH', false));
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(getBestScoreKey('GAME', true));
      sessionStorage.removeItem(getBestScoreKey('JUMP_MATCH', true));
    } catch {
      // ignore
    }
    return [];
  }

  const remaining = loadLeaderboard().filter(
    (e) => normalizeCompetitiveModeId(e.modeId) !== modeId
  );
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(remaining));
    localStorage.removeItem(getBestScoreKey(modeId, false));
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(getBestScoreKey(modeId, true));
  } catch {
    // ignore
  }
  return remaining;
}

/**
 * Returns the user's previously typed and saved name, or an empty string
 * so first-time users see the "Name" placeholder without having to delete text.
 */
export function getLastPlayerName(): string {
  try {
    return (localStorage.getItem(LAST_PLAYER_NAME_KEY) || '').slice(0, MAX_NAME_LENGTH);
  } catch {
    return '';
  }
}
