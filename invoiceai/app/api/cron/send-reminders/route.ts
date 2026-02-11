import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendEmail, buildReminderEmailHtml } from '@/lib/email/client';
import { generateFollowUpMessage } from '@/lib/openai/client';

// Vercel Cron: runs daily
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Find reminders that are due
  const { data: reminders } = await supabase
    .from('payment_reminders')
    .select(`
      *,
      invoice:invoices(
        id, invoice_number, total, amount_due, currency, due_date, portal_token, status,
        client:clients(name, email),
        user:users(business_name, email)
      )
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .limit(50);

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let sent = 0;
  let skipped = 0;

  for (const reminder of reminders) {
    const invoice = reminder.invoice as Record<string, unknown>;
    if (!invoice) continue;

    // Skip if invoice is already paid or cancelled
    const status = invoice.status as string;
    if (['paid', 'cancelled'].includes(status)) {
      await supabase
        .from('payment_reminders')
        .update({ status: 'cancelled' })
        .eq('id', reminder.id);
      skipped++;
      continue;
    }

    const client = invoice.client as { name: string; email: string } | null;
    const user = invoice.user as { business_name: string; email: string } | null;

    if (!client?.email) {
      skipped++;
      continue;
    }

    // Generate AI follow-up message if not already set
    let subject = reminder.subject;
    let body = reminder.body;

    if (reminder.ai_generated && (!subject || !body)) {
      try {
        const dueDate = invoice.due_date as string;
        const daysOverdue = Math.floor(
          (Date.now() - new Date(dueDate).getTime()) / 86400000
        );

        const message = await generateFollowUpMessage(
          {
            invoiceNumber: invoice.invoice_number as string,
            clientName: client.name,
            amount: invoice.amount_due as number,
            currency: invoice.currency as string,
            dueDate,
            daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
          },
          reminder.reminder_type as 'friendly' | 'reminder' | 'firm' | 'final'
        );

        subject = message.subject;
        body = message.body;
      } catch {
        skipped++;
        continue;
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const portalUrl = `${appUrl}/pay/${invoice.portal_token}`;

    const html = buildReminderEmailHtml({
      clientName: client.name,
      subject,
      body,
      portalUrl,
      businessName: user?.business_name,
    });

    const emailSent = await sendEmail({
      to: client.email,
      subject,
      html,
      replyTo: user?.email,
    });

    if (emailSent) {
      await supabase
        .from('payment_reminders')
        .update({
          status: 'sent',
          sent_at: now,
          subject,
          body,
        })
        .eq('id', reminder.id);
      sent++;
    } else {
      await supabase
        .from('payment_reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);
    }
  }

  return NextResponse.json({ processed: reminders.length, sent, skipped });
}
