'use client';

import { useState } from 'react';

interface KeywordChipsProps {
  title: string;
  helperText: string;
  keywords: Array<{ keyword: string; count?: number }>;
  variant?: 'matched' | 'missing';
  emptyMessage?: string;
  onSelect?: (keyword: string) => void;
  activeKeyword?: string | null;
  limit?: number;
}

export function KeywordChips({
  title,
  helperText,
  keywords,
  variant = 'matched',
  emptyMessage = 'No items found.',
  onSelect,
  activeKeyword = null,
  limit = 10,
}: KeywordChipsProps) {
  const [showAll, setShowAll] = useState(false);

  const displayKeywords = showAll ? keywords : keywords.slice(0, limit);
  const hasMore = keywords.length > limit;
  const tone = variant === 'matched' ? 'chip-accent' : 'chip-warn';

  if (keywords.length === 0) {
    return (
      <div>
        <h4 className='font-display text-lg'>{title}</h4>
        <p className='mt-1.5 text-sm text-[var(--muted)]'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-1 flex items-center justify-between gap-3'>
        <h4 className='font-display text-lg'>{title}</h4>
        <span className='font-mono text-[0.6875rem] tabular text-[var(--muted)]'>{keywords.length}</span>
      </div>
      <p className='mb-3 text-xs text-[var(--muted)]'>{helperText}</p>

      <div className='flex flex-wrap gap-1.5'>
        {displayKeywords.map(({ keyword, count }) => {
          const isActive = activeKeyword?.toLowerCase() === keyword.toLowerCase();
          const content = (
            <>
              <span>{keyword}</span>
              {count !== undefined && count > 1 && <span className='tabular opacity-60'>{count}</span>}
            </>
          );

          if (!onSelect) {
            return (
              <span key={keyword} className={`chip ${tone}`}>
                {content}
              </span>
            );
          }

          return (
            <button
              key={keyword}
              type='button'
              onClick={() => onSelect(isActive ? '' : keyword)}
              aria-pressed={isActive}
              className={`chip ${tone}`}
              title={`Show ${keyword} in the text`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button type='button' onClick={() => setShowAll(!showAll)} className='btn-quiet mt-2 -ml-1.5 text-xs'>
          {showAll ? 'Show less' : `Show all ${keywords.length}`}
        </button>
      )}
    </div>
  );
}
