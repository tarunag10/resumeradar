# ResumeRadar: implementation and improvement plan

Status: implemented in this change set. Scope: correctness of the scoring engine, data
robustness, document extraction quality, and small, high-value UX fixes.

Baseline measured before the changes: `tsc --noEmit` clean, `jest` 52/52 passing,
`eslint` clean, `next build` succeeding. The problems below are therefore behavioural or
robustness gaps, not broken builds.

---

## 1. What the app is

A single-page, client-only Next.js app. The user pastes (or uploads a PDF/DOCX) a resume and
a job post, picks a role mode, and gets a deterministic report: match score, keyword and
skill gaps, repeated phrasing, resume quality checks, job-post insights, suggested bullet
prompts, local history, and exports. No backend, no external API, no accounts; all state is
in `localStorage`.

---

## 2. Findings

### 2.1 Scoring bugs (highest impact: the product's core number is inconsistent)

| # | Finding | Why it matters |
|---|---------|----------------|
| S1 | Weighted components do not sum to 1. General mode sums to `0.90`, software to `0.95`, product to `0.95`, and so on. A separate `semanticBonus` of up to `+10` was added on top. | The same resume/job pair scores differently depending only on the role selector, and the advertised 0–100 scale is not on one scale. The breakdown cannot be added up to the final score. |
| S2 | `repeatedJobTermScore` returned a neutral `50` when the job post had no term repeated twice. | Any short job post handed out ~7 free points; an empty job post scored ~5/100. |
| S3 | `calculateDocumentImportance` measured document frequency with `text.includes(term)`. | Substring matching (`cat` matches `category`), and term weights were derived from a two-document corpus, so a term that existed in **both** documents got a lower weight than one that existed only in the job post. Keyword coverage therefore penalised the matches it was supposed to reward. |
| S4 | Repeated-term coverage used `resumeText.toLowerCase().includes(term)`. | Substring false positives (`art` inside `start`), inflating coverage even after the token set was already available. |
| S5 | `findSemanticMatches` rebuilt the synonym map per call and compared every resume token with every job token (`O(n·m)`), adding both sides to the result set. | Slow on long inputs and an arbitrary bonus threshold (`20` tokens capped the bonus). |
| S6 | Skill aliases were over-broad: `testing` → usability testing, `research` → market research, `cv` → computer vision, `query/queries` → SQL, `pm` → project management, `controls` → compliance, `ai` → deep learning, `node` → Node.js, `machine learning` → scikit-learn. | A resume mentioning "testing" or a CV heading was credited with skills it never claimed — the most damaging class of false positive for a resume tool. |
| S7 | Skill regexes were recompiled and the skill list re-sorted on every call. | `analyzeMatch` runs ~250 regex compilations twice per analysis for no reason. |
| S8 | Required vs preferred skills used only `indexOf` (first occurrence) inside an 80-character window. | A skill listed under "Requirements" and mentioned again later could be classified from the wrong context; second occurrences were invisible. |
| S9 | Repeated-phrase detection counted overlapping 2-, 3- and 4-grams of the same sentence. | One repeated sentence produced several "repeated phrase" findings and could trigger the repetition penalty and quality warning on its own. |
| S10 | `tokenize` split on `\b` after replacing punctuation with spaces, so runs of spaces became tokens. | Junk tokens leaked into keyword extraction before normalization filtered them. |

### 2.2 Data robustness bugs

| # | Finding | Why it matters |
|---|---------|----------------|
| D1 | `getMatchHistory` returned `JSON.parse(...)` with no shape check, and `MatchHistory` called `.map()` on it. | Corrupted or hand-edited `localStorage` crashed the history panel. |
| D2 | `hasCurrentResultShape` checked only four fields, but the dashboard and export use `matchedKeywords`, `suggestedBullets`, `repeatedPhrases`, `tfidfAnalysis`, `scoreBreakdown`, `jobInsights`. | A result saved by an older app version restored into state and crashed the results dashboard / export. |
| D3 | A `localStorage` quota failure was swallowed with `console.warn` in the save helpers and in history. | The user silently lost history or autosave with no feedback. |
| D4 | `matchHistory` wrote to the bare key `matchHistory` while everything else uses the `resumeMatcher.*` namespace, and stored full resume and job text for 10 entries. | Inconsistent storage layout, and history could exhaust the quota while the main text keys kept working. |
| D5 | `handleClearAll` cleared history storage but never told `MatchHistory` to refresh. | After "Clear data", the History button still listed matches and restoring one brought cleared data back. |

### 2.3 Extraction bugs

| # | Finding | Why it matters |
|---|---------|----------------|
| E1 | PDF page text was joined per extracted item with spaces and collapsed with `\s+`. | All line structure was destroyed. Bullet-based quality checks ("bullet readability", action verbs at line starts) and responsibility extraction cannot work on a PDF resume. |
| E2 | A scanned/image-only PDF, or an empty DOCX, returned `success: true` with empty text. | The user got a silent no-op and no explanation. |

### 2.4 UX and accessibility bugs

| # | Finding | Why it matters |
|---|---------|----------------|
| U1 | Results stayed on screen after the resume, job post or role mode changed, with no indication they described older inputs. | Users read a stale score as the current one. |
| U2 | `ExportActions.shareResult` awaited `navigator.share` with no `try/catch`; cancelling the share sheet produced an unhandled rejection and no status message. | Console error, no feedback. |
| U3 | `useToast` used `Date.now()` as the toast id. | Two toasts in the same millisecond collided and React dropped one. |
| U4 | The file input was never reset, so re-selecting the same file after an extraction fired no `change` event. | Uploading a corrected file with the same name appeared broken. |
| U5 | The keyboard hint always showed `⌘` on Windows/Linux; smooth scrolling ignored `prefers-reduced-motion`; the history popover had no <kbd>Escape</kbd> handling; the "restored from this browser" notice could not be dismissed. | Small but consistent papercuts. |
| U6 | No input-size limit; analysis is synchronous on the main thread. | A pasted 1 MB document froze the tab with no explanation. |

---

## 3. Implementation plan (what this change set does)

### Phase 1: one scoring scale
1. Replace the `semanticBonus` hack with a normalised weighted average: `score = Σ(signal × weight) − repetitionPenalty`, with every role profile's weights summing to exactly `1.0`.
2. Redistribute the weight of an unavailable signal (no repeated job terms) across the signals that are available, and show the *effective* weight in the breakdown so the numbers add up.
3. Add `contribution` to each breakdown item (score × effective weight) and render it, plus a total line and the penalty, in the UI.

### Phase 2: honest signal measurement
4. Compute term importance from term frequency inside the job post alone (normalised), instead of a two-document IDF that penalised matches.
5. Use token sets for repeated-term coverage; no substring tests.
6. Rewrite synonym matching as a single canonical-map intersection, `O(n + m)`, with the lookup built once at module load.
7. Surface synonym-assisted matches as `semanticMatches` (JSON/Markdown export and a UI note) instead of hiding them in a bonus.
8. Prune over-broad skill aliases; add contextual guards for genuinely ambiguous names (`go`, `r`) so ordinary English does not register as a skill.
9. Precompile skill regexes and the sorted skill list once.
10. Classify required vs preferred skills by section heading, line by line, with the local-window heuristic as fallback.
11. De-duplicate overlapping repeated n-grams.
12. Fix whitespace tokens in `tokenize`.

### Phase 3: data safety
13. New `src/lib/resultSchema.ts`: `parseStoredResult` validates and back-fills a stored `ScoringResult`; anything unusable returns `null`.
14. `localStorage` and `matchHistory` use it, validate that history is an array of entries, migrate the legacy `matchHistory` key to `resumeMatcher.matchHistory`, and retry a quota failure once after trimming the oldest entry. Saves report success so the UI can say when storage is full.
15. `handleClearAll` refreshes the history panel; a failed history write shows a toast.

### Phase 4: extraction quality
16. Export `groupTextItemsIntoLines`, a pure, testable line reconstruction using PDF text-item transforms; use it so PDFs keep line breaks.
17. Return actionable errors for image-only PDFs and empty DOCX files.

### Phase 5: UX and accessibility
18. Stale-results notice with a "re-analyze" action when inputs diverge from the analysed pair.
19. 200k character per-field analysis guard with a clear message.
20. Dismissible restore notice, `Ctrl/⌘` hint, reduced-motion-aware scrolling, Escape-to-close history.
21. Share errors handled; TXT download added (the plain-text report builder was already there but unreachable); unique toast ids; re-selectable file input.

### Phase 6: verification
22. Unit tests for the new scoring invariants (weights sum to 100, empty job post scores 0, synonym matches raise the keyword score, no free points), skill false-positive regressions, tokenizer, repeated-phrase de-duplication, result schema, PDF line grouping, history corruption.
23. `tsc --noEmit`, `jest`, `eslint`, `next build`.

---

## 4. Deliberately not done in this change set

- **Splitting `page.tsx` (648 lines) into section components.** Mechanical refactor with no
  behaviour change and a large diff; better as its own change with a visual review.
- **Moving analysis into a Web Worker.** The right long-term fix for responsiveness, but it
  requires a worker build config and a message protocol; the input cap removes the freeze
  risk for now.
- **Component/E2E tests.** The repo has no component test harness beyond jsdom and
  Testing Library, which are installed but unused; the logic tests give the better return.
- **CSP tightening (`unsafe-eval`).** Next's dev toolchain still needs it; a nonce-based
  policy belongs with a deployment change.
- **Dependencies.** No upgrades; the lockfile is preserved.
