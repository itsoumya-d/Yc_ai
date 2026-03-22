'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  /** The value to watch for changes */
  value: T;
  /** Server action or async function to save with */
  onSave: (value: T) => Promise<{ error?: string } | void>;
  /** Debounce delay in ms (default: 1500) */
  delay?: number;
  /** Skip saving if value matches this (e.g., initial value) */
  skipIf?: (value: T) => boolean;
}

/**
 * Auto-save hook with debounce and status indicator.
 * Usage: const { status, statusText } = useAutoSave({ value, onSave });
 * Then render: <AutoSaveIndicator status={status} text={statusText} />
 */
export function useAutoSave<T>({
  value,
  onSave,
  delay = 1500,
  skipIf,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const prevValueRef = useRef(value);

  // Don't fire on first mount
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (skipIf?.(value)) return;
    if (JSON.stringify(value) === JSON.stringify(prevValueRef.current)) return;

    prevValueRef.current = value;
    setStatus('pending');

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        const result = await onSave(value);
        if (result && 'error' in result && result.error) {
          setStatus('error');
          // Revert to idle after 3s
          setTimeout(() => setStatus('idle'), 3000);
        } else {
          setStatus('saved');
          // Revert to idle after 2.5s
          setTimeout(() => setStatus('idle'), 2500);
        }
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSave, delay, skipIf]);

  const statusText: Record<SaveStatus, string> = {
    idle: '',
    pending: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'Saved ✓',
    error: 'Save failed',
  };

  return { status, statusText: statusText[status] };
}
