'use client';

import { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';

interface TextInputProps {
  label: string;
  placeholder: string;
  helperText: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFileExtracted?: () => void;
  minLength?: number;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function TextInput({
  label,
  placeholder,
  helperText,
  value,
  onChange,
  onClear,
  onFileExtracted,
  minLength = 100,
  inputRef,
}: TextInputProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const charCount = value.length;
  const wordCount = value.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setUploadError(null);
  }, [onChange]);

  const handleFileExtracted = useCallback((text: string, mode: 'replace' | 'append' = 'replace') => {
    onChange(mode === 'append' && value.trim() ? `${value.trim()}\n\n${text}` : text);
    setUploadError(null);
    onFileExtracted?.();
  }, [onChange, onFileExtracted, value]);

  const handleFileError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const trimmedLength = value.trim().length;
  const remaining = Math.max(0, minLength - trimmedLength);
  const progress = Math.min(100, Math.round((trimmedLength / minLength) * 100));

  const inputId = `text-input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-3'>
        <label htmlFor={inputId} className='text-sm font-medium text-[var(--foreground)]'>
          {label}
        </label>
        <span className='font-mono text-[0.6875rem] tabular text-[var(--muted)]'>
          {charCount.toLocaleString()} chars / {wordCount.toLocaleString()} words
        </span>
      </div>

      <div className='relative'>
        <textarea
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className='h-56 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 transition-colors'
          aria-describedby={`${inputId}-helper`}
        />

        {value && (
          <button
            type='button'
            onClick={onClear}
            className='absolute right-2.5 top-2.5 rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
            aria-label={`Clear ${label}`}
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>

      <div className='h-1 w-full overflow-hidden rounded-full bg-[var(--track)]' aria-hidden='true'>
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${remaining === 0 ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='flex items-start justify-between gap-3'>
        <p id={`${inputId}-helper`} className='text-xs text-[var(--muted)]'>
          {helperText}
        </p>
        {remaining > 0 && trimmedLength > 0 && (
          <p className='shrink-0 text-xs tabular text-[var(--warn)]'>
            {remaining.toLocaleString()} more chars for a useful match
          </p>
        )}
      </div>

      <FileUpload
        label={label}
        hasExistingText={value.trim().length > 0}
        onTextExtracted={handleFileExtracted}
        onError={handleFileError}
      />

      {uploadError && (
        <div
          className='rounded-lg border border-[var(--border)] bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]'
          role='alert'
        >
          {uploadError}
        </div>
      )}
    </div>
  );
}
