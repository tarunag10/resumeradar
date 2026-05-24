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
      await navigator.share({
        title: 'ResumeRadar Match Report',
        text,
      });
      showStatus('Share sheet opened');
      return;
    }

    try {
      await copyText(text);
      showStatus('Share unavailable, copied instead');
    } catch {
      showStatus('Share unavailable in this browser');
    }
  };

  return (
    <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
      <div className='card-bezel-inner p-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='font-display text-sm font-semibold text-[var(--foreground)]'>Export results</h3>
            <p className='text-xs text-[var(--muted)] mt-1'>Copy or download the visible analysis as a local report.</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button type='button' onClick={copySummary} className='btn-press px-3 py-2 text-xs font-medium rounded-lg border border-[var(--border)] hover:border-[var(--muted)]'>
              Copy summary
            </button>
            <button
              type='button'
              onClick={() => {
                downloadTextFile(buildMarkdownReport(result), createResultFileName('md'), 'text/markdown');
                showStatus('Markdown downloaded');
              }}
              className='btn-press px-3 py-2 text-xs font-medium rounded-lg border border-[var(--border)] hover:border-[var(--muted)]'
            >
              Markdown
            </button>
            <button
              type='button'
              onClick={() => {
                downloadTextFile(buildJsonReport(result), createResultFileName('json'), 'application/json');
                showStatus('JSON downloaded');
              }}
              className='btn-press px-3 py-2 text-xs font-medium rounded-lg border border-[var(--border)] hover:border-[var(--muted)]'
            >
              JSON
            </button>
            <button type='button' onClick={shareResult} className='btn-press px-3 py-2 text-xs font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)]'>
              Share
            </button>
          </div>
        </div>
        {status && <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-3' role='status'>{status}</p>}
      </div>
    </div>
  );
}
