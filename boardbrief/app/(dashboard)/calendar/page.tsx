import { PageHeader } from '@/components/layout/page-header';
import { getUpcomingMeetings } from '@/lib/actions/calendar';
import { MiniCalendar } from '@/components/meetings/mini-calendar';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const { data: events } = await getUpcomingMeetings(60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Upcoming meetings and schedule overview"
      />
      <MiniCalendar events={events ?? []} />
    </div>
  );
}
