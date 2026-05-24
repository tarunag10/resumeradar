import { ScoringResult } from './scoring';

function listOrFallback(items: string[], fallback = 'None detected'): string {
  return items.length > 0 ? items.join(', ') : fallback;
}

export function buildMarkdownReport(result: ScoringResult): string {
  const lines = [
    '# ResumeRadar Match Report',
    '',
    `Match score: ${result.matchScore}%`,
    `Role mode: ${result.roleMode || 'general'}`,
    `Detected role: ${result.jobInsights.roleTitle}`,
    `Seniority: ${result.jobInsights.seniority}`,
    '',
    '## Score Breakdown',
    ...result.scoreBreakdown.map(item => `- ${item.label}: ${item.score}% (${item.weight}% weight) - ${item.detail}`),
    '',
    '## Matched Keywords',
    ...result.matchedKeywords.slice(0, 12).map(item => `- ${item.keyword}${item.count > 1 ? ` (${item.count})` : ''}`),
    '',
    '## Missing Keywords',
    ...result.missingKeywords.slice(0, 12).map(item => `- ${item.keyword}${item.count > 1 ? ` (${item.count})` : ''}`),
    '',
    '## Missing Skills',
    ...result.missingSkills.slice(0, 12).map(item => `- ${item.skill} (${item.category})`),
    '',
    '## Job Insights',
    `- Required skills: ${listOrFallback(result.jobInsights.requiredSkills)}`,
    `- Preferred skills: ${listOrFallback(result.jobInsights.preferredSkills)}`,
    `- Top terms: ${listOrFallback(result.jobInsights.topTerms)}`,
    ...result.jobInsights.responsibilities.map(item => `- Responsibility: ${item}`),
    '',
    '## Resume Quality Checks',
    ...result.resumeQualityChecks.map(item => `- ${item.label}: ${item.detail} Action: ${item.action}`),
    '',
    '## Suggested Resume Bullets',
    ...result.suggestedBullets.map(item => `- ${item}`),
    '',
    'Generated locally by ResumeRadar.',
  ];

  return lines.join('\n');
}

export function buildPlainTextReport(result: ScoringResult): string {
  return buildMarkdownReport(result)
    .replace(/^#\s+/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/^- /gm, '- ');
}

export function buildJsonReport(result: ScoringResult): string {
  return JSON.stringify(result, null, 2);
}

export function createResultFileName(extension: 'md' | 'txt' | 'json', date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `resumeradar-match-${stamp}.${extension}`;
}
