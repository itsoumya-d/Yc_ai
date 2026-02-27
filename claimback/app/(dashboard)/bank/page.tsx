import { fetchBankConnections, fetchDetectedFees, fetchFeeHistory } from '@/lib/actions/bank';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Landmark, Plus, AlertTriangle, TrendingDown, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function BankPage() {
  const [connectionsRes, feesRes, historyRes] = await Promise.all([
    fetchBankConnections(),
    fetchDetectedFees(),
    fetchFeeHistory(),
  ]);

  const connections = connectionsRes.success ? connectionsRes.data : [];
  const fees = feesRes.success ? feesRes.data : [];
  const history = historyRes.success ? historyRes.data : [];

  const totalFees = fees.reduce((sum, f) => sum + f.amount_cents, 0);
  const disputedFees = fees.filter((f) => f.is_disputed).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Bank Monitor</h1>
          <p className="text-text-secondary mt-1">Track bank fees and detect unnecessary charges</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-champion-100">
              <Landmark className="h-5 w-5 text-champion-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Connected Accounts</p>
              <p className="text-2xl font-bold text-text-primary">{connections.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Detected Fees</p>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalFees)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
              <TrendingDown className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Fees Disputed</p>
              <p className="text-2xl font-bold text-text-primary">{disputedFees}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connected Accounts */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Connected Accounts</h2>
        {connections.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <Landmark className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No bank accounts connected</p>
              <p className="text-sm text-text-muted mt-1">Connect your bank to automatically detect hidden fees</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <Card key={conn.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-champion-100">
                      <Landmark className="h-5 w-5 text-champion-600" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{conn.institution_name}</p>
                      <p className="text-sm text-text-secondary">
                        {conn.account_name ?? 'Account'} {conn.account_mask ? `****${conn.account_mask}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="green">Active</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detected Fees */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Recent Detected Fees</h2>
        {fees.length === 0 ? (
          <Card>
            <div className="p-6 text-center text-text-secondary">No fees detected yet</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {fees.slice(0, 10).map((fee) => (
              <Card key={fee.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{fee.description}</p>
                    <p className="text-sm text-text-secondary">{formatDate(fee.transaction_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-danger-600">{formatCurrency(fee.amount_cents)}</span>
                    {fee.is_disputed ? (
                      <Badge variant="green">Disputed</Badge>
                    ) : (
                      <Badge variant="amber">New</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fee History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Fee History (6 Months)</h2>
          <Card>
            <div className="p-4">
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.month} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{h.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-text-secondary">{h.count} fees</span>
                      <span className="font-medium text-danger-600">{formatCurrency(h.totalCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
