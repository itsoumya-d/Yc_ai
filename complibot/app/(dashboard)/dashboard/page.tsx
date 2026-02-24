import Link from 'next/link';
import { AlertTriangle, ShieldCheck, FileText, FolderOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrg } from '@/lib/actions/orgs';
import { getFrameworks } from '@/lib/actions/frameworks';
import { getGaps } from '@/lib/actions/gaps';

const FRAMEWORK_LABELS: Record<string, string> = {
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  hipaa: 'HIPAA',
  iso27001: 'ISO 27001',
  pci_dss: 'PCI DSS',
};

const FRAMEWORK_COLORS: Record<string, string> = {
  soc2: 'bg-blue-500',
  gdpr: 'bg-purple-500',
  hipaa: 'bg-teal-500',
  iso27001: 'bg-orange-500',
  pci_dss: 'bg-pink-500',
};

export default async function DashboardPage() {
  const [org, frameworks, gaps] = await Promise.all([
    getOrg(),
    getFrameworks(),
    getGaps({ resolved: false }),
  ]);

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CompliBot</h1>
        <p className="text-gray-500 mb-8">
          Set up your organization to start tracking compliance across SOC 2, GDPR, HIPAA, and more.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
        >
          Set Up Organization
        </Link>
      </div>
    );
  }

  const enabledFrameworks = frameworks.filter(f => f.enabled);
  const overallScore = enabledFrameworks.length > 0
    ? Math.round(
        enabledFrameworks.reduce((sum, f) => sum + f.compliance_score, 0) / enabledFrameworks.length
      )
    : 0;

  const criticalGaps = gaps.filter(g => g.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Compliance Dashboard
          {org.target_audit_date && (
            <span className="ml-2 text-blue-600 font-medium">
              · Audit target: {new Date(org.target_audit_date).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall score */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Overall Score</p>
                <p className="text-3xl font-bold text-gray-900">{overallScore}<span className="text-lg text-gray-400">%</span></p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active frameworks */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active Frameworks</p>
                <p className="text-3xl font-bold text-gray-900">{enabledFrameworks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical gaps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Critical Gaps</p>
                <p className="text-3xl font-bold text-gray-900">{criticalGaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open gaps total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Open Gaps</p>
                <p className="text-3xl font-bold text-gray-900">{gaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework cards */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Framework Progress</h2>
        {enabledFrameworks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 text-sm">No frameworks enabled yet.</p>
              <Link href="/frameworks" className="mt-2 inline-block text-sm text-blue-600 hover:underline font-medium">
                Enable frameworks
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enabledFrameworks.map(framework => {
              const label = FRAMEWORK_LABELS[framework.framework_type] ?? framework.framework_type;
              const color = FRAMEWORK_COLORS[framework.framework_type] ?? 'bg-gray-400';
              const score = Math.round(framework.compliance_score);
              return (
                <Card key={framework.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <Badge variant={score >= 80 ? 'approved' : score >= 50 ? 'medium' : 'high'}>
                        {score}%
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{label}</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {framework.controls_compliant} / {framework.controls_total} controls compliant
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/gaps">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-amber-200 bg-amber-50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">View Gaps</p>
                  <p className="text-xs text-gray-500">{gaps.length} open items</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/policies">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Generate Policy</p>
                  <p className="text-xs text-gray-500">AI-powered policy drafts</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/evidence">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Upload Evidence</p>
                  <p className="text-xs text-gray-500">Document compliance proof</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent critical gaps */}
      {criticalGaps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Critical Gaps Requiring Attention</h2>
            <Link href="/gaps" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {criticalGaps.slice(0, 3).map(gap => (
              <Card key={gap.id} className="border-red-200">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="critical">Critical</Badge>
                      <p className="font-medium text-gray-900 text-sm truncate">{gap.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{gap.description}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{gap.estimated_hours}h est.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
