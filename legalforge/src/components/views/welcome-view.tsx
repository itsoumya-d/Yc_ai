import { useAppStore } from '@/stores/app-store';
import { Scale, FileText, FilePlus, Upload, Search, Clock } from 'lucide-react';

const quickActions = [
  { icon: FilePlus, label: 'Draft New Contract', desc: 'AI-assisted contract creation', action: 'editor' as const },
  { icon: Upload, label: 'Import DOCX', desc: 'Upload a Word document for review', action: 'contracts' as const },
  { icon: Search, label: 'Review Contract', desc: 'AI risk analysis on an incoming contract', action: 'contracts' as const },
  { icon: FileText, label: 'Browse Templates', desc: 'Start from an approved template', action: 'templates' as const },
];

const recentContracts = [
  { id: '1', title: 'Acme Corp MSA v3', type: 'MSA', status: 'In Negotiation', updated: '2 hours ago' },
  { id: '2', title: 'GlobalCo Mutual NDA', type: 'NDA', status: 'In Review', updated: '4 hours ago' },
  { id: '3', title: 'TechVend SaaS Agreement', type: 'SaaS', status: 'Draft', updated: '1 day ago' },
  { id: '4', title: 'DataCo DPA', type: 'DPA', status: 'Executed', updated: '2 days ago' },
  { id: '5', title: 'CloudServ MSA 2026', type: 'MSA', status: 'In Review', updated: '3 days ago' },
];

export function WelcomeView() {
  const { setView } = useAppStore();

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Greeting */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Scale className="h-8 w-8 text-accent" />
          </div>
          <h1 className="legal-heading text-3xl text-text-primary">Welcome to LegalForge</h1>
          <p className="mt-2 text-sm text-text-secondary">AI-powered contract intelligence for your legal team</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setView(action.action)}
              className="flex items-start gap-4 rounded-xl border border-border-default bg-bg-surface p-5 text-left transition-all hover:border-accent hover:shadow-glow-gold"
            >
              <div className="rounded-lg bg-accent-muted p-2.5">
                <action.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">{action.label}</div>
                <div className="mt-0.5 text-xs text-text-secondary">{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent */}
        <div className="rounded-xl border border-border-default bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <h2 className="text-sm font-medium text-text-primary">Recent Contracts</h2>
            </div>
            <button onClick={() => setView('contracts')} className="text-xs text-text-link hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border-muted">
            {recentContracts.map((c) => (
              <button
                key={c.id}
                onClick={() => setView('editor')}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-bg-surface-raised"
              >
                <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{c.title}</div>
                  <div className="text-[10px] text-text-tertiary">{c.type} · {c.status}</div>
                </div>
                <span className="text-[10px] text-text-tertiary">{c.updated}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
