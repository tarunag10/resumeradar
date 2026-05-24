# ResumeRadar

ResumeRadar is a private, browser-only resume matcher. Paste or upload a resume and a job post, choose a role mode, and get a local match report with keyword overlap, missing skills, resume quality checks, job-post insights, and safer bullet prompts.

## Features

- Local resume and job-post matching with no account, backend, or external AI calls.
- PDF and DOCX text extraction in the browser.
- Role modes for general, software, data, product, marketing, legal/compliance, and finance roles.
- Score breakdown across keyword coverage, skills, phrase alignment, repeated job terms, and role focus.
- Missing skills and missing keywords.
- Job-post insights for detected role, seniority, required/preferred skills, responsibilities, and top terms.
- Resume quality checks for metrics, action verbs, repeated phrasing, skills visibility, and bullet readability.
- Safer suggested bullet prompts that ask users to add details only when accurate.
- Restorable local match history.
- Export actions for copying, sharing, Markdown download, and JSON download.
- Light/dark theme support.

## Local-Only Design

ResumeRadar runs analysis in the browser. Resume text, job text, extracted file text, match results, and history are stored only in the current browser through `localStorage`. Files are parsed client-side with `pdfjs-dist` and `mammoth`.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm test
npm run lint
npm run build
```

## Project Structure

- `src/app/page.tsx` - main single-page experience.
- `src/components/` - input, history, results, export, scoring, and feedback UI.
- `src/lib/scoring.ts` - local scoring, role modes, quality checks, and job insights.
- `src/lib/documentExtractor.ts` - browser PDF/DOCX extraction.
- `src/lib/matchHistory.ts` - local match history storage.
- `src/lib/exportResults.ts` - Markdown, text, and JSON report formatting.

## Deployment

The project is configured as a static-friendly Next.js app and can be deployed to Vercel:

```bash
vercel deploy --prod
```

## Limitations

ResumeRadar is a guidance tool, not an ATS guarantee or hiring prediction. The score is an approximation based on visible text signals. Users should only add skills, tools, and claims that truthfully reflect their experience.
