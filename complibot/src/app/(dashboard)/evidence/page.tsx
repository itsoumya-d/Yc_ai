'use client';
import { formatDate } from '@/lib/utils';
import { Database, RefreshCw, Download, CheckCircle, Clock, AlertCircle, FileImage, Settings, FileText, BarChart2 } from 'lucide-react';

const EVIDENCE = [
  { id: 'e1', control_id: 'CC6.1', title: 'S3 Block Public Access - prod-uploads', source: 'AWS S3', collected_at: '2025-01-25T10:00:00Z', status: 'collected', type: 'screenshot' },
  { id: 'e2', control_id: 'CC6.2', title: 'IAM MFA Status Report', source: 'AWS IAM', collected_at: '2025-01-25T10:05:00Z', status: 'collected', type: 'config' },
  { id: 'e3', control_id: 'CC7.2', title: 'CloudTrail Log - all regions enabled', source: 'AWS CloudTrail', collected_at: '2025-01-25T10:08:00Z', status: 'collected', type: 'config' },
  { id: 'e4', control_id: 'CC6.3', title: 'IAM Password Policy Configuration', source: 'AWS IAM', collected_at: '2025-01-25T10:10:00Z', status: 'collected', type: 'screenshot' },
  { id: 'e5', control_id: 'CC9.2', title: 'Vendor Security Assessment - Stripe', source: 'Manual Upload', collected_at: '2025-01-20T10:00:00Z', status: 'pending', type: 'document' },
  { id: 'e6', control_id: 'CC7.3', title: 'Incident Response Runbook v0.2', source: 'Notion', collected_at: '2025-01-22T10:00:00Z', status: 'collected', type: 'document' },
  { id: 'e7', control_id: 'Art.5(1)(e)', title: 'Data Retention Schedule', source: 'Manual Upload', collected_at: '', status: 'pending', type: 'document' },
  { id: 'e8', control_id: 'CC6.1', title: 'GitHub Branch Protection Rules', source: 'GitHub', collected_at: '2025-01-25T10:15:00Z', status: 'collected', type: 'config' },
];

const TYPE_ICONS: Record<string, typeof FileImage> = { screenshot: FileImage, config: Settings, document: FileText, log: BarChart2 };
const STATUS_STYLES: Record<string, string> = { collected: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', expired: 'bg-red-100 text-red-700' };

export default function EvidencePage() {
  const collected = EVIDENCE.filter(e => e.status === 'collected').length;
  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidence</h1>
          <p className="text-sm text-text-secondary mt-1">{collected} of {EVIDENCE.length} controls have evidence collected</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />Refresh All
        </button>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-text-primary">Evidence Collection Progress</p>
          <p className="text-sm font-bold text-primary">{Math.round((collected / EVIDENCE.length) * 100)}%</p>
        </div>
        <div className="h-2.5 rounded-full bg-surface overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(collected / EVIDENCE.length) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" />{collected} collected</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-600" />{EVIDENCE.filter(e => e.status === 'pending').length} pending</span>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface text-xs font-medium text-text-tertiary uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Control</th>
              <th className="px-5 py-3 text-left">Evidence</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-left">Collected</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {EVIDENCE.map((e) => {
              const Icon = TYPE_ICONS[e.type] || FileText;
              return (
                <tr key={e.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-primary">{e.control_id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-text-tertiary shrink-0" />
                      <span className="text-sm text-text-primary">{e.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-text-secondary">{e.source}</td>
                  <td className="px-5 py-3 text-xs text-text-tertiary">{e.collected_at ? formatDate(e.collected_at) : '—'}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status]}`}>{e.status}</span></td>
                  <td className="px-5 py-3">
                    {e.status === 'collected' ? (
                      <button className="flex items-center gap-1 text-xs text-text-tertiary hover:text-primary transition"><Download className="h-3.5 w-3.5" />Download</button>
                    ) : (
                      <button className="flex items-center gap-1 text-xs text-primary hover:underline"><RefreshCw className="h-3.5 w-3.5" />Collect</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
