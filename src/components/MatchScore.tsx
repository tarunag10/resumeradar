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
    if (s >= 85) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', stroke: 'stroke-emerald-500' };
    if (s >= 65) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', stroke: 'stroke-blue-500' };
    if (s >= 40) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', stroke: 'stroke-amber-500' };
    return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', stroke: 'stroke-red-500' };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-6 rounded-2xl ${colors.bg} border border-[var(--border)]`}>
      <div className='flex flex-col sm:flex-row sm:items-center gap-6'>
        {/* Score Gauge */}
        <div className='relative flex-shrink-0'>
          <svg className='w-28 h-28 transform -rotate-90' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='8'
              className='text-[var(--border)]'
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
            <span className={`text-3xl font-display font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>

        {/* Score Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='font-display text-xl font-semibold text-[var(--foreground)] mb-1 tracking-tight'>
            {label}
          </h3>
          <p className='text-sm text-[var(--muted)] mb-3'>
            {description}
          </p>
          <div className='flex flex-wrap items-center gap-2 text-sm'>
            <span className='text-[var(--muted)]'>Next:</span>
            <span className='font-medium text-[var(--foreground)]'>{nextAction}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='mt-4 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row gap-3 sm:gap-6'>
        <div className='flex items-center gap-2 min-w-0'>
          <svg className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
          </svg>
          <span className='text-sm text-[var(--muted)]'>
            <span className='font-semibold text-[var(--foreground)]'>{matchedKeywordsCount}</span> keywords matched
          </span>
        </div>
        <div className='flex items-center gap-2 min-w-0'>
          <svg className='w-5 h-5 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
          </svg>
          <span className='text-sm text-[var(--muted)]'>
            <span className='font-semibold text-[var(--foreground)]'>{missingSkillsCount}</span> skills missing
          </span>
        </div>
      </div>
    </div>
  );
}
