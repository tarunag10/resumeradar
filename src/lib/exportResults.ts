import { ScoringResult } from './scoring';

function listOrFallback(items: string[], fallback = 'None detected'): string {
  return items.length > 0 ? items.join(', ') : fallback;
}

function bulletsOrFallback(lines: string[], fallback: string): string[] {
  return lines.length > 0 ? lines : [`- ${fallback}`];
}

export function buildMarkdownReport(result: ScoringResult): string {
  const semanticMatches = result.semanticMatches ?? [];
  const scoreNotes = result.scoreNotes ?? [];

  const lines = [
    '# ResumeRadar Match Report',
    '',
    `Match score: ${result.matchScore}%`,
    `Role mode: ${result.roleMode || 'general'}`,
    `Detected role: ${result.jobInsights.roleTitle}`,
    `Seniority: ${result.jobInsights.seniority}`,
    '',
    '## Score Breakdown',
    ...result.scoreBreakdown.map(item => {
      const contribution = typeof item.contribution === 'number' ? `, adds ${item.contribution} pts` : '';
      return `- ${item.label}: ${item.score}% (${item.weight}% weight${contribution}) - ${item.detail}`;
    }),
    ...(result.repetitionPenalty > 0 ? [`- Repetition penalty: -${result.repetitionPenalty} points`] : []),
    ...scoreNotes.map(note => `- Note: ${note}`),
    '',
    '## Matched Keywords',
    ...bulletsOrFallback(
      result.matchedKeywords.slice(0, 12).map(item => `- ${item.keyword}${item.count > 1 ? ` (${item.count})` : ''}`),
      'No matched keywords detected'
    ),
    '',
    '## Missing Keywords',
    ...bulletsOrFallback(
      result.missingKeywords.slice(0, 12).map(item => `- ${item.keyword}${item.count > 1 ? ` (${item.count})` : ''}`),
      'No missing keywords detected'
    ),
    '',
    '## Missing Skills',
    ...bulletsOrFallback(
      result.missingSkills.slice(0, 12).map(item => `- ${item.skill} (${item.category})`),
      'No missing skills detected'
    ),
    '',
    '## Job Insights',
    `- Required skills: ${listOrFallback(result.jobInsights.requiredSkills)}`,
    `- Preferred skills: ${listOrFallback(result.jobInsights.preferredSkills)}`,
    `- Top terms: ${listOrFallback(result.jobInsights.topTerms)}`,
    ...result.jobInsights.responsibilities.map(item => `- Responsibility: ${item}`),
    '',
    '## Related-Term Matches',
    `- ${listOrFallback(semanticMatches, 'None detected')}`,
    '',
    '## Resume Quality Checks',
    ...bulletsOrFallback(
      result.resumeQualityChecks.map(item => `- ${item.label}: ${item.detail} Action: ${item.action}`),
      'No quality checks available'
    ),
    '',
    '## Suggested Resume Bullets',
    ...bulletsOrFallback(result.suggestedBullets, 'No bullet prompts available'),
    '',
    'Generated locally by ResumeRadar.',
  ];

  return lines.join('\n');
}

export function buildPlainTextReport(result: ScoringResult): string {
  return buildMarkdownReport(result)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .trim();
}

export function buildJsonReport(result: ScoringResult): string {
  return JSON.stringify(result, null, 2);
}

export function createResultFileName(extension: 'md' | 'txt' | 'json', date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `resumeradar-match-${stamp}.${extension}`;
}
