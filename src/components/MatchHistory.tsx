'use client';

import { useState, useEffect } from 'react';
import { MatchHistoryEntry, getMatchHistory, clearMatchHistory } from '@/lib/matchHistory';

interface MatchHistoryProps {
  onSelectEntry?: (entry: MatchHistoryEntry) => void;
  refreshSignal?: number;
}

export function MatchHistory({ onSelectEntry, refreshSignal = 0 }: MatchHistoryProps) {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getMatchHistory());
  }, [isOpen, refreshSignal]);

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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 65) return 'text-indigo-600 dark:text-indigo-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors'
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        History ({history.length})
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className='fixed inset-0 z-40' 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Panel */}
          <div className='absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='font-semibold text-gray-900 dark:text-gray-100'>Match History</h3>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                aria-label='Close history'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='max-h-80 overflow-y-auto'>
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type='button'
                  onClick={() => {
                    onSelectEntry?.(entry);
                    setIsOpen(false);
                  }}
                  className='w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors'
                >
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <span className={`text-lg font-bold ${getScoreColor(entry.matchScore)}`}>
                      {entry.matchScore}%
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
                    Resume: {entry.resumePreview}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Job: {entry.jobPostPreview}
                  </p>
                  <div className='flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400'>
                    <span>Keywords: {entry.keywordScore}%</span>
                    <span>Skills: {entry.skillScore}%</span>
                  </div>
                </button>
              ))}
            </div>

            {showClearConfirm ? (
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800'>
                <p className='text-xs text-red-700 dark:text-red-300 mb-2'>Clear all history?</p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleClear}
                    className='px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                  >
                    Clear
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowClearConfirm(false)}
                    className='px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
                <button
                  type='button'
                  onClick={() => setShowClearConfirm(true)}
                  className='text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors'
                >
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
