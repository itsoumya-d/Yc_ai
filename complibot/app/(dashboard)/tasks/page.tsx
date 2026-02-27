'use client';

import { useState } from 'react';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  control?: string;
  framework?: string;
  assignee: string;
  due: string;
  severity?: string;
  status: TaskStatus;
  description: string;
}

const initialTasks: Record<TaskStatus, Task[]> = {
  todo: [
    { id: 't1', title: 'Enable MFA on all admin accounts', control: 'CC6.1', framework: 'SOC 2', assignee: 'John D.', due: '2025-03-15', severity: 'critical', status: 'todo', description: 'Enforce MFA for all 12 admin accounts in production' },
    { id: 't2', title: 'Implement account lockout policy', control: 'A.9.4.2', framework: 'ISO 27001', assignee: 'Sarah K.', due: '2025-03-20', severity: 'high', status: 'todo', description: 'Configure 5 failed attempt lockout across all systems' },
    { id: 't3', title: 'Update DPAs with sub-processors', control: 'Art.6', framework: 'GDPR', assignee: 'Legal', due: '2025-04-10', severity: 'medium', status: 'todo', description: 'Renew expired DPAs with 2 sub-processors' },
  ],
  in_progress: [
    { id: 't4', title: 'Perform database backup restore test', control: 'A.12.3.1', framework: 'ISO 27001', assignee: 'DevOps', due: '2025-03-25', severity: 'high', status: 'in_progress', description: 'Test full database restore in staging environment' },
    { id: 't5', title: 'Set up infrastructure drift monitoring', control: 'CC7.3', framework: 'SOC 2', assignee: 'DevOps', due: '2025-04-01', severity: 'high', status: 'in_progress', description: 'Configure AWS Config Rules for drift detection' },
  ],
  review: [
    { id: 't6', title: 'Update Access Control Policy', control: 'CC6.1', framework: 'SOC 2', assignee: 'CISO', due: '2025-03-12', severity: 'medium', status: 'review', description: 'Update policy to include cloud resource access guidelines' },
  ],
  done: [
    { id: 't7', title: 'Annual Security Training completed', control: 'CC1.1', framework: 'SOC 2', assignee: 'HR', due: '2025-03-01', severity: 'low', status: 'done', description: 'All 87 employees completed required security training' },
    { id: 't8', title: 'Vendor Risk Assessment — Stripe', control: 'CC9.2', framework: 'SOC 2', assignee: 'Security', due: '2025-02-28', severity: 'medium', status: 'done', description: 'Completed third-party risk review for Stripe integration' },
  ],
};

const columns: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: '#9CA3AF' },
  { key: 'in_progress', label: 'In Progress', color: '#D97706' },
  { key: 'review', label: 'In Review', color: '#7C3AED' },
  { key: 'done', label: 'Done', color: '#059669' },
];

const severityColors: Record<string, string> = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#2563EB' };

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragging, setDragging] = useState<string | null>(null);

  function moveTask(taskId: string, toStatus: TaskStatus) {
    setTasks(prev => {
      const next = { ...prev };
      let task: Task | undefined;
      (Object.keys(next) as TaskStatus[]).forEach(col => {
        const idx = next[col].findIndex(t => t.id === taskId);
        if (idx !== -1) { task = next[col][idx]; next[col] = next[col].filter(t => t.id !== taskId); }
      });
      if (task) next[toStatus] = [...next[toStatus], { ...task, status: toStatus }];
      return next;
    });
    setDragging(null);
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Compliance Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track remediation work across all frameworks.</p>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {columns.map(col => {
          const colTasks = tasks[col.key];
          return (
            <div
              key={col.key}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragging) moveTask(dragging, col.key); }}
              style={{ background: 'var(--bg-page)', borderRadius: 14, border: '1px solid var(--border-subtle)', minHeight: 400, display: 'flex', flexDirection: 'column' }}
            >
              {/* Column header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--border-subtle)', padding: '2px 8px', borderRadius: 10 }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: '10px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: '14px 14px',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'grab',
                      borderLeft: task.severity ? `3px solid ${severityColors[task.severity]}` : '3px solid transparent',
                      opacity: dragging === task.id ? 0.5 : 1,
                    }}
                  >
                    {task.severity && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: severityColors[task.severity], textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                        {task.severity}
                      </span>
                    )}
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{task.title}</div>
                    {task.control && (
                      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '1px 6px', borderRadius: 5 }}>{task.control}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.framework}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>👤 {task.assignee}</span>
                      <span>📅 {new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
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
