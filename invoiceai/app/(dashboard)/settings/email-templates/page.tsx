'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Eye, Save, ChevronDown, ChevronUp, Check, Code } from 'lucide-react';

const VARIABLES = [
  { var: '{{client_name}}', desc: 'Client or company name' },
  { var: '{{invoice_number}}', desc: 'Invoice number (e.g. INV-042)' },
  { var: '{{amount}}', desc: 'Total invoice amount' },
  { var: '{{due_date}}', desc: 'Payment due date' },
  { var: '{{business_name}}', desc: 'Your business name' },
  { var: '{{pay_link}}', desc: 'Online payment link' },
  { var: '{{issue_date}}', desc: 'Invoice issue date' },
  { var: '{{days_overdue}}', desc: 'Number of days past due' },
];

const TEMPLATES = [
  {
    id: 'invoice_sent',
    name: 'Invoice Sent',
    description: 'Sent when you email an invoice to a client.',
    icon: '📄',
    defaultSubject: 'Invoice {{invoice_number}} from {{business_name}}',
    defaultBody: `Hi {{client_name}},

Please find your invoice for {{amount}} attached to this email, due on {{due_date}}.

You can pay securely online using the link below:
{{pay_link}}

If you have any questions, please don't hesitate to reach out.

Thank you for your business!

{{business_name}}`,
  },
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    description: 'Sent as an automated follow-up reminder before the due date.',
    icon: '⏰',
    defaultSubject: 'Friendly reminder: Invoice {{invoice_number}} due {{due_date}}',
    defaultBody: `Hi {{client_name}},

This is a friendly reminder that Invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.

Pay now in seconds:
{{pay_link}}

If you've already sent payment, please disregard this message.

Thank you,
{{business_name}}`,
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    description: 'Sent automatically when a payment is confirmed.',
    icon: '✅',
    defaultSubject: 'Payment received — Invoice {{invoice_number}}',
    defaultBody: `Hi {{client_name}},

Great news! We've received your payment of {{amount}} for Invoice {{invoice_number}}.

A receipt has been attached to this email for your records. Thank you for your prompt payment!

Looking forward to working with you again.

Best regards,
{{business_name}}`,
  },
  {
    id: 'overdue_notice',
    name: 'Overdue Notice',
    description: 'Sent when an invoice is past its due date.',
    icon: '⚠️',
    defaultSubject: 'Action required: Invoice {{invoice_number}} is {{days_overdue}} days overdue',
    defaultBody: `Hi {{client_name}},

We noticed that Invoice {{invoice_number}} for {{amount}} (due {{due_date}}) is now {{days_overdue}} days past due.

Please make payment at your earliest convenience:
{{pay_link}}

If you're experiencing any issues or would like to discuss payment arrangements, please reply to this email.

{{business_name}}`,
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    description: 'Optional thank-you note sent after project completion.',
    icon: '🙏',
    defaultSubject: 'Thank you for your business, {{client_name}}!',
    defaultBody: `Hi {{client_name}},

Thank you so much for choosing {{business_name}}. It was a pleasure working with you!

We hope you're delighted with the result. If you ever need anything in the future, don't hesitate to reach out.

We'd also love if you could leave us a review — it helps more than you know.

With gratitude,
{{business_name}}`,
  },
];

export default function EmailTemplatesPage() {
  const [subjects, setSubjects] = useState<Record<string, string>>(
    Object.fromEntries(TEMPLATES.map(t => [t.id, t.defaultSubject]))
  );
  const [bodies, setBodies] = useState<Record<string, string>>(
    Object.fromEntries(TEMPLATES.map(t => [t.id, t.defaultBody]))
  );
  const [expanded, setExpanded] = useState<string | null>('invoice_sent');
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);

  const handleSave = async (id: string) => {
    setSaving(id);
    await new Promise(r => setTimeout(r, 700));
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  const getPreview = (id: string): string => {
    const body = bodies[id] ?? '';
    return body
      .replace(/{{client_name}}/g, 'Jane Smith')
      .replace(/{{invoice_number}}/g, 'INV-042')
      .replace(/{{amount}}/g, '$2,400.00')
      .replace(/{{due_date}}/g, 'March 28, 2026')
      .replace(/{{business_name}}/g, 'Your Business LLC')
      .replace(/{{pay_link}}/g, 'https://pay.invoiceai.co/inv/abc123')
      .replace(/{{issue_date}}/g, 'March 1, 2026')
      .replace(/{{days_overdue}}/g, '7');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Email Templates</h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">Customize the emails sent to your clients at each stage.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Variables reference */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <button
            onClick={() => setShowVars(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--muted)]/50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code size={15} className="text-[var(--muted-foreground)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">Available Template Variables</span>
              <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">{VARIABLES.length}</span>
            </div>
            {showVars ? <ChevronUp size={15} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={15} className="text-[var(--muted-foreground)]" />}
          </button>
          {showVars && (
            <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[var(--border)] pt-4">
              {VARIABLES.map(v => (
                <div key={v.var} className="bg-[var(--muted)] rounded-lg p-2.5">
                  <code className="text-xs font-mono text-[var(--primary)] font-semibold block">{v.var}</code>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{v.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template list */}
        {TEMPLATES.map(template => {
          const isExpanded = expanded === template.id;
          const isPreviewing = previewing === template.id;

          return (
            <div key={template.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : template.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--muted)]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{template.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{template.name}</h3>
                      {saved === template.id && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                          <Check size={11} />
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[var(--muted-foreground)]" />
                    <code className="text-xs text-[var(--muted-foreground)] font-mono hidden sm:block truncate max-w-48">
                      {subjects[template.id]}
                    </code>
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={15} className="text-[var(--muted-foreground)]" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--border)] p-5 space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Subject Line</label>
                    <input
                      value={subjects[template.id]}
                      onChange={e => setSubjects(prev => ({ ...prev, [template.id]: e.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  {/* Body / Preview toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-[var(--foreground)]">Email Body</label>
                      <button
                        onClick={() => setPreviewing(isPreviewing ? null : template.id)}
                        className="flex items-center gap-1.5 text-xs text-[var(--primary)] hover:opacity-80 font-medium transition-opacity"
                      >
                        <Eye size={12} />
                        {isPreviewing ? 'Edit' : 'Preview'}
                      </button>
                    </div>

                    {isPreviewing ? (
                      <div className="rounded-lg border border-[var(--border)] bg-white p-4">
                        <div className="border-b border-gray-200 pb-3 mb-3">
                          <p className="text-xs text-gray-500">To: <span className="text-gray-800">Jane Smith &lt;jane@client.com&gt;</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">Subject: <span className="text-gray-800 font-medium">
                            {subjects[template.id]
                              .replace(/{{client_name}}/g, 'Jane Smith')
                              .replace(/{{invoice_number}}/g, 'INV-042')
                              .replace(/{{business_name}}/g, 'Your Business LLC')}
                          </span></p>
                        </div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                          {getPreview(template.id)}
                        </pre>
                      </div>
                    ) : (
                      <textarea
                        value={bodies[template.id]}
                        onChange={e => setBodies(prev => ({ ...prev, [template.id]: e.target.value }))}
                        rows={12}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSave(template.id)}
                      disabled={saving === template.id}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-all"
                    >
                      {saving === template.id ? (
                        <span>Saving...</span>
                      ) : saved === template.id ? (
                        <><Check size={13} /> Saved</>
                      ) : (
                        <><Save size={13} /> Save Template</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSubjects(prev => ({ ...prev, [template.id]: template.defaultSubject }));
                        setBodies(prev => ({ ...prev, [template.id]: template.defaultBody }));
                      }}
                      className="px-4 py-2 border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
