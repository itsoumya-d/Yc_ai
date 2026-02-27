'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSeverityColor, formatDate } from '@/lib/utils';
import { CheckSquare, Clock, User, AlertCircle } from 'lucide-react';
import type { TaskStatus } from '@/types';

const STATUS_COLS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'border-border' },
  { status: 'in_progress', label: 'In Progress', color: 'border-primary' },
  { status: 'blocked', label: 'Blocked', color: 'border-red-400' },
  { status: 'done', label: 'Done', color: 'border-green-400' },
];

const FW_NAMES: Record<string, string> = { soc2: 'SOC 2', gdpr: 'GDPR', hipaa: 'HIPAA', iso27001: 'ISO 27001' };
const FW_COLORS: Record<string, string> = { soc2: 'bg-indigo-100 text-indigo-700', gdpr: 'bg-cyan-100 text-cyan-700', hipaa: 'bg-green-100 text-green-700', iso27001: 'bg-purple-100 text-purple-700' };

export default function TasksPage() {
  const { tasks, updateTaskStatus } = useAppStore();

  const isOverdue = (t: typeof tasks[0]) => t.status !== 'done' && new Date(t.due_date) < new Date();

  return (
    <div className="p-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
        <p className="text-sm text-text-secondary mt-1">{tasks.filter(t => t.status !== 'done').length} open tasks</p>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-4 gap-4">
        {STATUS_COLS.map(({ status, label, color }) => {
          const colTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className={`rounded-xl border-t-2 ${color} bg-surface p-3 min-h-96`}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</h3>
                <span className="rounded-full bg-border px-2 py-0.5 text-xs text-text-tertiary">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div key={task.id} className={`rounded-lg border bg-card p-3 shadow-sm ${isOverdue(task) ? 'border-red-200' : 'border-border'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getSeverityColor(task.priority)}`}>{task.priority}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FW_COLORS[task.framework]}`}>{FW_NAMES[task.framework]}</span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary mb-1">{task.title}</p>
                    <p className="text-[10px] text-text-tertiary line-clamp-2 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                      <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{task.assignee.split(' ')[0]}</span>
                      <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : ''}`}>
                        <Clock className="h-2.5 w-2.5" />{formatDate(task.due_date)}
                      </span>
                    </div>
                    {task.status !== 'done' && (
                      <div className="mt-2 flex gap-1">
                        {task.status === 'todo' && (
                          <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="text-[10px] rounded px-2 py-1 bg-primary/10 text-primary font-medium hover:bg-primary/20 transition">Start</button>
                        )}
                        {task.status === 'in_progress' && (
                          <button onClick={() => updateTaskStatus(task.id, 'done')} className="text-[10px] rounded px-2 py-1 bg-green-100 text-green-700 font-medium hover:bg-green-200 transition">Complete</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
