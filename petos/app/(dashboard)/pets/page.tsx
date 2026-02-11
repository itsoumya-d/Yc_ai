import { getPets } from '@/lib/actions/pets';
import { PetList } from '@/components/pets/pet-list';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Pets',
};

export default async function PetsPage() {
  const { data: pets } = await getPets();

  return (
    <div>
      <PageHeader
        title="My Pets"
        description="Manage your furry, feathered, and scaly friends."
        action={
          <Link href="/pets/new">
            <Button>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Pet
            </Button>
          </Link>
        }
      />
      <div className="mt-6">
        <PetList pets={pets || []} />
      </div>
    </div>
  );
}
