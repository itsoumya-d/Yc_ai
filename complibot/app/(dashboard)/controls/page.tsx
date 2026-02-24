import { CheckSquare, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getControls } from '@/lib/actions/controls';
import { getFrameworks } from '@/lib/actions/frameworks';
import { UpdateStatusButton } from './update-status-button';
import type { ControlStatus, Framework } from '@/types/database';

const STATUS_CONFIG: Record<ControlStatus, { label: string }> = {
  compliant: { label: 'Compliant' },
  partial: { label: 'Partial' },
  non_compliant: { label: 'Non-Compliant' },
  not_applicable: { label: 'N/A' },
};

const FRAMEWORK_LABELS: Record<string, string> = {
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  hipaa: 'HIPAA',
  iso27001: 'ISO 27001',
  pci_dss: 'PCI DSS',
};

interface PageProps {
  searchParams: Promise<{ framework?: string; status?: string }>;
}

export default async function ControlsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [allControls, frameworks] = await Promise.all([
    getControls(params.framework ? { frameworkId: params.framework } : {}),
    getFrameworks(),
  ]);

  const enabledFrameworks = frameworks.filter(f => f.enabled);
  const frameworkMap = new Map(enabledFrameworks.map(f => [f.id, f]));

  const filtered = params.status
    ? allControls.filter(c => c.status === params.status)
    : allControls;

  // Group by category for display
  const byCategory = new Map<string, typeof filtered>();
  for (const control of filtered) {
    const existing = byCategory.get(control.category) ?? [];
    byCategory.set(control.category, [...existing, control]);
  }

  const statusCounts = {
    compliant: allControls.filter(c => c.status === 'compliant').length,
    partial: allControls.filter(c => c.status === 'partial').length,
    non_compliant: allControls.filter(c => c.status === 'non_compliant').length,
    not_applicable: allControls.filter(c => c.status === 'not_applicable').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controls</h1>
          <p className="text-sm text-gray-500 mt-1">
            {allControls.length} controls across {enabledFrameworks.length} frameworks
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Compliant', count: statusCounts.compliant, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Partial', count: statusCounts.partial, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Non-Compliant', count: statusCounts.non_compliant, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'N/A', count: statusCounts.not_applicable, color: 'bg-gray-50 border-gray-200 text-gray-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-lg border p-3 text-center ${color}`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Filter:</span>

        {/* Framework filter */}
        {enabledFrameworks.map(fw => (
          <a
            key={fw.id}
            href={params.framework === fw.id ? '/controls' : `/controls?framework=${fw.id}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              params.framework === fw.id
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {FRAMEWORK_LABELS[fw.framework_type] ?? fw.framework_type}
          </a>
        ))}

        <span className="text-gray-300">|</span>

        {/* Status filter */}
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <a
            key={status}
            href={params.status === status ? (params.framework ? `/controls?framework=${params.framework}` : '/controls') : (params.framework ? `/controls?framework=${params.framework}&status=${status}` : `/controls?status=${status}`)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              params.status === status
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cfg.label}
          </a>
        ))}
      </div>

      {/* No frameworks enabled */}
      {enabledFrameworks.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No frameworks enabled</p>
            <p className="text-sm text-gray-400 mt-1">
              <a href="/frameworks" className="text-blue-600 hover:underline">Enable a framework</a> to see its controls here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls list grouped by category */}
      {enabledFrameworks.length > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No controls match this filter.</p>
          </CardContent>
        </Card>
      )}

      {Array.from(byCategory.entries()).map(([category, controls]) => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 w-24">Code</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Control</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 w-28">Framework</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3 w-36">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {controls.map(control => {
                    const fw = frameworkMap.get(control.framework_id);
                    return (
                      <tr key={control.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono font-semibold text-gray-500">{control.control_code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{control.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{control.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          {fw && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {FRAMEWORK_LABELS[fw.framework_type] ?? fw.framework_type}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <UpdateStatusButton
                            controlId={control.id}
                            currentStatus={control.status}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
