'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Expense, Category } from '@/types/database';

export interface ExpenseFormData {
  category_id?: string;
  client_id?: string;
  description: string;
  amount: number;
  currency?: string;
  date: string;
  is_billable?: boolean;
  is_tax_deductible?: boolean;
  notes?: string;
}

export async function getExpenses(options?: {
  page?: number;
  pageSize?: number;
}): Promise<{ expenses: Expense[]; total: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { expenses: [], total: 0, error: 'Not authenticated' };
  }

  const { page = 1, pageSize = 50 } = options ?? {};

  const { data, error, count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    return { expenses: [], total: 0, error: error.message };
  }

  return { expenses: data ?? [], total: count ?? 0 };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return data ?? [];
}

export async function createExpenseAction(
  formData: ExpenseFormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    category_id: formData.category_id || null,
    client_id: formData.client_id || null,
    description: formData.description.trim(),
    amount: formData.amount,
    currency: formData.currency ?? 'USD',
    date: formData.date,
    is_billable: formData.is_billable ?? false,
    is_tax_deductible: formData.is_tax_deductible ?? false,
    notes: formData.notes?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/expenses');
  return { success: true };
}

export async function deleteExpenseAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/expenses');
  return { success: true };
}
