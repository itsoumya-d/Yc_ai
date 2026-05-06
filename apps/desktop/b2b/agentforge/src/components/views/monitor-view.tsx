import { cn, formatNumber, formatLatency, formatCost, formatTokens } from '@/lib/utils';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

interface MetricCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  positive: boolean;
}

const metrics: MetricCard[] = [
  { label: 'Requests Today', value: '2,341', trend: '+12%', trendUp: true, positive: true },
  { label: 'Avg Latency', value: '1.2s', trend: '-0.1s', trendUp: false, positive: true },
  { label: 'Error Rate', value: '0.8%', trend: '+0.2%', trendUp: true, positive: false },
  { label: 'Total Tokens', value: '1.2M', trend: '+15%', trendUp: true, positive: true },
  { label: 'Total Cost', value: '$12.45', trend: '+18%', trendUp: true, positive: false },
];

const latencyPercentiles = [
  { label: 'P50', value: '0.8s', width: 32 },
  { label: 'P75', value: '1.1s', width: 44 },
  { label: 'P90', value: '1.4s', width: 56 },
  { label: 'P95', value: '2.1s', width: 84 },
  { label: 'P99', value: '3.8s', width: 100 },
];

const costBreakdown = [
  { label: 'Input tokens', cost: '$4.20', pct: 34 },
  { label: 'Output tokens', cost: '$7.80', pct: 63 },
  { label: 'Tool calls', cost: '$0.45', pct: 3 },
];

const modelCosts = [
  { model: 'GPT-4o', cost: '$10.20', pct: 82 },
  { model: 'GPT-4o-mini', cost: '$2.25', pct: 18 },
];

const topErrors = [
  { type: 'TimeoutError', count: 12, message: 'LLM node exceeded 30s' },
  { type: 'RateLimitError', count: 5, message: 'OpenAI 429 Too Many Requests' },
  { type: 'ValidationError', count: 2, message: 'Output schema mismatch' },
];

const recentRequests = [
  { time: '2:34pm', input: 'Help with my order...', output: 'Your order has been...', latency: '1.1s', cost: '$0.005', status: 'success' as const },
  { time: '2:33pm', input: 'I want to cancel...', output: "I'll help you with...", latency: '0.9s', cost: '$0.004', status: 'success' as const },
  { time: '2:31pm', input: 'Refund request for...', output: 'Let me look into...', latency: '3.2s', cost: '$0.008', status: 'error' as const },
  { time: '2:28pm', input: 'What is the status...', output: 'Your order ORD-456...', latency: '0.7s', cost: '$0.003', status: 'success' as const },
  { time: '2:25pm', input: 'I need to change...', output: "I've updated your...", latency: '1.4s', cost: '$0.006', status: 'success' as const },
];

export function MonitorView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Agent Monitor</h2>
          <span className="rounded bg-bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
            Customer Support Bot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border-default text-[11px]">
            <button className="rounded-l-md bg-bg-surface-hover px-2 py-1 text-text-primary">24h</button>
            <button className="px-2 py-1 text-text-tertiary hover:text-text-secondary">7d</button>
            <button className="rounded-r-md px-2 py-1 text-text-tertiary hover:text-text-secondary">30d</button>
          </div>
          <button className="rounded-md border border-border-default p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-5 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border-default bg-bg-surface p-3">
              <div className="text-[11px] text-text-secondary">{m.label}</div>
              <div className="mt-1 font-heading text-xl font-semibold text-text-primary">{m.value}</div>
              <div className={cn('mt-1 flex items-center gap-1 text-[11px]', m.positive ? 'text-success' : 'text-error')}>
                {m.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{m.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Latency Distribution */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 text-xs font-medium text-text-primary">Latency Distribution</div>
            <div className="space-y-2">
              {latencyPercentiles.map((p) => (
                <div key={p.label} className="flex items-center gap-3">
                  <span className="w-8 font-mono text-[11px] text-text-tertiary">{p.label}</span>
                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded bg-bg-surface-hover">
                      <div
                        className="flex h-full items-center rounded bg-primary/20 px-2"
                        style={{ width: `${p.width}%` }}
                      >
                        <span className="font-mono text-[10px] text-text-primary">{p.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 text-xs font-medium text-text-primary">Cost Breakdown</div>
            <div className="space-y-2">
              {costBreakdown.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-primary">{c.cost}</span>
                    <span className="text-text-tertiary">({c.pct}%)</span>
                  </div>
                </div>
              ))}
              <div className="my-2 border-t border-border-subtle" />
              <div className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">By Model</div>
              {modelCosts.map((mc) => (
                <div key={mc.model} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-text-secondary">{mc.model}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-primary">{mc.cost}</span>
                    <span className="text-text-tertiary">({mc.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Top Errors */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 text-xs font-medium text-text-primary">Top Errors</div>
            <div className="space-y-3">
              {topErrors.map((e) => (
                <div key={e.type}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-error">{e.type}</span>
                    <span className="rounded bg-error/10 px-1.5 py-0.5 font-mono text-[10px] text-error">{e.count}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-tertiary">{e.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Volume Placeholder */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 text-xs font-medium text-text-primary">Request Volume (24h)</div>
            <div className="flex h-32 items-end gap-1">
              {[30, 45, 60, 80, 70, 55, 40, 65, 90, 100, 85, 75, 60, 50, 45, 55, 70, 85, 95, 80, 65, 50, 35, 40].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/30" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-text-tertiary">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Recent Requests</span>
            <button className="text-xs text-text-link hover:underline">View All</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Time</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Input</th>
                <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Output</th>
                <th className="px-4 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Latency</th>
                <th className="px-4 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cost</th>
                <th className="px-4 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((r, i) => (
                <tr key={i} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                  <td className="px-4 py-2 font-mono text-xs text-text-tertiary">{r.time}</td>
                  <td className="max-w-[200px] truncate px-4 py-2 text-xs text-text-primary">{r.input}</td>
                  <td className="max-w-[200px] truncate px-4 py-2 text-xs text-text-secondary">{r.output}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-text-primary">{r.latency}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-text-primary">{r.cost}</td>
                  <td className="px-4 py-2 text-right">
                    {r.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-success">
                        <Check className="h-3 w-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-error">
                        <X className="h-3 w-3" /> Error
                      </span>
                    )}
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
