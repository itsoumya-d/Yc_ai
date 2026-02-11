'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmail, buildInvoiceEmailHtml } from '@/lib/email/client';
import { formatCurrency, formatDate, addDays } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function sendInvoiceAction(
  invoiceId: string,
  personalMessage?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get invoice with client
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email)')
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  const client = invoice.client as { name: string; email: string } | null;
  if (!client?.email) {
    return { success: false, error: 'Client email not found' };
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('business_name, email')
    .eq('id', user.id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const portalUrl = `${appUrl}/pay/${invoice.portal_token}`;

  // Send email
  const html = buildInvoiceEmailHtml({
    clientName: client.name,
    invoiceNumber: invoice.invoice_number,
    amount: formatCurrency(invoice.total),
    dueDate: formatDate(invoice.due_date, 'long'),
    portalUrl,
    personalMessage: personalMessage ?? invoice.personal_message,
    businessName: profile?.business_name,
  });

  const emailSent = await sendEmail({
    to: client.email,
    subject: `Invoice ${invoice.invoice_number} from ${profile?.business_name ?? 'Your Provider'}`,
    html,
    replyTo: profile?.email,
  });

  // Update invoice status
  const now = new Date().toISOString();
  await supabase
    .from('invoices')
    .update({
      status: 'sent',
      sent_at: now,
      personal_message: personalMessage ?? invoice.personal_message,
    })
    .eq('id', invoiceId);

  // Create payment reminder schedule
  const dueDate = new Date(invoice.due_date);
  const reminders = [
    { type: 'before_due', step: 1, date: addDays(dueDate, -3), ai: false },
    { type: 'on_due', step: 2, date: dueDate, ai: false },
    { type: 'friendly', step: 3, date: addDays(dueDate, 3), ai: true },
    { type: 'reminder', step: 4, date: addDays(dueDate, 7), ai: true },
    { type: 'firm', step: 5, date: addDays(dueDate, 14), ai: true },
    { type: 'final', step: 6, date: addDays(dueDate, 30), ai: true },
  ];

  const reminderRows = reminders.map((r) => ({
    invoice_id: invoiceId,
    reminder_type: r.type,
    sequence_step: r.step,
    scheduled_at: r.date.toISOString(),
    subject: r.ai ? '' : `Payment reminder for Invoice ${invoice.invoice_number}`,
    body: r.ai ? '' : `This is a reminder that Invoice ${invoice.invoice_number} is due.`,
    status: 'scheduled',
    ai_generated: r.ai,
  }));

  await supabase.from('payment_reminders').insert(reminderRows);

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true };
}
