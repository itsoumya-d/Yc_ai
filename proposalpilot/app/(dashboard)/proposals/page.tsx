import Link from 'next/link';
import { getProposals } from '@/lib/actions/proposals';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalList } from '@/components/proposals/proposal-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const t = await getTranslations('proposals');
  const { data: proposals } = await getProposals();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={<Link href="/proposals/new"><Button><Plus className="w-4 h-4 mr-1" />{t('new')}</Button></Link>}
      />
      <ProposalList proposals={proposals ?? []} />
    </div>
  );
}
