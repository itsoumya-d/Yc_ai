import { ClipboardList, LayoutGrid, List } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const columns = [
  { title: 'To Do', color: 'bg-gray-400' },
  { title: 'In Progress', color: 'bg-trust-500' },
  { title: 'In Review', color: 'bg-warn-500' },
  { title: 'Done', color: 'bg-shield-500' },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track and manage compliance remediation tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface">
            <button className="flex items-center gap-1.5 rounded-l-lg bg-trust-50 px-3 py-1.5 text-xs font-medium text-trust-700">
              <LayoutGrid className="h-3.5 w-3.5" />
              Board View
            </button>
            <button className="flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-secondary">
              <List className="h-3.5 w-3.5" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col">
            {/* Column Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
              <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>
              <span className="ml-auto rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-muted">
                0
              </span>
            </div>

            {/* Column Body - Empty State */}
            <Card className="flex flex-1 flex-col items-center justify-center border-dashed py-12">
              <ClipboardList className="mb-2 h-8 w-8 text-text-muted" />
              <p className="text-xs font-medium text-text-muted">No tasks</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
