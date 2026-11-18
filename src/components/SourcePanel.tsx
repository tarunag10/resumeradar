'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface SourcePanelProps {
  resumeText: string;
  jobPostText: string;
  terms: string[];
  mode: 'matches' | 'gaps';
  activeTerm: string | null;
  onTermSelect: (term: string | null) => void;
}

const MAX_RENDERED_CHARS = 24_000;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function SourcePanel({
  resumeText,
  jobPostText,
  terms,
  mode,
  activeTerm,
  onTermSelect,
}: SourcePanelProps) {
  const [source, setSource] = useState<'resume' | 'job'>(mode === 'gaps' ? 'job' : 'resume');
  const bodyRef = useRef<HTMLDivElement>(null);

  const text = source === 'resume' ? resumeText : jobPostText;
  const visibleText = text.slice(0, MAX_RENDERED_CHARS);

  const cleanTerms = useMemo(
    () =>
      Array.from(new Set(terms.map(term => term.trim()).filter(term => term.length > 1)))
        .sort((a, b) => b.length - a.length)
        .slice(0, 80),
    [terms]
  );

  const counts = useMemo(() => {
    const lower = text.toLowerCase();
    return cleanTerms.reduce<Record<string, number>>((acc, term) => {
      const matches = lower.match(new RegExp(escapeRegExp(term.toLowerCase()), 'g'));
      if (matches) acc[term] = matches.length;
      return acc;
    }, {});
  }, [cleanTerms, text]);

  const parts = useMemo(() => {
    if (cleanTerms.length === 0) return [visibleText];
    const pattern = new RegExp(`(${cleanTerms.map(escapeRegExp).join('|')})`, 'gi');
    return visibleText.split(pattern);
  }, [cleanTerms, visibleText]);

  useEffect(() => {
    if (!activeTerm || !bodyRef.current) return;
    const target = bodyRef.current.querySelector('[data-active-term="true"]');
    if (!target) return;
    const container = bodyRef.current;
    const offset = (target as HTMLElement).offsetTop - container.clientHeight / 2 + 40;
    container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }, [activeTerm, source]);

  const termByLower = useMemo(() => {
    const map = new Map<string, string>();
    cleanTerms.forEach(term => map.set(term.toLowerCase(), term));
    return map;
  }, [cleanTerms]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5'>
          <button
            type='button'
            onClick={() => setSource('resume')}
            aria-pressed={source === 'resume'}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              source === 'resume' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Your resume
          </button>
          <button
            type='button'
            onClick={() => setSource('job')}
            aria-pressed={source === 'job'}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              source === 'job' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Job post
          </button>
        </div>
        <p className='text-[0.7rem] text-[var(--muted)]'>
          {activeTerm ? `Highlighting "${activeTerm}"` : 'Click a highlighted term to inspect it'}
        </p>
      </div>

      <div
        ref={bodyRef}
        className='relative max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 whitespace-pre-wrap break-words text-[0.8125rem] leading-relaxed text-[var(--foreground)]'
      >
        {parts.map((part, index) => {
          const term = termByLower.get(part.toLowerCase());
          if (!term) return <span key={index}>{part}</span>;
          const isActive = activeTerm?.toLowerCase() === term.toLowerCase();
          return (
            <button
              key={`${index}-${activeTerm ?? ''}`}
              type='button'
              data-active-term={isActive}
              onClick={() => onTermSelect(isActive ? null : term)}
              className={`hl ${mode === 'gaps' ? 'hl-warn' : ''} ${isActive ? 'hl-flash' : ''}`}
              title={counts[term] ? `${term} - ${counts[term]} mention${counts[term] === 1 ? '' : 's'}` : term}
            >
              {part}
            </button>
          );
        })}
        {text.length > MAX_RENDERED_CHARS && (
          <span className='mt-2 block text-[0.7rem] text-[var(--muted)]'>
            Showing the first {MAX_RENDERED_CHARS.toLocaleString()} characters. The analysis used the full text.
          </span>
        )}
      </div>

      {cleanTerms.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {cleanTerms
            .filter(term => counts[term])
            .slice(0, 12)
            .map(term => (
              <button
                key={term}
                type='button'
                onClick={() => onTermSelect(activeTerm === term ? null : term)}
                aria-pressed={activeTerm === term}
                className={`chip ${mode === 'gaps' ? 'chip-warn' : 'chip-accent'}`}
              >
                {term} <span className='tabular opacity-70'>{counts[term]}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
