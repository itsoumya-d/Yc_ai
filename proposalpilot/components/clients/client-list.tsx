import { ClientCard } from './client-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import type { Client } from '@/types/database';

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add your first client to start creating proposals."
        action={{ label: 'Add Client', href: '/clients/new' }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
