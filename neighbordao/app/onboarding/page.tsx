'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Find or use default neighborhood
    const { data: neighborhood } = await supabase
      .from('neighborhoods')
      .select('id')
      .eq('zip_code', zip)
      .limit(1)
      .single()
      .catch(() => ({ data: null }));

    const neighborhoodId = neighborhood?.id ?? '00000000-0000-0000-0000-000000000001';

    // Create/update profile
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: user.id,
      full_name: fullName || user.email!.split('@')[0],
      address,
      neighborhood_id: neighborhoodId,
    }, { onConflict: 'id' });

    if (profileError) { setError(profileError.message); setLoading(false); return; }

    // Join neighborhood
    await supabase.from('neighborhood_members').upsert(
      { neighborhood_id: neighborhoodId, user_id: user.id, role: 'member' },
      { onConflict: 'neighborhood_id,user_id' }
    );

    router.push('/feed');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Set up your profile</h1>
          <p className="text-slate-600 mt-1">Tell us a bit about yourself to join your neighborhood</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
            <input type="text" value={zip} onChange={e => setZip(e.target.value)} pattern="[0-9]{5}"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="78701" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Joining...' : 'Join my neighborhood →'}
          </button>
        </form>
      </div>
    </div>
  );
}
