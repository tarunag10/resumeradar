import { ResumeQualityCheck } from '@/lib/scoring';

interface ResumeQualityChecksProps {
  checks: ResumeQualityCheck[];
}

export function ResumeQualityChecks({ checks }: ResumeQualityChecksProps) {
  const colorByStatus = {
    pass: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div>
      <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Resume quality checks</h4>
      <p className='text-xs text-[var(--muted)] mb-4'>Fast checks for clarity, evidence, and readability.</p>
      <div className='space-y-3'>
        {checks.map(check => (
          <div key={check.id} className='p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-sm font-medium text-[var(--foreground)]'>{check.label}</p>
              <span className={`text-xs font-medium capitalize ${colorByStatus[check.status]}`}>{check.status}</span>
            </div>
            <p className='text-xs text-[var(--muted)] mt-1'>{check.detail}</p>
            <p className='text-xs text-[var(--foreground)] mt-2'>{check.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
