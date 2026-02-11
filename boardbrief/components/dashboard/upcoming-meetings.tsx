import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, getMeetingTypeLabel } from '@/lib/utils';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Meeting, MeetingType } from '@/types/database';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getCountdownLabel(days: number): string {
  if (days < 0) return 'Past due';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function getCountdownColor(days: number): string {
  if (days < 0) return 'text-red-600';
  if (days <= 3) return 'text-amber-600';
  return 'text-[var(--muted-foreground)]';
}

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  if (meetings.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-4">
          Upcoming Meetings
        </h2>
        <EmptyState
          icon={Calendar}
          title="No upcoming meetings"
          description="Schedule a meeting to see it here."
          action={{ label: 'New Meeting', href: '/meetings/new' }}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Upcoming Meetings
        </h2>
        <Link
          href="/meetings"
          className="text-sm text-navy-800 hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {meetings.map((meeting) => {
          const days = meeting.scheduled_at
            ? getDaysUntil(meeting.scheduled_at)
            : null;
          return (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {meeting.scheduled_at && (
                  <div className="text-center shrink-0 w-12">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">
                      {new Date(meeting.scheduled_at).toLocaleDateString(
                        'en-US',
                        { month: 'short' }
                      )}
                    </p>
                    <p className="text-lg font-data font-bold text-[var(--foreground)]">
                      {new Date(meeting.scheduled_at).getDate()}
                    </p>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {meeting.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={meeting.meeting_type as MeetingType}>
                      {getMeetingTypeLabel(meeting.meeting_type)}
                    </Badge>
                    {meeting.scheduled_at && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatDate(meeting.scheduled_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {days !== null && (
                <span
                  className={`text-xs font-medium shrink-0 ${getCountdownColor(days)}`}
                >
                  {getCountdownLabel(days)}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
