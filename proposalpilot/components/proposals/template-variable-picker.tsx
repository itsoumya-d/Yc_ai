'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Variable {
  token:       string;
  label:       string;
  description: string;
  example:     string;
  category:    string;
}

const VARIABLES: Variable[] = [
  // Client
  { token: '{{client_name}}',      label: 'Client Name',        description: 'Full name of the client contact', example: 'John Smith',           category: 'Client' },
  { token: '{{client_company}}',   label: 'Company Name',       description: 'Client company or organisation',  example: 'Acme Corp',            category: 'Client' },
  { token: '{{client_email}}',     label: 'Client Email',       description: 'Client email address',            example: 'john@acme.com',        category: 'Client' },
  { token: '{{client_phone}}',     label: 'Client Phone',       description: 'Client phone number',             example: '+1 555 000 1234',      category: 'Client' },
  // Proposal
  { token: '{{proposal_title}}',   label: 'Proposal Title',     description: 'Title of this proposal',          example: 'Website Redesign',     category: 'Proposal' },
  { token: '{{proposal_number}}',  label: 'Proposal Number',    description: 'Auto-generated reference number', example: 'PROP-0042',            category: 'Proposal' },
  { token: '{{proposal_value}}',   label: 'Proposal Value',     description: 'Total deal value (formatted)',    example: '$12,500',              category: 'Proposal' },
  { token: '{{valid_until}}',      label: 'Valid Until',        description: 'Proposal expiry date',            example: 'March 31, 2025',       category: 'Proposal' },
  { token: '{{sent_date}}',        label: 'Sent Date',          description: 'Date the proposal was sent',      example: 'March 1, 2025',        category: 'Proposal' },
  // Sender
  { token: '{{sender_name}}',      label: 'Sender Name',        description: 'Your full name',                  example: 'Jane Doe',             category: 'Sender' },
  { token: '{{sender_company}}',   label: 'Sender Company',     description: 'Your company name',               example: 'My Agency LLC',        category: 'Sender' },
  { token: '{{sender_email}}',     label: 'Sender Email',       description: 'Your reply-to email',             example: 'jane@myagency.com',    category: 'Sender' },
  { token: '{{sender_phone}}',     label: 'Sender Phone',       description: 'Your contact number',             example: '+1 555 999 8888',      category: 'Sender' },
  // Date helpers
  { token: '{{today}}',            label: 'Today',              description: 'Current date when rendered',      example: 'March 5, 2025',        category: 'Date' },
  { token: '{{current_year}}',     label: 'Current Year',       description: 'Four-digit current year',         example: '2025',                 category: 'Date' },
  { token: '{{current_month}}',    label: 'Current Month',      description: 'Full month name',                 example: 'March',                category: 'Date' },
];

const CATEGORIES = ['All', ...Array.from(new Set(VARIABLES.map((v) => v.category)))];

interface TemplateVariablePickerProps {
  onInsert: (token: string) => void;
  className?: string;
}

export function TemplateVariablePicker({ onInsert, className }: TemplateVariablePickerProps) {
  const [open,     setOpen]     = useState(false);
  const [category, setCategory] = useState('All');
  const [search,   setSearch]   = useState('');
  const [copied,   setCopied]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = VARIABLES.filter((v) => {
    const matchCat = category === 'All' || v.category === category;
    const q = search.toLowerCase();
    const matchQ = !q || v.label.toLowerCase().includes(q) || v.token.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  function handleInsert(token: string) {
    onInsert(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-brand-400 hover:text-brand-600"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Insert Variable
        <svg className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute left-0 top-full z-20 mt-2 w-96 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
            {/* Header */}
            <div className="border-b border-[var(--border)] px-4 py-3">
              <p className="text-xs font-semibold text-[var(--foreground)]">Template Variables</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                Click to insert — variables are replaced when the proposal renders
              </p>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--border)] px-3 py-2">
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search variables…"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-3 py-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    category === cat
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Variable list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-4 text-center text-xs text-[var(--muted-foreground)]">No variables match</p>
              ) : (
                filtered.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => handleInsert(v.token)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--accent)]"
                  >
                    <code className={cn(
                      'shrink-0 rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] text-brand-700 transition-colors',
                      copied === v.token && 'bg-green-100 text-green-700'
                    )}>
                      {copied === v.token ? '✓ inserted' : v.token}
                    </code>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--foreground)]">{v.label}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{v.description}</p>
                      <p className="mt-0.5 text-[10px] italic text-[var(--muted-foreground)]">e.g. {v.example}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-[var(--border)] px-4 py-2">
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Tip: Variables are wrapped in <code className="font-mono">{'{{double braces}}'}</code> and filled automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Resolves template variable tokens in a string using a context object.
 * Used server-side when generating proposal PDFs or preview text.
 */
export function resolveTemplateVariables(
  content: string,
  context: Record<string, string | number | null | undefined>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = context[key];
    return val != null ? String(val) : match;
  });
}
