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
        <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
          Or upload a file
        </span>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {extensions.join(', ')}
        </span>
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
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
        accept={extensions.map(e => `.${e}`).join(',')}
        onChange={handleFileSelect}
          className='hidden'
          aria-hidden='true'
        />

        {isExtracting ? (
          <div className='flex flex-col items-center gap-2'>
            <div className='w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin' />
            <span className='text-sm text-gray-600 dark:text-gray-400'>Extracting text...</span>
          </div>
        ) : extractedFileName ? (
          <div className='flex flex-col items-center gap-2'>
            <svg className='w-8 h-8 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-sm text-gray-700 dark:text-gray-300'>{extractedFileName}</span>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className='text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors'
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2'>
            <svg className='w-10 h-10 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
            </svg>
            <div>
              <span className='text-sm font-medium text-indigo-600 dark:text-indigo-400'>
                Click to upload
              </span>
              <span className='text-sm text-gray-500 dark:text-gray-400'> or drag and drop</span>
            </div>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              PDF or DOCX up to 10MB
            </span>
          </div>
        )}
      </div>

      <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
        Your file is processed locally. Nothing is uploaded.
      </p>
    </div>
  );
}
