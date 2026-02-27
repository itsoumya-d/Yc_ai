import {
  BarChart3,
  FileText,
  PieChart,
  AlertTriangle,
  Archive,
  Presentation,
  Download,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const reportTypes = [
  {
    title: 'Executive Summary',
    description: 'High-level compliance overview for leadership',
    icon: PieChart,
    color: 'text-trust-600',
    bg: 'bg-trust-50',
  },
  {
    title: 'Full Compliance Report',
    description: 'Comprehensive report across all frameworks',
    icon: FileText,
    color: 'text-shield-600',
    bg: 'bg-shield-50',
  },
  {
    title: 'Gap Analysis Report',
    description: 'Detailed breakdown of open compliance gaps',
    icon: AlertTriangle,
    color: 'text-alert-600',
    bg: 'bg-alert-50',
  },
  {
    title: 'Evidence Summary',
    description: 'Summary of all collected evidence and status',
    icon: Archive,
    color: 'text-warn-600',
    bg: 'bg-warn-50',
  },
  {
    title: 'Board Presentation',
    description: 'Presentation-ready slides for board meetings',
    icon: Presentation,
    color: 'text-trust-600',
    bg: 'bg-trust-50',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Generate and download compliance reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} hover className="cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${report.bg}`}>
                  <Icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{report.title}</h3>
                  <p className="mt-0.5 text-sm text-text-secondary">{report.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate Report Button */}
      <div className="flex justify-end">
        <Button>
          <Download className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Recent Reports */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-trust-600" />
          <CardTitle>Recent Reports</CardTitle>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-trust-50">
            <BarChart3 className="h-6 w-6 text-trust-400" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No reports generated yet</p>
          <p className="mt-1 text-xs text-text-muted">
            Select a report type and click generate to create your first report
          </p>
        </div>
      </Card>
    </div>
  );
}
