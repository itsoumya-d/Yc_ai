'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-card transition-shadow duration-normal hover:shadow-card-hover',
        className
      )}
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-600">
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="font-heading text-2xl font-semibold text-[var(--card-foreground)]">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                trend.direction === 'up'
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {trend.direction === 'up' ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                  />
                </svg>
              )}
              {trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
