'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: { data: { full_name: formData.get('full_name') as string } },
    });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    toast({ title: 'Check your email to confirm your account.' });
    router.push('/login');
  }

  

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  };
return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-navy-800" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{t('createYourAccount')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('signUpDescription')}</p>
      </div>
      
        <button type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-xl py-3 mb-4 font-medium text-sm border border-border-default bg-bg-surface hover:bg-bg-surface-hover">
          <span className="text-blue-500 font-bold text-base">G</span> {t('signUpWithGoogle')}
        </button>
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-border-default" /><span className="text-xs text-text-tertiary">{t('orWithEmail')}</span><div className="flex-1 h-px bg-border-default" /></div>
<form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('name')}</label>
          <Input name="full_name" required placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('email')}</label>
          <Input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('password')}</label>
          <Input name="password" type="password" required minLength={8} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? t('signingUp') : t('createAccount')}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        {t('alreadyHaveAccount')} <Link href="/login" className="text-navy-800 hover:underline">{t('signIn')}</Link>
      </p>
    </Card>
  );
}
