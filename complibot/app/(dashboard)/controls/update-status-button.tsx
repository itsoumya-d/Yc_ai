'use client';

import { useState } from 'react';
import { updateControlStatus } from '@/lib/actions/controls';
import type { ControlStatus } from '@/types/database';

const STATUS_OPTIONS: { value: ControlStatus; label: string; color: string }[] = [
  { value: 'compliant', label: 'Compliant', color: 'bg-emerald-600' },
  { value: 'partial', label: 'Partial', color: 'bg-amber-500' },
  { value: 'non_compliant', label: 'Non-Compliant', color: 'bg-red-600' },
  { value: 'not_applicable', label: 'N/A', color: 'bg-gray-400' },
];

interface UpdateStatusButtonProps {
  controlId: string;
  currentStatus: ControlStatus;
}

export function UpdateStatusButton({ controlId, currentStatus }: UpdateStatusButtonProps) {
  const [status, setStatus] = useState<ControlStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleUpdate(newStatus: ControlStatus) {
    if (newStatus === status) { setOpen(false); return; }
    setLoading(true);
    const result = await updateControlStatus(controlId, newStatus);
    setLoading(false);
    if (!result.error) setStatus(newStatus);
    setOpen(false);
  }

  const current = STATUS_OPTIONS.find(s => s.value === status)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className={`${current.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap disabled:opacity-60 transition-opacity`}
      >
        {loading ? '...' : current.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleUpdate(opt.value)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${opt.value === status ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.color} shrink-0`} />
                {opt.label}
                {opt.value === status && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
