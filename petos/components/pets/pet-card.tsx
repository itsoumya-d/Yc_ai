'use client';

import Link from 'next/link';
import { cn, calculateAge, getSpeciesEmoji } from '@/lib/utils';
import type { Pet } from '@/types/database';

interface PetCardProps {
  pet: Pet;
  className?: string;
}

export function PetCard({ pet, className }: PetCardProps) {
  const emoji = getSpeciesEmoji(pet.species);
  const age = pet.date_of_birth ? calculateAge(pet.date_of_birth) : null;

  return (
    <Link href={`/pets/${pet.id}`}>
      <div
        className={cn(
          'group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {pet.photo_url ? (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
              {emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)] group-hover:text-brand-600 transition-colors">
              {pet.name}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {pet.breed || pet.species}
              {age && ` · ${age}`}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          {pet.weight && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
              </svg>
              {pet.weight} {pet.weight_unit}
            </span>
          )}
          {pet.gender && (
            <span>{pet.gender === 'male' ? '♂ Male' : pet.gender === 'female' ? '♀ Female' : pet.gender}</span>
          )}
          {pet.is_neutered && (
            <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">Neutered</span>
          )}
        </div>
      </div>
    </Link>
  );
}
