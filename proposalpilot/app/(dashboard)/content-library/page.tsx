import { getContentBlocks } from '@/lib/actions/content-blocks';
import { PageHeader } from '@/components/layout/page-header';
import { ContentBlockList } from '@/components/content-library/content-block-list';
import { ContentBlockForm } from '@/components/content-library/content-block-form';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function ContentLibraryPage() {
  const t = await getTranslations('contentLibrary');
  const { data: blocks } = await getContentBlocks();

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <ContentBlockForm />
      <ContentBlockList blocks={blocks ?? []} />
    </div>
  );
}
