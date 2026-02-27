import {
  Box,
  Package,
  AlertTriangle,
  ScanBarcode,
  ArrowRight,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, fetchRecentScans, fetchRecentAlerts } from '@/lib/actions/dashboard';
import { getAlertTypeColor, getAlertTypeLabel, getScanTypeLabel, formatRelativeTime } from '@/lib/utils';

export default async function DashboardPage() {
  const [statsResult, scansResult, alertsResult] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentScans(),
    fetchRecentAlerts(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const scans = scansResult.success ? scansResult.data : [];
  const alerts = alertsResult.success ? alertsResult.data : [];

  const statCards = [
    { label: 'Total Products', value: stats?.total_products ?? 0, icon: <Package className="h-5 w-5 text-electric-400" />, href: '/inventory' },
    { label: 'Low Stock', value: stats?.low_stock_count ?? 0, icon: <TrendingDown className="h-5 w-5 text-low-500" />, href: '/alerts' },
    { label: 'Active Alerts', value: stats?.active_alerts ?? 0, icon: <AlertTriangle className="h-5 w-5 text-out-500" />, href: '/alerts' },
    { label: 'Scans Today', value: stats?.scans_today ?? 0, icon: <ScanBarcode className="h-5 w-5 text-stock-500" />, href: '/scan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Your inventory overview at a glance</p>
        </div>
        <Link
          href="/scan"
          className="hidden sm:inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors"
        >
          <ScanBarcode className="h-4 w-4" />
          New Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1 font-mono">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Scans */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <Link href="/scan" className="text-sm text-electric-400 hover:text-electric-300 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <ScanBarcode className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No scans yet</p>
            <Link href="/scan" className="text-sm text-electric-400 hover:text-electric-300 mt-1 inline-block">
              Start your first scan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {getScanTypeLabel(scan.scan_type)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {scan.items_count} items scanned
                    {scan.discrepancies_count > 0 && (
                      <span className="ml-2 text-low-500">
                        {scan.discrepancies_count} discrepancies
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-text-muted">{formatRelativeTime(scan.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active Alerts */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <Link href="/alerts" className="text-sm text-electric-400 hover:text-electric-300 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No active alerts</p>
            <p className="text-xs text-text-muted mt-1">All stock levels look good</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${getAlertTypeColor(alert.alert_type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {alert.product?.name ?? 'Unknown Product'}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{alert.message}</p>
                  </div>
                </div>
                <Badge variant={alert.alert_type === 'out_of_stock' ? 'red' : 'amber'}>
                  {getAlertTypeLabel(alert.alert_type)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Stock Level Chart Placeholder */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center py-12 text-text-muted">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-2" />
            <p className="text-sm">Stock level analytics will appear here</p>
            <p className="text-xs mt-1">Start scanning inventory to see trends</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
