import { getStory } from '@/lib/actions/stories';
import { PageHeader } from '@/components/layout/page-header';
import { StoryForm } from '@/components/stories/story-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Story' };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getStory(id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Story" className="mb-8" />
      <StoryForm story={result.data} />
    </div>
  );
}
