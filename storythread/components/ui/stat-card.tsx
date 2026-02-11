import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
        {icon && <div className="text-[var(--muted-foreground)]">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
          {trend.positive ? '\u2191' : '\u2193'} {trend.value}
        </p>
      )}
    </div>
  );
}
