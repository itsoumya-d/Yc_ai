import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-heading text-2xl font-bold text-[var(--foreground)]">{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            <svg
              className={cn('mr-0.5 h-3 w-3', !trend.isPositive && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
