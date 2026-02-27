import { fetchProfile } from '@/lib/actions/dashboard';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Bell, Shield, Trash2 } from 'lucide-react';

export default async function SettingsPage() {
  const profileRes = await fetchProfile();
  const profile = profileRes.success ? profileRes.data : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          <Input label="Full Name" name="full_name" defaultValue={profile?.full_name ?? ''} />
          <Input label="Email" name="email" type="email" defaultValue={profile?.email ?? ''} disabled />
          <Input label="Phone" name="phone" defaultValue={profile?.phone ?? ''} />
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
            <div>
              <p className="font-medium text-text-primary capitalize">{profile?.subscription_tier ?? 'free'} Plan</p>
              <p className="text-sm text-text-secondary">
                {profile?.subscription_tier === 'free'
                  ? 'Upgrade for unlimited disputes and AI calls'
                  : `Expires ${profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'N/A'}`}
              </p>
            </div>
            {profile?.subscription_tier === 'free' && (
              <Button size="sm">Upgrade</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          {[
            { key: 'dispute_updates', label: 'Dispute Updates', desc: 'Status changes on your disputes' },
            { key: 'bill_analysis_complete', label: 'Bill Analysis Complete', desc: 'When AI finishes analyzing a bill' },
            { key: 'savings_milestones', label: 'Savings Milestones', desc: 'When you reach savings goals' },
            { key: 'bank_fee_alerts', label: 'Bank Fee Alerts', desc: 'When new bank fees are detected' },
            { key: 'weekly_summary', label: 'Weekly Summary', desc: 'Weekly report of your savings activity' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="h-6 w-11 rounded-full bg-surface-secondary peer-checked:bg-champion-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <p className="text-sm text-text-secondary mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="danger" size="sm">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}
