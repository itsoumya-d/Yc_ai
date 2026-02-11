import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings." />
      <ProfileForm user={{ email: user?.email, full_name: user?.user_metadata?.full_name }} />
    </div>
  );
}
