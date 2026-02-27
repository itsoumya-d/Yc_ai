import { Settings, User, Bell, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchProfile } from '@/lib/actions/dashboard';
import { fetchAlertSettings } from '@/lib/actions/settings';

export default async function SettingsPage() {
  const [profileResult, alertsResult] = await Promise.all([
    fetchProfile(),
    fetchAlertSettings(),
  ]);

  const profile = profileResult.success ? profileResult.data : null;
  const alertSettings = alertsResult.success ? alertsResult.data : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-electric-400" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={profile?.full_name ?? ''}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input
              type="tel"
              defaultValue={profile?.phone ?? ''}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <button className="bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
            Save Profile
          </button>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-low-500" />
            <CardTitle>Alert Settings</CardTitle>
          </div>
          <CardDescription>Configure when you receive stock alerts</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Low Stock Threshold</label>
            <input
              type="number"
              defaultValue={alertSettings?.low_stock_threshold ?? 10}
              min={1}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-electric-500"
            />
            <p className="text-xs text-text-muted mt-1">Alert when product quantity falls below this number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Expiration Warning (days)</label>
            <input
              type="number"
              defaultValue={alertSettings?.expiration_warning_days ?? 7}
              min={1}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-electric-500"
            />
            <p className="text-xs text-text-muted mt-1">Alert this many days before product expiration</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={alertSettings?.push_opted_in ?? true} className="rounded" />
              <span className="text-sm text-text-primary">Push notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={alertSettings?.email_opted_in ?? true} className="rounded" />
              <span className="text-sm text-text-primary">Email notifications</span>
            </label>
          </div>
          <button className="bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
            Save Alert Settings
          </button>
        </div>
      </Card>

      {/* Organization */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-text-secondary" />
            <CardTitle>Organization</CardTitle>
          </div>
          <CardDescription>Manage your business settings</CardDescription>
        </CardHeader>
        <div className="py-4 text-center">
          <p className="text-sm text-text-muted">Organization settings will be available in a future update.</p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-out-600/30">
        <CardHeader>
          <CardTitle className="text-out-400">Danger Zone</CardTitle>
        </CardHeader>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="bg-out-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-out-700 transition-colors">
          Delete Account
        </button>
      </Card>
    </div>
  );
}
