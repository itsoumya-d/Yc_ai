import { AlertTriangle, CheckCircle, Clock, TrendingDown, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchRecentAlerts } from '@/lib/actions/dashboard';
import { getAlertTypeLabel, formatRelativeTime } from '@/lib/utils';

function getAlertBadgeVariant(type: string): 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'outline' {
  switch (type) {
    case 'low_stock': return 'amber';
    case 'out_of_stock': return 'red';
    case 'expiration': return 'amber';
    case 'reorder': return 'blue';
    default: return 'gray';
  }
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'low_stock':
      return <TrendingDown className="h-4 w-4 text-low-500" />;
    case 'out_of_stock':
      return <Package className="h-4 w-4 text-out-500" />;
    case 'expiration':
      return <Clock className="h-4 w-4 text-low-500" />;
    case 'reorder':
      return <AlertTriangle className="h-4 w-4 text-electric-400" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-text-muted" />;
  }
}

export default async function AlertsPage() {
  const alertsResult = await fetchRecentAlerts();
  const alerts = alertsResult.success ? alertsResult.data : [];

  const lowStockAlerts = alerts.filter((a) => a.alert_type === 'low_stock');
  const outOfStockAlerts = alerts.filter((a) => a.alert_type === 'out_of_stock');
  const expirationAlerts = alerts.filter((a) => a.alert_type === 'expiration');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Alerts</h1>
        <p className="text-sm text-text-secondary mt-1">{alerts.length} active alerts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-low-600/10">
              <TrendingDown className="h-4 w-4 text-low-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary font-mono">{lowStockAlerts.length}</p>
              <p className="text-xs text-text-muted">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-out-600/10">
              <Package className="h-4 w-4 text-out-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary font-mono">{outOfStockAlerts.length}</p>
              <p className="text-xs text-text-muted">Out of Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-low-600/10">
              <Clock className="h-4 w-4 text-low-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary font-mono">{expirationAlerts.length}</p>
              <p className="text-xs text-text-muted">Expiring</p>
            </div>
          </div>
        </Card>
      </div>

      {/* All Alerts */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>All Active Alerts</CardTitle>
        </CardHeader>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-10 w-10 text-stock-500 mx-auto mb-3" />
            <h3 className="text-base font-medium text-text-primary mb-1">All clear</h3>
            <p className="text-sm text-text-secondary">
              No active alerts. Your stock levels look good.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {alert.product?.name ?? 'Unknown Product'}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getAlertBadgeVariant(alert.alert_type)}>
                    {getAlertTypeLabel(alert.alert_type)}
                  </Badge>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
