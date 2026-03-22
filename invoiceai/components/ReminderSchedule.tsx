'use client';

import { useState } from 'react';
import { Clock, Mail, Check } from 'lucide-react';

interface ReminderScheduleProps {
  invoiceId: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
  autoRemindEnabled?: boolean;
  onToggle?: (invoiceId: string, enabled: boolean) => Promise<void>;
}

const REMINDER_SCHEDULE = [
  { offset: -3, label: '3 days before due', type: 'pre' },
  { offset: 0, label: 'On due date', type: 'due' },
  { offset: 1, label: '1 day after due', type: 'post' },
  { offset: 7, label: '7 days overdue', type: 'post' },
];

export function ReminderSchedule({ invoiceId, dueDate, status, autoRemindEnabled = false, onToggle }: ReminderScheduleProps) {
  const [enabled, setEnabled] = useState(autoRemindEnabled);
  const [loading, setLoading] = useState(false);
  const due = new Date(dueDate);
  const now = new Date();

  const handleToggle = async () => {
    setLoading(true);
    const newState = !enabled;
    setEnabled(newState);
    await onToggle?.(invoiceId, newState);
    setLoading(false);
  };

  if (status === 'paid') return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--primary,#6366F1)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Auto-Reminders</span>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[var(--primary,#6366F1)]' : 'bg-[var(--muted,#E2E8F0)]'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {enabled && (
        <div className="space-y-2">
          {REMINDER_SCHEDULE.map((r) => {
            const reminderDate = new Date(due);
            reminderDate.setDate(reminderDate.getDate() + r.offset);
            const isPast = reminderDate < now;
            return (
              <div key={r.offset} className={`flex items-center gap-3 text-xs ${isPast ? 'opacity-50' : ''}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-green-100' : 'bg-[var(--muted,#F1F5F9)]'}`}>
                  {isPast ? <Check className="h-3 w-3 text-green-600" /> : <Clock className="h-3 w-3 text-[var(--muted-foreground,#64748B)]" />}
                </div>
                <span className="text-[var(--muted-foreground,#64748B)]">{r.label}</span>
                <span className="ml-auto text-[var(--foreground)]">{reminderDate.toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
