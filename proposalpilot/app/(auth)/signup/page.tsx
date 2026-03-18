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

export default function SignupPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };
return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100"><Send className="h-6 w-6 text-brand-600" /></div>
        <CardTitle className="text-xl">{t('signUpTitle')}</CardTitle>
        <CardDescription>{t('signUpDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        
        <button type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-xl py-3 mb-4 font-medium text-sm border border-border-default bg-bg-surface hover:bg-bg-surface-hover">
          <span className="text-blue-500 font-bold text-base">G</span> {t('signUpWithGoogle')}
        </button>
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-border-default" /><span className="text-xs text-text-tertiary">{t('orWithEmail')}</span><div className="flex-1 h-px bg-border-default" /></div>
<form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <Input id="fullName" label={t('fullName')} placeholder={t('fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input id="email" label={t('email')} type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label={t('password')} type="password" placeholder={t('createPasswordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t('creatingAccount') : t('createAccount')}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">{t('alreadyHaveAccount')} <Link href="/login" className="text-brand-600 hover:underline">{t('signIn')}</Link></p>
      </CardContent>
    </Card>
  );
}
