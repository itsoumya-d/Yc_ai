import { getStory } from '@/lib/actions/stories';
import { getCollaborators } from '@/lib/actions/collaborators';
import { StoryDetail } from '@/components/stories/story-detail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getStory(id);
  return { title: result.data?.title ?? 'Story' };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [storyResult, collabResult] = await Promise.all([
    getStory(id),
    getCollaborators(id),
  ]);

  if (storyResult.error || !storyResult.data) {
    notFound();
  }

  return (
    <StoryDetail
      story={storyResult.data}
      collaborators={collabResult.data ?? []}
    />
  );
}
