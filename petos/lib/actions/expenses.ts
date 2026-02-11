'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Expense } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getExpenses(petId?: string): Promise<ActionResult<Expense[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('expenses')
    .select('*, pets(name)')
    .order('date', { ascending: false });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  // Filter by user's pets
  const { data: userPets } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', user.id);

  if (!userPets) return { data: [] };
  const petIds = userPets.map((p) => p.id);

  const { data, error } = await supabase
    .from('expenses')
    .select('*, pets(name)')
    .in('pet_id', petIds)
    .order('date', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as unknown as Expense[] };
}

export async function createExpense(formData: FormData): Promise<ActionResult<Expense>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const expenseData = {
    pet_id: (formData.get('pet_id') as string) || null,
    amount: parseFloat(formData.get('amount') as string),
    date: formData.get('date') as string,
    category: formData.get('category') as string,
    description: (formData.get('description') as string) || null,
    receipt_url: (formData.get('receipt_url') as string) || null,
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert(expenseData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/expenses');
  revalidatePath('/dashboard');
  return { data: data as Expense };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/expenses');
  revalidatePath('/dashboard');
  return {};
}

export async function getExpenseSummary(): Promise<ActionResult<{ total: number; byCategory: Record<string, number>; thisMonth: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: userPets } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', user.id);

  if (!userPets || userPets.length === 0) {
    return { data: { total: 0, byCategory: {}, thisMonth: 0 } };
  }

  const petIds = userPets.map((p) => p.id);

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('amount, category, date')
    .in('pet_id', petIds);

  if (error) return { error: error.message };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  let total = 0;
  let thisMonth = 0;
  const byCategory: Record<string, number> = {};

  for (const exp of expenses || []) {
    total += exp.amount;
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    if (exp.date >= thisMonthStart) {
      thisMonth += exp.amount;
    }
  }

  return { data: { total, byCategory, thisMonth } };
}
