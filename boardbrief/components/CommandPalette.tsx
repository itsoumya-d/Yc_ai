'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Vote,
  Settings,
  ListOrdered,
  FileStack,
  FolderOpen,
  BarChart3,
  ArrowRight,
  Hash,
  User,
  LogOut,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { searchApp, type SearchResult } from '@/lib/actions/search';

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  group: 'Navigate' | 'Actions' | 'Settings';
  action: () => void;
  keywords?: string[];
}

function useCommandPalette() {
  const router = useRouter();

  const items = React.useMemo<PaletteItem[]>(() => [
    // Navigate
    { id: 'nav-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/dashboard'), keywords: ['home', 'overview'] },
    { id: 'nav-meetings', label: 'Meetings', icon: <Calendar className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/meetings'), keywords: ['calendar', 'schedule'] },
    { id: 'nav-agenda', label: 'Agenda Builder', icon: <ListOrdered className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/agenda-builder') },
    { id: 'nav-boardpack', label: 'Board Pack', icon: <FileStack className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/board-pack'), keywords: ['pack', 'documents'] },
    { id: 'nav-documents', label: 'Documents', icon: <FolderOpen className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/documents'), keywords: ['files'] },
    { id: 'nav-members', label: 'Board Members', icon: <Users className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/board-members'), keywords: ['team', 'directors'] },
    { id: 'nav-actions', label: 'Action Items', icon: <CheckSquare className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/action-items'), keywords: ['tasks', 'todo'] },
    { id: 'nav-resolutions', label: 'Resolutions', icon: <Vote className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/resolutions'), keywords: ['votes', 'decisions'] },
    { id: 'nav-analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, group: 'Navigate', action: () => router.push('/analytics'), keywords: ['reports', 'metrics'] },
    // Actions
    { id: 'action-new-meeting', label: 'New Meeting', description: 'Schedule a new board meeting', icon: <Calendar className="h-4 w-4 text-green-500" />, group: 'Actions', action: () => router.push('/meetings/new'), keywords: ['create', 'schedule'] },
    { id: 'action-upload-doc', label: 'Upload Document', description: 'Add a file to the board pack', icon: <FolderOpen className="h-4 w-4 text-blue-500" />, group: 'Actions', action: () => router.push('/documents'), keywords: ['file', 'upload'] },
    // Settings
    { id: 'settings-profile', label: 'Profile Settings', icon: <User className="h-4 w-4" />, group: 'Settings', action: () => router.push('/settings/profile') },
    { id: 'settings-main', label: 'Settings', icon: <Settings className="h-4 w-4" />, group: 'Settings', action: () => router.push('/settings') },
    {
      id: 'settings-signout', label: 'Sign Out', icon: <LogOut className="h-4 w-4 text-red-500" />, group: 'Settings',
      action: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
      },
      keywords: ['logout'],
    },
  ], [router]);

  return items;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: PaletteItem['group'][] = ['Navigate', 'Actions', 'Settings'];
const GROUP_ICONS: Record<PaletteItem['group'], React.ReactNode> = {
  Navigate: <ArrowRight className="h-3 w-3" />,
  Actions: <Hash className="h-3 w-3" />,
  Settings: <Settings className="h-3 w-3" />,
};

const typeColors: Record<string, string> = {
  Meeting: '#3B82F6',
  'Action Item': '#F59E0B',
  Resolution: '#8B5CF6',
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const items = useCommandPalette();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter items
  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.includes(q)) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, items]);

  // Group filtered items
  const grouped = React.useMemo(() => {
    const map = new Map<PaletteItem['group'], PaletteItem[]>();
    for (const g of GROUPS) {
      const inGroup = filtered.filter((i) => i.group === g);
      if (inGroup.length) map.set(g, inGroup);
    }
    return map;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatItems = React.useMemo(() => filtered, [filtered]);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchApp(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const totalLength = searchResults.length + flatItems.length;

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => { setActiveIdx(0); }, [query]);

  const handleSelectSearchResult = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  const handleSelect = React.useCallback((item: PaletteItem) => {
    item.action();
    onClose();
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, totalLength - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx < searchResults.length) {
        if (searchResults[activeIdx]) handleSelectSearchResult(searchResults[activeIdx]);
      } else {
        const navIdx = activeIdx - searchResults.length;
        if (flatItems[navIdx]) handleSelect(flatItems[navIdx]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-[15vh] z-50 w-full max-w-xl -translate-x-1/2"
            onKeyDown={handleKeyDown}
          >
            <div className="rounded-xl border border-border bg-background shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Command palette">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                {isSearching
                  ? <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
                  : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search meetings, action items, resolutions..."
                  aria-label="Search commands"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[380px] overflow-y-auto p-1.5">
                {totalLength === 0 && !isSearching ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <>
                    {/* Search results group */}
                    {searchResults.length > 0 && (
                      <div className="mb-1">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Search className="h-3 w-3" />
                          Results
                        </div>
                        {searchResults.map((result, i) => {
                          const isActive = i === activeIdx;
                          return (
                            <button
                              key={result.id}
                              data-active={isActive}
                              onMouseEnter={() => setActiveIdx(i)}
                              onClick={() => handleSelectSearchResult(result)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                              )}
                            >
                              <span
                                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                                style={{
                                  backgroundColor: (typeColors[result.type] ?? '#3B82F6') + '22',
                                  color: typeColors[result.type] ?? '#3B82F6',
                                }}
                              >
                                {result.type}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium truncate">{result.title}</span>
                                {result.subtitle && (
                                  <span className="ml-2 text-xs text-muted-foreground truncate">{result.subtitle}</span>
                                )}
                              </div>
                              {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* Static nav items */}
                    {Array.from(grouped.entries()).map(([group, groupItems]) => (
                      <div key={group} className="mb-1">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {GROUP_ICONS[group]}
                          {group}
                        </div>
                        {groupItems.map((item) => {
                          const navFlatIdx = searchResults.length + flatItems.indexOf(item);
                          const isActive = navFlatIdx === activeIdx;
                          return (
                            <button
                              key={item.id}
                              data-active={isActive}
                              onMouseEnter={() => setActiveIdx(navFlatIdx)}
                              onClick={() => handleSelect(item)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                              )}
                            >
                              <span className={cn('shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                                {item.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{item.label}</span>
                                {item.description && (
                                  <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                                )}
                              </div>
                              {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">ESC</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Hook to wire up ⌘K / Ctrl+K globally */
export function useCommandPaletteShortcut(onOpen: () => void) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpen]);
}
