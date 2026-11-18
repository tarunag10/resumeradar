'use client';

import { useState } from 'react';
import { ScoringResult } from '@/lib/scoring';
import { MatchScore } from './MatchScore';
import { KeywordChips } from './KeywordChips';
import { RepeatedPhrases } from './RepeatedPhrases';
import { SuggestedBullets } from './SuggestedBullets';
import { ExportActions } from './ExportActions';
import { ScoreBreakdown } from './ScoreBreakdown';
import { JobInsights } from './JobInsights';
import { ResumeQualityChecks } from './ResumeQualityChecks';
import { SourcePanel } from './SourcePanel';

interface ResultsDashboardProps {
  result: ScoringResult;
  resumeText: string;
  jobPostText: string;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'matched', label: 'Matched' },
  { id: 'gaps', label: 'Gaps' },
  { id: 'improve', label: 'Improve' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CHECKLIST = [
  'Add truthful examples for important missing skills',
  'Replace repeated phrases with more specific language',
  'Add metrics and specific results where possible',
  'Mirror the job title if it is accurate to your experience',
  'Save your tailored version before applying',
];

export function ResultsDashboard({ result, resumeText, jobPostText }: ResultsDashboardProps) {
  const [tab, setTab] = useState<TabId>('overview');
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const matchedTerms = [
    ...result.matchedKeywords.map(item => item.keyword),
    ...result.matchedSkills.map(item => item.skill),
  ];
  const gapTerms = [
    ...result.missingSkills.map(item => item.skill),
    ...result.missingKeywords.map(item => item.keyword),
  ];

  const selectTerm = (term: string) => setActiveTerm(term || null);

  const changeTab = (next: TabId) => {
    setTab(next);
    setActiveTerm(null);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TABS.findIndex(item => item.id === tab);
    const nextIndex = event.key === 'ArrowRight'
      ? (index + 1) % TABS.length
      : (index - 1 + TABS.length) % TABS.length;
    const next = TABS[nextIndex];
    changeTab(next.id);
    document.getElementById(`result-tab-${next.id}`)?.focus();
  };

  const tabCount: Record<TabId, number | null> = {
    overview: null,
    matched: result.matchedKeywords.length,
    gaps: result.missingSkills.length + result.missingKeywords.length,
    improve: result.suggestedBullets.length,
  };

  return (
    <div>
      <p className='sr-only' role='status'>
        Match score {result.matchScore} percent. {result.matchedKeywords.length} keywords matched,{' '}
        {result.missingSkills.length} skills missing.
      </p>

      {/* Sticky score + tab strip */}
      <div className='-mx-4 mb-6 border-y border-[var(--border)] bg-[var(--blur-bg)] px-4 backdrop-blur md:sticky md:top-[61px] md:z-20'>
        <div className='mx-auto flex max-w-5xl flex-col gap-2 py-2.5 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <span className='font-display text-3xl tabular leading-none'>{result.matchScore}%</span>
            <div className='min-w-0'>
              <p className='text-xs font-medium text-[var(--foreground)]'>match</p>
              <p className='text-[0.7rem] text-[var(--muted)]'>
                {result.matchedKeywords.length} matched / {result.missingSkills.length} missing skills
              </p>
            </div>
          </div>

          <div
            role='tablist'
            aria-label='Result sections'
            onKeyDown={handleTabKeyDown}
            className='-mx-1 flex gap-1 overflow-x-auto px-1'
          >
            {TABS.map(item => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  id={`result-tab-${item.id}`}
                  type='button'
                  role='tab'
                  aria-selected={isActive}
                  aria-controls={`result-panel-${item.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => changeTab(item.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {item.label}
                  {tabCount[item.id] !== null && (
                    <span className={`ml-1.5 tabular ${isActive ? 'opacity-70' : 'opacity-60'}`}>{tabCount[item.id]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {tab === 'overview' && (
        <div role='tabpanel' id='result-panel-overview' aria-labelledby='result-tab-overview' className='space-y-4'>
          <div className='card p-5 animate-fade-up'>
            <MatchScore
              score={result.matchScore}
              matchedKeywordsCount={result.matchedKeywords.length}
              missingSkillsCount={result.missingSkills.length}
            />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='card p-5 animate-fade-up'>
              <ScoreBreakdown
                items={result.scoreBreakdown}
                repetitionPenalty={result.repetitionPenalty}
                matchScore={result.matchScore}
                notes={result.scoreNotes ?? []}
              />
            </div>

            <div className='card p-5 animate-fade-up'>
              <h4 className='font-display text-lg'>Before you apply</h4>
              <p className='mt-1 text-xs text-[var(--muted)]'>Five checks worth doing after any edit.</p>
              <ul className='mt-3 space-y-2.5'>
                {CHECKLIST.map(item => (
                  <li key={item} className='flex items-start gap-2.5 text-sm text-[var(--muted)]'>
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]' aria-hidden='true' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className='mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]'>
                This score is a guide, not a hiring prediction. Only add skills you actually have.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'matched' && (
        <div role='tabpanel' id='result-panel-matched' aria-labelledby='result-tab-matched' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='card p-5 animate-fade-up'>
              <KeywordChips
                title='Keywords you already match'
                helperText='Tap one to find it in your text.'
                keywords={result.matchedKeywords}
                variant='matched'
                onSelect={selectTerm}
                activeKeyword={activeTerm}
                emptyMessage='No strong overlaps found yet. Add more complete resume text.'
              />
            </div>

            <div className='card p-5 animate-fade-up'>
              <h4 className='font-display text-lg'>Skills you already show</h4>
              <p className='mt-1 text-xs text-[var(--muted)]'>Recognised skills found in both documents.</p>
              {result.matchedSkills.length === 0 ? (
                <p className='mt-3 text-sm text-[var(--muted)]'>No recognised skills matched yet.</p>
              ) : (
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {result.matchedSkills.map(({ skill, category }) => (
                    <button
                      key={skill}
                      type='button'
                      onClick={() => selectTerm(activeTerm === skill ? '' : skill)}
                      aria-pressed={activeTerm === skill}
                      className='chip chip-accent'
                      title={category}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='card p-5 animate-fade-up'>
            <h4 className='font-display text-lg'>Where the matches live</h4>
            <p className='mt-1 mb-3 text-xs text-[var(--muted)]'>The highlighted terms were counted in both documents.</p>
            <SourcePanel
              resumeText={resumeText}
              jobPostText={jobPostText}
              terms={matchedTerms}
              mode='matches'
              activeTerm={activeTerm}
              onTermSelect={setActiveTerm}
            />
          </div>
        </div>
      )}

      {tab === 'gaps' && (
        <div role='tabpanel' id='result-panel-gaps' aria-labelledby='result-tab-gaps' className='space-y-4'>
          <div className='card p-5 animate-fade-up'>
            <JobInsights insights={result.jobInsights} />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='card p-5 animate-fade-up'>
              <KeywordChips
                title='Skills missing from your resume'
                helperText='Important in the job post, not found in yours. Tap to see where.'
                keywords={result.missingSkills.map(item => ({ keyword: item.skill, count: 1 }))}
                variant='missing'
                onSelect={selectTerm}
                activeKeyword={activeTerm}
                emptyMessage='No obvious missing skills detected.'
              />
            </div>

            <div className='card p-5 animate-fade-up'>
              <KeywordChips
                title='Missing keywords'
                helperText='Other job-post terms your resume does not mention.'
                keywords={result.missingKeywords}
                variant='missing'
                onSelect={selectTerm}
                activeKeyword={activeTerm}
                emptyMessage='No obvious missing keywords detected.'
              />
            </div>
          </div>

          <div className='card p-5 animate-fade-up'>
            <h4 className='font-display text-lg'>See the gap in context</h4>
            <p className='mt-1 mb-3 text-xs text-[var(--muted)]'>Only add what you can honestly support.</p>
            <SourcePanel
              resumeText={resumeText}
              jobPostText={jobPostText}
              terms={gapTerms}
              mode='gaps'
              activeTerm={activeTerm}
              onTermSelect={setActiveTerm}
            />
          </div>
        </div>
      )}

      {tab === 'improve' && (
        <div role='tabpanel' id='result-panel-improve' aria-labelledby='result-tab-improve' className='space-y-4'>
          <div className='card p-5 animate-fade-up'>
            <SuggestedBullets bullets={result.suggestedBullets} />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='card p-5 animate-fade-up'>
              <RepeatedPhrases phrases={result.repeatedPhrases} />
            </div>
            <div className='card p-5 animate-fade-up'>
              <ResumeQualityChecks checks={result.resumeQualityChecks} />
            </div>
          </div>

          <ExportActions result={result} />
        </div>
      )}
    </div>
  );
}
