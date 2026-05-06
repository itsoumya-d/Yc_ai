import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn, formatCost, formatMetric, getStatusColor } from '@/lib/utils';
import type { ExperimentStatus } from '@/types/database';
import {
  FlaskConical,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  ChevronDown,
  ChevronRight,
  GitCompare,
  Trash2,
  FileDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Cpu,
} from 'lucide-react';

interface DemoExperiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  accuracy: number | null;
  loss: number | null;
  f1: number | null;
  gpuType: string;
  cost: number;
  epochs: string;
  lr: string;
  batchSize: string;
  duration: string;
  createdAt: string;
  tags: string[];
}

const demoExperiments: DemoExperiment[] = [
  { id: 'exp-8', name: 'resnet50-finetune', status: 'running', accuracy: 0.941, loss: 0.185, f1: 0.937, gpuType: 'A100 80G', cost: 1.45, epochs: '15/20', lr: '1e-4', batchSize: '32', duration: '1h 23m', createdAt: '2 min ago', tags: ['architecture-search'] },
  { id: 'exp-7', name: 'bert-sentiment-v3', status: 'completed', accuracy: 0.943, loss: 0.182, f1: 0.938, gpuType: 'A100 80G', cost: 4.2, epochs: '20/20', lr: '1e-4', batchSize: '32', duration: '3h 15m', createdAt: '4h ago', tags: ['final-candidates'] },
  { id: 'exp-6', name: 'bert-sentiment-v2', status: 'completed', accuracy: 0.938, loss: 0.195, f1: 0.932, gpuType: 'A100 80G', cost: 3.8, epochs: '20/20', lr: '2e-4', batchSize: '64', duration: '2h 50m', createdAt: '8h ago', tags: ['lr-sweep'] },
  { id: 'exp-5', name: 'bert-sentiment-lr3', status: 'failed', accuracy: null, loss: null, f1: null, gpuType: 'A10G', cost: 0.5, epochs: '3/20', lr: '1e-3', batchSize: '32', duration: '18m', createdAt: '12h ago', tags: ['lr-sweep'] },
  { id: 'exp-4', name: 'bert-base-uncased', status: 'completed', accuracy: 0.921, loss: 0.234, f1: 0.918, gpuType: 'RTX 4090', cost: 1.2, epochs: '20/20', lr: '5e-5', batchSize: '16', duration: '1h 40m', createdAt: '1d ago', tags: ['baseline'] },
  { id: 'exp-3', name: 'distilbert-fast', status: 'completed', accuracy: 0.915, loss: 0.251, f1: 0.91, gpuType: 'A10G', cost: 0.9, epochs: '15/15', lr: '3e-5', batchSize: '32', duration: '45m', createdAt: '2d ago', tags: ['architecture-search'] },
  { id: 'exp-2', name: 'roberta-large', status: 'completed', accuracy: 0.892, loss: 0.31, f1: 0.885, gpuType: 'A10G', cost: 0.8, epochs: '10/10', lr: '2e-5', batchSize: '8', duration: '55m', createdAt: '3d ago', tags: [] },
  { id: 'exp-1', name: 'logistic-baseline', status: 'completed', accuracy: 0.845, loss: 0.421, f1: 0.839, gpuType: 'CPU', cost: 0.0, epochs: '100/100', lr: '0.01', batchSize: '256', duration: '2m', createdAt: '5d ago', tags: ['baseline'] },
];

const StatusIcon = ({ status }: { status: ExperimentStatus }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case 'running':
      return <Loader2 className="h-3.5 w-3.5 text-info animate-spin" />;
    case 'failed':
      return <XCircle className="h-3.5 w-3.5 text-error" />;
    case 'queued':
      return <Clock className="h-3.5 w-3.5 text-warning" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-text-tertiary" />;
  }
};

export function ExperimentsView() {
  const { selectedExperiments, toggleExperimentSelection, clearExperimentSelection } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredExperiments = demoExperiments
    .filter((exp) => {
      if (searchQuery && !exp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== 'all' && exp.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'accuracy':
          return (b.accuracy ?? -1) - (a.accuracy ?? -1);
        case 'loss':
          return (a.loss ?? 999) - (b.loss ?? 999);
        case 'cost':
          return a.cost - b.cost;
        default:
          return 0;
      }
    });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Experiments</h2>
          <span className="rounded-full bg-bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
            {demoExperiments.length}
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-3 w-3" />
          New Experiment
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments..."
            className="w-full rounded-md border border-border-default bg-bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-text-tertiary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border-default bg-bg-surface px-2 py-1.5 text-xs text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-border-default bg-bg-surface px-2 py-1.5 text-xs text-text-secondary focus:border-primary focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="accuracy">Best Accuracy</option>
            <option value="loss">Lowest Loss</option>
            <option value="cost">Cheapest</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {selectedExperiments.length > 0 && (
            <>
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
                <GitCompare className="h-3 w-3" />
                Compare ({selectedExperiments.length})
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                <Trash2 className="h-3 w-3" />
              </button>
              <button
                onClick={clearExperimentSelection}
                className="rounded-md px-2 py-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
              >
                Clear
              </button>
            </>
          )}
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
            <FileDown className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default text-left">
              <th className="w-8 px-4 py-2" />
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Name</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">Accuracy</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">Loss</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">F1</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">Cost</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">Duration</th>
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary text-right">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredExperiments.map((exp) => (
              <>
                <tr
                  key={exp.id}
                  onClick={() => setExpandedRow(expandedRow === exp.id ? null : exp.id)}
                  className={cn(
                    'cursor-pointer border-b border-border-subtle transition-colors hover:bg-bg-surface-hover',
                    selectedExperiments.includes(exp.id) && 'bg-primary/5',
                    expandedRow === exp.id && 'bg-bg-surface'
                  )}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedExperiments.includes(exp.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleExperimentSelection(exp.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 rounded border-border-default"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {expandedRow === exp.id ? (
                        <ChevronDown className="h-3 w-3 text-text-tertiary" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-text-tertiary" />
                      )}
                      <span className="text-xs font-medium text-text-primary">{exp.name}</span>
                      {exp.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-bg-surface-hover px-1.5 py-0.5 text-[9px] text-text-tertiary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={exp.status} />
                      <span className={cn('text-xs capitalize', getStatusColor(exp.status).split(' ')[0])}>
                        {exp.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-primary">
                    {exp.accuracy != null ? formatMetric(exp.accuracy, 3) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-primary">
                    {exp.loss != null ? formatMetric(exp.loss, 3) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-primary">
                    {exp.f1 != null ? formatMetric(exp.f1, 3) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-text-tertiary" />
                      <span className="text-xs text-text-secondary">{exp.gpuType}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-primary">
                    {formatCost(exp.cost)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-text-secondary">
                    {exp.duration}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-text-tertiary">
                    {exp.createdAt}
                  </td>
                </tr>
                {expandedRow === exp.id && (
                  <tr key={`${exp.id}-detail`} className="border-b border-border-subtle bg-bg-surface">
                    <td colSpan={10} className="px-8 py-4">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Hyperparameters</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <div className="flex justify-between"><span className="text-text-tertiary">learning_rate</span><span className="text-text-primary">{exp.lr}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">batch_size</span><span className="text-text-primary">{exp.batchSize}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">epochs</span><span className="text-text-primary">{exp.epochs}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">optimizer</span><span className="text-text-primary">AdamW</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">warmup_steps</span><span className="text-text-primary">500</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Final Metrics</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <div className="flex justify-between"><span className="text-text-tertiary">accuracy</span><span className="text-text-primary">{exp.accuracy ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">loss</span><span className="text-text-primary">{exp.loss ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">f1_score</span><span className="text-text-primary">{exp.f1 ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">precision</span><span className="text-text-primary">{exp.accuracy ? (exp.accuracy - 0.002).toFixed(3) : '—'}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">recall</span><span className="text-text-primary">{exp.accuracy ? (exp.accuracy - 0.008).toFixed(3) : '—'}</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Environment</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <div className="flex justify-between"><span className="text-text-tertiary">gpu</span><span className="text-text-primary">{exp.gpuType}</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">python</span><span className="text-text-primary">3.11.7</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">pytorch</span><span className="text-text-primary">2.3.0</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">cuda</span><span className="text-text-primary">12.4</span></div>
                            <div className="flex justify-between"><span className="text-text-tertiary">cost</span><span className="text-text-primary">{formatCost(exp.cost)}</span></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center gap-6 border-t border-border-default px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-[10px] text-text-tertiary">Completed: {demoExperiments.filter(e => e.status === 'completed').length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-info animate-node-pulse" />
          <span className="text-[10px] text-text-tertiary">Running: {demoExperiments.filter(e => e.status === 'running').length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-error" />
          <span className="text-[10px] text-text-tertiary">Failed: {demoExperiments.filter(e => e.status === 'failed').length}</span>
        </div>
        <div className="ml-auto text-[10px] text-text-tertiary">
          Total GPU Cost: <span className="font-mono text-text-secondary">{formatCost(demoExperiments.reduce((s, e) => s + e.cost, 0))}</span>
        </div>
      </div>
    </div>
  );
}
