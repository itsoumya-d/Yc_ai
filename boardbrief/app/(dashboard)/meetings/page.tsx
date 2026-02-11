import Link from 'next/link';
import { getMeetings } from '@/lib/actions/meetings';
import { PageHeader } from '@/components/layout/page-header';
import { MeetingList } from '@/components/meetings/meeting-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const { data: meetings } = await getMeetings();
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="Schedule and manage board meetings." actions={<Link href="/meetings/new"><Button><Plus className="w-4 h-4 mr-1" />New Meeting</Button></Link>} />
      <MeetingList meetings={meetings ?? []} />
    </div>
  );
}
