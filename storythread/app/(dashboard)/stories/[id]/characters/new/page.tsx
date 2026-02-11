import { PageHeader } from '@/components/layout/page-header';
import { CharacterForm } from '@/components/characters/character-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Character' };

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageHeader title="New Character" className="mb-8" />
      <CharacterForm storyId={id} />
    </div>
  );
}
