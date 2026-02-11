import { notFound } from 'next/navigation';
import { getMeeting } from '@/lib/actions/meetings';
import { PageHeader } from '@/components/layout/page-header';
import { MeetingForm } from '@/components/meetings/meeting-form';

export const dynamic = 'force-dynamic';

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: meeting, error } = await getMeeting(id);
  if (error || !meeting) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title="Edit Meeting" description={`Editing "${meeting.title}"`} />
      <MeetingForm meeting={meeting} />
    </div>
  );
}
