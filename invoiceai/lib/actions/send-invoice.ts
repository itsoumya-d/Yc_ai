'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmail, buildInvoiceEmailHtml, buildReminderEmailHtml } from '@/lib/email/client';
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

export async function sendReminderNowAction(
  reminderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: reminder } = await supabase
    .from('payment_reminders')
    .select('*, invoice:invoices(invoice_number, total, amount_due, due_date, portal_token, client:clients(name, email))')
    .eq('id', reminderId)
    .single();

  if (!reminder) return { success: false, error: 'Reminder not found' };

  const invoice = reminder.invoice as {
    invoice_number: string;
    total: number;
    amount_due: number;
    due_date: string;
    portal_token: string;
    client: { name: string; email: string } | null;
  } | null;

  if (!invoice?.client?.email) return { success: false, error: 'Client email not found' };

  const { data: profile } = await supabase
    .from('users')
    .select('business_name, email')
    .eq('id', user.id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const portalUrl = `${appUrl}/pay/${invoice.portal_token}`;

  const reminderSubject = reminder.subject || `Payment Reminder: Invoice ${invoice.invoice_number}`;
  const reminderBody = reminder.body || `Hi ${invoice.client.name},\n\nThis is a reminder that Invoice ${invoice.invoice_number} has an outstanding balance of ${formatCurrency(invoice.amount_due)}, due on ${formatDate(invoice.due_date, 'long')}.\n\nPlease click below to view and pay your invoice.\n\nThank you,\n${profile?.business_name ?? 'Your Provider'}`;

  const html = buildReminderEmailHtml({
    clientName: invoice.client.name,
    subject: reminderSubject,
    body: reminderBody,
    portalUrl,
    businessName: profile?.business_name ?? undefined,
  });

  await sendEmail({
    to: invoice.client.email,
    subject: reminder.subject || `Payment Reminder: Invoice ${invoice.invoice_number}`,
    html,
    replyTo: profile?.email,
  });

  await supabase
    .from('payment_reminders')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', reminderId);

  revalidatePath('/follow-ups');
  return { success: true };
}

export async function skipReminderAction(
  reminderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('payment_reminders')
    .update({ status: 'skipped' })
    .eq('id', reminderId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/follow-ups');
  return { success: true };
}

export async function cancelReminderSequenceAction(
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('payment_reminders')
    .update({ status: 'cancelled' })
    .eq('invoice_id', invoiceId)
    .eq('status', 'scheduled');

  if (error) return { success: false, error: error.message };

  revalidatePath('/follow-ups');
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}
