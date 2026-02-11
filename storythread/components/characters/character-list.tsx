'use client';

import { CharacterCard } from './character-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import type { Character } from '@/types/database';

interface CharacterListProps {
  characters: Character[];
  storyId: string;
}

export function CharacterList({ characters, storyId }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No characters yet"
        description="Bring your story to life by creating characters."
        action={
          <Link href={`/stories/${storyId}/characters/new`}>
            <Button><Plus className="mr-1.5 h-4 w-4" /> Add Character</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link href={`/stories/${storyId}/characters/new`}>
          <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Character</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} storyId={storyId} />
        ))}
      </div>
    </div>
  );
}
