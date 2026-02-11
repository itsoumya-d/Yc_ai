'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createCharacter, updateCharacter } from '@/lib/actions/characters';
import type { Character, CharacterRole } from '@/types/database';

const ROLES: { value: CharacterRole; label: string }[] = [
  { value: 'protagonist', label: 'Protagonist' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'minor', label: 'Minor' },
  { value: 'mentioned', label: 'Mentioned' },
];

interface CharacterFormProps {
  storyId: string;
  character?: Character;
}

export function CharacterForm({ storyId, character }: CharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('story_id', storyId);

    const result = character
      ? await updateCharacter(character.id, formData)
      : await createCharacter(storyId, formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: character ? 'Character updated' : 'Character created' });
    router.push(`/stories/${storyId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{character ? 'Edit Character' : 'New Character'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Name"
            placeholder="Character name"
            defaultValue={character?.name}
            required
          />
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-[var(--foreground)]">Role</label>
            <select
              id="role"
              name="role"
              defaultValue={character?.role ?? 'supporting'}
              className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <Textarea
            id="appearance"
            name="appearance"
            label="Appearance"
            placeholder="Physical description..."
            defaultValue={character?.appearance ?? ''}
            rows={2}
          />
          <Textarea
            id="personality"
            name="personality"
            label="Personality"
            placeholder="Key traits, quirks, motivations..."
            defaultValue={character?.personality ?? ''}
            rows={2}
          />
          <Textarea
            id="backstory"
            name="backstory"
            label="Backstory"
            placeholder="Background and history..."
            defaultValue={character?.backstory ?? ''}
            rows={3}
          />
          <Textarea
            id="voice_notes"
            name="voice_notes"
            label="Voice Notes"
            placeholder="How does this character speak? Dialect, vocabulary, patterns..."
            defaultValue={character?.voice_notes ?? ''}
            rows={2}
          />
          <Textarea
            id="relationships"
            name="relationships"
            label="Relationships"
            placeholder="Connections to other characters..."
            defaultValue={character?.relationships ?? ''}
            rows={2}
          />
          <Input
            id="image_url"
            name="image_url"
            label="Image URL"
            placeholder="https://..."
            defaultValue={character?.image_url ?? ''}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : character ? 'Save Changes' : 'Create Character'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
