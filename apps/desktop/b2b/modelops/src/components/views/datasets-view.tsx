import { useState } from 'react';
import { cn, formatBytes, formatNumber } from '@/lib/utils';
import {
  Database,
  Plus,
  ChevronDown,
  ChevronRight,
  FileDown,
  GitCompare,
  Eye,
  BarChart3,
  Table2,
  ArrowRight,
} from 'lucide-react';

interface DemoDataset {
  id: string;
  name: string;
  versions: DatasetVersion[];
}

interface DatasetVersion {
  id: string;
  tag: string;
  rows: number;
  cols: number;
  sizeBytes: number;
  createdAt: string;
  usedInExperiments: string[];
  schema: DatasetColumn[];
}

interface DatasetColumn {
  name: string;
  type: string;
  nullPct: number;
  unique: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
}

const demoDatasets: DemoDataset[] = [
  {
    id: 'd1',
    name: 'train',
    versions: [
      {
        id: 'dv1', tag: 'v3 (latest)', rows: 50000, cols: 12, sizeBytes: 2_300_000_000, createdAt: '2d ago',
        usedInExperiments: ['exp-7', 'exp-8'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 50000 },
          { name: 'text', type: 'string', nullPct: 0.2, unique: 49800 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
          { name: 'sentiment_score', type: 'float64', nullPct: 1.5, unique: 48200, mean: 0.62, std: 0.28, min: 0.0, max: 1.0 },
          { name: 'word_count', type: 'int32', nullPct: 0, unique: 340, mean: 45.2, std: 23.1, min: 3, max: 512 },
          { name: 'source', type: 'string', nullPct: 0, unique: 8 },
          { name: 'created_date', type: 'datetime', nullPct: 0, unique: 365 },
          { name: 'category', type: 'string', nullPct: 0.5, unique: 24 },
          { name: 'rating', type: 'float32', nullPct: 2.1, unique: 9, mean: 3.8, std: 1.2, min: 1.0, max: 5.0 },
          { name: 'verified', type: 'bool', nullPct: 0, unique: 2 },
          { name: 'helpful_votes', type: 'int32', nullPct: 0, unique: 120, mean: 4.5, std: 8.2, min: 0, max: 234 },
          { name: 'embedding', type: 'float32[768]', nullPct: 0, unique: 50000 },
        ],
      },
      {
        id: 'dv2', tag: 'v2', rows: 40000, cols: 10, sizeBytes: 1_800_000_000, createdAt: '1w ago',
        usedInExperiments: ['exp-4', 'exp-5', 'exp-6'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 40000 },
          { name: 'text', type: 'string', nullPct: 0.3, unique: 39700 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
          { name: 'sentiment_score', type: 'float64', nullPct: 2.0, unique: 38500 },
        ],
      },
      {
        id: 'dv3', tag: 'v1', rows: 25000, cols: 8, sizeBytes: 900_000_000, createdAt: '3w ago',
        usedInExperiments: ['exp-1', 'exp-2', 'exp-3'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 25000 },
          { name: 'text', type: 'string', nullPct: 0.5, unique: 24800 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
        ],
      },
    ],
  },
  {
    id: 'd2',
    name: 'validation',
    versions: [
      {
        id: 'dv4', tag: 'v1', rows: 5000, cols: 12, sizeBytes: 230_000_000, createdAt: '2d ago',
        usedInExperiments: ['exp-7', 'exp-8'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 5000 },
          { name: 'text', type: 'string', nullPct: 0, unique: 5000 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
        ],
      },
    ],
  },
  {
    id: 'd3',
    name: 'test',
    versions: [
      {
        id: 'dv5', tag: 'v1', rows: 10000, cols: 12, sizeBytes: 460_000_000, createdAt: '2d ago',
        usedInExperiments: ['exp-7'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 10000 },
          { name: 'text', type: 'string', nullPct: 0, unique: 10000 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
        ],
      },
    ],
  },
  {
    id: 'd4',
    name: 'augmented',
    versions: [
      {
        id: 'dv6', tag: 'v1', rows: 100000, cols: 12, sizeBytes: 4_500_000_000, createdAt: '1d ago',
        usedInExperiments: ['exp-8'],
        schema: [
          { name: 'id', type: 'int64', nullPct: 0, unique: 100000 },
          { name: 'text', type: 'string', nullPct: 0, unique: 98000 },
          { name: 'label', type: 'int32', nullPct: 0, unique: 5 },
        ],
      },
    ],
  },
];

export function DatasetsView() {
  const [selectedDataset, setSelectedDataset] = useState<string>(demoDatasets[0]?.id ?? '');
  const [selectedVersion, setSelectedVersion] = useState<string>(demoDatasets[0]?.versions[0]?.id ?? '');

  const dataset = demoDatasets.find((d) => d.id === selectedDataset);
  const version = dataset?.versions.find((v) => v.id === selectedVersion);

  return (
    <div className="flex h-full">
      {/* Dataset Tree (Left Panel) */}
      <div className="w-52 overflow-auto border-r border-border-default bg-bg-surface p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Datasets
          </h3>
          <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary" title="Add Dataset">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {demoDatasets.map((ds) => (
            <div key={ds.id}>
              <button
                onClick={() => {
                  setSelectedDataset(ds.id);
                  setSelectedVersion(ds.versions[0]?.id ?? '');
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                  selectedDataset === ds.id
                    ? 'bg-bg-surface-active text-text-primary'
                    : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                )}
              >
                <Database className="h-3.5 w-3.5 text-node-data" />
                <span className="font-medium">{ds.name}</span>
                <span className="ml-auto text-[10px] text-text-tertiary">{ds.versions.length}v</span>
              </button>

              {selectedDataset === ds.id && ds.versions.length > 1 && (
                <div className="ml-5 mt-0.5 space-y-0.5">
                  {ds.versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersion(v.id)}
                      className={cn(
                        'flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] transition-colors',
                        selectedVersion === v.id
                          ? 'text-text-primary bg-primary/10'
                          : 'text-text-tertiary hover:text-text-secondary'
                      )}
                    >
                      <span>{v.tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Detail */}
      {version && dataset ? (
        <div className="flex-1 overflow-auto">
          {/* Detail Header */}
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <div>
              <h2 className="font-heading text-sm font-semibold text-text-primary">
                {dataset.name} <span className="text-text-tertiary">/ {version.tag}</span>
              </h2>
              <div className="mt-1 flex items-center gap-4 text-xs text-text-tertiary">
                <span>Rows: <span className="font-mono text-text-secondary">{formatNumber(version.rows)}</span></span>
                <span>Cols: <span className="font-mono text-text-secondary">{version.cols}</span></span>
                <span>Size: <span className="font-mono text-text-secondary">{formatBytes(version.sizeBytes)}</span></span>
                <span>Created: <span className="text-text-secondary">{version.createdAt}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {dataset.versions.length > 1 && (
                <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <GitCompare className="h-3 w-3" />
                  Diff
                </button>
              )}
              <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                <Eye className="h-3 w-3" />
                Preview
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                <FileDown className="h-3 w-3" />
                Export
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Schema Table */}
            <div className="rounded-lg border border-border-default bg-bg-surface">
              <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
                <Table2 className="h-3 w-3 text-text-tertiary" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Schema</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Column</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Type</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Nulls</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Unique</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Mean</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Std</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {version.schema.map((col) => (
                    <tr key={col.name} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                      <td className="px-3 py-1.5 font-mono text-xs text-text-primary">{col.name}</td>
                      <td className="px-3 py-1.5 font-mono text-xs text-primary">{col.type}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">{col.nullPct}%</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">{formatNumber(col.unique)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">{col.mean != null ? col.mean.toFixed(2) : '—'}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">{col.std != null ? col.std.toFixed(2) : '—'}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">{col.min != null ? `${col.min} – ${col.max}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistics Preview */}
            <div className="rounded-lg border border-border-default bg-bg-surface">
              <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
                <BarChart3 className="h-3 w-3 text-text-tertiary" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Statistics</span>
              </div>
              <div className="grid grid-cols-4 gap-4 p-3">
                {version.schema.filter(c => c.mean != null).map((col) => (
                  <div key={col.name} className="space-y-1">
                    <span className="text-[10px] font-medium text-text-tertiary">{col.name}</span>
                    <div className="h-12 rounded bg-bg-surface-hover flex items-end gap-px px-1">
                      {/* Simplified histogram bars */}
                      {Array.from({ length: 10 }, (_, i) => {
                        const h = Math.max(4, Math.random() * 48);
                        return <div key={i} className="flex-1 rounded-t bg-chart-1/60" style={{ height: `${h}px` }} />;
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-text-tertiary font-mono">
                      <span>{col.min}</span>
                      <span>μ={col.mean?.toFixed(1)}</span>
                      <span>{col.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lineage */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-text-tertiary" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Used In Experiments</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {version.usedInExperiments.map((exp) => (
                  <span key={exp} className="rounded-md bg-bg-surface-hover px-2 py-1 font-mono text-xs text-text-secondary">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Database className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
            <p className="text-sm text-text-secondary">Select a dataset to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
