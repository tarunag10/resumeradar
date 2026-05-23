# PRD: Local Resume / Job Post Matcher

## 1. Product Summary

**Product name:** Local Resume Matcher  
**Concept:** A privacy-first web app where users paste a resume and a job post, then get an instant local match score, missing skills, repeated phrases, keyword overlap, and suggested resume bullets.  
**Core promise:** “See how well your resume matches a job post in seconds, without uploading anything.”

The product is designed as a fast, approachable, no-login tool for job seekers who want immediate resume feedback before applying. It must run fully in the browser, store data only in `localStorage`, and require no backend, account, database, or server-side processing.

---

## 2. Problem Statement

Job seekers often tailor resumes manually and guess whether their resume matches a job description. Existing resume tools can feel heavy, intrusive, paid, or risky because they ask users to upload private career data. Users want a quick, trustworthy way to compare their resume against a job post and identify what to improve before applying.

This app solves that by offering instant, local-only analysis with practical, copy-ready suggestions.

---

## 3. Goals

### Product goals

1. Let users compare a resume and job post in under 30 seconds.
2. Show a clear match score that feels useful but not overly scientific.
3. Identify missing skills and important job keywords.
4. Surface repeated phrases that may weaken resume quality.
5. Suggest stronger resume bullet ideas based on the job post.
6. Make the product feel polished enough to use immediately and share.
7. Build user trust through a strong privacy-first positioning.

### Business and growth goals

1. Attract organic search traffic from job seekers looking for resume matching, ATS optimization, and job description keyword analysis.
2. Encourage repeat use through local saved comparisons and recent sessions.
3. Drive sharing through useful, screenshot-friendly results.
4. Position the tool as free, fast, and private.
5. Create a foundation for future monetization without compromising the no-backend MVP.

---

## 4. Non-Goals

This MVP will not:

1. Upload resumes or job posts to a server.
2. Create user accounts.
3. Use a backend database.
4. Call external AI APIs.
5. Guarantee ATS pass/fail outcomes.
6. Apply to jobs on behalf of the user.
7. Parse PDF, DOCX, or LinkedIn profiles in the first version.
8. Rewrite an entire resume automatically.
9. Claim hiring or interview outcomes.

---

## 5. Target Users

### Primary users

**Active job seekers**  
People applying to multiple roles who need to tailor resumes quickly.

**Career switchers**  
People trying to understand gaps between their experience and target roles.

**Students and recent graduates**  
People who need simple guidance on what skills and keywords to include.

**Freelancers and contractors**  
People adapting profiles or resumes to client briefs and project posts.

### Secondary users

**Career coaches**  
Can use the tool with clients during resume review sessions.

**Resume writers**  
Can use the tool as a lightweight diagnostic aid.

---

## 6. Core User Stories

1. As a job seeker, I want to paste my resume and a job post so I can see how well they match.
2. As a user, I want a simple score so I know whether my resume needs tailoring.
3. As a user, I want to see which keywords overlap so I know what is already covered.
4. As a user, I want to see missing skills so I can decide what to add if truthful.
5. As a user, I want to find repeated phrases so my resume feels sharper and less repetitive.
6. As a user, I want suggested bullets so I can improve my resume faster.
7. As a privacy-conscious user, I want confirmation that my data never leaves my device.
8. As a returning user, I want my last comparison saved locally so I can continue editing.
9. As a user, I want to clear all saved data instantly.
10. As a user, I want results that are easy to copy, export, or screenshot.

---

## 7. Key Value Proposition

### Main value proposition

**A free, private resume matcher that shows exactly what your resume is missing before you apply.**

### Supporting messages

- “Paste. Compare. Improve.”
- “No upload. No login. No backend.”
- “Your resume stays in your browser.”
- “Find missing keywords, repeated phrases, and stronger bullet ideas.”
- “Built for quick tailoring before every job application.”

---

## 8. Product Scope

### MVP scope

The MVP includes:

1. Resume text input.
2. Job post text input.
3. Local match scoring.
4. Keyword overlap analysis.
5. Missing skills and keyword detection.
6. Repeated phrase detection in the resume.
7. Suggested resume bullet ideas.
8. Local save using `localStorage`.
9. Clear data action.
10. Mobile-responsive polished interface.
11. SEO-friendly landing page content.
12. Privacy messaging throughout the experience.

### Post-MVP scope

Potential future additions:

1. PDF and DOCX text extraction in browser.
2. Multiple resume versions saved locally.
3. Comparison history.
4. Role-specific keyword presets.
5. Export to Markdown, TXT, or PDF.
6. Browser extension.
7. Local-only AI model option if feasible.
8. Advanced scoring weights by role family.
9. Cover letter alignment checker.
10. Interview question generator based on gaps.

---

## 9. Information Architecture

### Single-page structure

1. Hero section
2. Trust/privacy strip
3. Resume and job post input panel
4. Analyze button
5. Results dashboard
6. Suggested improvements
7. Saved locally notice
8. FAQ section
9. SEO content section
10. Footer with privacy reassurance

### Main navigation

For MVP, a simple top nav is enough:

- How it works
- Features
- Privacy
- FAQ
- Start matching

---

## 10. User Flow

### First-time user flow

1. User lands on page.
2. Hero explains the tool in one sentence.
3. User sees privacy reassurance: “Runs locally in your browser.”
4. User pastes resume text.
5. User pastes job post text.
6. User clicks “Analyze match.”
7. App validates that both fields have enough text.
8. App calculates match score locally.
9. Results dashboard appears.
10. User reviews overlap, missing skills, repeated phrases, and suggested bullets.
11. User copies suggested bullets or updates their resume outside the tool.
12. Input and result state are saved in `localStorage`.
13. User can clear all data at any time.

### Returning user flow

1. User returns to the app.
2. App detects locally saved session.
3. User sees a small “Last comparison restored from this browser” notice.
4. User continues editing, reruns analysis, or clears saved data.

---

## 11. Functional Requirements

## 11.1 Resume Input

### Description

A large text area where users paste resume content.

### Requirements

- Placeholder text should show an example format.
- Minimum recommended input: 100 characters.
- Show live character count.
- Show word count.
- Preserve line breaks.
- Autosave to `localStorage` after debounce.
- Provide “Clear resume” action.
- Provide sample resume text for demo mode.

### UX details

- Label: “Your resume”
- Helper text: “Paste your resume text. It stays in your browser.”
- Empty state hint: “Tip: Include experience, skills, projects, and certifications for a better match.”

---

## 11.2 Job Post Input

### Description

A large text area where users paste the target job description.

### Requirements

- Placeholder text should show a realistic job post snippet.
- Minimum recommended input: 100 characters.
- Show live character count.
- Show word count.
- Preserve line breaks.
- Autosave to `localStorage` after debounce.
- Provide “Clear job post” action.
- Provide sample job post for demo mode.

### UX details

- Label: “Job post”
- Helper text: “Paste the role description, responsibilities, and requirements.”
- Empty state hint: “Tip: Include qualifications and skills sections if available.”

---

## 11.3 Analyze Button

### Description

Primary action that runs local text analysis.

### Requirements

- Button label: “Analyze match”
- Disabled until both fields have enough content.
- Show inline validation if inputs are too short.
- Analysis should complete nearly instantly for typical pasted text.
- No loading spinner should be necessary unless analysis takes over 300ms.
- Results should scroll into view after analysis on mobile.

### Error states

- Resume too short: “Paste more resume text for a useful comparison.”
- Job post too short: “Paste more of the job post for a useful comparison.”
- Same text detected in both fields: “These look identical. Paste your resume on the left and the job post on the right.”

---

## 11.4 Match Score

### Description

A visible score that summarizes resume-to-job-post alignment.

### Requirements

- Display score from 0 to 100.
- Use clear status bands:
  - 0 to 39: Low match
  - 40 to 64: Moderate match
  - 65 to 84: Strong match
  - 85 to 100: Excellent match
- Explain score in plain language.
- Include short next-best action.

### Example copy

- “Strong match. Your resume covers many important terms, but several skills from the job post are missing.”
- “Next: Add truthful examples for the missing high-priority skills.”

### Scoring inputs

The score should combine:

1. Keyword overlap.
2. Skill overlap.
3. Important phrase overlap.
4. Missing high-priority terms.
5. Resume repetition penalty.

---

## 11.5 Keyword Overlap

### Description

Shows important words and phrases found in both the resume and job post.

### Requirements

- Extract keywords from both texts.
- Remove common stop words.
- Normalize case.
- Apply light stemming or simple singular/plural normalization.
- Rank by relevance to the job post.
- Show matched keywords as chips.
- Show frequency counts where useful.
- Limit default display to top 20 with “Show more.”

### Keyword categories

Where possible, classify terms into:

- Skills
- Tools
- Methods
- Responsibilities
- Education/certification
- Soft skills
- Industry terms

### UX details

- Section title: “Keywords you already match”
- Helper text: “These terms appear in both your resume and the job post.”
- Empty state: “No strong overlaps found yet. Try adding more complete resume text.”

---

## 11.6 Missing Skills

### Description

Shows skills or important terms from the job post that do not appear in the resume.

### Requirements

- Extract likely skills and tools from job post.
- Compare against normalized resume terms.
- Rank missing terms by job post importance.
- Show missing skills as chips.
- Highlight high-frequency missing terms.
- Include an honesty reminder: users should only add skills they genuinely have.

### UX details

- Section title: “Missing from your resume”
- Helper text: “These appear important in the job post but were not found in your resume.”
- Notice: “Only add skills you can honestly support with experience.”

### Output example

- SQL
- stakeholder management
- dashboarding
- A/B testing
- customer segmentation
- Python

---

## 11.7 Repeated Phrases

### Description

Identifies phrases used too often in the resume.

### Requirements

- Detect repeated 2-word, 3-word, and 4-word phrases.
- Ignore common phrases such as “in order to,” “as part of,” and “responsible for” unless repeated heavily.
- Show phrase, count, and example context if possible.
- Prioritize phrases repeated 3 or more times.
- Suggest rewriting where repetition may weaken the resume.

### UX details

- Section title: “Repeated phrases”
- Helper text: “Too much repetition can make a resume feel generic.”
- Empty positive state: “No major repetition found. Nice.”

### Output example

| Phrase | Count | Suggestion |
|---|---:|---|
| responsible for | 6 | Replace some uses with action verbs like led, built, improved, owned, launched |
| worked with | 5 | Use more specific verbs like partnered, collaborated, advised, implemented |

---

## 11.8 Suggested Bullets

### Description

Generates practical resume bullet ideas from the overlap and missing skills.

### Requirements

- Suggestions must be template-based, not AI-generated from a backend.
- Suggestions should be editable and copyable.
- Must remind users to add real metrics and truthful details.
- Should use strong action verbs.
- Should incorporate missing or important job terms where appropriate.
- Should avoid inventing experience.

### Suggested bullet logic

Use templates such as:

1. “Improved [process/outcome] by [metric] using [skill/tool].”
2. “Led [project/task] for [stakeholder/team], resulting in [impact].”
3. “Built [deliverable/system] with [tool/skill] to support [business goal].”
4. “Analyzed [data/process/customer need] to identify [insight/opportunity].”
5. “Collaborated with [team/stakeholder] to deliver [result].”

### UX details

- Section title: “Suggested resume bullets”
- Helper text: “Use these as starting points. Edit them so they are accurate to your experience.”
- Each suggestion has a “Copy” button.
- Include a “Make this stronger” hint next to each bullet:
  - Add a metric.
  - Add a tool.
  - Add a business result.
  - Add scope.

### Output example

- “Built [dashboard/report/workflow] using SQL and [tool] to help [team] track [business metric].”
- “Collaborated with stakeholders to translate [business need] into [project/output], improving [result].”

---

## 11.9 Local Storage

### Description

The app saves user content and results locally in the browser only.

### Requirements

Use `localStorage` for:

- Resume text.
- Job post text.
- Last analysis result.
- Timestamp of last analysis.
- User preference settings, such as dark mode or compact view.

### Storage keys

Suggested keys:

- `resumeMatcher.resumeText`
- `resumeMatcher.jobPostText`
- `resumeMatcher.lastResult`
- `resumeMatcher.lastAnalyzedAt`
- `resumeMatcher.preferences`

### Privacy requirements

- No server persistence.
- No analytics event may include resume or job post text.
- No text content sent to third-party services.
- Clear data button must remove all app-specific localStorage keys.
- Show user-friendly privacy explanation.

### UX copy

“Your resume and job post are saved only in this browser so you can come back later. Nothing is uploaded.”

---

## 12. Local-Only Technical Requirements

### Architecture

- Static frontend application.
- No backend server.
- No database.
- No authentication.
- No external text-processing APIs.
- Can be deployed to static hosting.

### Recommended stack

Any modern frontend stack is acceptable. Suggested:

- React or Next.js static export.
- TypeScript.
- Tailwind CSS.
- Client-side text analysis utilities.
- `localStorage` abstraction wrapper.

### Privacy guardrails

- Text analysis must run entirely in browser memory.
- Avoid logging pasted text to console.
- Avoid crash reporting that captures user input.
- If analytics are used, only track anonymous UI events, such as:
  - analyze_clicked
  - sample_loaded
  - result_copied
  - data_cleared
- Analytics must never include resume text, job post text, extracted skills, or generated bullets.

---

## 13. Text Processing Requirements

## 13.1 Preprocessing

The app should:

1. Convert text to lowercase for matching.
2. Remove punctuation where appropriate.
3. Preserve original text for display context.
4. Split text into tokens.
5. Remove stop words.
6. Normalize common variants:
   - analyses → analysis
   - dashboards → dashboard
   - managed → manage
   - managing → manage
   - stakeholders → stakeholder
7. Detect phrase candidates using n-grams.

## 13.2 Stop Word Handling

Common words should be ignored for keyword scoring, including:

- the
- and
- or
- to
- of
- in
- for
- with
- a
- an
- is
- are
- be
- as
- by
- from
- this
- that

The stop word list should be editable in code.

## 13.3 Skill Detection

Use a bundled local skill dictionary for common job skills and tools.

Initial categories:

### Technical skills

- JavaScript
- TypeScript
- Python
- SQL
- Excel
- Tableau
- Power BI
- React
- Node.js
- HTML
- CSS
- Git
- AWS
- Azure
- Docker
- Kubernetes

### Business and analytical skills

- stakeholder management
- project management
- data analysis
- reporting
- forecasting
- budgeting
- market research
- customer segmentation
- process improvement
- A/B testing

### Soft skills

- communication
- leadership
- collaboration
- problem solving
- presentation
- organization
- mentoring
- negotiation

### Product and design skills

- user research
- wireframing
- roadmap
- prioritization
- usability testing
- product strategy
- analytics
- experimentation

The dictionary should be easy to expand.

---

## 14. Scoring Model

### Score overview

The score should be understandable and deterministic.

Suggested weighting:

| Component | Weight |
|---|---:|
| Keyword overlap | 35% |
| Skill overlap | 35% |
| Important phrase overlap | 15% |
| Coverage of repeated job terms | 10% |
| Resume quality penalty | -5% max |

### Formula

`matchScore = keywordScore * 0.35 + skillScore * 0.35 + phraseScore * 0.15 + repeatedJobTermScore * 0.10 - repetitionPenalty`

Clamp final score between 0 and 100.

### Keyword score

`keywordScore = matchedImportantKeywords / totalImportantJobKeywords * 100`

### Skill score

`skillScore = matchedJobSkills / totalDetectedJobSkills * 100`

If no known skills are detected in the job post, reduce the weight of this component and redistribute to keyword overlap.

### Phrase score

Compare 2-word and 3-word meaningful phrases from the job post against the resume.

### Repeated job term score

Reward coverage of terms that appear multiple times in the job post, as they likely signal importance.

### Repetition penalty

Apply a small penalty if the resume contains many repeated phrases. This should never dominate the score.

Example:

- 0 to 2 repeated phrases: no penalty
- 3 to 5 repeated phrases: minus 2 points
- 6 or more repeated phrases: minus 5 points

### Score caveat copy

“This score is a guide, not a hiring prediction. Use it to find gaps and tailor your resume honestly.”

---

## 15. Results Dashboard UX

The results page should feel instantly useful, not like a dense report.

### Dashboard layout

Top summary card:

- Match score gauge
- Match label
- One-sentence summary
- Next best action

Secondary cards:

1. Keywords you match
2. Missing from your resume
3. Repeated phrases
4. Suggested bullets

### Visual hierarchy

- Score should be the visual anchor.
- Missing skills should be highly visible.
- Suggested bullets should be easy to copy.
- Avoid overwhelming users with too many chips at once.

### Result states

#### Low match

Tone: encouraging, practical.

Copy example:

“Low match. Your resume does not yet reflect many of the terms used in this job post. Start by reviewing the missing skills and adding truthful examples where relevant.”

#### Moderate match

Copy example:

“Moderate match. You have some useful overlap, but the job post emphasizes several skills that are not visible in your resume.”

#### Strong match

Copy example:

“Strong match. Your resume covers many important terms. A few targeted additions could make it feel more aligned.”

#### Excellent match

Copy example:

“Excellent match. Your resume is closely aligned with the job post. Review repeated phrases and polish your bullets before applying.”

---

## 16. UI Requirements

## 16.1 Design Principles

The interface should feel:

- Fast
- Trustworthy
- Calm
- Modern
- Friendly
- Action-oriented
- Privacy-first

Avoid making the tool feel like a spammy resume scanner. The tone should be confident and helpful.

## 16.2 Visual Direction

### Recommended style

- Clean SaaS-style landing page.
- Soft gradient or subtle background texture.
- Large rounded cards.
- Strong whitespace.
- Clear typography.
- High-contrast primary CTA.
- Friendly iconography.
- Minimal animation.

### Suggested color system

- Primary: deep blue, indigo, or emerald.
- Accent: warm yellow or green for positive results.
- Warning: amber for moderate gaps.
- Error: red only for validation and destructive actions.
- Neutral background: off-white or very light gray.
- Dark mode optional but valuable.

### Typography

- Headline: bold, high-confidence, readable.
- Body: simple and legible.
- Results: use short labels, not long paragraphs.

### Layout

Desktop:

- Two-column input area.
- Results below or sticky side summary.
- Cards in a responsive grid.

Mobile:

- Single-column layout.
- Resume input first, job post second.
- Sticky bottom “Analyze match” button when both fields have content.
- Results appear immediately after analysis.

---

## 17. UX Enhancements To Make People Use It Immediately

## 17.1 Instant Demo Mode

Add a “Try with sample resume and job post” button.

Why it matters:

- Removes friction.
- Shows value before users paste private content.
- Helps users understand what results look like.

Requirements:

- Fill both text areas with realistic sample content.
- Automatically run analysis after sample is loaded.
- Clearly label sample content as sample content.

CTA copy:

“Try sample match”

## 17.2 Privacy Badge

Show a visible badge near the input area.

Copy options:

- “Runs 100% in your browser”
- “No upload”
- “No account needed”
- “Saved locally only”

## 17.3 Sticky Result Summary

On desktop, keep the score summary visible while users review details.

Contents:

- Score
- Label
- Missing skill count
- Matched keyword count
- Copy suggestions button

## 17.4 One-Click Copy

Every suggested bullet should have a copy button.

Also include:

- Copy all suggested bullets
- Copy missing skills
- Copy keyword list

## 17.5 Before-You-Apply Checklist

After results, show a short checklist:

- Add truthful examples for important missing skills.
- Replace repeated phrases.
- Add metrics where possible.
- Mirror the job title if accurate.
- Save your tailored version before applying.

## 17.6 Confidence-Boosting Microcopy

Use reassuring copy throughout:

- “This is a guide, not a gatekeeper.”
- “Only add skills you actually have.”
- “Your text never leaves this browser.”
- “Small edits can make your resume clearer.”

## 17.7 Screenshot-Friendly Results

Design result cards so users can screenshot and share them.

Requirements:

- Clean score card.
- Clear labels.
- No clutter.
- Optional “Hide text inputs” mode after analysis.

## 17.8 Progressively Revealed Details

Default view should show concise insights. Advanced details should be expandable.

Examples:

- Show top 10 missing skills, with “Show all.”
- Show top 20 matched keywords, with “Show all.”
- Show repeated phrases only when found.

---

## 18. Landing Page Requirements

The product should not open with a blank utility. It should feel like a useful public tool that someone wants to try immediately.

### Hero section

Headline options:

1. “Match your resume to any job post in seconds”
2. “See what your resume is missing before you apply”
3. “Free resume keyword matcher that runs in your browser”

Recommended headline:

**“Match your resume to any job post in seconds”**

Subheadline:

“Paste your resume and a job description to find keyword overlap, missing skills, repeated phrases, and stronger bullet ideas. No upload, no login, no backend.”

Primary CTA:

“Analyze my resume”

Secondary CTA:

“Try sample match”

Trust strip:

- 100% local analysis
- No account required
- Free to use
- Clear your data anytime

---

## 19. SEO Requirements

## 19.1 SEO Strategy

The app should target high-intent searches from people actively improving resumes before applying.

Primary SEO angle:

**Free private resume matcher for a specific job description.**

Secondary angles:

- ATS keyword checker
- Resume keyword scanner
- Job description resume matcher
- Resume gap analysis
- Missing skills checker
- Resume bullet suggestions

## 19.2 Target Keywords

### Primary keywords

- resume matcher
- resume job description matcher
- resume keyword matcher
- job description keyword matcher
- resume match score
- resume scanner
- ATS resume checker

### Long-tail keywords

- match my resume to a job description
- compare resume to job posting
- check resume against job description
- free resume keyword matcher
- private resume scanner no upload
- find missing skills in resume
- resume bullet suggestions for job description
- ATS keyword checker free

### Privacy-focused keywords

- local resume matcher
- no upload resume checker
- private resume scanner
- browser based resume checker

## 19.3 Metadata

### Title tag

“Free Resume Matcher | Match Your Resume to a Job Post”

### Meta description

“Paste your resume and a job post to get a private match score, keyword overlap, missing skills, repeated phrases, and suggested bullets. No upload or login.”

### Open Graph title

“Free Private Resume Matcher”

### Open Graph description

“Compare your resume with any job post in seconds. Find missing skills, keyword overlap, repeated phrases, and better resume bullet ideas.”

### Suggested URL slug

`/resume-job-description-matcher`

Alternative slugs:

- `/resume-matcher`
- `/ats-keyword-checker`
- `/job-description-resume-match`

## 19.4 Page Headings

Suggested H1:

“Match Your Resume to Any Job Post”

Suggested H2s:

- “How the resume matcher works”
- “What the match score includes”
- “Find missing skills before you apply”
- “Improve repeated resume phrases”
- “Get suggested resume bullets”
- “Private by design”
- “Frequently asked questions”

## 19.5 SEO Content Blocks

Add concise educational content below the tool to capture search intent.

### Content block: How it works

“Paste your resume and the job description you want to apply for. The matcher compares keywords, skills, and repeated phrases directly in your browser. You get a match score plus practical suggestions for improving your resume before applying.”

### Content block: Why keyword matching matters

“Many job descriptions repeat important skills, tools, and responsibilities. When your resume uses relevant language from the role, recruiters and screening systems can more easily see the connection between your experience and the job.”

### Content block: Privacy-first resume checking

“Your resume can contain sensitive information. This tool analyzes text locally in your browser and uses localStorage only, so your content is not uploaded to a backend.”

## 19.6 Structured Data

Use structured data only where genuinely appropriate.

Recommended schema:

- `SoftwareApplication`
- `WebApplication`
- `FAQPage`, only if the page has a real FAQ section
- `BreadcrumbList`, if the site has multiple pages

Potential `SoftwareApplication` properties:

- name
- applicationCategory
- operatingSystem
- offers
- description
- featureList

## 19.7 FAQ Section

Add a visible FAQ section with real user questions.

Suggested FAQs:

### Is this resume matcher free?

Yes. The MVP is free to use and does not require an account.

### Does my resume get uploaded?

No. The analysis runs in your browser. The app uses localStorage only so your text can stay available on the same device.

### Is this an ATS checker?

It helps you compare resume keywords and skills against a job description, which can support ATS-friendly tailoring. It does not guarantee ATS results or hiring outcomes.

### Should I add every missing skill?

No. Only add skills and experience you can honestly support.

### Can I use this for every job application?

Yes. Paste each job post separately and tailor your resume based on the gaps that matter.

## 19.8 Programmatic SEO Ideas For Later

If the product expands beyond a single page, create useful landing pages such as:

- Resume matcher for product manager jobs
- Resume matcher for data analyst jobs
- Resume matcher for software engineer jobs
- Resume matcher for marketing manager jobs
- Resume matcher for project manager jobs
- Resume matcher for sales jobs
- Resume matcher for finance jobs

Each page must contain genuinely useful role-specific guidance, not thin duplicated content.

---

## 20. Conversion Requirements

## 20.1 Primary Conversion

Primary conversion is not signup. It is successful analysis.

A successful conversion means:

1. User pastes resume.
2. User pastes job post.
3. User clicks analyze.
4. User sees results.

## 20.2 Secondary Conversions

- User copies a suggested bullet.
- User loads sample data.
- User returns later with saved local session.
- User clears data, showing trust in privacy controls.
- User shares the tool.

## 20.3 CTA Placement

Place CTAs:

- In hero.
- Above input panel.
- Sticky on mobile.
- After SEO explanation.
- After FAQ.

CTA copy options:

- “Analyze my resume”
- “Compare resume and job post”
- “Find missing skills”
- “Try sample match”

---

## 21. Analytics Requirements

Analytics are optional and must preserve privacy.

### Allowed events

- page_view
- analyze_clicked
- analysis_completed
- sample_loaded
- copy_bullet_clicked
- copy_all_clicked
- clear_data_clicked
- faq_expanded
- theme_changed

### Forbidden analytics data

Never collect:

- Resume text
- Job post text
- Extracted keywords
- Missing skills
- Suggested bullets
- User names
- Emails
- Phone numbers
- Company names from pasted text

### Metrics to monitor

- Visitor to analysis completion rate.
- Sample match usage rate.
- Copy action rate.
- Clear data usage rate.
- Average time to first analysis.
- Mobile vs desktop completion rate.
- Return visitor rate.

---

## 22. Accessibility Requirements

The app must be usable by keyboard and screen readers.

Requirements:

- Semantic HTML.
- Visible focus states.
- Labels for all inputs.
- ARIA labels where needed.
- Results announced after analysis.
- Color contrast must meet WCAG AA.
- Do not rely on color alone for score status.
- Buttons must have descriptive labels.
- Charts or gauges must include text equivalents.

---

## 23. Performance Requirements

- Initial page should load quickly on mobile.
- Main app should work on slow connections after load.
- Analysis should complete locally within 1 second for typical inputs.
- Avoid heavy dependencies.
- Avoid sending pasted content over the network.
- App should work as a static page.
- Consider service worker/PWA support later.

---

## 24. Security and Privacy Requirements

### Privacy principles

1. User text stays local.
2. User can clear data anytime.
3. No hidden uploads.
4. No sensitive text in logs.
5. Privacy promise must be visible before users paste content.

### Clear data behavior

When user clicks “Clear all local data”:

- Delete all app localStorage keys.
- Clear text areas.
- Clear results.
- Show confirmation toast: “Local data cleared from this browser.”

### Privacy copy

“This tool runs in your browser. Your resume and job post are not uploaded to a server. If you choose to keep working later, the text is saved only in this browser using localStorage.”

---

## 25. Edge Cases

1. User pastes very short resume.
2. User pastes very short job post.
3. User pastes same text in both fields.
4. User pastes non-English text.
5. User pastes text with unusual formatting.
6. User pastes a resume with tables copied from a PDF.
7. User pastes a very long job post.
8. No known skills are detected.
9. No repeated phrases are found.
10. localStorage is unavailable or full.
11. User is in private browsing mode.
12. User clears browser storage.
13. User disables JavaScript.

### Handling localStorage unavailable

If localStorage is unavailable:

- App should still run analysis in memory.
- Show notice: “Local saving is unavailable in this browser, but analysis still works.”

---

## 26. Acceptance Criteria

### Resume and job post input

- User can paste resume text.
- User can paste job post text.
- App shows word and character counts.
- Text is saved locally after editing.
- User can clear each field.

### Analysis

- User can run analysis without backend calls.
- App displays score from 0 to 100.
- App displays matched keywords.
- App displays missing skills.
- App displays repeated phrases.
- App displays suggested bullets.
- App completes analysis within performance target.

### Privacy

- No resume or job post text is sent to backend services.
- Clear data removes app localStorage keys.
- Privacy message is visible before input.
- App still works if localStorage fails, except saving is disabled.

### UI/UX

- App is responsive on mobile and desktop.
- Primary CTA is obvious.
- Sample mode works.
- Copy buttons work.
- Results are easy to scan.
- Empty and error states are helpful.

### SEO

- Page has one clear H1.
- Page has descriptive title and meta description.
- Page includes useful explanatory content below the tool.
- FAQ content is visible on the page.
- Structured data is valid if implemented.
- Page is indexable.

---

## 27. MVP Release Checklist

### Product

- Resume input complete.
- Job post input complete.
- Analyze flow complete.
- Results dashboard complete.
- localStorage save and clear complete.
- Sample data complete.
- Copy actions complete.

### Design

- Desktop layout complete.
- Mobile layout complete.
- Empty states complete.
- Error states complete.
- Score states complete.
- Privacy badges complete.
- FAQ section complete.

### Engineering

- No backend dependency.
- Text analysis runs locally.
- localStorage wrapper tested.
- Long text performance tested.
- No sensitive data in logs.
- Accessibility pass complete.

### SEO and launch

- Title and meta description added.
- Open Graph tags added.
- FAQ section added.
- Structured data tested.
- Sitemap included if part of a larger site.
- Search Console ready if deployed publicly.
- Social preview image created.

---

## 28. Suggested First Version UI Copy

### Hero

**Match your resume to any job post in seconds**

Paste your resume and a job description to find keyword overlap, missing skills, repeated phrases, and stronger bullet ideas. No upload, no login, no backend.

Primary button: **Analyze my resume**  
Secondary button: **Try sample match**

### Privacy strip

“Runs locally in your browser · Uses localStorage only · Clear your data anytime”

### Input panel

Resume label: **Your resume**  
Resume helper: “Paste your resume text. It stays in this browser.”

Job post label: **Job post**  
Job helper: “Paste the role description, responsibilities, and requirements.”

Button: **Analyze match**

### Results

Score card title: **Resume match score**  
Overlap card title: **Keywords you already match**  
Missing card title: **Missing from your resume**  
Repeated card title: **Repeated phrases**  
Bullet card title: **Suggested resume bullets**

### Footer privacy note

“Built for private resume tailoring. Your text is processed locally and is not uploaded.”

---

## 29. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Users mistake score for hiring prediction | Add clear caveat near score |
| Users add skills they do not have | Add honesty reminders near missing skills and bullet suggestions |
| Keyword extraction feels weak | Use a skill dictionary plus n-gram matching and frequency ranking |
| Privacy promise is not trusted | Show local-only explanation before input and offer clear data button |
| SEO page feels too thin | Add helpful, original content and FAQ below the tool |
| Tool feels generic | Invest in strong visual design, sample mode, and copyable suggestions |
| localStorage creates privacy concerns on shared devices | Explain saved-local behavior and make clear-data action prominent |

---

## 30. Future Monetization Ideas

The MVP should stay free and privacy-first. Future monetization should not require uploading sensitive resume text.

Possible options:

1. Paid downloadable resume tailoring checklist.
2. Premium local-only templates.
3. Career coach affiliate directory.
4. Sponsored but clearly labeled job search resources.
5. One-time purchase for advanced export features.
6. Browser extension premium version.
7. Team version for career coaches with client-side session management.

Avoid monetization that conflicts with the privacy promise.

---

## 31. Definition of Done

The MVP is done when a user can land on the page, understand the privacy promise, paste a resume and job post, get a useful local match analysis, copy suggested bullets, clear local data, and leave with a clear idea of how to improve their resume before applying.

The product should feel useful within the first minute.

