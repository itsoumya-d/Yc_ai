import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'blue' | 'orange' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-trust-50 text-trust-700',
  green: 'bg-shield-50 text-shield-700',
  red: 'bg-alert-50 text-alert-700',
  amber: 'bg-warn-50 text-warn-700',
  blue: 'bg-trust-50 text-trust-700',
  orange: 'bg-orange-50 text-orange-700',
  gray: 'bg-gray-100 text-gray-600',
  outline: 'border border-border text-text-secondary bg-transparent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-badge)] px-2.5 py-0.5 text-xs font-medium capitalize',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
