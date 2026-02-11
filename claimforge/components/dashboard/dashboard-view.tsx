'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, getCaseStatusColor, getCaseStatusLabel, getConfidenceColor, getFraudPatternLabel } from '@/lib/utils';
import {
  Shield,
  TrendingUp,
  FileText,
  AlertTriangle,
  Search,
  Scale,
  ArrowUpRight,
  FolderOpen,
  Clock,
  Plus,
} from 'lucide-react';
import type { DashboardStats, Case, FraudPattern, FraudPatternType, ConfidenceLevel } from '@/types/database';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentCases: Case[];
  recentPatterns: (FraudPattern & { case_title?: string })[];
}

export function DashboardView({ stats, recentCases, recentPatterns }: DashboardViewProps) {
  const statItems = stats ? [
    { label: 'Active Cases', value: String(stats.active_investigations), icon: FolderOpen },
    { label: 'Fraud Detected', value: formatCurrency(stats.total_fraud_detected), icon: AlertTriangle },
    { label: 'Documents Processed', value: String(stats.documents_processed), icon: FileText },
    { label: 'Patterns Identified', value: String(stats.patterns_identified), icon: Search },
    { label: 'Cases Filed', value: String(stats.cases_filed), icon: Scale },
    { label: 'Recovery Rate', value: `${stats.recovery_rate}%`, icon: TrendingUp },
  ] : [];

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Dashboard" subtitle="False Claims Act Investigation Overview">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Case
        </Link>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        {statItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {statItems.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis"
              >
                <div className="mb-3 flex items-center justify-between">
                  <stat.icon className="h-4 w-4 text-text-tertiary" />
                  <div className="flex items-center gap-0.5 text-[10px] font-medium text-verified-green">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
                <div className="financial-figure text-xl font-semibold text-text-primary">{stat.value}</div>
                <div className="mt-1 text-[11px] text-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-default bg-bg-surface p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-text-tertiary opacity-50" />
            <h3 className="mt-4 text-sm font-medium text-text-primary">No data yet</h3>
            <p className="mt-1 text-xs text-text-tertiary">Create your first case to start seeing analytics.</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent Cases */}
          <div className="lg:col-span-3 rounded-xl border border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <h2 className="legal-heading text-sm text-text-primary">Active Cases</h2>
              <Link href="/cases" className="text-xs text-text-link hover:underline">View All</Link>
            </div>
            {recentCases.length > 0 ? (
              <div className="divide-y divide-border-muted">
                {recentCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-tertiary font-mono">{c.case_number}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getCaseStatusColor(c.status))}>
                          {getCaseStatusLabel(c.status)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-text-primary truncate">{c.title}</div>
                      <div className="text-xs text-text-tertiary">{c.defendant_name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="financial-figure text-sm font-medium text-fraud-red">{formatCurrency(c.estimated_fraud_amount)}</div>
                      <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-text-tertiary">
                        <span>{c.document_count} docs</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-xs text-text-tertiary">
                No active cases. Create one to get started.
              </div>
            )}
          </div>

          {/* Recent Patterns */}
          <div className="lg:col-span-2 rounded-xl border border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <h2 className="legal-heading text-sm text-text-primary">Recent Patterns</h2>
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            {recentPatterns.length > 0 ? (
              <div className="divide-y divide-border-muted">
                {recentPatterns.map((p) => (
                  <div key={p.id} className="px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-primary">{getFraudPatternLabel(p.pattern_type as FraudPatternType)}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level as ConfidenceLevel))}>
                        {p.confidence_level}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-text-tertiary">
                      <span>{p.case_title}</span>
                      <span className="financial-figure text-fraud-red">{formatCurrency(p.affected_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-xs text-text-tertiary">
                No patterns detected yet. Upload documents to start analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
