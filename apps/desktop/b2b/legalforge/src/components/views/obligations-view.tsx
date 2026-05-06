import { useState } from 'react';
import { cn, formatDate, getUrgencyColor } from '@/lib/utils';
import { CalendarClock, List, Calendar, Plus, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ObligationType, ObligationUrgency } from '@/types/database';

interface ObligationItem {
  id: string;
  description: string;
  contract_title: string;
  obligation_type: ObligationType;
  urgency: ObligationUrgency;
  due_date: string;
  assigned_to: string;
  completed: boolean;
}

const obligations: ObligationItem[] = [
  { id: 'o1', description: 'AWS Contract Renewal Decision', contract_title: 'AWS Enterprise Agreement', obligation_type: 'renewal', urgency: 'urgent', due_date: '2024-02-15', assigned_to: 'Sarah Chen', completed: false },
  { id: 'o2', description: 'Acme Q1 Report Submission', contract_title: 'Acme Corp MSA', obligation_type: 'report', urgency: 'urgent', due_date: '2024-02-17', assigned_to: 'James Lee', completed: false },
  { id: 'o3', description: 'GlobalCo Annual Payment', contract_title: 'GlobalCo NDA', obligation_type: 'payment', urgency: 'soon', due_date: '2024-02-22', assigned_to: 'Sarah Chen', completed: false },
  { id: 'o4', description: 'TechVend SLA Performance Review', contract_title: 'TechVend MSA', obligation_type: 'report', urgency: 'soon', due_date: '2024-03-01', assigned_to: 'Maria Rodriguez', completed: false },
  { id: 'o5', description: 'DataCo DPA Renewal', contract_title: 'DataCo DPA', obligation_type: 'renewal', urgency: 'normal', due_date: '2024-03-15', assigned_to: 'Alex Kim', completed: false },
  { id: 'o6', description: 'Q4 Compliance Certificate', contract_title: 'CloudServ MSA', obligation_type: 'deliverable', urgency: 'overdue', due_date: '2024-01-31', assigned_to: 'James Lee', completed: false },
  { id: 'o7', description: 'Insurance Certificate Renewal', contract_title: 'PartnerCo Agreement', obligation_type: 'deadline', urgency: 'normal', due_date: '2024-03-20', assigned_to: 'Sarah Chen', completed: false },
  { id: 'o8', description: 'Annual Fee Payment', contract_title: 'VendorX License', obligation_type: 'payment', urgency: 'normal', due_date: '2024-04-01', assigned_to: 'Sarah Chen', completed: false },
];

function getTypeLabel(type: ObligationType): string {
  const m: Record<ObligationType, string> = { renewal: 'Renewal', payment: 'Payment', deadline: 'Deadline', report: 'Report', deliverable: 'Deliverable' };
  return m[type];
}

function getTypeBadgeColor(type: ObligationType): string {
  const m: Record<ObligationType, string> = {
    renewal: 'bg-info-blue-muted text-info-blue',
    payment: 'bg-safe-green-muted text-safe-green',
    deadline: 'bg-risk-red-muted text-risk-red',
    report: 'bg-caution-amber-muted text-caution-amber',
    deliverable: 'bg-primary-muted text-primary-light',
  };
  return m[type];
}

export function ObligationsView() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const overdueCount = obligations.filter((o) => o.urgency === 'overdue').length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Obligations</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{obligations.length} upcoming obligations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-border-default p-0.5">
            <button onClick={() => setViewMode('list')} className={cn('rounded px-2 py-1 text-xs', viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}>
              <List className="mr-1 inline h-3.5 w-3.5" />List
            </button>
            <button onClick={() => setViewMode('calendar')} className={cn('rounded px-2 py-1 text-xs', viewMode === 'calendar' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}>
              <Calendar className="mr-1 inline h-3.5 w-3.5" />Calendar
            </button>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 border-b border-risk-red/20 bg-risk-red-muted px-6 py-2">
          <AlertTriangle className="h-4 w-4 text-risk-red" />
          <span className="text-sm font-medium text-risk-red">{overdueCount} overdue obligation{overdueCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' && (
          <div className="rounded-lg border border-border-default bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Obligation</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Contract</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {obligations.map((o) => (
                  <tr key={o.id} className={cn('transition-colors hover:bg-bg-surface-raised', o.urgency === 'overdue' && 'bg-risk-red-muted')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full', o.urgency === 'overdue' ? 'bg-risk-red risk-pulse' : o.urgency === 'urgent' ? 'bg-caution-amber' : o.urgency === 'soon' ? 'bg-info-blue' : 'bg-text-tertiary')} />
                        <span className={cn('text-xs font-medium', getUrgencyColor(o.urgency))}>
                          {formatDate(o.due_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{o.description}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getTypeBadgeColor(o.obligation_type))}>
                        {getTypeLabel(o.obligation_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{o.contract_title}</td>
                    <td className="px-4 py-3 text-text-secondary">{o.assigned_to}</td>
                    <td className="px-4 py-3">
                      <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="rounded-lg border border-border-default bg-bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="legal-heading text-base text-text-primary">February 2024</h2>
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <button className="rounded px-2 py-1 hover:bg-bg-surface-raised">← Prev</button>
                <button className="rounded px-2 py-1 hover:bg-bg-surface-raised">Next →</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px rounded-lg border border-border-muted bg-border-muted">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="bg-bg-surface-raised p-2 text-center text-[10px] font-medium text-text-tertiary">{d}</div>
              ))}
              {Array.from({ length: 29 }, (_, i) => i + 1).map((day) => {
                const dayObligations = obligations.filter((o) => {
                  const d = new Date(o.due_date);
                  return d.getDate() === day && d.getMonth() === 1;
                });
                return (
                  <div key={day} className={cn('min-h-20 bg-bg-surface p-2', dayObligations.length > 0 && 'bg-bg-paper')}>
                    <div className="text-xs text-text-tertiary">{day}</div>
                    {dayObligations.map((o) => (
                      <div key={o.id} className={cn('mt-1 truncate rounded px-1.5 py-0.5 text-[9px]', getTypeBadgeColor(o.obligation_type))}>
                        {o.description}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
