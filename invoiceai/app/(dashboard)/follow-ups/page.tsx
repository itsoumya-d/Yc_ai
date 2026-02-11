import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Follow-ups',
};

export default async function FollowUpsPage() {
  const supabase = await createClient();

  const { data: reminders } = await supabase
    .from('payment_reminders')
    .select(`
      *,
      invoice:invoices(invoice_number, total, amount_due, status, client:clients(name))
    `)
    .in('status', ['scheduled', 'sent'])
    .order('scheduled_at', { ascending: true })
    .limit(50);

  const scheduled = reminders?.filter((r) => r.status === 'scheduled') ?? [];
  const sent = reminders?.filter((r) => r.status === 'sent') ?? [];

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Follow-ups</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Automated payment reminders and follow-up sequences.
        </p>
      </div>

      {(!reminders || reminders.length === 0) ? (
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
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled ({scheduled.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduled.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                  No upcoming reminders.
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduled.slice(0, 10).map((r) => {
                    const inv = r.invoice as { invoice_number: string; amount_due: number; client: { name: string } | null } | null;
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                        <div>
                          <p className="text-sm font-medium">{inv?.client?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {inv?.invoice_number} &middot; {formatDate(r.scheduled_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="pending">
                            {r.reminder_type.replace('_', ' ')}
                          </Badge>
                          <p className="mt-1 font-amount text-xs">
                            {formatCurrency(inv?.amount_due ?? 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently Sent ({sent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sent.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                  No reminders sent yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {sent.slice(0, 10).map((r) => {
                    const inv = r.invoice as { invoice_number: string; client: { name: string } | null } | null;
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                        <div>
                          <p className="text-sm font-medium">{inv?.client?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {inv?.invoice_number} &middot; Sent {formatDate(r.sent_at ?? r.scheduled_at)}
                          </p>
                        </div>
                        <Badge variant="sent">Sent</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
