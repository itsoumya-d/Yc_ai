'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BookResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;

  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [notes, setNotes] = useState('');
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
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: resource } = await supabase
      .from('resources')
      .select('name, is_available, neighborhood_id')
      .eq('id', resourceId)
      .single();

    if (!resource) { setError('Resource not found'); setLoading(false); return; }
    if (!resource.is_available) { setError('Resource is no longer available'); setLoading(false); return; }

    const { error: bookingError } = await supabase.from('resource_bookings').insert({
      resource_id: resourceId,
      resource_name: resource.name,
      borrower_id: user.id,
      borrower_name: member?.display_name || user.email?.split('@')[0] || 'Member',
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      notes,
      status: 'pending',
    });

    if (bookingError) {
      setError(bookingError.message);
      setLoading(false);
      return;
    }

    await supabase.from('resources').update({ is_available: false }).eq('id', resourceId);

    router.push('/resources');
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">Book Resource</h1>
        <p className="text-green-600 text-sm mt-1">Reserve this resource for your use</p>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Start Date &amp; Time</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">End Date &amp; Time</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Any notes for the owner..."
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
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
