import { Building, Plus, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const riskStats = [
  { label: 'Critical', value: 0, color: 'text-alert-700', bg: 'bg-alert-50', border: 'border-alert-200' },
  { label: 'High', value: 0, color: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-200' },
  { label: 'Medium', value: 0, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  { label: 'Low', value: 0, color: 'text-shield-700', bg: 'bg-shield-50', border: 'border-shield-200' },
];

const tableHeaders = ['Vendor', 'Risk', 'SOC 2', 'Review Due', 'Actions'];

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vendor Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track and assess third-party vendor risk
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-4 gap-4">
        {riskStats.map((stat) => (
          <Card key={stat.label} padding="sm" className={`border ${stat.border} ${stat.bg}`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Vendor Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <Building className="mb-3 h-10 w-10 text-text-muted" />
                    <p className="text-sm font-medium text-text-secondary">No vendors added</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Add your third-party vendors to track their compliance status and risk
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
