'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { organization_name: orgName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Check your email</h2>
        <p className="mt-2 text-sm text-slate-400">
          We sent a confirmation link to <strong className="text-slate-300">{email}</strong>.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 text-sm text-blue-400 hover:text-blue-300 font-medium"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-heading">Start your compliance journey</h1>
        <p className="mt-1 text-sm text-slate-400">AI-powered compliance automation for your organization</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-slate-300 mb-1">
            Organization Name
          </label>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            placeholder="Acme Corp"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Work Email
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
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition text-sm"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
