'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Users, Mail, Trash2, Shield, Edit3, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Role = 'Admin' | 'Editor' | 'Viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  avatar: string;
}

const SAMPLE_TEAM: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@acmecorp.com', role: 'Admin', joined: '2025-09-01', avatar: 'AJ' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@acmecorp.com', role: 'Editor', joined: '2025-10-15', avatar: 'SC' },
  { id: '3', name: 'Michael Davis', email: 'michael@acmecorp.com', role: 'Viewer', joined: '2026-01-20', avatar: 'MD' },
];

const ROLE_CONFIG: Record<Role, { icon: React.ElementType; color: string; bg: string }> = {
  Admin: { icon: Shield, color: 'text-brand-700', bg: 'bg-brand-100' },
  Editor: { icon: Edit3, color: 'text-purple-700', bg: 'bg-purple-100' },
  Viewer: { icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100' },
};

interface TeamSettingsProps {
  currentUserEmail: string;
}

export function TeamSettings({ currentUserEmail }: TeamSettingsProps) {
  const t = useTranslations('settings');
  const tt = useTranslations('team');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(SAMPLE_TEAM);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Editor');
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await new Promise((r) => setTimeout(r, 800));
    setInviting(false);
    toast({ title: t('invitationSent', { email: inviteEmail }) });
    setInviteEmail('');
    setShowInviteForm(false);
  }

  function handleRoleChange(id: string, newRole: Role) {
    setMembers((m) => m.map((member) => (member.id === id ? { ...member, role: newRole } : member)));
    toast({ title: t('roleUpdated') });
  }

  function handleRemove(id: string) {
    setMembers((m) => m.filter((member) => member.id !== id));
    toast({ title: t('memberRemoved') });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('teamTitle')}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {t('teamDescription')}
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} size="sm">
          <Mail className="h-4 w-4 mr-2" />
          {t('inviteMember')}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <form
          onSubmit={handleInvite}
          className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4"
        >
          <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">{tt('inviteTeamMember')}</h4>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                {tt('emailAddress')}
              </label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                {tt('role')}
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <Button type="submit" disabled={inviting} size="sm">
              {inviting ? tt('sending') : tt('sendInvite')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowInviteForm(false)}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            They&apos;ll receive an email invitation to join your ProposalPilot workspace.
          </p>
        </form>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {members.map((member) => {
          const { icon: RoleIcon, color, bg } = ROLE_CONFIG[member.role];
          const isCurrentUser = member.email === currentUserEmail;

          return (
            <div
              key={member.id}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {member.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)] text-sm truncate">
                    {member.name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[10px] rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 font-medium">
                      You
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] truncate">{member.email}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  Joined {new Date(member.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${color}`}>
                  <RoleIcon className="h-3 w-3" />
                  {member.role}
                </div>

                {!isCurrentUser && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove member"
                      aria-label="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          Role Permissions
        </h4>
        <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-brand-600 mt-0.5 shrink-0" />
            <span><strong className="text-[var(--foreground)]">Admin</strong> — Full access: create, edit, send, delete, manage team</span>
          </div>
          <div className="flex items-start gap-2">
            <Edit3 className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
            <span><strong className="text-[var(--foreground)]">Editor</strong> — Create and edit proposals, view analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="h-3.5 w-3.5 text-gray-500 mt-0.5 shrink-0" />
            <span><strong className="text-[var(--foreground)]">Viewer</strong> — Read-only access to proposals and reports</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
