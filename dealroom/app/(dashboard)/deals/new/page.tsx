'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDeal } from '@/lib/actions/deals';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { DealStage } from '@/types/database';

const stages: { value: DealStage; label: string }[] = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export default function NewDealPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    stage: 'prospecting' as DealStage,
    amount: '',
    close_date: '',
    description: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: createError } = await createDeal({
      company_name: form.company_name,
      contact_name: form.contact_name || undefined,
      contact_email: form.contact_email || undefined,
      stage: form.stage,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      close_date: form.close_date || undefined,
      description: form.description || undefined,
    });

    if (createError) {
      setError(createError);
      setLoading(false);
      return;
    }

    router.push(data ? `/deals/${data.id}` : '/deals');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/deals"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Deal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add a new deal to your pipeline</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Input
              label="Company Name *"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
              placeholder="Acme Corp"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="Jane Smith"
              />
              <Input
                label="Contact Email"
                name="contact_email"
                type="email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="jane@acme.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="stage" className="text-sm font-medium text-gray-700">
                  Stage
                </label>
                <select
                  id="stage"
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {stages.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount (USD)"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="50000"
              />
            </div>

            <Input
              label="Expected Close Date"
              name="close_date"
              type="date"
              value={form.close_date}
              onChange={handleChange}
            />

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief overview of the deal, key stakeholders, pain points..."
              rows={4}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Deal'}
              </Button>
              <Link href="/deals">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
