'use client';

import { useEffect, useState } from 'react';
import { getMatchInfo } from '@/lib/scoring';

interface MatchScoreProps {
  score: number;
  matchedKeywordsCount: number;
  missingSkillsCount: number;
}

export function MatchScore({ score, matchedKeywordsCount, missingSkillsCount }: MatchScoreProps) {
  const { label, description, nextAction } = getMatchInfo(score);
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduceMotion) {
      setDisplayScore(score);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const duration = 700;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(from + (score - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const scoreColor = score >= 85 ? 'var(--accent)' : score >= 65 ? 'var(--accent)' : score >= 40 ? 'var(--warn)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div>
      <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
        <div className='relative shrink-0'>
          <svg className='h-28 w-28 -rotate-90' viewBox='0 0 100 100' aria-hidden='true'>
            <circle cx='50' cy='50' r='45' fill='none' stroke='var(--track)' strokeWidth='7' />
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke={scoreColor}
              strokeWidth='7'
              strokeLinecap='round'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className='transition-[stroke-dashoffset] duration-700 ease-out'
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='font-display text-4xl tabular leading-none' style={{ color: scoreColor }}>
              {displayScore}
            </span>
            <span className='mono-label mt-1'>match</span>
          </div>
        </div>

        <div className='min-w-0 flex-1'>
          <h3 className='font-display text-2xl'>{label}</h3>
          <p className='mt-1.5 text-sm text-[var(--muted)]'>{description}</p>
          <p className='mt-3 flex flex-wrap items-baseline gap-1.5 text-sm'>
            <span className='mono-label'>Next</span>
            <span className='font-medium text-[var(--foreground)]'>{nextAction}</span>
          </p>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4'>
        <div className='flex items-center gap-2'>
          <span className='h-1.5 w-1.5 rounded-full bg-[var(--accent)]' aria-hidden='true' />
          <span className='text-sm text-[var(--muted)]'>
            <span className='font-semibold tabular text-[var(--foreground)]'>{matchedKeywordsCount}</span> keywords matched
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className={`h-1.5 w-1.5 rounded-full ${missingSkillsCount > 0 ? 'bg-[var(--warn)]' : 'bg-[var(--accent)]'}`} aria-hidden='true' />
          <span className='text-sm text-[var(--muted)]'>
            <span className='font-semibold tabular text-[var(--foreground)]'>{missingSkillsCount}</span> skills missing
          </span>
        </div>
      </div>
    </div>
  );
}
