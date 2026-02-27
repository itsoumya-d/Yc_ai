'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, User, Mail, Lock, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result && !result.success) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-brand-50 p-3">
            <BarChart3 className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">DealRoom</h1>
          <p className="mt-1 text-sm text-text-secondary">Create your account</p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="rounded-[var(--radius-xl)] border border-success-200 bg-success-50 p-8 text-center shadow-[var(--shadow-sm)]">
            <div className="mb-4 inline-flex items-center justify-center rounded-[var(--radius-full)] bg-success-100 p-3">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Check your email to confirm your account. We sent a verification link to get you
              started with your 14-day free trial.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Back to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Card */}
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-8 shadow-[var(--shadow-sm)]">
              {/* Free Trial Badge */}
              <div className="mb-6 rounded-[var(--radius-lg)] border border-success-200 bg-success-50 px-4 py-2.5 text-center">
                <p className="text-sm font-medium text-success-700">
                  14-day free trial &middot; No credit card required
                </p>
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-6 rounded-[var(--radius-lg)] border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="full_name"
                      type="text"
                      name="full_name"
                      required
                      placeholder="Jane Smith"
                      className="pl-10"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      placeholder="you@company.com"
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="org_name"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Organization name{' '}
                    <span className="font-normal text-text-muted">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="org_name"
                      type="text"
                      name="org_name"
                      placeholder="Your company name"
                      className="pl-10"
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  {!loading && 'Create Account'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                  {loading && 'Creating account...'}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-text-muted">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-brand-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-brand-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Footer Link */}
            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
