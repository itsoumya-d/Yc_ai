import { fetchBills } from '@/lib/actions/scanner';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getBillStatusColor, getBillStatusLabel, getBillTypeLabel } from '@/lib/utils';
import { Camera, Upload, FileText, Heart, Landmark, Shield, Zap, Wifi } from 'lucide-react';
import Link from 'next/link';

const billTypes = [
  { value: 'medical', label: 'Medical', icon: Heart, color: 'bg-danger-100 text-danger-600' },
  { value: 'bank', label: 'Bank Fee', icon: Landmark, color: 'bg-champion-100 text-champion-600' },
  { value: 'insurance', label: 'Insurance', icon: Shield, color: 'bg-caution-100 text-caution-600' },
  { value: 'utility', label: 'Utility', icon: Zap, color: 'bg-energy-100 text-energy-600' },
  { value: 'telecom', label: 'Telecom', icon: Wifi, color: 'bg-success-100 text-success-600' },
  { value: 'other', label: 'Other', icon: FileText, color: 'bg-surface-secondary text-text-secondary' },
];

export default async function ScannerPage() {
  const billsRes = await fetchBills();
  const bills = billsRes.success ? billsRes.data : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Scan Bill</h1>
        <p className="text-text-secondary mt-1">Upload or photograph a bill to analyze for overcharges</p>
      </div>

      {/* Scan Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-champion-300 transition-colors">
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champion-100">
              <Camera className="h-6 w-6 text-champion-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Take Photo</p>
              <p className="text-xs text-text-secondary mt-0.5">Use camera to scan</p>
            </div>
          </div>
        </Card>

        <Card className="cursor-pointer hover:border-champion-300 transition-colors">
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-energy-100">
              <Upload className="h-6 w-6 text-energy-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Upload File</p>
              <p className="text-xs text-text-secondary mt-0.5">PDF, image, or photo</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bill Type Selector */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Bill Type</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {billTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.value}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-champion-300 cursor-pointer transition-colors"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${type.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-text-primary">{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Scans */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">Recent Scans</h2>
        {bills.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <ScanIcon className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No bills scanned yet</p>
              <p className="text-sm text-text-muted mt-1">Upload or photograph a bill to get started</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {bill.provider_name ?? getBillTypeLabel(bill.bill_type)}
                      </p>
                      <p className="text-sm text-text-secondary">{formatDate(bill.created_at)}</p>
                    </div>
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
    </div>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return <FileText className={className} />;
}
