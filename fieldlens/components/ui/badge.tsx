import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'orange' | 'blue' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-safety-100 text-safety-700',
  green: 'bg-success-100 text-success-700',
  red: 'bg-error-100 text-error-700',
  amber: 'bg-warning-100 text-warning-700',
  orange: 'bg-safety-100 text-safety-700',
  blue: 'bg-slate-100 text-slate-700',
  gray: 'bg-surface-secondary text-text-secondary',
  outline: 'bg-transparent border border-border text-text-secondary',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
