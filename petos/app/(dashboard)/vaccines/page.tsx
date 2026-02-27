import { createClient } from '@/lib/supabase/server';
import { VaccineScheduler } from '@/components/health/vaccine-scheduler';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vaccine Schedule',
};

export default async function VaccinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, date_of_birth')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name');

  // Fetch all vaccination health records
  const { data: vaccinations } = await supabase
    .from('health_records')
    .select('*, pet:pets(id, name, species)')
    .eq('user_id', user.id)
    .eq('type', 'vaccination')
    .order('date', { ascending: false });

  return (
    <VaccineScheduler
      pets={pets ?? []}
      vaccinations={vaccinations ?? []}
    />
  );
}
