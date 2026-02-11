'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createBrowserClient } from '@supabase/ssr';

interface ProfileFormProps {
  user: { email?: string; full_name?: string };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Profile updated' });
  }

  return (
    <Card className="p-6">
      <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-4">Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
          <Input value={user.email ?? ''} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Full Name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </Card>
  );
}
