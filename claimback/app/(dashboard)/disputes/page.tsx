import { fetchDisputes } from '@/lib/actions/disputes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getDisputeStatusColor, getDisputeStatusLabel } from '@/lib/utils';
import { Gavel, Trophy, Clock, AlertCircle } from 'lucide-react';

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

export default async function DisputesPage() {
  const disputesRes = await fetchDisputes();
  const disputes = disputesRes.success ? disputesRes.data : [];

  const active = disputes.filter((d) =>
    ['draft', 'letter_sent', 'calling', 'waiting', 'negotiating', 'escalated'].includes(d.status)
  );
  const won = disputes.filter((d) => d.status === 'won' || d.status === 'partial');
  const lost = disputes.filter((d) => d.status === 'lost');
  const totalSaved = won.reduce((sum, d) => sum + (d.savings_cents ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Disputes</h1>
        <p className="text-text-secondary mt-1">Track and manage your bill disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Clock className="h-5 w-5 text-energy-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text-primary">{active.length}</p>
            <p className="text-xs text-text-secondary">Active</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Trophy className="h-5 w-5 text-success-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-success-600">{won.length}</p>
            <p className="text-xs text-text-secondary">Won</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <AlertCircle className="h-5 w-5 text-danger-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text-primary">{lost.length}</p>
            <p className="text-xs text-text-secondary">Lost</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Gavel className="h-5 w-5 text-champion-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-success-600">{formatCurrency(totalSaved)}</p>
            <p className="text-xs text-text-secondary">Total Saved</p>
          </div>
        </Card>
      </div>

      {/* Active Disputes */}
      {active.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Active Disputes</h2>
          <div className="space-y-3">
            {active.map((dispute) => (
              <Card key={dispute.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{dispute.provider_name}</p>
                      <p className="text-sm text-text-secondary">{formatDate(dispute.created_at)}</p>
                    </div>
                    <Badge className={getDisputeStatusColor(dispute.status)}>
                      {getDisputeStatusLabel(dispute.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-text-secondary">
                      Original: {formatCurrency(dispute.original_amount_cents)}
                    </span>
                    <span className="font-medium text-danger-600">
                      Disputed: {formatCurrency(dispute.disputed_amount_cents)}
                    </span>
                  </div>
                  {dispute.response_deadline && (
                    <p className="text-xs text-caution-600 mt-2">
                      Response deadline: {formatDate(dispute.response_deadline)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Disputes */}
      {(won.length > 0 || lost.length > 0) && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Completed</h2>
          <div className="space-y-3">
            {[...won, ...lost].map((dispute) => (
              <Card key={dispute.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{dispute.provider_name}</p>
                    <p className="text-sm text-text-secondary">
                      {dispute.savings_cents && dispute.savings_cents > 0
                        ? `Saved ${formatCurrency(dispute.savings_cents)}`
                        : formatDate(dispute.created_at)}
                    </p>
                  </div>
                  <Badge className={getDisputeStatusColor(dispute.status)}>
                    {getDisputeStatusLabel(dispute.status)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {disputes.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Gavel className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No disputes yet</p>
            <p className="text-sm text-text-muted mt-1">Scan a bill to find overcharges and start disputing</p>
          </div>
        </Card>
      )}
    </div>
  );
}
