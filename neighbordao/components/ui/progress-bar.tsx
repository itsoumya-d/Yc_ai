import { cn } from '@/lib/utils';

type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressColor = 'leaf' | 'earth' | 'sky' | 'success';

interface ProgressBarProps {
  value: number;
  size?: ProgressSize;
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorStyles: Record<ProgressColor, string> = {
  leaf: 'bg-leaf-500',
  earth: 'bg-earth-500',
  sky: 'bg-sky-400',
  success: 'bg-green-500',
};

export function ProgressBar({
  value,
  size = 'md',
  color = 'leaf',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-[var(--muted)]',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[color]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-sm font-medium tabular-nums text-[var(--muted-foreground)]">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}

export type { ProgressBarProps, ProgressSize, ProgressColor };
