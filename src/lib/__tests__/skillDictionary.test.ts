import { containsSkillTerm, extractSkillsFromText, getSkillByName, mentionsSkill } from '../skillDictionary';

describe('skillDictionary', () => {
  describe('false positives', () => {
    it('does not read generic testing as usability testing', () => {
      expect(extractSkillsFromText('Responsible for testing and quality checks')).not.toContain('usability testing');
    });

    it('does not read a CV heading as computer vision', () => {
      expect(extractSkillsFromText('CV available on request')).not.toContain('computer vision');
    });

    it('does not read research on its own as market research', () => {
      expect(extractSkillsFromText('Conducted research for a class project')).not.toContain('market research');
    });

    it('does not read a query as SQL', () => {
      expect(extractSkillsFromText('Answered a customer query')).not.toContain('sql');
    });

    it('does not read the verb go as the Go language', () => {
      expect(extractSkillsFromText('We go to market quickly')).not.toContain('go');
    });

    it('still recognises Go when it is the language', () => {
      expect(extractSkillsFromText('Built services in Golang')).toContain('go');
      expect(extractSkillsFromText('Go developer with distributed systems experience')).toContain('go');
    });

    it('does not read PM as project management', () => {
      expect(extractSkillsFromText('Standups at 5 pm daily')).not.toContain('project management');
    });

    it('does not read AI as deep learning', () => {
      expect(extractSkillsFromText('Curious about AI tools')).not.toContain('deep learning');
    });
  });

  describe('true positives', () => {
    it('detects genuine skills and aliases', () => {
      const skills = extractSkillsFromText('Python, postgres, Tableau and CI/CD pipelines');

      expect(skills).toContain('python');
      expect(skills).toContain('sql');
      expect(skills).toContain('tableau');
      expect(skills).toContain('ci/cd');
    });

    it('detects multi-word skills', () => {
      const skills = extractSkillsFromText('Strong stakeholder management and user research experience');

      expect(skills).toContain('stakeholder management');
      expect(skills).toContain('user research');
    });

    it('matches a known variation by skill name', () => {
      expect(mentionsSkill('Managed PostgreSQL clusters', 'sql')).toBe(true);
      expect(mentionsSkill('Managed PostgreSQL clusters', 'tableau')).toBe(false);
    });

    it('resists partial word matches', () => {
      expect(containsSkillTerm('javascript developer', 'java')).toBe(false);
      expect(containsSkillTerm('java developer', 'java')).toBe(true);
    });

    it('exposes skill metadata by name', () => {
      expect(getSkillByName('Python')?.category).toBe('technical');
      expect(getSkillByName('not-a-skill')).toBeUndefined();
    });
  });
});
