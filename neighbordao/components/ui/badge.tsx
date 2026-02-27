import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'event'
  | 'vote'
  | 'earth'
  | 'sky'
  | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-leaf-100 text-leaf-700',
  secondary: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  event: 'bg-purple-100 text-purple-700',
  vote: 'bg-blue-100 text-blue-700',
  earth: 'bg-earth-100 text-earth-700',
  sky: 'bg-sky-100 text-sky-700',
  outline: 'border border-[var(--border)] text-[var(--foreground)] bg-transparent',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant, BadgeSize };
