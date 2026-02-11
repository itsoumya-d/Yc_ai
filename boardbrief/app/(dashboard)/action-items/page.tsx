import { getActionItems } from '@/lib/actions/action-items';
import { PageHeader } from '@/components/layout/page-header';
import { ActionItemList } from '@/components/action-items/action-item-list';

export const dynamic = 'force-dynamic';

export default async function ActionItemsPage() {
  const { data: items } = await getActionItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Action Items" description="Track and manage board action items." />
      <ActionItemList items={items ?? []} />
    </div>
  );
}
