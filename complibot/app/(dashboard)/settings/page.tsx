import { Building2, Users, Link, Bell, LogOut } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signOut } from '@/lib/actions/auth';

const integrations = [
  { name: 'AWS', description: 'Amazon Web Services', connected: false },
  { name: 'GCP', description: 'Google Cloud Platform', connected: false },
  { name: 'GitHub', description: 'Source code management', connected: false },
];

const notifications = [
  { label: 'Compliance drift alerts', description: 'Notify when controls fall out of compliance' },
  { label: 'Task assignments', description: 'Notify when tasks are assigned to you' },
  { label: 'Evidence expiration', description: 'Notify when evidence becomes stale' },
  { label: 'Audit room activity', description: 'Notify when auditors access shared rooms' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your organization and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-trust-600" />
          <CardTitle>General</CardTitle>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Organization Name" placeholder="Your company name" />
          <Input label="Industry" placeholder="e.g., SaaS, Healthcare, Finance" />
        </div>
      </Card>

      {/* Team Settings */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-trust-600" />
          <CardTitle>Team</CardTitle>
        </div>
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-text-muted" />
          <p className="text-sm font-medium text-text-secondary">Invite Team Members</p>
          <p className="mt-1 text-xs text-text-muted">
            Add team members to collaborate on compliance tasks
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Input placeholder="email@company.com" className="max-w-xs" />
            <Button size="sm">Invite</Button>
          </div>
        </div>
      </Card>

      {/* Integrations */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Link className="h-5 w-5 text-trust-600" />
          <CardTitle>Integrations</CardTitle>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-semibold text-text-primary">{integration.name}</p>
                <p className="text-xs text-text-secondary">{integration.description}</p>
              </div>
              <Button variant="secondary" size="sm">
                Connect
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-trust-600" />
          <CardTitle>Notifications</CardTitle>
        </div>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.label}
              className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{notification.label}</p>
                <p className="text-xs text-text-secondary">{notification.description}</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors">
                <span className="inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sign Out */}
      <Card className="border-alert-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-alert-600" />
            <div>
              <p className="font-semibold text-text-primary">Sign Out</p>
              <p className="text-xs text-text-secondary">Sign out of your account</p>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="danger" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
