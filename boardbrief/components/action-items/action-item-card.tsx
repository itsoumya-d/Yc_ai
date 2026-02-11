import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { CalendarClock, User } from 'lucide-react';
import type { ActionItem, ActionItemPriority } from '@/types/database';

interface ActionItemCardProps {
  item: ActionItem;
  onClick?: (item: ActionItem) => void;
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
}

export function ActionItemCard({ item, onClick }: ActionItemCardProps) {
  const overdue = isOverdue(item.due_date, item.status);

  return (
    <Card
      className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--foreground)] truncate">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <Badge variant={item.priority as ActionItemPriority}>
            {item.priority}
          </Badge>
          <Badge variant={item.status}>
            {item.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
        {item.assignee_name && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{item.assignee_name}</span>
          </div>
        )}
        {item.due_date && (
          <div
            className={`flex items-center gap-1 ${
              overdue ? 'text-red-600 font-medium' : ''
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>
              {overdue ? 'Overdue: ' : 'Due: '}
              {formatDate(item.due_date)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
