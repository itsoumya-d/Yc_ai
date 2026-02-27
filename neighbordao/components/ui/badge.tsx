import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'earth' | 'sky' | 'red' | 'amber' | 'blue' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700',
  green: 'bg-leaf-50 text-leaf-700',
  earth: 'bg-earth-50 text-earth-700',
  sky: 'bg-sky-50 text-sky-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  outline: 'bg-transparent border border-border text-text-secondary',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
