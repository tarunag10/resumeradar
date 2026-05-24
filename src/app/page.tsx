'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { TextInput } from '@/components/TextInput';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { FAQ } from '@/components/FAQ';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toast, useToast } from '@/components/Toast';
import { MatchHistory } from '@/components/MatchHistory';
import { analyzeMatch } from '@/lib/scoring';
import { ScoringResult } from '@/lib/scoring';
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

const MIN_TEXT_LENGTH = 100;
const graphicTransforms = {
  logo: 'translate(0, 0)',
  compare: 'translate(-50%, 0)',
  privacy: 'translate(0, -50%)',
  empty: 'translate(-50%, -50%)',
} as const;

function GraphicCrop({
  variant,
  alt,
  className = '',
  priority = false,
}: {
  variant: keyof typeof graphicTransforms;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`graphic-crop ${className}`}>
      <Image
        src='/assets/resumeradar-graphics.png'
        alt={alt}
        fill
        sizes='(max-width: 768px) 90vw, 520px'
        priority={priority}
        className='graphic-crop__image'
        style={{ transform: graphicTransforms[variant] }}
      />
    </div>
  );
}

function ReadinessItem({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div className='rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2'>
      <div className='flex items-center gap-2'>
        <span className={`h-2 w-2 rounded-full ${ready ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
        <span className='text-xs font-medium text-[var(--foreground)]'>{label}</span>
      </div>
      <p className='mt-1 text-xs text-[var(--muted)]'>{value}</p>
    </div>
  );
}

function TrustMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className='min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3'>
      <p className='text-lg font-semibold text-[var(--foreground)]'>{value}</p>
      <p className='mt-0.5 text-xs text-[var(--muted)]'>{label}</p>
    </div>
  );
}

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobPostText, setJobPostText] = useState('');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const savedResume = getResumeText();
    const savedJobPost = getJobPostText();
    const { result: savedResult, timestamp } = getLastResult();

    if (savedResume || savedJobPost) {
      setResumeText(savedResume);
      setJobPostText(savedJobPost);
      if (savedResult && timestamp) {
        setResult(savedResult);
        setShowRestoreNotice(true);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveResumeText(resumeText);
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveJobPostText(jobPostText);
    }, 500);
    return () => clearTimeout(timer);
  }, [jobPostText]);

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

  const handleAnalyze = useCallback(() => {
    if (resumeText.trim().length < MIN_TEXT_LENGTH) {
      setError('Paste more resume text for a useful comparison.');
      return;
    }
    if (jobPostText.trim().length < MIN_TEXT_LENGTH) {
      setError('Paste more of the job post for a useful comparison.');
      return;
    }
    if (resumeText.trim() === jobPostText.trim()) {
      setError('These look identical. Paste your resume on the left and the job post on the right.');
      return;
    }

    setError(null);

    const analysisResult = analyzeMatch(resumeText, jobPostText);
    setResult(analysisResult);
    saveLastResult(analysisResult);
    saveMatchToHistory(resumeText, jobPostText, analysisResult);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [resumeText, jobPostText]);

  const handleLoadSample = useCallback(() => {
    const { resume, jobPost } = loadSampleData();
    setResumeText(resume);
    setJobPostText(jobPost);
    setError(null);
    setTimeout(() => {
      const analysisResult = analyzeMatch(resume, jobPost);
      setResult(analysisResult);
      saveResumeText(resume);
      saveJobPostText(jobPost);
      saveLastResult(analysisResult);
    }, 100);
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllData();
    clearMatchHistory();
    setResumeText('');
    setJobPostText('');
    setResult(null);
    setShowClearConfirm(true);
    setTimeout(() => setShowClearConfirm(false), 3000);
  }, []);

  const canAnalyze = resumeText.length >= MIN_TEXT_LENGTH && jobPostText.length >= MIN_TEXT_LENGTH;
  const resumeReady = resumeText.length >= MIN_TEXT_LENGTH;
  const jobReady = jobPostText.length >= MIN_TEXT_LENGTH;

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
    <div className='relative flex min-h-[100dvh] flex-col'>
      <div className='noise' />

      <header className='sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur-xl'>
        <nav className='mx-auto flex max-w-6xl items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <GraphicCrop variant='logo' alt='ResumeRadar logo' className='h-10 w-10 rounded-xl bg-white shadow-sm ring-1 ring-[var(--border)]' priority />
            <div>
              <p className='text-sm font-semibold leading-none text-[var(--foreground)]'>ResumeRadar</p>
              <p className='mt-1 hidden text-xs text-[var(--muted)] sm:block'>Private role matching</p>
            </div>
          </div>

          <div className='hidden items-center gap-6 md:flex'>
            <a href='#matcher' className='text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]'>Matcher</a>
            <a href='#results' className='text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]'>Results</a>
            <a href='#privacy' className='text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]'>Privacy</a>
            <a href='#faq' className='text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]'>FAQ</a>
          </div>

          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <MatchHistory />
            <button
              type='button'
              onClick={handleClearAll}
              className='rounded-lg px-3 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
              aria-label='Clear local data'
            >
              Clear
            </button>
          </div>
        </nav>
      </header>

      <main className='flex-1'>
        <section id='matcher' className='px-4 pb-10 pt-8 md:pb-16 md:pt-12'>
          <div className='mx-auto max-w-6xl'>
            <div className='mb-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-end'>
              <div>
                <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl'>
                  Match your resume to the role before you apply.
                </h1>
                <p className='mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-lg md:leading-7'>
                  Paste a resume and job post to find keyword overlap, missing skills, repeated phrases, and practical bullet ideas. Everything runs in this browser.
                </p>
              </div>

              <div className='overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] dark:bg-[var(--surface-strong)]'>
                <GraphicCrop variant='compare' alt='Resume and job post compared by a radar scan' className='aspect-[16/10]' priority />
                <div className='grid grid-cols-3 gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-2'>
                  <TrustMetric value='0' label='data uploaded' />
                  <TrustMetric value='100%' label='browser processing' />
                  <TrustMetric value='44' label='checks covered' />
                </div>
              </div>
            </div>

            {showRestoreNotice && (
              <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200' role='status'>
                Last comparison restored from this browser.
              </div>
            )}

            <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)] md:p-4'>
              <div className='grid gap-3 border-b border-[var(--border)] pb-3 md:grid-cols-3'>
                <ReadinessItem
                  label='Resume'
                  value={resumeReady ? 'Ready to compare' : `${Math.max(0, MIN_TEXT_LENGTH - resumeText.length)} more characters`}
                  ready={resumeReady}
                />
                <ReadinessItem
                  label='Job post'
                  value={jobReady ? 'Ready to compare' : `${Math.max(0, MIN_TEXT_LENGTH - jobPostText.length)} more characters`}
                  ready={jobReady}
                />
                <div className='rounded-xl border border-emerald-200 bg-[var(--soft-green)] px-3 py-2 dark:border-emerald-900/60'>
                  <div className='flex items-center gap-2'>
                    <svg className='h-4 w-4 text-emerald-600 dark:text-emerald-300' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.5-4.5A11.9 11.9 0 0112 3 11.9 11.9 0 013.5 5.5 12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1.2-.2-2.3-.5-3.5z' />
                    </svg>
                    <span className='text-xs font-medium text-emerald-800 dark:text-emerald-200'>Private analysis</span>
                  </div>
                  <p className='mt-1 text-xs text-emerald-700 dark:text-emerald-300'>No login, no upload, no external APIs.</p>
                </div>
              </div>

              <div className='grid gap-4 pt-4 lg:grid-cols-2'>
                <TextInput
                  label='Your resume'
                  placeholder={`Paste your resume text here. Include experience, skills, projects, and certifications for better results.\n\nExample:\nJohn Smith\nSenior Software Engineer\n\nExperience:\n- Led development of microservices architecture\n- Mentored junior developers\n- Improved code review process\n\nSkills:\nJavaScript, Python, AWS, Docker...`}
                  helperText='Paste resume text or upload PDF/DOCX.'
                  value={resumeText}
                  onChange={handleResumeChange}
                  onClear={handleClearResume}
                  onFileExtracted={() => handleFileExtracted('Resume')}
                />

                <TextInput
                  label='Job post'
                  placeholder={`Paste the job description, responsibilities, and requirements.\n\nExample:\nSenior Software Engineer\n\nWe need:\n- 5+ years experience with JavaScript\n- Experience with AWS and microservices\n- Strong problem-solving skills\n- Experience leading teams...`}
                  helperText='Paste the target role, responsibilities, and requirements.'
                  value={jobPostText}
                  onChange={handleJobPostChange}
                  onClear={handleClearJobPost}
                  onFileExtracted={() => handleFileExtracted('Job post')}
                />
              </div>

              {error && (
                <div className='mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200' role='alert'>
                  <svg className='h-4 w-4 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M12 9v3.5m0 3.5h.01M10.3 4.5h3.4L21 18H3L10.3 4.5z' />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className='mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 md:flex-row md:items-center md:justify-between'>
                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='button'
                    onClick={handleLoadSample}
                    className='rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                  >
                    Try sample
                  </button>
                  <span className='text-xs text-[var(--muted)]'>Works best with 100+ characters in each field.</span>
                </div>

                <div className='flex flex-col items-stretch gap-2 sm:flex-row sm:items-center'>
                  {canAnalyze && (
                    <span className='hidden text-xs text-[var(--muted)] sm:block'>
                      <kbd className='rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 font-mono'>Cmd</kbd> + <kbd className='rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 font-mono'>Enter</kbd>
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className={`btn-press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                      canAnalyze
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                        : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    <span>Analyze match</span>
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className='mt-5'>
              <PrivacyBadge />
            </div>

            {!isStorageAvailable && (
              <p className='mt-5 text-center text-sm text-amber-600 dark:text-amber-400'>
                Local saving is unavailable in this browser, but analysis still works.
              </p>
            )}
          </div>
        </section>

        {result ? (
          <section id='results' className='border-y border-[var(--border)] bg-[var(--surface)]/65 px-4 py-12 md:py-16' aria-live='polite'>
            <div className='mx-auto max-w-6xl'>
              <div className='mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300'>Match analysis</p>
                  <h2 className='mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]'>Turn the gaps into edits.</h2>
                </div>
                <p className='max-w-xl text-sm leading-6 text-[var(--muted)]'>
                  Use the score as a prioritization guide. The most useful changes are truthful, specific, and close to the language in the role.
                </p>
              </div>
              <ResultsDashboard result={result} />
            </div>
          </section>
        ) : (
          <section id='results' className='px-4 pb-12' aria-live='polite'>
            <div className='mx-auto max-w-6xl rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/65 p-6'>
              <div className='grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300'>Preview</p>
                  <h2 className='mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]'>Your analysis will appear here.</h2>
                  <p className='mt-2 text-sm text-[var(--muted)]'>Run a match to see score, matched keywords, missing skills, repeated phrases, and suggested bullets.</p>
                </div>
                <div className='overflow-hidden rounded-2xl border border-[var(--border)] bg-white dark:bg-[var(--surface-strong)]'>
                  <GraphicCrop variant='empty' alt='Document search illustration for empty match results' className='aspect-[16/8]' />
                </div>
              </div>
            </div>
          </section>
        )}

        <section id='privacy' className='px-4 py-16 md:py-20'>
          <div className='mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300'>Private by design</p>
              <h2 className='mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)]'>Your resume stays in your browser.</h2>
              <div className='mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] dark:bg-[var(--surface-strong)]'>
                <GraphicCrop variant='privacy' alt='Privacy shield protecting local resume documents' className='aspect-[16/9]' />
              </div>
            </div>
            <div className='grid gap-3 md:grid-cols-3'>
              {[
                ['No uploads', 'Files and text are processed locally.'],
                ['No account', 'Start comparing without signup.'],
                ['Clear anytime', 'Remove local saved text and history.'],
              ].map(([title, copy]) => (
                <div key={title} className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
                  <div className='mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--soft-green)] text-emerald-600 dark:text-emerald-300'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <h3 className='font-semibold text-[var(--foreground)]'>{title}</h3>
                  <p className='mt-2 text-sm leading-6 text-[var(--muted)]'>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id='how-it-works' className='border-y border-[var(--border)] bg-[var(--surface)]/55 px-4 py-16 md:py-20'>
          <div className='mx-auto max-w-6xl'>
            <div className='mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
              <h2 className='text-3xl font-bold tracking-tight text-[var(--foreground)]'>A faster tailoring loop.</h2>
              <p className='max-w-xl text-sm leading-6 text-[var(--muted)]'>Paste, compare, then turn the highest-signal gaps into honest resume edits before applying.</p>
            </div>
            <div className='grid gap-3 md:grid-cols-3'>
              {[
                ['01', 'Paste the source material', 'Add the resume and the role description you are targeting.'],
                ['02', 'Compare locally', 'ResumeRadar scores overlap and highlights missing language.'],
                ['03', 'Edit with intent', 'Use suggestions as starting points and keep every claim truthful.'],
              ].map(([step, title, copy]) => (
                <div key={step} className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
                  <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{step}</p>
                  <h3 className='mt-4 font-semibold text-[var(--foreground)]'>{title}</h3>
                  <p className='mt-2 text-sm leading-6 text-[var(--muted)]'>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id='faq' className='px-4 py-16 md:py-20'>
          <div className='mx-auto max-w-3xl'>
            <div className='mb-8 text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-[var(--foreground)]'>FAQ</h2>
              <p className='mt-2 text-sm text-[var(--muted)]'>Straight answers before you paste anything sensitive.</p>
            </div>
            <FAQ />
          </div>
        </section>
      </main>

      {showClearConfirm && (
        <div
          className='fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm text-[var(--background)] shadow-lg'
          role='status'
        >
          <svg className='h-4 w-4 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M5 13l4 4L19 7' />
          </svg>
          Local data cleared.
        </div>
      )}

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <footer className='border-t border-[var(--border)] px-4 py-8'>
        <div className='mx-auto flex max-w-6xl flex-col gap-2 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between'>
          <p>Built for private resume tailoring. Your text is processed locally.</p>
          <p>&copy; {new Date().getFullYear()} ResumeRadar</p>
        </div>
      </footer>
    </div>
  );
}
