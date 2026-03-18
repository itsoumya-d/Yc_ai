'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleGitHubLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
          <Send className="h-6 w-6 text-brand-600" />
        </div>
        <CardTitle className="text-xl">{t('signInTitle')}</CardTitle>
        <CardDescription>{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <Input id="email" label={t('email')} type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label={t('password')} type="password" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="flex justify-end"><Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">{t('forgotPassword')}</Link></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t('signingIn') : t('signIn')}</Button>
        </form>
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">{t('orContinueWith')}</span></div></div>
        <Button variant="outline" className="w-full mb-2" onClick={handleGoogleLogin} type="button">{t('continueWithGoogle')}</Button>
        <Button variant="outline" className="w-full" onClick={handleGitHubLogin} type="button">{t('continueWithGitHub')}</Button>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">{t('noAccount')} <Link href="/signup" className="text-brand-600 hover:underline">{t('signUp')}</Link></p>
      </CardContent>
    </Card>
  );
}
