import { extractSkillsFromText, buildSkillLookup } from './skillDictionary';
import { findRepeatedPhrases, calculateKeywordOverlap, extractAllPhrases, getNormalizedTokens } from './textProcessing';

export interface ScoringResult {
  matchScore: number;
  keywordScore: number;
  skillScore: number;
  phraseScore: number;
  repeatedJobTermScore: number;
  repetitionPenalty: number;
  matchedKeywords: Array<{ keyword: string; count: number; importance: number }>;
  missingSkills: Array<{ skill: string; category: string }>;
  matchedSkills: Array<{ skill: string; category: string }>;
  repeatedPhrases: Array<{ phrase: string; count: number; suggestion: string }>;
  suggestedBullets: string[];
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

export function analyzeMatch(resumeText: string, jobPostText: string): ScoringResult {
  const skillLookup = buildSkillLookup();
  
  // Extract skills from both texts
  const resumeSkills = extractSkillsFromText(resumeText, skillLookup);
  const jobSkills = extractSkillsFromText(jobPostText, skillLookup);
  
  // Find matched and missing skills
  const matchedSkills: Array<{ skill: string; category: string }> = [];
  const missingSkills: Array<{ skill: string; category: string }> = [];
  
  const allSkillsData = new Map<string, { category: string }>();
  for (const skill of resumeSkills) {
    allSkillsData.set(skill, { category: 'unknown' });
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
    .filter(([_, count]) => count >= 2)
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
  
  // Calculate final score with improved weights
  // Document importance weighted keyword score is more important now
  const semanticBonus = Math.min(semanticMatches.size * 0.5, 10); // Scale bonus with coverage, max 10 points
  let matchScore = 
    keywordScore * 0.35 +
    skillScore * 0.30 + // Slightly reduced skill weight
    phraseScore * 0.15 +
    repeatedJobTermScore * 0.10 +
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
  const suggestedBullets = generateSuggestedBullets(matchedSkills, missingSkills);
  
  return {
    matchScore: Math.round(matchScore),
    keywordScore: Math.round(keywordScore),
    skillScore: Math.round(skillScore),
    phraseScore: Math.round(phraseScore),
    repeatedJobTermScore: Math.round(repeatedJobTermScore),
    repetitionPenalty,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingSkills,
    matchedSkills,
    repeatedPhrases,
    suggestedBullets,
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
  missingSkills: Array<{ skill: string; category: string }>
): string[] {
  const bullets: string[] = [];
  
  // Template bullets for matched skills
  if (matchedSkills.length > 0) {
    const topMatched = matchedSkills.slice(0, 3);
    for (const skill of topMatched) {
      if (skill.category === 'technical') {
        bullets.push(`Built and maintained ${skill.skill} solutions to support team objectives and deliver measurable results.`);
      } else if (skill.category === 'business') {
        bullets.push(`Applied ${skill.skill} to drive data-informed decisions and improve team performance.`);
      } else if (skill.category === 'soft') {
        bullets.push(`Demonstrated strong ${skill.skill} in cross-functional team environments to achieve project goals.`);
      }
    }
  }
  
  // Template bullets for missing skills
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3);
    for (const skill of topMissing) {
      if (skill.category === 'technical') {
        bullets.push(`Utilized ${skill.skill} to analyze complex data and generate actionable insights for stakeholders.`);
      } else if (skill.category === 'business') {
        bullets.push(`Applied ${skill.skill} methodologies to streamline processes and reduce inefficiencies.`);
      }
    }
  }
  
  // Add generic strong bullets if we don't have enough
  if (bullets.length < 3) {
    bullets.push(
      'Analyzed user feedback and market research to identify opportunities for product improvements.',
      'Collaborated with cross-functional teams to deliver projects on time and within scope.',
      'Led initiative to implement new tools and processes that increased team productivity by measurable metrics.'
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