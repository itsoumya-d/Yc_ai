'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signIn } from '@/lib/actions/auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-8">
      <h1 className="legal-heading text-lg text-text-primary">Sign In</h1>
      <p className="mt-1 text-sm text-text-secondary">Access your investigation dashboard</p>

      {error && (
        <div className="mt-4 rounded-lg bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="email"
              name="email"
              required
              placeholder="name@organization.com"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input type="checkbox" className="rounded border-border-default" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-xs text-text-link hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-tertiary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-text-link hover:underline">
          Request access
        </Link>
      </p>
    </div>
  );
}
