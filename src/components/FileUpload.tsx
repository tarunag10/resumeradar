'use client';

import { useState, useCallback, useRef } from 'react';
import { extractTextFromFile, isPDF, isDOCX, getSupportedTypes } from '@/lib/documentExtractor';

const { extensions } = getSupportedTypes();
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploadProps {
  label: string;
  hasExistingText?: boolean;
  onTextExtracted: (text: string, mode?: 'replace' | 'append') => void;
  onError?: (error: string) => void;
}

export function FileUpload({ label, hasExistingText = false, onTextExtracted, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);
  const [pendingExtraction, setPendingExtraction] = useState<{ text: string; wordCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!isPDF(file) && !isDOCX(file)) {
      onError?.(`Unsupported file type. Please upload ${extensions.join(' or ')} files.`);
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
        const wordCount = result.text.trim().split(/\s+/).filter(Boolean).length;
        if (hasExistingText) {
          setPendingExtraction({ text: result.text, wordCount });
        } else {
          onTextExtracted(result.text, 'replace');
        }
      } else {
        onError?.(result.error || 'Failed to extract text from file');
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsExtracting(false);
    }
  }, [hasExistingText, onError, onTextExtracted]);

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
    const input = e.target;
    const files = input.files;

    if (files && files.length > 0) {
      await processFile(files[0]);
    }

    input.value = '';
  }, [processFile]);

  const handleClear = useCallback(() => {
    setExtractedFileName(null);
    setPendingExtraction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const applyPendingExtraction = useCallback((mode: 'replace' | 'append') => {
    if (!pendingExtraction) return;
    onTextExtracted(pendingExtraction.text, mode);
    setPendingExtraction(null);
  }, [onTextExtracted, pendingExtraction]);

  const inputId = `file-upload-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className='flex flex-col gap-2'>
      <input
        ref={fileInputRef}
        id={inputId}
        type='file'
        accept={extensions.join(',')}
        onChange={handleFileSelect}
        className='sr-only'
      />

      <div
        className={`rounded-xl border border-dashed px-4 py-3 transition-colors ${
          isDragging ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-strong)]'
        } ${isExtracting ? 'opacity-60' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            {isExtracting ? (
              <span className='flex items-center gap-2 text-xs text-[var(--muted)]'>
                <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent' />
                Extracting text from {extractedFileName}
              </span>
            ) : extractedFileName ? (
              <span className='flex items-center gap-2 truncate text-xs text-[var(--foreground)]'>
                <svg className='h-4 w-4 shrink-0 text-[var(--accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span className='truncate'>{extractedFileName}</span>
                {pendingExtraction && (
                  <span className='shrink-0 text-[var(--muted)]'>({pendingExtraction.wordCount.toLocaleString()} words)</span>
                )}
              </span>
            ) : (
              <span className='text-xs text-[var(--muted)]'>
                <span className='text-[var(--foreground)]'>Drop a file</span> or use the picker. {extensions.join(', ')} up to 10MB.
              </span>
            )}
          </div>

          <div className='flex shrink-0 items-center gap-1.5'>
            {pendingExtraction ? (
              <>
                <button
                  type='button'
                  onClick={() => applyPendingExtraction('replace')}
                  className='rounded-lg border border-[var(--border-strong)] px-2.5 py-1 text-xs font-medium hover:border-[var(--muted)]'
                >
                  Replace
                </button>
                <button
                  type='button'
                  onClick={() => applyPendingExtraction('append')}
                  className='rounded-lg border border-[var(--border-strong)] px-2.5 py-1 text-xs font-medium hover:border-[var(--muted)]'
                >
                  Append
                </button>
              </>
            ) : (
              <label
                htmlFor={inputId}
                className='cursor-pointer rounded-lg border border-[var(--border-strong)] px-2.5 py-1 text-xs font-medium transition-colors hover:border-[var(--muted)]'
              >
                Choose file
              </label>
            )}
            {extractedFileName && (
              <button
                type='button'
                onClick={handleClear}
                className='rounded-lg px-1.5 py-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--danger)]'
                aria-label={`Remove uploaded ${label} file`}
              >
                <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
