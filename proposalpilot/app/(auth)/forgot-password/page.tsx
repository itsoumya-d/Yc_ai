'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/callback` });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <CardTitle className="text-xl">{t('checkEmail')}</CardTitle>
          <CardDescription>{t('resetLinkSent', { email })}</CardDescription>
        </CardHeader>
        <CardContent><Link href="/login"><Button variant="outline" className="w-full">{t('backToSignIn')}</Button></Link></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100"><Send className="h-6 w-6 text-brand-600" /></div>
        <CardTitle className="text-xl">{t('resetPassword')}</CardTitle>
        <CardDescription>{t('resetDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <Input id="email" label={t('email')} type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t('sending') : t('sendResetLink')}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]"><Link href="/login" className="text-brand-600 hover:underline">{t('backToSignIn')}</Link></p>
      </CardContent>
    </Card>
  );
}
