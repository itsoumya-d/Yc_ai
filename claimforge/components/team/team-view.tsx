'use client';

import { useState, useTransition } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, getInitials, getRoleLabel, getRoleBadgeColor, formatDate } from '@/lib/utils';
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Clock,
  FolderOpen,
  X,
  UserX,
  ShieldCheck,
} from 'lucide-react';
import type { UserRole, TeamMemberStatus, TeamMember } from '@/types/database';
import { inviteTeamMember, updateMemberRole, deactivateMember, removeMember } from '@/lib/actions/team';

function getStatusDot(status: TeamMemberStatus): string {
  if (status === 'active') return 'bg-verified-green';
  if (status === 'invited') return 'bg-warning';
  return 'bg-text-tertiary';
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'investigator', label: 'Investigator' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'viewer', label: 'Viewer' },
];

interface TeamViewProps {
  initialMembers: TeamMember[];
}

export function TeamView({ initialMembers }: TeamViewProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'investigator' as UserRole,
  });

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = members.filter((m) => m.status === 'active').length;

  function handleInvite() {
    if (!inviteForm.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!inviteForm.email.trim() || !inviteForm.email.includes('@')) {
      setFormError('Valid email is required');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const result = await inviteTeamMember(
        inviteForm.email,
        inviteForm.role,
        inviteForm.name
      );

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.data) {
        setMembers((prev) => [result.data!, ...prev]);
      }

      setInviteForm({ name: '', email: '', role: 'investigator' });
      setShowInvite(false);
    });
  }

  function handleUpdateRole(memberId: string, role: UserRole) {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, role);
      if (result.error) return;
      if (result.data) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role } : m))
        );
      }
      setOpenMenu(null);
    });
  }

  function handleDeactivate(memberId: string) {
    startTransition(async () => {
      const result = await deactivateMember(memberId);
      if (result.error) return;
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: 'inactive' as TeamMemberStatus } : m))
      );
      setOpenMenu(null);
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.error) return;
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setOpenMenu(null);
    });
  }

  return (
    <div className="flex h-full flex-col" onClick={() => setOpenMenu(null)}>
      <PageHeader title="Team" subtitle={`${activeCount} active members`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInvite((v) => !v);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Invite Form */}
        {showInvite && (
          <div className="rounded-xl border border-primary bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Invite Team Member</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="rounded-md p-1 text-text-tertiary hover:bg-bg-surface-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm((f) => ({ ...f, role: e.target.value as UserRole }))
                  }
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <p className="mt-2 text-xs text-fraud-red">{formError}</p>}

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInvite}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isPending ? 'Sending invite...' : 'Send Invite'}
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="rounded-lg border border-border-default px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
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

        {/* Team Grid */}
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
            <p className="text-sm text-text-tertiary">
              {members.length === 0 ? 'No team members yet' : 'No results found'}
            </p>
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
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-surface',
                          getStatusDot(m.status)
                        )}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{m.full_name}</div>
                      <div className="text-xs text-text-tertiary">{m.email}</div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                      className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-surface-raised"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === m.id && (
                      <div className="absolute right-0 top-7 z-10 min-w-[160px] rounded-lg border border-border-default bg-bg-surface shadow-lg">
                        <div className="p-1">
                          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
                            Change Role
                          </div>
                          {ROLES.map((r) => (
                            <button
                              key={r.value}
                              onClick={() => handleUpdateRole(m.id, r.value)}
                              disabled={isPending || m.role === r.value}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                                m.role === r.value
                                  ? 'text-text-tertiary'
                                  : 'text-text-secondary hover:bg-bg-surface-raised'
                              )}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              {r.label}
                              {m.role === r.value && ' (current)'}
                            </button>
                          ))}
                          <div className="my-1 border-t border-border-muted" />
                          {m.status === 'active' && (
                            <button
                              onClick={() => handleDeactivate(m.id)}
                              disabled={isPending}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-warning transition-colors hover:bg-warning-muted"
                            >
                              <UserX className="h-3 w-3" />
                              Deactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(m.id)}
                            disabled={isPending}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-fraud-red transition-colors hover:bg-fraud-red-muted"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      getRoleBadgeColor(m.role)
                    )}
                  >
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
            {(['admin', 'investigator', 'analyst', 'reviewer', 'viewer'] as UserRole[]).map(
              (role) => (
                <div key={role} className="rounded-lg border border-border-muted p-3">
                  <div
                    className={cn(
                      'mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                      getRoleBadgeColor(role)
                    )}
                  >
                    {getRoleLabel(role)}
                  </div>
                  <ul className="space-y-1 text-text-secondary">
                    <li>View cases {role !== 'viewer' ? '& edit' : ''}</li>
                    {role !== 'viewer' && <li>Upload documents</li>}
                    {(role === 'admin' || role === 'investigator') && <li>Run analysis</li>}
                    {(role === 'admin' ||
                      role === 'investigator' ||
                      role === 'reviewer') && <li>Generate reports</li>}
                    {role === 'admin' && <li>Manage team</li>}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
