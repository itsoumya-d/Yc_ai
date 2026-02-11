import { StatCard } from '@/components/ui/stat-card';
import { FileText, Send, Trophy, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PipelineStatsProps {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  pipelineValue: number;
  wonValue: number;
}

export function PipelineStats({ totalProposals, sentCount, wonCount, pipelineValue, wonValue }: PipelineStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={FileText} label="Total Proposals" value={totalProposals.toString()} />
      <StatCard icon={Send} label="Sent / Active" value={sentCount.toString()} />
      <StatCard icon={Trophy} label="Won" value={wonCount.toString()} description={formatCurrency(wonValue)} />
      <StatCard icon={TrendingUp} label="Pipeline Value" value={formatCurrency(pipelineValue)} />
    </div>
  );
}
