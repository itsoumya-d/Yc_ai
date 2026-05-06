import { cn } from '@/lib/utils';
import { getRoleBadgeColor } from '@/lib/utils';
import { Users, Plus, Mail, Shield, MoreHorizontal, Search } from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Victoria Ashworth', email: 'v.ashworth@firm.com', role: 'admin' as const, avatar: 'VA', active: 14, completed: 67, lastActive: '2 min ago', status: 'online' as const },
  { id: '2', name: 'Marcus Chen', email: 'm.chen@firm.com', role: 'editor' as const, avatar: 'MC', active: 9, completed: 43, lastActive: '15 min ago', status: 'online' as const },
  { id: '3', name: 'Sarah Mitchell', email: 's.mitchell@firm.com', role: 'reviewer' as const, avatar: 'SM', active: 11, completed: 52, lastActive: '1 hr ago', status: 'away' as const },
  { id: '4', name: 'James Rivera', email: 'j.rivera@firm.com', role: 'editor' as const, avatar: 'JR', active: 7, completed: 31, lastActive: '3 hr ago', status: 'offline' as const },
  { id: '5', name: 'Elena Volkov', email: 'e.volkov@firm.com', role: 'reviewer' as const, avatar: 'EV', active: 5, completed: 28, lastActive: '30 min ago', status: 'online' as const },
  { id: '6', name: 'David Park', email: 'd.park@firm.com', role: 'viewer' as const, avatar: 'DP', active: 2, completed: 12, lastActive: '1 day ago', status: 'offline' as const },
];

const rolePermissions = [
  { role: 'Admin', permissions: ['Full access', 'Manage team', 'Delete contracts', 'Configure settings', 'Export data'] },
  { role: 'Editor', permissions: ['Create contracts', 'Edit contracts', 'Use AI features', 'Export PDFs'] },
  { role: 'Reviewer', permissions: ['View contracts', 'Add comments', 'Approve/reject', 'View analytics'] },
  { role: 'Viewer', permissions: ['View contracts', 'Download PDFs'] },
];

const statusColor = {
  online: 'bg-safe-green',
  away: 'bg-caution-amber',
  offline: 'bg-text-tertiary',
};

export function TeamView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Team</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{teamMembers.length} members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search members..."
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
            <Plus className="h-4 w-4" /> Invite Member
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Members Grid */}
        <div className="grid grid-cols-3 gap-4">
          {teamMembers.map((m) => (
            <div key={m.id} className="rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-sm font-medium text-primary-light">
                      {m.avatar}
                    </div>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-surface', statusColor[m.status])} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{m.name}</div>
                    <div className="text-xs text-text-tertiary">{m.email}</div>
                  </div>
                </div>
                <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', getRoleBadgeColor(m.role))}>
                  {m.role}
                </span>
                <span className="text-[10px] text-text-tertiary">{m.lastActive}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border-default pt-3">
                <div>
                  <div className="text-lg font-semibold text-text-primary">{m.active}</div>
                  <div className="text-[10px] text-text-tertiary">Active</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-text-primary">{m.completed}</div>
                  <div className="text-[10px] text-text-tertiary">Completed</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Permissions Reference */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary-light" />
            <h3 className="text-sm font-medium text-text-primary">Role Permissions</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {rolePermissions.map((r) => (
              <div key={r.role}>
                <div className="mb-2 text-xs font-medium text-text-primary">{r.role}</div>
                <ul className="space-y-1">
                  {r.permissions.map((p) => (
                    <li key={p} className="text-[11px] text-text-tertiary">• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
