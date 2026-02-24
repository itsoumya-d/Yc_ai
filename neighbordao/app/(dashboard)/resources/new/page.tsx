'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  { value: 'tools', label: 'Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'space', label: 'Space' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
];

export default function NewResourcePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tools');
  const [depositAmount, setDepositAmount] = useState('');
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
      .select('neighborhood_id, display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) { setError('No neighborhood found'); setLoading(false); return; }

    const { error: insertError } = await supabase.from('resources').insert({
      neighborhood_id: member.neighborhood_id,
      owner_id: user.id,
      owner_name: member.display_name || user.email?.split('@')[0] || 'Member',
      name,
      description,
      category,
      deposit_amount: depositAmount ? parseFloat(depositAmount) : 0,
      is_available: true,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/resources');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">List a Resource</h1>
        <p className="text-green-600 text-sm mt-1">Share your tools and equipment with the neighborhood</p>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Resource Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. DeWalt Cordless Drill"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Describe the resource, condition, and any usage notes..."
            />
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
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Deposit Amount ($)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0.00 (optional)"
              />
            </div>
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
            {loading ? 'Listing...' : 'List Resource'}
          </button>
        </form>
      </div>
    </div>
  );
}
