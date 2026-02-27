'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Mail, Lock, ArrowRight } from 'lucide-react';
import { signIn } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result && !result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-brand-50 p-3">
            <BarChart3 className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">DealRoom</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-xl)] border border-border bg-white p-8 shadow-[var(--shadow-sm)]">
          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-[var(--radius-lg)] border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                Email address
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
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="pl-10"
                  autoComplete="current-password"
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
              {!loading && 'Sign In'}
              {!loading && <ArrowRight className="h-4 w-4" />}
              {loading && 'Signing in...'}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Start your free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
