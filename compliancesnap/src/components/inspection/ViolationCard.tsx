import { cn, getSeverityColor, getSeverityLabel, getSeverityBgColor, getStatusColor } from '@/lib/utils';
import type { SeverityLevel, ActionStatus } from '@/types/database';
import { AlertTriangle, Calendar, User, MapPin, BookOpen, ChevronRight, Clock } from 'lucide-react';

export interface ViolationCardData {
  id: string;
  title: string;
  description?: string;
  severity: SeverityLevel;
  regulation: string;
  location: string;
  assigned_to?: string;
  due_date?: string;
  status: ActionStatus;
  detected_at: string;
}

interface ViolationCardProps {
  violation: ViolationCardData;
  onPress?: () => void;
  compact?: boolean;
}

export function ViolationCard({ violation, onPress, compact = false }: ViolationCardProps) {
  const isOverdue = violation.status === 'overdue';

  return (
    <button
      onClick={onPress}
      className={cn(
        'w-full rounded-xl bg-bg-card overflow-hidden text-left transition-colors',
        onPress && 'hover:bg-bg-surface active:scale-[0.99]',
        isOverdue && 'ring-1 ring-severity-critical/30',
      )}
    >
      {/* Severity accent bar */}
      <div className={cn('h-1', `bg-severity-${violation.severity}`)} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', getSeverityBgColor(violation.severity))}>
              <AlertTriangle className={cn('h-4 w-4', `text-severity-${violation.severity}`)} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary leading-snug">{violation.title}</span>
              {!compact && violation.description && (
                <p className="mt-0.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {violation.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(violation.severity))}>
              {getSeverityLabel(violation.severity)}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-medium capitalize', getStatusColor(violation.status))}>
              {violation.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <BookOpen className="h-3 w-3 shrink-0 text-info" />
              <span className="snap-code text-info">{violation.regulation}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin className="h-3 w-3 shrink-0" />
              {violation.location}
            </div>
            {violation.assigned_to && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <User className="h-3 w-3 shrink-0" />
                {violation.assigned_to}
              </div>
            )}
            {violation.due_date && (
              <div className={cn('flex items-center gap-1.5 text-xs', isOverdue ? 'text-severity-critical' : 'text-text-secondary')}>
                {isOverdue ? <Clock className="h-3 w-3 shrink-0" /> : <Calendar className="h-3 w-3 shrink-0" />}
                Due: {violation.due_date}
              </div>
            )}
          </div>
        )}

        {compact && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="snap-code text-info">{violation.regulation}</span>
              <span>{violation.location}</span>
            </div>
            {onPress && <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />}
          </div>
        )}
      </div>
    </button>
  );
}
