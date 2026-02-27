'use client';

import { useState, useTransition } from 'react';
import { cn, formatDate } from '@/lib/utils';
import {
  Clock,
  Plus,
  FileText,
  Landmark,
  AlertTriangle,
  User,
  DollarSign,
  MessageSquare,
  Flag,
  Trash2,
  X,
} from 'lucide-react';
import type { TimelineEvent } from '@/types/database';
import { createTimelineEvent, deleteTimelineEvent } from '@/lib/actions/timeline';
import type { TimelineEventType } from '@/lib/actions/timeline';

interface TimelineViewProps {
  caseId: string;
  initialEvents: TimelineEvent[];
}

const EVENT_TYPES: { value: TimelineEventType; label: string }[] = [
  { value: 'document_submitted', label: 'Document Submitted' },
  { value: 'pattern_detected', label: 'Pattern Detected' },
  { value: 'entity_identified', label: 'Entity Identified' },
  { value: 'court_filing', label: 'Court Filing' },
  { value: 'settlement_offer', label: 'Settlement Offer' },
  { value: 'investigation_step', label: 'Investigation Step' },
  { value: 'document', label: 'Document' },
  { value: 'payment', label: 'Payment' },
  { value: 'communication', label: 'Communication' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'milestone', label: 'Milestone' },
];

function getEventIcon(type: string) {
  switch (type) {
    case 'document_submitted':
    case 'document':
      return <FileText className="h-3.5 w-3.5" />;
    case 'court_filing':
    case 'regulatory':
      return <Landmark className="h-3.5 w-3.5" />;
    case 'pattern_detected':
      return <AlertTriangle className="h-3.5 w-3.5" />;
    case 'entity_identified':
      return <User className="h-3.5 w-3.5" />;
    case 'settlement_offer':
    case 'payment':
      return <DollarSign className="h-3.5 w-3.5" />;
    case 'communication':
      return <MessageSquare className="h-3.5 w-3.5" />;
    case 'investigation_step':
    case 'milestone':
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'court_filing':
    case 'regulatory':
      return 'bg-primary-muted text-primary-light';
    case 'pattern_detected':
      return 'bg-fraud-red-muted text-fraud-red';
    case 'settlement_offer':
    case 'payment':
      return 'bg-verified-green-muted text-verified-green';
    case 'entity_identified':
      return 'bg-accent-muted text-accent-light';
    case 'document_submitted':
    case 'document':
      return 'bg-info-muted text-info';
    case 'communication':
      return 'bg-warning-muted text-warning';
    default:
      return 'bg-bg-surface-raised text-text-secondary';
  }
}

function getEventTypeLabel(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function TimelineView({ caseId, initialEvents }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_type: 'investigation_step' as TimelineEventType,
    flagged: false,
    amount: '',
  });

  function handleFieldChange<K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddEvent() {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.event_date) {
      setFormError('Date is required');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const result = await createTimelineEvent(caseId, {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        event_type: formData.event_type,
        flagged: formData.flagged,
        amount: formData.amount ? parseFloat(formData.amount) : null,
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.data) {
        setEvents((prev) => [result.data!, ...prev]);
      }

      setFormData({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        event_type: 'investigation_step',
        flagged: false,
        amount: '',
      });
      setShowAddForm(false);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTimelineEvent(id, caseId);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-tertiary">{events.length} events</div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Event
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="rounded-xl border border-primary bg-bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-primary">Add Timeline Event</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-md p-1 text-text-tertiary hover:bg-bg-surface-raised"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. Pattern detected in Q4 invoices"
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleFieldChange('event_date', e.target.value)}
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe what happened..."
                rows={2}
                className="w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) =>
                    handleFieldChange('event_type', e.target.value as TimelineEventType)
                  }
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Amount (USD, optional)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="timeline-flagged"
                checked={formData.flagged}
                onChange={(e) => handleFieldChange('flagged', e.target.checked)}
                className="rounded border-border-default"
              />
              <label htmlFor="timeline-flagged" className="text-xs text-text-secondary">
                Flag this event as suspicious / high priority
              </label>
            </div>

            {formError && <p className="text-xs text-fraud-red">{formError}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isPending ? 'Adding...' : 'Add Event'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border-default px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      {events.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface">
          <Clock className="h-8 w-8 text-text-tertiary" />
          <p className="mt-2 text-sm text-text-tertiary">No timeline events yet</p>
          <p className="text-xs text-text-tertiary">
            Add events to track case activity chronologically
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-3 bottom-3 w-px bg-border-muted" />

          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-4">
                {/* Icon bubble */}
                <div
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-bg-base',
                    event.flagged ? 'bg-fraud-red-muted text-fraud-red' : 'bg-bg-surface-raised text-text-secondary'
                  )}
                >
                  {getEventIcon(event.event_type)}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:bg-bg-surface-raised group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{event.title}</span>
                        {event.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                            getEventTypeColor(event.event_type)
                          )}
                        >
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        {event.amount != null && event.amount > 0 && (
                          <span className="financial-figure rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-medium text-verified-green">
                            ${event.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-1 text-xs text-text-secondary">{event.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-bg-surface-raised px-2 py-1 text-[10px] font-mono text-text-tertiary">
                        {formatDate(event.event_date)}
                      </span>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={isPending}
                        className="hidden rounded-md p-1 text-text-tertiary transition-colors hover:bg-fraud-red-muted hover:text-fraud-red group-hover:block disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
