import { extractSkillsFromText, getSkillByName, mentionsSkill } from './skillDictionary';
import { findRepeatedPhrases, calculateKeywordOverlap, extractAllPhrases, getNormalizedTokens } from './textProcessing';

export type RoleMode = 'general' | 'software' | 'data' | 'product' | 'marketing' | 'legal' | 'finance';

export interface ScoreBreakdownItem {
  label: string;
  score: number;
  weight: number;
  detail: string;
  /** Points this signal added to the final score, after weight normalisation. */
  contribution?: number;
}

export interface ResumeQualityCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'info';
  detail: string;
  action: string;
}

export interface JobInsights {
  seniority: string;
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  topTerms: string[];
}

export interface ScoringResult {
  matchScore: number;
  keywordScore: number;
  skillScore: number;
  phraseScore: number;
  repeatedJobTermScore: number;
  roleFocusScore?: number;
  repetitionPenalty: number;
  roleMode?: RoleMode;
  matchedKeywords: Array<{ keyword: string; count: number; importance: number }>;
  missingKeywords: Array<{ keyword: string; count: number; importance: number }>;
  missingSkills: Array<{ skill: string; category: string }>;
  matchedSkills: Array<{ skill: string; category: string }>;
  repeatedPhrases: Array<{ phrase: string; count: number; suggestion: string }>;
  suggestedBullets: string[];
  scoreBreakdown: ScoreBreakdownItem[];
  resumeQualityChecks: ResumeQualityCheck[];
  jobInsights: JobInsights;
  tfidfAnalysis: {
    resumeImportantTerms: string[];
    jobPostImportantTerms: string[];
    coverageRatio: number;
  };
  /** Job terms that were matched through related wording rather than an exact token. */
  semanticMatches: string[];
  /** Signals that were left out of the score, and why. */
  scoreNotes: string[];
}

// Phrase replacement suggestions
const PHRASE_SUGGESTIONS: Record<string, string> = {
  'responsible for': 'Replace some uses with action verbs like led, built, improved, owned, launched',
  'worked with': 'Use more specific verbs like partnered, collaborated, advised, implemented',
  'worked on': 'Use more specific verbs like contributed to, led, supported, delivered',
  'involved in': 'Describe your specific contribution or outcome',
  'part of': 'Specify your role or the team you worked with',
  'in order to': 'Can often be removed for clarity',
  'as part of': 'Describe the larger initiative and your specific role',
};

// Synonyms for semantic similarity matching (single words only for proper token matching)
const SYNONYM_GROUPS: Map<string, Set<string>> = new Map([
  ['manage', new Set(['manage', 'managed', 'managing', 'manager', 'lead', 'led', 'leading', 'leadership', 'direct', 'directed', 'oversee', 'oversaw'])],
  ['build', new Set(['build', 'built', 'building', 'construct', 'constructed', 'create', 'created', 'develop', 'developed', 'developing', 'implementation'])],
  ['analyze', new Set(['analyze', 'analyzed', 'analyzing', 'analysis', 'analytical', 'investigate', 'investigated', 'examine', 'examined', 'assess', 'assessed'])],
  ['improve', new Set(['improve', 'improved', 'improving', 'improvement', 'enhance', 'enhanced', 'enhancing', 'optimize', 'optimized', 'optimizing', 'refine'])],
  ['implement', new Set(['implement', 'implemented', 'implementing', 'implementation', 'execute', 'executed', 'deploy', 'deployed', 'rollout'])],
  ['communicate', new Set(['communicate', 'communicated', 'communicating', 'communication', 'collaborate', 'collaborated', 'collaborating', 'coordinate', 'coordinated'])],
  ['data', new Set(['data', 'dataset', 'datasets', 'data-driven', 'analytics', 'metrics', 'statistics', 'quantitative'])],
  ['team', new Set(['team', 'teams', 'teamwork', 'collaborative', 'cross-functional', 'stakeholder', 'stakeholders'])],
  ['cloud', new Set(['cloud', 'aws', 'azure', 'gcp'])],
  ['development', new Set(['development', 'developer', 'devops', 'engineering', 'software'])],
]);

type RoleWeights = { keyword: number; skill: number; phrase: number; repeated: number; role: number };

const ROLE_PROFILES: Record<RoleMode, {
  label: string;
  weights: RoleWeights;
  focusSkills: string[];
}> = {
  general: {
    label: 'General',
    weights: { keyword: 0.38, skill: 0.32, phrase: 0.16, repeated: 0.14, role: 0 },
    focusSkills: [],
  },
  software: {
    label: 'Software',
    weights: { keyword: 0.33, skill: 0.35, phrase: 0.12, repeated: 0.10, role: 0.10 },
    focusSkills: ['javascript', 'typescript', 'python', 'react', 'node.js', 'aws', 'docker', 'kubernetes', 'microservices', 'ci/cd', 'rest api'],
  },
  data: {
    label: 'Data',
    weights: { keyword: 0.35, skill: 0.33, phrase: 0.11, repeated: 0.11, role: 0.10 },
    focusSkills: ['python', 'sql', 'excel', 'tableau', 'power bi', 'data analysis', 'dashboarding', 'data visualization', 'etl', 'machine learning'],
  },
  product: {
    label: 'Product',
    weights: { keyword: 0.33, skill: 0.28, phrase: 0.12, repeated: 0.11, role: 0.16 },
    focusSkills: ['roadmap', 'prioritization', 'user research', 'experimentation', 'product strategy', 'stakeholder management', 'requirements gathering'],
  },
  marketing: {
    label: 'Marketing',
    weights: { keyword: 0.37, skill: 0.25, phrase: 0.15, repeated: 0.13, role: 0.10 },
    focusSkills: ['market research', 'customer segmentation', 'a/b testing', 'strategy', 'reporting', 'data analysis'],
  },
  legal: {
    label: 'Legal and compliance',
    weights: { keyword: 0.39, skill: 0.23, phrase: 0.14, repeated: 0.14, role: 0.10 },
    focusSkills: ['stakeholder management', 'reporting', 'requirements gathering', 'critical thinking', 'communication', 'organization'],
  },
  finance: {
    label: 'Finance',
    weights: { keyword: 0.35, skill: 0.30, phrase: 0.12, repeated: 0.13, role: 0.10 },
    focusSkills: ['excel', 'sql', 'forecasting', 'budgeting', 'reporting', 'data analysis', 'business intelligence'],
  },
};

/** Sum of a role profile's signal weights. Every profile must total exactly 1. */
export function getRoleWeightTotal(roleMode: RoleMode): number {
  const weights = (ROLE_PROFILES[roleMode] || ROLE_PROFILES.general).weights;
  return weights.keyword + weights.skill + weights.phrase + weights.repeated + weights.role;
}

// Create reverse lookup: word -> canonical form
function buildSynonymLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  SYNONYM_GROUPS.forEach((synonyms, canonical) => {
    synonyms.forEach(word => {
      lookup.set(word, canonical);
    });
  });
  return lookup;
}

const SYNONYM_LOOKUP = buildSynonymLookup();

function canonicalToken(token: string): string {
  return SYNONYM_LOOKUP.get(token) || token;
}

/**
 * Term importance is measured inside a single document: how often the term appears,
 * normalised against the most frequent term (0-1). A two-document IDF would give terms
 * that appear in *both* the resume and the job post a lower weight than terms that appear
 * only in the job post, which penalises exactly the coverage the score is meant to reward.
 */
function calculateTermImportance(text: string): Map<string, number> {
  const tokens = getNormalizedTokens(text);
  const tokenCounts = new Map<string, number>();

  tokens.forEach(token => {
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });

  let maxCount = 0;
  tokenCounts.forEach(count => {
    if (count > maxCount) maxCount = count;
  });

  const importance = new Map<string, number>();
  if (maxCount === 0) return importance;

  tokenCounts.forEach((count, term) => {
    importance.set(term, count / maxCount);
  });

  return importance;
}

// Find semantic matches using synonym groups, single pass over each token set
function findSemanticMatches(resumeTokens: Set<string>, jobTokens: Set<string>): Set<string> {
  const resumeCanonical = new Set<string>();
  resumeTokens.forEach(token => resumeCanonical.add(canonicalToken(token)));

  const matched = new Set<string>();

  jobTokens.forEach(jobToken => {
    if (resumeTokens.has(jobToken)) return;
    if (!SYNONYM_LOOKUP.has(jobToken)) return;
    if (resumeCanonical.has(canonicalToken(jobToken))) {
      matched.add(jobToken);
    }
  });

  return matched;
}

// Top terms by importance, used for the coverage summary
function extractImportantTerms(importance: Map<string, number>, limit = 15): string[] {
  return Array.from(importance.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

function detectSeniority(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(chief|head of|director|vp|vice president)\b/.test(lower)) return 'Leadership';
  if (/\b(senior|sr\.?|lead|principal|staff)\b/.test(lower)) return 'Senior';
  if (/\b(junior|jr\.?|entry[- ]level|graduate|intern)\b/.test(lower)) return 'Entry';
  if (/\b(manager|management)\b/.test(lower)) return 'Manager';
  return 'Not specified';
}

function inferRoleTitle(jobPostText: string): string {
  const lines = jobPostText
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.length <= 80);

  const titleLine = lines.find(line => /\b(engineer|developer|analyst|manager|designer|specialist|consultant|lead|director|officer|associate|product|marketing|finance|legal|compliance)\b/i.test(line));
  return titleLine?.replace(/^\W+|\W+$/g, '') || 'Role not detected';
}

function extractResponsibilities(jobPostText: string): string[] {
  return jobPostText
    .split(/\n+/)
    .map(line => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(line => /\b(responsib|build|manage|lead|own|deliver|analy[sz]e|create|develop|support|collaborate|drive|design|maintain)\b/i.test(line))
    .slice(0, 5);
}

const SECTION_HEADINGS: Array<{ kind: 'required' | 'preferred' | 'neutral'; pattern: RegExp }> = [
  { kind: 'preferred', pattern: /^(preferred|nice to have|bonus|desirable|good to have|plus(es)?)\b/i },
  { kind: 'required', pattern: /^(requirements?|required|must[- ]have|essential|qualifications?|what you.{0,3}ll need|who you are|minimum)\b/i },
  { kind: 'neutral', pattern: /^(responsibilities|what you.{0,3}ll do|about|benefits|we offer|compensation|perks|the role|overview|description)\b/i },
];

function classifySkillByWindow(jobPostText: string, skill: string): 'required' | 'preferred' {
  const lower = jobPostText.toLowerCase();
  const index = lower.indexOf(skill);
  if (index < 0) return 'required';

  const windowText = lower.slice(Math.max(0, index - 80), index + skill.length + 80);
  return /\b(preferred|nice to have|bonus|desirable|plus)\b/.test(windowText) ? 'preferred' : 'required';
}

/**
 * Classify job-post skills as required or preferred using section headings, line by line.
 * Heading context is more reliable than a fixed character window, and a skill listed under
 * multiple headings is treated as required.
 */
function extractRequiredPreferredSkills(
  jobPostText: string,
  jobSkills: Set<string>
): { required: string[]; preferred: string[] } {
  if (jobSkills.size === 0) return { required: [], preferred: [] };

  const assigned = new Map<string, 'required' | 'preferred'>();
  let section: 'required' | 'preferred' | null = null;

  for (const rawLine of jobPostText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = SECTION_HEADINGS.find(item => item.pattern.test(line));
    if (heading) {
      section = heading.kind === 'neutral' ? null : heading.kind;
      // Headings can list skills inline after the colon, so fall through to line scanning.
    }

    for (const skill of jobSkills) {
      if (!mentionsSkill(line, skill)) continue;

      const existing = assigned.get(skill);
      if (existing === 'required') continue;

      const kind = section || classifySkillByWindow(jobPostText, skill);
      if (kind === 'required' || !existing) {
        assigned.set(skill, kind);
      }
    }
  }

  const lower = jobPostText.toLowerCase();
  const ordered = Array.from(assigned.keys()).sort((a, b) => {
    const aIndex = lower.indexOf(a);
    const bIndex = lower.indexOf(b);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  const required = ordered.filter(skill => assigned.get(skill) === 'required');
  const preferred = ordered.filter(skill => assigned.get(skill) === 'preferred');

  // A job post that never says "required" still has core skills: use the first ones seen.
  if (required.length === 0) {
    ordered.slice(0, 8).forEach(skill => {
      required.push(skill);
      const index = preferred.indexOf(skill);
      if (index >= 0) preferred.splice(index, 1);
    });
  }

  return {
    required: required.slice(0, 8),
    preferred: preferred.filter(skill => !required.includes(skill)).slice(0, 8),
  };
}

function buildResumeQualityChecks(resumeText: string, repeatedPhrasesCount: number): ResumeQualityCheck[] {
  const lower = resumeText.toLowerCase();
  const bullets = resumeText.split(/\n+/).filter(line => /^\s*[-*•]/.test(line));
  const hasMetrics = /(\d+%|\$\d+|\b\d+x\b|\b\d+\+?\s*(users|customers|clients|projects|people|hours|days|weeks|months|years|reports|dashboards|teams)\b)/i.test(resumeText);
  const actionVerbMatches = resumeText.match(/\b(led|built|created|improved|delivered|launched|managed|designed|reduced|increased|automated|analyzed|implemented|owned)\b/gi) || [];
  const hasSkillsSection = /\b(skills|technical skills|tools|technologies)\b/.test(lower);
  const longBullets = bullets.filter(line => line.split(/\s+/).length > 32);

  return [
    {
      id: 'metrics',
      label: 'Metrics and outcomes',
      status: hasMetrics ? 'pass' : 'warning',
      detail: hasMetrics ? 'Your resume includes measurable outcomes.' : 'Few measurable outcomes were detected.',
      action: hasMetrics ? 'Keep the strongest metrics close to relevant keywords.' : 'Add truthful numbers, scale, time saved, revenue, quality, or volume where possible.',
    },
    {
      id: 'action-verbs',
      label: 'Action verb strength',
      status: actionVerbMatches.length >= 4 ? 'pass' : 'warning',
      detail: `${actionVerbMatches.length} strong action verb${actionVerbMatches.length === 1 ? '' : 's'} detected.`,
      action: 'Start bullets with specific verbs like led, built, improved, delivered, automated, or analyzed.',
    },
    {
      id: 'repetition',
      label: 'Repeated phrasing',
      status: repeatedPhrasesCount <= 2 ? 'pass' : 'warning',
      detail: repeatedPhrasesCount <= 2 ? 'No major repetition pattern detected.' : `${repeatedPhrasesCount} repeated phrase patterns detected.`,
      action: 'Vary repeated wording and replace generic phrases with specific contributions.',
    },
    {
      id: 'sections',
      label: 'Skills visibility',
      status: hasSkillsSection ? 'pass' : 'info',
      detail: hasSkillsSection ? 'A skills/tools section is visible.' : 'No clear skills/tools section was detected.',
      action: 'Add a compact skills section if it fits your resume format.',
    },
    {
      id: 'bullet-length',
      label: 'Bullet readability',
      status: longBullets.length === 0 ? 'pass' : 'warning',
      detail: longBullets.length === 0 ? 'Resume bullets look reasonably concise.' : `${longBullets.length} bullet${longBullets.length === 1 ? '' : 's'} may be too long.`,
      action: 'Keep bullets focused on action, context, and result.',
    },
  ];
}

function calculateRoleFocusScore(roleMode: RoleMode, resumeSkills: Set<string>, jobSkills: Set<string>): number {
  const profile = ROLE_PROFILES[roleMode];
  const jobFocusSkills = profile.focusSkills.filter(skill => jobSkills.has(skill));
  const focusSet = jobFocusSkills.length > 0 ? jobFocusSkills : profile.focusSkills;
  if (focusSet.length === 0) return 0;
  const matched = focusSet.filter(skill => resumeSkills.has(skill)).length;
  return (matched / focusSet.length) * 100;
}

/**
 * Turn raw weights into integer percentages that always total exactly 100, so the
 * breakdown the UI shows can be added up to the final score.
 */
function toPercentWeights(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const exact = values.map(value => (value / total) * 100);
  const floored = exact.map(value => Math.floor(value));

  let remainder = 100 - floored.reduce((sum, value) => sum + value, 0);
  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; remainder > 0 && byFraction.length > 0; i++) {
    floored[byFraction[i % byFraction.length].index] += 1;
    remainder -= 1;
  }

  return floored;
}

function directoryMatchSkills(
  resumeSkills: Set<string>,
  jobSkills: Set<string>
): { matchedSkills: Array<{ skill: string; category: string }>; missingSkills: Array<{ skill: string; category: string }> } {
  const matchedSkills: Array<{ skill: string; category: string }> = [];
  const missingSkills: Array<{ skill: string; category: string }> = [];

  Array.from(jobSkills)
    .sort()
    .forEach(skill => {
      const entry = { skill, category: getSkillByName(skill)?.category || 'unknown' };
      if (resumeSkills.has(skill)) {
        matchedSkills.push(entry);
      } else {
        missingSkills.push(entry);
      }
    });

  return { matchedSkills, missingSkills };
}

export function analyzeMatch(resumeText: string, jobPostText: string, roleMode: RoleMode = 'general'): ScoringResult {
  const profile = ROLE_PROFILES[roleMode] || ROLE_PROFILES.general;

  // Extract skills from both texts
  const resumeSkills = extractSkillsFromText(resumeText);
  const jobSkills = extractSkillsFromText(jobPostText);
  const { matchedSkills, missingSkills } = directoryMatchSkills(resumeSkills, jobSkills);

  // Token sets are shared by several signals below
  const resumeTokens = new Set(getNormalizedTokens(resumeText));
  const jobTokens = new Set(getNormalizedTokens(jobPostText));

  const resumeImportance = calculateTermImportance(resumeText);
  const jobImportance = calculateTermImportance(jobPostText);

  // Keyword overlap, including matches found through related wording
  const { matched, allJobKeywords } = calculateKeywordOverlap(resumeText, jobPostText);
  const semanticMatches = findSemanticMatches(resumeTokens, jobTokens);

  // Weight each job term by how often the job post uses it
  let totalKeywordWeight = 0;
  let matchedKeywordWeight = 0;

  allJobKeywords.forEach((count, keyword) => {
    totalKeywordWeight += count;
    if (matched.has(keyword) || semanticMatches.has(keyword)) {
      matchedKeywordWeight += count;
    }
  });

  const keywordScore = totalKeywordWeight > 0
    ? (matchedKeywordWeight / totalKeywordWeight) * 100
    : 0;

  const byImportance = (a: { importance: number }, b: { importance: number }) => b.importance - a.importance;

  const matchedKeywords = Array.from(matched.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      importance: jobImportance.get(keyword) || 0,
    }))
    .sort(byImportance);

  const missingKeywords = Array.from(allJobKeywords.entries())
    .filter(([keyword]) => !matched.has(keyword) && !semanticMatches.has(keyword))
    .map(([keyword, count]) => ({
      keyword,
      count,
      importance: jobImportance.get(keyword) || 0,
    }))
    .sort((a, b) => b.importance - a.importance || b.count - a.count);

  const allKeywords = Array.from(allJobKeywords.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);

  // Skill score only means something when the job post mentions a known skill
  const skillScore = jobSkills.size > 0
    ? (matchedSkills.length / jobSkills.size) * 100
    : 0;

  // Phrase overlap (2-word, 3-word and 4-word phrases)
  const resumePhrases = extractAllPhrases(resumeText);
  const jobPhrases = extractAllPhrases(jobPostText);

  let phraseMatches = 0;
  let totalJobPhrases = 0;

  jobPhrases.forEach((count, phrase) => {
    totalJobPhrases += count;
    if (resumePhrases.has(phrase)) {
      phraseMatches += Math.min(count, resumePhrases.get(phrase)!);
    }
  });

  const phraseScore = totalJobPhrases > 0
    ? (phraseMatches / totalJobPhrases) * 100
    : 0;

  // Repeated job term score - reward covering terms that appear multiple times in job post
  const importantTerms = Array.from(allJobKeywords.entries())
    .filter(([, count]) => count >= 2)
    .map(([keyword]) => keyword);

  let coveredImportantTerms = 0;

  for (const term of importantTerms) {
    if (resumeTokens.has(term) || semanticMatches.has(term)) {
      coveredImportantTerms++;
    }
  }

  const repeatedJobTermScore = importantTerms.length > 0
    ? (coveredImportantTerms / importantTerms.length) * 100
    : 0;

  // Repetition penalty
  const repeatedPhrasesData = findRepeatedPhrases(resumeText);
  let repetitionPenalty = 0;

  if (repeatedPhrasesData.length <= 2) {
    repetitionPenalty = 0;
  } else if (repeatedPhrasesData.length <= 5) {
    repetitionPenalty = 2;
  } else {
    repetitionPenalty = 5;
  }

  const roleFocusScore = roleMode === 'general'
    ? 0
    : calculateRoleFocusScore(roleMode, resumeSkills, jobSkills);

  // Only signals that can actually be measured take part in the score. Their weights are
  // renormalised over what is available, so a short job post cannot hand out free points
  // and every role mode stays on the same 0-100 scale.
  const signals: Array<{ label: string; score: number; weight: number; detail: string }> = [];
  const scoreNotes: string[] = [];

  signals.push({
    label: 'Keywords',
    score: keywordScore,
    weight: profile.weights.keyword,
    detail: semanticMatches.size > 0
      ? `Coverage of job-post terms in your resume, including ${semanticMatches.size} matched through related wording.`
      : 'Coverage of important job-post terms in your resume.',
  });

  if (jobSkills.size > 0) {
    signals.push({
      label: 'Skills',
      score: skillScore,
      weight: profile.weights.skill,
      detail: 'Detected skill overlap between the resume and job post.',
    });
  } else {
    scoreNotes.push('No known skills were detected in the job post, so the skills signal was left out of the score.');
  }

  if (totalJobPhrases > 0) {
    signals.push({
      label: 'Phrase alignment',
      score: phraseScore,
      weight: profile.weights.phrase,
      detail: 'Shared two-, three- and four-word phrases that signal role alignment.',
    });
  } else {
    scoreNotes.push('The job post is too short to compare phrases, so the phrase signal was left out of the score.');
  }

  if (importantTerms.length > 0) {
    signals.push({
      label: 'Repeated job terms',
      score: repeatedJobTermScore,
      weight: profile.weights.repeated,
      detail: 'Coverage of terms the job post repeats multiple times.',
    });
  } else {
    scoreNotes.push('The job post does not repeat any term, so the repeated-terms signal was left out of the score.');
  }

  if (roleMode !== 'general') {
    signals.push({
      label: `${profile.label} Role focus`,
      score: roleFocusScore,
      weight: profile.weights.role,
      detail: `Extra weighting for ${profile.label.toLowerCase()} skills and responsibilities.`,
    });
  }

  const percentWeights = toPercentWeights(signals.map(signal => signal.weight));

  const scoreBreakdown: ScoreBreakdownItem[] = signals.map((signal, index) => ({
    label: signal.label,
    score: Math.round(signal.score),
    weight: percentWeights[index],
    detail: signal.detail,
    contribution: Math.round(signal.score * percentWeights[index] / 100 * 10) / 10,
  }));

  const weightedScore = signals.reduce(
    (sum, signal, index) => sum + signal.score * (percentWeights[index] / 100),
    0
  );

  const matchScore = Math.max(0, Math.min(100, Math.round(weightedScore - repetitionPenalty)));

  // Generate phrase suggestions
  const repeatedPhrases = repeatedPhrasesData.slice(0, 10).map(({ phrase, count }) => ({
    phrase,
    count,
    suggestion: PHRASE_SUGGESTIONS[phrase.toLowerCase()] ||
      'Consider replacing with more specific action verbs that describe your actual contribution.',
  }));

  const jobImportantTerms = extractImportantTerms(jobImportance);
  const resumeImportantTerms = extractImportantTerms(resumeImportance);
  const coveredTopTerms = jobImportantTerms.filter(
    term => resumeTokens.has(term) || semanticMatches.has(term)
  ).length;
  const coverageRatio = jobImportantTerms.length > 0
    ? (coveredTopTerms / jobImportantTerms.length) * 100
    : 0;

  // Generate suggested bullets based on matched skills and missing skills
  const suggestedBullets = generateSuggestedBullets(matchedSkills, missingSkills, jobPostText);

  const requiredPreferredSkills = extractRequiredPreferredSkills(jobPostText, jobSkills);
  const jobInsights: JobInsights = {
    seniority: detectSeniority(jobPostText),
    roleTitle: inferRoleTitle(jobPostText),
    requiredSkills: requiredPreferredSkills.required,
    preferredSkills: requiredPreferredSkills.preferred,
    responsibilities: extractResponsibilities(jobPostText),
    topTerms: allKeywords.slice(0, 10).map(item => item.keyword),
  };

  return {
    matchScore,
    keywordScore: Math.round(keywordScore),
    skillScore: Math.round(skillScore),
    phraseScore: Math.round(phraseScore),
    repeatedJobTermScore: Math.round(repeatedJobTermScore),
    roleFocusScore: Math.round(roleFocusScore),
    roleMode,
    repetitionPenalty,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 20),
    missingSkills,
    matchedSkills,
    repeatedPhrases,
    suggestedBullets,
    scoreBreakdown,
    resumeQualityChecks: buildResumeQualityChecks(resumeText, repeatedPhrasesData.length),
    jobInsights,
    tfidfAnalysis: {
      resumeImportantTerms,
      jobPostImportantTerms: jobImportantTerms,
      coverageRatio: Math.round(coverageRatio),
    },
    semanticMatches: Array.from(semanticMatches).sort(),
    scoreNotes,
  };
}

// Generate suggested resume bullets
function generateSuggestedBullets(
  matchedSkills: Array<{ skill: string; category: string }>,
  missingSkills: Array<{ skill: string; category: string }>,
  jobPostText: string
): string[] {
  const bullets: string[] = [];

  // Template bullets for matched skills
  if (matchedSkills.length > 0) {
    const topMatched = matchedSkills.slice(0, 3);
    for (const skill of topMatched) {
      if (skill.category === 'technical') {
        bullets.push(`If accurate, add a bullet showing how you used ${skill.skill} to deliver a measurable result.`);
      } else if (skill.category === 'business') {
        bullets.push(`If accurate, describe how your ${skill.skill} work improved a process, decision, or outcome.`);
      } else if (skill.category === 'soft') {
        bullets.push(`If accurate, add a concise example of ${skill.skill} with the people involved and result achieved.`);
      }
    }
  }

  // Template bullets for missing skills
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3);
    for (const skill of topMissing) {
      if (skill.category === 'technical') {
        bullets.push(`If accurate, add ${skill.skill} with a real project, tool, scale, or outcome so the keyword is supported.`);
      } else if (skill.category === 'business') {
        bullets.push(`If accurate, include a ${skill.skill} example that mirrors the job post and includes a result.`);
      }
    }
  }

  const responsibilities = extractResponsibilities(jobPostText);
  for (const responsibility of responsibilities.slice(0, 2)) {
    bullets.push(`If accurate, mirror this responsibility with your own evidence: ${responsibility}`);
  }

  // Add generic strong bullets if we don't have enough
  if (bullets.length < 3) {
    bullets.push(
      'If accurate, add a metric that shows scale, speed, quality, revenue, savings, or customer impact.',
      'If accurate, rewrite one bullet to show action, tool, context, and measurable result.',
      'If accurate, include a project example that directly maps to one of the role responsibilities.'
    );
  }

  return bullets.slice(0, 5); // Limit to 5 bullets
}

// Get match label and description based on score
export function getMatchInfo(score: number): { label: string; description: string; nextAction: string } {
  if (score >= 85) {
    return {
      label: 'Excellent match',
      description: 'Your resume is closely aligned with the job post. Review repeated phrases and polish your bullets before applying.',
      nextAction: 'Review repeated phrases and polish your bullets.'
    };
  } else if (score >= 65) {
    return {
      label: 'Strong match',
      description: 'Your resume covers many important terms. A few targeted additions could make it feel more aligned.',
      nextAction: 'Add truthful examples for important missing skills.'
    };
  } else if (score >= 40) {
    return {
      label: 'Moderate match',
      description: 'You have some useful overlap, but the job post emphasizes several skills that are not visible in your resume.',
      nextAction: 'Review the missing skills section and add relevant experience.'
    };
  } else {
    return {
      label: 'Low match',
      description: 'Your resume does not yet reflect many of the terms used in this job post. Start by reviewing the missing skills and adding truthful examples where relevant.',
      nextAction: 'Start by adding relevant skills from the missing section.'
    };
  }
}
