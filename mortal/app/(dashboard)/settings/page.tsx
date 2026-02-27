import { Settings, User, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchProfile } from '@/lib/actions/settings';
import { formatDate } from '@/lib/utils';

export default async function SettingsPage() {
  const result = await fetchProfile();
  const profile = result.success ? result.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-sage-600" />
            <CardTitle>Profile</CardTitle>
          </div>
          <button className="text-sm text-sage-600 hover:text-sage-700 font-medium">Edit</button>
        </CardHeader>
        {profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Full Name</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{profile.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Date of Birth</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Phone</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{profile.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Location</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {profile.address_city && profile.address_state
                  ? `${profile.address_city}, ${profile.address_state}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Subscription</p>
              <p className="text-sm font-medium text-text-primary mt-0.5 capitalize">{profile.subscription_tier}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Member Since</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{formatDate(profile.created_at)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Unable to load profile information.</p>
        )}
      </Card>

      {/* Notifications */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-sage-600" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <button className="text-sm text-sage-600 hover:text-sage-700 font-medium">Edit</button>
        </CardHeader>
        {profile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                <p className="text-xs text-text-muted">Receive check-in reminders and updates via email</p>
              </div>
              <span className={`text-sm font-medium ${profile.notification_email ? 'text-sage-600' : 'text-text-muted'}`}>
                {profile.notification_email ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">SMS Notifications</p>
                <p className="text-xs text-text-muted">Receive check-in reminders via text message</p>
              </div>
              <span className={`text-sm font-medium ${profile.notification_sms ? 'text-sage-600' : 'text-text-muted'}`}>
                {profile.notification_sms ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Unable to load notification preferences.</p>
        )}
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-gentlered-200">
        <CardHeader>
          <CardTitle className="text-gentlered-600">Danger Zone</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Export Data</p>
              <p className="text-xs text-text-muted">Download all your data as a zip file</p>
            </div>
            <button className="text-sm text-sage-600 hover:text-sage-700 font-medium px-3 py-1.5 border border-border rounded-lg">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-sm font-medium text-gentlered-600">Delete Account</p>
              <p className="text-xs text-text-muted">Permanently delete your account and all data</p>
            </div>
            <button className="text-sm text-white bg-gentlered-600 hover:bg-gentlered-700 font-medium px-3 py-1.5 rounded-lg">
              Delete
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
