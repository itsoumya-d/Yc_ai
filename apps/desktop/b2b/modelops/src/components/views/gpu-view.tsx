import { useState } from 'react';
import { cn, formatCost, formatDuration } from '@/lib/utils';
import type { GpuProvider, GpuInstanceStatus } from '@/types/database';
import {
  Cpu,
  Plus,
  Square,
  DollarSign,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Server,
  Zap,
} from 'lucide-react';

interface ActiveInstance {
  id: string;
  provider: GpuProvider;
  gpuModel: string;
  gpuMemory: string;
  status: GpuInstanceStatus;
  uptimeSeconds: number;
  costSoFar: number;
  hourlyRate: number;
  currentRun: string | null;
  isSpot: boolean;
}

interface ScheduledJob {
  id: string;
  name: string;
  gpuType: string;
  scheduledAt: string;
  recurring: boolean;
  status: string;
}

interface GpuAvailability {
  provider: string;
  gpus: { model: string; available: number; hourlyRate: number }[];
}

const activeInstances: ActiveInstance[] = [
  { id: 'gi-1', provider: 'lambda_labs', gpuModel: 'A100 80GB', gpuMemory: '80GB', status: 'running', uptimeSeconds: 8100, costSoFar: 2.48, hourlyRate: 1.10, currentRun: 'exp-8', isSpot: false },
  { id: 'gi-2', provider: 'runpod', gpuModel: 'A10G', gpuMemory: '24GB', status: 'idle', uptimeSeconds: 2700, costSoFar: 0.56, hourlyRate: 0.75, currentRun: null, isSpot: true },
];

const scheduledJobs: ScheduledJob[] = [
  { id: 'sj-1', name: 'lr-sweep-batch', gpuType: 'A100', scheduledAt: 'Today 18:00', recurring: false, status: 'Queued' },
  { id: 'sj-2', name: 'nightly-retrain', gpuType: 'A10G', scheduledAt: 'Daily 02:00', recurring: true, status: 'Recurring' },
  { id: 'sj-3', name: 'weekend-eval', gpuType: 'RTX 4090', scheduledAt: 'Sat 08:00', recurring: true, status: 'Recurring' },
];

const gpuAvailability: GpuAvailability[] = [
  {
    provider: 'Lambda Labs',
    gpus: [
      { model: 'A100 80GB', available: 3, hourlyRate: 1.10 },
      { model: 'H100 80GB', available: 0, hourlyRate: 2.49 },
      { model: 'A10G', available: 8, hourlyRate: 0.75 },
    ],
  },
  {
    provider: 'RunPod',
    gpus: [
      { model: 'A100 80GB', available: 12, hourlyRate: 1.19 },
      { model: 'RTX 4090', available: 25, hourlyRate: 0.44 },
      { model: 'RTX 3090', available: 18, hourlyRate: 0.22 },
      { model: 'H100', available: 5, hourlyRate: 2.39 },
    ],
  },
  {
    provider: 'Modal',
    gpus: [
      { model: 'A100 80GB', available: -1, hourlyRate: 1.10 },
      { model: 'H100', available: -1, hourlyRate: 2.50 },
      { model: 'T4', available: -1, hourlyRate: 0.16 },
    ],
  },
];

const monthlySpend = 234.56;
const monthlyBudget = 500.0;
const budgetPct = Math.round((monthlySpend / monthlyBudget) * 100);

const providerLabel: Record<GpuProvider, string> = {
  lambda_labs: 'Lambda Labs',
  runpod: 'RunPod',
  modal: 'Modal',
  local: 'Local',
};

const statusColors: Record<GpuInstanceStatus, string> = {
  provisioning: 'text-info',
  running: 'text-success',
  idle: 'text-warning',
  stopping: 'text-text-tertiary',
  terminated: 'text-text-tertiary',
  error: 'text-error',
};

export function GpuView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">GPU Manager</h2>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-3 w-3" />
          Launch GPU
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Active Instances */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Server className="h-3 w-3 text-text-tertiary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Active Instances</span>
              <span className="rounded-full bg-bg-surface-hover px-1.5 py-0.5 text-[9px] text-text-tertiary">{activeInstances.length}</span>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Provider</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Uptime</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Rate</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cost</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Run</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeInstances.map((inst) => (
                <tr key={inst.id} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                  <td className="px-3 py-2 text-xs text-text-primary">{providerLabel[inst.provider]}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-text-primary">{inst.gpuModel}</span>
                      {inst.isSpot && (
                        <span className="rounded bg-warning/10 px-1 py-0.5 text-[9px] text-warning">Spot</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('h-2 w-2 rounded-full', inst.status === 'running' ? 'bg-success' : inst.status === 'idle' ? 'bg-warning' : 'bg-text-tertiary')} />
                      <span className={cn('text-xs capitalize', statusColors[inst.status])}>{inst.status}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-text-secondary">{formatDuration(inst.uptimeSeconds)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-text-tertiary">{formatCost(inst.hourlyRate)}/hr</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-warning">{formatCost(inst.costSoFar)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-text-secondary">{inst.currentRun ?? '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button className="flex items-center gap-1 rounded px-2 py-1 text-xs text-error transition-colors hover:bg-error/10" title="Stop">
                      <Square className="h-3 w-3" />
                      Stop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost + Availability Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cost This Month */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-text-tertiary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cost This Month</span>
            </div>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="font-mono text-2xl font-semibold text-text-primary">{formatCost(monthlySpend)}</div>
                <div className="text-xs text-text-tertiary">of {formatCost(monthlyBudget)} budget</div>
              </div>
              <div className={cn('font-mono text-sm font-medium', budgetPct > 80 ? 'text-error' : budgetPct > 60 ? 'text-warning' : 'text-success')}>
                {budgetPct}%
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-bg-surface-hover">
              <div
                className={cn('h-full rounded-full transition-all', budgetPct > 80 ? 'bg-error' : budgetPct > 60 ? 'bg-warning' : 'bg-success')}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            {budgetPct > 80 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-warning">
                <AlertTriangle className="h-3 w-3" />
                Approaching monthly budget limit
              </div>
            )}

            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between text-text-tertiary">
                <span>Lambda Labs</span>
                <span className="font-mono text-text-secondary">$156.30</span>
              </div>
              <div className="flex justify-between text-text-tertiary">
                <span>RunPod</span>
                <span className="font-mono text-text-secondary">$62.40</span>
              </div>
              <div className="flex justify-between text-text-tertiary">
                <span>Modal</span>
                <span className="font-mono text-text-secondary">$15.86</span>
              </div>
            </div>
          </div>

          {/* GPU Availability */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-text-tertiary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU Availability</span>
            </div>
            <div className="space-y-4">
              {gpuAvailability.map((provider) => (
                <div key={provider.provider}>
                  <div className="mb-1.5 text-xs font-medium text-text-secondary">{provider.provider}</div>
                  <div className="space-y-1">
                    {provider.gpus.map((gpu) => (
                      <div key={gpu.model} className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">{gpu.model}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-text-tertiary">{formatCost(gpu.hourlyRate)}/hr</span>
                          {gpu.available === -1 ? (
                            <span className="text-text-tertiary">serverless</span>
                          ) : gpu.available === 0 ? (
                            <span className="text-error">unavailable</span>
                          ) : (
                            <span className="text-success">{gpu.available} avail.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduled Jobs */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
            <Calendar className="h-3 w-3 text-text-tertiary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Scheduled Jobs</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Job</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Scheduled</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody>
              {scheduledJobs.map((job) => (
                <tr key={job.id} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                  <td className="px-3 py-2 text-xs font-medium text-text-primary">{job.name}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{job.gpuType}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{job.scheduledAt}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px]',
                      job.recurring ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                    )}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
