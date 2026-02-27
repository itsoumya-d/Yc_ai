'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/actions/auth';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
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
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-electric-600 mb-3">
            <Box className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Create account</h1>
          <p className="text-sm text-text-secondary mt-1">Start managing your inventory with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="full_name" type="text" label="Full Name" placeholder="John Doe" required />
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Password" placeholder="At least 8 characters" required />

          {error && (
            <p className="text-sm text-out-400 bg-out-900/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-electric-400 hover:text-electric-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
