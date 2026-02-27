import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';
import { BillingSection } from '@/components/settings/billing-section';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .single();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account." />
      <ProfileForm user={{ email: user?.email, full_name: user?.user_metadata?.full_name }} />
      <BillingSection subscription={subscription ?? null} />
    </div>
  );
}
