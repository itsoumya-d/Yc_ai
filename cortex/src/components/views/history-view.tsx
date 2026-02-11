import { useState, useMemo, useCallback } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { getQueries, toggleBookmark, deleteQuery, formatRelativeDate } from '@/lib/storage';
import { useQueryEngine } from '@/hooks/useQueryEngine';
import { Search, Bookmark, BookmarkCheck, Play, Copy, Trash2, BarChart3, LineChart, PieChart, Table, Clock } from 'lucide-react';
import type { ChartType } from '@/types/database';

const chartIcons: Record<string, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  table: Table,
  area: LineChart,
  scatter: BarChart3,
  kpi: BarChart3,
  heatmap: BarChart3,
};

type FilterMode = 'all' | 'bookmarked';

export function HistoryView() {
  const { setView, setCurrentQuery } = useAppStore();
  const { runQuery } = useQueryEngine();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState(0);

  const queries = useMemo(() => getQueries(), [forceUpdate]);

  const filtered = useMemo(() =>
    queries
      .filter((q) => filter === 'all' || q.bookmarked)
      .filter((q) =>
        q.natural_language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((t) => t.includes(searchQuery.toLowerCase()))
      ),
    [queries, filter, searchQuery],
  );

  const handleRerun = useCallback((nl: string) => {
    setCurrentQuery(nl);
    setView('workspace');
    // Small delay so view transition happens first
    setTimeout(() => runQuery(nl), 100);
  }, [setCurrentQuery, setView, runQuery]);

  const handleCopySQL = useCallback((sql: string) => {
    navigator.clipboard.writeText(sql);
  }, []);

  const handleToggleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
    forceUpdate((n) => n + 1);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteQuery(id);
    forceUpdate((n) => n + 1);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="data-heading text-lg text-text-primary">Query History</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{queries.length} queries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries..."
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
            />
          </div>
          <div className="flex rounded-md border border-border-default">
            <button
              onClick={() => setFilter('all')}
              className={cn('px-3 py-1.5 text-xs', filter === 'all' ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:text-text-primary')}
            >
              All
            </button>
            <button
              onClick={() => setFilter('bookmarked')}
              className={cn('flex items-center gap-1 border-l border-border-default px-3 py-1.5 text-xs', filter === 'bookmarked' ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:text-text-primary')}
            >
              <Bookmark className="h-3 w-3" /> Saved
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-surface-raised">
              <Clock className="h-6 w-6 text-text-tertiary" />
            </div>
            <h2 className="text-sm font-medium text-text-primary">
              {queries.length === 0 ? 'No queries yet' : 'No matching queries'}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {queries.length === 0 ? 'Run a query from the Workspace to see it here.' : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {filtered.map((q) => {
              const ChartIcon = chartIcons[q.chart_type] ?? BarChart3;
              return (
                <div key={q.id} className="group flex items-start gap-4 px-6 py-4 hover:bg-bg-surface">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-surface-raised">
                    <ChartIcon className="h-4 w-4 text-primary-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-primary">{q.natural_language}</span>
                      {q.status === 'error' && (
                        <span className="rounded bg-status-error/15 px-1.5 py-0.5 text-[10px] text-status-error">Error</span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-mono text-xs text-text-tertiary">{q.generated_sql}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] text-text-tertiary">{q.rows_returned} rows</span>
                      <span className="text-[10px] text-text-tertiary">{formatDuration(q.execution_time_ms)}</span>
                      {q.tags.map((t) => (
                        <span key={t} className="rounded bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="mr-2 text-xs text-text-tertiary">{formatRelativeDate(q.created_at)}</span>
                    <button
                      onClick={() => handleRerun(q.natural_language)}
                      className="rounded p-1.5 text-text-tertiary opacity-0 hover:bg-bg-surface-raised hover:text-text-secondary group-hover:opacity-100"
                      title="Re-run query"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopySQL(q.generated_sql)}
                      className="rounded p-1.5 text-text-tertiary opacity-0 hover:bg-bg-surface-raised hover:text-text-secondary group-hover:opacity-100"
                      title="Copy SQL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={cn('rounded p-1.5', q.bookmarked ? 'text-chart-amber' : 'text-text-tertiary opacity-0 group-hover:opacity-100 hover:bg-bg-surface-raised hover:text-text-secondary')}
                      title={q.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {q.bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="rounded p-1.5 text-text-tertiary opacity-0 hover:bg-bg-surface-raised hover:text-status-error group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
