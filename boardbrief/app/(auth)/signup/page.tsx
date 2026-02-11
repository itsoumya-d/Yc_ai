'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
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

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-navy-800" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Create your BoardBrief account</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Start preparing smarter board meetings.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Full Name</label>
          <Input name="full_name" required placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
          <Input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Password</label>
          <Input name="password" type="password" required minLength={8} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account? <Link href="/login" className="text-navy-800 hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
