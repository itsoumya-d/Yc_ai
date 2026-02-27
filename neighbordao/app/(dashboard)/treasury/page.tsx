import { DollarSign, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export default function TreasuryPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Neighborhood Treasury
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Transparent financial management for your community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="md">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-6" padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Current Balance</p>
            <p className="font-heading text-3xl font-bold text-text-primary mt-1">
              {formatCurrency(0)}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf-50">
            <DollarSign className="h-7 w-7 text-leaf-600" />
          </div>
        </div>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Income (This Month)</p>
              <p className="font-heading text-lg font-bold text-text-primary">{formatCurrency(0)}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Expenses (This Month)</p>
              <p className="font-heading text-lg font-bold text-text-primary">{formatCurrency(0)}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
              <TrendingUp className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Net (This Month)</p>
              <p className="font-heading text-lg font-bold text-text-primary">{formatCurrency(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card padding="md">
        <CardTitle className="mb-4">Recent Transactions</CardTitle>
        <div className="text-center py-8">
          <DollarSign className="mx-auto h-10 w-10 text-text-muted mb-3" />
          <p className="text-sm text-text-secondary">
            No transactions yet. Add income or expense entries to track community finances.
          </p>
        </div>
      </Card>
    </div>
  );
}
