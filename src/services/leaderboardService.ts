import { LeaderboardEntry } from '../config/types';

const LEADERBOARD_STORAGE_KEY = 'geoshift_leaderboard_v1';
const LAST_PLAYER_NAME_KEY = 'geoshift_last_custom_player_name_v1';
const MAX_LEADERBOARD_ENTRIES = 10;
const MAX_NAME_LENGTH = 15;

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is LeaderboardEntry =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.score === 'number' &&
          typeof item.playerName === 'string'
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
  } catch {
    return [];
  }
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

  const newRecord: LeaderboardEntry = {
    ...entry,
    playerName: resolvedName,
    id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAtISO: new Date().toISOString(),
  };

  const updated = [...existing, newRecord]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.speedLevelReached - a.speedLevelReached;
    })
    .slice(0, MAX_LEADERBOARD_ENTRIES);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  return updated;
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
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
