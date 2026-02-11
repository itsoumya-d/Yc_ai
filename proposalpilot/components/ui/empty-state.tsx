import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <div className="mb-4 text-[var(--muted-foreground)]"><Icon className="w-10 h-10" /></div>}
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
      {action && <div className="mt-4"><Link href={action.href}><Button>{action.label}</Button></Link></div>}
    </div>
  );
}
