import { fetchBills } from '@/lib/actions/scanner';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getBillTypeLabel, getConfidenceLabel, getConfidenceColor } from '@/lib/utils';
import { BarChart3, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';

export default async function AnalysisPage() {
  const billsRes = await fetchBills('analyzed');
  const bills = billsRes.success ? billsRes.data : [];

  const totalOvercharge = bills.reduce((sum, b) => sum + (b.overcharge_amount_cents ?? 0), 0);
  const avgConfidence = bills.length > 0
    ? bills.reduce((sum, b) => sum + (b.confidence_score ?? 0), 0) / bills.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Bill Analysis</h1>
        <p className="text-text-secondary mt-1">AI-detected overcharges and savings opportunities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Overcharges</p>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalOvercharge)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-champion-100">
              <BarChart3 className="h-5 w-5 text-champion-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Bills Analyzed</p>
              <p className="text-2xl font-bold text-text-primary">{bills.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
              <TrendingDown className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Confidence</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                {getConfidenceLabel(avgConfidence)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analyzed Bills */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Analyzed Bills</h2>
        {bills.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No analyzed bills yet</p>
              <p className="text-sm text-text-muted mt-1">Scan a bill to see AI analysis</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {bill.provider_name ?? getBillTypeLabel(bill.bill_type)}
                      </p>
                      <p className="text-sm text-text-secondary">{formatDate(bill.created_at)}</p>
                    </div>
                    <span className="font-semibold text-text-primary">{formatCurrency(bill.total_amount_cents)}</span>
                  </div>

                  {bill.overcharge_amount_cents && bill.overcharge_amount_cents > 0 ? (
                    <div className="mt-3 p-3 rounded-lg bg-danger-50 border border-danger-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-danger-600" />
                          <span className="text-sm font-medium text-danger-700">Overcharge Detected</span>
                        </div>
                        <span className="font-bold text-danger-600">
                          {formatCurrency(bill.overcharge_amount_cents)}
                        </span>
                      </div>
                      {bill.fair_amount_cents && (
                        <p className="text-xs text-danger-600 mt-1">
                          Fair price: {formatCurrency(bill.fair_amount_cents)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg bg-success-50 border border-success-200">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-success-600" />
                        <span className="text-sm font-medium text-success-700">No overcharges found</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
