import { getDashboardData } from '@/lib/actions/dashboard';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { GovernanceStats } from '@/components/dashboard/governance-stats';
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings';
import { EmptyState } from '@/components/ui/empty-state';
import { GettingStartedChecklist } from '@/components/GettingStartedChecklist';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const { data, error } = await getDashboardData();
  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} description={t('welcome')} />
        <EmptyState icon={Calendar} title={t('noMeetings')} description={t('scheduleFirst')} action={{ label: t('nextMeeting'), href: '/meetings/new' }} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('welcome')} />
      <GettingStartedChecklist />
      <GovernanceStats upcomingMeetings={data.meetingCount} boardMembers={data.boardMemberCount} openActions={data.openActionItems} pendingResolutions={data.pendingResolutions} />
      <UpcomingMeetings meetings={data.upcomingMeetings} />
    </div>
  );
}
