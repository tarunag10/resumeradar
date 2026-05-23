import { ScoringResult } from './scoring';

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

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export const isStorageAvailable = isLocalStorageAvailable();

export function saveResumeText(text: string): void {
  if (!isStorageAvailable) return;
  try {
    if (!text) {
      localStorage.removeItem(STORAGE_KEYS.resumeText);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.resumeText, text);
  } catch (e) {
    console.warn('Failed to save resume text:', e);
  }
}

export function clearResumeText(): void {
  if (!isStorageAvailable) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.resumeText);
  } catch (e) {
    console.warn('Failed to clear resume text:', e);
  }
}

export function getResumeText(): string {
  if (!isStorageAvailable) return '';
  return localStorage.getItem(STORAGE_KEYS.resumeText) || '';
}

export function saveJobPostText(text: string): void {
  if (!isStorageAvailable) return;
  try {
    if (!text) {
      localStorage.removeItem(STORAGE_KEYS.jobPostText);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.jobPostText, text);
  } catch (e) {
    console.warn('Failed to save job post text:', e);
  }
}

export function clearJobPostText(): void {
  if (!isStorageAvailable) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.jobPostText);
  } catch (e) {
    console.warn('Failed to clear job post text:', e);
  }
}

export function getJobPostText(): string {
  if (!isStorageAvailable) return '';
  return localStorage.getItem(STORAGE_KEYS.jobPostText) || '';
}

export function saveLastResult(result: ScoringResult): void {
  if (!isStorageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEYS.lastResult, JSON.stringify(result));
    localStorage.setItem(STORAGE_KEYS.lastAnalyzedAt, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to save result:', e);
  }
}

export function getLastResult(): { result: ScoringResult | null; timestamp: string | null } {
  if (!isStorageAvailable) return { result: null, timestamp: null };
  try {
    const resultStr = localStorage.getItem(STORAGE_KEYS.lastResult);
    const timestamp = localStorage.getItem(STORAGE_KEYS.lastAnalyzedAt);
    return {
      result: resultStr ? JSON.parse(resultStr) : null,
      timestamp: timestamp || null,
    };
  } catch (e) {
    console.warn('Failed to get last result:', e);
    return { result: null, timestamp: null };
  }
}

export function savePreferences(prefs: Preferences): void {
  if (!isStorageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

export function getPreferences(): Preferences {
  if (!isStorageAvailable) return {};
  try {
    const prefsStr = localStorage.getItem(STORAGE_KEYS.preferences);
    return prefsStr ? JSON.parse(prefsStr) : {};
  } catch (e) {
    console.warn('Failed to get preferences:', e);
    return {};
  }
}

export function clearAllData(): void {
  if (!isStorageAvailable) return;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('Failed to clear data:', e);
  }
}
