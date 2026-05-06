import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDate, getContractTypeLabel } from '@/lib/utils';
import { Search, Plus, FileText, Edit3, CheckCircle, Clock, Archive } from 'lucide-react';
import type { ContractType } from '@/types/database';

interface Template {
  id: string;
  name: string;
  contract_type: ContractType;
  status: 'draft' | 'approved' | 'deprecated';
  usage_count: number;
  variable_count: number;
  updated_at: string;
}

const templates: Template[] = [
  { id: 't1', name: 'Mutual NDA', contract_type: 'nda', status: 'approved', usage_count: 142, variable_count: 8, updated_at: '2024-01-15' },
  { id: 't2', name: 'Master Service Agreement', contract_type: 'msa', status: 'approved', usage_count: 89, variable_count: 15, updated_at: '2024-02-01' },
  { id: 't3', name: 'SaaS Agreement', contract_type: 'saas', status: 'approved', usage_count: 67, variable_count: 12, updated_at: '2024-01-28' },
  { id: 't4', name: 'Employment Agreement', contract_type: 'employment', status: 'approved', usage_count: 34, variable_count: 18, updated_at: '2023-11-20' },
  { id: 't5', name: 'Consulting Agreement', contract_type: 'consulting', status: 'draft', usage_count: 51, variable_count: 10, updated_at: '2024-01-08' },
  { id: 't6', name: 'Data Processing Agreement', contract_type: 'dpa', status: 'approved', usage_count: 28, variable_count: 14, updated_at: '2024-02-03' },
  { id: 't7', name: 'Licensing Agreement', contract_type: 'licensing', status: 'approved', usage_count: 19, variable_count: 11, updated_at: '2024-01-20' },
  { id: 't8', name: 'One-Way NDA (Outbound)', contract_type: 'nda', status: 'deprecated', usage_count: 45, variable_count: 6, updated_at: '2023-06-15' },
  { id: 't9', name: 'Statement of Work', contract_type: 'sow', status: 'approved', usage_count: 73, variable_count: 9, updated_at: '2024-02-10' },
];

function getStatusIcon(status: Template['status']) {
  if (status === 'approved') return <CheckCircle className="h-3 w-3 text-safe-green" />;
  if (status === 'draft') return <Clock className="h-3 w-3 text-caution-amber" />;
  return <Archive className="h-3 w-3 text-text-tertiary" />;
}

export function TemplatesView() {
  const { setView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = templates.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Templates</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{templates.length} contract templates</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> Create Template
        </button>
      </div>

      <div className="border-b border-border-default px-6 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={cn(
                'rounded-lg border bg-bg-surface p-5 transition-all hover:shadow-2',
                t.status === 'deprecated' ? 'border-border-muted opacity-60' : 'border-border-default hover:border-accent',
              )}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">{t.name}</h3>
                    <span className="text-[10px] text-text-tertiary">{getContractTypeLabel(t.contract_type)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(t.status)}
                  <span className="text-[10px] capitalize text-text-tertiary">{t.status}</span>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-text-tertiary">Used</div>
                  <div className="font-medium text-text-primary">{t.usage_count} times</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Variables</div>
                  <div className="font-medium text-text-primary">{t.variable_count}</div>
                </div>
              </div>

              <div className="mb-3 text-[10px] text-text-tertiary">
                Updated {formatDate(t.updated_at)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('editor')}
                  disabled={t.status === 'deprecated'}
                  className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use Template
                </button>
                <button className="rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised">
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
