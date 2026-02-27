import { fetchDashboardStats, fetchRecentBills, fetchRecentDisputes } from '@/lib/actions/dashboard';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getBillStatusColor, getBillStatusLabel, getDisputeStatusColor, getDisputeStatusLabel } from '@/lib/utils';
import { DollarSign, Gavel, ScanLine, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const [statsRes, billsRes, disputesRes] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentBills(),
    fetchRecentDisputes(),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const bills = billsRes.success ? billsRes.data : [];
  const disputes = disputesRes.success ? disputesRes.data : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Dashboard</h1>
        <p className="text-text-secondary mt-1">Your savings at a glance</p>
      </div>

      {/* Savings Hero */}
      <Card className="bg-gradient-to-r from-champion-600 to-champion-700 text-white border-0">
        <div className="p-6">
          <p className="text-champion-100 text-sm font-medium">Total Saved</p>
          <p className="text-4xl font-bold font-heading mt-1">
            {formatCurrency(stats?.totalSavedCents ?? 0)}
          </p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-energy-100">
              <Gavel className="h-5 w-5 text-energy-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Disputes</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.activeDisputes ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-champion-100">
              <ScanLine className="h-5 w-5 text-champion-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Bills Scanned</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.billsScanned ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
              <TrendingUp className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Win Rate</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.winRate ?? 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary font-heading">Recent Bills</h2>
          <Link href="/scanner" className="text-sm text-champion-600 hover:text-champion-700">View all</Link>
        </div>
        {bills.length === 0 ? (
          <Card><div className="p-6 text-center text-text-secondary">No bills scanned yet. Scan your first bill to get started.</div></Card>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{bill.provider_name ?? 'Unknown Provider'}</p>
                    <p className="text-sm text-text-secondary">{formatDate(bill.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-text-primary">{formatCurrency(bill.total_amount_cents)}</span>
                    <Badge className={getBillStatusColor(bill.status)}>{getBillStatusLabel(bill.status)}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Disputes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary font-heading">Recent Disputes</h2>
          <Link href="/disputes" className="text-sm text-champion-600 hover:text-champion-700">View all</Link>
        </div>
        {disputes.length === 0 ? (
          <Card><div className="p-6 text-center text-text-secondary">No disputes yet. Scan a bill to find savings.</div></Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <Card key={dispute.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{dispute.provider_name}</p>
                    <p className="text-sm text-text-secondary">
                      Disputed: {formatCurrency(dispute.disputed_amount_cents)}
                    </p>
                  </div>
                  <Badge className={getDisputeStatusColor(dispute.status)}>
                    {getDisputeStatusLabel(dispute.status)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
