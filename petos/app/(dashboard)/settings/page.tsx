import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { BillingSection } from '@/components/settings/billing-section';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />
      <div className="mt-6 space-y-6">
        <ProfileForm user={user} />
        <BillingSection subscription={subscription} />
        <NotificationPreferences />
      </div>
    </div>
  );
}
