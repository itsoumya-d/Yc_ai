'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { ClientRevenueData } from '@/lib/actions/analytics';

interface TopClientsTableProps {
  clients: ClientRevenueData[];
}

const behaviorColors: Record<string, string> = {
  excellent: 'text-green-700 bg-green-100',
  good: 'text-blue-700 bg-blue-100',
  fair: 'text-yellow-700 bg-yellow-100',
  poor: 'text-red-700 bg-red-100',
};

export function TopClientsTable({ clients }: TopClientsTableProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">No client data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Clients by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Client</th>
                <th className="pb-3 text-right font-medium text-[var(--muted-foreground)]">Revenue</th>
                <th className="pb-3 text-right font-medium text-[var(--muted-foreground)]">Invoices</th>
                <th className="pb-3 text-right font-medium text-[var(--muted-foreground)]">Avg Value</th>
                <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Payment</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.client_id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{client.client_name}</p>
                      {client.company && (
                        <p className="text-xs text-[var(--muted-foreground)]">{client.company}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right font-medium text-[var(--foreground)]">
                    {formatCurrency(client.total_revenue)}
                  </td>
                  <td className="py-3 text-right text-[var(--muted-foreground)]">
                    {client.invoice_count}
                  </td>
                  <td className="py-3 text-right text-[var(--muted-foreground)]">
                    {formatCurrency(client.avg_invoice_value)}
                  </td>
                  <td className="py-3">
                    <Badge className={behaviorColors[client.payment_behavior]}>
                      {client.payment_behavior}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
