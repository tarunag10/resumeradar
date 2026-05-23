import { analyzeMatch, getMatchInfo, ScoringResult } from '../scoring';

describe('scoring', () => {
  describe('analyzeMatch', () => {
    it('should return a complete scoring result', () => {
      const resume = `
        Senior Software Engineer
        Experience with Python, JavaScript, and AWS
        Led team of 5 developers
        Built microservices architecture
        Implemented CI/CD pipelines
      `;
      const jobPost = `
        Senior Software Engineer
        Requirements:
        - 5+ years Python experience
        - JavaScript expertise
        - AWS cloud services
        - Microservices architecture
        - CI/CD pipeline experience
        - Team leadership
      `;
      const result = analyzeMatch(resume, jobPost);

      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('keywordScore');
      expect(result).toHaveProperty('skillScore');
      expect(result).toHaveProperty('phraseScore');
      expect(result).toHaveProperty('repeatedJobTermScore');
      expect(result).toHaveProperty('repetitionPenalty');
      expect(result).toHaveProperty('matchedKeywords');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('repeatedPhrases');
      expect(result).toHaveProperty('suggestedBullets');
      expect(result).toHaveProperty('tfidfAnalysis');
    });

    it('should calculate keyword overlap', () => {
      const resume = 'Python JavaScript AWS Docker';
      const jobPost = 'Python JavaScript AWS Kubernetes';
      const result = analyzeMatch(resume, jobPost);

      // Python, JavaScript, AWS should match
      expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(3);
      expect(result.keywordScore).toBeGreaterThan(0);
    });

    it('should detect matched and missing skills', () => {
      const resume = 'Experience with Python JavaScript React';
      const jobPost = 'Need Python JavaScript AWS Docker Kubernetes';
      const result = analyzeMatch(resume, jobPost);

      const matchedSkillNames = result.matchedSkills.map(s => s.skill);
      const missingSkillNames = result.missingSkills.map(s => s.skill);

      expect(matchedSkillNames).toContain('python');
      expect(matchedSkillNames).toContain('javascript');
      expect(missingSkillNames).toContain('aws');
      expect(missingSkillNames).toContain('docker');
    });

    it('should penalize repeated phrases in resume', () => {
      const repeatedResume = 'responsible for responsible for responsible for responsible for responsible for responsible for ' +
        'worked with worked with worked with worked with worked with ' +
        'part of part of part of part of part of';
      const jobPost = 'Need a developer with Python and JavaScript skills';

      const resultWithRepetition = analyzeMatch(repeatedResume, jobPost);

      // The repetition penalty should be applied
      expect(resultWithRepetition.repetitionPenalty).toBeGreaterThan(0);
    });

    it('should give higher score for better matches', () => {
      const poorResume = 'Did some work with computers';
      const goodResume = 'Software Engineer with 10 years Python JavaScript AWS React ' +
        'Led team of 10 Built microservices Implemented CI/CD pipeline ' +
        'Improved performance by 50% Collaborated with stakeholders';
      const jobPost = 'Software Engineer Python JavaScript AWS React microservices CI/CD leadership';

      const poorResult = analyzeMatch(poorResume, jobPost);
      const goodResult = analyzeMatch(goodResume, jobPost);

      expect(goodResult.matchScore).toBeGreaterThan(poorResult.matchScore);
    });

    it('should return score between 0 and 100', () => {
      const result = analyzeMatch('Test resume text here', 'Test job post text here');
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty resume', () => {
      const result = analyzeMatch('', 'Python JavaScript AWS');
      expect(result.matchScore).toBeLessThan(50); // Should be low
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should handle empty job post', () => {
      const result = analyzeMatch('Python JavaScript AWS experience', '');
      // With empty job post, no keywords match, but there may be semantic bonus
      // The key is that matchedKeywords should be empty
      expect(result.matchedKeywords.length).toBe(0);
      expect(result.keywordScore).toBe(0);
    });

    it('should generate suggested bullets', () => {
      const resume = 'Software Engineer with Python and JavaScript';
      const jobPost = 'Need Python JavaScript AWS Docker for Senior role';
      const result = analyzeMatch(resume, jobPost);

      expect(result.suggestedBullets.length).toBeGreaterThan(0);
      expect(result.suggestedBullets.length).toBeLessThanOrEqual(5);
    });

    it('should limit matched keywords to 20', () => {
      const longResume = Array(100).fill('word').join(' ');
      const longJobPost = Array(100).fill('term').join(' ');
      const result = analyzeMatch(longResume, longJobPost);

      expect(result.matchedKeywords.length).toBeLessThanOrEqual(20);
    });

    it('should include tfidfAnalysis in result', () => {
      const result = analyzeMatch('Python developer with AWS skills', 'Need Python AWS developer');
      
      expect(result.tfidfAnalysis).toBeDefined();
      expect(result.tfidfAnalysis).toHaveProperty('resumeImportantTerms');
      expect(result.tfidfAnalysis).toHaveProperty('jobPostImportantTerms');
      expect(result.tfidfAnalysis).toHaveProperty('coverageRatio');
      expect(typeof result.tfidfAnalysis.coverageRatio).toBe('number');
    });

    it('should include importance score in matchedKeywords', () => {
      const result = analyzeMatch('Python JavaScript Python Python', 'Python JavaScript AWS');
      
      // Check that matchedKeywords have the importance property
      result.matchedKeywords.forEach(kw => {
        expect(kw).toHaveProperty('importance');
      });
    });

    it('should limit repeated phrases to 10', () => {
      const repeatedText = Array(50).fill('responsible for').join(' ');
      const result = analyzeMatch(repeatedText, 'Job post text');

      expect(result.repeatedPhrases.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getMatchInfo', () => {
    it('should return excellent for score >= 85', () => {
      const info = getMatchInfo(90);
      expect(info.label).toBe('Excellent match');
      expect(info.description).toContain('closely aligned');
    });

    it('should return strong for score >= 65', () => {
      const info = getMatchInfo(75);
      expect(info.label).toBe('Strong match');
      expect(info.description).toContain('many important terms');
    });

    it('should return moderate for score >= 40', () => {
      const info = getMatchInfo(50);
      expect(info.label).toBe('Moderate match');
      expect(info.description).toContain('some useful overlap');
    });

    it('should return low for score < 40', () => {
      const info = getMatchInfo(25);
      expect(info.label).toBe('Low match');
      expect(info.description).toContain('does not yet reflect');
    });

    it('should provide next action for each level', () => {
      const info85 = getMatchInfo(85);
      const info65 = getMatchInfo(65);
      const info40 = getMatchInfo(40);
      const info20 = getMatchInfo(20);

      expect(info85.nextAction).toBeTruthy();
      expect(info65.nextAction).toBeTruthy();
      expect(info40.nextAction).toBeTruthy();
      expect(info20.nextAction).toBeTruthy();
    });

    it('should handle edge cases at boundaries', () => {
      expect(getMatchInfo(84).label).not.toBe('Excellent match');
      expect(getMatchInfo(85).label).toBe('Excellent match');
      expect(getMatchInfo(64).label).not.toBe('Strong match');
      expect(getMatchInfo(65).label).toBe('Strong match');
      expect(getMatchInfo(39).label).not.toBe('Moderate match');
      expect(getMatchInfo(40).label).toBe('Moderate match');
    });
  });
});