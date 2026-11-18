import { ScoreBreakdownItem } from '@/lib/scoring';

interface ScoreBreakdownProps {
  items: ScoreBreakdownItem[];
  repetitionPenalty: number;
  matchScore?: number;
  notes?: string[];
}

export function ScoreBreakdown({ items, repetitionPenalty, matchScore, notes = [] }: ScoreBreakdownProps) {
  const contributionTotal = Math.round(
    items.reduce((sum, item) => sum + (item.contribution ?? 0), 0) * 10
  ) / 10;

  return (
    <div>
      <h4 className='font-display text-sm font-semibold text-[var(--foreground)] mb-2'>Score breakdown</h4>
      <p className='text-xs text-[var(--muted)] mb-4'>
        How each measured signal contributed to the final match score. Weights add up to 100%.
      </p>
      <div className='space-y-3'>
        {items.map(item => (
          <div key={item.label}>
            <div className='flex items-center justify-between gap-3 text-sm mb-1'>
              <span className='font-medium text-[var(--foreground)]'>{item.label}</span>
              <span className='text-[var(--muted)] text-right'>
                {item.score}% · {item.weight}% weight
                {typeof item.contribution === 'number' ? ` · +${item.contribution} pts` : ''}
              </span>
            </div>
            <div className='h-2 rounded-full bg-[var(--border)] overflow-hidden'>
              <div className='h-full rounded-full bg-[var(--foreground)]' style={{ width: `${Math.min(100, item.score)}%` }} />
            </div>
            <p className='text-xs text-[var(--muted)] mt-1'>{item.detail}</p>
          </div>
        ))}
      </div>

      {(items.length > 0 || repetitionPenalty > 0) && (
        <div className='mt-4 pt-3 border-t border-[var(--border)] space-y-1'>
          <p className='text-xs text-[var(--foreground)]'>
            Signals total {contributionTotal.toFixed(1)} pts
            {repetitionPenalty > 0 ? ` − ${repetitionPenalty} repetition penalty` : ''}
            {typeof matchScore === 'number' ? ` → ${matchScore}% match` : ''}
          </p>
          {repetitionPenalty > 0 && (
            <p className='text-xs text-amber-600 dark:text-amber-400'>
              Repetition penalty applied: -{repetitionPenalty} points.
            </p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <ul className='mt-3 space-y-1'>
          {notes.map(note => (
            <li key={note} className='text-xs text-[var(--muted)]'>
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
