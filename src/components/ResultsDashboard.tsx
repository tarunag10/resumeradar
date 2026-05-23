'use client';

import { ScoringResult } from '@/lib/scoring';
import { MatchScore } from './MatchScore';
import { KeywordChips } from './KeywordChips';
import { RepeatedPhrases } from './RepeatedPhrases';
import { SuggestedBullets } from './SuggestedBullets';

interface ResultsDashboardProps {
  result: ScoringResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-[380px_1fr]'>
      <div className='space-y-4'>
        <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]'>
          <MatchScore
            score={result.matchScore}
            matchedKeywordsCount={result.matchedKeywords.length}
            missingSkillsCount={result.missingSkills.length}
          />
        </div>

        <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
          <RepeatedPhrases phrases={result.repeatedPhrases} />
        </div>
      </div>

      <div className='grid gap-4'>
        <div className='grid gap-4 xl:grid-cols-2'>
          <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
            <KeywordChips
              title='Keywords you already match'
              helperText='These terms appear in both your resume and the job post.'
              keywords={result.matchedKeywords}
              variant='matched'
              emptyMessage='No strong overlaps found yet. Try adding more complete resume text.'
            />
          </div>

          <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
            <KeywordChips
              title='Missing from your resume'
              helperText='These appear important in the job post but were not found in your resume.'
              keywords={result.missingSkills.map(s => ({ keyword: s.skill, count: 1 }))}
              variant='missing'
              emptyMessage='Great job! No obvious missing skills detected.'
            />
          </div>
        </div>

        <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
          <SuggestedBullets bullets={result.suggestedBullets} />
        </div>

        <div className='rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5'>
          <div className='mb-4 flex items-start justify-between gap-4'>
            <div>
              <h4 className='font-semibold text-[var(--foreground)]'>Before you apply</h4>
              <p className='mt-1 text-sm text-[var(--muted)]'>A compact checklist for turning the analysis into edits.</p>
            </div>
            <svg className='mt-1 h-5 w-5 flex-shrink-0 text-[var(--muted)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {[
              'Add truthful examples for important missing skills',
              'Replace repeated phrases with more specific language',
              'Add metrics and specific results where possible',
              'Mirror the job title if accurate to your experience',
            ].map(item => (
              <li key={item} className='flex items-start gap-3 text-sm text-[var(--muted)]'>
                <svg className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className='mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4'>
            <p className='text-sm text-[var(--muted)]'>
              This score is a guide, not a hiring prediction. Only add skills you actually have.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
