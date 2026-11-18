'use client';

import { useState } from 'react';
import { buildJsonReport, buildMarkdownReport, buildPlainTextReport, createResultFileName } from '@/lib/exportResults';
import { ScoringResult } from '@/lib/scoring';

interface ExportActionsProps {
  result: ScoringResult;
}

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Clipboard copy unavailable');
  }
}

export function ExportActions({ result }: ExportActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const showStatus = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const copySummary = async () => {
    try {
      await copyText(buildPlainTextReport(result));
      showStatus('Summary copied');
    } catch {
      showStatus('Copy unavailable in this browser');
    }
  };

  const shareResult = async () => {
    const text = buildPlainTextReport(result);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ResumeRadar Match Report',
          text,
        });
        showStatus('Share sheet opened');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          showStatus('Share cancelled');
          return;
        }
      }
    }

    try {
      await copyText(text);
      showStatus('Share unavailable, copied instead');
    } catch {
      showStatus('Share unavailable in this browser');
    }
  };

  const outlineButton = 'rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface-2)]';

  return (
    <div className='card p-5 animate-fade-up'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h4 className='font-display text-lg'>Take it with you</h4>
          <p className='mt-1 text-xs text-[var(--muted)]'>The report is generated here - nothing is uploaded.</p>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <button type='button' onClick={copySummary} className={outlineButton}>
            Copy summary
          </button>
          <button
            type='button'
            onClick={() => {
              downloadTextFile(buildMarkdownReport(result), createResultFileName('md'), 'text/markdown');
              showStatus('Markdown downloaded');
            }}
            className={outlineButton}
          >
            Markdown
          </button>
          <button
            type='button'
            onClick={() => {
              downloadTextFile(buildPlainTextReport(result), createResultFileName('txt'), 'text/plain');
              showStatus('Text downloaded');
            }}
            className={outlineButton}
          >
            Text
          </button>
          <button
            type='button'
            onClick={() => {
              downloadTextFile(buildJsonReport(result), createResultFileName('json'), 'application/json');
              showStatus('JSON downloaded');
            }}
            className={outlineButton}
          >
            JSON
          </button>
          <button type='button' onClick={shareResult} className='btn px-3 py-1.5 text-xs btn-primary'>
            Share
          </button>
        </div>
      </div>
      {status && (
        <p className='mt-3 text-xs text-[var(--accent)]' role='status'>
          {status}
        </p>
      )}
    </div>
  );
}
