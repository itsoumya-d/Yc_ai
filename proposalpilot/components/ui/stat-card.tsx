import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  description?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
        {Icon && <div className="text-[var(--muted-foreground)]"><Icon className="w-5 h-5" /></div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {description && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>}
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
          {trend.positive ? '\u2191' : '\u2193'} {trend.value}
        </p>
      )}
    </div>
  );
}
