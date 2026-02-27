import { getUserProfile, getOrganization, getAuditLog } from '@/lib/actions/settings';
import { SettingsView } from '@/components/settings/settings-view';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [profileResult, orgResult, auditResult] = await Promise.all([
    getUserProfile(),
    getOrganization(),
    getAuditLog(20),
  ]);

  return (
    <SettingsView
      profile={profileResult.data ?? null}
      organization={orgResult.data ?? null}
      auditLog={auditResult.data ?? []}
    />
  );
}
