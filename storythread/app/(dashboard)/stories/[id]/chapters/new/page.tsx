import { PageHeader } from '@/components/layout/page-header';
import { ChapterForm } from '@/components/stories/chapter-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Chapter' };

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageHeader title="New Chapter" className="mb-8" />
      <ChapterForm storyId={id} />
    </div>
  );
}
