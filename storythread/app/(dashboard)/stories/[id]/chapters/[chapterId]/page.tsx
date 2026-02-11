import { getChapter } from '@/lib/actions/chapters';
import { getStory } from '@/lib/actions/stories';
import { ChapterEditor } from '@/components/stories/chapter-editor';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { chapterId } = await params;
  const result = await getChapter(chapterId);
  return { title: result.data?.title ?? 'Chapter' };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;

  const [chapterResult, storyResult] = await Promise.all([
    getChapter(chapterId),
    getStory(id),
  ]);

  if (chapterResult.error || !chapterResult.data || storyResult.error || !storyResult.data) {
    notFound();
  }

  return (
    <ChapterEditor
      chapter={chapterResult.data}
      storyDescription={storyResult.data.description ?? ''}
      characters={storyResult.data.characters}
      storyId={id}
    />
  );
}
