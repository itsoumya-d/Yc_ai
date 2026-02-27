import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-trust-100 text-trust-700',
  green: 'bg-approval-100 text-approval-700',
  red: 'bg-denial-100 text-denial-700',
  amber: 'bg-deadline-100 text-deadline-700',
  blue: 'bg-notice-100 text-notice-700',
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
