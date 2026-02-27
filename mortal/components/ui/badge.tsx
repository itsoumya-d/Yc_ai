import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-sage-100 text-sage-700',
  green: 'bg-sage-100 text-sage-700',
  red: 'bg-gentlered-100 text-gentlered-700',
  amber: 'bg-warmamber-100 text-warmamber-700',
  blue: 'bg-trustblue-100 text-trustblue-700',
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
