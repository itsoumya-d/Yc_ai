'use client';

import * as React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  /** Default true — set false to disable sort on this column */
  sortable?: boolean;
  /** Default true — set false to lock column visibility */
  hideable?: boolean;
  render?: (item: T, isSelected?: boolean) => React.ReactNode;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selected: T[]) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  /** Filename (without .csv) — enables the Export button when provided */
  exportFilename?: string;
  pageSizes?: number[];
  defaultPageSize?: number;
}

type SortDir = 'asc' | 'desc';

function exportToCSV<T>(
  columns: Column<T>[],
  data: T[],
  hiddenCols: Set<string>,
  filename: string
) {
  const exportable = columns.filter((c) => !hiddenCols.has(c.key) && !c.render);
  const header = exportable.map((c) => `"${c.header}"`).join(',');
  const rows = data.map((item) =>
    exportable
      .map((c) => {
        const val = (item as Record<string, unknown>)[c.key];
        const str = val == null ? '' : String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found.',
  className,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable = false,
  bulkActions = [],
  exportFilename,
  pageSizes = [10, 25, 50, 100],
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [hiddenCols, setHiddenCols] = React.useState<Set<string>>(new Set());
  const [showColMenu, setShowColMenu] = React.useState(false);
  const colMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    if (showColMenu) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showColMenu]);

  React.useEffect(() => { setPage(0); }, [search, data]);

  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));
  const hideableColumns = columns.filter((c) => c.hideable !== false);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      columns.some((c) => {
        const val = (item as Record<string, unknown>)[c.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const aStr = av == null ? '' : String(av);
      const bStr = bv == null ? '' : String(bv);
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const allPageSelected = paged.length > 0 && paged.every((item) => selected.has(keyExtractor(item)));
  const somePageSelected = paged.some((item) => selected.has(keyExtractor(item)));
  const selectedItems = sorted.filter((item) => selected.has(keyExtractor(item)));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paged.forEach((item) => next.delete(keyExtractor(item)));
      } else {
        paged.forEach((item) => next.add(keyExtractor(item)));
      }
      return next;
    });
  };

  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) {
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 shrink-0" />;
    }
    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 shrink-0" />
      : <ChevronDown className="h-3.5 w-3.5 shrink-0" />;
  };

  const colSpan = visibleColumns.length + (selectable ? 1 : 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {hideableColumns.length > 0 && (
            <div className="relative" ref={colMenuRef}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => setShowColMenu((v) => !v)}
              >
                <Eye className="h-4 w-4" />
                Columns
                {hiddenCols.size > 0 && (
                  <span className="ml-0.5 rounded-full bg-foreground text-background px-1.5 py-0.5 text-[10px] font-semibold">
                    {hiddenCols.size}
                  </span>
                )}
              </Button>
              {showColMenu && (
                <div className="absolute right-0 top-10 z-50 min-w-[170px] rounded-lg border border-border bg-background shadow-xl p-1.5 space-y-0.5">
                  {hideableColumns.map((c) => {
                    const isHidden = hiddenCols.has(c.key);
                    const isLast = visibleColumns.length === 1 && !isHidden;
                    return (
                      <button
                        key={c.key}
                        disabled={isLast}
                        onClick={() => {
                          setHiddenCols((prev) => {
                            const next = new Set(prev);
                            next.has(c.key) ? next.delete(c.key) : next.add(c.key);
                            return next;
                          });
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left transition-colors',
                          isLast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted'
                        )}
                      >
                        {isHidden
                          ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          : <Eye className="h-3.5 w-3.5 text-foreground shrink-0" />
                        }
                        <span className={cn(isHidden && 'text-muted-foreground')}>{c.header}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {exportFilename && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs"
              onClick={() => exportToCSV(columns, sorted, hiddenCols, exportFilename)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {selectable && selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium">
            {selected.size} row{selected.size !== 1 ? 's' : ''} selected
          </span>
          {bulkActions.length > 0 && (
            <div className="flex gap-2">
              {bulkActions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => {
                    action.onClick(selectedItems);
                    setSelected(new Set());
                  }}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="w-full overflow-auto rounded-lg border border-border">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {selectable && (
                <th className="h-11 w-10 px-3 text-left align-middle">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allPageSelected && somePageSelected;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border cursor-pointer"
                    aria-label="Select all on page"
                  />
                </th>
              )}
              {visibleColumns.map((col) => {
                const isSortable = col.sortable !== false;
                const isActive = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'h-11 px-4 text-left align-middle font-medium text-muted-foreground select-none whitespace-nowrap',
                      isSortable && 'cursor-pointer hover:text-foreground transition-colors',
                      isActive && 'text-foreground',
                      col.className
                    )}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {isSortable && <SortIcon colKey={col.key} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-sm text-muted-foreground">
                  {search.trim() ? `No results for "${search}"` : emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    onClick={() => {
                      if (selectable) return;
                      onRowClick?.(item);
                    }}
                    className={cn(
                      'border-t border-border transition-colors',
                      'hover:bg-muted/50',
                      onRowClick && !selectable && 'cursor-pointer',
                      isSelected && 'bg-muted/70'
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-3 py-3 align-middle w-10"
                        onClick={(e) => { e.stopPropagation(); toggleRow(key); }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          className="h-4 w-4 rounded border-border cursor-pointer"
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3 align-middle', col.className)}
                        onClick={() => selectable && onRowClick?.(item)}
                      >
                        {col.render
                          ? col.render(item, isSelected)
                          : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-xs">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <span className="text-xs">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(0)} aria-label="First page">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs font-medium text-foreground tabular-nums">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} aria-label="Last page">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
