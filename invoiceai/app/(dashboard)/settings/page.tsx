import { createClient } from '@/lib/supabase/server';
import { SettingsPage as SettingsContent } from '@/components/settings/settings-page';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
  ]);

  return <SettingsContent profile={profile} subscription={subscription} />;
}
