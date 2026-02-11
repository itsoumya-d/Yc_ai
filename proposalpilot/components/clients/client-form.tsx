'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient_, updateClient_ } from '@/lib/actions/clients';
import type { Client } from '@/types/database';

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!client;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = isEditing
      ? await updateClient_(client.id, formData)
      : await createClient_(formData);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: isEditing ? 'Client updated' : 'Client added' });
    router.push(isEditing ? `/clients/${client.id}` : '/clients');
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Name *</label>
          <Input name="name" required defaultValue={client?.name ?? ''} placeholder="Client name" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Company</label>
            <Input name="company" defaultValue={client?.company ?? ''} placeholder="Company name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Industry</label>
            <Input name="industry" defaultValue={client?.industry ?? ''} placeholder="e.g. Technology, Healthcare" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
            <Input name="email" type="email" defaultValue={client?.email ?? ''} placeholder="client@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone</label>
            <Input name="phone" defaultValue={client?.phone ?? ''} placeholder="+1 (555) 123-4567" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Notes</label>
          <Textarea name="notes" rows={3} defaultValue={client?.notes ?? ''} placeholder="Notes about this client..." />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Client')}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
