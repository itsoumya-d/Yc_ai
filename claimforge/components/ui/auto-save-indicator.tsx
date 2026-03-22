'use client';

import { cn } from '@/lib/utils';
import { Loader2, Check, AlertCircle, Clock } from 'lucide-react';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  text?: string;
  className?: string;
}

export function AutoSaveIndicator({ status, text, className }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs transition-all duration-300',
        status === 'saving' && 'text-muted-foreground',
        status === 'pending' && 'text-amber-500 dark:text-amber-400',
        status === 'saved' && 'text-emerald-600 dark:text-emerald-400',
        status === 'error' && 'text-red-500 dark:text-red-400',
        className
      )}
      aria-live="polite"
    >
      {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'pending' && <Clock className="h-3 w-3" />}
      {status === 'saved' && <Check className="h-3 w-3" />}
      {status === 'error' && <AlertCircle className="h-3 w-3" />}
      <span>{text}</span>
    </span>
  );
}
