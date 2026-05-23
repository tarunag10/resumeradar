'use client';

import { getMatchInfo } from '@/lib/scoring';

interface MatchScoreProps {
  score: number;
  matchedKeywordsCount: number;
  missingSkillsCount: number;
}

export function MatchScore({ score, matchedKeywordsCount, missingSkillsCount }: MatchScoreProps) {
  const { label, description, nextAction } = getMatchInfo(score);

  const getScoreColor = (s: number) => {
    if (s >= 85) return { text: 'text-emerald-700 dark:text-emerald-300', stroke: 'stroke-emerald-500', rail: 'text-emerald-100 dark:text-emerald-950' };
    if (s >= 65) return { text: 'text-blue-700 dark:text-blue-300', stroke: 'stroke-blue-500', rail: 'text-blue-100 dark:text-blue-950' };
    if (s >= 40) return { text: 'text-amber-700 dark:text-amber-300', stroke: 'stroke-amber-500', rail: 'text-amber-100 dark:text-amber-950' };
    return { text: 'text-red-700 dark:text-red-300', stroke: 'stroke-red-500', rail: 'text-red-100 dark:text-red-950' };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div>
      <div className='flex flex-col items-center gap-5 text-center'>
        <div className='relative'>
          <svg className='h-36 w-36 -rotate-90 transform' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='8'
              className={colors.rail}
            />
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='8'
              strokeLinecap='round'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${colors.stroke} transition-all duration-700 ease-out`}
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div>
              <span className={`block text-4xl font-bold ${colors.text}`}>{score}</span>
              <span className='text-xs text-[var(--muted)]'>match score</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-xl font-semibold tracking-tight text-[var(--foreground)]'>
            {label}
          </h3>
          <p className='mt-2 text-sm leading-6 text-[var(--muted)]'>
            {description}
          </p>
          <div className='mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm'>
            <span className='text-[var(--muted)]'>Next:</span>
            <span className='ml-2 font-medium text-[var(--foreground)]'>{nextAction}</span>
          </div>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5'>
        <div className='rounded-xl bg-[var(--background)] p-3'>
          <svg className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
          </svg>
          <p className='mt-2 text-lg font-semibold text-[var(--foreground)]'>{matchedKeywordsCount}</p>
          <p className='text-xs text-[var(--muted)]'>matched</p>
        </div>
        <div className='rounded-xl bg-[var(--background)] p-3'>
          <svg className='w-5 h-5 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
          </svg>
          <p className='mt-2 text-lg font-semibold text-[var(--foreground)]'>{missingSkillsCount}</p>
          <p className='text-xs text-[var(--muted)]'>missing</p>
        </div>
      </div>
    </div>
  );
}
