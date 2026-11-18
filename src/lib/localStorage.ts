import { ScoringResult } from './scoring';
import { parseStoredResult } from './resultSchema';

export const MATCH_HISTORY_KEY = 'resumeMatcher.matchHistory';
// Key used by earlier versions; still read once so existing history is not lost.
export const LEGACY_MATCH_HISTORY_KEY = 'matchHistory';

const STORAGE_KEYS = {
  resumeText: 'resumeMatcher.resumeText',
  jobPostText: 'resumeMatcher.jobPostText',
  lastResult: 'resumeMatcher.lastResult',
  lastAnalyzedAt: 'resumeMatcher.lastAnalyzedAt',
  preferences: 'resumeMatcher.preferences',
} as const;

export interface Preferences {
  theme?: 'light' | 'dark' | 'system';
  compactView?: boolean;
}

let storageAvailability: boolean | null = null;

/**
 * Checked lazily and only in the browser: probing at module scope runs during prerender and
 * touches Node's experimental localStorage global, which is not the browser's storage.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (storageAvailability !== null) return storageAvailability;

  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    storageAvailability = true;
  } catch {
    storageAvailability = false;
  }

  return storageAvailability;
}

function writeKey(key: string, value: string | null): boolean {
  if (!isStorageAvailable()) return false;
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  } catch (e) {
    console.warn(`Failed to write ${key}:`, e);
    return false;
  }
}

function readKey(key: string): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to read ${key}:`, e);
    return null;
  }
}

/** Returns false when the text could not be persisted (for example a full storage quota). */
export function saveResumeText(text: string): boolean {
  if (!text) return writeKey(STORAGE_KEYS.resumeText, null);
  return writeKey(STORAGE_KEYS.resumeText, text);
}

export function clearResumeText(): void {
  writeKey(STORAGE_KEYS.resumeText, null);
}

export function getResumeText(): string {
  return readKey(STORAGE_KEYS.resumeText) || '';
}

/** Returns false when the text could not be persisted (for example a full storage quota). */
export function saveJobPostText(text: string): boolean {
  if (!text) return writeKey(STORAGE_KEYS.jobPostText, null);
  return writeKey(STORAGE_KEYS.jobPostText, text);
}

export function clearJobPostText(): void {
  writeKey(STORAGE_KEYS.jobPostText, null);
}

export function getJobPostText(): string {
  return readKey(STORAGE_KEYS.jobPostText) || '';
}

/** Returns false when the result could not be persisted. */
export function saveLastResult(result: ScoringResult): boolean {
  const savedResult = writeKey(STORAGE_KEYS.lastResult, JSON.stringify(result));
  if (savedResult) {
    writeKey(STORAGE_KEYS.lastAnalyzedAt, new Date().toISOString());
  }
  return savedResult;
}

export function getLastResult(): { result: ScoringResult | null; timestamp: string | null } {
  const resultStr = readKey(STORAGE_KEYS.lastResult);
  const timestamp = readKey(STORAGE_KEYS.lastAnalyzedAt);

  if (!resultStr) return { result: null, timestamp: timestamp || null };

  try {
    return {
      result: parseStoredResult(JSON.parse(resultStr)),
      timestamp: timestamp || null,
    };
  } catch (e) {
    console.warn('Failed to parse last result:', e);
    return { result: null, timestamp: null };
  }
}

export function savePreferences(prefs: Preferences): boolean {
  return writeKey(STORAGE_KEYS.preferences, JSON.stringify(prefs));
}

export function getPreferences(): Preferences {
  const prefsStr = readKey(STORAGE_KEYS.preferences);
  if (!prefsStr) return {};
  try {
    const parsed = JSON.parse(prefsStr);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.warn('Failed to get preferences:', e);
  }
  return {};
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    writeKey(key, null);
  });
  writeKey(MATCH_HISTORY_KEY, null);
  writeKey(LEGACY_MATCH_HISTORY_KEY, null);
}
