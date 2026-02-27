'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { ProposalType } from '@/types';

const TYPE_OPTIONS: { value: ProposalType; label: string; description: string }[] = [
  { value: 'funding', label: 'Funding Request', description: 'Request treasury funds for a project or expense' },
  { value: 'rule_change', label: 'Rule Change', description: 'Propose changes to DAO rules or governance' },
  { value: 'election', label: 'Election', description: 'Elect members to roles or committees' },
  { value: 'general', label: 'General Vote', description: 'Any other community decision' },
];

export default function NewProposalPage() {
  const router = useRouter();
  const { addProposal } = useAppStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'general' as ProposalType,
    budget: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = `p${Date.now()}`;
    addProposal({
      id,
      title: form.title,
      description: form.description,
      type: form.type,
      status: 'active',
      author: 'Maria Chen',
      author_id: 'member-1',
      created_at: new Date().toISOString(),
      deadline: form.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      votes_for: 0,
      votes_against: 0,
      votes_abstain: 0,
      budget: form.budget ? parseInt(form.budget) : undefined,
      discussion_count: 0,
    });
    router.push('/proposals');
  };

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/proposals" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-1">Create Proposal</h1>
      <p className="text-sm text-text-secondary mb-8">Submit a new proposal for community vote</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Proposal Type</label>
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('type', opt.value)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.type === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Install solar panels on community center"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Description *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe the proposal, why it's needed, and expected outcomes…"
            className="input w-full resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {form.type === 'funding' && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Budget (USD)</label>
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                placeholder="0"
                className="input w-full"
              />
            </div>
          )}
          <div className={form.type === 'funding' ? '' : 'col-span-2'}>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Voting Deadline</label>
            <input
              type="date"
              value={form.deadline.slice(0, 10)}
              onChange={(e) => update('deadline', e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 dark:bg-amber-900/10 dark:border-amber-900/30">
          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Once submitted, the proposal will be visible to all members and voting will begin immediately. Make sure your description is clear and complete before submitting.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/proposals" className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary text-center hover:bg-surface transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
}
