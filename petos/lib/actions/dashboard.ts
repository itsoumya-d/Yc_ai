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

  // Get pet count
  const { count: petCount } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get user's pet IDs
  const { data: userPets } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', user.id);

  const petIds = userPets?.map((p) => p.id) || [];

  let upcomingAppointments = 0;
  let activeMedications = 0;
  let monthlyExpenses = 0;

  if (petIds.length > 0) {
    const today = new Date().toISOString().split('T')[0];

    // Upcoming appointments
    const { count: apptCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .in('pet_id', petIds)
      .eq('status', 'scheduled')
      .gte('date', today);

    upcomingAppointments = apptCount || 0;

    // Active medications
    const { count: medCount } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true })
      .in('pet_id', petIds)
      .eq('is_active', true);

    activeMedications = medCount || 0;

    // Monthly expenses
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .in('pet_id', petIds)
      .gte('date', monthStart);

    monthlyExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  }

  return {
    data: {
      petCount: petCount || 0,
      upcomingAppointments,
      activeMedications,
      monthlyExpenses,
    },
  };
}
