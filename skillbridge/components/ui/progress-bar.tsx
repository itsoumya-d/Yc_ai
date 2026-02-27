interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'teal' | 'green' | 'orange' | 'auto';
  className?: string;
}

function getAutoColor(percent: number): string {
  if (percent >= 80) return 'bg-green-500';
  if (percent >= 60) return 'bg-teal-500';
  if (percent >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

const colorClasses: Record<string, string> = {
  teal: 'bg-teal-500',
  green: 'bg-green-500',
  orange: 'bg-sunrise-500',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  colorScheme = 'teal',
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = colorScheme === 'auto' ? getAutoColor(percent) : colorClasses[colorScheme];

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-stone-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-stone-900">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-stone-100 ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `${Math.round(percent)}% complete`}
      >
        <div
          className={`rounded-full transition-all duration-600 ease-out ${fillColor} ${sizeClasses[size]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
