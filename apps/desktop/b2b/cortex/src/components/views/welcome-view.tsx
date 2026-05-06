import { useAppStore } from '@/stores/app-store';
import { Database, FileSpreadsheet, Upload, ArrowRight, Sparkles } from 'lucide-react';

const quickConnections = [
  { type: 'postgresql', label: 'PostgreSQL', desc: 'Connect to a PostgreSQL database', icon: '🐘' },
  { type: 'mysql', label: 'MySQL', desc: 'Connect to a MySQL database', icon: '🐬' },
  { type: 'csv', label: 'CSV / Excel', desc: 'Upload local data files', icon: '📊' },
  { type: 'bigquery', label: 'BigQuery', desc: 'Connect to Google BigQuery', icon: '☁️' },
];

const sampleQueries = [
  'Show me monthly revenue trends for the last 12 months',
  'Which customers have the highest lifetime value?',
  'What is our churn rate by product category?',
  'Compare Q4 sales across all regions',
];

export function WelcomeView() {
  const { setView } = useAppStore();

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-DEFAULT">
          <Sparkles className="h-8 w-8 text-white" />
        </div>

        <h1 className="data-heading mb-2 text-3xl text-text-primary">Ask your data anything</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Connect a database and start asking questions in plain English. Cortex translates your questions to SQL and visualizes the results.
        </p>

        {/* Connection Options */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {quickConnections.map((c) => (
            <button
              key={c.type}
              onClick={() => setView('settings')}
              className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface p-4 text-left transition-colors hover:border-primary-light hover:bg-bg-surface-raised"
            >
              <span className="text-2xl">{c.icon}</span>
              <div>
                <div className="text-sm font-medium text-text-primary">{c.label}</div>
                <div className="text-xs text-text-tertiary">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Sample Queries */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">TRY ASKING</h3>
          <div className="space-y-2">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => setView('workspace')}
                className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:border-primary-light hover:text-text-primary"
              >
                <span>{q}</span>
                <ArrowRight className="h-4 w-4 text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-text-tertiary">
          Your data stays on your machine. No cloud upload required.
        </p>
      </div>
    </div>
  );
}
