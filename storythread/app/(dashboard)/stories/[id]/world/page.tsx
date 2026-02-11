import { getWorldElements } from '@/lib/actions/worlds';
import { PageHeader } from '@/components/layout/page-header';
import { WorldElementList } from '@/components/world/world-element-list';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'World Builder' };

export default async function WorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getWorldElements(id);

  return (
    <div>
      <PageHeader
        title="World Builder"
        description="Locations, lore, factions, and more."
        className="mb-8"
      />
      <WorldElementList elements={result.data ?? []} storyId={id} />
    </div>
  );
}
