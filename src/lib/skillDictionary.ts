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
  { name: 'sql', variations: ['mysql', 'postgresql', 'postgres', 'sqlite', 'query', 'queries'], category: 'technical' },
  { name: 'excel', variations: ['spreadsheet', 'xlsx', 'xls', 'spreadsheets'], category: 'technical' },
  { name: 'tableau', variations: ['tableau desktop', 'tableau server'], category: 'technical' },
  { name: 'power bi', variations: ['powerbi', 'power b i'], category: 'technical' },
  { name: 'react', variations: ['reactjs', 'react.js'], category: 'technical' },
  { name: 'node.js', variations: ['nodejs', 'node'], category: 'technical' },
  { name: 'html', variations: ['html5'], category: 'technical' },
  { name: 'css', variations: ['css3', 'stylesheet'], category: 'technical' },
  { name: 'git', variations: ['github', 'gitlab', 'version control'], category: 'technical' },
  { name: 'aws', variations: ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'], category: 'technical' },
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
  { name: 'go', variations: ['golang'], category: 'technical' },
  { name: 'scala', variations: ['apache scala'], category: 'technical' },
  { name: 'r', variations: ['r programming', 'rstats'], category: 'technical' },
  { name: 'matlab', variations: [], category: 'technical' },
  { name: 'sas', variations: ['sas analytics'], category: 'technical' },
  { name: 'spss', variations: [], category: 'technical' },
  { name: 'jupyter', variations: ['jupyter notebook', 'jupyterlab'], category: 'technical' },
  { name: 'pandas', variations: ['python pandas'], category: 'technical' },
  { name: 'numpy', variations: ['python numpy'], category: 'technical' },
  { name: 'scikit-learn', variations: ['sklearn', 'machine learning'], category: 'technical' },
  { name: 'tensorflow', variations: ['tf', 'keras'], category: 'technical' },
  { name: 'pytorch', variations: ['pyTorch'], category: 'technical' },
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
  { name: 'agile', variations: ['scrum', 'kanban', ' sprint'], category: 'technical' },
  { name: 'jira', variations: ['atlassian', 'confluence'], category: 'technical' },
  { name: 'figma', variations: ['ui design', 'ux design'], category: 'technical' },
  { name: 'sketch', variations: [], category: 'technical' },
  { name: 'adobe xd', variations: ['xd'], category: 'technical' },
  { name: 'photoshop', variations: ['adobe photoshop'], category: 'technical' },
  { name: 'illustrator', variations: ['adobe illustrator'], category: 'technical' },

  // Business and analytical skills
  { name: 'stakeholder management', variations: ['stakeholder engagement', 'stakeholder communication'], category: 'business' },
  { name: 'project management', variations: ['pm', 'project planning', 'project coordination'], category: 'business' },
  { name: 'data analysis', variations: ['analytics', 'data analytics', 'analyzing data'], category: 'business' },
  { name: 'reporting', variations: ['report generation', 'report building'], category: 'business' },
  { name: 'forecasting', variations: ['financial forecasting', 'demand forecasting'], category: 'business' },
  { name: 'budgeting', variations: ['budget management', 'financial planning'], category: 'business' },
  { name: 'market research', variations: ['market analysis', 'research'], category: 'business' },
  { name: 'customer segmentation', variations: ['segmentation', 'user segmentation'], category: 'business' },
  { name: 'process improvement', variations: ['process optimization', 'continuous improvement', 'lean'], category: 'business' },
  { name: 'a/b testing', variations: ['ab testing', 'split testing', 'experimentation'], category: 'business' },
  { name: 'business intelligence', variations: ['bi', 'bi tools'], category: 'business' },
  { name: 'dashboarding', variations: ['dashboards', 'dashboard creation', 'dashboard development'], category: 'business' },
  { name: 'data visualization', variations: ['data viz', 'visualization'], category: 'business' },
  { name: 'etl', variations: ['extract transform load', 'data pipeline'], category: 'business' },
  { name: 'requirements gathering', variations: ['requirements analysis', 'business requirements'], category: 'business' },
  { name: 'strategy', variations: ['strategic planning', 'strategic thinking'], category: 'business' },
  { name: 'compliance', variations: ['regulatory compliance', 'risk compliance', 'controls'], category: 'business' },
  { name: 'risk management', variations: ['risk assessment', 'risk controls', 'risk analysis'], category: 'business' },
  { name: 'financial analysis', variations: ['finance analysis', 'financial modelling', 'financial modeling'], category: 'business' },
  { name: 'campaign management', variations: ['marketing campaigns', 'campaign planning'], category: 'business' },
  { name: 'seo', variations: ['search engine optimization', 'organic search'], category: 'business' },
  { name: 'crm', variations: ['customer relationship management', 'salesforce', 'hubspot'], category: 'business' },
  { name: 'leadership', variations: ['team leadership', 'leading teams'], category: 'business' },
  { name: 'communication', variations: ['written communication', 'verbal communication', 'presentations'], category: 'soft' },
  { name: 'collaboration', variations: ['team collaboration', 'cross-functional collaboration'], category: 'soft' },
  { name: 'problem solving', variations: ['problem-solving', 'analytical problem solving'], category: 'soft' },
  { name: 'presentation', variations: ['presenting', 'public speaking'], category: 'soft' },
  { name: 'organization', variations: ['organizational skills', 'time management'], category: 'soft' },
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
  { name: 'usability testing', variations: ['user testing', 'testing', 'ux testing'], category: 'product' },
  { name: 'product strategy', variations: ['product vision', 'product planning'], category: 'product' },
  { name: 'experimentation', variations: ['experiment design', 'a/b tests'], category: 'product' },
  { name: 'data modeling', variations: ['data warehouse', 'data schema'], category: 'technical' },
  { name: 'machine learning', variations: ['ml', 'ml models', 'predictive models'], category: 'technical' },
  { name: 'deep learning', variations: ['neural networks', 'ai'], category: 'technical' },
  { name: 'nlp', variations: ['natural language processing', 'text analysis'], category: 'technical' },
  { name: 'computer vision', variations: ['image processing', 'cv'], category: 'technical' },
];

// Create a lookup map for faster matching
export function buildSkillLookup(): Map<string, Skill> {
  const lookup = new Map<string, Skill>();
  
  for (const skill of SKILLS) {
    // Add the main name
    lookup.set(skill.name.toLowerCase(), skill);
    
    // Add variations
    for (const variant of skill.variations) {
      lookup.set(variant.toLowerCase(), skill);
    }
  }
  
  return lookup;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsSkillTerm(text: string, term: string): boolean {
  const escaped = escapeRegExp(term.toLowerCase());
  const pattern = /^[a-z0-9+#./-]+$/.test(term)
    ? new RegExp(`(^|[^a-z0-9+#./-])${escaped}([^a-z0-9+#./-]|$)`, 'i')
    : new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
  return pattern.test(text);
}

// Extract skills from text
export function extractSkillsFromText(text: string): Set<string> {
  const foundSkills = new Set<string>();
  const normalizedText = text.toLowerCase();
  
  // Check for multi-word skills first (longer phrases)
  const sortedSkills = [...SKILLS].sort((a, b) => b.name.length - a.name.length);
  
  for (const skill of sortedSkills) {
    if (containsSkillTerm(normalizedText, skill.name)) {
      foundSkills.add(skill.name);
    } else {
      for (const variant of skill.variations) {
        if (containsSkillTerm(normalizedText, variant)) {
          foundSkills.add(skill.name);
          break;
        }
      }
    }
  }
  
  return foundSkills;
}
