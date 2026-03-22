'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Calendar,
  Shield,
  Eye,
  PenLine,
  UserCheck,
  ArrowLeft,
  Settings,
  UserPlus,
  Trash2,
  Loader2,
  ChevronDown,
  CheckSquare,
  Vote,
  Clock,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { Board, BoardMembership } from '@/lib/actions/boards';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full management access' },
  { value: 'secretary', label: 'Secretary', icon: PenLine, desc: 'Minutes and documents' },
  { value: 'member', label: 'Member', icon: UserCheck, desc: 'Voting and participation' },
  { value: 'observer', label: 'Observer', icon: Eye, desc: 'View-only access' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  secretary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  observer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual',
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type Tab = 'members' | 'settings' | 'activity';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<BoardMembership[]>([]);
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('members');
  const [error, setError] = useState('');

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  // Settings form
  const [settingsName, setSettingsName] = useState('');
  const [settingsOrg, setSettingsOrg] = useState('');
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsFreq, setSettingsFreq] = useState('monthly');
  const [settingsFY, setSettingsFY] = useState(1);
  const [saving, setSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState({ meetings: 0, actionItems: 0, votes: 0 });

  const isAdmin = userRole === 'admin';

  const loadBoard = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check membership
    const { data: membership } = await supabase
      .from('board_memberships')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      router.push('/boards');
      return;
    }

    setUserRole(membership.role);

    const [boardRes, membersRes, meetingsRes, actionsRes, resolutionsRes] = await Promise.all([
      supabase.from('boards').select('*').eq('id', boardId).single(),
      supabase.from('board_memberships').select('*').eq('board_id', boardId).order('joined_at'),
      supabase.from('meetings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('action_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['open', 'in_progress']),
      supabase.from('resolutions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['draft', 'voting']),
    ]);

    if (boardRes.error || !boardRes.data) {
      router.push('/boards');
      return;
    }

    const b = boardRes.data as Board;
    setBoard(b);
    setMembers((membersRes.data ?? []) as BoardMembership[]);
    setStats({
      meetings: meetingsRes.count ?? 0,
      actionItems: actionsRes.count ?? 0,
      votes: resolutionsRes.count ?? 0,
    });

    // Populate settings form
    setSettingsName(b.name);
    setSettingsOrg(b.organization_name ?? '');
    setSettingsDesc(b.description ?? '');
    setSettingsFreq(b.meeting_frequency);
    setSettingsFY(b.fiscal_year_start);

    setLoading(false);
  }, [boardId, router]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError('');
    try {
      const { inviteMember } = await import('@/lib/actions/boards');
      const result = await inviteMember(boardId, inviteEmail.trim(), inviteRole);
      if (result.error) {
        setError(result.error);
      } else {
        setShowInvite(false);
        setInviteEmail('');
        setInviteRole('member');
        await loadBoard();
      }
    } catch {
      setError('Failed to send invite');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      const { updateMemberRole } = await import('@/lib/actions/boards');
      const result = await updateMemberRole(boardId, memberId, newRole);
      if (result.error) setError(result.error);
      else await loadBoard();
    } catch {
      setError('Failed to update role');
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Remove this member from the board?')) return;
    try {
      const { removeMember } = await import('@/lib/actions/boards');
      const result = await removeMember(boardId, memberId);
      if (result.error) setError(result.error);
      else await loadBoard();
    } catch {
      setError('Failed to remove member');
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSettingsSuccess(false);
    try {
      const { updateBoard } = await import('@/lib/actions/boards');
      const result = await updateBoard(boardId, {
        name: settingsName.trim(),
        description: settingsDesc.trim() || undefined,
        organization_name: settingsOrg.trim() || undefined,
        meeting_frequency: settingsFreq as any,
        fiscal_year_start: settingsFY,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSettingsSuccess(true);
        await loadBoard();
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBoard() {
    setDeleting(true);
    try {
      const { deleteBoard } = await import('@/lib/actions/boards');
      const result = await deleteBoard(boardId);
      if (result.error) {
        setError(result.error);
        setDeleting(false);
      } else {
        router.push('/boards');
      }
    } catch {
      setError('Failed to delete board');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!board) return null;

  const activeMembers = members.filter(m => m.status !== 'inactive');

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/boards"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Boards
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-100 dark:bg-navy-800">
              <Building2 className="h-6 w-6 text-navy-600 dark:text-navy-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">{board.name}</h1>
              {board.organization_name && (
                <p className="text-sm text-muted-foreground">{board.organization_name}</p>
              )}
              {board.description && (
                <p className="mt-1 text-sm text-muted-foreground">{board.description}</p>
              )}
            </div>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-xs font-medium', ROLE_COLORS[userRole] || ROLE_COLORS.member)}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Members', value: activeMembers.length, icon: Users },
          { label: 'Total Meetings', value: stats.meetings, icon: Calendar },
          { label: 'Pending Actions', value: stats.actionItems, icon: CheckSquare },
          { label: 'Upcoming Votes', value: stats.votes, icon: Vote },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: 'members' as Tab, label: 'Members', icon: Users },
          { key: 'settings' as Tab, label: 'Settings', icon: Settings },
          { key: 'activity' as Tab, label: 'Activity', icon: Clock },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-navy-800 text-foreground dark:border-gold-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={() => setShowInvite(true)} size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Invite Member
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  {isAdmin && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activeMembers.map(member => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{member.email}</p>
                        {member.user_name && (
                          <p className="text-xs text-muted-foreground">{member.user_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[member.status] || STATUS_COLORS.active)}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={member.role}
                          onChange={e => handleRoleChange(member.id, e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none"
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLORS[member.role] || ROLE_COLORS.member)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {formatDate(member.joined_at)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Remove member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invite Modal */}
          <AnimatePresence>
            {showInvite && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Invite Member</h3>
                    <button onClick={() => setShowInvite(false)} className="p-1 rounded-md text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLE_OPTIONS.map(r => {
                          const RIcon = r.icon;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setInviteRole(r.value)}
                              className={cn(
                                'flex items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                                inviteRole === r.value
                                  ? 'border-navy-500 bg-navy-50 dark:bg-navy-900/30'
                                  : 'border-border hover:border-navy-300'
                              )}
                            >
                              <RIcon className="h-4 w-4 mt-0.5 shrink-0 text-navy-600 dark:text-navy-300" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{r.label}</p>
                                <p className="text-xs text-muted-foreground">{r.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                      <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                        {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Send Invite
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="space-y-6">
          {!isAdmin && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              Only board admins can modify settings.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="max-w-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Board Name *</label>
              <input
                type="text"
                value={settingsName}
                onChange={e => setSettingsName(e.target.value)}
                disabled={!isAdmin}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Organization Name</label>
              <input
                type="text"
                value={settingsOrg}
                onChange={e => setSettingsOrg(e.target.value)}
                disabled={!isAdmin}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={settingsDesc}
                onChange={e => setSettingsDesc(e.target.value)}
                disabled={!isAdmin}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Meeting Frequency</label>
                <select
                  value={settingsFreq}
                  onChange={e => setSettingsFreq(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fiscal Year Start</label>
                <select
                  value={settingsFY}
                  onChange={e => setSettingsFY(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving || !settingsName.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                {settingsSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-emerald-600 dark:text-emerald-400"
                  >
                    Settings saved!
                  </motion.span>
                )}
              </div>
            )}
          </form>

          {/* Danger Zone */}
          {isAdmin && (
            <div className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-5">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h3>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                Deleting a board permanently removes all data including memberships, linked meetings, and documents.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Board
                </Button>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">Are you sure?</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteBoard}
                    disabled={deleting}
                  >
                    {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Recent activity for this board.</p>

          <div className="space-y-3">
            {/* Board creation */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Board created</p>
                <p className="text-xs text-muted-foreground">{formatDate(board.created_at)}</p>
              </div>
            </div>

            {/* Recent member joins */}
            {activeMembers.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.email} joined as <span className="capitalize">{member.role}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(member.joined_at)}</p>
                </div>
              </div>
            ))}

            {/* Stats-based activity */}
            {stats.meetings > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 dark:bg-navy-800">
                  <Calendar className="h-4 w-4 text-navy-600 dark:text-navy-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{stats.meetings} meeting{stats.meetings !== 1 ? 's' : ''} recorded</p>
                  <p className="text-xs text-muted-foreground">Across all time</p>
                </div>
              </div>
            )}

            {stats.actionItems > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <CheckSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{stats.actionItems} pending action item{stats.actionItems !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
