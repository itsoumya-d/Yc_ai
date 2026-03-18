'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/callback` } });
  }

  async function handleGitHubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/callback` } });
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-navy-800" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{t('signIn')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('signInDescription')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('email')}</label>
          <Input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('password')}</label>
          <Input name="password" type="password" required placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? t('signingIn') : t('signIn')}</Button>
      </form>
      <div className="mt-4">
        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div><div className="relative flex justify-center text-xs"><span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">or</span></div></div>
        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>{t('continueWithGoogle')}</Button>
        <Button type="button" variant="outline" className="w-full mt-2" onClick={handleGitHubLogin}>{t('continueWithGitHub')}</Button>
      </div>
      <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/forgot-password" className="text-navy-800 hover:underline">{t('forgotPassword')}</Link>
        <span className="mx-2">·</span>
        <Link href="/signup" className="text-navy-800 hover:underline">{t('createAccount')}</Link>
      </div>
    </Card>
  );
}
