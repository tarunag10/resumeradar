import { buildMarkdownReport, buildPlainTextReport } from '../exportResults';
import { ScoringResult } from '../scoring';

const baseResult: ScoringResult = {
  matchScore: 72,
  keywordScore: 70,
  skillScore: 80,
  phraseScore: 60,
  repeatedJobTermScore: 65,
  repetitionPenalty: 2,
  matchedKeywords: [{ keyword: 'python', count: 2, importance: 0.4 }],
  missingKeywords: [{ keyword: 'kubernetes', count: 1, importance: 0.3 }],
  missingSkills: [{ skill: 'aws', category: 'technical' }],
  matchedSkills: [{ skill: 'python', category: 'technical' }],
  repeatedPhrases: [{ phrase: 'responsible for', count: 3, suggestion: 'Use a stronger action verb.' }],
  suggestedBullets: ['If accurate, add a bullet showing how you used Python to produce a measurable result.'],
  scoreBreakdown: [
    { label: 'Keywords', score: 70, weight: 35, detail: 'Shared important terms from the job post.' },
  ],
  resumeQualityChecks: [
    { id: 'metrics', label: 'Metrics and outcomes', status: 'warning', detail: 'Few measurable outcomes found.', action: 'Add numbers where truthful.' },
  ],
  jobInsights: {
    seniority: 'Senior',
    roleTitle: 'Data Analyst',
    requiredSkills: ['python'],
    preferredSkills: ['aws'],
    responsibilities: ['build dashboards'],
    topTerms: ['python', 'dashboard'],
  },
  tfidfAnalysis: {
    resumeImportantTerms: ['python'],
    jobPostImportantTerms: ['python', 'kubernetes'],
    coverageRatio: 50,
  },
};

describe('exportResults', () => {
  it('builds a markdown report with score, gaps, quality checks, and bullets', () => {
    const report = buildMarkdownReport(baseResult);

    expect(report).toContain('# ResumeRadar Match Report');
    expect(report).toContain('Match score: 72%');
    expect(report).toContain('kubernetes');
    expect(report).toContain('Metrics and outcomes');
    expect(report).toContain('If accurate');
  });

  it('builds a plain text report without markdown headings', () => {
    const report = buildPlainTextReport(baseResult);

    expect(report).toContain('ResumeRadar Match Report');
    expect(report).toContain('Match score: 72%');
    expect(report).not.toContain('# ResumeRadar');
  });
});
