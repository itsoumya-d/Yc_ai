'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types/database';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onUpdate?: () => void;
}

const statusConfig: Record<TaskStatus, {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  next: TaskStatus;
  nextLabel: string;
}> = {
  open: {
    icon: Circle,
    iconClass: 'text-slate-400',
    label: 'Open',
    next: 'in_progress',
    nextLabel: 'Start',
  },
  in_progress: {
    icon: Clock,
    iconClass: 'text-yellow-500',
    label: 'In Progress',
    next: 'completed',
    nextLabel: 'Complete',
  },
  completed: {
    icon: CheckCircle,
    iconClass: 'text-green-500',
    label: 'Completed',
    next: 'open',
    nextLabel: 'Reopen',
  },
  blocked: {
    icon: AlertCircle,
    iconClass: 'text-red-500',
    label: 'Blocked',
    next: 'in_progress',
    nextLabel: 'Unblock',
  },
};

const priorityVariant: Record<TaskPriority, 'destructive' | 'warning' | 'default' | 'outline'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'outline',
};

export function TaskList({ tasks, onUpdate }: TaskListProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleStatusChange = async (task: Task) => {
    const nextStatus = statusConfig[task.status].next;
    setUpdating(task.id);
    const { error } = await updateTaskStatus(task.id, nextStatus);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast(`Task ${nextStatus === 'completed' ? 'completed' : 'updated'}!`, 'success');
      onUpdate?.();
    }
    setUpdating(null);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    setDeleting(taskId);
    const { error } = await deleteTask(taskId);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Task deleted', 'success');
      onUpdate?.();
    }
    setDeleting(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const config = statusConfig[task.status];
        const Icon = config.icon;
        const isExpanded = expanded === task.id;
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

        return (
          <div
            key={task.id}
            className={cn(
              'rounded-lg border transition-colors',
              task.status === 'completed' ? 'border-green-100 bg-green-50/30' : 'border-slate-200 bg-white',
              isOverdue && 'border-red-200 bg-red-50/30'
            )}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => handleStatusChange(task)}
                disabled={updating === task.id}
                className="flex-shrink-0"
                title={config.nextLabel}
              >
                {updating === task.id ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <Icon className={cn('w-5 h-5 hover:opacity-70 transition-opacity', config.iconClass)} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-sm font-medium', task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900')}>
                    {task.title}
                  </span>
                  <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                  <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'outline'}>
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {task.assignee && (
                    <span className="text-xs text-slate-400">Assignee: {task.assignee}</span>
                  )}
                  {task.due_date && (
                    <span className={cn('text-xs', isOverdue ? 'text-red-500 font-medium' : 'text-slate-400')}>
                      {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(task.due_date)}
                    </span>
                  )}
                  <span className="text-xs text-slate-300">{formatRelativeDate(task.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {task.description && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : task.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={deleting === task.id}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  {deleting === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isExpanded && task.description && (
              <div className="px-12 pb-3">
                <p className="text-sm text-slate-600">{task.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
