'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TreePine, CheckCircle } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-leaf-600" />
          <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary">
            Check your email
          </h1>
          <p className="mt-3 text-text-secondary">
            We sent you a confirmation link. Click it to activate your account and join
            your neighborhood.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-leaf-600 hover:text-leaf-700"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <TreePine className="h-8 w-8 text-leaf-600" />
            <span className="font-heading text-2xl font-bold text-text-primary">
              NeighborDAO
            </span>
          </Link>
          <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary">
            Join your neighborhood
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Create your account to get started
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-warm)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[var(--radius-input)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
                placeholder="Sarah Mitchell"
              />
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-text-primary mb-1">
                Display Name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                required
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
                placeholder="Sarah M."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[var(--radius-button)] bg-leaf-600 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-leaf-600 hover:text-leaf-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
