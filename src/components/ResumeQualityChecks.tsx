import { ResumeQualityCheck } from '@/lib/scoring';

interface ResumeQualityChecksProps {
  checks: ResumeQualityCheck[];
}

export function ResumeQualityChecks({ checks }: ResumeQualityChecksProps) {
  const colorByStatus = {
    pass: 'text-[var(--accent)]',
    warning: 'text-[var(--warn)]',
    info: 'text-[var(--muted)]',
  };

  const dotByStatus = {
    pass: 'bg-[var(--accent)]',
    warning: 'bg-[var(--warn)]',
    info: 'bg-[var(--muted)]',
  };

  return (
    <div>
      <h4 className='font-display text-lg'>Quality checks</h4>
      <p className='mt-1 mb-4 text-xs text-[var(--muted)]'>Fast checks for clarity, evidence, and readability.</p>
      <div className='space-y-2.5'>
        {checks.map(check => (
          <div key={check.id} className='rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3'>
            <div className='flex items-center justify-between gap-3'>
              <p className='flex items-center gap-2 text-sm font-medium text-[var(--foreground)]'>
                <span className={`h-1.5 w-1.5 rounded-full ${dotByStatus[check.status]}`} aria-hidden='true' />
                {check.label}
              </p>
              <span className={`font-mono text-[0.6875rem] uppercase tracking-wider ${colorByStatus[check.status]}`}>
                {check.status}
              </span>
            </div>
            <p className='mt-1 text-xs text-[var(--muted)]'>{check.detail}</p>
            <p className='mt-1.5 text-xs text-[var(--foreground)]'>{check.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
