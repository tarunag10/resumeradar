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
}: TextInputProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const charCount = value.length;
  const wordCount = value.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setUploadError(null); // Clear upload error when user manually types
  }, [onChange]);

  const handleFileExtracted = useCallback((text: string) => {
    onChange(text);
    setUploadError(null);
    onFileExtracted?.();
  }, [onChange, onFileExtracted]);

  const handleFileError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const isValid = value.length >= minLength;
  const progress = Math.min(100, Math.round((value.length / minLength) * 100));

  const inputId = `text-input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <label htmlFor={inputId} className='text-sm font-semibold text-[var(--foreground)]'>
            {label}
          </label>
          <p id={`${inputId}-helper`} className='mt-1 text-xs text-[var(--muted)]'>
            {helperText}
          </p>
        </div>
        <div className='rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-right'>
          <span className='block text-xs font-semibold text-[var(--foreground)]'>{wordCount.toLocaleString()}</span>
          <span className='block text-[10px] uppercase tracking-wide text-[var(--muted)]'>words</span>
        </div>
      </div>
      
      <div className='relative'>
        <textarea
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className='h-40 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 pr-11 text-sm leading-6 text-[var(--foreground)] shadow-inner shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 md:h-72 dark:placeholder:text-slate-500'
          aria-describedby={`${inputId}-helper`}
        />
        
        {value && (
          <button
            type='button'
            onClick={onClear}
            className='absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-200'
            aria-label={`Clear ${label}`}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>

      <div className='space-y-2'>
        <div className='h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800'>
          <div
            className={`h-full rounded-full transition-all ${isValid ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='flex items-center justify-between gap-3'>
          <p className='text-xs text-[var(--muted)]'>
            {charCount.toLocaleString()} characters
          </p>
        {!isValid && value.length > 0 && (
          <p className='text-xs font-medium text-amber-600 dark:text-amber-400' role='status'>
            Add {Math.max(0, minLength - value.length).toLocaleString()} more characters
          </p>
        )}
        </div>
      </div>

      <FileUpload 
        label={label}
        onTextExtracted={handleFileExtracted}
        onError={handleFileError}
      />

      {uploadError && (
        <div
          className='rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
          role='alert'
        >
          {uploadError}
        </div>
      )}
    </div>
  );
}
