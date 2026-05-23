'use client';

import { useState } from 'react';

interface KeywordChipsProps {
  title: string;
  helperText: string;
  keywords: Array<{ keyword: string; count?: number }>;
  variant?: 'matched' | 'missing';
  emptyMessage?: string;
}

export function KeywordChips({
  title,
  helperText,
  keywords,
  variant = 'matched',
  emptyMessage = 'No items found.',
}: KeywordChipsProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayKeywords = showAll ? keywords : keywords.slice(0, 10);
  const hasMore = keywords.length > 10;

  const bgColor = variant === 'matched' 
    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50';

  if (keywords.length === 0) {
    return (
      <div>
        <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>{title}</h4>
        <p className='text-sm text-[var(--muted)]'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='font-display text-sm font-semibold text-[var(--foreground)]'>{title}</h4>
        {hasMore && !showAll && (
          <span className='text-xs text-[var(--muted)] font-medium'>
            +{keywords.length - 10} more
          </span>
        )}
      </div>
      <p className='text-xs text-[var(--muted)] mb-3'>{helperText}</p>
      
      <div className='flex flex-wrap gap-2'>
        {displayKeywords.map(({ keyword, count }) => (
          <span
            key={keyword}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${bgColor}`}
          >
            <span>{keyword}</span>
            {count !== undefined && count > 1 && (
              <span className='opacity-70'>({count})</span>
            )}
          </span>
        ))}
      </div>

      {hasMore && (
        <button
          type='button'
          onClick={() => setShowAll(!showAll)}
          className='mt-3 text-xs text-[var(--muted)] font-medium hover:text-[var(--foreground)] transition-colors'
        >
          {showAll ? 'Show less' : `Show all ${keywords.length} items`}
        </button>
      )}
    </div>
  );
}