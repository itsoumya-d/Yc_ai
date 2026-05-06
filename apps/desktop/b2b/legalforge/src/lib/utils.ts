import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ContractStatus, ContractType, RiskLevel, ClauseCategory, ObligationUrgency, UserRole } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function truncate(str: string, length: number): string {
  return str.length <= length ? str : `${str.slice(0, length)}...`;
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

export function getContractStatusColor(status: ContractStatus): string {
  const m: Record<ContractStatus, string> = {
    draft: 'bg-bg-surface-raised text-text-tertiary',
    in_review: 'bg-info-blue-muted text-info-blue',
    in_negotiation: 'bg-caution-amber-muted text-caution-amber',
    executed: 'bg-safe-green-muted text-safe-green',
    expired: 'bg-risk-red-muted text-risk-red',
    archived: 'bg-bg-surface-raised text-text-tertiary',
  };
  return m[status];
}

export function getContractStatusLabel(status: ContractStatus): string {
  const m: Record<ContractStatus, string> = {
    draft: 'Draft',
    in_review: 'In Review',
    in_negotiation: 'In Negotiation',
    executed: 'Executed',
    expired: 'Expired',
    archived: 'Archived',
  };
  return m[status];
}

export function getContractTypeLabel(type: ContractType): string {
  const m: Record<ContractType, string> = {
    nda: 'NDA',
    msa: 'MSA',
    saas: 'SaaS Agreement',
    employment: 'Employment',
    consulting: 'Consulting',
    licensing: 'Licensing',
    dpa: 'DPA',
    sow: 'SOW',
    amendment: 'Amendment',
    partnership: 'Partnership',
  };
  return m[type];
}

export function getRiskColor(level: RiskLevel): string {
  const m: Record<RiskLevel, string> = {
    critical: 'bg-risk-red-muted text-risk-red',
    high: 'bg-risk-red-muted text-risk-red',
    medium: 'bg-caution-amber-muted text-caution-amber',
    low: 'bg-safe-green-muted text-safe-green',
    info: 'bg-info-blue-muted text-info-blue',
  };
  return m[level];
}

export function getRiskLabel(level: RiskLevel): string {
  const m: Record<RiskLevel, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
  };
  return m[level];
}

export function getClauseCategoryLabel(cat: ClauseCategory): string {
  const m: Record<ClauseCategory, string> = {
    indemnification: 'Indemnification',
    limitation_of_liability: 'Limitation of Liability',
    confidentiality: 'Confidentiality',
    ip_assignment: 'IP Assignment',
    termination: 'Termination',
    governing_law: 'Governing Law',
    force_majeure: 'Force Majeure',
    data_protection: 'Data Protection',
    warranties: 'Warranties',
    representations: 'Representations',
    non_compete: 'Non-Compete',
    non_solicitation: 'Non-Solicitation',
    dispute_resolution: 'Dispute Resolution',
    insurance: 'Insurance',
    audit_rights: 'Audit Rights',
    assignment: 'Assignment',
    notices: 'Notices',
  };
  return m[cat];
}

export function getUrgencyColor(u: ObligationUrgency): string {
  const m: Record<ObligationUrgency, string> = {
    overdue: 'text-risk-red',
    urgent: 'text-caution-amber',
    soon: 'text-info-blue',
    normal: 'text-text-tertiary',
  };
  return m[u];
}

export function getRoleBadgeColor(role: UserRole): string {
  const m: Record<UserRole, string> = {
    admin: 'bg-risk-red-muted text-risk-red',
    editor: 'bg-primary-muted text-primary-light',
    reviewer: 'bg-caution-amber-muted text-caution-amber',
    viewer: 'bg-bg-surface-raised text-text-tertiary',
  };
  return m[role];
}
