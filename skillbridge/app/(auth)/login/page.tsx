'use client';

import { useState } from 'react';
import { signIn } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg font-heading">SB</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-stone-900 font-heading">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Sign in to continue your career journey
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-teal-600 font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
