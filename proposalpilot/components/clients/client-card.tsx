import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Building2, Mail, Phone } from 'lucide-react';
import type { Client } from '@/types/database';

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar name={client.name} />
          <div className="min-w-0">
            <h3 className="font-medium text-[var(--foreground)] truncate">{client.name}</h3>
            {client.company && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-[var(--muted-foreground)]" />
                <span className="text-sm text-[var(--muted-foreground)]">{client.company}</span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--muted-foreground)]">
              {client.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          </div>
          {client.industry && (
            <span className="ml-auto text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-1 rounded-full">{client.industry}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
