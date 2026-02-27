import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        draft: 'bg-slate-100 text-slate-600',
        in_progress: 'bg-blue-50 text-blue-700',
        completed: 'bg-green-50 text-green-700',
        published: 'bg-rose-50 text-rose-700',
        archived: 'bg-gray-100 text-gray-600',
        review: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
        scheduled: 'bg-amber-50 text-amber-700',
        fantasy: 'bg-purple-50 text-purple-700',
        sci_fi: 'bg-cyan-50 text-cyan-700',
        romance: 'bg-pink-50 text-pink-700',
        mystery: 'bg-indigo-50 text-indigo-700',
        horror: 'bg-red-50 text-red-700',
        literary: 'bg-amber-50 text-amber-700',
        thriller: 'bg-orange-50 text-orange-700',
        historical: 'bg-yellow-50 text-yellow-700',
        adventure: 'bg-emerald-50 text-emerald-700',
        comedy: 'bg-lime-50 text-lime-700',
        drama: 'bg-violet-50 text-violet-700',
        other: 'bg-gray-100 text-gray-600',
        protagonist: 'bg-brand-100 text-brand-700',
        antagonist: 'bg-red-50 text-red-700',
        supporting: 'bg-blue-50 text-blue-700',
        minor: 'bg-gray-100 text-gray-600',
        mentioned: 'bg-gray-50 text-gray-500',
        location: 'bg-green-50 text-green-700',
        lore: 'bg-purple-50 text-purple-700',
        rule: 'bg-orange-50 text-orange-700',
        event: 'bg-blue-50 text-blue-700',
        item: 'bg-yellow-50 text-yellow-700',
        faction: 'bg-red-50 text-red-700',
        info: 'bg-sky-50 text-sky-700',
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
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
