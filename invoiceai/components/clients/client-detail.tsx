'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { ClientFormDialog } from './client-form-dialog';
import { archiveClientAction, restoreClientAction, deleteClientAction } from '@/lib/actions/clients';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Client } from '@/types/database';

interface ClientDetailProps {
  client: Client;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleArchive = async () => {
    setActionLoading(true);
    const result =
      client.status === 'archived'
        ? await restoreClientAction(client.id)
        : await archiveClientAction(client.id);
    setActionLoading(false);

    if (result.success) {
      toast({
        title: client.status === 'archived' ? 'Client restored' : 'Client archived',
        variant: 'success',
      });
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
    setActionLoading(true);
    const result = await deleteClientAction(client.id);
    setActionLoading(false);

    if (result.success) {
      toast({ title: 'Client deleted', variant: 'success' });
      router.push('/clients');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const healthLabels: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    at_risk: 'At Risk',
    unknown: 'Unknown',
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/clients')}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <Avatar name={client.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                {client.name}
              </h1>
              {client.health_score !== 'unknown' && (
                <Badge variant={client.health_score as 'excellent' | 'good' | 'fair' | 'at_risk'}>
                  {healthLabels[client.health_score]}
                </Badge>
              )}
              {client.status === 'archived' && (
                <Badge variant="draft">Archived</Badge>
              )}
            </div>
            {client.company && (
              <p className="text-sm text-[var(--muted-foreground)]">{client.company}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={actionLoading}
          >
            {client.status === 'archived' ? 'Restore' : 'Archive'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Billed"
          value={formatCurrency(client.total_billed)}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(client.total_paid)}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(client.total_outstanding)}
        />
        <StatCard
          title="Avg. Days to Pay"
          value={
            client.average_days_to_pay != null
              ? `${client.average_days_to_pay} days`
              : 'N/A'
          }
        />
      </div>

      {/* Details */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Email</p>
              <p className="text-sm">{client.email}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Phone</p>
                <p className="text-sm">{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Address</p>
                <p className="text-sm">{client.address}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Currency</p>
              <p className="text-sm">{client.default_currency}</p>
            </div>
            {client.default_payment_terms && (
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">
                  Payment Terms
                </p>
                <p className="text-sm">Net {client.default_payment_terms}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">
                Client Since
              </p>
              <p className="text-sm">{formatDate(client.created_at, 'long')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {client.invoice_count === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                No invoices yet for this client.
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                {client.invoice_count} invoice{client.invoice_count !== 1 ? 's' : ''} created.
                Invoice history will appear here once the invoice system is built.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {client.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <ClientFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        client={client}
      />
    </>
  );
}
