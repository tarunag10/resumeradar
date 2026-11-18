import { ScoringResult } from './scoring';
import { parseStoredResult } from './resultSchema';
import { LEGACY_MATCH_HISTORY_KEY, MATCH_HISTORY_KEY, isStorageAvailable } from './localStorage';

export const MAX_HISTORY_ENTRIES = 10;

export interface MatchHistoryEntry {
  id: string;
  timestamp: string;
  resumePreview: string;
  jobPostPreview: string;
  resumeText: string;
  jobPostText: string;
  result: ScoringResult;
  matchScore: number;
  keywordScore: number;
  skillScore: number;
}

function preview(text: string): string {
  return text.substring(0, 100) + (text.length > 100 ? '...' : '');
}

function parseEntry(value: unknown): MatchHistoryEntry | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;

  const entry = value as Record<string, unknown>;
  const result = parseStoredResult(entry.result);

  if (!result) return null;
  if (typeof entry.resumeText !== 'string' || typeof entry.jobPostText !== 'string') return null;
  if (typeof entry.id !== 'string' || typeof entry.timestamp !== 'string') return null;

  return {
    id: entry.id,
    timestamp: entry.timestamp,
    resumePreview: typeof entry.resumePreview === 'string' ? entry.resumePreview : preview(entry.resumeText),
    jobPostPreview: typeof entry.jobPostPreview === 'string' ? entry.jobPostPreview : preview(entry.jobPostText),
    resumeText: entry.resumeText,
    jobPostText: entry.jobPostText,
    result,
    matchScore: typeof entry.matchScore === 'number' ? entry.matchScore : result.matchScore,
    keywordScore: typeof entry.keywordScore === 'number' ? entry.keywordScore : result.keywordScore,
    skillScore: typeof entry.skillScore === 'number' ? entry.skillScore : result.skillScore,
  };
}

function readRaw(): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(MATCH_HISTORY_KEY) ?? localStorage.getItem(LEGACY_MATCH_HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to read match history:', e);
    return null;
  }
}

function writeHistory(history: MatchHistoryEntry[]): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    console.warn('Failed to write match history:', e);
    return false;
  }
}

// Get match history, discarding entries that cannot be rendered
export function getMatchHistory(): MatchHistoryEntry[] {
  const raw = readRaw();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(parseEntry)
      .filter((entry): entry is MatchHistoryEntry => entry !== null)
      .slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

/**
 * Save a match to history. When the browser's storage quota is exhausted the oldest entry is
 * dropped once and the write retried, so a single large analysis cannot block history forever.
 * Returns the new entry id, or an empty string when nothing could be stored.
 */
export function saveMatchToHistory(
  resumeText: string,
  jobPostText: string,
  result: ScoringResult
): string {
  if (!isStorageAvailable()) return '';

  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const entry: MatchHistoryEntry = {
    id,
    timestamp: new Date().toISOString(),
    resumePreview: preview(resumeText),
    jobPostPreview: preview(jobPostText),
    resumeText,
    jobPostText,
    result,
    matchScore: result.matchScore,
    keywordScore: result.keywordScore,
    skillScore: result.skillScore,
  };

  const history = [entry, ...getMatchHistory()];

  if (writeHistory(history.slice(0, MAX_HISTORY_ENTRIES))) return id;

  // Retry with fewer entries so quota pressure from older, larger matches is released.
  for (let keep = Math.min(history.length - 1, MAX_HISTORY_ENTRIES - 1); keep >= 0; keep--) {
    if (writeHistory([entry, ...history.slice(1, keep + 1)])) return id;
  }

  return '';
}

// Clear match history
export function clearMatchHistory(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(MATCH_HISTORY_KEY);
    localStorage.removeItem(LEGACY_MATCH_HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear match history:', e);
  }
}

// Get a single history entry by ID
export function getHistoryEntry(id: string): MatchHistoryEntry | null {
  const history = getMatchHistory();
  return history.find(entry => entry.id === id) || null;
}
