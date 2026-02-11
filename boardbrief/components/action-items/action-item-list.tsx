import { ActionItemCard } from './action-item-card';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckSquare } from 'lucide-react';
import type { ActionItem } from '@/types/database';

interface ActionItemListProps {
  items: ActionItem[];
  onItemClick?: (item: ActionItem) => void;
}

export function ActionItemList({ items, onItemClick }: ActionItemListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No action items yet"
        description="Create your first action item to track tasks and follow-ups."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActionItemCard key={item.id} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
}
