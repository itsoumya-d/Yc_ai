import { getContentBlocks } from '@/lib/actions/content-blocks';
import { PageHeader } from '@/components/layout/page-header';
import { ContentBlockList } from '@/components/content-library/content-block-list';
import { ContentBlockForm } from '@/components/content-library/content-block-form';

export const dynamic = 'force-dynamic';

export default async function ContentLibraryPage() {
  const { data: blocks } = await getContentBlocks();

  return (
    <div className="space-y-6">
      <PageHeader title="Content Library" description="Reusable content blocks for your proposals." />
      <ContentBlockForm />
      <ContentBlockList blocks={blocks ?? []} />
    </div>
  );
}
