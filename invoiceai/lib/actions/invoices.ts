'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Invoice, InvoiceItem, InvoiceWithDetails } from '@/types/database';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
}

export interface InvoiceFormData {
  client_id: string;
  issue_date: string;
  due_date: string;
  payment_terms: number;
  currency?: string;
  tax_rate?: number;
  discount_amount?: number;
  discount_type?: 'flat' | 'percent';
  notes?: string;
  terms?: string;
  template?: string;
  personal_message?: string;
  ai_input_text?: string;
  items: InvoiceItemInput[];
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: Invoice;
}

interface InvoiceListResult {
  invoices: InvoiceWithDetails[];
  total: number;
  error?: string;
}

export async function getInvoices(options?: {
  search?: string;
  status?: string;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<InvoiceListResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { invoices: [], total: 0, error: 'Not authenticated' };
  }

  const {
    search,
    status,
    clientId,
    sortBy = 'created_at',
    sortDirection = 'desc',
    page = 1,
    pageSize = 20,
  } = options ?? {};

  let query = supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*), payments(*)', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%`);
  }

  query = query
    .order(sortBy, { ascending: sortDirection === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return { invoices: [], total: 0, error: error.message };
  }

  return { invoices: (data as unknown as InvoiceWithDetails[]) ?? [], total: count ?? 0 };
}

export async function getInvoice(id: string): Promise<{ success: boolean; error?: string; data?: InvoiceWithDetails }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as unknown as InvoiceWithDetails };
}

export async function createInvoiceAction(formData: InvoiceFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!formData.client_id) {
    return { success: false, error: 'Client is required' };
  }

  if (!formData.items || formData.items.length === 0) {
    return { success: false, error: 'At least one line item is required' };
  }

  // Get user profile for invoice number
  const { data: profile } = await supabase
    .from('users')
    .select('invoice_number_format, next_invoice_number')
    .eq('id', user.id)
    .single();

  const format = profile?.invoice_number_format ?? 'INV-{number}';
  const nextNum = profile?.next_invoice_number ?? 1;
  const invoiceNumber = format.replace('{number}', nextNum.toString().padStart(4, '0'));

  // Calculate totals
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxRate = formData.tax_rate ?? 0;
  const taxAmount = (subtotal * taxRate) / 100;
  let discountAmount = 0;
  if (formData.discount_amount) {
    discountAmount =
      formData.discount_type === 'percent'
        ? (subtotal * formData.discount_amount) / 100
        : formData.discount_amount;
  }
  const total = subtotal + taxAmount - discountAmount;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id: formData.client_id,
      invoice_number: invoiceNumber,
      status: 'draft',
      issue_date: formData.issue_date,
      due_date: formData.due_date,
      payment_terms: formData.payment_terms,
      currency: formData.currency ?? 'USD',
      subtotal: Math.round(subtotal * 100) / 100,
      tax_rate: taxRate,
      tax_amount: Math.round(taxAmount * 100) / 100,
      discount_amount: Math.round(discountAmount * 100) / 100,
      discount_type: formData.discount_type ?? 'flat',
      total: Math.round(total * 100) / 100,
      amount_paid: 0,
      amount_due: Math.round(total * 100) / 100,
      notes: formData.notes ?? null,
      terms: formData.terms ?? null,
      template: formData.template ?? 'classic',
      personal_message: formData.personal_message ?? null,
      ai_input_text: formData.ai_input_text ?? null,
    })
    .select()
    .single();

  if (invoiceError) {
    return { success: false, error: invoiceError.message };
  }

  // Create line items
  const itemsToInsert = formData.items.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
    sort_order: item.sort_order ?? index,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // Rollback invoice creation
    await supabase.from('invoices').delete().eq('id', invoice.id);
    return { success: false, error: itemsError.message };
  }

  // Increment invoice number
  await supabase
    .from('users')
    .update({ next_invoice_number: nextNum + 1 })
    .eq('id', user.id);

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
  return { success: true, data: invoice };
}

export async function updateInvoiceAction(
  id: string,
  formData: Partial<InvoiceFormData>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const updateData: Record<string, unknown> = {};

  if (formData.client_id !== undefined) updateData.client_id = formData.client_id;
  if (formData.issue_date !== undefined) updateData.issue_date = formData.issue_date;
  if (formData.due_date !== undefined) updateData.due_date = formData.due_date;
  if (formData.payment_terms !== undefined) updateData.payment_terms = formData.payment_terms;
  if (formData.currency !== undefined) updateData.currency = formData.currency;
  if (formData.tax_rate !== undefined) updateData.tax_rate = formData.tax_rate;
  if (formData.notes !== undefined) updateData.notes = formData.notes ?? null;
  if (formData.terms !== undefined) updateData.terms = formData.terms ?? null;
  if (formData.template !== undefined) updateData.template = formData.template;
  if (formData.personal_message !== undefined)
    updateData.personal_message = formData.personal_message ?? null;

  // If items are provided, recalculate totals
  if (formData.items && formData.items.length > 0) {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxRate = formData.tax_rate ?? 0;
    const taxAmount = (subtotal * taxRate) / 100;
    let discountAmount = 0;
    if (formData.discount_amount) {
      discountAmount =
        formData.discount_type === 'percent'
          ? (subtotal * formData.discount_amount) / 100
          : formData.discount_amount;
    }
    const total = subtotal + taxAmount - discountAmount;

    updateData.subtotal = Math.round(subtotal * 100) / 100;
    updateData.tax_amount = Math.round(taxAmount * 100) / 100;
    updateData.discount_amount = Math.round(discountAmount * 100) / 100;
    updateData.total = Math.round(total * 100) / 100;

    // Delete existing items and re-insert
    await supabase.from('invoice_items').delete().eq('invoice_id', id);

    const itemsToInsert = formData.items.map((item, index) => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: Math.round(item.quantity * item.unit_price * 100) / 100,
      sort_order: item.sort_order ?? index,
    }));

    await supabase.from('invoice_items').insert(itemsToInsert);
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { success: true, data };
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice['status']
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { status };

  if (status === 'sent') updateData.sent_at = now;
  if (status === 'viewed') updateData.viewed_at = now;
  if (status === 'paid') updateData.paid_at = now;
  if (status === 'cancelled') updateData.cancelled_at = now;

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  revalidatePath('/dashboard');
  return { success: true, data };
}

export async function deleteInvoiceAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Delete items first (should cascade but be explicit)
  await supabase.from('invoice_items').delete().eq('invoice_id', id);

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function recordPaymentAction(
  invoiceId: string,
  payment: {
    amount: number;
    payment_method: 'card' | 'ach' | 'manual' | 'other';
    payment_date: string; // YYYY-MM-DD
    reference_note?: string;
  }
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, total, amount_paid, amount_due, currency, status')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  if (payment.amount <= 0) {
    return { success: false, error: 'Payment amount must be greater than zero' };
  }

  if (payment.amount > (invoice.amount_due ?? invoice.total)) {
    return { success: false, error: 'Payment amount exceeds balance due' };
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    invoice_id: invoiceId,
    amount: payment.amount,
    currency: invoice.currency ?? 'USD',
    payment_method: payment.payment_method,
    status: 'succeeded',
    payment_date: payment.payment_date,
    reference_note: payment.reference_note ?? null,
  });

  if (paymentError) {
    return { success: false, error: paymentError.message };
  }

  const newAmountPaid = (invoice.amount_paid ?? 0) + payment.amount;
  const newAmountDue = Math.max(0, invoice.total - newAmountPaid);
  const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';

  const { data, error: updateError } = await supabase
    .from('invoices')
    .update({
      amount_paid: Math.round(newAmountPaid * 100) / 100,
      amount_due: Math.round(newAmountDue * 100) / 100,
      status: newStatus,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath('/dashboard');
  return { success: true, data };
}

export async function duplicateInvoiceAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get original invoice with items
  const { data: original, error: fetchError } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', id)
    .single();

  if (fetchError || !original) {
    return { success: false, error: fetchError?.message ?? 'Invoice not found' };
  }

  // Get next invoice number
  const { data: profile } = await supabase
    .from('users')
    .select('invoice_number_format, next_invoice_number')
    .eq('id', user.id)
    .single();

  const format = profile?.invoice_number_format ?? 'INV-{number}';
  const nextNum = profile?.next_invoice_number ?? 1;
  const invoiceNumber = format.replace('{number}', nextNum.toString().padStart(4, '0'));

  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + original.payment_terms * 86400000)
    .toISOString()
    .split('T')[0];

  return createInvoiceAction({
    client_id: original.client_id,
    issue_date: today,
    due_date: dueDate,
    payment_terms: original.payment_terms,
    currency: original.currency,
    tax_rate: original.tax_rate,
    discount_amount: original.discount_amount,
    discount_type: original.discount_type,
    notes: original.notes,
    terms: original.terms,
    template: original.template,
    items: (original.items as InvoiceItem[]).map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  });
}
