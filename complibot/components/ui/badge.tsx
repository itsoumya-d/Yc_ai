import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        // Severity
        critical: 'bg-red-100 text-red-700 border border-red-200',
        high: 'bg-orange-100 text-orange-700 border border-orange-200',
        medium: 'bg-amber-100 text-amber-700 border border-amber-200',
        low: 'bg-gray-100 text-gray-600 border border-gray-200',
        // Policy status
        draft: 'bg-gray-100 text-gray-600 border border-gray-200',
        review: 'bg-blue-100 text-blue-700 border border-blue-200',
        approved: 'bg-green-100 text-green-700 border border-green-200',
        active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        // Control status
        compliant: 'bg-green-100 text-green-700 border border-green-200',
        partial: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        non_compliant: 'bg-red-100 text-red-700 border border-red-200',
        not_applicable: 'bg-gray-100 text-gray-500 border border-gray-200',
        // Generic
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
        primary: 'bg-blue-100 text-blue-700 border border-blue-200',
        success: 'bg-green-100 text-green-700 border border-green-200',
        warning: 'bg-amber-100 text-amber-700 border border-amber-200',
        destructive: 'bg-red-100 text-red-700 border border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
