'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Building2,
  Users,
  Calendar,
  Shield,
  Eye,
  PenLine,
  UserCheck,
  LayoutGrid,
  List,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { BoardWithMeta, BoardInput } from '@/lib/actions/boards';
import { Button } from '@/components/ui/button';

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  secretary: { label: 'Secretary', icon: PenLine, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  member: { label: 'Member', icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  observer: { label: 'Observer', icon: Eye, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFreq, setFormFreq] = useState('monthly');
  const [formFY, setFormFY] = useState(1);

  const loadBoards = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from('board_memberships')
      .select('board_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!memberships || memberships.length === 0) {
      setBoards([]);
      setLoading(false);
      return;
    }

    const boardIds = memberships.map(m => m.board_id);
    const roleMap = Object.fromEntries(memberships.map(m => [m.board_id, m.role]));

    const { data: boardData } = await supabase
      .from('boards')
      .select('*')
      .in('id', boardIds)
      .order('name');

    const { data: memberCounts } = await supabase
      .from('board_memberships')
      .select('board_id')
      .in('board_id', boardIds)
      .eq('status', 'active');

    const countMap: Record<string, number> = {};
    (memberCounts ?? []).forEach(m => {
      countMap[m.board_id] = (countMap[m.board_id] || 0) + 1;
    });

    setBoards((boardData ?? []).map(b => ({
      ...b,
      member_count: countMap[b.id] || 0,
      next_meeting_date: null,
      user_role: roleMap[b.id] || 'member',
    })));
    setLoading(false);
  }, []);

  useEffect(() => { loadBoards(); }, [loadBoards]);

  const filteredBoards = boards.filter(b => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) ||
           (b.organization_name ?? '').toLowerCase().includes(q);
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setCreating(true);
    setError('');

    try {
      const { createBoard } = await import('@/lib/actions/boards');
      const result = await createBoard({
        name: formName.trim(),
        description: formDesc.trim() || undefined,
        organization_name: formOrg.trim() || undefined,
        meeting_frequency: formFreq as BoardInput['meeting_frequency'],
        fiscal_year_start: formFY,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setShowCreate(false);
        setFormName('');
        setFormOrg('');
        setFormDesc('');
        setFormFreq('monthly');
        setFormFY(1);
        await loadBoards();
      }
    } catch {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  }

  async function handleSwitchBoard(boardId: string) {
    localStorage.setItem('boardbrief_active_board', boardId);
    try {
      const { switchActiveBoard } = await import('@/lib/actions/boards');
      await switchActiveBoard(boardId);
    } catch {}
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Boards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your board entities. Switch between boards to change dashboard context.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Board
        </Button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search boards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
          />
        </div>
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center justify-center rounded-l-lg p-2 transition-colors',
              viewMode === 'grid' ? 'bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-white' : 'text-muted-foreground hover:bg-muted'
            )}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center justify-center rounded-r-lg p-2 transition-colors',
              viewMode === 'list' ? 'bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-white' : 'text-muted-foreground hover:bg-muted'
            )}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredBoards.length === 0 && !search && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16"
        >
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No boards yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first board to get started.</p>
          <Button onClick={() => setShowCreate(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-1" />
            Create Board
          </Button>
        </motion.div>
      )}

      {filteredBoards.length === 0 && search && (
        <div className="flex flex-col items-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No boards matching &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredBoards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board, i) => {
            const roleConf = ROLE_CONFIG[board.user_role] || ROLE_CONFIG.member;
            const RoleIcon = roleConf.icon;
            return (
              <motion.div
                key={board.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(0,0,0,0.12)' }}
                className="group rounded-xl border border-border bg-card p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 dark:bg-navy-800">
                    <Building2 className="h-5 w-5 text-navy-600 dark:text-navy-300" />
                  </div>
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', roleConf.color)}>
                    <RoleIcon className="h-3 w-3" />
                    {roleConf.label}
                  </span>
                </div>

                <h3 className="mt-3 font-semibold text-foreground truncate">{board.name}</h3>
                {board.organization_name && (
                  <p className="text-xs text-muted-foreground truncate">{board.organization_name}</p>
                )}
                {board.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{board.description}</p>
                )}

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {board.member_count} member{board.member_count !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {FREQUENCY_LABELS[board.meeting_frequency] ?? board.meeting_frequency}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleSwitchBoard(board.id)}
                    className="flex-1 rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-900"
                  >
                    Switch to Board
                  </button>
                  <Link
                    href={`/boards/${board.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredBoards.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Board</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Members</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Frequency</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoards.map((board, i) => {
                const roleConf = ROLE_CONFIG[board.user_role] || ROLE_CONFIG.member;
                const RoleIcon = roleConf.icon;
                return (
                  <motion.tr
                    key={board.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 dark:bg-navy-800">
                          <Building2 className="h-4 w-4 text-navy-600 dark:text-navy-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{board.name}</p>
                          {board.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{board.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {board.organization_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{board.member_count}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {FREQUENCY_LABELS[board.meeting_frequency] ?? board.meeting_frequency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', roleConf.color)}>
                        <RoleIcon className="h-3 w-3" />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSwitchBoard(board.id)}
                          className="rounded-md bg-navy-800 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-navy-900"
                        >
                          Switch
                        </button>
                        <Link
                          href={`/boards/${board.id}`}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Create New Board</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Board Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g., Acme Corp Board of Directors"
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={formOrg}
                    onChange={e => setFormOrg(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    rows={2}
                    placeholder="Brief description of this board..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Meeting Frequency</label>
                    <select
                      value={formFreq}
                      onChange={e => setFormFreq(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                    >
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Fiscal Year Start</label>
                    <select
                      value={formFY}
                      onChange={e => setFormFY(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                    >
                      {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || !formName.trim()}>
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Board
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
