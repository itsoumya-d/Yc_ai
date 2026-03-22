import { getMedications } from '@/lib/actions/medications';
import { getPets } from '@/lib/actions/pets';
import { PageHeader } from '@/components/layout/page-header';
import { MedicationList } from '@/components/pets/medication-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Medications',
};

export default async function MedicationsPage() {
  const [medsResult, petsResult] = await Promise.all([
    getMedications(),
    getPets(),
  ]);

  const medications = medsResult.data || [];
  const pets = petsResult.data || [];

  const activeMeds = medications.filter((m) => m.is_active);
  const refillSoon = medications.filter(
    (m) =>
      m.is_active &&
      m.refill_date &&
      new Date(m.refill_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div>
      <PageHeader
        title="Medications"
        description="Track active and past medications across all your pets."
        action={
          pets.length > 0 ? (
            <Link href={`/pets/${pets[0].id}`}>
              <Button>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Medication
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Active Medications" value={String(activeMeds.length)} />
        <StatCard title="Total Tracked" value={String(medications.length)} />
        <StatCard
          title="Refill Soon"
          value={String(refillSoon.length)}
        />
      </div>

      {/* Medication List */}
      <div className="mt-8">
        {pets.length === 0 ? (
          <EmptyState
            title="No pets yet"
            description="Add a pet first to start tracking their medications."
            action={
              <Link href="/pets/new">
                <Button>Add Your First Pet</Button>
              </Link>
            }
          />
        ) : medications.length === 0 ? (
          <EmptyState
            title="No medications tracked"
            description="Open a pet profile to add medications and start tracking them here."
            action={
              <Link href="/pets">
                <Button variant="outline">View Pets</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {refillSoon.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-semibold text-amber-700">
                    Refill Needed Soon ({refillSoon.length})
                  </h2>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <MedicationList medications={refillSoon} />
                </div>
              </div>
            )}

            {pets.map((pet) => {
              const petMeds = medications.filter((m) => m.pet_id === pet.id);
              if (petMeds.length === 0) return null;
              return (
                <div key={pet.id}>
                  <div className="mb-3 flex items-center gap-2">
                    {pet.photo_url ? (
                      <img
                        src={pet.photo_url}
                        alt={pet.name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                      </div>
                    )}
                    <Link
                      href={`/pets/${pet.id}`}
                      className="text-sm font-semibold text-[var(--foreground)] hover:text-brand-600"
                    >
                      {pet.name}
                    </Link>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      · {petMeds.filter((m) => m.is_active).length} active
                    </span>
                  </div>
                  <MedicationList medications={petMeds} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
