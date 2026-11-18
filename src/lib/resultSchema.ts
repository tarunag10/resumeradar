import {
  JobInsights,
  ResumeQualityCheck,
  RoleMode,
  ScoreBreakdownItem,
  ScoringResult,
} from './scoring';

const ROLE_MODES: RoleMode[] = ['general', 'software', 'data', 'product', 'marketing', 'legal', 'finance'];
const QUALITY_STATUSES: ResumeQualityCheck['status'][] = ['pass', 'warning', 'info'];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecordArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asRoleMode(value: unknown): RoleMode {
  return ROLE_MODES.includes(value as RoleMode) ? (value as RoleMode) : 'general';
}

function parseJobInsights(value: unknown): JobInsights {
  const insights = isRecord(value) ? value : {};
  return {
    seniority: asString(insights.seniority, 'Not specified'),
    roleTitle: asString(insights.roleTitle, 'Role not detected'),
    requiredSkills: asStringArray(insights.requiredSkills),
    preferredSkills: asStringArray(insights.preferredSkills),
    responsibilities: asStringArray(insights.responsibilities),
    topTerms: asStringArray(insights.topTerms),
  };
}

function parseScoreBreakdown(value: unknown): ScoreBreakdownItem[] {
  return asRecordArray(value)
    .filter(item => typeof item.label === 'string')
    .map(item => ({
      label: asString(item.label),
      score: asNumber(item.score),
      weight: asNumber(item.weight),
      detail: asString(item.detail),
      contribution: typeof item.contribution === 'number' && Number.isFinite(item.contribution)
        ? item.contribution
        : undefined,
    }));
}

function parseQualityChecks(value: unknown): ResumeQualityCheck[] {
  return asRecordArray(value)
    .filter(check => typeof check.id === 'string' && typeof check.label === 'string')
    .map(check => ({
      id: asString(check.id),
      label: asString(check.label),
      status: QUALITY_STATUSES.includes(check.status as ResumeQualityCheck['status'])
        ? (check.status as ResumeQualityCheck['status'])
        : 'info',
      detail: asString(check.detail),
      action: asString(check.action),
    }));
}

function parseKeywords(value: unknown): Array<{ keyword: string; count: number; importance: number }> {
  return asRecordArray(value)
    .filter(item => typeof item.keyword === 'string')
    .map(item => ({
      keyword: asString(item.keyword),
      count: asNumber(item.count, 1),
      importance: asNumber(item.importance),
    }));
}

function parseSkills(value: unknown): Array<{ skill: string; category: string }> {
  return asRecordArray(value)
    .filter(item => typeof item.skill === 'string')
    .map(item => ({
      skill: asString(item.skill),
      category: asString(item.category, 'unknown'),
    }));
}

/**
 * Validate a value read back from localStorage and fill in anything an older version of the
 * app did not save. Returns null when the value cannot be trusted as a scoring result, so a
 * corrupt entry can never crash the dashboard or an export.
 */
export function parseStoredResult(value: unknown): ScoringResult | null {
  if (!isRecord(value)) return null;
  if (typeof value.matchScore !== 'number' || !Number.isFinite(value.matchScore)) return null;
  if (!Array.isArray(value.scoreBreakdown)) return null;

  const tfidf = isRecord(value.tfidfAnalysis) ? value.tfidfAnalysis : {};

  return {
    matchScore: asNumber(value.matchScore),
    keywordScore: asNumber(value.keywordScore),
    skillScore: asNumber(value.skillScore),
    phraseScore: asNumber(value.phraseScore),
    repeatedJobTermScore: asNumber(value.repeatedJobTermScore),
    roleFocusScore: typeof value.roleFocusScore === 'number' ? asNumber(value.roleFocusScore) : undefined,
    repetitionPenalty: asNumber(value.repetitionPenalty),
    roleMode: asRoleMode(value.roleMode),
    matchedKeywords: parseKeywords(value.matchedKeywords),
    missingKeywords: parseKeywords(value.missingKeywords),
    missingSkills: parseSkills(value.missingSkills),
    matchedSkills: parseSkills(value.matchedSkills),
    repeatedPhrases: asRecordArray(value.repeatedPhrases)
      .filter(item => typeof item.phrase === 'string')
      .map(item => ({
        phrase: asString(item.phrase),
        count: asNumber(item.count, 1),
        suggestion: asString(item.suggestion),
      })),
    suggestedBullets: asStringArray(value.suggestedBullets),
    scoreBreakdown: parseScoreBreakdown(value.scoreBreakdown),
    resumeQualityChecks: parseQualityChecks(value.resumeQualityChecks),
    jobInsights: parseJobInsights(value.jobInsights),
    tfidfAnalysis: {
      resumeImportantTerms: asStringArray(tfidf.resumeImportantTerms),
      jobPostImportantTerms: asStringArray(tfidf.jobPostImportantTerms),
      coverageRatio: asNumber(tfidf.coverageRatio),
    },
    semanticMatches: asStringArray(value.semanticMatches),
    scoreNotes: asStringArray(value.scoreNotes),
  };
}

/** Small helper for UI code that only needs to know whether a value is renderable. */
export function isRenderableResult(value: unknown): value is ScoringResult {
  return parseStoredResult(value) !== null;
}
