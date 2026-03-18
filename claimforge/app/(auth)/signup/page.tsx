'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
  const t = useTranslations('auth');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

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
      <h1 className="legal-heading text-lg text-text-primary">{t('signUp')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('signUpTagline')}</p>

      {error && (
        <div className="mt-4 rounded-lg bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
          {error}
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="mt-6 flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-border-default bg-bg-surface-raised text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {googleLoading ? t('redirecting') : t('continueWithGoogle')}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-surface px-2 text-[10px] text-text-tertiary">{t('orSignUpWithEmail')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t('firstName')}</label>
            <input
              type="text"
              name="first_name"
              required
              placeholder="First name"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t('lastName')}</label>
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
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t('organization')}</label>
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
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t('email')}</label>
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
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t('password')}</label>
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
          {loading ? t('creatingAccount') : t('signUp')}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-tertiary">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-text-link hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
