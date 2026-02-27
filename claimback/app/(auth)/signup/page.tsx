'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/actions/auth';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await signUp(formData);
      if (result && !result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-100 mx-auto mb-3">
            <Shield className="h-6 w-6 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Check your email</h1>
          <p className="text-sm text-text-secondary mt-2">
            We sent a confirmation link to your email. Click it to activate your account.
          </p>
          <Link href="/login" className="text-champion-600 hover:text-champion-700 font-medium text-sm mt-4 inline-block">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-champion-600 mb-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Create your account</h1>
          <p className="text-sm text-text-secondary mt-1">Start fighting unfair bills today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="full_name" type="text" label="Full Name" placeholder="Your name" />
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Password" placeholder="At least 8 characters" required minLength={8} />

          {error && (
            <p className="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-champion-600 hover:text-champion-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
