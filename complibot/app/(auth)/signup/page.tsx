'use client';

import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import Link from 'next/link';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    const result = await signUp(formData);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-shield-50">
            <CheckCircle className="h-6 w-6 text-shield-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Check your email
          </h1>
          <p className="text-text-secondary">
            We sent you a confirmation link. Click it to activate your account
            and start automating your compliance.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-[var(--radius-button)] border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-tertiary"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
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
            Start your compliance journey
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create your account. 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Jane Smith"
              required
              autoComplete="name"
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-trust-600 focus:outline-none focus:ring-2 focus:ring-trust-600/20"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Work Email
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
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-trust-600 focus:outline-none focus:ring-2 focus:ring-trust-600/20"
            />
          </div>
          <div>
            <label
              htmlFor="org_name"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Organization Name
            </label>
            <input
              id="org_name"
              name="org_name"
              type="text"
              placeholder="Acme Inc."
              required
              autoComplete="organization"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-text-muted">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-trust-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
