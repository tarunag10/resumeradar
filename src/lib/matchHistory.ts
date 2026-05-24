import { ScoringResult } from './scoring';

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

// Save a match to history
export function saveMatchToHistory(
  resumeText: string,
  jobPostText: string,
  result: ScoringResult
): string {
  try {
    const history = getMatchHistory();
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const entry: MatchHistoryEntry = {
      id,
      timestamp: new Date().toISOString(),
      resumePreview: resumeText.substring(0, 100) + (resumeText.length > 100 ? '...' : ''),
      jobPostPreview: jobPostText.substring(0, 100) + (jobPostText.length > 100 ? '...' : ''),
      resumeText,
      jobPostText,
      result,
      matchScore: result.matchScore,
      keywordScore: result.keywordScore,
      skillScore: result.skillScore,
    };
    
    // Keep last 10 entries
    history.unshift(entry);
    if (history.length > 10) {
      history.pop();
    }
    
    localStorage.setItem('matchHistory', JSON.stringify(history));
    return id;
  } catch (e) {
    console.warn('Failed to save match history:', e);
    return '';
  }
}

// Get match history
export function getMatchHistory(): MatchHistoryEntry[] {
  try {
    const stored = localStorage.getItem('matchHistory');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Clear match history
export function clearMatchHistory(): void {
  try {
    localStorage.removeItem('matchHistory');
  } catch (e) {
    console.warn('Failed to clear match history:', e);
  }
}

// Get a single history entry by ID
export function getHistoryEntry(id: string): MatchHistoryEntry | null {
  const history = getMatchHistory();
  return history.find(entry => entry.id === id) || null;
}
