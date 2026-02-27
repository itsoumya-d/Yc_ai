'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { exportMeetingsAsICS } from '@/lib/actions/calendar';
// getGoogleCalendarLink and getOutlookCalendarLink are passed as props from parent
import {
  Calendar,
  Download,
  ExternalLink,
  Chrome,
  Globe,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CalendarSyncProps {
  googleCalendarUrl?: string | null;
  outlookCalendarUrl?: string | null;
}

export function CalendarSync({ googleCalendarUrl, outlookCalendarUrl }: CalendarSyncProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportICS = async () => {
    setExporting(true);
    const result = await exportMeetingsAsICS();
    setExporting(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    if (result.data) {
      const blob = new Blob([result.data], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boardbrief-meetings.ics';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Calendar exported! Import the .ics file into your calendar app.' });
    }
  };

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gold-500" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Calendar Sync</h3>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Sync your BoardBrief meetings with your calendar app to stay organized.
      </p>

      <div className="space-y-3">
        {/* Export ICS */}
        <div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-[var(--muted)] p-2">
              <Download className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)]">Export as .ics</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Download all meetings and import into any calendar (Apple Calendar, Outlook, Google Calendar)
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportICS}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {exporting ? 'Exporting...' : 'Download .ics File'}
          </Button>
        </div>

        {/* Google Calendar */}
        {googleCalendarUrl && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-blue-100 p-2">
                <Chrome className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[var(--foreground)]">Add to Google Calendar</p>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Opens Google Calendar to add this meeting
                </p>
              </div>
            </div>
            <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open in Google Calendar
              </Button>
            </a>
          </div>
        )}

        {/* Outlook / Microsoft */}
        {outlookCalendarUrl && (
          <div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-[var(--muted)] p-2">
                <Globe className="w-4 h-4 text-[#0078D4]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[var(--foreground)]">Add to Outlook</p>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Opens Outlook Web to add this meeting
                </p>
              </div>
            </div>
            <a href={outlookCalendarUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open in Outlook Calendar
              </Button>
            </a>
          </div>
        )}

        {/* Info note */}
        <div className="flex items-start gap-2 rounded-lg bg-[var(--muted)] p-3">
          <Info className="w-3.5 h-3.5 text-[var(--muted-foreground)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--muted-foreground)]">
            For two-way sync, use the .ics export and subscribe to it in your calendar app.
            Google Calendar: Other calendars → + → From URL.
            Apple Calendar: File → New Calendar Subscription.
          </p>
        </div>
      </div>
    </Card>
  );
}
