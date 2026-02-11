import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDate, getContractStatusColor, getContractStatusLabel, getContractTypeLabel, getRiskColor } from '@/lib/utils';
import { saveContract, generateId } from '@/lib/storage';
import { Search, Plus, Upload } from 'lucide-react';
import type { ContractStatus, Contract } from '@/types/database';

const statusFilters: Array<{ value: ContractStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'in_negotiation', label: 'Negotiation' },
  { value: 'executed', label: 'Executed' },
  { value: 'expired', label: 'Expired' },
];

export function ContractsView() {
  const { setView, setActiveContract, contracts, addContract } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  const filtered = useMemo(() =>
    contracts.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    [contracts, searchQuery, statusFilter],
  );

  const handleNewContract = useCallback(() => {
    const newContract: Contract = {
      id: generateId(),
      title: 'Untitled Contract',
      contract_type: 'msa',
      status: 'draft',
      counterparty: '',
      risk_score: null,
      risk_level: null,
      assigned_to: '',
      assigned_name: 'You',
      version: 1,
      word_count: 0,
      organization_id: 'default',
      template_id: null,
      governing_law: 'Delaware',
      effective_date: null,
      expiration_date: null,
      value: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addContract(newContract);
    saveContract(newContract);
    setActiveContract(newContract.id);
    setView('editor');
  }, [addContract, setActiveContract, setView]);

  const handleOpenContract = useCallback((contract: Contract) => {
    setActiveContract(contract.id);
    setView('editor');
  }, [setActiveContract, setView]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Contracts</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{filtered.length} contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
            <Upload className="h-4 w-4" /> Import DOCX
          </button>
          <button onClick={handleNewContract} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> New Contract
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border-default px-6 py-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border-default p-0.5">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={cn(
                'rounded px-2.5 py-1 text-xs transition-colors',
                statusFilter === sf.value ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-text-secondary">
              {contracts.length === 0 ? 'No contracts yet. Create your first contract to get started.' : 'No contracts match your filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-surface">
              <tr className="border-b border-border-default text-left text-xs text-text-tertiary">
                <th className="px-6 py-3 font-medium">Contract</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => handleOpenContract(c)} className="cursor-pointer transition-colors hover:bg-bg-surface-raised">
                  <td className="px-6 py-3">
                    <div className="font-medium text-text-primary">{c.title}</div>
                    <div className="text-xs text-text-tertiary">{c.counterparty || 'No counterparty'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-secondary">
                      {getContractTypeLabel(c.contract_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getContractStatusColor(c.status))}>
                      {getContractStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.risk_score != null && c.risk_level != null ? (
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskColor(c.risk_level))}>
                        {c.risk_score}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.assigned_name || '—'}</td>
                  <td className="px-4 py-3 text-text-tertiary">{formatDate(c.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
