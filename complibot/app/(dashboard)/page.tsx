import {
  Shield,
  AlertTriangle,
  ClipboardList,
  FileText,
  Archive,
  Link,
  Clock,
  Activity,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Frameworks', value: '0', icon: Shield, color: 'text-trust-600', bg: 'bg-trust-50' },
  { label: 'Open Gaps', value: '0', icon: AlertTriangle, color: 'text-alert-600', bg: 'bg-alert-50' },
  { label: 'Active Tasks', value: '0', icon: ClipboardList, color: 'text-warn-600', bg: 'bg-warn-50' },
  { label: 'Policies', value: '0', icon: FileText, color: 'text-trust-600', bg: 'bg-trust-50' },
  { label: 'Evidence Items', value: '0', icon: Archive, color: 'text-shield-600', bg: 'bg-shield-50' },
  { label: 'Integrations', value: '0', icon: Link, color: 'text-gray-600', bg: 'bg-gray-50' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Compliance Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of your compliance posture
        </p>
      </div>

      {/* Compliance Score */}
      <Card className="flex items-center gap-6 border-trust-200 bg-gradient-to-r from-trust-50 to-surface">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-trust-400 bg-trust-50">
          <Shield className="h-10 w-10 text-trust-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">Overall Score</p>
          <p className="text-4xl font-bold text-trust-700">78%</p>
          <p className="mt-0.5 text-xs text-text-muted">Based on selected frameworks</p>
        </div>
        <div className="ml-auto">
          <Badge variant="blue">Good</Badge>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="sm" hover>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Critical Gaps Banner */}
      <Card className="border-l-4 border-l-alert-500">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-alert-50">
            <AlertTriangle className="h-5 w-5 text-alert-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-alert-700">Critical Gaps Detected</p>
            <p className="text-sm text-text-secondary">
              3 critical gaps need attention before your next audit deadline.
            </p>
          </div>
          <Badge variant="red">3 Critical</Badge>
        </div>
      </Card>

      {/* Bottom Two-Column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-warn-600" />
            <CardTitle>Upcoming Deadlines</CardTitle>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="mb-3 h-10 w-10 text-text-muted" />
            <p className="text-sm font-medium text-text-secondary">No upcoming deadlines</p>
            <p className="mt-1 text-xs text-text-muted">
              Deadlines will appear here once you select frameworks
            </p>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-trust-600" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="mb-3 h-10 w-10 text-text-muted" />
            <p className="text-sm font-medium text-text-secondary">No recent activity</p>
            <p className="mt-1 text-xs text-text-muted">
              Activity from your team will appear here
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
