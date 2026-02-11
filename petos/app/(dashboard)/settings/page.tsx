import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';
import { NotificationPreferences } from '@/components/settings/notification-preferences';

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

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />
      <div className="mt-6 space-y-6">
        <ProfileForm user={user} />
        <NotificationPreferences />
      </div>
    </div>
  );
}
