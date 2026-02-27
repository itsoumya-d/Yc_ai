'use client';

import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Check your email
          </h1>
          <p className="text-stone-500">
            We sent you a confirmation link. Click it to activate your account and start your career journey.
          </p>
          <Link href="/login">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
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
            Start your career transition
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Create a free account. No credit card required.
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            type="text"
            placeholder="Your full name"
            required
            autoComplete="name"
          />
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
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
