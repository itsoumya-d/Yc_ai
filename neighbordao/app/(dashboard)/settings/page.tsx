import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { SettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  return <SettingsClient neighborhood={neighborhood} userEmail={user.email ?? ''} />;
}
