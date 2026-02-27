'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { formatDate } from '@/lib/utils';
import { FileText, Download, Eye, Wand2, Plus, CheckCircle, Clock, Edit } from 'lucide-react';
import type { Framework } from '@/types';

const FW_NAMES: Record<string, string> = { soc2: 'SOC 2', gdpr: 'GDPR', hipaa: 'HIPAA', iso27001: 'ISO 27001' };
const FW_COLORS: Record<string, string> = { soc2: 'bg-indigo-100 text-indigo-700', gdpr: 'bg-cyan-100 text-cyan-700', hipaa: 'bg-green-100 text-green-700', iso27001: 'bg-purple-100 text-purple-700' };
const STATUS_COLORS: Record<string, string> = { approved: 'bg-green-100 text-green-700', review: 'bg-amber-100 text-amber-700', draft: 'bg-surface text-text-secondary' };

const POLICY_TEMPLATES = [
  'Acceptable Use Policy', 'Business Continuity Plan', 'Change Management Policy',
  'Vulnerability Management Policy', 'Vendor Management Policy', 'Encryption Policy',
];

export default function PoliciesPage() {
  const { policies } = useAppStore();
  const [filter, setFilter] = useState<Framework | 'all'>('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);

  const filtered = policies.filter((p) => filter === 'all' || p.framework === filter);

  const handleGenerate = (template: string) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(template);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Policies</h1>
          <p className="text-sm text-text-secondary mt-1">AI-generated policies customized to your stack</p>
        </div>
        <button onClick={() => setShowGenerator(!showGenerator)} className="btn-primary text-sm flex items-center gap-2">
          <Wand2 className="h-4 w-4" />Generate Policy
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />AI Policy Generator
          </h3>
          {!generating && !generated ? (
            <>
              <p className="text-sm text-text-secondary">Select a policy template to generate. CompliBot will customize it to your infrastructure and team structure.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {POLICY_TEMPLATES.map((t) => (
                  <button key={t} onClick={() => handleGenerate(t)} className="rounded-lg border border-border bg-card p-3 text-left text-xs font-medium text-text-primary hover:border-primary/40 hover:bg-white transition-all">
                    <FileText className="h-4 w-4 text-primary mb-1.5" />{t}
                  </button>
                ))}
              </div>
            </>
          ) : generating ? (
            <div className="flex items-center gap-3 py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-text-secondary">Generating {generated}... Analyzing your infrastructure configuration...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{generated} generated successfully!</span>
              </div>
              <p className="text-xs text-text-secondary">The policy has been customized to your AWS infrastructure, team of 12, and SOC 2 Type II requirements. Review and approve before finalizing.</p>
              <div className="flex gap-2">
                <button className="btn-primary text-xs py-1.5">Review Policy</button>
                <button onClick={() => { setGenerated(null); setShowGenerator(false); }} className="btn-outline text-xs py-1.5">Generate Another</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'soc2', 'gdpr', 'hipaa', 'iso27001'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'border border-border text-text-secondary hover:bg-surface'}`}>
            {f === 'all' ? 'All' : FW_NAMES[f]}
          </button>
        ))}
      </div>

      {/* Policy grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((policy) => (
          <div key={policy.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[policy.status]}`}>{policy.status}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${FW_COLORS[policy.framework]}`}>{FW_NAMES[policy.framework]}</span>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{policy.title}</h3>
            <div className="flex items-center gap-3 text-xs text-text-tertiary mb-4">
              <span>v{policy.version}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {formatDate(policy.updated_at)}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface transition"><Eye className="h-3.5 w-3.5" />View</button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface transition"><Edit className="h-3.5 w-3.5" />Edit</button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface transition"><Download className="h-3.5 w-3.5" />PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
