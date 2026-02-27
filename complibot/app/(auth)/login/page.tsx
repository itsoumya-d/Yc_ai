'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-heading">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to your compliance dashboard</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition text-sm"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
