import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <ProfileForm user={{ email: user?.email, full_name: user?.user_metadata?.full_name }} />
    </div>
  );
}
