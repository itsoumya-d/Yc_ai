'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { RecurringInvoice, RecurringInvoiceWithClient } from '@/types/database';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

// Get all recurring invoices for the current user
export async function getRecurringInvoices(): Promise<ActionResult<RecurringInvoiceWithClient[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as RecurringInvoiceWithClient[] };
  } catch (error: any) {
    console.error('Error fetching recurring invoices:', error);
    return { error: error.message || 'Failed to fetch recurring invoices' };
  }
}

// Get single recurring invoice
export async function getRecurringInvoice(id: string): Promise<ActionResult<RecurringInvoiceWithClient>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return { data: data as RecurringInvoiceWithClient };
  } catch (error: any) {
    console.error('Error fetching recurring invoice:', error);
    return { error: error.message || 'Failed to fetch recurring invoice' };
  }
}

// Create recurring invoice
export async function createRecurringInvoice(data: {
  client_id: string;
  frequency: RecurringInvoice['frequency'];
  interval_count: number;
  start_date: string;
  end_date?: string;
  invoice_template: RecurringInvoice['invoice_template'];
}): Promise<ActionResult<RecurringInvoice>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Calculate next invoice date
    const nextInvoiceDate = calculateNextInvoiceDate(
      data.start_date,
      data.frequency,
      data.interval_count
    );

    const { data: recurring, error } = await supabase
      .from('recurring_invoices')
      .insert({
        user_id: user.id,
        client_id: data.client_id,
        frequency: data.frequency,
        interval_count: data.interval_count,
        start_date: data.start_date,
        end_date: data.end_date || null,
        next_invoice_date: nextInvoiceDate,
        invoice_template: data.invoice_template,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/recurring-invoices');
    return { data: recurring };
  } catch (error: any) {
    console.error('Error creating recurring invoice:', error);
    return { error: error.message || 'Failed to create recurring invoice' };
  }
}

// Pause recurring invoice
export async function pauseRecurringInvoice(
  id: string,
  reason?: string
): Promise<ActionResult<RecurringInvoice>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
        paused_reason: reason || 'Manually paused',
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/recurring-invoices');
    return { data };
  } catch (error: any) {
    console.error('Error pausing recurring invoice:', error);
    return { error: error.message || 'Failed to pause recurring invoice' };
  }
}

// Resume recurring invoice
export async function resumeRecurringInvoice(id: string): Promise<ActionResult<RecurringInvoice>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .update({
        status: 'active',
        paused_at: null,
        paused_reason: null,
        consecutive_failures: 0, // Reset failures on resume
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/recurring-invoices');
    return { data };
  } catch (error: any) {
    console.error('Error resuming recurring invoice:', error);
    return { error: error.message || 'Failed to resume recurring invoice' };
  }
}

// Cancel recurring invoice
export async function cancelRecurringInvoice(id: string): Promise<ActionResult<RecurringInvoice>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/recurring-invoices');
    return { data };
  } catch (error: any) {
    console.error('Error cancelling recurring invoice:', error);
    return { error: error.message || 'Failed to cancel recurring invoice' };
  }
}

// Delete recurring invoice
export async function deleteRecurringInvoice(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('recurring_invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/recurring-invoices');
    return { data: null };
  } catch (error: any) {
    console.error('Error deleting recurring invoice:', error);
    return { error: error.message || 'Failed to delete recurring invoice' };
  }
}

// Helper function to calculate next invoice date
function calculateNextInvoiceDate(
  startDate: string,
  frequency: RecurringInvoice['frequency'],
  intervalCount: number = 1
): string {
  const date = new Date(startDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (7 * intervalCount));
      break;
    case 'biweekly':
      date.setDate(date.getDate() + (14 * intervalCount));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + intervalCount);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (3 * intervalCount));
      break;
    case 'semiannual':
      date.setMonth(date.getMonth() + (6 * intervalCount));
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + intervalCount);
      break;
  }

  return date.toISOString().split('T')[0];
}

// Get upcoming invoice preview dates (next 6 invoices)
export async function getUpcomingInvoiceDates(
  startDate: string,
  frequency: RecurringInvoice['frequency'],
  intervalCount: number = 1,
  count: number = 6
): Promise<string[]> {
  const dates: string[] = [];
  let currentDate = startDate;

  for (let i = 0; i < count; i++) {
    const nextDate = calculateNextInvoiceDate(currentDate, frequency, intervalCount);
    dates.push(nextDate);
    currentDate = nextDate;
  }

  return dates;
}

// Get statistics for dashboard
export async function getRecurringInvoiceStats(): Promise<ActionResult<{
  active: number;
  paused: number;
  total_monthly_value: number;
}>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('recurring_invoices')
      .select('status, invoice_template')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats = {
      active: data.filter(r => r.status === 'active').length,
      paused: data.filter(r => r.status === 'paused').length,
      total_monthly_value: data
        .filter(r => r.status === 'active')
        .reduce((sum, r) => sum + (r.invoice_template.total || 0), 0),
    };

    return { data: stats };
  } catch (error: any) {
    console.error('Error fetching recurring invoice stats:', error);
    return { error: error.message || 'Failed to fetch stats' };
  }
}
