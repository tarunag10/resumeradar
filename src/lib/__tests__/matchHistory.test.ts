import {
  clearMatchHistory,
  getHistoryEntry,
  getMatchHistory,
  saveMatchToHistory,
} from '../matchHistory';
import { LEGACY_MATCH_HISTORY_KEY, MATCH_HISTORY_KEY } from '../localStorage';
import { analyzeMatch } from '../scoring';

describe('matchHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores enough data to restore a previous comparison', () => {
    const resumeText = 'Senior analyst with Python SQL dashboards and stakeholder management experience across several projects.';
    const jobPostText = 'Senior data analyst needed with Python, SQL, dashboarding, stakeholder management, and AWS experience.';
    const result = analyzeMatch(resumeText, jobPostText);

    const id = saveMatchToHistory(resumeText, jobPostText, result);
    const entry = getHistoryEntry(id);

    expect(entry?.resumeText).toBe(resumeText);
    expect(entry?.jobPostText).toBe(jobPostText);
    expect(entry?.result.matchScore).toBe(result.matchScore);
  });

  it('keeps only the 10 most recent entries', () => {
    const result = analyzeMatch('Python SQL dashboards', 'Python SQL AWS dashboards');

    for (let i = 0; i < 12; i++) {
      saveMatchToHistory(`resume ${i} Python SQL dashboards`, `job ${i} Python SQL AWS dashboards`, result);
    }

    expect(getMatchHistory()).toHaveLength(10);
  });

  it('clears stored history', () => {
    const result = analyzeMatch('Python SQL dashboards', 'Python SQL AWS dashboards');
    saveMatchToHistory('resume Python SQL dashboards', 'job Python SQL AWS dashboards', result);

    clearMatchHistory();

    expect(getMatchHistory()).toEqual([]);
  });

  it('ignores corrupt stored history instead of throwing', () => {
    localStorage.setItem(MATCH_HISTORY_KEY, '{ not json');
    expect(getMatchHistory()).toEqual([]);

    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify({ not: 'an array' }));
    expect(getMatchHistory()).toEqual([]);

    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify([{ id: 'x' }]));
    expect(getMatchHistory()).toEqual([]);
  });

  it('repairs entries saved without newer result fields', () => {
    localStorage.setItem(
      MATCH_HISTORY_KEY,
      JSON.stringify([
        {
          id: 'entry-1',
          timestamp: new Date().toISOString(),
          resumeText: 'Python SQL dashboards',
          jobPostText: 'Python SQL dashboards',
          result: { matchScore: 40, scoreBreakdown: [] },
          matchScore: 40,
        },
      ])
    );

    const [entry] = getMatchHistory();

    expect(entry.result.suggestedBullets).toEqual([]);
    expect(entry.result.jobInsights.roleTitle).toBe('Role not detected');
    expect(entry.keywordScore).toBe(0);
  });

  it('reads history written under the older storage key', () => {
    const result = analyzeMatch('Python SQL dashboards', 'Python SQL AWS dashboards');
    saveMatchToHistory('resume Python SQL dashboards', 'job Python SQL AWS dashboards', result);

    const stored = localStorage.getItem(MATCH_HISTORY_KEY);
    localStorage.removeItem(MATCH_HISTORY_KEY);
    localStorage.setItem(LEGACY_MATCH_HISTORY_KEY, stored as string);

    expect(getMatchHistory()).toHaveLength(1);
  });

  it('reports failure instead of throwing when storage rejects the write', () => {
    const result = analyzeMatch('Python SQL dashboards', 'Python SQL AWS dashboards');
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => saveMatchToHistory('resume', 'job', result)).not.toThrow();
    expect(saveMatchToHistory('resume', 'job', result)).toBe('');

    warn.mockRestore();
    setItem.mockRestore();
  });
});
