import { MeetingCard } from './meeting-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar } from 'lucide-react';
import type { Meeting } from '@/types/database';

interface MeetingListProps {
  meetings: Meeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No meetings yet"
        description="Schedule your first board meeting to get started."
        action={{ label: 'New Meeting', href: '/meetings/new' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} />
      ))}
    </div>
  );
}
