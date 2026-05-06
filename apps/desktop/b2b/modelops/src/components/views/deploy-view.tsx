import { cn, formatCost, formatNumber } from '@/lib/utils';
import type { DeploymentStatus } from '@/types/database';
import {
  Rocket,
  Plus,
  Globe,
  Activity,
  Clock,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ExternalLink,
  Settings,
  FileText,
} from 'lucide-react';

interface DemoEndpoint {
  id: string;
  name: string;
  url: string;
  environment: string;
  status: DeploymentStatus;
  models: { version: string; trafficPct: number }[];
  requestsPerDay: number;
  latencyP99Ms: number;
  errorRate: number;
}

const demoEndpoints: DemoEndpoint[] = [
  {
    id: 'ep-1',
    name: 'sentiment-api',
    url: 'https://api.modelops.dev/v1/sentiment',
    environment: 'Production',
    status: 'active',
    models: [
      { version: 'v2.3.0', trafficPct: 90 },
      { version: 'v2.4.0-beta', trafficPct: 10 },
    ],
    requestsPerDay: 12345,
    latencyP99Ms: 45,
    errorRate: 0.02,
  },
  {
    id: 'ep-2',
    name: 'image-classify-api',
    url: 'https://staging.modelops.dev/v1/classify',
    environment: 'Staging',
    status: 'active',
    models: [
      { version: 'v1.1.0', trafficPct: 100 },
    ],
    requestsPerDay: 234,
    latencyP99Ms: 120,
    errorRate: 0.0,
  },
];

const statusBadge: Record<DeploymentStatus, { color: string; label: string }> = {
  provisioning: { color: 'bg-info/10 text-info border-info/30', label: 'Provisioning' },
  active: { color: 'bg-success/10 text-success border-success/30', label: 'Active' },
  stopped: { color: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/30', label: 'Stopped' },
  failed: { color: 'bg-error/10 text-error border-error/30', label: 'Failed' },
  scaling: { color: 'bg-warning/10 text-warning border-warning/30', label: 'Scaling' },
};

export function DeployView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Deployments</h2>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-3 w-3" />
          New Endpoint
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Endpoints */}
        {demoEndpoints.map((ep) => {
          const badge = statusBadge[ep.status];
          return (
            <div key={ep.id} className="rounded-lg border border-border-default bg-bg-surface">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-sm font-medium text-text-primary">{ep.name}</span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', badge.color)}>
                      {ep.environment}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-mono text-xs text-text-tertiary">
                    <span>{ep.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-text-tertiary">Requests/day</div>
                    <div className="font-mono text-xs text-text-primary">{formatNumber(ep.requestsPerDay)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-text-tertiary">Latency p99</div>
                    <div className="font-mono text-xs text-text-primary">{ep.latencyP99Ms}ms</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-text-tertiary">Error rate</div>
                    <div className={cn('font-mono text-xs', ep.errorRate > 1 ? 'text-error' : 'text-success')}>{ep.errorRate}%</div>
                  </div>
                </div>
              </div>

              {/* Traffic Split */}
              <div className="border-t border-border-subtle px-4 py-2">
                <div className="mb-1.5 text-[10px] text-text-tertiary">Traffic Split</div>
                <div className="flex h-2 w-full overflow-hidden rounded-full">
                  {ep.models.map((m, i) => (
                    <div
                      key={m.version}
                      className={cn('h-full', i === 0 ? 'bg-primary' : 'bg-chart-2')}
                      style={{ width: `${m.trafficPct}%` }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-4">
                  {ep.models.map((m, i) => (
                    <div key={m.version} className="flex items-center gap-1.5 text-xs">
                      <div className={cn('h-2 w-2 rounded-full', i === 0 ? 'bg-primary' : 'bg-chart-2')} />
                      <span className="font-mono text-text-secondary">{m.version}</span>
                      <span className="text-text-tertiary">({m.trafficPct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-border-subtle px-4 py-2">
                {ep.environment === 'Staging' && (
                  <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
                    <ArrowUpRight className="h-3 w-3" />
                    Promote to Prod
                  </button>
                )}
                <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <Settings className="h-3 w-3" />
                  Manage
                </button>
                <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <FileText className="h-3 w-3" />
                  View Logs
                </button>
                {ep.models.length > 1 && (
                  <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                    <BarChart3 className="h-3 w-3" />
                    Edit Traffic
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* A/B Test Section */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-2">
            <Activity className="h-3 w-3 text-text-tertiary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">A/B Test: sentiment-v2.4.0-beta</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border-subtle p-3">
                <div className="mb-1 text-[10px] font-medium text-text-tertiary">Control (v2.3.0)</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span className="text-text-tertiary">Accuracy</span><span className="text-text-primary">0.943</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">Latency</span><span className="text-text-primary">42ms</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">Requests</span><span className="text-text-primary">11,110</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-1 text-[10px] font-medium text-primary">Variant (v2.4.0-beta)</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span className="text-text-tertiary">Accuracy</span><span className="text-success">0.951</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">Latency</span><span className="text-text-primary">48ms</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">Requests</span><span className="text-text-primary">1,235</span></div>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-bg-surface-hover p-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-warning" />
                <span className="text-text-secondary">Statistical significance: <span className="font-mono text-warning">87%</span> (need 95%)</span>
              </div>
              <div className="mt-1 text-text-tertiary">Estimated time to significance: ~3 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
