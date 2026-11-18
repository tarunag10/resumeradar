interface PrivacyBadgeProps {
  className?: string;
}

export function PrivacyBadge({ className = '' }: PrivacyBadgeProps) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] text-[var(--muted)] ${className}`}>
      <span className='inline-flex items-center gap-1.5'>
        <span className='h-1.5 w-1.5 rounded-full bg-[var(--accent)]' aria-hidden='true' />
        stays in this browser
      </span>
      <span aria-hidden='true'>/</span>
      <span>no account</span>
      <span aria-hidden='true'>/</span>
      <span>free</span>
    </p>
  );
}
