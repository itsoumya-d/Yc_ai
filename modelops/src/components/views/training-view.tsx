import { useState } from 'react';
import { cn, formatCost, formatDuration, formatMetric } from '@/lib/utils';
import {
  Activity,
  Pause,
  Square,
  Cpu,
  Thermometer,
  Zap,
  MemoryStick,
  Timer,
  DollarSign,
  ArrowDown,
  Search,
  ChevronDown,
} from 'lucide-react';

interface ActiveRun {
  id: string;
  name: string;
  experiment: string;
  gpuType: string;
  gpuProvider: string;
  gpuPct: number;
  memPct: number;
  tempC: number;
  powerW: number;
  maxPowerW: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  trainLoss: number;
  valLoss: number;
  accuracy: number;
  f1: number;
  precision: number;
  recall: number;
  samplesPerSec: number;
  batchesPerSec: number;
  etaSeconds: number;
  costSoFar: number;
  startedAgo: string;
}

const activeRuns: ActiveRun[] = [
  {
    id: 'run-1',
    name: 'resnet50-finetune',
    experiment: 'exp-8',
    gpuType: 'A100 80GB',
    gpuProvider: 'Lambda Labs',
    gpuPct: 94,
    memPct: 72,
    tempC: 67,
    powerW: 285,
    maxPowerW: 400,
    currentEpoch: 15,
    totalEpochs: 20,
    currentStep: 14580,
    totalSteps: 19440,
    trainLoss: 0.1823,
    valLoss: 0.1952,
    accuracy: 0.9432,
    f1: 0.938,
    precision: 0.941,
    recall: 0.935,
    samplesPerSec: 1245,
    batchesPerSec: 9.8,
    etaSeconds: 1380,
    costSoFar: 1.45,
    startedAgo: '1h 23m',
  },
  {
    id: 'run-2',
    name: 'distilbert-sweep-4',
    experiment: 'exp-9',
    gpuType: 'A10G',
    gpuProvider: 'RunPod',
    gpuPct: 87,
    memPct: 58,
    tempC: 62,
    powerW: 145,
    maxPowerW: 250,
    currentEpoch: 8,
    totalEpochs: 15,
    currentStep: 4200,
    totalSteps: 7875,
    trainLoss: 0.2345,
    valLoss: 0.2580,
    accuracy: 0.9123,
    f1: 0.907,
    precision: 0.915,
    recall: 0.899,
    samplesPerSec: 890,
    batchesPerSec: 13.9,
    etaSeconds: 2640,
    costSoFar: 0.56,
    startedAgo: '45m',
  },
];

const logLines = [
  { time: '14:23:01', level: 'INFO', msg: 'Epoch 15/20, Step 14580 / 19440' },
  { time: '14:23:01', level: 'INFO', msg: 'Train Loss: 0.1823, Acc: 0.9432' },
  { time: '14:22:55', level: 'INFO', msg: 'Val Loss: 0.1952, Acc: 0.9381' },
  { time: '14:22:50', level: 'INFO', msg: 'Saving checkpoint epoch_15.pt (438 MB)' },
  { time: '14:22:48', level: 'INFO', msg: 'Early stopping patience: 3/5 epochs without improvement' },
  { time: '14:20:12', level: 'INFO', msg: 'Epoch 14/20, Step 13608 / 19440' },
  { time: '14:20:12', level: 'INFO', msg: 'Train Loss: 0.1901, Acc: 0.9398' },
  { time: '14:20:08', level: 'INFO', msg: 'Val Loss: 0.2015, Acc: 0.9345' },
  { time: '14:17:30', level: 'INFO', msg: 'Epoch 13/20, Step 12636 / 19440' },
  { time: '14:17:30', level: 'WARN', msg: 'GPU memory usage at 72% — approaching capacity' },
  { time: '14:14:55', level: 'INFO', msg: 'Epoch 12/20, Step 11664 / 19440' },
  { time: '14:14:55', level: 'INFO', msg: 'Train Loss: 0.2102, Acc: 0.9310' },
];

function GpuBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-text-tertiary">{label}</span>
        <span className="font-mono text-text-secondary">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-surface-hover">
        <div
          className="h-full rounded-full transition-all duration-slow"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function TrainingView() {
  const [selectedRun, setSelectedRun] = useState(activeRuns[0]?.id ?? '');
  const [autoScroll, setAutoScroll] = useState(true);

  const run = activeRuns.find((r) => r.id === selectedRun) ?? activeRuns[0];
  if (!run) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-sm text-text-secondary">No active training runs</p>
          <p className="mt-1 text-xs text-text-tertiary">Start a training run from the Pipeline Editor</p>
        </div>
      </div>
    );
  }

  const epochPct = Math.round((run.currentEpoch / run.totalEpochs) * 100);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-info" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Training Monitor</h2>
          <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
            <span>Active <span className="font-mono text-info">{activeRuns.length}</span></span>
            <span>Queued <span className="font-mono text-warning">1</span></span>
            <span>Completed Today <span className="font-mono text-success">5</span></span>
          </div>
        </div>
      </div>

      {/* Run Selector */}
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-2">
        {activeRuns.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRun(r.id)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors',
              selectedRun === r.id
                ? 'border-primary bg-primary/10 text-text-primary'
                : 'border-border-default bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
            )}
          >
            <div className="h-2 w-2 rounded-full bg-info animate-node-pulse" />
            <span className="font-medium">{r.name}</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-tertiary">{r.gpuType}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-text-tertiary">ETA {formatDuration(r.etaSeconds)}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-warning">{formatCost(r.costSoFar)}</span>
            <div className="ml-2 flex items-center gap-1">
              <button className="rounded p-0.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary" title="Pause">
                <Pause className="h-3 w-3" />
              </button>
              <button className="rounded p-0.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-error" title="Stop">
                <Square className="h-3 w-3" />
              </button>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Epoch Progress */}
        <div className="mb-4 rounded-lg border border-border-default bg-bg-surface p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Epoch {run.currentEpoch} / {run.totalEpochs}</span>
            <span className="font-mono text-text-primary">{epochPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg-surface-hover">
            <div
              className="h-full rounded-full bg-primary transition-all duration-slow"
              style={{ width: `${epochPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-text-tertiary">
            <span>Step {run.currentStep.toLocaleString()} / {run.totalSteps.toLocaleString()}</span>
            <span>Started {run.startedAgo} ago</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          {/* Loss */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <ArrowDown className="h-3 w-3 text-chart-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Loss</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Train</span>
                <span className="font-mono text-sm text-text-primary">{formatMetric(run.trainLoss, 4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Val</span>
                <span className="font-mono text-sm text-text-primary">{formatMetric(run.valLoss, 4)}</span>
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-chart-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Metrics</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Accuracy</span>
                <span className="font-mono text-sm text-text-primary">{formatMetric(run.accuracy, 4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">F1 Score</span>
                <span className="font-mono text-sm text-text-primary">{formatMetric(run.f1, 3)}</span>
              </div>
            </div>
          </div>

          {/* Throughput */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-chart-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Throughput</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Samples/s</span>
                <span className="font-mono text-sm text-text-primary">{run.samplesPerSec.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Batches/s</span>
                <span className="font-mono text-sm text-text-primary">{run.batchesPerSec}</span>
              </div>
            </div>
          </div>

          {/* Cost & ETA */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-chart-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cost & ETA</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Cost so far</span>
                <span className="font-mono text-sm text-warning">{formatCost(run.costSoFar)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">ETA</span>
                <span className="font-mono text-sm text-text-primary">{formatDuration(run.etaSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPU Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-text-tertiary" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU Utilization</span>
              </div>
              <span className="text-[10px] text-text-tertiary">{run.gpuProvider} · {run.gpuType}</span>
            </div>
            <div className="space-y-3">
              <GpuBar label="GPU" value={run.gpuPct} max={100} unit="%" color={run.gpuPct > 85 ? '#EF4444' : run.gpuPct > 60 ? '#F59E0B' : '#22C55E'} />
              <GpuBar label="Memory" value={run.memPct} max={100} unit="%" color={run.memPct > 85 ? '#EF4444' : run.memPct > 60 ? '#F59E0B' : '#22C55E'} />
            </div>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-surface p-3">
            <div className="mb-3 flex items-center gap-1.5">
              <Thermometer className="h-3 w-3 text-text-tertiary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Hardware</span>
            </div>
            <div className="space-y-3">
              <GpuBar label="Temperature" value={run.tempC} max={90} unit="°C" color={run.tempC > 80 ? '#EF4444' : run.tempC > 65 ? '#F59E0B' : '#22C55E'} />
              <GpuBar label="Power" value={run.powerW} max={run.maxPowerW} unit="W" color="#3B82F6" />
            </div>
          </div>
        </div>

        {/* Training Log */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Training Log</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-40 rounded border border-border-default bg-bg-root py-1 pl-7 pr-2 text-[10px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] transition-colors',
                  autoScroll ? 'bg-primary/20 text-primary' : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                Auto-scroll
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-auto p-2 font-mono text-[11px] leading-5">
            {logLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-text-tertiary">[{line.time}]</span>
                <span className={cn(
                  line.level === 'WARN' ? 'text-warning' : line.level === 'ERROR' ? 'text-error' : 'text-text-secondary'
                )}>
                  {line.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
