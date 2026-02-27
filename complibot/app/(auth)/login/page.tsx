'use client';

import { useState } from 'react';
import { signIn } from '@/lib/actions/auth';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    const result = await signIn(formData);
    if (result && !result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-trust-600">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sign in to your CompliBot account
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-trust-600 focus:outline-none focus:ring-2 focus:ring-trust-600/20"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-trust-600 focus:outline-none focus:ring-2 focus:ring-trust-600/20"
            />
          </div>

          {error && (
            <p
              className="rounded-[var(--radius-input)] bg-alert-50 px-3 py-2 text-sm text-alert-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-[var(--radius-button)] bg-trust-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-trust-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-trust-600 hover:underline"
          >
            Start your free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
