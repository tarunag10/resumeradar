export const SAMPLE_RESUME = `John Smith
Senior Product Analyst

EXPERIENCE

Product Analyst at TechCorp (2020-Present)
- Analyzed user behavior data using SQL and Python to identify trends
- Built dashboards in Tableau to track key metrics
- Collaborated with stakeholders to define product requirements
- Led A/B testing initiatives to improve user engagement
- Managed project timelines and coordinated with engineering teams

Data Analyst at Analytics Inc (2018-2020)
- Developed reports and visualizations for executive stakeholders
- Performed customer segmentation analysis to support marketing campaigns
- Improved data quality and streamlined ETL processes
- Created automated dashboards using Excel and Power BI

SKILLS
Technical: SQL, Python, Tableau, Excel, Power BI, Git, Jira
Soft: Communication, Leadership, Problem Solving, Collaboration

EDUCATION
Bachelor's in Business Administration, State University, 2018`;

export const SAMPLE_JOB_POST = `Senior Product Analyst

We are looking for a Senior Product Analyst to join our growing team.

Requirements:
- 3+ years of experience in product analytics or data analysis
- Strong proficiency in SQL and Python for data analysis
- Experience with data visualization tools (Tableau, Power BI)
- Knowledge of A/B testing and statistical analysis
- Excellent stakeholder management and communication skills
- Experience with agile methodologies and JIRA
- Ability to translate complex data into actionable insights

Responsibilities:
- Analyze large datasets to identify trends and opportunities
- Build and maintain dashboards to track product performance
- Collaborate with product managers and engineering teams
- Design and execute A/B tests to improve user experience
- Present findings to stakeholders at all levels
- Lead initiatives to improve data infrastructure

Preferred Skills:
- Experience with machine learning
- Background in customer segmentation
- Knowledge of ETL pipelines
- Prior experience in SaaS environment

We offer competitive salary, health benefits, and growth opportunities.`;

export function loadSampleData(): { resume: string; jobPost: string } {
  return {
    resume: SAMPLE_RESUME,
    jobPost: SAMPLE_JOB_POST,
  };
}