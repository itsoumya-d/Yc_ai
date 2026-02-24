'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { deleteMeeting } from '@/lib/actions/meetings';
import { generateMeetingSummary } from '@/lib/actions/ai-meetings';
import { formatDateTime, getMeetingTypeLabel, getMeetingStatusLabel } from '@/lib/utils';
import {
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Video,
  Sparkles,
  Loader2,
  Download,
  Mic,
  CalendarPlus,
} from 'lucide-react';
import type { MeetingWithDetails, MeetingType, MeetingStatus } from '@/types/database';

interface MeetingDetailProps {
  meeting: MeetingWithDetails;
}

export function MeetingDetail({ meeting }: MeetingDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

  async function handleDelete() {
    if (!confirm('Delete this meeting?')) return;
    setDeleting(true);
    const result = await deleteMeeting(meeting.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Meeting deleted' });
    router.push('/meetings');
  }

  async function handleTranscribe(file: File) {
    setTranscribing(true);
    const fd = new FormData();
    fd.append('audio', file);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/transcribe`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? 'Transcription failed', variant: 'destructive' });
      } else {
        setTranscript(data.transcript);
        toast({ title: 'Transcription complete', description: 'Transcript saved to meeting notes.' });
        router.refresh();
      }
    } catch {
      toast({ title: 'Transcription failed', variant: 'destructive' });
    }
    setTranscribing(false);
  }

  function buildGoogleCalendarUrl() {
    if (!meeting.scheduled_at) return null;
    const start = new Date(meeting.scheduled_at);
    const end = new Date(start.getTime() + (meeting.duration_minutes ?? 60) * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: meeting.title,
      dates: `${fmt(start)}/${fmt(end)}`,
      ...(meeting.location ? { location: meeting.location } : {}),
      ...(meeting.video_link ? { location: meeting.video_link } : {}),
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  async function handleGenerateSummary() {
    setAiLoading(true);
    const actionItemsText = meeting.action_items
      .map((a) => `- ${a.title} (${a.status})`)
      .join('\n');
    const result = await generateMeetingSummary(
      meeting.title,
      meeting.notes || '',
      actionItemsText
    );
    setAiLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) setSummary(result.data);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              {meeting.title}
            </h1>
            <Badge variant={meeting.status as MeetingStatus}>
              {getMeetingStatusLabel(meeting.status)}
            </Badge>
            <Badge variant={meeting.meeting_type as MeetingType}>
              {getMeetingTypeLabel(meeting.meeting_type)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
            {meeting.scheduled_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(meeting.scheduled_at)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meeting.duration_minutes} minutes</span>
            </div>
            {meeting.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{meeting.location}</span>
              </div>
            )}
            {meeting.video_link && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <a
                  href={meeting.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-800 hover:underline"
                >
                  Join
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/meetings/${meeting.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          <a href={`/api/meetings/${meeting.id}/pdf`} download>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Minutes PDF
            </Button>
          </a>
          <a href={`/api/meetings/${meeting.id}/ical`} download>
            <Button variant="outline" size="sm">
              <CalendarPlus className="w-4 h-4 mr-1" />
              Export .ics
            </Button>
          </a>
          {buildGoogleCalendarUrl() && (
            <a href={buildGoogleCalendarUrl()!} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Google Cal
              </Button>
            </a>
          )}
          <label>
            <Button
              variant="outline"
              size="sm"
              disabled={transcribing}
              onClick={(e) => {
                const input = (e.currentTarget as HTMLElement).closest('label')?.querySelector('input');
                input?.click();
              }}
            >
              {transcribing ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Transcribing...</>
              ) : (
                <><Mic className="w-4 h-4 mr-1" />Transcribe</>
              )}
            </Button>
            <input
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTranscribe(file);
                e.target.value = '';
              }}
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {meeting.notes && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
            Notes / Agenda
          </h3>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
            {meeting.notes}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
            AI Meeting Summary
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
        {summary ? (
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap bg-[var(--muted)] p-3 rounded-lg">
            {summary}
          </p>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            Click &quot;Generate Summary&quot; to create an AI-powered meeting summary.
          </p>
        )}
      </Card>

      {transcript && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
              Audio Transcript
            </h3>
            <Mic className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap bg-[var(--muted)] p-3 rounded-lg">
            {transcript}
          </p>
        </Card>
      )}

      {meeting.action_items.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
            Action Items ({meeting.action_items.length})
          </h3>
          <div className="space-y-2">
            {meeting.action_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {item.title}
                  </p>
                  {item.assignee_name && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.assignee_name}
                    </p>
                  )}
                </div>
                <Badge variant={item.status}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {meeting.resolutions.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
            Resolutions ({meeting.resolutions.length})
          </h3>
          <div className="space-y-2">
            {meeting.resolutions.map((res) => (
              <Link
                key={res.id}
                href={`/resolutions/${res.id}`}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] -mx-1 px-1 rounded"
              >
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {res.title}
                </p>
                <Badge variant={res.status}>{res.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
