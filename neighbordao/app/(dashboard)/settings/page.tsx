import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/actions/auth';

export default function SettingsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your profile and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-leaf-600" />
            <CardTitle>Profile</CardTitle>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your display name"
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Bio
              </label>
              <textarea
                placeholder="Tell your neighbors about yourself..."
                rows={3}
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Skills
              </label>
              <input
                type="text"
                placeholder="e.g., Gardening, Electrical, Cooking"
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500"
              />
              <p className="mt-1 text-xs text-text-muted">Comma-separated list of your skills</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Phone
              </label>
              <input
                type="tel"
                placeholder="555-0123"
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500"
              />
              <p className="mt-1 text-xs text-text-muted">Visible to neighbors based on your privacy settings</p>
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-leaf-600" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <div className="space-y-3">
            {[
              { label: 'New posts in feed', key: 'posts' },
              { label: 'Safety alerts', key: 'safety' },
              { label: 'Event invitations', key: 'events' },
              { label: 'Group order updates', key: 'orders' },
              { label: 'Voting deadlines', key: 'voting' },
              { label: 'Resource bookings', key: 'bookings' },
              { label: 'Weekly digest', key: 'digest' },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-text-primary">{pref.label}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <input type="checkbox" defaultChecked className="rounded border-border text-leaf-600 focus:ring-leaf-500" />
                    In-App
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <input type="checkbox" defaultChecked={pref.key === 'safety' || pref.key === 'digest'} className="rounded border-border text-leaf-600 focus:ring-leaf-500" />
                    Email
                  </label>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-leaf-600" />
            <CardTitle>Privacy</CardTitle>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Profile Visibility
              </label>
              <div className="flex items-center gap-4">
                {['Neighbors', 'Public', 'Private'].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <input
                      type="radio"
                      name="visibility"
                      defaultChecked={i === 0}
                      className="border-border text-leaf-600 focus:ring-leaf-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between py-2">
              <span className="text-sm text-text-primary">Show on neighborhood map</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-leaf-600 focus:ring-leaf-500" />
            </label>
            <label className="flex items-center justify-between py-2">
              <span className="text-sm text-text-primary">Show in directory</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-leaf-600 focus:ring-leaf-500" />
            </label>
            <label className="flex items-center justify-between py-2">
              <span className="text-sm text-text-primary">Allow direct messages</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-leaf-600 focus:ring-leaf-500" />
            </label>
          </div>
        </Card>

        {/* Sign Out */}
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Sign out of your NeighborDAO account</CardDescription>
            </div>
            <form action={signOut}>
              <Button variant="danger" type="submit">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
