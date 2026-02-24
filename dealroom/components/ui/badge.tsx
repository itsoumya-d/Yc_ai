import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DealStage, DealHealth } from '@/types/database';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-violet-100 text-violet-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        outline: 'border border-gray-300 text-gray-600',
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

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(clsx(badgeVariants({ variant }), className))}
      {...props}
    />
  );
}

export function StageBadge({ stage }: { stage: DealStage }) {
  const configs: Record<DealStage, { label: string; variant: BadgeProps['variant'] }> = {
    prospecting: { label: 'Prospecting', variant: 'default' },
    qualification: { label: 'Qualification', variant: 'info' },
    proposal: { label: 'Proposal', variant: 'primary' },
    negotiation: { label: 'Negotiation', variant: 'warning' },
    closed_won: { label: 'Closed Won', variant: 'success' },
    closed_lost: { label: 'Closed Lost', variant: 'danger' },
  };
  const { label, variant } = configs[stage] ?? { label: stage, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function HealthBadge({ health }: { health: DealHealth }) {
  const configs: Record<DealHealth, { label: string; variant: BadgeProps['variant'] }> = {
    healthy: { label: 'Healthy', variant: 'success' },
    at_risk: { label: 'At Risk', variant: 'warning' },
    critical: { label: 'Critical', variant: 'danger' },
    stalled: { label: 'Stalled', variant: 'default' },
  };
  const { label, variant } = configs[health] ?? { label: health, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
