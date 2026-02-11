import { getStories } from '@/lib/actions/stories';
import { PageHeader } from '@/components/layout/page-header';
import { StoryList } from '@/components/stories/story-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Stories' };

export default async function StoriesPage() {
  const result = await getStories();

  return (
    <div>
      <PageHeader
        title="My Stories"
        description="All your stories in one place."
        action={
          <Link href="/stories/new">
            <Button>New Story</Button>
          </Link>
        }
        className="mb-8"
      />
      <StoryList stories={result.data ?? []} />
    </div>
  );
}
