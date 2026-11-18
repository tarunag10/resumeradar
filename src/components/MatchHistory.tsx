'use client';

import { useState, useEffect, useRef } from 'react';
import { MatchHistoryEntry, getMatchHistory, clearMatchHistory } from '@/lib/matchHistory';

interface MatchHistoryProps {
  onSelectEntry?: (entry: MatchHistoryEntry) => void;
  refreshSignal?: number;
}

export function MatchHistory({ onSelectEntry, refreshSignal = 0 }: MatchHistoryProps) {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHistory(getMatchHistory());
  }, [isOpen, refreshSignal]);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = () => {
    clearMatchHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isEmpty = history.length === 0;

  return (
    <div className='relative'>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => !isEmpty && setIsOpen(!isOpen)}
        disabled={isEmpty}
        className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors enabled:hover:border-[var(--border-strong)] enabled:hover:text-[var(--foreground)] disabled:cursor-default disabled:opacity-60'
        aria-expanded={isEmpty ? undefined : isOpen}
        aria-haspopup={isEmpty ? undefined : 'dialog'}
        aria-label={isEmpty ? 'No saved matches yet' : `Saved matches (${history.length})`}
      >
        <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <span className='tabular'>{history.length}</span>
        <span className='hidden sm:inline'>saved</span>
      </button>

      {isOpen && (
        <>
          <div className='fixed inset-0 z-40' onClick={close} aria-hidden='true' />

          <div
            className='fixed left-1/2 top-20 z-50 w-[min(92vw,20rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0'
            role='dialog'
            aria-label='Match history'
          >
            <div className='flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3'>
              <h3 className='font-display text-base'>Match history</h3>
              <button
                ref={closeRef}
                type='button'
                onClick={close}
                className='rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
                aria-label='Close history'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='max-h-80 overflow-y-auto'>
              {history.map(entry => (
                <button
                  key={entry.id}
                  type='button'
                  onClick={() => {
                    onSelectEntry?.(entry);
                    close();
                  }}
                  className='w-full border-b border-[var(--border)] p-3.5 text-left transition-colors last:border-b-0 hover:bg-[var(--surface-2)]'
                >
                  <div className='mb-1 flex items-baseline justify-between gap-2'>
                    <span className='font-display text-xl tabular'>{entry.matchScore}%</span>
                    <span className='text-[0.7rem] text-[var(--muted)]'>{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className='truncate text-xs text-[var(--muted)]'>Resume: {entry.resumePreview}</p>
                  <p className='truncate text-xs text-[var(--muted)]'>Job: {entry.jobPostPreview}</p>
                  <div className='mt-1.5 flex gap-3 font-mono text-[0.6875rem] text-[var(--muted)]'>
                    <span>kw {entry.keywordScore}%</span>
                    <span>skills {entry.skillScore}%</span>
                  </div>
                </button>
              ))}
            </div>

            {showClearConfirm ? (
              <div className='border-t border-[var(--border)] bg-[var(--danger-soft)] p-3'>
                <p className='mb-2 text-xs text-[var(--danger)]'>Clear all saved matches?</p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleClear}
                    className='rounded-lg bg-[var(--danger)] px-3 py-1 text-xs font-medium text-[var(--background)]'
                  >
                    Clear
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowClearConfirm(false)}
                    className='rounded-lg border border-[var(--border-strong)] px-3 py-1 text-xs font-medium'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='border-t border-[var(--border)] p-2.5'>
                <button type='button' onClick={() => setShowClearConfirm(true)} className='btn-quiet text-xs'>
                  Clear history
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
