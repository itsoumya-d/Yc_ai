'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A]">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your neighborhood
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: 'var(--border)' }}>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Email address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-[#16A34A] hover:text-[#15803D]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 pr-10 text-base outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ color: 'var(--text-tertiary)' }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-all hover:bg-[#15803D] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          New to NeighborDAO?{' '}
          <Link href="/join" className="font-medium text-[#16A34A] hover:text-[#15803D]">
            Find your neighborhood →
          </Link>
        </p>
      </div>
    </div>
  );
}
