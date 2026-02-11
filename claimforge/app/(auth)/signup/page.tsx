'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Combine first + last name
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    formData.set('full_name', `${firstName} ${lastName}`.trim());

    const result = await signUp(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-8">
      <h1 className="legal-heading text-lg text-text-primary">Create Account</h1>
      <p className="mt-1 text-sm text-text-secondary">Start your fraud investigation platform</p>

      {error && (
        <div className="mt-4 rounded-lg bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">First Name</label>
            <input
              type="text"
              name="first_name"
              required
              placeholder="First name"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Last Name</label>
            <input
              type="text"
              name="last_name"
              required
              placeholder="Last name"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Organization</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              name="organization"
              required
              placeholder="Law firm or organization name"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Work Email</label>
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
              minLength={8}
              placeholder="Minimum 8 characters"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border-muted bg-bg-surface-raised p-3">
          <label className="flex items-start gap-2 text-xs text-text-secondary">
            <input type="checkbox" required className="mt-0.5 rounded border-border-default" />
            <span>
              I agree to the Terms of Service and acknowledge that all data is handled
              in accordance with attorney-client privilege protections and SOC 2 compliance standards.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-tertiary">
        Already have an account?{' '}
        <Link href="/login" className="text-text-link hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
