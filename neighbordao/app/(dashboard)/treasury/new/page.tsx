'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreasuryEntryType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

const ENTRY_TYPES: { value: TreasuryEntryType; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

const CATEGORIES = [
  'general',
  'maintenance',
  'events',
  'supplies',
  'donations',
  'utilities',
  'other',
];

export default function NewTreasuryEntryPage() {
  const router = useRouter();
  const [entryType, setEntryType] = useState<TreasuryEntryType>('income');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { data: member } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) { setError('No neighborhood found'); setLoading(false); return; }

    const { error: insertError } = await supabase.from('treasury_entries').insert({
      neighborhood_id: member.neighborhood_id,
      entry_type: entryType,
      category,
      description,
      amount: parseFloat(amount),
      created_by: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/treasury');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">Add Treasury Entry</h1>
        <p className="text-green-600 text-sm mt-1">Record a transaction for the community fund</p>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">Entry Type</label>
            <div className="flex gap-3">
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setEntryType(t.value)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    entryType === t.value
                      ? t.value === 'income'
                        ? 'border-green-400 bg-green-100 text-green-800'
                        : t.value === 'expense'
                        ? 'border-red-400 bg-red-100 text-red-800'
                        : 'border-blue-400 bg-blue-100 text-blue-800'
                      : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="What is this transaction for?"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Adding...' : 'Add Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
