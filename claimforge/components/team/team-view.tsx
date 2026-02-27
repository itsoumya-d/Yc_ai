'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, getInitials, getRoleLabel, getRoleBadgeColor, formatDate } from '@/lib/utils';
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Clock,
  FolderOpen,
} from 'lucide-react';
import type { TeamMember, UserRole, TeamMemberStatus } from '@/types/database';

interface TeamViewProps {
  members: TeamMember[];
}

function getStatusDot(status: TeamMemberStatus): string {
  if (status === 'active') return 'bg-verified-green';
  if (status === 'invited') return 'bg-warning';
  return 'bg-text-tertiary';
}

export function TeamView({ members }: TeamViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = members.filter((m) => m.status === 'active').length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Team" subtitle={`${activeCount} active member${activeCount !== 1 ? 's' : ''}`}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full max-w-sm rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
            <div className="text-center">
              <UserPlus className="mx-auto h-8 w-8 text-text-tertiary" />
              <p className="mt-2 text-sm text-text-secondary">
                {members.length === 0 ? 'No team members yet' : 'No members match your search'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border-default bg-bg-surface p-5 transition-all hover:border-border-emphasis"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-sm font-medium text-primary-light">
                        {getInitials(m.full_name)}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-surface', getStatusDot(m.status))} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{m.full_name}</div>
                      <div className="text-xs text-text-tertiary">{m.email}</div>
                    </div>
                  </div>
                  <button className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-surface-raised">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRoleBadgeColor(m.role))}>
                    {getRoleLabel(m.role)}
                  </span>
                  <span className="text-[10px] capitalize text-text-tertiary">{m.status}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border-muted pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                    <FolderOpen className="h-3 w-3" />
                    <span>{m.cases_assigned} cases</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    <span>Joined {formatDate(m.joined_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Roles Reference */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
          <h3 className="legal-heading mb-3 text-sm text-text-primary">Role Permissions</h3>
          <div className="grid grid-cols-5 gap-3 text-xs">
            {(['admin', 'investigator', 'analyst', 'reviewer', 'viewer'] as UserRole[]).map((role) => (
              <div key={role} className="rounded-lg border border-border-muted p-3">
                <div className={cn('mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium', getRoleBadgeColor(role))}>
                  {getRoleLabel(role)}
                </div>
                <ul className="space-y-1 text-text-secondary">
                  <li>View cases {role !== 'viewer' ? '& edit' : ''}</li>
                  {role !== 'viewer' && <li>Upload documents</li>}
                  {(role === 'admin' || role === 'investigator') && <li>Run analysis</li>}
                  {(role === 'admin' || role === 'investigator' || role === 'reviewer') && <li>Generate reports</li>}
                  {role === 'admin' && <li>Manage team</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
