'use client';

import { useState } from 'react';

interface SuggestedBulletsProps {
  bullets: string[];
}

export function SuggestedBullets({ bullets }: SuggestedBulletsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyBullet = async (bullet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllBullets = async () => {
    try {
      await navigator.clipboard.writeText(bullets.map(b => `• ${b}`).join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  if (bullets.length === 0) {
    return null;
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='font-display text-sm font-semibold text-[var(--foreground)]'>Suggested resume bullets</h4>
        <button
          type='button'
          onClick={copyAllBullets}
          className='text-xs text-[var(--muted)] font-medium hover:text-[var(--foreground)] transition-colors flex items-center gap-1'
        >
          {copiedAll ? (
            <>
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              Copied all
            </>
          ) : (
            'Copy all'
          )}
        </button>
      </div>
      <p className='text-xs text-[var(--muted)] mb-4'>
        Use these as starting points. Edit them so they are accurate to your experience.
      </p>
      
      <div className='space-y-3'>
        {bullets.map((bullet, index) => (
          <div
            key={index}
            className='group relative p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--muted)]/30 transition-colors'
          >
            <p className='text-sm text-[var(--foreground)] pr-8 leading-relaxed'>{bullet}</p>
            <button
              type='button'
              onClick={() => copyBullet(bullet, index)}
              className='absolute top-3 right-3 p-1.5 rounded-md bg-[var(--background)] border border-[var(--border)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity hover:border-[var(--muted)]'
              aria-label='Copy bullet'
            >
              {copiedIndex === index ? (
                <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
                </svg>
              ) : (
                <svg className='w-4 h-4 text-[var(--muted)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                </svg>
              )}
            </button>
            <div className='mt-2 flex items-center gap-2 text-xs text-[var(--muted)]'>
              <span>Add:</span>
              <span>a metric</span>
              <span>-</span>
              <span>a tool</span>
              <span>-</span>
              <span>business result</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
