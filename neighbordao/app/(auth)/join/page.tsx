'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, Check, Loader2, Home, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'search' | 'found' | 'create' | 'signup';

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('search');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo neighborhood found
  const demoNeighborhood = {
    name: 'Oak Hills Community',
    city: 'San Francisco',
    state: 'CA',
    member_count: 42,
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    // Simulate address lookup
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep('found');
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/feed');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A]">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Find your neighborhood
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your address to get started
          </p>
        </div>

        {/* Step: Address search */}
        {step === 'search' && (
          <div className="rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: 'var(--border)' }}>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Your home address
                </label>
                <input
                  id="address" type="text" required autoComplete="street-address"
                  value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="123 Oak Lane, San Francisco, CA 94101"
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Your exact address is never shared publicly
                </p>
              </div>
              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.97] disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MapPin className="h-4 w-4" /> Search</>}
              </button>
            </form>
          </div>
        )}

        {/* Step: Neighborhood found */}
        {step === 'found' && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#16A34A]">
                <Check className="h-4 w-4" /> Great news! We found your neighborhood.
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
                    <Home className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
                      {demoNeighborhood.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {demoNeighborhood.city}, {demoNeighborhood.state}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <Users className="h-3.5 w-3.5" />
                      {demoNeighborhood.member_count} neighbors have already joined
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep('signup')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.97]">
                Join {demoNeighborhood.name} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setStep('create')}
              className="w-full rounded-xl border bg-white py-3 text-sm font-medium transition-all hover:bg-[#F5F5F4]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              Or create a new neighborhood instead
            </button>
          </div>
        )}

        {/* Step: Create neighborhood */}
        {step === 'create' && (
          <div className="rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: 'var(--border)' }}>
            <h2 className="mb-4 text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
              Be the first in your neighborhood!
            </h2>
            <div>
              <label htmlFor="nbname" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Neighborhood name
              </label>
              <input
                id="nbname" type="text"
                className="mb-4 w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="e.g. Oak Hills Community"
              />
            </div>
            <button
              onClick={() => setStep('signup')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-all hover:bg-[#15803D]">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step: Create account */}
        {step === 'signup' && (
          <div className="rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: 'var(--border)' }}>
            <h2 className="mb-4 text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
              Create your account
            </h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">{error}</div>
            )}
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="fullname" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full name</label>
                <input id="fullname" type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Sarah Mitchell" />
              </div>
              <div>
                <label htmlFor="email2" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
                <input id="email2" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="sarah@example.com" />
              </div>
              <div>
                <label htmlFor="pw2" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
                <input id="pw2" type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Create a secure password" />
              </div>
              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.97] disabled:opacity-60">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Join NeighborDAO'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#16A34A] hover:text-[#15803D]">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
