import { clsx } from 'clsx';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'sky' | 'green' | 'yellow' | 'red' | 'indigo';
}

const colorMap = {
  sky: 'bg-sky-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'sky',
  className,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('space-y-1', className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-gray-700">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', sizeMap[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx('rounded-full transition-all duration-500', colorMap[color], sizeMap[size])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
