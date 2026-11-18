import { parseStoredResult } from '../resultSchema';

describe('resultSchema', () => {
  it('rejects values that are not scoring results', () => {
    expect(parseStoredResult(null)).toBeNull();
    expect(parseStoredResult('72')).toBeNull();
    expect(parseStoredResult({})).toBeNull();
    expect(parseStoredResult({ matchScore: '72', scoreBreakdown: [] })).toBeNull();
    expect(parseStoredResult({ matchScore: 72 })).toBeNull();
  });

  it('backfills fields that older versions did not store', () => {
    const parsed = parseStoredResult({ matchScore: 42, scoreBreakdown: [] });

    expect(parsed).not.toBeNull();
    expect(parsed?.matchScore).toBe(42);
    expect(parsed?.matchedKeywords).toEqual([]);
    expect(parsed?.suggestedBullets).toEqual([]);
    expect(parsed?.semanticMatches).toEqual([]);
    expect(parsed?.scoreNotes).toEqual([]);
    expect(parsed?.jobInsights.roleTitle).toBe('Role not detected');
    expect(parsed?.roleMode).toBe('general');
    expect(parsed?.tfidfAnalysis.coverageRatio).toBe(0);
  });

  it('drops malformed list entries instead of failing the whole result', () => {
    const parsed = parseStoredResult({
      matchScore: 60,
      scoreBreakdown: [{ label: 'Keywords', score: 60, weight: 100, detail: 'ok' }, null, 'nope'],
      matchedKeywords: [{ keyword: 'python', count: 2, importance: 0.5 }, { count: 1 }],
      missingSkills: [{ skill: 'aws', category: 'technical' }, { category: 'soft' }],
      resumeQualityChecks: [{ id: 'metrics', label: 'Metrics', status: 'unexpected' }],
    });

    expect(parsed?.scoreBreakdown).toHaveLength(1);
    expect(parsed?.matchedKeywords).toHaveLength(1);
    expect(parsed?.missingSkills).toEqual([{ skill: 'aws', category: 'technical' }]);
    expect(parsed?.resumeQualityChecks[0].status).toBe('info');
  });

  it('keeps a valid role mode and numeric fields', () => {
    const parsed = parseStoredResult({
      matchScore: 88,
      scoreBreakdown: [],
      roleMode: 'data',
      keywordScore: 90,
      skillScore: 80,
    });

    expect(parsed?.roleMode).toBe('data');
    expect(parsed?.keywordScore).toBe(90);
    expect(parsed?.skillScore).toBe(80);
  });
});
