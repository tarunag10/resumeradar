'use client';

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

  // Autosave with debounce
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
    if (!resumeText.trim()) {
      setError('Paste more resume text for a useful comparison.');
      return;
    }
    if (resumeText.trim().length < 100) {
      setError('Paste more resume text for a useful comparison.');
      return;
    }
    if (!jobPostText.trim()) {
      setError('Paste more of the job post for a useful comparison.');
      return;
    }
    if (jobPostText.trim().length < 100) {
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

  const canAnalyze = resumeText.length >= 100 && jobPostText.length >= 100;

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
    <div className='min-h-[100dvh] flex flex-col relative'>
      {/* Noise texture overlay */}
      <div className='noise' />
      
      {/* Header - Floating glass pill nav */}
      <header className='sticky top-0 z-50 px-4 pt-6 pb-4'>
        <nav className='max-w-5xl mx-auto'>
          <div className='card-bezel'>
            <div className='card-bezel-inner px-5 py-3 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 bg-[var(--foreground)] rounded-xl flex items-center justify-center'>
                  <svg className='w-5 h-5 text-[var(--background)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <span className='font-display font-semibold text-[var(--foreground)] tracking-tight'>ResumeRadar</span>
              </div>
              
              <div className='hidden md:flex items-center gap-8'>
                <a href='#how-it-works' className='text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors'>How it works</a>
                <a href='#features' className='text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors'>Features</a>
                <a href='#privacy' className='text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors'>Privacy</a>
                <a href='#faq' className='text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors'>FAQ</a>
              </div>
              
              <div className='flex items-center gap-2'>
                <ThemeToggle />
                <MatchHistory />
                <button
                  type='button'
                  onClick={handleClearAll}
                  className='text-xs text-[var(--muted)] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--border)]'
                  aria-label='Clear local data'
                >
                  Clear data
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className='flex-1'>
        {/* Hero Section - Asymmetric layout */}
        <section className='relative px-4 pt-16 pb-24 md:pt-24 md:pb-32'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid lg:grid-cols-5 gap-12 items-center'>
              {/* Left content - asymmetric */}
              <div className='lg:col-span-3 space-y-8'>
                {/* Eyebrow */}
                <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                  <span className='text-xs text-[var(--muted)] uppercase tracking-wider'>100% Private & Local</span>
                </div>
                
                {/* Headline - dramatic typography */}
                <h1 className='font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[var(--foreground)]'>
                  Match your resume to any job post
                  <span className='block mt-2 text-[var(--muted)]'>in seconds.</span>
                </h1>
                
                {/* Subheadline */}
                <p className='text-lg text-[var(--muted)] max-w-[50ch] leading-relaxed'>
                  Paste your resume and a job description to find keyword overlap, missing skills, and stronger bullet ideas. No upload, no login.
                </p>
                
                {/* CTA */}
                <div className='flex flex-wrap items-center gap-4'>
                  <button
                    type='button'
                    onClick={handleLoadSample}
                    className='group btn-press inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium hover:opacity-90 transition-opacity'
                  >
                    <span>Try sample match</span>
                    <svg className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                    </svg>
                  </button>
                  <PrivacyBadge />
                </div>
              </div>
              
              {/* Right side - decorative stats bento */}
              <div className='lg:col-span-2 grid grid-cols-2 gap-3'>
                <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                  <div className='card-bezel-inner p-4 text-center'>
                    <p className='font-display text-3xl font-bold text-[var(--foreground)]'>0</p>
                    <p className='text-xs text-[var(--muted)] mt-1'>Data uploaded</p>
                  </div>
                </div>
                <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                  <div className='card-bezel-inner p-4 text-center'>
                    <p className='font-display text-3xl font-bold text-[var(--foreground)]'>100%</p>
                    <p className='text-xs text-[var(--muted)] mt-1'>Browser processing</p>
                  </div>
                </div>
                <div className='col-span-2 card-bezel p-4 animate-fade-up' style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                  <div className='card-bezel-inner p-4 text-center'>
                    <p className='font-display text-2xl font-bold text-[var(--foreground)]'>Instant Results</p>
                    <p className='text-xs text-[var(--muted)] mt-1'>No waiting, no servers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restore Notice */}
        {showRestoreNotice && (
          <div className='mx-4 mb-6 max-w-5xl mx-auto' role='status'>
            <div className='px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20 flex items-center gap-3'>
              <svg className='w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='text-sm text-amber-800 dark:text-amber-200'>Last comparison restored from this browser</span>
            </div>
          </div>
        )}

        {/* Clear Confirm Toast */}
        {showClearConfirm && (
          <div
            className='fixed bottom-6 right-6 px-4 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl shadow-lg text-sm flex items-center gap-2 z-50 btn-press'
            role='status'
          >
            <svg className='w-4 h-4 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
            </svg>
            Local data cleared.
          </div>
        )}

        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Input Panel - Bento grid layout */}
        <section id='features' className='px-4 py-16 md:py-24 scroll-mt-24'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='card-bezel animate-fade-up' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className='card-bezel-inner p-6'>
                  <TextInput
                    label='Your resume'
                    placeholder={`Paste your resume text here. Include experience, skills, projects, and certifications for better results.\n\nExample:\nJohn Smith\nSenior Software Engineer\n\nExperience:\n- Led development of microservices architecture\n- Mentored junior developers\n- Improved code review process\n\nSkills:\nJavaScript, Python, AWS, Docker...`}
                    helperText='Paste your resume text. It stays in this browser.'
                    value={resumeText}
                    onChange={handleResumeChange}
                    onClear={handleClearResume}
                    onFileExtracted={() => handleFileExtracted('Resume')}
                  />
                </div>
              </div>
              
              <div className='card-bezel animate-fade-up' style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className='card-bezel-inner p-6'>
                  <TextInput
                    label='Job post'
                    placeholder={`Paste the job description, responsibilities, and requirements.\n\nExample:\nSenior Software Engineer\n\nWe need:\n- 5+ years experience with JavaScript\n- Experience with AWS and microservices\n- Strong problem-solving skills\n- Experience leading teams...`}
                    helperText='Paste the role description, responsibilities, and requirements.'
                    value={jobPostText}
                    onChange={handleJobPostChange}
                    onClear={handleClearJobPost}
                    onFileExtracted={() => handleFileExtracted('Job post')}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='mt-6 p-4 rounded-xl border border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 flex items-center gap-3 animate-fade-up' role='alert'>
                <svg className='w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span className='text-sm text-red-700 dark:text-red-300'>{error}</span>
              </div>
            )}

            {/* Analyze Button - Centered with keyboard hint */}
            <div className='flex flex-col items-center gap-3 mt-8 animate-fade-up' style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <button
                type='button'
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`btn-press group inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-full transition-all ${
                  canAnalyze
                    ? 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
                    : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                }`}
              >
                <span>Analyze match</span>
                <svg className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </button>
              {canAnalyze && (
                <span className='text-xs text-[var(--muted)]'>
                  or press <kbd className='font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)]'>⌘</kbd> + <kbd className='font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)]'>Enter</kbd>
                </span>
              )}
            </div>

            {/* Storage Notice */}
            {!isStorageAvailable && (
              <p className='mt-6 text-center text-sm text-amber-600 dark:text-amber-400'>
                Local saving is unavailable in this browser, but analysis still works.
              </p>
            )}
          </div>
        </section>

        {/* Results Section - Bento grid dashboard */}
        {result && (
          <section id='results' className='px-4 py-16 md:py-24 bg-[var(--surface)]/50' aria-live='polite'>
            <div className='max-w-5xl mx-auto'>
              <div className='text-center mb-12 animate-fade-up'>
                <span className='inline-block text-xs text-[var(--muted)] uppercase tracking-wider mb-3'>Your Results</span>
                <h2 className='font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]'>
                  Match Analysis
                </h2>
                <p className='text-[var(--muted)] mt-2'>Based on your resume and job post comparison</p>
              </div>
              <ResultsDashboard result={result} />
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section id='how-it-works' className='px-4 py-24 md:py-32 scroll-mt-24'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-16 animate-fade-up'>
              <span className='inline-block text-xs text-[var(--muted)] uppercase tracking-wider mb-3'>Simple Process</span>
              <h2 className='font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]'>
                How it works
              </h2>
            </div>
            
            <div className='grid md:grid-cols-3 gap-6'>
              <div className='card-bezel p-5 animate-fade-up' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className='card-bezel-inner p-6'>
                  <span className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] font-display font-bold text-sm mb-4'>1</span>
                  <h3 className='font-display font-semibold text-[var(--foreground)] mb-2'>Paste your text</h3>
                  <p className='text-sm text-[var(--muted)] leading-relaxed'>Add your resume and the job description you are targeting.</p>
                </div>
              </div>
              
              <div className='card-bezel p-5 animate-fade-up' style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className='card-bezel-inner p-6'>
                  <span className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] font-display font-bold text-sm mb-4'>2</span>
                  <h3 className='font-display font-semibold text-[var(--foreground)] mb-2'>Analyze locally</h3>
                  <p className='text-sm text-[var(--muted)] leading-relaxed'>Click analyze and watch the algorithm compare your text instantly.</p>
                </div>
              </div>
              
              <div className='card-bezel p-5 animate-fade-up' style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                <div className='card-bezel-inner p-6'>
                  <span className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] font-display font-bold text-sm mb-4'>3</span>
                  <h3 className='font-display font-semibold text-[var(--foreground)] mb-2'>Improve and apply</h3>
                  <p className='text-sm text-[var(--muted)] leading-relaxed'>Review suggestions and copy bullets that help you tailor your resume.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section id='privacy' className='px-4 py-24 md:py-32 bg-[var(--surface)]/50 scroll-mt-24'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-12 animate-fade-up'>
              <span className='inline-block text-xs text-[var(--muted)] uppercase tracking-wider mb-3'>Your Data</span>
              <h2 className='font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]'>
                Private by design
              </h2>
            </div>
            
            <div className='card-bezel p-5 animate-fade-up' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className='card-bezel-inner p-8'>
                <div className='flex flex-col md:flex-row items-start gap-8'>
                  <div className='flex-shrink-0'>
                    <div className='w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                      <svg className='w-7 h-7 text-emerald-600 dark:text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                      </svg>
                    </div>
                  </div>
                  
                  <div className='flex-1 space-y-4'>
                    <div>
                      <h3 className='font-display font-semibold text-[var(--foreground)] text-lg mb-2'>Your text never leaves this browser</h3>
                      <p className='text-[var(--muted)] leading-relaxed'>
                        This tool runs in your browser. Your resume and job post are not uploaded to a server. If you choose to keep working later, the text is saved only in this browser using localStorage.
                      </p>
                    </div>
                    
                    <div className='grid sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]'>
                      <div className='flex items-center gap-2'>
                        <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
                        </svg>
                        <span className='text-sm text-[var(--foreground)]'>100% client-side</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
                        </svg>
                        <span className='text-sm text-[var(--foreground)]'>No external APIs</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
                        </svg>
                        <span className='text-sm text-[var(--foreground)]'>Clear anytime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id='faq' className='px-4 py-24 md:py-32 scroll-mt-24'>
          <div className='max-w-3xl mx-auto'>
            <div className='text-center mb-12 animate-fade-up'>
              <span className='inline-block text-xs text-[var(--muted)] uppercase tracking-wider mb-3'>Questions</span>
              <h2 className='font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]'>
                FAQ
              </h2>
            </div>
            <FAQ />
          </div>
        </section>

        {/* SEO Content */}
        <section className='px-4 py-16 md:py-24 bg-[var(--surface)]/50'>
          <div className='max-w-3xl mx-auto'>
            <div className='card-bezel p-5 animate-fade-up' style={{ animationFillMode: 'both' }}>
              <div className='card-bezel-inner p-8'>
                <h2 className='font-display text-2xl font-bold tracking-tight text-[var(--foreground)] mb-4'>
                  Why keyword matching matters
                </h2>
                <div className='space-y-4 text-[var(--muted)] leading-relaxed'>
                  <p>
                    Many job descriptions repeat important skills, tools, and responsibilities. When your resume uses relevant language from the role, recruiters and screening systems can more easily see the connection between your experience and the job.
                  </p>
                  <p>
                    This tool helps you identify the gaps so you can make honest, targeted improvements before applying. It is a guide, not a gatekeeper — the goal is to help you present your actual experience more effectively.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='px-4 py-24 md:py-32'>
          <div className='max-w-3xl mx-auto text-center animate-fade-up'>
            <h2 className='font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4'>
              Ready to match your resume?
            </h2>
            <p className='text-[var(--muted)] mb-8 max-w-[50ch] mx-auto'>
              Paste your resume and a job post above to get instant feedback on your match score.
            </p>
            <button
              type='button'
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className='btn-press inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full text-base font-medium hover:opacity-90 transition-opacity'
            >
              <span>Start matching</span>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 10l7-7m0 0l7 7m-7-7v18' />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='px-4 py-8 border-t border-[var(--border)]'>
        <div className='max-w-5xl mx-auto text-center'>
          <p className='text-sm text-[var(--muted)] mb-2'>
            Built for private resume tailoring. Your text is processed locally and is not uploaded.
          </p>
          <p className='text-xs text-[var(--muted)]'>
            &copy; {new Date().getFullYear()} ResumeRadar
          </p>
        </div>
      </footer>
    </div>
  );
}
