'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createProposal, updateProposal } from '@/lib/actions/proposals';
import type { Proposal, Client, ProposalStatus, PricingModel } from '@/types/database';

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
  const isEditing = !!proposal;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = isEditing
      ? await updateProposal(proposal.id, formData)
      : await createProposal(formData);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: isEditing ? 'Proposal updated' : 'Proposal created' });
    if (!isEditing && result.data) {
      router.push(`/proposals/${result.data.id}`);
    } else {
      router.push('/proposals');
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
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Notes</label>
          <Textarea name="notes" rows={3} defaultValue={proposal?.notes ?? ''} placeholder="Internal notes about this proposal..." />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Proposal')}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
