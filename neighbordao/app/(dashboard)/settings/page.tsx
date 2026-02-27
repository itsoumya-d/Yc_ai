import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user!.id).single();
  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user!.id).single();

  const plans = [
    { id: 'community', name: 'Community', price: '$4.99/mo', features: ['Up to 50 members', 'All core features', 'Group purchasing'] },
    { id: 'hoa', name: 'HOA', price: '$199/mo', features: ['Unlimited members', 'Full governance suite', 'Treasury management', 'Priority support'] },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{profile?.full_name ?? user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Billing */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Billing</h2>
        <p className="text-sm text-slate-600 mb-4">
          Current plan: <span className="font-semibold text-indigo-600">{subscription?.plan ?? 'Free'}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`border rounded-xl p-4 ${subscription?.plan === plan.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                <span className="text-indigo-600 font-bold text-sm">{plan.price}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {plan.features.map(f => <li key={f} className="text-xs text-slate-600 flex items-center gap-1"><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
              {subscription?.plan === plan.id ? (
                <form action="/api/stripe/portal" method="POST">
                  <button type="submit" className="w-full text-center py-2 px-3 border border-indigo-300 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">Manage billing</button>
                </form>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value={plan.id} />
                  <button type="submit" className="w-full text-center py-2 px-3 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">Upgrade</button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
