import { cn } from '@/lib/utils';
import { Plus, Clock, Mail, Calendar, MoreHorizontal, Play, Pause, CheckCircle } from 'lucide-react';

const reports = [
  { id: '1', name: 'Weekly Revenue Summary', dashboard: 'Revenue Overview', frequency: 'weekly' as const, recipients: ['team@company.com', 'ceo@company.com'], nextRun: 'Mon, Feb 10 at 9:00 AM', enabled: true, lastRun: '2 hours ago', status: 'delivered' },
  { id: '2', name: 'Daily Active Users', dashboard: 'Customer Analytics', frequency: 'daily' as const, recipients: ['product@company.com'], nextRun: 'Tomorrow at 8:00 AM', enabled: true, lastRun: 'Today at 8:00 AM', status: 'delivered' },
  { id: '3', name: 'Monthly Business Review', dashboard: 'Revenue Overview', frequency: 'monthly' as const, recipients: ['leadership@company.com', 'board@company.com'], nextRun: 'Mar 1 at 9:00 AM', enabled: true, lastRun: 'Feb 1 at 9:00 AM', status: 'delivered' },
  { id: '4', name: 'Product Performance Digest', dashboard: 'Product Performance', frequency: 'weekly' as const, recipients: ['pm@company.com'], nextRun: 'Fri, Feb 14 at 5:00 PM', enabled: false, lastRun: '1 week ago', status: 'paused' },
];

const frequencyLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const frequencyColors = { daily: 'bg-chart-blue/15 text-chart-blue', weekly: 'bg-chart-green/15 text-chart-green', monthly: 'bg-chart-purple/15 text-chart-purple' };

export function ReportsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="data-heading text-lg text-text-primary">Scheduled Reports</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{reports.length} reports configured</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
          <Plus className="h-4 w-4" /> New Report
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', r.enabled ? 'bg-primary-muted' : 'bg-bg-surface-raised')}>
                    <Clock className={cn('h-5 w-5', r.enabled ? 'text-primary-light' : 'text-text-tertiary')} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-text-primary">{r.name}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', frequencyColors[r.frequency])}>
                        {frequencyLabels[r.frequency]}
                      </span>
                      {!r.enabled && (
                        <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">Paused</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-tertiary">Dashboard: {r.dashboard}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary">
                    {r.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border-default pt-4">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-text-tertiary">Recipients</div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-text-tertiary" />
                    <span className="text-xs text-text-secondary">{r.recipients.length} recipient{r.recipients.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-text-tertiary">Next Run</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-text-tertiary" />
                    <span className="text-xs text-text-secondary">{r.nextRun}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-text-tertiary">Last Run</div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-status-success" />
                    <span className="text-xs text-text-secondary">{r.lastRun}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
