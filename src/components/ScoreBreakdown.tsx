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
      <h4 className='font-display text-lg'>How the score was built</h4>
      <p className='mt-1 mb-4 text-xs text-[var(--muted)]'>
        Each measured signal, its weight, and the points it added. Weights add up to 100%.
      </p>
      <div className='space-y-3.5'>
        {items.map(item => (
          <div key={item.label}>
            <div className='mb-1 flex items-baseline justify-between gap-3 text-sm'>
              <span className='font-medium text-[var(--foreground)]'>{item.label}</span>
              <span className='font-mono text-[0.7rem] tabular text-[var(--muted)]'>
                {item.score}% · w{item.weight}%
                {typeof item.contribution === 'number' ? ` · +${item.contribution}` : ''}
              </span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-[var(--track)]'>
              <div
                className='animate-grow h-full rounded-full bg-[var(--accent)]'
                style={{ width: `${Math.min(100, item.score)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {(items.length > 0 || repetitionPenalty > 0) && (
        <div className='mt-4 space-y-1 border-t border-[var(--border)] pt-3'>
          <p className='text-xs text-[var(--foreground)]'>
            Signals total {contributionTotal.toFixed(1)} pts
            {repetitionPenalty > 0 ? ` minus ${repetitionPenalty} repetition penalty` : ''}
            {typeof matchScore === 'number' ? ` = ${matchScore}% match` : ''}
          </p>
          {repetitionPenalty > 0 && (
            <p className='text-xs text-[var(--warn)]'>Repetition penalty applied: -{repetitionPenalty} points.</p>
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
