import { PageHeader } from '@/components/layout/page-header';
import { StoryForm } from '@/components/stories/story-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Story' };

export default function NewStoryPage() {
  return (
    <div>
      <PageHeader title="Create New Story" className="mb-8" />
      <StoryForm />
    </div>
  );
}
