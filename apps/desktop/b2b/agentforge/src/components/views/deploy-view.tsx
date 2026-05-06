import { cn, getDeploymentStatusBadge } from '@/lib/utils';
import type { DeploymentStatus, DeploymentEnvironment } from '@/types/database';
import {
  Rocket,
  Plus,
  Globe,
  ExternalLink,
  Clock,
  RotateCcw,
  FileText,
  Settings,
  Square,
  ArrowUpRight,
  Copy,
  Key,
  RefreshCw,
} from 'lucide-react';

interface DemoDeployment {
  id: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  version: string;
  endpointUrl: string;
  deployedBy: string;
  deployedAt: string;
}

const demoDeployments: DemoDeployment[] = [
  { id: 'dep1', environment: 'staging', status: 'active', version: 'v2.3', endpointUrl: 'staging-api.agentforge.app/customer-support', deployedBy: 'jane@company.com', deployedAt: '2h ago' },
  { id: 'dep2', environment: 'production', status: 'active', version: 'v2.1', endpointUrl: 'api.agentforge.app/customer-support', deployedBy: 'john@company.com', deployedAt: '3d ago' },
];

const deploymentHistory = [
  { env: 'stg', version: 'v2.3', status: 'active' as DeploymentStatus, deployedAt: '2h ago', by: 'jane@...' },
  { env: 'prod', version: 'v2.1', status: 'active' as DeploymentStatus, deployedAt: '3d ago', by: 'john@...' },
  { env: 'stg', version: 'v2.2', status: 'rolled_back' as DeploymentStatus, deployedAt: '1d ago', by: 'jane@...' },
  { env: 'prod', version: 'v2.0', status: 'rolled_back' as DeploymentStatus, deployedAt: '7d ago', by: 'john@...' },
];

export function DeployView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Deploy Manager</h2>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
          <Plus className="h-3 w-3" />
          New Deploy
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Environment Cards */}
        <div className="grid grid-cols-2 gap-4">
          {demoDeployments.map((dep) => {
            const badge = getDeploymentStatusBadge(dep.status);
            return (
              <div key={dep.id} className="rounded-lg border border-border-default bg-bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold uppercase text-text-primary">{dep.environment}</span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', badge.color)}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-text-secondary">{dep.version}</span>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs">
                  <Globe className="h-3 w-3 text-text-tertiary" />
                  <span className="font-mono text-text-secondary">{dep.endpointUrl}</span>
                  <button className="text-text-tertiary hover:text-text-secondary">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>

                <div className="mb-4 space-y-1 text-[11px] text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Deployed {dep.deployedAt}</span>
                  </div>
                  <div>By: {dep.deployedBy}</div>
                </div>

                <div className="flex items-center gap-2">
                  {dep.environment === 'staging' && (
                    <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
                      <ArrowUpRight className="h-3 w-3" />
                      Promote to Prod
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                    <RefreshCw className="h-3 w-3" />
                    Redeploy
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                    <RotateCcw className="h-3 w-3" />
                    Rollback
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                    <FileText className="h-3 w-3" />
                    Logs
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deployment History */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-2">
            <Clock className="h-3 w-3 text-text-tertiary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Deployment History</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Env</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Version</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Deployed</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">By</th>
                <th className="px-4 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deploymentHistory.map((h, i) => {
                const badge = getDeploymentStatusBadge(h.status);
                return (
                  <tr key={i} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                    <td className="px-4 py-2 font-mono text-xs text-text-primary">{h.env}</td>
                    <td className="px-4 py-2 font-mono text-xs text-text-primary">{h.version}</td>
                    <td className="px-4 py-2">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', badge.color)}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-text-tertiary">{h.deployedAt}</td>
                    <td className="px-4 py-2 text-xs text-text-tertiary">{h.by}</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-xs text-text-link hover:underline">Logs</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Endpoint Configuration */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-4">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Endpoint Configuration</div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] text-text-secondary">Base Path</label>
              <input defaultValue="/api/agent/customer-support" className="h-8 w-full rounded-md border border-border-default bg-bg-surface-raised px-2.5 font-mono text-xs text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-text-secondary">Authentication</label>
                <div className="flex h-8 items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-2.5 text-xs text-text-primary">
                  <span>API Key</span>
                  <Key className="h-3 w-3 text-text-tertiary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-text-secondary">Rate Limit</label>
                <div className="flex items-center gap-1">
                  <input defaultValue={100} type="number" className="h-8 w-full rounded-md border border-border-default bg-bg-surface-raised px-2.5 font-mono text-xs text-text-primary focus:border-primary focus:outline-none" />
                  <span className="text-[11px] text-text-tertiary">req/min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
