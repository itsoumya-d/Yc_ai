import { getCharacter } from '@/lib/actions/characters';
import { CharacterDetail } from '@/components/characters/character-detail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string; characterId: string }> }) {
  const { characterId } = await params;
  const result = await getCharacter(characterId);
  return { title: result.data?.name ?? 'Character' };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id, characterId } = await params;
  const result = await getCharacter(characterId);

  if (result.error || !result.data) {
    notFound();
  }

  return <CharacterDetail character={result.data} storyId={id} />;
}
