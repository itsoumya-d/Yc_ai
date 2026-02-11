import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDateTime, getMeetingTypeLabel, getMeetingStatusLabel } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Meeting, MeetingType, MeetingStatus } from '@/types/database';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-medium text-[var(--foreground)] truncate">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={meeting.meeting_type as MeetingType}>
                {getMeetingTypeLabel(meeting.meeting_type)}
              </Badge>
              <Badge variant={meeting.status as MeetingStatus}>
                {getMeetingStatusLabel(meeting.status)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          {meeting.scheduled_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateTime(meeting.scheduled_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{meeting.duration_minutes}m</span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{meeting.location}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
