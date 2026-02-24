import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        info: 'bg-blue-100 text-blue-700',
        danger: 'bg-red-100 text-red-700',
        muted: 'bg-gray-100 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
