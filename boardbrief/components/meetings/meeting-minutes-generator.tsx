'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { generateMeetingMinutes } from '@/lib/actions/ai-meetings';
import { Sparkles, Loader2, Download, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MeetingWithDetails } from '@/types/database';
import type { MeetingMinutes } from '@/lib/actions/ai-meetings';

interface MeetingMinutesGeneratorProps {
  meeting: MeetingWithDetails;
}

export function MeetingMinutesGenerator({ meeting }: MeetingMinutesGeneratorProps) {
  const { toast } = useToast();
  const [loading,    setLoading]    = useState(false);
  const [minutes,    setMinutes]    = useState<MeetingMinutes | null>(null);
  const [attendees,  setAttendees]  = useState('');
  const [expanded,   setExpanded]   = useState(false);
  const [showInput,  setShowInput]  = useState(false);

  async function handleGenerate() {
    setLoading(true);

    const actionItemsText = meeting.action_items
      .map((a) => `- ${a.title} (Assigned to: ${a.assignee_name ?? 'TBD'}, Status: ${a.status})`)
      .join('\n');

    const resolutionsText = meeting.resolutions
      .map((r) => `- ${r.title}: ${r.status} (For: ${r.votes_for}, Against: ${r.votes_against}, Abstain: ${r.votes_abstain})`)
      .join('\n');

    const result = await generateMeetingMinutes(
      meeting.title,
      meeting.meeting_type,
      meeting.scheduled_at,
      meeting.duration_minutes,
      meeting.notes ?? '',
      actionItemsText,
      resolutionsText,
      attendees
    );

    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      setMinutes(result.data);
      setExpanded(true);
      setShowInput(false);
    }
  }

  function handleCopyRaw() {
    if (!minutes) return;
    navigator.clipboard.writeText(minutes.rawText).then(() => {
      toast({ title: 'Copied to clipboard' });
    });
  }

  function handleDownloadTxt() {
    if (!minutes) return;
    const blob = new Blob([minutes.rawText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${meeting.title.replace(/\s+/g, '-')}-minutes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Meeting Minutes</h3>
        </div>
        <div className="flex items-center gap-2">
          {minutes && (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopyRaw}>Copy</Button>
              <Button variant="ghost" size="sm" onClick={handleDownloadTxt}>
                <Download className="h-3.5 w-3.5 mr-1" />
                .txt
              </Button>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
          {!minutes && (
            <button
              onClick={() => setShowInput((v) => !v)}
              className="text-xs text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              {showInput ? 'Hide options' : 'Add attendees'}
            </button>
          )}
        </div>
      </div>

      {/* Attendees input */}
      {showInput && !minutes && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
            <Users className="mr-1 inline h-3 w-3" />
            Attendees (comma-separated)
          </label>
          <input
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Jane Smith, John Doe, Sarah Lee…"
            className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-gold-400 focus:outline-none"
          />
        </div>
      )}

      {/* Generate button */}
      {!minutes && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full border-gold-300 text-[var(--foreground)] hover:bg-gold-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Drafting minutes…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4 text-gold-500" />
              Generate Formal Minutes
            </>
          )}
        </Button>
      )}

      {/* Minutes display */}
      {minutes && expanded && (
        <div className="mt-3 space-y-4 rounded-lg bg-[var(--muted)] p-4 text-sm">
          {/* Header */}
          <div className="border-b border-[var(--border)] pb-3 text-center">
            <h2 className="text-base font-bold uppercase tracking-wide text-[var(--foreground)]">
              Board Meeting Minutes
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">{minutes.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {minutes.date} · {minutes.duration}
            </p>
          </div>

          {/* Attendees */}
          {minutes.attendees.length > 0 && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Attendees</h4>
              <ul className="list-inside list-disc space-y-0.5">
                {minutes.attendees.map((a) => (
                  <li key={a} className="text-xs text-[var(--foreground)]">{a}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Call to order */}
          {minutes.callToOrder && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Call to Order</h4>
              <p className="text-xs text-[var(--foreground)]">{minutes.callToOrder}</p>
            </section>
          )}

          {/* Agenda */}
          {minutes.agenda.length > 0 && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Agenda</h4>
              <ol className="list-inside list-decimal space-y-0.5">
                {minutes.agenda.map((item, i) => (
                  <li key={i} className="text-xs text-[var(--foreground)]">{item}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Discussion */}
          {minutes.discussion && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Discussion</h4>
              <p className="text-xs text-[var(--foreground)]">{minutes.discussion}</p>
            </section>
          )}

          {/* Decisions */}
          {minutes.decisions.length > 0 && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Decisions & Resolutions</h4>
              <ul className="space-y-1">
                {minutes.decisions.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[var(--foreground)]">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Action items */}
          {minutes.actionItems.length > 0 && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Action Items</h4>
              <ul className="space-y-1">
                {minutes.actionItems.map((item, i) => (
                  <li key={i} className="text-xs text-[var(--foreground)]">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Adjournment */}
          {minutes.adjournment && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Adjournment</h4>
              <p className="text-xs text-[var(--foreground)]">{minutes.adjournment}</p>
            </section>
          )}

          {/* Raw fallback if nothing parsed */}
          {!minutes.callToOrder && !minutes.agenda.length && !minutes.discussion && (
            <div className="whitespace-pre-wrap text-xs text-[var(--foreground)]">{minutes.rawText}</div>
          )}

          {/* Regenerate option */}
          <div className="border-t border-[var(--border)] pt-3">
            <button
              onClick={() => { setMinutes(null); setShowInput(true); }}
              className="text-xs text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              Regenerate minutes
            </button>
          </div>
        </div>
      )}

      {minutes && !expanded && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Minutes generated — click expand to view.
        </p>
      )}
    </Card>
  );
}
