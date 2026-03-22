'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Compass,
  User,
  Settings,
  Plus,
  Feather,
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

const useCommandPaletteItems = () => {
  const router = useRouter();
  return React.useMemo<PaletteItem[]>(() => [
    // Navigate
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Overview and writing stats',
      icon: <LayoutDashboard className="h-4 w-4" />,
      group: 'Navigate',
      action: () => router.push('/dashboard'),
      keywords: ['home', 'overview'],
    },
    {
      id: 'nav-stories',
      label: 'My Stories',
      description: 'Browse and manage your stories',
      icon: <BookOpen className="h-4 w-4" />,
      group: 'Navigate',
      action: () => router.push('/stories'),
      keywords: ['stories', 'books', 'writing'],
    },
    {
      id: 'nav-discover',
      label: 'Discover',
      description: 'Explore stories from the community',
      icon: <Compass className="h-4 w-4" />,
      group: 'Navigate',
      action: () => router.push('/discover'),
      keywords: ['explore', 'community', 'browse'],
    },
    {
      id: 'nav-profile',
      label: 'My Profile',
      description: 'View your public writer profile',
      icon: <User className="h-4 w-4" />,
      group: 'Navigate',
      action: () => router.push('/profile'),
      keywords: ['profile', 'author', 'writer'],
    },
    // Actions
    {
      id: 'action-new-story',
      label: 'New Story',
      description: 'Start writing a new story',
      icon: <Feather className="h-4 w-4 text-brand-600" />,
      group: 'Actions',
      action: () => router.push('/stories/new'),
      keywords: ['create', 'write', 'start', 'new'],
    },
    {
      id: 'action-new-chapter',
      label: 'New Chapter',
      description: 'Add a chapter to an existing story',
      icon: <Plus className="h-4 w-4 text-brand-600" />,
      group: 'Actions',
      action: () => router.push('/stories'),
      keywords: ['create', 'chapter', 'add'],
    },
    // Settings
    {
      id: 'settings-profile',
      label: 'Profile Settings',
      description: 'Edit your writer profile',
      icon: <User className="h-4 w-4" />,
      group: 'Settings',
      action: () => router.push('/profile'),
      keywords: ['account', 'profile'],
    },
    {
      id: 'settings-main',
      label: 'Settings',
      description: 'App preferences and billing',
      icon: <Settings className="h-4 w-4" />,
      group: 'Settings',
      action: () => router.push('/settings'),
      keywords: ['preferences', 'billing', 'account'],
    },
    {
      id: 'settings-signout',
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4 text-red-500" />,
      group: 'Settings',
      action: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
      },
      keywords: ['logout', 'signout'],
    },
  ], [router]);
};

const groupOrder: PaletteItem['group'][] = ['Navigate', 'Actions', 'Settings'];

const typeColors: Record<string, string> = {
  Story: '#8B5CF6',
  Chapter: '#06B6D4',
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const items = useCommandPaletteItems();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.keywords?.some((k) => k.includes(q))
    );
  }, [query, items]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const g of groupOrder) map.set(g, []);
    for (const item of filtered) {
      map.get(item.group)?.push(item);
    }
    return map;
  }, [filtered]);

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

  const totalLength = searchResults.length + filtered.length;

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

  const handleSelect = (item: PaletteItem) => { item.action(); onClose(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, totalLength - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx < searchResults.length) {
        if (searchResults[activeIdx]) handleSelectSearchResult(searchResults[activeIdx]);
      } else {
        const navIdx = activeIdx - searchResults.length;
        if (filtered[navIdx]) handleSelect(filtered[navIdx]);
      }
    }
    else if (e.key === 'Escape') { onClose(); }
  };

  React.useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
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
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                {isSearching
                  ? <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
                  : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories, chapters..."
                  aria-label="Search commands"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
              </div>
              <div ref={listRef} className="max-h-[380px] overflow-y-auto p-1.5">
                {totalLength === 0 && !isSearching ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <>
                    {/* Search results group */}
                    {searchResults.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Results
                        </div>
                        {searchResults.map((result) => {
                          const idx = flatIdx++;
                          const isActive = idx === activeIdx;
                          return (
                            <button
                              key={result.id}
                              data-active={isActive}
                              onMouseEnter={() => setActiveIdx(idx)}
                              onClick={() => handleSelectSearchResult(result)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                                isActive
                                  ? 'bg-muted text-foreground'
                                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                              )}
                            >
                              <span
                                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                                style={{
                                  backgroundColor: (typeColors[result.type] ?? '#8B5CF6') + '22',
                                  color: typeColors[result.type] ?? '#8B5CF6',
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
                    {Array.from(grouped.entries()).map(([group, groupItems]) => {
                      if (groupItems.length === 0) return null;
                      return (
                        <div key={group}>
                          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group}
                          </div>
                          {groupItems.map((item) => {
                            const idx = flatIdx++;
                            return (
                              <button
                                key={item.id}
                                data-active={idx === activeIdx}
                                onMouseEnter={() => setActiveIdx(idx)}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                                  idx === activeIdx
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                              >
                                <span className="shrink-0">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">{item.label}</span>
                                  {item.description && (
                                    <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                                  )}
                                </div>
                                {idx === activeIdx && <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">ESC</kbd>Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

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
