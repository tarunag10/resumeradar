'use client';

import { useEffect, useMemo, useState } from 'react';

interface HeroDemoProps {
  onTrySample: () => void;
}

interface DemoTerm {
  term: string;
  inResume: boolean;
  inJob: boolean;
}

const DEMO_TERMS: DemoTerm[] = [
  { term: 'SQL', inResume: true, inJob: true },
  { term: 'Python', inResume: true, inJob: true },
  { term: 'Tableau', inResume: true, inJob: true },
  { term: 'A/B testing', inResume: true, inJob: true },
  { term: 'stakeholder management', inResume: true, inJob: true },
  { term: 'ETL pipelines', inResume: false, inJob: true },
];

const RESUME_LINES = [
  'Senior Product Analyst - TechCorp',
  'Built dashboards in Tableau and analysed',
  'behaviour data with SQL and Python.',
  'Ran A/B testing programs with clear',
  'stakeholder management and reporting.',
];

const JOB_LINES = [
  'Senior Product Analyst - SaaS team',
  'Proficiency in SQL and Python for',
  'product analytics. Tableau dashboards,',
  'A/B testing, stakeholder management,',
  'and familiarity with ETL pipelines.',
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderLine(line: string, terms: string[], activeTerm: string | null) {
  if (terms.length === 0) return line;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return line.split(pattern).map((part, index) => {
    const isTerm = terms.some(term => term.toLowerCase() === part.toLowerCase());
    if (!isTerm) return <span key={index}>{part}</span>;
    const isActive = activeTerm?.toLowerCase() === part.toLowerCase();
    return (
      <mark
        key={`${index}-${activeTerm ?? ''}`}
        className={`hl ${isActive ? 'hl-flash' : ''}`}
      >
        {part}
      </mark>
    );
  });
}

export function HeroDemo({ onTrySample }: HeroDemoProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>('A/B testing');
  const [score, setScore] = useState(0);

  const terms = useMemo(() => DEMO_TERMS.map(item => item.term), []);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduceMotion) {
      setScore(78);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(78 * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const activeLabel = activeTerm?.toLowerCase();

  return (
    <div className='card relative overflow-hidden'>
      <div className='flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3'>
        <span className='mono-label'>Live sample</span>
        <span className='inline-flex items-center gap-1.5 text-[0.6875rem] text-[var(--muted)]'>
          <span className='relative flex h-1.5 w-1.5'>
            <span className='absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60' />
          </span>
          analyzed in your browser
        </span>
      </div>

      <div className='relative'>
        <div className='scan-line' aria-hidden='true' />
        <div className='grid gap-0 sm:grid-cols-2'>
          <div className='border-b border-[var(--border)] p-4 sm:border-b-0 sm:border-r'>
            <p className='mono-label mb-2'>Resume</p>
            <div className='space-y-0.5 font-mono text-[0.7rem] leading-relaxed text-[var(--foreground)]'>
              {RESUME_LINES.map(line => (
                <p key={line}>{renderLine(line, terms, activeTerm)}</p>
              ))}
            </div>
          </div>
          <div className='p-4'>
            <p className='mono-label mb-2'>Job post</p>
            <div className='space-y-0.5 font-mono text-[0.7rem] leading-relaxed text-[var(--foreground)]'>
              {JOB_LINES.map(line => (
                <p key={line}>{renderLine(line, terms, activeTerm)}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='border-t border-[var(--border)] px-4 py-3'>
        <div className='flex items-end justify-between gap-4'>
          <div className='min-w-0'>
            <p className='mono-label'>Match</p>
            <p className='font-display text-3xl tabular leading-none mt-1'>
              {score}
              <span className='text-lg text-[var(--muted)]'>%</span>
            </p>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-[var(--track)]'>
              <div
                className='h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out'
                style={{ width: `${score}%` }}
              />
            </div>
            <p className='mt-2 text-[0.7rem] text-[var(--muted)]'>
              {activeTerm
                ? DEMO_TERMS.find(item => item.term === activeTerm)?.inResume
                  ? `${activeTerm} appears in both texts`
                  : `${activeTerm} is in the job post only - a gap`
                : 'Pick a term to see where it lands'}
            </p>
          </div>
        </div>

        <div className='mt-3 flex flex-wrap gap-1.5'>
          {DEMO_TERMS.map(item => (
            <button
              key={item.term}
              type='button'
              aria-pressed={activeLabel === item.term.toLowerCase()}
              onClick={() => setActiveTerm(activeLabel === item.term.toLowerCase() ? null : item.term)}
              className={`chip ${item.inResume ? '' : 'chip-warn'}`}
            >
              {item.term}
            </button>
          ))}
        </div>
      </div>

      <div className='flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5'>
        <span className='text-[0.7rem] text-[var(--muted)]'>Tap a term to trace it in both texts.</span>
        <button
          type='button'
          onClick={onTrySample}
          className='btn-quiet shrink-0 inline-flex items-center gap-1 text-[var(--foreground)]'
        >
          Try it on the sample
          <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M17 8l4 4m0 0l-4 4m4-4H3' />
          </svg>
        </button>
      </div>
    </div>
  );
}
