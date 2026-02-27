'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trees } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsGoogleLoading(false);
    }
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
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Sign in to your NeighborDAO account
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

          {/* Login form */}
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

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-label="Password"
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-leaf-600 hover:text-leaf-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">
                or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            isLoading={isGoogleLoading}
            className="w-full"
            onClick={handleGoogleSignIn}
            aria-label="Sign in with Google"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </div>
      </div>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-leaf-600 hover:text-leaf-700 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
