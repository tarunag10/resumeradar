import {
  tokenize,
  normalizeWord,
  getNormalizedTokens,
  extractNGrams,
  extractAllPhrases,
  findRepeatedPhrases,
  extractKeywords,
  calculateKeywordOverlap,
} from '../textProcessing';

describe('textProcessing', () => {
  describe('normalizeWord', () => {
    it('should normalize common word forms', () => {
      expect(normalizeWord('analyses')).toBe('analysis');
      expect(normalizeWord('dashboards')).toBe('dashboard');
      expect(normalizeWord('managed')).toBe('manage');
      expect(normalizeWord('stakeholders')).toBe('stakeholder');
    });

    it('should return lowercase version for unrecognized words', () => {
      expect(normalizeWord('Developer')).toBe('developer');
      expect(normalizeWord('SPECIAL')).toBe('special');
    });

    it('should remove non-alphanumeric characters', () => {
      expect(normalizeWord('data-driven!')).toBe('datadriven');
      expect(normalizeWord('test123')).toBe('test123');
    });
  });

  describe('tokenize', () => {
    it('should split text into tokens', () => {
      const tokens = tokenize('JavaScript Developer with Python experience');
      expect(tokens).toContain('javascript');
      expect(tokens).toContain('developer');
      expect(tokens).toContain('python');
      expect(tokens).toContain('experience');
    });

    it('should filter out stop words', () => {
      const tokens = tokenize('the and a with for');
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('and');
      expect(tokens).not.toContain('a');
    });

    it('should filter out single character tokens', () => {
      const tokens = tokenize('a b c d e');
      expect(tokens.every(t => t.length > 1)).toBe(true);
    });

    it('should handle empty string', () => {
      expect(tokenize('')).toEqual([]);
    });
  });

  describe('getNormalizedTokens', () => {
    it('should return normalized tokens without stop words', () => {
      const tokens = getNormalizedTokens('I managed the team and we built dashboards');
      // 'managed' normalizes to 'manage', so we should see 'manage' in results
      expect(tokens).toContain('manage');
      expect(tokens).toContain('dashboard');
      // 'the', 'and', 'we' should be filtered as stop words
      expect(tokens).not.toContain('the');
    });
  });

  describe('extractNGrams', () => {
    it('should extract 2-word phrases', () => {
      const ngrams = extractNGrams('Senior Software Engineer with JavaScript', 2);
      const phrases = Array.from(ngrams.keys());
      expect(phrases).toContain('senior software');
      expect(phrases).toContain('software engineer');
    });

    it('should extract 3-word phrases', () => {
      const ngrams = extractNGrams('Lead Senior Software Engineer role', 3);
      const phrases = Array.from(ngrams.keys());
      expect(phrases).toContain('lead senior software');
      expect(phrases).toContain('senior software engineer');
    });

    it('should count phrase occurrences', () => {
      const ngrams = extractNGrams('team team team collaboration', 2);
      expect(ngrams.get('team team')).toBe(2);
    });

    it('should filter out phrases that are mostly stop words', () => {
      const ngrams = extractNGrams('in the of a for', 3);
      // Should filter out phrases with too many stop words
      expect(ngrams.size).toBe(0);
    });
  });

  describe('extractAllPhrases', () => {
    it('should extract phrases of all lengths (2, 3, 4 words)', () => {
      const phrases = extractAllPhrases('Senior Software Engineer position');
      const keys = Array.from(phrases.keys());
      const wordCounts = keys.map(k => k.split(' ').length);
      expect(wordCounts).toContain(2);
      expect(wordCounts).toContain(3);
    });

    it('should aggregate counts across phrase lengths', () => {
      const phrases = extractAllPhrases('team collaboration team');
      // 'team' alone isn't a phrase, but 'team collaboration' is
      expect(phrases.get('team collaboration')).toBeDefined();
    });
  });

  describe('findRepeatedPhrases', () => {
    it('should find phrases repeated 3 or more times', () => {
      // Use phrases that are not in the ignore list
      const repeated = findRepeatedPhrases(
        'lead team lead team lead team project management project management project management'
      );
      expect(repeated.length).toBeGreaterThan(0);
      expect(repeated[0].count).toBeGreaterThanOrEqual(3);
    });

    it('should filter out common filler phrases', () => {
      const repeated = findRepeatedPhrases(
        'in order to in order to in order to in order to in order to'
      );
      // These should be filtered out even at high counts
      const hasFiller = repeated.some(r => r.phrase.includes('in order to'));
      expect(hasFiller).toBe(false);
    });

    it('should return empty array for text with no repetitions', () => {
      const repeated = findRepeatedPhrases('Unique words that do not repeat at all');
      expect(repeated.length).toBe(0);
    });

    it('should sort by count descending', () => {
      // Use phrases that will pass the stop word filter
      const repeated = findRepeatedPhrases(
        'python python python java java java script script script script'
      );
      if (repeated.length >= 2) {
        expect(repeated[0].count).toBeGreaterThanOrEqual(repeated[1].count);
      }
    });
  });

  describe('extractKeywords', () => {
    it('should extract significant keywords with counts', () => {
      const keywords = extractKeywords('Python JavaScript Python AWS Python');
      expect(keywords.get('python')).toBe(3);
      expect(keywords.get('javascript')).toBe(1);
      expect(keywords.get('aws')).toBe(1);
    });

    it('should filter out short words (less than 3 chars)', () => {
      const keywords = extractKeywords('a an the is are be been');
      expect(Array.from(keywords.keys()).every(k => k.length > 2)).toBe(true);
    });

    it('should handle empty string', () => {
      const keywords = extractKeywords('');
      expect(keywords.size).toBe(0);
    });
  });

  describe('calculateKeywordOverlap', () => {
    it('should find matching keywords between resume and job post', () => {
      const resume = 'Experienced Python developer with JavaScript and AWS';
      const jobPost = 'Looking for Python developer with JavaScript React and AWS experience';
      const { matched, allJobKeywords } = calculateKeywordOverlap(resume, jobPost);

      expect(matched.has('python')).toBe(true);
      expect(matched.has('aws')).toBe(true);
      expect(matched.has('javascript')).toBe(true);
      expect(matched.has('react')).toBe(false); // Not in resume
    });

    it('should return all job keywords', () => {
      const resume = 'Python Python Python';
      const jobPost = 'Python JavaScript AWS Docker';
      const { allJobKeywords } = calculateKeywordOverlap(resume, jobPost);

      expect(allJobKeywords.has('python')).toBe(true);
      expect(allJobKeywords.has('javascript')).toBe(true);
      expect(allJobKeywords.has('aws')).toBe(true);
      expect(allJobKeywords.has('docker')).toBe(true);
    });

    it('should handle empty resume', () => {
      const { matched } = calculateKeywordOverlap('', 'Python JavaScript');
      expect(matched.size).toBe(0);
    });

    it('should handle empty job post', () => {
      const { matched, allJobKeywords } = calculateKeywordOverlap('Python JavaScript', '');
      expect(matched.size).toBe(0);
      expect(allJobKeywords.size).toBe(0);
    });
  });
});