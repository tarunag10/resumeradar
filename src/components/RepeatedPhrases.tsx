'use client';

import { useState } from 'react';

interface RepeatedPhrasesProps {
  phrases: Array<{ phrase: string; count: number; suggestion: string }>;
}

export function RepeatedPhrases({ phrases }: RepeatedPhrasesProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayPhrases = showAll ? phrases : phrases.slice(0, 5);
  const hasMore = phrases.length > 5;

  if (phrases.length === 0) {
    return (
      <div>
        <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Repeated phrases</h4>
        <div className='flex items-center gap-2'>
          <svg className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <p className='text-sm text-[var(--muted)]'>No major repetition found. Nice!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Repeated phrases</h4>
      <p className='text-xs text-[var(--muted)] mb-4'>
        Too much repetition can make a resume feel generic.
      </p>
      
      <div className='space-y-3'>
        {displayPhrases.map(({ phrase, count, suggestion }) => (
          <div
            key={phrase}
            className='p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]'
          >
            <div className='flex items-center justify-between mb-1'>
              <span className='text-sm font-medium text-[var(--foreground)]'>
                &ldquo;{phrase}&rdquo;
              </span>
              <span className='text-xs text-[var(--muted)] font-mono'>
                {count}x
              </span>
            </div>
            <p className='text-xs text-[var(--muted)]'>{suggestion}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type='button'
          onClick={() => setShowAll(!showAll)}
          className='mt-3 text-xs text-[var(--muted)] font-medium hover:text-[var(--foreground)] transition-colors'
        >
          {showAll ? 'Show less' : `Show all ${phrases.length} repeated phrases`}
        </button>
      )}
    </div>
  );
}