import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: { user } }, t] = await Promise.all([
    supabase.auth.getUser(),
    getTranslations('settings'),
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} className="mb-8" />
      <ProfileForm user={user} />
    </div>
  );
}
