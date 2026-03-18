import { createClient } from '@/lib/supabase/server';
import { FollowUpsManager } from '@/components/follow-ups/follow-ups-manager';

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
      invoice:invoices(id, invoice_number, total, amount_due, status, due_date, portal_token, client:clients(name, email))
    `)
    .in('status', ['scheduled', 'sent', 'skipped'])
    .order('scheduled_at', { ascending: true })
    .limit(100);

  // Summary stats: count paid invoices that had reminders (rough recovery metric)
  const { count: recoveredCount } = await supabase
    .from('payment_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  return (
    <FollowUpsManager
      initialReminders={reminders ?? []}
      recoveredThisMonth={recoveredCount ?? 0}
    />
  );
}
