import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        paid: 'bg-status-paid-bg text-status-paid',
        overdue: 'bg-status-overdue-bg text-status-overdue',
        pending: 'bg-status-pending-bg text-status-pending',
        draft: 'bg-status-draft-bg text-status-draft',
        sent: 'bg-status-sent-bg text-status-sent',
        viewed: 'bg-status-viewed-bg text-status-viewed',
        partial: 'bg-status-partial-bg text-status-partial',
        cancelled: 'bg-status-cancelled-bg text-status-cancelled',
        excellent: 'bg-green-50 text-green-700',
        good: 'bg-blue-50 text-blue-700',
        fair: 'bg-yellow-50 text-yellow-700',
        at_risk: 'bg-red-50 text-red-700',
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
