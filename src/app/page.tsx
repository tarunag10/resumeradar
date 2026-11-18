'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TextInput } from '@/components/TextInput';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { FAQ } from '@/components/FAQ';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HeroDemo } from '@/components/HeroDemo';
import { Toast, useToast } from '@/components/Toast';
import { MatchHistory } from '@/components/MatchHistory';
import { analyzeMatch } from '@/lib/scoring';
import { RoleMode, ScoringResult } from '@/lib/scoring';
import {
  saveResumeText,
  getResumeText,
  saveJobPostText,
  getJobPostText,
  clearResumeText,
  clearJobPostText,
  saveLastResult,
  getLastResult,
  clearAllData,
  isStorageAvailable,
} from '@/lib/localStorage';
import { loadSampleData } from '@/lib/sampleData';
import { clearMatchHistory, saveMatchToHistory } from '@/lib/matchHistory';
import { parseStoredResult } from '@/lib/resultSchema';

// Analysis is synchronous on the main thread; a hard cap keeps a pasted document from
// freezing the tab without telling the user why.
const MAX_FIELD_LENGTH = 200_000;
const MIN_FIELD_LENGTH = 100;

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#tool', label: 'Matcher' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
];

const STEPS = [
  {
    title: 'Paste both texts',
    body: 'Your resume and the job post you are targeting. Files stay on your device too.',
  },
  {
    title: 'Read the radar',
    body: 'A weighted match score, the terms you already share, and the gaps worth closing.',
  },
  {
    title: 'Tailor honestly',
    body: 'Rewrite with the suggested bullets, then export the report for your own notes.',
  },
];

interface AnalyzedInputs {
  resumeText: string;
  jobPostText: string;
  roleMode: RoleMode;
}

function scrollToResults() {
  const target = document.getElementById('results');
  if (!target) return;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function RadarMark() {
  return (
    <span
      className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)]'
      aria-hidden='true'
    >
      <svg viewBox='0 0 32 32' className='h-6 w-6'>
        <circle cx='16' cy='16' r='11' fill='none' stroke='var(--border-strong)' strokeWidth='0.9' />
        <circle cx='16' cy='16' r='6' fill='none' stroke='var(--track)' strokeWidth='0.9' />
        <g className='radar-sweep' style={{ transformOrigin: '16px 16px' }}>
          <path d='M16 16 L16 5 A11 11 0 0 1 25.5 10.5 Z' fill='var(--accent)' opacity='0.22' />
          <line x1='16' y1='16' x2='16' y2='5' stroke='var(--accent)' strokeWidth='1.1' />
        </g>
        <circle cx='21' cy='12' r='1.7' fill='var(--accent)' />
      </svg>
    </span>
  );
}

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobPostText, setJobPostText] = useState('');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [roleMode, setRoleMode] = useState<RoleMode>('general');
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [analyzedInputs, setAnalyzedInputs] = useState<AnalyzedInputs | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toolInView, setToolInView] = useState(true);
  const storageWarningShown = useRef(false);
  const resumeRef = useRef<HTMLTextAreaElement>(null);
  const jobRef = useRef<HTMLTextAreaElement>(null);
  const analyzeTimer = useRef<number | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setStorageAvailable(isStorageAvailable());
    const savedResume = getResumeText();
    const savedJobPost = getJobPostText();
    const { result: savedResult, timestamp } = getLastResult();

    if (savedResume || savedJobPost) {
      setResumeText(savedResume);
      setJobPostText(savedJobPost);

      const restoredResult = parseStoredResult(savedResult);

      if (restoredResult && timestamp) {
        const restoredRoleMode = restoredResult.roleMode || 'general';
        setResult(restoredResult);
        setRoleMode(restoredRoleMode);
        setAnalyzedInputs({ resumeText: savedResume, jobPostText: savedJobPost, roleMode: restoredRoleMode });
        setShowRestoreNotice(true);
      }
    }
  }, []);

  // Autosave with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = saveResumeText(resumeText);
      if (!saved && resumeText && storageAvailable && !storageWarningShown.current) {
        storageWarningShown.current = true;
        addToast('Local storage is full, so your text will not be kept after reload.', 'error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeText, storageAvailable, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = saveJobPostText(jobPostText);
      if (!saved && jobPostText && storageAvailable && !storageWarningShown.current) {
        storageWarningShown.current = true;
        addToast('Local storage is full, so your text will not be kept after reload.', 'error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [jobPostText, storageAvailable, addToast]);

  useEffect(() => {
    return () => {
      if (analyzeTimer.current) window.clearTimeout(analyzeTimer.current);
    };
  }, []);

  useEffect(() => {
    const node = document.getElementById('tool');
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => setToolInView(entries[0]?.isIntersecting ?? true),
      { rootMargin: '-15% 0px -45% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleResumeChange = useCallback((value: string) => {
    setResumeText(value);
    setError(null);
  }, []);

  const handleJobPostChange = useCallback((value: string) => {
    setJobPostText(value);
    setError(null);
  }, []);

  const handleClearResume = useCallback(() => {
    setResumeText('');
    clearResumeText();
  }, []);

  const handleClearJobPost = useCallback(() => {
    setJobPostText('');
    clearJobPostText();
  }, []);

  const handleFileExtracted = useCallback((field: string) => {
    addToast(`${field} text extracted from file`, 'success');
  }, [addToast]);

  const focusTool = useCallback((field: 'resume' | 'job' = 'resume') => {
    const target = document.getElementById('tool');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    const textarea = field === 'resume' ? resumeRef.current : jobRef.current;
    window.setTimeout(() => textarea?.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (resumeText.length > MAX_FIELD_LENGTH || jobPostText.length > MAX_FIELD_LENGTH) {
      setError(`Each field is limited to ${MAX_FIELD_LENGTH.toLocaleString()} characters. Trim the text and try again.`);
      return;
    }
    if (resumeText.trim().length < MIN_FIELD_LENGTH) {
      setError(`Add at least ${MIN_FIELD_LENGTH} characters of resume text so there is something to compare.`);
      resumeRef.current?.focus();
      return;
    }
    if (jobPostText.trim().length < MIN_FIELD_LENGTH) {
      setError(`Add at least ${MIN_FIELD_LENGTH} characters of job post text so there is something to compare.`);
      jobRef.current?.focus();
      return;
    }
    if (resumeText.trim() === jobPostText.trim()) {
      setError('These look identical. Paste your resume on the left and the job post on the right.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    // A short, deliberate delay gives the scan state a moment to read as work happening.
    analyzeTimer.current = window.setTimeout(() => {
      const analysisResult = analyzeMatch(resumeText, jobPostText, roleMode);
      setResult(analysisResult);
      setAnalyzedInputs({ resumeText, jobPostText, roleMode });
      setShowRestoreNotice(false);
      saveLastResult(analysisResult);

      if (!saveMatchToHistory(resumeText, jobPostText, analysisResult) && storageAvailable) {
        addToast('Analysis ran, but it could not be added to history (local storage is full).', 'error');
      }

      setHistoryRefresh(value => value + 1);
      setIsAnalyzing(false);
      scrollToResults();
    }, 360);
  }, [resumeText, jobPostText, roleMode, addToast, storageAvailable]);

  const handleLoadSample = useCallback(() => {
    if (resumeText.trim().length > 0 || jobPostText.trim().length > 0) {
      addToast('Your own text is still in the form. Clear a field first to load the sample.', 'info');
      focusTool('resume');
      return;
    }

    const { resume, jobPost } = loadSampleData();
    setResumeText(resume);
    setJobPostText(jobPost);
    setError(null);
    setRoleMode('general');

    const analysisResult = analyzeMatch(resume, jobPost, 'general');
    setResult(analysisResult);
    setAnalyzedInputs({ resumeText: resume, jobPostText: jobPost, roleMode: 'general' });
    setShowRestoreNotice(false);
    saveResumeText(resume);
    saveJobPostText(jobPost);
    addToast('Sample match loaded. Nothing was added to your history.', 'info');
    window.setTimeout(scrollToResults, 120);
  }, [resumeText, jobPostText, addToast, focusTool]);

  const handleClearAll = useCallback(() => {
    clearAllData();
    clearMatchHistory();
    setResumeText('');
    setJobPostText('');
    setResult(null);
    setAnalyzedInputs(null);
    setShowRestoreNotice(false);
    setHistoryRefresh(value => value + 1);
    setShowClearConfirm(true);
    window.setTimeout(() => setShowClearConfirm(false), 3000);
  }, []);

  const handleRestoreHistory = useCallback((entry: { resumeText: string; jobPostText: string; result: ScoringResult }) => {
    const restoredResult = parseStoredResult(entry.result);

    if (!entry.resumeText || !entry.jobPostText || !restoredResult) {
      addToast('This older history item cannot be restored', 'error');
      return;
    }

    setResumeText(entry.resumeText);
    setJobPostText(entry.jobPostText);
    setResult(restoredResult);
    const restoredRoleMode = restoredResult.roleMode || 'general';
    setRoleMode(restoredRoleMode);
    setAnalyzedInputs({ resumeText: entry.resumeText, jobPostText: entry.jobPostText, roleMode: restoredRoleMode });
    saveResumeText(entry.resumeText);
    saveJobPostText(entry.jobPostText);
    saveLastResult(restoredResult);
    setShowRestoreNotice(true);
    addToast('History match restored', 'success');
    window.setTimeout(scrollToResults, 120);
  }, [addToast]);

  const canAnalyze = resumeText.trim().length >= MIN_FIELD_LENGTH && jobPostText.trim().length >= MIN_FIELD_LENGTH;
  const resumeNeeded = Math.max(0, MIN_FIELD_LENGTH - resumeText.trim().length);
  const jobNeeded = Math.max(0, MIN_FIELD_LENGTH - jobPostText.trim().length);

  const analyzeHint = resumeNeeded > 0 && jobNeeded > 0
    ? `${resumeNeeded} more characters of resume and ${jobNeeded} of job post needed.`
    : resumeNeeded > 0
      ? `${resumeNeeded} more characters of resume needed.`
      : jobNeeded > 0
        ? `${jobNeeded} more characters of job post needed.`
        : 'Ready. Ctrl or Cmd + Enter also runs the match.';

  const isStale = Boolean(
    result &&
    analyzedInputs &&
    (resumeText !== analyzedInputs.resumeText ||
      jobPostText !== analyzedInputs.jobPostText ||
      roleMode !== analyzedInputs.roleMode)
  );

  const reportInputs = analyzedInputs ?? { resumeText, jobPostText, roleMode };
  const showMobileBar = !toolInView && (resumeText.length > 0 || jobPostText.length > 0) && (!result || isStale);
  const progress = Math.min(
    100,
    Math.round(((Math.min(resumeText.trim().length, MIN_FIELD_LENGTH) + Math.min(jobPostText.trim().length, MIN_FIELD_LENGTH)) / (MIN_FIELD_LENGTH * 2)) * 100)
  );

  // Keyboard shortcut (Cmd/Ctrl + Enter to analyze)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canAnalyze) {
          handleAnalyze();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canAnalyze, handleAnalyze]);

  return (
    <div className={`relative flex min-h-[100dvh] flex-col ${showMobileBar ? 'pb-24 md:pb-0' : ''}`}>
      <a
        href='#tool'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[var(--foreground)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--background)]'
      >
        Skip to the matcher
      </a>

      {/* Header */}
      <header className='sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--blur-bg)] backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center gap-2 px-4 py-3'>
          <a href='#top' className='flex items-center gap-2.5'>
            <RadarMark />
            <span className='font-display text-xl tracking-tight'>ResumeRadar</span>
          </a>

          <nav aria-label='Sections' className='ml-6 hidden items-center gap-0.5 md:flex'>
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className='rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className='ml-auto flex items-center gap-1.5'>
            <ThemeToggle />
            <MatchHistory onSelectEntry={handleRestoreHistory} refreshSignal={historyRefresh} />
            <button
              type='button'
              onClick={handleClearAll}
              className='btn-quiet hidden text-xs sm:inline-flex'
              aria-label='Clear local data'
            >
              Clear data
            </button>
          </div>
        </div>

        <nav aria-label='Sections, compact' className='mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 md:hidden'>
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className='shrink-0 rounded-full px-3 py-1 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main className='flex-1'>
        {/* Hero */}
        <section id='top' className='px-4 pb-14 pt-10 md:pb-20 md:pt-16'>
          <div className='mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-12'>
            <div className='lg:col-span-5'>
              <p className='mono-label'>Local match report</p>
              <h1 className='font-display mt-4 text-[2.6rem] leading-[1.02] sm:text-5xl lg:text-[3.4rem]'>
                Match your resume to <em className='italic text-[var(--accent)]'>any job post</em> in seconds.
              </h1>
              <p className='mt-5 max-w-[46ch] text-base leading-relaxed text-[var(--muted)] md:text-lg'>
                Paste both texts and get one clear read: the score, the language you already share, the gaps worth closing, and bullets that sound like you.
              </p>

              <div className='mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center'>
                <button type='button' onClick={() => focusTool('resume')} className='btn btn-primary'>
                  Match my resume
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </button>
                <button type='button' onClick={handleLoadSample} className='btn btn-ghost'>
                  Try a sample
                </button>
              </div>

              <PrivacyBadge className='mt-5' />
            </div>

            <div className='lg:col-span-7'>
              <HeroDemo onTrySample={handleLoadSample} />
            </div>
          </div>
        </section>

        {/* Restore Notice */}
        {showRestoreNotice && (
          <div className='mx-auto mb-4 max-w-5xl px-4' role='status'>
            <div className='flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--warn-soft)] px-4 py-2.5'>
              <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warn)]' aria-hidden='true' />
              <span className='text-xs text-[var(--warn)]'>Last comparison restored from this browser</span>
              <button
                type='button'
                onClick={() => setShowRestoreNotice(false)}
                className='ml-auto rounded-md p-1 text-[var(--warn)] opacity-70 transition-opacity hover:opacity-100'
                aria-label='Dismiss restore notice'
              >
                <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div
          className={`pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:items-end ${showMobileBar ? 'bottom-24 md:bottom-6' : 'bottom-4 md:bottom-6'}`}
          aria-live='polite'
        >
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
          {showClearConfirm && (
            <div className='pointer-events-auto flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--foreground)] px-3.5 py-2.5 text-xs font-medium text-[var(--background)] shadow-[var(--shadow-md)]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[var(--accent)]' aria-hidden='true' />
              Local data cleared.
            </div>
          )}
        </div>

        {/* Tool */}
        <section id='tool' className='scroll-mt-28 border-t border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-12 md:scroll-mt-24 md:py-16'>
          <div className='mx-auto max-w-5xl'>
            <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
              <div>
                <p className='mono-label'>The matcher</p>
                <h2 className='font-display mt-2 text-3xl md:text-4xl'>Two texts in, one clear read.</h2>
              </div>
              <button type='button' onClick={handleLoadSample} className='btn-quiet text-xs'>
                Load the sample instead
              </button>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='card p-5'>
                <TextInput
                  label='Your resume'
                  placeholder={`Paste your resume text: experience, skills, projects, certifications.\n\nExample:\nJohn Smith - Senior Software Engineer\n- Led migration of the billing service to AWS\n- Mentored three engineers, cut review time 30%\n- Skills: TypeScript, Python, PostgreSQL, Docker`}
                  helperText='Paste text, or drop a PDF or DOCX.'
                  value={resumeText}
                  onChange={handleResumeChange}
                  onClear={handleClearResume}
                  onFileExtracted={() => handleFileExtracted('Resume')}
                  inputRef={resumeRef}
                />
              </div>

              <div className='card p-5'>
                <TextInput
                  label='Job post'
                  placeholder={`Paste the job description: responsibilities, requirements, nice-to-haves.\n\nExample:\nSenior Software Engineer\n- 5+ years with TypeScript and Node\n- Experience running services on AWS\n- Strong collaboration with product teams`}
                  helperText='Paste the role you are targeting.'
                  value={jobPostText}
                  onChange={handleJobPostChange}
                  onClear={handleClearJobPost}
                  onFileExtracted={() => handleFileExtracted('Job post')}
                  inputRef={jobRef}
                />
              </div>
            </div>

            {error && (
              <div
                className='mt-4 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--danger-soft)] px-4 py-3'
                role='alert'
              >
                <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]' aria-hidden='true' />
                <span className='text-sm text-[var(--danger)]'>{error}</span>
              </div>
            )}

            <div className='mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
              <div className='flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3'>
                <label htmlFor='role-mode' className='mono-label'>
                  Role mode
                </label>
                <select
                  id='role-mode'
                  value={roleMode}
                  onChange={event => setRoleMode(event.target.value as RoleMode)}
                  className='w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 sm:w-56'
                >
                  <option value='general'>General</option>
                  <option value='software'>Software</option>
                  <option value='data'>Data</option>
                  <option value='product'>Product</option>
                  <option value='marketing'>Marketing</option>
                  <option value='legal'>Legal / Compliance</option>
                  <option value='finance'>Finance</option>
                </select>
              </div>

              <div className='flex flex-col items-stretch gap-1.5 sm:items-end'>
                <button
                  type='button'
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isAnalyzing}
                  aria-describedby='analyze-hint'
                  className='btn btn-primary w-full sm:w-auto'
                >
                  {isAnalyzing ? (
                    <>
                      <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
                      Scanning
                    </>
                  ) : (
                    <>
                      Analyze match
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                      </svg>
                    </>
                  )}
                </button>
                <p id='analyze-hint' className='text-center text-[0.7rem] text-[var(--muted)] sm:text-right'>
                  {analyzeHint}
                </p>
              </div>
            </div>

            {!storageAvailable && (
              <p className='mt-3 text-center text-xs text-[var(--warn)]'>
                Local saving is unavailable in this browser, but analysis still works.
              </p>
            )}
          </div>
        </section>

        {/* Results */}
        {result && (
          <section id='results' className='scroll-mt-24 px-4 py-12 md:py-16'>
            <div className='mx-auto max-w-5xl'>
              <div className='mb-5 flex flex-wrap items-end justify-between gap-3'>
                <div>
                  <p className='mono-label'>Your report</p>
                  <h2 className='font-display mt-2 text-3xl md:text-4xl'>Match analysis</h2>
                </div>
                <p className='text-xs text-[var(--muted)]'>
                  {reportInputs.resumeText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} resume words vs{' '}
                  {reportInputs.jobPostText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} job-post words
                </p>
              </div>

              {isStale && (
                <div
                  className='mb-4 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--warn-soft)] px-4 py-3 sm:flex-row sm:items-center'
                  role='status'
                >
                  <span className='text-sm text-[var(--warn)]'>
                    Your inputs changed since this analysis, so the score below is out of date.
                  </span>
                  <button
                    type='button'
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className='btn btn-ghost shrink-0 px-3 py-1.5 text-xs text-[var(--warn)] sm:ml-auto'
                  >
                    Re-analyze
                  </button>
                </div>
              )}

              <ResultsDashboard
                result={result}
                resumeText={reportInputs.resumeText}
                jobPostText={reportInputs.jobPostText}
              />
            </div>
          </section>
        )}

        {/* How it works */}
        <section id='how-it-works' className='scroll-mt-24 border-t border-[var(--border)] px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-5xl'>
            <div className='max-w-2xl'>
              <p className='mono-label'>How it works</p>
              <h2 className='font-display mt-2 text-3xl md:text-4xl'>No upload. No account. No waiting.</h2>
            </div>

            <div className='mt-8 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-3'>
              {STEPS.map((step, index) => (
                <div key={step.title} className='bg-[var(--surface)] p-6'>
                  <span className='font-mono text-xs tabular text-[var(--accent)]'>0{index + 1}</span>
                  <h3 className='font-display mt-3 text-xl'>{step.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-[var(--muted)]'>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id='privacy' className='scroll-mt-24 border-t border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-14 md:py-20'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between'>
            <div className='max-w-xl'>
              <p className='mono-label'>Privacy</p>
              <h2 className='font-display mt-2 text-3xl md:text-4xl'>Your text stays on this device.</h2>
              <p className='mt-3 text-sm leading-relaxed text-[var(--muted)]'>
                The analysis runs in your browser. Nothing is sent anywhere, and localStorage is the only place your text is kept - clear it whenever you like.
              </p>
            </div>

            <dl className='grid shrink-0 gap-2.5 font-mono text-xs md:min-w-64'>
              {[
                ['Processing', 'in this tab'],
                ['Uploads', 'none'],
                ['Accounts', 'none'],
                ['Storage', 'localStorage only'],
              ].map(([term, value]) => (
                <div key={term} className='flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-2 last:border-b-0'>
                  <dt className='text-[var(--muted)]'>{term}</dt>
                  <dd className='text-[var(--foreground)]'>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* FAQ */}
        <section id='faq' className='scroll-mt-24 border-t border-[var(--border)] px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-3xl'>
            <p className='mono-label'>Questions</p>
            <h2 className='font-display mt-2 text-3xl md:text-4xl'>FAQ</h2>
            <div className='mt-6'>
              <FAQ />
            </div>
          </div>
        </section>

        {/* Context */}
        <section className='border-t border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-14 md:py-16'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='font-display text-2xl md:text-3xl'>Why keyword matching matters</h2>
            <div className='mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted)]'>
              <p>
                Job descriptions repeat the skills, tools, and responsibilities that matter. When your resume speaks the same language, recruiters and screening systems can see the connection faster.
              </p>
              <p>
                This tool points at the gaps so you can make honest, targeted edits before applying. It is a guide, not a gatekeeper.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className='border-t border-[var(--border)] px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='font-display text-3xl md:text-4xl'>Ready to see your gaps?</h2>
            <p className='mx-auto mt-3 max-w-[46ch] text-sm text-[var(--muted)]'>
              Paste your resume and a job post to get the score in a few seconds.
            </p>
            <button type='button' onClick={() => focusTool('resume')} className='btn btn-primary mx-auto mt-6'>
              Start matching
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M12 19V5m0 0l-6 6m6-6l6 6' />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Mobile analyze bar */}
      {showMobileBar && (
        <div className='fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--blur-bg)] px-4 py-3 backdrop-blur md:hidden'>
          <div className='flex items-center gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='h-1 w-full overflow-hidden rounded-full bg-[var(--track)]'>
                <div className='h-full rounded-full bg-[var(--accent)] transition-[width]' style={{ width: `${progress}%` }} />
              </div>
              <p className='mt-1.5 truncate text-[0.7rem] text-[var(--muted)]'>{analyzeHint}</p>
            </div>
            <button
              type='button'
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className='btn btn-primary shrink-0 px-4 py-2.5 text-xs'
            >
              {isAnalyzing ? 'Scanning' : 'Analyze'}
            </button>
          </div>
        </div>
      )}

      <footer className='border-t border-[var(--border)] px-4 py-8'>
        <div className='mx-auto flex max-w-5xl flex-col items-center gap-2 text-center'>
          <p className='font-mono text-[0.6875rem] text-[var(--muted)]'>processed locally / nothing uploaded</p>
          <p className='text-xs text-[var(--muted)]'>
            Built by <span className='font-medium text-[var(--foreground)]'>Code Counsel</span> - more apps at{' '}
            <a
              href='https://code-counsel.vercel.app'
              target='_blank'
              rel='noreferrer'
              className='link-underline font-medium text-[var(--foreground)]'
            >
              code-counsel.vercel.app
            </a>
          </p>
          <p className='text-xs text-[var(--muted)]'>&copy; {new Date().getFullYear()} ResumeRadar</p>
        </div>
      </footer>
    </div>
  );
}
