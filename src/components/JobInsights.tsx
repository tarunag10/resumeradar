import { JobInsights as JobInsightsData } from '@/lib/scoring';

interface JobInsightsProps {
  insights: JobInsightsData;
}

function InlineList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <span className='text-[var(--muted)]'>{empty}</span>;
  }

  return (
    <span className='flex flex-wrap gap-2'>
      {items.map(item => (
        <span key={item} className='px-2 py-1 rounded-full text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]'>
          {item}
        </span>
      ))}
    </span>
  );
}

export function JobInsights({ insights }: JobInsightsProps) {
  return (
    <div>
      <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Job post insights</h4>
      <p className='text-xs text-[var(--muted)] mb-4'>Signals extracted from the job post to help you tailor honestly.</p>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <p className='text-xs text-[var(--muted)] mb-1'>Detected role</p>
          <p className='text-sm font-medium text-[var(--foreground)]'>{insights.roleTitle}</p>
        </div>
        <div>
          <p className='text-xs text-[var(--muted)] mb-1'>Seniority</p>
          <p className='text-sm font-medium text-[var(--foreground)]'>{insights.seniority}</p>
        </div>
        <div className='sm:col-span-2'>
          <p className='text-xs text-[var(--muted)] mb-2'>Required skills</p>
          <InlineList items={insights.requiredSkills} empty='No required skills detected' />
        </div>
        <div className='sm:col-span-2'>
          <p className='text-xs text-[var(--muted)] mb-2'>Preferred skills</p>
          <InlineList items={insights.preferredSkills} empty='No preferred skills detected' />
        </div>
        <div className='sm:col-span-2'>
          <p className='text-xs text-[var(--muted)] mb-2'>Responsibilities</p>
          {insights.responsibilities.length > 0 ? (
            <ul className='space-y-2'>
              {insights.responsibilities.map(item => (
                <li key={item} className='text-sm text-[var(--foreground)]'>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-[var(--muted)]'>No clear responsibility lines detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
