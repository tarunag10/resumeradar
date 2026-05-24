import { ScoreBreakdownItem } from '@/lib/scoring';

interface ScoreBreakdownProps {
  items: ScoreBreakdownItem[];
  repetitionPenalty: number;
}

export function ScoreBreakdown({ items, repetitionPenalty }: ScoreBreakdownProps) {
  return (
    <div>
      <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Score breakdown</h4>
      <p className='text-xs text-[var(--muted)] mb-4'>How each signal contributed to the final match score.</p>
      <div className='space-y-3'>
        {items.map(item => (
          <div key={item.label}>
            <div className='flex items-center justify-between gap-3 text-sm mb-1'>
              <span className='font-medium text-[var(--foreground)]'>{item.label}</span>
              <span className='text-[var(--muted)]'>{item.score}% · {item.weight}% weight</span>
            </div>
            <div className='h-2 rounded-full bg-[var(--border)] overflow-hidden'>
              <div className='h-full rounded-full bg-[var(--foreground)]' style={{ width: `${Math.min(100, item.score)}%` }} />
            </div>
            <p className='text-xs text-[var(--muted)] mt-1'>{item.detail}</p>
          </div>
        ))}
      </div>
      {repetitionPenalty > 0 && (
        <p className='text-xs text-amber-600 dark:text-amber-400 mt-4'>
          Repetition penalty applied: -{repetitionPenalty} points.
        </p>
      )}
    </div>
  );
}
