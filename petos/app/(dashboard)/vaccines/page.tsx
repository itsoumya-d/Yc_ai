import { getPets } from '@/lib/actions/pets';
import { getHealthRecords } from '@/lib/actions/health-records';
import { PageHeader } from '@/components/layout/page-header';
import { VaccineTracker } from '@/components/health/vaccine-tracker';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vaccines',
};

export default async function VaccinesPage() {
  const [petsResult, recordsResult] = await Promise.all([
    getPets(),
    getHealthRecords(),
  ]);

  const pets = petsResult.data ?? [];
  const allRecords = recordsResult.data ?? [];

  // Count overdue and due soon across all pets
  const vaccinations = allRecords.filter((r) => r.type === 'vaccination');
  const totalVaccinations = vaccinations.length;

  if (pets.length === 0) {
    return (
      <div>
        <PageHeader
          title="Vaccines"
          description="Track vaccination schedules and due dates for all your pets."
        />
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Add a pet first to start tracking vaccinations.
          </p>
          <Link
            href="/pets/new"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Add Pet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vaccines"
        description={
          totalVaccinations > 0
            ? `Tracking ${totalVaccinations} vaccination${totalVaccinations !== 1 ? 's' : ''} across ${pets.length} pet${pets.length !== 1 ? 's' : ''}`
            : 'Track vaccination schedules and due dates for all your pets.'
        }
      />

      <div className="mt-6 space-y-6">
        {pets.map((pet) => {
          const petRecords = allRecords.filter((r) => r.pet_id === pet.id);
          return (
            <div key={pet.id}>
              <div className="mb-3 flex items-center gap-2">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-lg">
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                  </div>
                )}
                <Link href={`/pets/${pet.id}`} className="font-semibold text-[var(--foreground)] hover:text-brand-600">
                  {pet.name}
                </Link>
                <span className="text-xs text-[var(--muted-foreground)]">· {pet.species}</span>
              </div>
              <VaccineTracker pet={pet} records={petRecords} />
            </div>
          );
        })}
      </div>

      {totalVaccinations === 0 && (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">No vaccinations recorded yet</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Add vaccination records from the{' '}
            <Link href="/health" className="text-brand-600 hover:underline">
              Health Records
            </Link>{' '}
            page to track due dates here.
          </p>
        </div>
      )}
    </div>
  );
}
