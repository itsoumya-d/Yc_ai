'use server';

import { createClient } from '@/lib/supabase/server';

interface DashboardData {
  petCount: number;
  upcomingAppointments: number;
  activeMedications: number;
  monthlyExpenses: number;
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  // First: get pet IDs (lightweight — only id column)
  const { data: userPets, count: petCount } = await supabase
    .from('pets')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id);

  const petIds = (userPets ?? []).map((p) => p.id);

  if (petIds.length === 0) {
    return {
      data: {
        petCount: petCount ?? 0,
        upcomingAppointments: 0,
        activeMedications: 0,
        monthlyExpenses: 0,
      },
    };
  }

  // All remaining queries run in parallel now that we have pet IDs
  const [
    { count: upcomingAppointments },
    { count: activeMedications },
    expensesRes,
  ] = await Promise.all([
    // Count-only: upcoming scheduled appointments
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .in('pet_id', petIds)
      .eq('status', 'scheduled')
      .gte('date', today),

    // Count-only: active medications
    supabase
      .from('medications')
      .select('id', { count: 'exact', head: true })
      .in('pet_id', petIds)
      .eq('is_active', true),

    // Monthly expenses: only the amount column needed for summing
    supabase
      .from('expenses')
      .select('amount')
      .in('pet_id', petIds)
      .gte('date', monthStart),
  ]);

  const monthlyExpenses = (expensesRes.data ?? []).reduce((sum, e) => sum + e.amount, 0);

  return {
    data: {
      petCount: petCount ?? 0,
      upcomingAppointments: upcomingAppointments ?? 0,
      activeMedications: activeMedications ?? 0,
      monthlyExpenses,
    },
  };
}
