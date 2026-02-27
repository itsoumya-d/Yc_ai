'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Loader2, ShieldCheck } from 'lucide-react';
import { generatePolicy } from '@/lib/actions/policies';
import { useRouter } from 'next/navigation';
import type { FrameworkType } from '@/types/database';

const FRAMEWORK_OPTIONS: { value: FrameworkType; label: string }[] = [
  { value: 'soc2', label: 'SOC 2' },
  { value: 'gdpr', label: 'GDPR' },
  { value: 'hipaa', label: 'HIPAA' },
  { value: 'iso27001', label: 'ISO 27001' },
  { value: 'pci_dss', label: 'PCI DSS' },
];

const POLICY_TYPE_OPTIONS = [
  { value: 'access_control', label: 'Access Control Policy' },
  { value: 'data_retention', label: 'Data Retention Policy' },
  { value: 'incident_response', label: 'Incident Response Policy' },
  { value: 'acceptable_use', label: 'Acceptable Use Policy' },
  { value: 'encryption', label: 'Encryption Policy' },
  { value: 'vulnerability_management', label: 'Vulnerability Management Policy' },
  { value: 'vendor_management', label: 'Vendor Management Policy' },
  { value: 'business_continuity', label: 'Business Continuity Policy' },
  { value: 'change_management', label: 'Change Management Policy' },
  { value: 'privacy', label: 'Privacy Policy' },
];

interface GeneratePolicyDialogProps {
  orgId: string;
}

export function GeneratePolicyDialog({ orgId }: GeneratePolicyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [frameworkType, setFrameworkType] = useState<FrameworkType>('soc2');
  const [policyType, setPolicyType] = useState('access_control');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setOpen(true);
    setError(null);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const { error } = await generatePolicy(orgId, frameworkType, policyType);
      if (error) {
        setError(error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        Generate Policy with AI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900">Generate Policy with AI</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compliance Framework
                </label>
                <select
                  value={frameworkType}
                  onChange={e => setFrameworkType(e.target.value as FrameworkType)}
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 bg-white"
                >
                  {FRAMEWORK_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type
                </label>
                <select
                  value={policyType}
                  onChange={e => setPolicyType(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 bg-white"
                >
                  {POLICY_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {isPending && (
                <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <p className="text-sm text-blue-700">
                    Generating policy with GPT-4o… this may take up to 30 seconds.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isPending}
                className="flex-1 py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Policy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
