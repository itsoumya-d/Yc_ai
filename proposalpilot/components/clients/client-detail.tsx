'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import { deleteClient_ } from '@/lib/actions/clients';
import { formatDate } from '@/lib/utils';
import { Edit, Trash2, Building2, Mail, Phone, Globe, Calendar } from 'lucide-react';
import type { Client } from '@/types/database';

interface ClientDetailProps {
  client: Client;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this client? This will not delete related proposals.')) return;
    setDeleting(true);
    const result = await deleteClient_(client.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Client deleted' });
    router.push('/clients');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{client.name}</h1>
            {client.company && (
              <div className="flex items-center gap-1 mt-1 text-[var(--muted-foreground)]">
                <Building2 className="w-4 h-4" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}?edit=true`}>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Edit</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-1" />{deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Contact Info</h3>
          <div className="space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">{client.phone}</span>
              </div>
            )}
            {client.industry && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">{client.industry}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
              <span className="text-[var(--foreground)]">Added {formatDate(client.created_at)}</span>
            </div>
          </div>
        </Card>
        {client.notes && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Notes</h3>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{client.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
