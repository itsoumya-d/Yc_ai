'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MapPin, BookOpen, Scale, Calendar, Package, Users } from 'lucide-react';
import type { WorldElement, WorldElementType } from '@/types/database';

const TYPE_ICONS: Record<WorldElementType, React.ComponentType<{ className?: string }>> = {
  location: MapPin,
  lore: BookOpen,
  rule: Scale,
  event: Calendar,
  item: Package,
  faction: Users,
};

interface WorldElementCardProps {
  element: WorldElement;
  onClick?: () => void;
  className?: string;
}

export function WorldElementCard({ element, onClick, className }: WorldElementCardProps) {
  const Icon = TYPE_ICONS[element.type as WorldElementType] || BookOpen;

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
          <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-[var(--foreground)]">{element.name}</h4>
          <Badge variant={element.type as WorldElementType} className="mt-1">{element.type}</Badge>
        </div>
      </div>
      {element.description && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-2">{element.description}</p>
      )}
    </div>
  );
}
