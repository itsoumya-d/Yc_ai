'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSeverityColor, formatDate } from '@/lib/utils';
import { AlertCircle, ChevronDown, ChevronRight, Filter, ArrowRight } from 'lucide-react';
import type { Framework, Severity, GapStatus } from '@/types';

const FW_NAMES: Record<string, string> = { soc2: 'SOC 2', gdpr: 'GDPR', hipaa: 'HIPAA', iso27001: 'ISO 27001' };
const FW_COLORS: Record<string, string> = { soc2: 'bg-indigo-100 text-indigo-700', gdpr: 'bg-cyan-100 text-cyan-700', hipaa: 'bg-green-100 text-green-700', iso27001: 'bg-purple-100 text-purple-700' };

export default function GapsPage() {
  const { gaps, updateGapStatus } = useAppStore();
  const [framework, setFramework] = useState<Framework | 'all'>('all');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<GapStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = gaps.filter((g) => {
    if (framework !== 'all' && g.framework !== framework) return false;
    if (severity !== 'all' && g.severity !== severity) return false;
    if (status !== 'all' && g.status !== status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Gaps & Risks</h1>
        <p className="text-sm text-text-secondary mt-1">{gaps.filter(g => g.status !== 'resolved').length} open gaps across all frameworks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={framework} onChange={(e) => setFramework(e.target.value as any)} className="input w-36">
          <option value="all">All Frameworks</option>
          {(['soc2', 'gdpr', 'hipaa', 'iso27001'] as Framework[]).map(f => <option key={f} value={f}>{FW_NAMES[f]}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="input w-32">
          <option value="all">All Severity</option>
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input w-36">
          <option value="all">All Status</option>
          {(['open', 'in_progress', 'resolved', 'wontfix'] as GapStatus[]).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <div className="ml-auto text-sm text-text-tertiary self-center">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Gap List */}
      <div className="space-y-2">
        {sorted.map((gap) => (
          <div key={gap.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface/50 transition-colors"
              onClick={() => setExpanded(expanded === gap.id ? null : gap.id)}
            >
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${getSeverityColor(gap.severity)}`}>{gap.severity}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{gap.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FW_COLORS[gap.framework]}`}>{FW_NAMES[gap.framework]}</span>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">{gap.control_id}</span>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">{gap.affected_system}</span>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${gap.status === 'resolved' ? 'bg-green-100 text-green-700' : gap.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary'}`}>
                {gap.status.replace('_', ' ')}
              </span>
              {expanded === gap.id ? <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
            </button>

            {expanded === gap.id && (
              <div className="px-5 pb-5 border-t border-border space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed pt-4">{gap.description}</p>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" />Remediation Steps
                  </p>
                  <p className="text-sm text-text-secondary">{gap.remediation}</p>
                </div>
                <div className="flex gap-2">
                  {gap.status !== 'in_progress' && gap.status !== 'resolved' && (
                    <button onClick={() => updateGapStatus(gap.id, 'in_progress')} className="btn-primary text-xs py-1.5">Mark In Progress</button>
                  )}
                  {gap.status !== 'resolved' && (
                    <button onClick={() => updateGapStatus(gap.id, 'resolved')} className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition">
                      Mark Resolved
                    </button>
                  )}
                  {gap.status === 'resolved' && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                      ✓ Resolved
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
