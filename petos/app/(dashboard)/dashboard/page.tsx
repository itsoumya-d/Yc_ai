import { getDashboardData } from '@/lib/actions/dashboard';
import { getPets } from '@/lib/actions/pets';
import { getUpcomingAppointments } from '@/lib/actions/appointments';
import { getActiveMedications } from '@/lib/actions/medications';
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
  const [dashResult, petsResult, apptsResult, medsResult] = await Promise.all([
    getDashboardData(),
    getPets(),
    getUpcomingAppointments(),
    getActiveMedications(),
  ]);

  const dashboard = dashResult.data;
  const pets = petsResult.data || [];
  const appointments = apptsResult.data || [];
  const medications = medsResult.data || [];

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
