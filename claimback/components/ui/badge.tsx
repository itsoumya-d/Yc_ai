import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'blue' | 'orange' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-champion-100 text-champion-700',
  green: 'bg-success-100 text-success-700',
  red: 'bg-danger-100 text-danger-700',
  amber: 'bg-caution-100 text-caution-700',
  blue: 'bg-champion-100 text-champion-700',
  orange: 'bg-energy-100 text-energy-700',
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
