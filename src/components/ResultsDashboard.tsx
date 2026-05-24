'use client';

import { ScoringResult } from '@/lib/scoring';
import { MatchScore } from './MatchScore';
import { KeywordChips } from './KeywordChips';
import { RepeatedPhrases } from './RepeatedPhrases';
import { SuggestedBullets } from './SuggestedBullets';
import { ExportActions } from './ExportActions';
import { ScoreBreakdown } from './ScoreBreakdown';
import { JobInsights } from './JobInsights';
import { ResumeQualityChecks } from './ResumeQualityChecks';

interface ResultsDashboardProps {
  result: ScoringResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div className='space-y-6'>
      <ExportActions result={result} />

      {/* Score Card */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <MatchScore
            score={result.matchScore}
            matchedKeywordsCount={result.matchedKeywords.length}
            missingSkillsCount={result.missingSkills.length}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <ScoreBreakdown items={result.scoreBreakdown} repetitionPenalty={result.repetitionPenalty} />
        </div>
      </div>

      {/* Job Insights */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '175ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <JobInsights insights={result.jobInsights} />
        </div>
      </div>

      {/* Keyword Overlap */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <KeywordChips
            title='Keywords you already match'
            helperText='These terms appear in both your resume and the job post.'
            keywords={result.matchedKeywords}
            variant='matched'
            emptyMessage='No strong overlaps found yet. Try adding more complete resume text.'
          />
        </div>
      </div>

      {/* Missing Skills */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <KeywordChips
            title='Missing from your resume'
            helperText='These appear important in the job post but were not found in your resume.'
            keywords={result.missingSkills.map(s => ({ keyword: s.skill, count: 1 }))}
            variant='missing'
            emptyMessage='Great job! No obvious missing skills detected.'
          />
        </div>
      </div>

      {/* Missing Keywords */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <KeywordChips
            title='Missing keywords'
            helperText='Important job-post terms that were not found in your resume.'
            keywords={result.missingKeywords}
            variant='missing'
            emptyMessage='No obvious missing keywords detected.'
          />
        </div>
      </div>

      {/* Repeated Phrases */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <RepeatedPhrases phrases={result.repeatedPhrases} />
        </div>
      </div>

      {/* Suggested Bullets */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <SuggestedBullets bullets={result.suggestedBullets} />
        </div>
      </div>

      {/* Resume Quality Checks */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <ResumeQualityChecks checks={result.resumeQualityChecks} />
        </div>
      </div>

      {/* Score Caveat */}
      <div className='p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]'>
        <div className='flex items-start gap-3'>
          <svg className='w-5 h-5 text-[var(--muted)] mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <p className='text-sm text-[var(--muted)]'>
            This score is a guide, not a hiring prediction. Use it to find gaps and tailor your resume honestly. Only add skills you actually have.
          </p>
        </div>
      </div>

      {/* Before You Apply Checklist */}
      <div className='card-bezel p-4 animate-fade-up' style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <div className='card-bezel-inner p-6'>
          <h4 className='font-display font-semibold text-[var(--foreground)] mb-4'>
            Before you apply checklist
          </h4>
          <ul className='space-y-3'>
            <li className='flex items-start gap-3 text-sm text-[var(--muted)]'>
              <svg className='w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              <span>Add truthful examples for important missing skills</span>
            </li>
            <li className='flex items-start gap-3 text-sm text-[var(--muted)]'>
              <svg className='w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              <span>Replace repeated phrases with more specific language</span>
            </li>
            <li className='flex items-start gap-3 text-sm text-[var(--muted)]'>
              <svg className='w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              <span>Add metrics and specific results where possible</span>
            </li>
            <li className='flex items-start gap-3 text-sm text-[var(--muted)]'>
              <svg className='w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              <span>Mirror the job title if accurate to your experience</span>
            </li>
            <li className='flex items-start gap-3 text-sm text-[var(--muted)]'>
              <svg className='w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M5 13l4 4L19 7' />
              </svg>
              <span>Save your tailored version before applying</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
