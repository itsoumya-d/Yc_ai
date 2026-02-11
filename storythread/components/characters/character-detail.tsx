'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { deleteCharacter } from '@/lib/actions/characters';
import { Edit, Trash2 } from 'lucide-react';
import type { Character, CharacterRole } from '@/types/database';

interface CharacterDetailProps {
  character: Character;
  storyId: string;
}

export function CharacterDetail({ character, storyId }: CharacterDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this character?')) return;
    setDeleting(true);
    const result = await deleteCharacter(character.id, storyId);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Character deleted' });
    router.push(`/stories/${storyId}`);
  }

  const sections = [
    { label: 'Appearance', value: character.appearance },
    { label: 'Personality', value: character.personality },
    { label: 'Backstory', value: character.backstory },
    { label: 'Voice Notes', value: character.voice_notes },
    { label: 'Relationships', value: character.relationships },
  ].filter((s) => s.value);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {character.image_url ? (
            <img src={character.image_url} alt={character.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
              {character.name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{character.name}</h1>
            <Badge variant={character.role as CharacterRole} className="mt-1">{character.role}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/stories/${storyId}/characters/${character.id}?edit=true`}>
            <Button variant="outline" size="sm"><Edit className="mr-1.5 h-4 w-4" /> Edit</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-1.5 h-4 w-4" /> {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {sections.map((section) => (
          <Card key={section.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">{section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{section.value}</p>
            </CardContent>
          </Card>
        ))}
        {sections.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            No details added yet. Edit this character to add more information.
          </p>
        )}
      </div>
    </div>
  );
}
