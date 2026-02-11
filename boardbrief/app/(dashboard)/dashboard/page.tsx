import { getDashboardData } from '@/lib/actions/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { GovernanceStats } from '@/components/dashboard/governance-stats';
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { data, error } = await getDashboardData();
  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your governance overview." />
        <EmptyState icon={Calendar} title="No data yet" description="Schedule your first board meeting to get started." action={{ label: 'New Meeting', href: '/meetings/new' }} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your governance overview." />
      <GovernanceStats upcomingMeetings={data.meetingCount} boardMembers={data.boardMemberCount} openActions={data.openActionItems} pendingResolutions={data.pendingResolutions} />
      <UpcomingMeetings meetings={data.upcomingMeetings} />
    </div>
  );
}
