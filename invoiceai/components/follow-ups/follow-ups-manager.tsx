'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { sendReminderNowAction, skipReminderAction, cancelReminderSequenceAction } from '@/lib/actions/send-invoice';

interface ReminderWithInvoice {
  id: string;
  reminder_type: string;
  sequence_step: number;
  scheduled_at: string;
  sent_at: string | null;
  subject: string;
  body: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'skipped' | 'failed';
  ai_generated: boolean;
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    amount_due: number;
    status: string;
    due_date: string;
    portal_token: string;
    client: { name: string; email: string } | null;
  } | null;
}

interface FollowUpsManagerProps {
  initialReminders: ReminderWithInvoice[];
  recoveredThisMonth: number;
}

const reminderTypeLabels: Record<string, string> = {
  before_due: 'Pre-Due Reminder',
  on_due: 'Due Date',
  friendly: 'Friendly Follow-up',
  reminder: 'Reminder',
  firm: 'Firm Notice',
  final: 'Final Notice',
};

const reminderTypeColors: Record<string, string> = {
  before_due: 'bg-blue-100 text-blue-700',
  on_due: 'bg-amber-100 text-amber-700',
  friendly: 'bg-green-100 text-green-700',
  reminder: 'bg-yellow-100 text-yellow-700',
  firm: 'bg-orange-100 text-orange-700',
  final: 'bg-red-100 text-red-700',
};

export function FollowUpsManager({ initialReminders, recoveredThisMonth }: FollowUpsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const scheduled = initialReminders.filter((r) => r.status === 'scheduled');
  const sent = initialReminders.filter((r) => r.status === 'sent');
  const skipped = initialReminders.filter((r) => r.status === 'skipped');

  // Group scheduled by invoice
  const byInvoice = scheduled.reduce<Record<string, ReminderWithInvoice[]>>((acc, r) => {
    const key = r.invoice?.id ?? 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const activeSequences = Object.keys(byInvoice).length;

  const handleSendNow = (reminderId: string) => {
    startTransition(async () => {
      const result = await sendReminderNowAction(reminderId);
      if (result.success) {
        toast({ title: 'Reminder sent successfully', variant: 'success' });
        router.refresh();
      } else {
        toast({ title: 'Error sending reminder', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleSkip = (reminderId: string) => {
    startTransition(async () => {
      const result = await skipReminderAction(reminderId);
      if (result.success) {
        toast({ title: 'Reminder skipped', variant: 'success' });
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleCancelSequence = (invoiceId: string) => {
    if (!confirm('Cancel all upcoming reminders for this invoice?')) return;
    startTransition(async () => {
      const result = await cancelReminderSequenceAction(invoiceId);
      if (result.success) {
        toast({ title: 'Reminder sequence cancelled', variant: 'success' });
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Follow-ups</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Automated payment reminders and follow-up sequences.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Active Sequences</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{activeSequences}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Pending Reminders</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{scheduled.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Sent This Month</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{recoveredThisMonth}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Total Sent</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{sent.length}</p>
        </div>
      </div>

      {initialReminders.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            }
            title="No follow-ups yet"
            description="When you send invoices, automated payment reminders will be scheduled here."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Scheduled Reminders — grouped by invoice */}
          {scheduled.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-base font-semibold text-[var(--foreground)]">
                Scheduled ({scheduled.length})
              </h2>
              <div className="space-y-3">
                {Object.entries(byInvoice).map(([invoiceId, reminders]) => {
                  const firstReminder = reminders[0];
                  const invoice = firstReminder.invoice;
                  const nextReminder = reminders.sort((a, b) =>
                    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                  )[0];

                  return (
                    <Card key={invoiceId}>
                      <CardContent className="p-4">
                        {/* Invoice header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => invoice && router.push(`/invoices/${invoice.id}`)}
                              className="font-medium text-[var(--foreground)] hover:underline"
                            >
                              {invoice?.client?.name ?? 'Unknown Client'}
                            </button>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {invoice?.invoice_number} &middot;{' '}
                              <span className="font-amount">{formatCurrency(invoice?.amount_due ?? 0)}</span> due &middot;{' '}
                              Due {formatDate(invoice?.due_date ?? '')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} pending
                            </span>
                            <button
                              onClick={() => invoice && handleCancelSequence(invoice.id)}
                              disabled={isPending}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Cancel all
                            </button>
                          </div>
                        </div>

                        {/* Reminder steps */}
                        <div className="mt-3 space-y-2">
                          {reminders.map((r) => {
                            const isExpanded = expandedId === r.id;
                            const isPast = new Date(r.scheduled_at) <= new Date();
                            return (
                              <div
                                key={r.id}
                                className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${reminderTypeColors[r.reminder_type] ?? 'bg-gray-100 text-gray-700'}`}>
                                      {reminderTypeLabels[r.reminder_type] ?? r.reminder_type}
                                    </span>
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                      {isPast ? 'Overdue — was' : 'Scheduled for'}{' '}
                                      {formatDate(r.scheduled_at)}
                                    </span>
                                    {r.ai_generated && (
                                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">AI</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(r.subject || r.body) && (
                                      <button
                                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                      >
                                        {isExpanded ? 'Hide' : 'Preview'}
                                      </button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSkip(r.id)}
                                      disabled={isPending}
                                      className="h-7 px-2 text-xs"
                                    >
                                      Skip
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSendNow(r.id)}
                                      disabled={isPending}
                                      className="h-7 px-2 text-xs"
                                    >
                                      Send Now
                                    </Button>
                                  </div>
                                </div>

                                {/* Expanded message preview */}
                                {isExpanded && (r.subject || r.body) && (
                                  <div className="mt-3 rounded border border-[var(--border)] bg-[var(--card)] p-3 text-xs">
                                    {r.subject && (
                                      <p className="font-medium text-[var(--foreground)]">
                                        Subject: {r.subject}
                                      </p>
                                    )}
                                    {r.body && (
                                      <p className="mt-1 whitespace-pre-wrap text-[var(--muted-foreground)]">
                                        {r.body}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recently Sent */}
          {sent.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-base font-semibold text-[var(--foreground)]">
                Recently Sent ({sent.length})
              </h2>
              <div className="space-y-2">
                {sent.slice(0, 15).map((r) => {
                  const invoice = r.invoice;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{invoice?.client?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {invoice?.invoice_number} &middot; Sent {formatDate(r.sent_at ?? r.scheduled_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${reminderTypeColors[r.reminder_type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {reminderTypeLabels[r.reminder_type] ?? r.reminder_type}
                        </span>
                        <Badge variant="sent">Sent</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skipped */}
          {skipped.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-base font-semibold text-[var(--muted-foreground)]">
                Skipped ({skipped.length})
              </h2>
              <div className="space-y-2">
                {skipped.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 opacity-60"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.invoice?.client?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {r.invoice?.invoice_number} &middot; {reminderTypeLabels[r.reminder_type]}
                      </p>
                    </div>
                    <Badge variant="draft">Skipped</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
