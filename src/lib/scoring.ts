import { extractSkillsFromText, buildSkillLookup } from './skillDictionary';
import { findRepeatedPhrases, calculateKeywordOverlap, extractAllPhrases, getNormalizedTokens } from './textProcessing';

export type RoleMode = 'general' | 'software' | 'data' | 'product' | 'marketing' | 'legal' | 'finance';

export interface ScoreBreakdownItem {
  label: string;
  score: number;
  weight: number;
  detail: string;
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

const ROLE_PROFILES: Record<RoleMode, {
  label: string;
  weights: { keyword: number; skill: number; phrase: number; repeated: number; role: number };
  focusSkills: string[];
}> = {
  general: {
    label: 'General',
    weights: { keyword: 0.35, skill: 0.30, phrase: 0.15, repeated: 0.10, role: 0 },
    focusSkills: [],
  },
  software: {
    label: 'Software',
    weights: { keyword: 0.30, skill: 0.36, phrase: 0.12, repeated: 0.10, role: 0.07 },
    focusSkills: ['javascript', 'typescript', 'python', 'react', 'node.js', 'aws', 'docker', 'kubernetes', 'microservices', 'ci/cd', 'rest api'],
  },
  data: {
    label: 'Data',
    weights: { keyword: 0.34, skill: 0.34, phrase: 0.10, repeated: 0.10, role: 0.07 },
    focusSkills: ['python', 'sql', 'excel', 'tableau', 'power bi', 'data analysis', 'dashboarding', 'data visualization', 'etl', 'machine learning'],
  },
  product: {
    label: 'Product',
    weights: { keyword: 0.32, skill: 0.30, phrase: 0.13, repeated: 0.10, role: 0.10 },
    focusSkills: ['roadmap', 'prioritization', 'user research', 'experimentation', 'product strategy', 'stakeholder management', 'requirements gathering'],
  },
  marketing: {
    label: 'Marketing',
    weights: { keyword: 0.36, skill: 0.25, phrase: 0.15, repeated: 0.12, role: 0.07 },
    focusSkills: ['market research', 'customer segmentation', 'a/b testing', 'strategy', 'reporting', 'data analysis'],
  },
  legal: {
    label: 'Legal and compliance',
    weights: { keyword: 0.38, skill: 0.24, phrase: 0.14, repeated: 0.12, role: 0.07 },
    focusSkills: ['stakeholder management', 'reporting', 'requirements gathering', 'critical thinking', 'communication', 'organization'],
  },
  finance: {
    label: 'Finance',
    weights: { keyword: 0.34, skill: 0.30, phrase: 0.12, repeated: 0.12, role: 0.07 },
    focusSkills: ['excel', 'sql', 'forecasting', 'budgeting', 'reporting', 'data analysis', 'business intelligence'],
  },
};

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

// Calculate document frequency-based importance (simpler than TF-IDF with small corpus)
function calculateDocumentImportance(text: string, allTexts: string[]): Map<string, number> {
  const tokens = getNormalizedTokens(text);
  const tokenCounts = new Map<string, number>();
  
  // Calculate term frequency
  tokens.forEach(token => {
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });
  
  // Calculate document frequency for each term
  // Terms that appear in fewer documents but with higher frequency are more important
  const importanceScores = new Map<string, number>();
  tokenCounts.forEach((count, term) => {
    // Count how many texts contain this term
    let docCount = 0;
    allTexts.forEach(t => {
      if (t.toLowerCase().includes(term)) {
        docCount++;
      }
    });
    
    // TF * inverse document frequency factor (capped to avoid log issues with small corpus)
    const idfFactor = allTexts.length / Math.max(docCount, 1);
    const tf = count / Math.max(tokens.length, 1);
    // Normalize to 0-1 range
    importanceScores.set(term, tf * Math.min(idfFactor, 10));
  });
  
  return importanceScores;
}

// Find semantic matches using synonym groups
function findSemanticMatches(resumeTokens: Set<string>, jobTokens: Set<string>): Set<string> {
  const synonymLookup = buildSynonymLookup();
  const matched = new Set<string>();
  
  // Check if any resume token synonyms match job tokens
  jobTokens.forEach(jobToken => {
    const jobCanonical = synonymLookup.get(jobToken) || jobToken;
    
    resumeTokens.forEach(resumeToken => {
      const resumeCanonical = synonymLookup.get(resumeToken) || resumeToken;
      
      // Direct match or synonym match
      if (resumeToken === jobToken || resumeCanonical === jobCanonical || 
          SYNONYM_GROUPS.has(resumeCanonical) && SYNONYM_GROUPS.get(resumeCanonical)!.has(jobToken)) {
        matched.add(jobToken);
        matched.add(resumeToken);
      }
    });
  });
  
  return matched;
}

// Extract important terms using TF-IDF
function extractImportantTerms(tfidfScores: Map<string, number>, threshold: number = 0.1): string[] {
  const sortedTerms: Array<{ term: string; score: number }> = [];
  
  tfidfScores.forEach((score, term) => {
    sortedTerms.push({ term, score });
  });
  
  sortedTerms.sort((a, b) => b.score - a.score);
  
  // Return top terms above threshold
  return sortedTerms
    .filter(t => t.score >= threshold)
    .slice(0, 15)
    .map(t => t.term);
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

function extractRequiredPreferredSkills(jobPostText: string, jobSkills: Set<string>): { required: string[]; preferred: string[] } {
  const lower = jobPostText.toLowerCase();
  const required = new Set<string>();
  const preferred = new Set<string>();

  for (const skill of jobSkills) {
    const index = lower.indexOf(skill);
    const windowText = index >= 0 ? lower.slice(Math.max(0, index - 80), index + skill.length + 80) : lower;
    if (/\b(preferred|nice to have|bonus|desirable|plus)\b/.test(windowText)) {
      preferred.add(skill);
    } else if (/\b(required|requirements|must|need|essential|qualifications|experience with)\b/.test(windowText)) {
      required.add(skill);
    }
  }

  if (required.size === 0) {
    Array.from(jobSkills)
      .sort((a, b) => {
        const aIndex = lower.indexOf(a);
        const bIndex = lower.indexOf(b);
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      })
      .slice(0, 8)
      .forEach(skill => required.add(skill));
  }

  return {
    required: Array.from(required).slice(0, 8),
    preferred: Array.from(preferred).filter(skill => !required.has(skill)).slice(0, 8),
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

export function analyzeMatch(resumeText: string, jobPostText: string, roleMode: RoleMode = 'general'): ScoringResult {
  const skillLookup = buildSkillLookup();
  const profile = ROLE_PROFILES[roleMode] || ROLE_PROFILES.general;
  
  // Extract skills from both texts
  const resumeSkills = extractSkillsFromText(resumeText);
  const jobSkills = extractSkillsFromText(jobPostText);
  
  // Find matched and missing skills
  const matchedSkills: Array<{ skill: string; category: string }> = [];
  const missingSkills: Array<{ skill: string; category: string }> = [];
  
  const allSkillsData = new Map<string, { category: string }>();
  for (const skill of resumeSkills) {
    allSkillsData.set(skill, { category: skillLookup.get(skill)?.category || 'unknown' });
  }
  
  // Get skill categories
  for (const skill of jobSkills) {
    const skillData = skillLookup.get(skill);
    if (skillData) {
      allSkillsData.set(skill, { category: skillData.category });
    }
  }
  
  for (const [skill, data] of allSkillsData) {
    if (resumeSkills.has(skill) && jobSkills.has(skill)) {
      matchedSkills.push({ skill, category: data.category });
    } else if (jobSkills.has(skill)) {
      missingSkills.push({ skill, category: data.category });
    }
  }
  
  // Calculate document importance for better keyword importance scoring
  const corpus = [resumeText, jobPostText];
  const resumeImportance = calculateDocumentImportance(resumeText, corpus);
  const jobImportance = calculateDocumentImportance(jobPostText, corpus);
  
  // Extract important terms using document importance
  const resumeImportantTerms = extractImportantTerms(resumeImportance);
  const jobImportantTerms = extractImportantTerms(jobImportance);
  
  // Keyword overlap with TF-IDF weighting
  const { matched, allJobKeywords } = calculateKeywordOverlap(resumeText, jobPostText);
  
  // Find semantic matches
  const resumeTokens = new Set(getNormalizedTokens(resumeText));
  const jobTokens = new Set(getNormalizedTokens(jobPostText));
  const semanticMatches = findSemanticMatches(resumeTokens, jobTokens);
  
  // Calculate weighted keyword score (importance-based)
  let weightedKeywordScore = 0;
  let totalWeight = 0;
  
  allJobKeywords.forEach((count, keyword) => {
    const importance = jobImportance.get(keyword) || 0;
    if (importance > 0) {
      totalWeight += importance;
      if (matched.has(keyword) || semanticMatches.has(keyword)) {
        weightedKeywordScore += importance;
      }
    } else {
      // Fallback for terms not in importance scores
      totalWeight += 1;
      if (matched.has(keyword) || semanticMatches.has(keyword)) {
        weightedKeywordScore += 1;
      }
    }
  });
  
  const keywordScore = totalWeight > 0 ? (weightedKeywordScore / totalWeight) * 100 : 0;
  
  const matchedKeywords = Array.from(matched.entries())
    .map(([keyword, count]) => ({ 
      keyword, 
      count, 
      importance: jobImportance.get(keyword) || 0 
    }))
    .sort((a, b) => b.importance - a.importance);
  
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
  
  // Calculate skill score
  const skillScore = jobSkills.size > 0
    ? (matchedSkills.length / jobSkills.size) * 100
    : 0;
  
  // Phrase overlap (2-word and 3-word phrases)
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
    if (resumeTokens.has(term) || resumeText.toLowerCase().includes(term)) {
      coveredImportantTerms++;
    }
  }
  
  const repeatedJobTermScore = importantTerms.length > 0
    ? (coveredImportantTerms / importantTerms.length) * 100
    : 50; // Neutral if no repeated terms
  
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

  // Calculate final score with improved weights
  const semanticBonus = Math.min(semanticMatches.size * 0.5, 10); // Scale bonus with coverage, max 10 points
  let matchScore = 
    keywordScore * profile.weights.keyword +
    skillScore * profile.weights.skill +
    phraseScore * profile.weights.phrase +
    repeatedJobTermScore * profile.weights.repeated +
    roleFocusScore * profile.weights.role +
    semanticBonus - // Scaled bonus for semantic matches
    repetitionPenalty;
  
  // Clamp between 0 and 100
  matchScore = Math.max(0, Math.min(100, matchScore));
  
  // Generate phrase suggestions
  const repeatedPhrases = repeatedPhrasesData.slice(0, 10).map(({ phrase, count }) => ({
    phrase,
    count,
    suggestion: PHRASE_SUGGESTIONS[phrase.toLowerCase()] || 
      'Consider replacing with more specific action verbs that describe your actual contribution.',
  }));
  
  // Calculate TF-IDF coverage ratio
  const coveredImportantTermsSet = new Set<string>();
  resumeImportance.forEach((_, term) => {
    if (jobImportance.has(term)) {
      coveredImportantTermsSet.add(term);
    }
  });
  
  const coverageRatio = jobImportantTerms.length > 0 
    ? (coveredImportantTermsSet.size / jobImportantTerms.length) * 100 
    : 0;
  
  // Generate suggested bullets based on matched skills and missing skills
  const suggestedBullets = generateSuggestedBullets(matchedSkills, missingSkills, jobPostText);
  const scoreBreakdown: ScoreBreakdownItem[] = [
    {
      label: 'Keywords',
      score: Math.round(keywordScore),
      weight: Math.round(profile.weights.keyword * 100),
      detail: 'Coverage of important job-post terms in your resume.',
    },
    {
      label: 'Skills',
      score: Math.round(skillScore),
      weight: Math.round(profile.weights.skill * 100),
      detail: 'Detected skill overlap between the resume and job post.',
    },
    {
      label: 'Phrase alignment',
      score: Math.round(phraseScore),
      weight: Math.round(profile.weights.phrase * 100),
      detail: 'Shared two- and three-word phrases that signal role alignment.',
    },
    {
      label: 'Repeated job terms',
      score: Math.round(repeatedJobTermScore),
      weight: Math.round(profile.weights.repeated * 100),
      detail: 'Coverage of terms the job post repeats multiple times.',
    },
  ];

  if (roleMode !== 'general') {
    scoreBreakdown.push({
      label: `${profile.label} Role focus`,
      score: Math.round(roleFocusScore),
      weight: Math.round(profile.weights.role * 100),
      detail: `Extra weighting for ${profile.label.toLowerCase()} skills and responsibilities.`,
    });
  }

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
    matchScore: Math.round(matchScore),
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
