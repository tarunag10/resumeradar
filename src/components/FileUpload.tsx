'use client';

import { useState, useCallback, useRef } from 'react';
import { extractTextFromFile, isPDF, isDOCX, getSupportedTypes } from '@/lib/documentExtractor';

const { extensions } = getSupportedTypes();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  label: string;
  onTextExtracted: (text: string) => void;
  onError?: (error: string) => void;
}

export function FileUpload({ label, onTextExtracted, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!isPDF(file) && !isDOCX(file)) {
      const errorMsg = `Unsupported file type. Please upload ${extensions.join(' or ')} files.`;
      onError?.(errorMsg);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError?.(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    setIsExtracting(true);
    setExtractedFileName(file.name);

    try {
      const result = await extractTextFromFile(file);

      if (result.success) {
        onTextExtracted(result.text);
      } else {
        onError?.(result.error || 'Failed to extract text from file');
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsExtracting(false);
    }
  }, [onError, onTextExtracted]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleClear = useCallback(() => {
    setExtractedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Attach file
        </span>
        <span className='text-xs text-[var(--muted)]'>
          {extensions.join(', ')}
        </span>
      </div>

      <div
        className={`
          relative cursor-pointer rounded-xl border border-dashed p-4 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
            : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/20'
          }
          ${isExtracting ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
        aria-label={`Upload ${label} file`}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={extensions.join(',')}
          onChange={handleFileSelect}
          className='hidden'
          aria-hidden='true'
        />

        {isExtracting ? (
          <div className='flex items-center justify-center gap-3'>
            <div className='h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
            <span className='text-sm text-[var(--muted)]'>Extracting text...</span>
          </div>
        ) : extractedFileName ? (
          <div className='flex items-center justify-between gap-3 text-left'>
            <div className='flex min-w-0 items-center gap-2'>
            <svg className='h-5 w-5 flex-shrink-0 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
              <span className='truncate text-sm text-[var(--foreground)]'>{extractedFileName}</span>
            </div>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className='flex-shrink-0 text-xs font-medium text-[var(--muted)] transition-colors hover:text-red-600 dark:hover:text-red-400'
            >
              Remove
            </button>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-3'>
            <svg className='h-5 w-5 text-slate-400 dark:text-slate-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
            </svg>
            <span className='text-sm text-[var(--muted)]'>
              <span className='font-medium text-blue-600 dark:text-blue-400'>Upload</span> or drag PDF/DOCX
            </span>
          </div>
        )}
      </div>

      <p className='text-center text-xs text-[var(--muted)]'>
        Processed locally. Max 10MB.
      </p>
    </div>
  );
}
