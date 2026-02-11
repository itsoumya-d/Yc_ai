import { PageHeader } from '@/components/layout/page-header';
import { MeetingForm } from '@/components/meetings/meeting-form';

export const dynamic = 'force-dynamic';

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Meeting" description="Schedule a new board meeting." />
      <MeetingForm />
    </div>
  );
}
