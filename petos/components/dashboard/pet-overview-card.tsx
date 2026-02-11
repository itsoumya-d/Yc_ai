import Link from 'next/link';
import { cn, getSpeciesEmoji, calculateAge } from '@/lib/utils';
import type { Pet } from '@/types/database';

interface PetOverviewCardProps {
  pet: Pet;
  nextAppointment?: string | null;
  activeMeds?: number;
  className?: string;
}

export function PetOverviewCard({ pet, nextAppointment, activeMeds, className }: PetOverviewCardProps) {
  const emoji = getSpeciesEmoji(pet.species);
  const age = pet.date_of_birth ? calculateAge(pet.date_of_birth) : null;

  return (
    <Link href={`/pets/${pet.id}`}>
      <div
        className={cn(
          'rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-xl">
              {emoji}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{pet.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {pet.breed || pet.species}{age && ` · ${age}`}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-[var(--muted-foreground)]">
          {nextAppointment && (
            <span>Next visit: {nextAppointment}</span>
          )}
          {activeMeds !== undefined && activeMeds > 0 && (
            <span>{activeMeds} active med{activeMeds !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
