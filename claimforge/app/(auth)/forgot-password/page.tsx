'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8 shadow-lg">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Email Sent</h1>
            <p className="text-text-secondary">
              Check {email} for a password reset link. It expires in 24 hours.
            </p>
            <Link href="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Forgot Password?</h1>
            <p className="text-sm text-text-secondary mb-6">
              Enter your email address and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@organization.com"
                    className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
