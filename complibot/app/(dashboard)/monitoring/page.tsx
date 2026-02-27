import { TrendingUp, Bell, RefreshCw, Shield, Clock } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tableHeaders = ['Control', 'Status', 'Last Check', 'Trend'];

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Continuous Monitoring</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Real-time compliance posture monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock className="h-4 w-4" />
            Last scan: --
          </div>
          <Button>
            <RefreshCw className="h-4 w-4" />
            Run Scan Now
          </Button>
        </div>
      </div>

      {/* Compliance Trend Placeholder */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Compliance Trend</CardTitle>
          <Badge variant="gray">No data</Badge>
        </div>
        <div className="flex h-48 items-center justify-center rounded-lg bg-gray-50">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="mb-2 h-10 w-10 text-text-muted" />
            <p className="text-sm text-text-muted">Compliance trend chart will appear here</p>
          </div>
        </div>
      </Card>

      {/* Active Alerts */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-warn-600" />
          <CardTitle>Active Alerts</CardTitle>
          <Badge variant="gray" className="ml-2">0</Badge>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-shield-50">
            <Bell className="h-6 w-6 text-shield-400" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No active alerts</p>
          <p className="mt-1 text-xs text-text-muted">
            Alerts will appear here when compliance drift is detected
          </p>
        </div>
      </Card>

      {/* Control Status Table */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-trust-600" />
          <CardTitle>Control Status</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-text-muted">
                  No controls monitored yet. Run a scan to populate control status.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
