'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewGroupOrderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [minimumUnits, setMinimumUnits] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default deadline 7 days from now
  const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

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

    const { error: insertError } = await supabase.from('group_orders').insert({
      neighborhood_id: member.neighborhood_id,
      organizer_id: user.id,
      organizer_name: member.display_name || user.email?.split('@')[0] || 'Member',
      title,
      description,
      vendor_name: vendorName,
      unit_price: parseFloat(unitPrice),
      minimum_units: parseInt(minimumUnits, 10),
      deadline: new Date(deadline || defaultDeadline).toISOString(),
      current_units: 0,
      total_amount: 0,
      status: 'open',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/group-purchases');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">Create Group Order</h1>
        <p className="text-green-600 text-sm mt-1">Organize a bulk purchase with your neighbors</p>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Bulk Organic Rice Purchase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Tell neighbors what you're ordering and why..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Vendor / Supplier</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Local Farm Co-op"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Price per Unit ($)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Minimum Units</label>
              <input
                type="number"
                value={minimumUnits}
                onChange={(e) => setMinimumUnits(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. 10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={deadline || defaultDeadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
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
            {loading ? 'Creating...' : 'Create Group Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
