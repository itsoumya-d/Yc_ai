'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Trees, Mail, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${location.origin}/callback`,
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-card">
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf-50 text-leaf-600 dark:bg-leaf-900 dark:text-leaf-400">
                <span title="Check your email">
                  <Mail className="h-7 w-7" />
                </span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                If an account exists for{' '}
                <span className="font-medium text-[var(--foreground)]">{email}</span>,
                you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-leaf-600 hover:text-leaf-700 transition-colors"
              >
                <span title="Back">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-card">
        <div className="p-8">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-600 text-white">
              <span title="NeighborDAO">
                <Trees className="h-6 w-6" />
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Reset form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-label="Email address"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Send Reset Link
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-600 hover:text-leaf-700 transition-colors"
            >
              <span title="Back">
                <ArrowLeft className="h-4 w-4" />
              </span>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
