import { StatCard } from '@/components/ui/stat-card';
import { Calendar, Users, CheckSquare, Vote } from 'lucide-react';

interface GovernanceStatsProps {
  upcomingMeetings: number;
  boardMembers: number;
  openActions: number;
  pendingResolutions: number;
}

export function GovernanceStats({
  upcomingMeetings,
  boardMembers,
  openActions,
  pendingResolutions,
}: GovernanceStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Upcoming Meetings"
        value={upcomingMeetings}
        icon={Calendar}
        description="Scheduled board meetings"
      />
      <StatCard
        label="Board Members"
        value={boardMembers}
        icon={Users}
        description="Active members"
      />
      <StatCard
        label="Open Actions"
        value={openActions}
        icon={CheckSquare}
        description="Pending & in-progress items"
      />
      <StatCard
        label="Pending Resolutions"
        value={pendingResolutions}
        icon={Vote}
        description="Awaiting vote or decision"
      />
    </div>
  );
}
