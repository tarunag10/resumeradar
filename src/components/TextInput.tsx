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

  const handleFileExtracted = useCallback((text: string, mode: 'replace' | 'append' = 'replace') => {
    onChange(mode === 'append' && value.trim() ? `${value.trim()}\n\n${text}` : text);
    setUploadError(null);
    onFileExtracted?.();
  }, [onChange, onFileExtracted, value]);

  const handleFileError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const isValid = value.length >= minLength;

  const inputId = `text-input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <label htmlFor={inputId} className='text-sm font-medium text-gray-900 dark:text-gray-100'>
          {label}
        </label>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {charCount.toLocaleString()} chars - {wordCount.toLocaleString()} words
        </span>
      </div>
      
      <div className='relative'>
        <textarea
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className='w-full h-64 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all'
          aria-describedby={`${inputId}-helper`}
        />
        
        {value && (
          <button
            type='button'
            onClick={onClear}
            className='absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            aria-label={`Clear ${label}`}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>

      <div className='flex items-center justify-between'>
        <p id={`${inputId}-helper`} className='text-xs text-gray-500 dark:text-gray-400'>
          {helperText}
        </p>
        {!isValid && value.length > 0 && (
          <p className='text-xs text-amber-600 dark:text-amber-400' role='status'>
            Add more text for better analysis
          </p>
        )}
      </div>

      {/* File Upload Section */}
      <FileUpload 
        label={label}
        hasExistingText={value.trim().length > 0}
        onTextExtracted={handleFileExtracted}
        onError={handleFileError}
      />

      {/* Upload Error Message */}
      {uploadError && (
        <div
          className='p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300'
          role='alert'
        >
          {uploadError}
        </div>
      )}
    </div>
  );
}
