import { getCharacters } from '@/lib/actions/characters';
import { PageHeader } from '@/components/layout/page-header';
import { CharacterList } from '@/components/characters/character-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Characters' };

export default async function CharactersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCharacters(id);

  return (
    <div>
      <PageHeader
        title="Character Bible"
        description="All characters in this story."
        action={
          <Link href={`/stories/${id}/characters/new`}>
            <Button>Add Character</Button>
          </Link>
        }
        className="mb-8"
      />
      <CharacterList characters={result.data ?? []} storyId={id} />
    </div>
  );
}
