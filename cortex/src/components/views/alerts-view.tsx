import { cn, getAlertSeverityColor } from '@/lib/utils';
import { Plus, Bell, BellOff, AlertTriangle, Info, AlertCircle, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import type { AlertSeverity } from '@/types/database';

const alerts = [
  { id: '1', name: 'Revenue Drop Alert', metric: 'Daily Revenue', condition: 'below' as const, threshold: 5000, severity: 'critical' as AlertSeverity, enabled: true, lastTriggered: '3 days ago', currentValue: 6234 },
  { id: '2', name: 'Churn Spike', metric: 'Weekly Churn Rate', condition: 'above' as const, threshold: 3, severity: 'warning' as AlertSeverity, enabled: true, lastTriggered: '1 week ago', currentValue: 2.1 },
  { id: '3', name: 'New User Milestone', metric: 'Monthly New Users', condition: 'above' as const, threshold: 500, severity: 'info' as AlertSeverity, enabled: true, lastTriggered: '2 days ago', currentValue: 534 },
  { id: '4', name: 'Error Rate Threshold', metric: 'API Error Rate', condition: 'above' as const, threshold: 1, severity: 'critical' as AlertSeverity, enabled: true, lastTriggered: 'Never', currentValue: 0.3 },
  { id: '5', name: 'Support Ticket Volume', metric: 'Daily Tickets', condition: 'above' as const, threshold: 50, severity: 'warning' as AlertSeverity, enabled: false, lastTriggered: '2 weeks ago', currentValue: 32 },
];

const recentTriggers = [
  { alert: 'New User Milestone', time: '2 days ago', value: '534 users', severity: 'info' as AlertSeverity },
  { alert: 'Revenue Drop Alert', time: '3 days ago', value: '$4,821', severity: 'critical' as AlertSeverity },
  { alert: 'Churn Spike', time: '1 week ago', value: '3.2%', severity: 'warning' as AlertSeverity },
];

const severityIcons = { info: Info, warning: AlertTriangle, critical: AlertCircle };

export function AlertsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="data-heading text-lg text-text-primary">Alerts</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{alerts.filter((a) => a.enabled).length} active alerts</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
          <Plus className="h-4 w-4" /> New Alert
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Recent Triggers */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Recent Triggers</h3>
          <div className="grid grid-cols-3 gap-3">
            {recentTriggers.map((t, i) => {
              const SevIcon = severityIcons[t.severity];
              return (
                <div key={i} className="rounded-lg border border-border-default bg-bg-surface p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', getAlertSeverityColor(t.severity))}>
                      <SevIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-medium text-text-primary">{t.alert}</span>
                  </div>
                  <div className="text-lg font-semibold text-text-primary">{t.value}</div>
                  <div className="text-[10px] text-text-tertiary">{t.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert Rules */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Alert Rules</h3>
          <div className="space-y-3">
            {alerts.map((a) => {
              const SevIcon = severityIcons[a.severity];
              const isAbove = a.condition === 'above';
              return (
                <div key={a.id} className={cn('rounded-lg border bg-bg-surface p-4', a.enabled ? 'border-border-default' : 'border-border-subtle opacity-60')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', getAlertSeverityColor(a.severity))}>
                        <SevIcon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{a.name}</span>
                          {!a.enabled && <span className="rounded bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">Paused</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
                          <span>{a.metric}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {isAbove ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {a.condition} {a.threshold}{typeof a.threshold === 'number' && a.metric.includes('Rate') ? '%' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-text-primary">
                          {a.currentValue}{a.metric.includes('Rate') ? '%' : ''}
                        </div>
                        <div className="text-[10px] text-text-tertiary">Current</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-secondary">{a.lastTriggered}</div>
                        <div className="text-[10px] text-text-tertiary">Last triggered</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised">
                          {a.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </button>
                        <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
