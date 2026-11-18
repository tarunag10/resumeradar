'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 10);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(onClose, 220);
    }, duration);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const tone = {
    success: 'border-[var(--accent)] text-[var(--accent-ink)] bg-[var(--accent-soft)]',
    error: 'border-[var(--danger)] text-[var(--danger)] bg-[var(--danger-soft)]',
    info: 'border-[var(--border-strong)] text-[var(--foreground)] bg-[var(--surface)]',
  }[type];

  return (
    <div
      className={`pointer-events-auto flex w-[min(92vw,22rem)] items-start gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-[var(--shadow-md)] backdrop-blur transition-all duration-200 ${tone} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current' aria-hidden='true' />
      <span className='flex-1 text-xs font-medium leading-relaxed'>{message}</span>
      <button
        type='button'
        onClick={() => {
          setIsVisible(false);
          window.setTimeout(onClose, 220);
        }}
        className='-mr-1 shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100'
        aria-label='Dismiss notification'
      >
        <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    </div>
  );
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  // A counter keeps ids unique when two toasts are added in the same millisecond, and a
  // stable callback keeps the autosave effects from re-running on every render.
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    counter.current += 1;
    const id = `toast-${Date.now().toString(36)}-${counter.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
