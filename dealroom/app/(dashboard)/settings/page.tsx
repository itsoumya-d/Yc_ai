import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Integration {
  name: string
  description: string
  icon: string
  connected: boolean
  provider: string
}

interface NotificationPref {
  label: string
  description: string
  enabled: boolean
}

const integrations: Integration[] = [
  { name: 'CRM', description: 'Sync deals, contacts, and activities', icon: '🔗', connected: false, provider: 'Salesforce / HubSpot' },
  { name: 'Email', description: 'Track email conversations and sentiment', icon: '✉', connected: true, provider: 'Gmail' },
  { name: 'Calendar', description: 'Sync meetings and call schedules', icon: '📅', connected: true, provider: 'Google Calendar' },
  { name: 'Video', description: 'Record and analyze sales calls', icon: '🎥', connected: false, provider: 'Zoom' },
]

const teamMembers = [
  { name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Sales Rep', initials: 'SC' },
  { name: 'James Patel', email: 'james.patel@company.com', role: 'Sales Rep', initials: 'JP' },
  { name: 'Mike Torres', email: 'mike.torres@company.com', role: 'Sales Rep', initials: 'MT' },
  { name: 'Lisa Wang', email: 'lisa.wang@company.com', role: 'Sales Rep', initials: 'LW' },
  { name: 'Alex Morgan', email: 'alex.morgan@company.com', role: 'Sales Manager', initials: 'AM' },
]

const notificationPrefs: NotificationPref[] = [
  { label: 'Deal at Risk Alerts', description: 'Get notified when a deal health score drops below threshold', enabled: true },
  { label: 'Ghost Alerts', description: 'Alert when a contact has not responded in 5+ days', enabled: true },
  { label: 'Forecast Updates', description: 'Weekly forecast summary and changes', enabled: true },
  { label: 'Coaching Insights', description: 'New AI coaching recommendations for your team', enabled: false },
  { label: 'Activity Reminders', description: 'Daily reminder for overdue tasks and follow-ups', enabled: true },
  { label: 'Deal Stage Changes', description: 'Notify when deals move between pipeline stages', enabled: false },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your organization, team, integrations, and preferences.</p>
      </div>

      {/* General Settings */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            General
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Org Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="Acme Sales Team"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Timezone
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
                <option>America/New_York (EST)</option>
                <option>America/Chicago (CST)</option>
                <option>America/Denver (MST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
                <option>Europe/Berlin (CET)</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Currency
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
                <option>USD ($)</option>
                <option>EUR (&#8364;)</option>
                <option>GBP (&#163;)</option>
                <option>CAD (C$)</option>
                <option>AUD (A$)</option>
              </select>
            </div>

            {/* Fiscal Year */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Fiscal Year Start
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>July</option>
                <option>October</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Button className="bg-brand-600 text-white hover:bg-brand-700 text-sm">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Team */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold text-text-primary">
              Team
            </CardTitle>
            <Button className="bg-brand-600 text-white hover:bg-brand-700 text-sm">
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{member.name}</p>
                    <p className="text-xs text-text-muted">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs px-2 py-0.5 ${
                    member.role === 'Sales Manager'
                      ? 'bg-ai-100 text-ai-700'
                      : 'bg-surface text-text-secondary border border-border'
                  }`}>
                    {member.role}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs text-text-muted hover:text-text-primary">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Integrations */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            Integrations
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl border border-border">
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{integration.name}</p>
                      {integration.connected && (
                        <Badge className="bg-success-100 text-success-700 text-xs px-1.5 py-0">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{integration.description}</p>
                    <p className="text-xs text-text-muted">{integration.provider}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {integration.connected ? (
                    <Button variant="secondary" size="sm" className="text-xs border-border text-text-secondary hover:text-text-primary">
                      Configure
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-brand-600 text-white hover:bg-brand-700 text-xs">
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            Notifications
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="space-y-4">
            {notificationPrefs.map((pref, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-text-primary">{pref.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{pref.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {/* Toggle Switch */}
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pref.enabled ? 'bg-brand-600' : 'bg-surface-secondary border border-border'
                    }`}
                    role="switch"
                    aria-checked={pref.enabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        pref.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <div className="pt-4 border-t border-border">
        <Button variant="secondary" className="border-danger-300 text-danger-600 hover:bg-danger-50 hover:text-danger-700">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
