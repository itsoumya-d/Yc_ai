import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        healthy: 'bg-green-50 text-green-700',
        due: 'bg-yellow-50 text-yellow-700',
        urgent: 'bg-red-50 text-red-700',
        emergency: 'bg-red-100 text-red-800',
        info: 'bg-blue-50 text-blue-700',
        scheduled: 'bg-blue-50 text-blue-700',
        completed: 'bg-green-50 text-green-700',
        cancelled: 'bg-gray-100 text-gray-600',
        missed: 'bg-red-50 text-red-700',
        dog: 'bg-amber-50 text-amber-700',
        cat: 'bg-purple-50 text-purple-700',
        bird: 'bg-sky-50 text-sky-700',
        fish: 'bg-cyan-50 text-cyan-700',
        reptile: 'bg-lime-50 text-lime-700',
        small_mammal: 'bg-pink-50 text-pink-700',
        mild: 'bg-yellow-50 text-yellow-700',
        moderate: 'bg-orange-50 text-orange-700',
        severe: 'bg-red-50 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
