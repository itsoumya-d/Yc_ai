'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createProposal, updateProposal } from '@/lib/actions/proposals';
import type { Proposal, Client, ProposalStatus, PricingModel } from '@/types/database';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';

interface ProposalFormProps {
  proposal?: Proposal;
  clients: Client[];
}

const statusOptions: { value: ProposalStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const pricingOptions: { value: PricingModel; label: string }[] = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'time_materials', label: 'Time & Materials' },
  { value: 'retainer', label: 'Retainer' },
  { value: 'value_based', label: 'Value-Based' },
  { value: 'milestone', label: 'Milestone' },
];

export function ProposalForm({ proposal, clients }: ProposalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const isEditing = !!proposal;
  const [notes, setNotes] = useState(proposal?.notes ?? '');

  const { status: autoSaveStatus, statusText: autoSaveText } = useAutoSave({
    value: notes,
    onSave: async (val) => {
      if (!proposal?.id) return;
      const fd = new FormData();
      fd.set('notes', val);
      return await updateProposal(proposal.id, fd);
    },
    delay: 1500,
    skipIf: (val) => val === (proposal?.notes ?? ''),
  });

  const triggerShake = () => {
    const el = shakeRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'shake 0.5s ease';
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const result = isEditing
        ? await updateProposal(proposal.id, formData)
        : await createProposal(formData);
      setLoading(false);
      if (result.error) {
        setSubmitError(result.error);
        triggerShake();
        toast({ title: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: isEditing ? 'Proposal updated' : 'Proposal created' });
      if (!isEditing && result.data) {
        router.push(`/proposals/${result.data.id}`);
      } else {
        router.push('/proposals');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setSubmitError(msg);
      triggerShake();
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title *</label>
          <Input name="title" required defaultValue={proposal?.title ?? ''} placeholder="e.g. Website Redesign Proposal" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Client</label>
            <Select name="client_id" defaultValue={proposal?.client_id ?? ''}>
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
              ))}
            </Select>
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
              <Select name="status" defaultValue={proposal?.status ?? 'draft'}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Value</label>
            <Input name="value" type="number" step="0.01" defaultValue={proposal?.value ?? 0} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Currency</label>
            <Select name="currency" defaultValue={proposal?.currency ?? 'USD'}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Pricing Model</label>
            <Select name="pricing_model" defaultValue={proposal?.pricing_model ?? 'fixed'}>
              {pricingOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Valid Until</label>
          <Input name="valid_until" type="date" defaultValue={proposal?.valid_until ?? ''} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">Notes</label>
            <AutoSaveIndicator status={autoSaveStatus} text={autoSaveText} />
          </div>
          <Textarea name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes about this proposal..." />
        </div>
        {submitError && (
          <div
            ref={shakeRef}
            className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
            style={{ animationDuration: '0.5s' }}
          >
            {submitError}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (isEditing ? 'Save Changes' : 'Create Proposal')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
