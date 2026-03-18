import { getTranslations } from 'next-intl/server';
import { getActionItems } from '@/lib/actions/action-items';
import { PageHeader } from '@/components/layout/page-header';
import { ActionItemList } from '@/components/action-items/action-item-list';

export const dynamic = 'force-dynamic';

export default async function ActionItemsPage() {
  const t = await getTranslations('actionItems');
  const { data: items } = await getActionItems();
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <ActionItemList items={items ?? []} />
    </div>
  );
}
