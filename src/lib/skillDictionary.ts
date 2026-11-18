// Skill dictionary organized by category
export interface Skill {
  name: string;
  variations: string[];
  category: 'technical' | 'business' | 'soft' | 'product';
}

export const SKILLS: Skill[] = [
  // Technical skills
  { name: 'javascript', variations: ['js', 'ecmascript'], category: 'technical' },
  { name: 'typescript', variations: ['ts'], category: 'technical' },
  { name: 'python', variations: ['py', 'python3'], category: 'technical' },
  { name: 'sql', variations: ['mysql', 'postgresql', 'postgres', 'sqlite'], category: 'technical' },
  { name: 'excel', variations: ['spreadsheet', 'xlsx', 'xls', 'spreadsheets'], category: 'technical' },
  { name: 'tableau', variations: ['tableau desktop', 'tableau server'], category: 'technical' },
  { name: 'power bi', variations: ['powerbi', 'power b i'], category: 'technical' },
  { name: 'react', variations: ['reactjs', 'react.js'], category: 'technical' },
  { name: 'node.js', variations: ['nodejs', 'node.js'], category: 'technical' },
  { name: 'html', variations: ['html5'], category: 'technical' },
  { name: 'css', variations: ['css3', 'stylesheet'], category: 'technical' },
  { name: 'git', variations: ['github', 'gitlab', 'version control'], category: 'technical' },
  { name: 'aws', variations: ['amazon web services', 'ec2', 's3', 'cloudformation'], category: 'technical' },
  { name: 'azure', variations: ['microsoft azure', 'azure cloud'], category: 'technical' },
  { name: 'docker', variations: ['docker container', 'containerization'], category: 'technical' },
  { name: 'kubernetes', variations: ['k8s', 'k8'], category: 'technical' },
  { name: 'java', variations: ['jdk', 'jre'], category: 'technical' },
  { name: 'c++', variations: ['cpp', 'c plus plus'], category: 'technical' },
  { name: 'c#', variations: ['csharp', 'dot net', '.net'], category: 'technical' },
  { name: 'ruby', variations: ['ruby on rails', 'ror'], category: 'technical' },
  { name: 'php', variations: ['php laravel'], category: 'technical' },
  { name: 'swift', variations: ['swiftios', 'ios development'], category: 'technical' },
  { name: 'kotlin', variations: ['android development'], category: 'technical' },
  { name: 'rust', variations: [], category: 'technical' },
  // "go" and "r" double as ordinary English words, so they are matched with a context guard below.
  { name: 'go', variations: ['golang'], category: 'technical' },
  { name: 'scala', variations: ['apache scala'], category: 'technical' },
  { name: 'r', variations: ['r programming', 'rstats'], category: 'technical' },
  { name: 'matlab', variations: [], category: 'technical' },
  { name: 'sas', variations: ['sas analytics'], category: 'technical' },
  { name: 'spss', variations: [], category: 'technical' },
  { name: 'jupyter', variations: ['jupyter notebook', 'jupyterlab'], category: 'technical' },
  { name: 'pandas', variations: ['python pandas'], category: 'technical' },
  { name: 'numpy', variations: ['python numpy'], category: 'technical' },
  { name: 'scikit-learn', variations: ['sklearn'], category: 'technical' },
  { name: 'tensorflow', variations: ['keras'], category: 'technical' },
  { name: 'pytorch', variations: [], category: 'technical' },
  { name: 'spark', variations: ['apache spark', 'pyspark'], category: 'technical' },
  { name: 'hadoop', variations: ['hdfs', 'mapreduce'], category: 'technical' },
  { name: 'kafka', variations: ['apache kafka', 'kafka streams'], category: 'technical' },
  { name: 'mongodb', variations: ['mongo'], category: 'technical' },
  { name: 'redis', variations: ['redis cache'], category: 'technical' },
  { name: 'elasticsearch', variations: ['elastic search', 'elk stack'], category: 'technical' },
  { name: 'graphql', variations: [], category: 'technical' },
  { name: 'rest api', variations: ['restful', 'api design', 'api development'], category: 'technical' },
  { name: 'microservices', variations: ['micro services'], category: 'technical' },
  { name: 'ci/cd', variations: ['continuous integration', 'continuous deployment', 'devops'], category: 'technical' },
  { name: 'agile', variations: ['scrum', 'kanban', 'sprint'], category: 'technical' },
  { name: 'jira', variations: ['atlassian'], category: 'technical' },
  { name: 'figma', variations: [], category: 'technical' },
  { name: 'sketch', variations: [], category: 'technical' },
  { name: 'adobe xd', variations: ['xd'], category: 'technical' },
  { name: 'photoshop', variations: ['adobe photoshop'], category: 'technical' },
  { name: 'illustrator', variations: ['adobe illustrator'], category: 'technical' },

  // Business and analytical skills
  { name: 'stakeholder management', variations: ['stakeholder engagement', 'stakeholder communication'], category: 'business' },
  { name: 'project management', variations: ['project planning', 'project coordination'], category: 'business' },
  { name: 'data analysis', variations: ['analytics', 'data analytics', 'analyzing data'], category: 'business' },
  { name: 'reporting', variations: ['report generation', 'report building'], category: 'business' },
  { name: 'forecasting', variations: ['financial forecasting', 'demand forecasting'], category: 'business' },
  { name: 'budgeting', variations: ['budget management', 'financial planning'], category: 'business' },
  { name: 'market research', variations: ['market analysis'], category: 'business' },
  { name: 'customer segmentation', variations: ['segmentation', 'user segmentation'], category: 'business' },
  { name: 'process improvement', variations: ['process optimization', 'continuous improvement'], category: 'business' },
  { name: 'a/b testing', variations: ['ab testing', 'split testing'], category: 'business' },
  { name: 'business intelligence', variations: ['bi tools'], category: 'business' },
  { name: 'dashboarding', variations: ['dashboards', 'dashboard creation', 'dashboard development'], category: 'business' },
  { name: 'data visualization', variations: ['data viz', 'visualization'], category: 'business' },
  { name: 'etl', variations: ['extract transform load', 'data pipeline'], category: 'business' },
  { name: 'requirements gathering', variations: ['requirements analysis', 'business requirements'], category: 'business' },
  { name: 'strategy', variations: ['strategic planning', 'strategic thinking'], category: 'business' },
  { name: 'compliance', variations: ['regulatory compliance', 'risk compliance'], category: 'business' },
  { name: 'risk management', variations: ['risk assessment', 'risk controls', 'risk analysis'], category: 'business' },
  { name: 'financial analysis', variations: ['finance analysis', 'financial modelling', 'financial modeling'], category: 'business' },
  { name: 'campaign management', variations: ['marketing campaigns', 'campaign planning'], category: 'business' },
  { name: 'seo', variations: ['search engine optimization', 'organic search'], category: 'business' },
  { name: 'crm', variations: ['customer relationship management', 'salesforce', 'hubspot'], category: 'business' },
  { name: 'leadership', variations: ['team leadership', 'leading teams'], category: 'business' },
  { name: 'communication', variations: ['written communication', 'verbal communication'], category: 'soft' },
  { name: 'collaboration', variations: ['team collaboration', 'cross-functional collaboration'], category: 'soft' },
  { name: 'problem solving', variations: ['problem-solving', 'analytical problem solving'], category: 'soft' },
  { name: 'presentation', variations: ['presenting', 'public speaking'], category: 'soft' },
  { name: 'organization', variations: ['organizational skills'], category: 'soft' },
  { name: 'mentoring', variations: ['coaching', 'mentorship'], category: 'soft' },
  { name: 'negotiation', variations: ['negotiation skills', 'conflict resolution'], category: 'soft' },
  { name: 'critical thinking', variations: ['analytical thinking', 'logical thinking'], category: 'soft' },
  { name: 'adaptability', variations: ['flexibility', 'adaptable'], category: 'soft' },
  { name: 'teamwork', variations: ['team player', 'collaborative'], category: 'soft' },

  // Product and design skills
  { name: 'user research', variations: ['user studies', 'ux research'], category: 'product' },
  { name: 'wireframing', variations: ['wireframes', 'wireframe design'], category: 'product' },
  { name: 'roadmap', variations: ['product roadmap', 'roadmap planning'], category: 'product' },
  { name: 'prioritization', variations: ['prioritizing', 'feature prioritization'], category: 'product' },
  { name: 'usability testing', variations: ['user testing', 'ux testing'], category: 'product' },
  { name: 'product strategy', variations: ['product vision', 'product planning'], category: 'product' },
  { name: 'experimentation', variations: ['experiment design', 'a/b tests'], category: 'product' },
  { name: 'data modeling', variations: ['data warehouse', 'data schema'], category: 'technical' },
  { name: 'machine learning', variations: ['ml', 'ml models', 'predictive models'], category: 'technical' },
  { name: 'deep learning', variations: ['neural networks'], category: 'technical' },
  { name: 'nlp', variations: ['natural language processing', 'text analysis'], category: 'technical' },
  { name: 'computer vision', variations: ['image processing'], category: 'technical' },
];

/**
 * Skills whose dictionary name is also an ordinary English word. A bare name match only
 * counts when one of these context patterns also appears, so "go to market" is not Go and
 * "R" in a sentence is not the R language.
 */
const CONTEXT_GUARDS: Record<string, RegExp> = {
  go: /\b(golang|go\s+(developer|developers|engineer|engineers|programmer|programming|language|services|microservices|code|codebase))\b/i,
  r: /\b(r\s+(programming|language|studio|package|packages|shiny|markdown)|rstudio|r\s*\/\s*(python|sql)|r\s*(and|&)\s*(python|sql))\b/i,
};

const SKILLS_BY_NAME = new Map<string, Skill>(SKILLS.map(skill => [skill.name.toLowerCase(), skill]));

// Longest names first so "machine learning" is checked before "machine".
const SKILLS_BY_LENGTH_DESC = [...SKILLS].sort((a, b) => b.name.length - a.name.length);

// Create a lookup map for faster matching
export function buildSkillLookup(): Map<string, Skill> {
  const lookup = new Map<string, Skill>();

  for (const skill of SKILLS) {
    lookup.set(skill.name.toLowerCase(), skill);

    for (const variant of skill.variations) {
      lookup.set(variant.toLowerCase(), skill);
    }
  }

  return lookup;
}

const SKILL_LOOKUP = buildSkillLookup();

export function getSkillByName(name: string): Skill | undefined {
  return SKILLS_BY_NAME.get(name.toLowerCase());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TERM_PATTERN_CACHE = new Map<string, RegExp>();

function skillTermPattern(term: string): RegExp {
  const cached = TERM_PATTERN_CACHE.get(term);
  if (cached) return cached;

  const escaped = escapeRegExp(term.toLowerCase());
  const pattern = /^[a-z0-9+#./-]+$/.test(term)
    ? new RegExp(`(^|[^a-z0-9+#./-])${escaped}([^a-z0-9+#./-]|$)`, 'i')
    : new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');

  TERM_PATTERN_CACHE.set(term, pattern);
  return pattern;
}

export function containsSkillTerm(text: string, term: string): boolean {
  return skillTermPattern(term).test(text);
}

function passesContextGuard(text: string, term: string): boolean {
  const guard = CONTEXT_GUARDS[term.toLowerCase()];
  return guard ? guard.test(text) : true;
}

/** True when `skill` is mentioned in `text`, including through a known variation. */
export function skillMatchesText(text: string, skill: Skill): boolean {
  const lower = text.toLowerCase();

  if (containsSkillTerm(lower, skill.name) && passesContextGuard(lower, skill.name)) {
    return true;
  }

  return skill.variations.some(
    variant => containsSkillTerm(lower, variant) && passesContextGuard(lower, variant)
  );
}

/** Convenience wrapper used when a skill is known by name (for example from a result set). */
export function mentionsSkill(text: string, skillName: string): boolean {
  const skill = SKILLS_BY_NAME.get(skillName.toLowerCase());
  return skill ? skillMatchesText(text, skill) : false;
}

// Extract skills from text
export function extractSkillsFromText(text: string): Set<string> {
  const foundSkills = new Set<string>();

  for (const skill of SKILLS_BY_LENGTH_DESC) {
    if (skillMatchesText(text, skill)) {
      foundSkills.add(skill.name);
    }
  }

  return foundSkills;
}

/** Skill category lookup, exposed for reporting layers. */
export function getSkillCategory(skillName: string): string {
  return SKILL_LOOKUP.get(skillName.toLowerCase())?.category || 'unknown';
}
