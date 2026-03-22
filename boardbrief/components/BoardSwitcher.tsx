'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building2, Check, Plus, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { BoardWithMeta } from '@/lib/actions/boards';

const ACTIVE_BOARD_KEY = 'boardbrief_active_board';

interface BoardSwitcherProps {
  collapsed?: boolean;
}

export function BoardSwitcher({ collapsed = false }: BoardSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [boards, setBoards] = React.useState<BoardWithMeta[]>([]);
  const [activeBoardId, setActiveBoardId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Load boards
  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from('board_memberships')
        .select('board_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!memberships || memberships.length === 0) {
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

      const result: BoardWithMeta[] = (boardData ?? []).map(b => ({
        ...b,
        member_count: countMap[b.id] || 0,
        next_meeting_date: null,
        user_role: roleMap[b.id] || 'member',
      }));

      setBoards(result);

      // Restore active board from localStorage
      const stored = localStorage.getItem(ACTIVE_BOARD_KEY);
      if (stored && result.some(b => b.id === stored)) {
        setActiveBoardId(stored);
      } else if (result.length > 0) {
        setActiveBoardId(result[0].id);
        localStorage.setItem(ACTIVE_BOARD_KEY, result[0].id);
      }

      setLoading(false);
    }

    load();
  }, []);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  function handleSelect(boardId: string | null) {
    setActiveBoardId(boardId);
    if (boardId) {
      localStorage.setItem(ACTIVE_BOARD_KEY, boardId);
    } else {
      localStorage.removeItem(ACTIVE_BOARD_KEY);
    }
    setOpen(false);
    // Persist to server
    fetch('/api/board-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId }),
    }).catch(() => {});
    router.refresh();
  }

  if (loading || boards.length === 0) {
    if (collapsed) return null;
    return (
      <div className="px-3 py-2">
        <button
          onClick={() => router.push('/boards')}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-navy-600 px-3 py-2 text-xs text-navy-400 transition-colors hover:border-navy-400 hover:text-navy-200"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create a Board</span>
        </button>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="flex justify-center px-3 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-gold-500 transition-colors hover:bg-navy-700"
          title={activeBoard?.name ?? 'All Boards'}
        >
          <Building2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg bg-navy-800 px-3 py-2 text-sm transition-colors hover:bg-navy-700"
      >
        <Building2 className="h-4 w-4 shrink-0 text-gold-500" />
        <span className="flex-1 truncate text-left text-white font-medium">
          {activeBoard?.name ?? 'All Boards'}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-navy-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-navy-700 bg-navy-900 py-1 shadow-xl"
          >
            {/* All Boards option */}
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                !activeBoardId
                  ? 'bg-navy-800 text-gold-500'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">All Boards</span>
              {!activeBoardId && <Check className="h-3.5 w-3.5" />}
            </button>

            <div className="mx-3 my-1 border-t border-navy-700" />

            {boards.map(board => (
              <button
                key={board.id}
                onClick={() => handleSelect(board.id)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                  activeBoardId === board.id
                    ? 'bg-navy-800 text-gold-500'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                )}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-navy-700 text-xs font-bold text-gold-400">
                  {board.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate font-medium">{board.name}</p>
                  {board.organization_name && (
                    <p className="truncate text-xs text-navy-500">{board.organization_name}</p>
                  )}
                </div>
                {activeBoardId === board.id && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            ))}

            <div className="mx-3 my-1 border-t border-navy-700" />

            <button
              onClick={() => { setOpen(false); router.push('/boards'); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manage Boards</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
