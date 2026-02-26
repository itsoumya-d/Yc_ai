import { getProfile } from '@/lib/actions/profile';
import { SettingsPage as SettingsClient } from '@/components/dashboard/settings-page';

export default async function SettingsPage() {
  const profile = await getProfile();
  return <SettingsClient profile={profile} />;
}
