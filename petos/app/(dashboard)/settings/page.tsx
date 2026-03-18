import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { getNotificationPrefs } from '@/lib/actions/settings';

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

  const [{ data: notifPrefs }, t] = await Promise.all([
    getNotificationPrefs(),
    getTranslations('settings'),
  ]);

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <div className="mt-6 space-y-6">
        <ProfileForm user={user} />
        <NotificationPreferences initialPrefs={notifPrefs} />
      </div>
    </div>
  );
}
