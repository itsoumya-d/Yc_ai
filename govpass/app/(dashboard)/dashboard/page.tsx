import {
  Shield,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  FolderLock,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, fetchRecentApplications, fetchRecentEligibility } from '@/lib/actions/dashboard';
import { formatCurrency, getApplicationStatusColor, getApplicationStatusLabel, getEligibilityStatusColor, getEligibilityStatusLabel } from '@/lib/utils';

export default async function DashboardPage() {
  const [statsResult, appsResult, eligibilityResult] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentApplications(),
    fetchRecentEligibility(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const applications = appsResult.success ? appsResult.data : [];
  const eligibility = eligibilityResult.success ? eligibilityResult.data : [];

  const statCards = [
    { label: 'Eligible Programs', value: stats?.eligible_programs ?? 0, icon: <CheckCircle className="h-5 w-5 text-civic-600" />, href: '/eligibility' },
    { label: 'Active Applications', value: stats?.active_applications ?? 0, icon: <FileText className="h-5 w-5 text-trust-600" />, href: '/applications' },
    { label: 'Approved Annual', value: formatCurrency(stats?.approved_total_annual ?? 0), icon: <TrendingUp className="h-5 w-5 text-approval-600" />, href: '/applications' },
    { label: 'Upcoming Deadlines', value: stats?.pending_deadlines ?? 0, icon: <Clock className="h-5 w-5 text-deadline-600" />, href: '/applications' },
    { label: 'Unread Alerts', value: stats?.unread_notifications ?? 0, icon: <Bell className="h-5 w-5 text-notice-600" />, href: '/notifications' },
    { label: 'Documents', value: stats?.documents_in_vault ?? 0, icon: <FolderLock className="h-5 w-5 text-text-secondary" />, href: '/vault' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Your benefits overview at a glance</p>
        </div>
        <Link
          href="/eligibility"
          className="hidden sm:inline-flex items-center gap-2 bg-trust-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors"
        >
          <Shield className="h-4 w-4" />
          Check Eligibility
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1 font-heading">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <Link href="/applications" className="text-sm text-trust-600 hover:text-trust-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No applications yet</p>
            <Link href="/eligibility" className="text-sm text-trust-600 hover:text-trust-700 mt-1 inline-block">
              Find benefits to apply for
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {app.program?.program_name ?? 'Unknown Program'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Step {app.current_step}/{app.total_steps}
                    {app.next_deadline && (
                      <span className="ml-2 text-deadline-600">
                        <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                        Due {new Date(app.next_deadline).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                <Badge variant={getApplicationStatusColor(app.status) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                  {getApplicationStatusLabel(app.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Eligibility Results */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Eligibility Results</CardTitle>
          <Link href="/eligibility" className="text-sm text-trust-600 hover:text-trust-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {eligibility.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No eligibility checks yet</p>
            <Link href="/eligibility" className="text-sm text-trust-600 hover:text-trust-700 mt-1 inline-block">
              Run your first check
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibility.map((result) => (
              <div key={result.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {result.program?.program_name ?? 'Unknown Program'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {result.estimated_monthly_value
                      ? `Est. ${formatCurrency(result.estimated_monthly_value)}/mo`
                      : 'Value TBD'}
                  </p>
                </div>
                <Badge variant={getEligibilityStatusColor(result.eligibility_status) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                  {getEligibilityStatusLabel(result.eligibility_status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
