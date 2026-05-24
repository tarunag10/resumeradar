import {
  clearMatchHistory,
  getHistoryEntry,
  getMatchHistory,
  saveMatchToHistory,
} from '../matchHistory';
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
});
