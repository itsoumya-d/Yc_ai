import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-brand-100 text-brand-700',
  green: 'bg-success-100 text-success-700',
  red: 'bg-danger-100 text-danger-700',
  amber: 'bg-warn-100 text-warn-700',
  blue: 'bg-brand-100 text-brand-700',
  purple: 'bg-ai-100 text-ai-700',
  gray: 'bg-surface-secondary text-text-secondary',
  outline: 'bg-transparent border border-border text-text-secondary',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
