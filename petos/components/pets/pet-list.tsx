import { PetCard } from './pet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Pet } from '@/types/database';

interface PetListProps {
  pets: Pet[];
}

export function PetList({ pets }: PetListProps) {
  if (pets.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3.2a.755.755 0 0 1 .756-.756c1.756 0 3.179 1.423 3.179 3.179 0 .559-.045 1.107-.135 1.643" />
          </svg>
        }
        title="No pets yet"
        description="Add your first pet to start tracking their health, appointments, and more."
        action={
          <Link href="/pets/new">
            <Button>Add Your First Pet</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
