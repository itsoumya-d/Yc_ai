import { notFound } from 'next/navigation';
import { getPet } from '@/lib/actions/pets';
import { PetForm } from '@/components/pets/pet-form';
import { PageHeader } from '@/components/layout/page-header';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: pet } = await getPet(id);
  return { title: pet ? `Edit ${pet.name}` : 'Edit Pet' };
}

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: pet } = await getPet(id);

  if (!pet) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${pet.name}`}
        description="Update your pet's information."
        className="mb-6"
      />
      <PetForm pet={pet} />
    </div>
  );
}
