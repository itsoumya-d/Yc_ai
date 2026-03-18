import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeTime, getStatusLabel } from '@/lib/utils';
import type { ProposalWithClient, ProposalStatus } from '@/types/database';
import { getTranslations } from 'next-intl/server';

interface RecentProposalsProps {
  proposals: ProposalWithClient[];
}

export async function RecentProposals({ proposals }: RecentProposalsProps) {
  const t = await getTranslations('dashboard');
  if (proposals.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-4">{t('recentProposals')}</h3>
      <div className="space-y-3">
        {proposals.map((p) => (
          <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center justify-between py-2 hover:bg-[var(--muted)] -mx-2 px-2 rounded-lg transition-colors">
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--foreground)] truncate">{p.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {p.clients?.name ?? t('noClient')} · {formatRelativeTime(p.updated_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-mono-pricing text-[var(--foreground)]">{formatCurrency(p.value, p.currency)}</span>
              <Badge variant={p.status as ProposalStatus}>{getStatusLabel(p.status)}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
