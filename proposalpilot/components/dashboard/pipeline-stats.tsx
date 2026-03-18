import { StatCard } from '@/components/ui/stat-card';
import { FileText, Send, Trophy, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

interface PipelineStatsProps {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  pipelineValue: number;
  wonValue: number;
}

export async function PipelineStats({ totalProposals, sentCount, wonCount, pipelineValue, wonValue }: PipelineStatsProps) {
  const t = await getTranslations('dashboard');
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={FileText} label={t('totalProposals')} value={totalProposals.toString()} />
      <StatCard icon={Send} label={t('sentActive')} value={sentCount.toString()} />
      <StatCard icon={Trophy} label={t('won')} value={wonCount.toString()} description={formatCurrency(wonValue)} />
      <StatCard icon={TrendingUp} label={t('pipelineValue')} value={formatCurrency(pipelineValue)} />
    </div>
  );
}
