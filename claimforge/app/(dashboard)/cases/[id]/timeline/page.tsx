'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  FileText,
  DollarSign,
  Mail,
  Flag,
  Star,
  Filter,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

type EventType = 'claim_submitted' | 'document' | 'adjuster' | 'payment' | 'communication' | 'decision' | 'milestone';
type FilterMode = 'all' | 'milestones' | 'documents';

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  time: string;
  title: string;
  description: string;
  actor?: string;
  attachments?: number;
  flagged?: boolean;
  isMilestone?: boolean;
}

const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bg: string }> = {
  claim_submitted: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  document: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  adjuster: { icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
  payment: { icon: DollarSign, color: 'text-fraud-red', bg: 'bg-red-100' },
  communication: { icon: Mail, color: 'text-orange-600', bg: 'bg-orange-100' },
  decision: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  milestone: { icon: Star, color: 'text-primary', bg: 'bg-primary-muted' },
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 't1',
    type: 'claim_submitted',
    date: '2024-01-15',
    time: '09:14',
    title: 'Claim submitted',
    description: 'Initial claim CF-2024-001 submitted via electronic portal. Claimant: Apex Health Systems. Estimated loss: $1.2M.',
    actor: 'System',
    isMilestone: true,
  },
  {
    id: 't2',
    type: 'document',
    date: '2024-01-18',
    time: '14:30',
    title: '12 documents uploaded',
    description: 'Initial supporting documentation received including billing records, service agreements, and Medicare remittance advice.',
    actor: 'Claimant Portal',
    attachments: 12,
  },
  {
    id: 't3',
    type: 'adjuster',
    date: '2024-01-22',
    time: '10:00',
    title: 'Adjuster assigned',
    description: 'Senior claims adjuster Sarah Chen assigned to lead investigation. Priority classification: HIGH.',
    actor: 'Claims Manager',
    isMilestone: true,
  },
  {
    id: 't4',
    type: 'document',
    date: '2024-02-05',
    time: '16:45',
    title: '45 documents processed',
    description: 'Batch OCR and AI extraction completed for Q4 2023 invoice bundle. 8 anomalies flagged for review.',
    actor: 'AI Engine',
    attachments: 45,
    flagged: true,
  },
  {
    id: 't5',
    type: 'milestone',
    date: '2024-02-28',
    time: '11:20',
    title: 'Entity network expanded',
    description: '12 new entities identified connecting Apex Health to shell companies. Graph analysis updated.',
    actor: 'Sarah Chen',
    isMilestone: true,
  },
  {
    id: 't6',
    type: 'communication',
    date: '2024-03-10',
    time: '09:00',
    title: 'Internal memo obtained',
    description: 'Whistleblower provided internal communications about billing practices. Documents secured under evidence protocol.',
    actor: 'Sarah Chen',
    attachments: 3,
    flagged: true,
  },
  {
    id: 't7',
    type: 'payment',
    date: '2024-03-15',
    time: '13:22',
    title: 'Suspicious payment detected',
    description: 'Medicare reimbursement of $125,000 to Apex Health — flagged as potentially inflated based on service code analysis.',
    actor: 'AI Engine',
    flagged: true,
  },
  {
    id: 't8',
    type: 'document',
    date: '2024-03-18',
    time: '17:00',
    title: '45 additional documents processed',
    description: 'Second batch OCR completed for Q4 2023 invoices (supplemental). Pattern recognition identified upcoding signatures.',
    actor: 'AI Engine',
    attachments: 45,
    flagged: true,
  },
  {
    id: 't9',
    type: 'milestone',
    date: '2024-03-20',
    time: '08:45',
    title: 'Critical upcoding pattern detected',
    description: 'AI detected systematic upcoding pattern with 97% confidence. 78% of office visits billed at highest complexity level vs. 12% industry average.',
    actor: 'AI Engine',
    isMilestone: true,
    flagged: true,
  },
  {
    id: 't10',
    type: 'decision',
    date: '2024-03-22',
    time: '14:00',
    title: 'Investigation escalated',
    description: 'Case escalated to Special Investigations Unit. External forensic accountant engaged. Subpoena preparation initiated.',
    actor: 'Claims Director',
    isMilestone: true,
  },
];

export default function EvidenceTimelinePage() {
  const params = useParams<{ id: string }>();
  const [filter, setFilter] = useState<FilterMode>('all');

  const filtered = TIMELINE_EVENTS.filter((e) => {
    if (filter === 'milestones') return e.isMilestone;
    if (filter === 'documents') return e.type === 'document';
    return true;
  });

  const flaggedCount = TIMELINE_EVENTS.filter((e) => e.flagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/cases/${params.id}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Case
          </Link>
          <div className="h-4 w-px bg-border-default" />
          <div>
            <h1 className="legal-heading text-lg text-text-primary">Evidence Timeline</h1>
            <p className="text-sm text-text-secondary">CF-2024-001 — Medicare Overbilling Investigation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {flaggedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-fraud-red-muted px-3 py-1 text-xs font-medium text-fraud-red">
              <Flag className="h-3.5 w-3.5" />
              {flaggedCount} flagged events
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <div className="text-[10px] text-text-tertiary">Total Events</div>
          <div className="mt-1 text-2xl font-semibold text-text-primary">{TIMELINE_EVENTS.length}</div>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <div className="text-[10px] text-text-tertiary">Key Milestones</div>
          <div className="mt-1 text-2xl font-semibold text-text-primary">
            {TIMELINE_EVENTS.filter((e) => e.isMilestone).length}
          </div>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <div className="text-[10px] text-text-tertiary">Documents</div>
          <div className="mt-1 text-2xl font-semibold text-text-primary">
            {TIMELINE_EVENTS.filter((e) => e.type === 'document').reduce((sum, e) => sum + (e.attachments ?? 0), 0)}
          </div>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <div className="text-[10px] text-text-tertiary flex items-center gap-1">
            <Flag className="h-3 w-3 text-fraud-red" /> Flagged
          </div>
          <div className="mt-1 text-2xl font-semibold text-fraud-red">{flaggedCount}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-text-tertiary" />
        <span className="text-sm text-text-secondary">Filter:</span>
        {(['all', 'milestones', 'documents'] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === mode
                ? 'bg-primary text-text-on-color'
                : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised'
            }`}
          >
            {mode === 'all' ? 'All Events' : mode === 'milestones' ? 'Key Milestones' : 'Documents Only'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border-default" />

        <div className="space-y-6">
          {filtered.map((event) => {
            const { icon: IconComponent, color, bg } = EVENT_CONFIG[event.type];
            const dateLabel = new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={event.id} className="relative flex gap-6 pl-0">
                {/* Icon */}
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg} border-2 ${event.flagged ? 'border-fraud-red' : 'border-bg-root'}`}>
                  <IconComponent className={`h-5 w-5 ${color}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 rounded-xl border bg-bg-surface p-4 ${event.flagged ? 'border-fraud-red/30' : 'border-border-default'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="legal-heading text-sm text-text-primary">{event.title}</span>
                        {event.isMilestone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Star className="h-2.5 w-2.5" /> Milestone
                          </span>
                        )}
                        {event.flagged && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-fraud-red-muted px-2 py-0.5 text-[10px] font-medium text-fraud-red">
                            <Flag className="h-2.5 w-2.5" /> Flagged
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary leading-relaxed">{event.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-text-tertiary">
                        {event.actor && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.actor}
                          </span>
                        )}
                        {event.attachments && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {event.attachments} attachment{event.attachments !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-medium text-text-secondary">{dateLabel}</div>
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-text-tertiary">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
