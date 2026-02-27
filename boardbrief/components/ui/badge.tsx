import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-navy-800 text-white',

        // Meeting status
        draft: 'border-transparent bg-slate-100 text-slate-700',
        scheduled: 'border-transparent bg-blue-100 text-blue-700',
        completed: 'border-transparent bg-green-100 text-green-700',
        canceled: 'border-transparent bg-gray-100 text-gray-500',

        // Meeting type
        regular: 'border-transparent bg-navy-100 text-navy-700',
        special: 'border-transparent bg-amber-100 text-amber-700',
        committee: 'border-transparent bg-purple-100 text-purple-700',
        annual: 'border-transparent bg-gold-100 text-gold-700',

        // Member type
        director: 'border-transparent bg-navy-100 text-navy-700',
        observer: 'border-transparent bg-sky-100 text-sky-700',
        advisor: 'border-transparent bg-emerald-100 text-emerald-700',

        // Action item status
        open: 'border-transparent bg-blue-100 text-blue-700',
        in_progress: 'border-transparent bg-amber-100 text-amber-700',
        deferred: 'border-transparent bg-orange-100 text-orange-700',

        // Priority
        high: 'border-transparent bg-red-100 text-red-700',
        medium: 'border-transparent bg-yellow-100 text-yellow-700',
        low: 'border-transparent bg-green-100 text-green-700',

        // Resolution status
        voting: 'border-transparent bg-blue-100 text-blue-700',
        passed: 'border-transparent bg-green-100 text-green-700',
        failed: 'border-transparent bg-red-100 text-red-700',

        // Attendee status
        invited: 'border-transparent bg-sky-100 text-sky-700',
        confirmed: 'border-transparent bg-green-100 text-green-700',
        declined: 'border-transparent bg-red-100 text-red-700',
        attended: 'border-transparent bg-emerald-100 text-emerald-700',

        // General
        info: 'border-transparent bg-sky-100 text-sky-700',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        destructive: 'border-transparent bg-red-100 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
