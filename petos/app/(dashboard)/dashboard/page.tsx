import { getDashboardData } from '@/lib/actions/dashboard';
import { getPets } from '@/lib/actions/pets';
import { getUpcomingAppointments } from '@/lib/actions/appointments';
import { getActiveMedications } from '@/lib/actions/medications';
import { getOverdueVaccinations } from '@/lib/actions/vaccinations';
import { StatCard } from '@/components/ui/stat-card';
import { PetOverviewCard } from '@/components/dashboard/pet-overview-card';
import { UpcomingSection } from '@/components/dashboard/upcoming-section';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const [dashResult, petsResult, apptsResult, medsResult, overdueVaxResult] = await Promise.all([
    getDashboardData(),
    getPets(),
    getUpcomingAppointments(),
    getActiveMedications(),
    getOverdueVaccinations(),
  ]);

  const dashboard = dashResult.data;
  const pets = petsResult.data || [];
  const appointments = apptsResult.data || [];
  const medications = medsResult.data || [];
  const overdueVax = overdueVaxResult.data;

  const hasPets = pets.length > 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Overview of your pets and their care.
          </p>
        </div>
        <Link href="/pets/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Pet
          </Button>
        </Link>
      </div>

      {/* Overdue Vaccinations Alert */}
      {overdueVax && overdueVax.count > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                {overdueVax.count} Overdue Vaccination{overdueVax.count !== 1 ? 's' : ''}
              </h3>
              <div className="mt-1 space-y-0.5">
                {overdueVax.details.slice(0, 5).map((d, i) => (
                  <p key={i} className="text-xs text-red-700">
                    <Link href={`/pets/${d.petId}`} className="font-medium underline hover:text-red-900">{d.petName}</Link>
                    {' '}&mdash; {d.vaccine}
                  </p>
                ))}
                {overdueVax.details.length > 5 && (
                  <p className="text-xs text-red-600">
                    and {overdueVax.details.length - 5} more...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pets" value={String(dashboard?.petCount ?? 0)} />
        <StatCard title="Upcoming Appointments" value={String(dashboard?.upcomingAppointments ?? 0)} />
        <StatCard title="Active Medications" value={String(dashboard?.activeMedications ?? 0)} />
        <StatCard title="This Month" value={formatCurrency(dashboard?.monthlyExpenses ?? 0)} />
      </div>

      {/* Pet Overview */}
      {hasPets ? (
        <>
          <h2 className="mt-8 mb-4 text-lg font-semibold text-[var(--foreground)]">Your Pets</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetOverviewCard key={pet.id} pet={pet} />
            ))}
          </div>

          <div className="mt-8">
            <UpcomingSection appointments={appointments} medications={medications} />
          </div>
        </>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3.2" />
              </svg>
            }
            title="Welcome to PetOS!"
            description="Add your first pet to start tracking their health, appointments, and expenses."
            action={
              <Link href="/pets/new">
                <Button>Add Your First Pet</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
