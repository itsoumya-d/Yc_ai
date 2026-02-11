import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        draft: 'bg-slate-100 text-slate-600',
        sent: 'bg-blue-50 text-blue-700',
        viewed: 'bg-amber-50 text-amber-700',
        won: 'bg-emerald-50 text-emerald-700',
        lost: 'bg-gray-100 text-gray-600',
        expired: 'bg-red-50 text-red-600',
        archived: 'bg-gray-100 text-gray-500',
        fixed: 'bg-blue-50 text-blue-700',
        time_materials: 'bg-purple-50 text-purple-700',
        retainer: 'bg-green-50 text-green-700',
        value_based: 'bg-amber-50 text-amber-700',
        milestone: 'bg-orange-50 text-orange-700',
        case_study: 'bg-indigo-50 text-indigo-700',
        team_bio: 'bg-pink-50 text-pink-700',
        methodology: 'bg-cyan-50 text-cyan-700',
        terms: 'bg-slate-100 text-slate-700',
        about: 'bg-violet-50 text-violet-700',
        faq: 'bg-teal-50 text-teal-700',
        info: 'bg-sky-50 text-sky-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
