import { STOP_WORDS, isStopWord } from './stopWords';

// Normalization mappings
const NORMALIZATION_MAP: Record<string, string> = {
  'analyses': 'analysis',
  'dashboards': 'dashboard',
  'managed': 'manage',
  'managing': 'manage',
  'stakeholders': 'stakeholder',
  'teams': 'team',
  'projects': 'project',
  'processes': 'process',
  'requirements': 'requirement',
  'results': 'result',
  'reports': 'report',
  'metrics': 'metric',
  'analytics': 'analysis',
  'implementations': 'implementation',
  'developments': 'development',
  'management': 'manage',
  'leadership': 'lead',
  'communication': 'communicate',
  'collaboration': 'collaborate',
  'organizations': 'organization',
  'experiences': 'experience',
  'responsibilities': 'responsibility',
  'qualifications': 'qualification',
  'skills': 'skill',
  'abilities': 'ability',
  'achievements': 'achievement',
  'improvements': 'improvement',
  'increases': 'increase',
  'decreases': 'decrease',
  'productions': 'production',
  'operations': 'operation',
  'configurations': 'configuration',
  'integrations': 'integration',
  'optimizations': 'optimization',
  'automations': 'automation',
  'visualizations': 'visualization',
  'segmentations': 'segmentation',
  'forecasts': 'forecast',
  'budgets': 'budget',
  'strategies': 'strategy',
  'methodologies': 'methodology',
  'technologies': 'technology',
  'functionalities': 'functionality',
  'capabilities': 'capability',
  'dependencies': 'dependency',
  'priorities': 'priority',
};

// Normalize a word
export function normalizeWord(word: string): string {
  const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  return NORMALIZATION_MAP[lower] || lower;
}

// Tokenize text into words
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9']/g, ' ')
    .split(/\b/)
    .filter(word => word.length > 1 && !isStopWord(word));
}

// Get normalized tokens (stop words removed, normalized)
export function getNormalizedTokens(text: string): string[] {
  return tokenize(text).map(normalizeWord).filter(t => t.length > 1);
}

// Extract meaningful n-grams (2, 3, and 4 word phrases)
export function extractNGrams(text: string, n: number): Map<string, number> {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const tokens = normalizedText.split(/\s+/).filter(t => t.length > 1);
  const ngrams = new Map<string, number>();
  
  for (let i = 0; i <= tokens.length - n; i++) {
    const ngram = tokens.slice(i, i + n).join(' ');
    if (ngram.split(' ').length === n) {
      // Don't count if mostly stop words
      const significantWords = ngram.split(' ').filter(w => !isStopWord(w));
      if (significantWords.length >= n - 1) {
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
      }
    }
  }
  
  return ngrams;
}

// Extract all meaningful phrases (2, 3, 4 word combinations)
export function extractAllPhrases(text: string): Map<string, number> {
  const allPhrases = new Map<string, number>();
  
  [2, 3, 4].forEach(n => {
    const ngrams = extractNGrams(text, n);
    ngrams.forEach((count, phrase) => {
      allPhrases.set(phrase, (allPhrases.get(phrase) || 0) + count);
    });
  });
  
  return allPhrases;
}

// Find repeated phrases in resume
export function findRepeatedPhrases(text: string): Array<{ phrase: string; count: number }> {
  const phrases = extractAllPhrases(text);
  const repeated: Array<{ phrase: string; count: number }> = [];
  
  // Common phrases to ignore unless heavily repeated
  const ignorePhrases = new Set([
    'in order to', 'as part of', 'responsible for', 'worked with',
    'worked on', 'involved in', 'part of', 'based on', 'in a',
    'of the', 'in the', 'for the', 'to the', 'and the',
    'on a', 'at a', 'to a', 'with a', 'for a',
    'such as', 'etc etc', 'ie e g', 'eg', 'ie'
  ]);
  
  phrases.forEach((count, phrase) => {
    if (count >= 3 && !ignorePhrases.has(phrase.toLowerCase())) {
      repeated.push({ phrase, count });
    }
  });
  
  // Sort by count descending
  return repeated.sort((a, b) => b.count - a.count);
}

// Extract keywords from text (excluding stop words)
export function extractKeywords(text: string): Map<string, number> {
  const tokens = getNormalizedTokens(text);
  const keywords = new Map<string, number>();
  
  tokens.forEach(token => {
    if (token.length > 2) {
      keywords.set(token, (keywords.get(token) || 0) + 1);
    }
  });
  
  return keywords;
}

// Calculate keyword overlap between two texts
export function calculateKeywordOverlap(
  resumeText: string,
  jobPostText: string
): { matched: Map<string, number>; allJobKeywords: Map<string, number> } {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobPostText);
  
  const matched = new Map<string, number>();
  
  jobKeywords.forEach((count, keyword) => {
    if (resumeKeywords.has(keyword)) {
      matched.set(keyword, Math.min(count, resumeKeywords.get(keyword)!));
    }
  });
  
  return { matched, allJobKeywords: jobKeywords };
}