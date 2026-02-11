import { useState } from 'react';
import { cn, formatBytes, formatCost, formatMetric, getStatusColor } from '@/lib/utils';
import type { ModelStatus } from '@/types/database';
import {
  Package,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Rocket,
  Download,
  GitCompare,
  FileText,
  Tag,
  Calendar,
  Cpu,
} from 'lucide-react';

interface DemoModel {
  id: string;
  name: string;
  description: string;
  taskType: string;
  status: ModelStatus;
  tags: string[];
  versions: DemoModelVersion[];
}

interface DemoModelVersion {
  id: string;
  version: string;
  status: ModelStatus;
  format: string;
  accuracy: number;
  f1: number;
  loss: number;
  sizeBytes: number;
  paramCount: string;
  architecture: string;
  createdAt: string;
  runId: string;
}

const demoModels: DemoModel[] = [
  {
    id: 'm1',
    name: 'sentiment-bert',
    description: 'BERT-based sentiment analysis model for product reviews',
    taskType: 'text-classification',
    status: 'production',
    tags: ['nlp', 'sentiment', 'production'],
    versions: [
      { id: 'v1', version: 'v2.3.0', status: 'production', format: 'safetensors', accuracy: 0.943, f1: 0.938, loss: 0.182, sizeBytes: 438_000_000, paramCount: '110M', architecture: 'bert-base-uncased', createdAt: '4h ago', runId: 'exp-7' },
      { id: 'v2', version: 'v2.2.0', status: 'retired', format: 'safetensors', accuracy: 0.938, f1: 0.932, loss: 0.195, sizeBytes: 438_000_000, paramCount: '110M', architecture: 'bert-base-uncased', createdAt: '2d ago', runId: 'exp-6' },
      { id: 'v3', version: 'v2.1.0', status: 'retired', format: 'pytorch', accuracy: 0.921, f1: 0.918, loss: 0.234, sizeBytes: 440_000_000, paramCount: '110M', architecture: 'bert-base-uncased', createdAt: '5d ago', runId: 'exp-4' },
      { id: 'v4', version: 'v2.0.0', status: 'retired', format: 'pytorch', accuracy: 0.892, f1: 0.885, loss: 0.310, sizeBytes: 440_000_000, paramCount: '110M', architecture: 'bert-base-uncased', createdAt: '2w ago', runId: 'exp-2' },
    ],
  },
  {
    id: 'm2',
    name: 'image-resnet',
    description: 'ResNet-50 image classifier for product categorization',
    taskType: 'image-classification',
    status: 'staging',
    tags: ['vision', 'classification'],
    versions: [
      { id: 'v5', version: 'v1.1.0', status: 'staging', format: 'pytorch', accuracy: 0.912, f1: 0.908, loss: 0.267, sizeBytes: 102_000_000, paramCount: '25.6M', architecture: 'resnet50', createdAt: '1d ago', runId: 'exp-8' },
      { id: 'v6', version: 'v1.0.0', status: 'validated', format: 'pytorch', accuracy: 0.895, f1: 0.889, loss: 0.312, sizeBytes: 102_000_000, paramCount: '25.6M', architecture: 'resnet50', createdAt: '1w ago', runId: 'exp-3' },
    ],
  },
  {
    id: 'm3',
    name: 'distilbert-fast',
    description: 'Lightweight DistilBERT model for low-latency inference',
    taskType: 'text-classification',
    status: 'validated',
    tags: ['nlp', 'lightweight', 'fast'],
    versions: [
      { id: 'v7', version: 'v1.0.0', status: 'validated', format: 'onnx', accuracy: 0.915, f1: 0.910, loss: 0.251, sizeBytes: 67_000_000, paramCount: '66M', architecture: 'distilbert-base-uncased', createdAt: '3d ago', runId: 'exp-3' },
    ],
  },
];

const statusBadgeColors: Record<ModelStatus, string> = {
  draft: 'border-text-tertiary/30 text-text-tertiary',
  validated: 'border-info/30 text-info',
  staging: 'border-warning/30 text-warning',
  production: 'border-success/30 text-success',
  retired: 'border-text-tertiary/30 text-text-tertiary',
};

export function ModelsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModel, setExpandedModel] = useState<string | null>(demoModels[0]?.id ?? null);

  const filteredModels = demoModels.filter((m) => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Model Registry</h2>
          <span className="rounded-full bg-bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
            {demoModels.length} models
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-3 w-3" />
          Register Model
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-border-default px-4 py-2">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="w-full rounded-md border border-border-default bg-bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Model Cards */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredModels.map((model) => {
          const isExpanded = expandedModel === model.id;
          const latestVersion = model.versions[0];
          return (
            <div
              key={model.id}
              className="rounded-lg border border-border-default bg-bg-surface overflow-hidden"
            >
              {/* Model Header */}
              <button
                onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{model.name}</span>
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize', statusBadgeColors[model.status])}>
                        {model.status}
                      </span>
                      {model.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-0.5 rounded-full bg-bg-surface-hover px-1.5 py-0.5 text-[9px] text-text-tertiary">
                          <Tag className="h-2 w-2" />{tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-0.5 text-xs text-text-tertiary">{model.description}</p>
                  </div>
                </div>
                {latestVersion && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-text-tertiary">Latest</div>
                      <div className="font-mono text-text-primary">{latestVersion.version}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-text-tertiary">Size</div>
                      <div className="font-mono text-text-primary">{formatBytes(latestVersion.sizeBytes)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-text-tertiary">Accuracy</div>
                      <div className="font-mono text-text-primary">{formatMetric(latestVersion.accuracy, 3)}</div>
                    </div>
                  </div>
                )}
              </button>

              {/* Expanded Versions Table */}
              {isExpanded && (
                <div className="border-t border-border-subtle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="px-4 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Version</th>
                        <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                        <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Format</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Accuracy</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">F1</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Size</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Params</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Created</th>
                        <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.versions.map((v) => (
                        <tr key={v.id} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                          <td className="px-4 py-2 font-mono text-xs text-text-primary">{v.version}</td>
                          <td className="px-3 py-2">
                            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] capitalize', statusBadgeColors[v.status])}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-text-secondary">{v.format}</td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-text-primary">{formatMetric(v.accuracy, 3)}</td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-text-primary">{formatMetric(v.f1, 3)}</td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-text-secondary">{formatBytes(v.sizeBytes)}</td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-text-secondary">{v.paramCount}</td>
                          <td className="px-3 py-2 text-right text-xs text-text-tertiary">{v.createdAt}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1">
                              {v.status !== 'production' && v.status !== 'retired' && (
                                <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-active hover:text-text-secondary" title="Deploy">
                                  <Rocket className="h-3 w-3" />
                                </button>
                              )}
                              <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-active hover:text-text-secondary" title="Download">
                                <Download className="h-3 w-3" />
                              </button>
                              <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-active hover:text-text-secondary" title="View Card">
                                <FileText className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
                      <Rocket className="h-3 w-3" />
                      Deploy {model.versions[0]?.version}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                      <GitCompare className="h-3 w-3" />
                      Compare Versions
                    </button>
                    <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
