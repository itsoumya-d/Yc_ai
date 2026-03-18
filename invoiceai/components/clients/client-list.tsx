'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { ClientFormDialog } from './client-form-dialog';
import { CSVImport } from '@/components/CSVImport';
import { formatCurrency } from '@/lib/utils';
import type { Client } from '@/types/database';

interface ClientListProps {
  initialClients: Client[];
  totalCount: number;
}

type FilterStatus = 'active' | 'archived' | 'all';

export function ClientList({ initialClients, totalCount }: ClientListProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [search, setSearch] = useState('');

  const filteredClients = initialClients.filter((client) => {
    if (filterStatus !== 'all' && client.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        (client.company?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const filterTabs: { label: string; value: FilterStatus }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
    { label: 'All', value: 'all' },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Client',
      render: (client: Client) => (
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="sm" />
          <div>
            <p className="font-medium text-[var(--foreground)]">{client.name}</p>
            {client.company && (
              <p className="text-xs text-[var(--muted-foreground)]">{client.company}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (client: Client) => (
        <span className="text-[var(--muted-foreground)]">{client.email}</span>
      ),
    },
    {
      key: 'total_billed',
      header: 'Total Billed',
      sortable: true,
      render: (client: Client) => (
        <span className="font-amount">{formatCurrency(client.total_billed)}</span>
      ),
    },
    {
      key: 'total_outstanding',
      header: 'Outstanding',
      sortable: true,
      render: (client: Client) => (
        <span className={`font-amount ${client.total_outstanding > 0 ? 'text-amber-600' : ''}`}>
          {formatCurrency(client.total_outstanding)}
        </span>
      ),
    },
    {
      key: 'invoice_count',
      header: 'Invoices',
      sortable: true,
      render: (client: Client) => (
        <span className="text-[var(--muted-foreground)]">{client.invoice_count}</span>
      ),
    },
    {
      key: 'health_score',
      header: 'Health',
      render: (client: Client) => {
        if (client.health_score === 'unknown') return null;
        const labels: Record<string, string> = {
          excellent: 'Excellent',
          good: 'Good',
          fair: 'Fair',
          at_risk: 'At Risk',
        };
        return (
          <Badge variant={client.health_score as 'excellent' | 'good' | 'fair' | 'at_risk'}>
            {labels[client.health_score] ?? client.health_score}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Clients</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {totalCount} {totalCount === 1 ? 'client' : 'clients'} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCSVImport((v) => !v)}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Import CSV
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Client
          </Button>
        </div>
      </div>

      {showCSVImport && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Import Clients from CSV</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Upload a CSV file with columns: name, email, company, phone</p>
            </div>
            <button
              onClick={() => setShowCSVImport(false)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CSVImport type="clients" />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-[var(--muted)] p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filterStatus === tab.value
                  ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredClients}
          keyExtractor={(c) => c.id}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
          emptyState={
            <EmptyState
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              }
              title={search ? 'No clients found' : 'No clients yet'}
              description={
                search
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first client to start creating invoices and tracking payments.'
              }
              action={
                !search ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Add Your First Client
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </div>

      <ClientFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
