import { getTranslations } from 'next-intl/server';
import { getStories } from '@/lib/actions/stories';
import { PageHeader } from '@/components/layout/page-header';
import { StoryList } from '@/components/stories/story-list';
import { FocusModeToggle } from '@/components/stories/focus-mode-toggle';
import { ImportStoriesButton } from '@/components/stories/import-stories-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Stories' };

export default async function StoriesPage() {
  const [result, t] = await Promise.all([
    getStories(),
    getTranslations('stories'),
  ]);

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <div className="flex items-center gap-3">
            <FocusModeToggle />
            <ImportStoriesButton />
            <Link href="/stories/new">
              <Button>{t('new')}</Button>
            </Link>
          </div>
        }
        className="mb-8"
      />
      <StoryList stories={result.data ?? []} />
    </div>
  );
}
