import { getActionItems } from '@/lib/actions/action-items';
import { PageHeader } from '@/components/layout/page-header';
import { ActionItemsKanban } from '@/components/action-items/action-items-kanban';

export const dynamic = 'force-dynamic';

export default async function ActionItemsPage() {
  const { data: items } = await getActionItems();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Items"
        description="Drag items between columns to update status. Use AI Extraction to pull tasks from meeting notes."
      />
      <ActionItemsKanban initialItems={items ?? []} />
    </div>
  );
}
