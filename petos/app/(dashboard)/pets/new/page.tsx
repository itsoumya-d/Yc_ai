import { PetForm } from '@/components/pets/pet-form';
import { PageHeader } from '@/components/layout/page-header';

export const metadata = {
  title: 'Add Pet',
};

export default function NewPetPage() {
  return (
    <div>
      <PageHeader
        title="Add New Pet"
        description="Enter your pet's details to start tracking their health."
        className="mb-6"
      />
      <PetForm />
    </div>
  );
}
