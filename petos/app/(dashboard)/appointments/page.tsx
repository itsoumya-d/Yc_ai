import { getPets } from '@/lib/actions/pets';
import { getAppointments } from '@/lib/actions/appointments';
import { PageHeader } from '@/components/layout/page-header';
import { AppointmentCard } from '@/components/pets/appointment-card';
import { AppointmentForm } from '@/components/pets/appointment-form';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Appointments',
};

export default async function AppointmentsPage() {
  const [petsResult, apptsResult] = await Promise.all([
    getPets(),
    getAppointments(),
  ]);

  const pets = petsResult.data || [];
  const appointments = apptsResult.data || [];

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter((a) => a.status === 'scheduled' && a.date >= today);
  const past = appointments.filter((a) => a.status !== 'scheduled' || a.date < today);

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Schedule and track vet visits."
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <AppointmentForm pets={pets} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description="Schedule a vet visit for your pets."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No past appointments.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {past.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {appointments.length === 0 ? (
              <EmptyState
                title="No appointments"
                description="Schedule your first vet visit."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {appointments.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
