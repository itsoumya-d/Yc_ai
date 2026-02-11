'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Character, CharacterRole } from '@/types/database';

interface CharacterCardProps {
  character: Character;
  storyId: string;
  className?: string;
}

export function CharacterCard({ character, storyId, className }: CharacterCardProps) {
  return (
    <Link href={`/stories/${storyId}/characters/${character.id}`}>
      <div
        className={cn(
          'group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
          className
        )}
      >
        <div className="flex items-start gap-3">
          {character.image_url ? (
            <img
              src={character.image_url}
              alt={character.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
              {character.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-[var(--foreground)] group-hover:text-brand-600 transition-colors">
              {character.name}
            </h4>
            <Badge variant={character.role as CharacterRole} className="mt-1">{character.role}</Badge>
          </div>
        </div>
        {character.personality && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-2">{character.personality}</p>
        )}
      </div>
    </Link>
  );
}
