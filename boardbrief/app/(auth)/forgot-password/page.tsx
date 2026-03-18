'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(formData.get('email') as string, {
      redirectTo: `${window.location.origin}/callback`,
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-navy-800" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{t('checkEmail')}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('resetLinkSent')}</p>
        <Link href="/login"><Button variant="outline" className="mt-4">{t('backToSignIn')}</Button></Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-navy-800" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{t('resetPassword')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('resetPasswordDescription')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{t('email')}</label>
          <Input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? t('sending') : t('sendResetLink')}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/login" className="text-navy-800 hover:underline">{t('backToSignIn')}</Link>
      </p>
    </Card>
  );
}
