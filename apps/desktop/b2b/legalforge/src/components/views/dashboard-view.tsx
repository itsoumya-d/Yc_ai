import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getDashboardStats, getObligations, generateId, saveContract } from '@/lib/storage';
import { cn, formatDate, getContractStatusColor, getContractStatusLabel, getRiskColor, getRiskLabel } from '@/lib/utils';
import type { Contract } from '@/types/database';
import {
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Plus,
} from 'lucide-react';

export function DashboardView() {
  const { setView, setActiveContract, contracts, addContract } = useAppStore();

  const stats = useMemo(() => getDashboardStats(), [contracts]);

  const recentContracts = useMemo(() => {
    return [...contracts]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [contracts]);

  const pendingReview = useMemo(() => {
    return contracts.filter((c) => c.status === 'in_review' || c.status === 'in_negotiation');
  }, [contracts]);

  const obligations = useMemo(() => {
    const all = getObligations();
    const now = new Date();
    return all
      .filter((o) => !o.completed)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)
      .map((o) => ({
        ...o,
        urgent: new Date(o.due_date) < now,
      }));
  }, [contracts]);

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

  const statCards = [
    { label: 'Total Contracts', value: stats.total, icon: FileText, color: 'text-primary-light' },
    { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-info-blue' },
    { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'text-caution-amber' },
    { label: 'Executed', value: stats.executed, icon: CheckCircle, color: 'text-safe-green' },
    { label: 'Avg Risk Score', value: stats.avgRisk, icon: AlertTriangle, color: stats.avgRisk > 50 ? 'text-risk-red' : 'text-safe-green' },
    { label: 'Due This Week', value: stats.dueThisWeek, icon: Clock, color: stats.dueThisWeek > 0 ? 'text-caution-amber' : 'text-text-tertiary' },
  ];

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Contract pipeline overview</p>
        </div>
        <button onClick={handleNewContract} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> New Contract
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={cn('h-4 w-4', s.color)} />
              </div>
              <div className="text-xl font-semibold text-text-primary">{s.value}</div>
              <div className="mt-0.5 text-[11px] text-text-tertiary">{s.label}</div>
            </div>
          ))}
        </div>

        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-raised">
              <FileText className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No contracts yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Create your first contract to see your pipeline overview.
            </p>
            <button onClick={handleNewContract} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Create Contract
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            {/* Pipeline */}
            <div className="col-span-3 rounded-lg border border-border-default bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <h2 className="text-sm font-medium text-text-primary">Recent Contracts</h2>
                <button onClick={() => setView('contracts')} className="text-xs text-text-link hover:underline">View All</button>
              </div>
              {recentContracts.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-text-tertiary">No contracts to show</div>
              ) : (
                <div className="divide-y divide-border-muted">
                  {recentContracts.map((c) => (
                    <button key={c.id} onClick={() => handleOpenContract(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-surface-raised">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{c.title}</div>
                        <div className="text-[10px] text-text-tertiary">{c.counterparty || 'No counterparty'}</div>
                      </div>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getContractStatusColor(c.status))}>
                        {getContractStatusLabel(c.status)}
                      </span>
                      {c.risk_score != null && c.risk_level != null && (
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskColor(c.risk_level))}>
                          {c.risk_score}
                        </span>
                      )}
                      <span className="text-[10px] text-text-tertiary">{formatDate(c.updated_at)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="col-span-2 space-y-4">
              {/* Pending Reviews */}
              <div className="rounded-lg border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="text-sm font-medium text-text-primary">Pending Reviews ({pendingReview.length})</h3>
                </div>
                {pendingReview.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-text-tertiary">No contracts pending review</div>
                ) : (
                  <div className="divide-y divide-border-muted">
                    {pendingReview.slice(0, 4).map((r) => (
                      <button key={r.id} onClick={() => handleOpenContract(r)} className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-surface-raised">
                        <span className="text-sm text-text-primary truncate">{r.title}</span>
                        <div className="flex items-center gap-2">
                          {r.risk_level && (
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskColor(r.risk_level))}>
                              {getRiskLabel(r.risk_level)}
                            </span>
                          )}
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getContractStatusColor(r.status))}>
                            {getContractStatusLabel(r.status)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Obligations */}
              <div className="rounded-lg border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="text-sm font-medium text-text-primary">Upcoming Obligations</h3>
                </div>
                {obligations.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-text-tertiary">No upcoming obligations</div>
                ) : (
                  <div className="divide-y divide-border-muted">
                    {obligations.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className={cn('h-2 w-2 rounded-full', d.urgent ? 'bg-risk-red risk-pulse' : 'bg-info-blue')} />
                        <span className="text-xs font-medium text-text-secondary">{formatDate(d.due_date)}</span>
                        <span className="flex-1 text-xs text-text-secondary truncate">{d.description}</span>
                        <span className="text-[10px] text-text-tertiary">{d.contract_title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Overdue Warning */}
              {stats.overdue > 0 && (
                <div className="rounded-lg border border-risk-red bg-risk-red-muted p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-risk-red" />
                    <span className="text-sm font-medium text-risk-red">{stats.overdue} overdue obligation{stats.overdue !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">Review and complete overdue items to stay compliant.</p>
                  <button onClick={() => setView('obligations')} className="mt-2 text-xs text-risk-red hover:underline">View Obligations</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
