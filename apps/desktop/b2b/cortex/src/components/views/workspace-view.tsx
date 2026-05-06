import { useState, useMemo, useCallback, KeyboardEvent } from 'react';
import { cn, formatNumber, formatDuration } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useQueryEngine } from '@/hooks/useQueryEngine';
import { toggleBookmark, generateId } from '@/lib/storage';
import {
  Sparkles, Play, Copy, Bookmark, BookmarkCheck, Table, BarChart3,
  LineChart, PieChart, Download, Upload, AlertCircle,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

type ViewMode = 'chart' | 'table' | 'sql';

export function WorkspaceView() {
  const {
    queryStatus, currentQuery, setCurrentQuery,
    currentSQL, queryResults, queryColumns,
    queryError, executionTimeMs, aiInsight,
    chartType, schemaTables,
  } = useAppStore();

  const { runQuery, loadFile, refreshSchema } = useQueryEngine();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [queryInput, setQueryInput] = useState(currentQuery);
  const [lastQueryId, setLastQueryId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleRun = useCallback(async () => {
    if (!queryInput.trim()) return;
    setIsBookmarked(false);
    const id = generateId();
    setLastQueryId(id);
    await runQuery(queryInput);
  }, [queryInput, runQuery]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  }, [handleRun]);

  const handleLoadFile = useCallback(async () => {
    const result = await loadFile();
    if (result) {
      await refreshSchema();
    }
  }, [loadFile, refreshSchema]);

  const handleBookmark = useCallback(() => {
    if (lastQueryId) {
      const result = toggleBookmark(lastQueryId);
      setIsBookmarked(result);
    }
  }, [lastQueryId]);

  const handleCopySQL = useCallback(() => {
    if (currentSQL) {
      navigator.clipboard.writeText(currentSQL);
    }
  }, [currentSQL]);

  // Compute KPI cards from query results
  const kpis = useMemo(() => {
    if (queryResults.length === 0 || queryColumns.length === 0) return [];

    // Find numeric columns for KPI display
    const numericCols = queryColumns.filter((col) => {
      const firstVal = queryResults[0]?.[col];
      return typeof firstVal === 'number';
    });

    return numericCols.slice(0, 4).map((col) => {
      const values = queryResults.map((r) => Number(r[col]) || 0);
      const total = values.reduce((a, b) => a + b, 0);
      const avg = total / values.length;

      // Calculate change from first half to second half
      const mid = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, mid).reduce((a, b) => a + b, 0) / (mid || 1);
      const secondHalf = values.slice(mid).reduce((a, b) => a + b, 0) / ((values.length - mid) || 1);
      const changePct = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      return {
        label: col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: total >= 1000 ? formatNumber(total) : total.toFixed(total % 1 === 0 ? 0 : 2),
        change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`,
        good: changePct >= 0,
      };
    });
  }, [queryResults, queryColumns]);

  // Chart data: use first string column as labels, first numeric column as values
  const chartData = useMemo(() => {
    if (queryResults.length === 0) return [];

    const labelCol = queryColumns.find((col) => typeof queryResults[0]?.[col] === 'string') || queryColumns[0];
    const valueCols = queryColumns.filter((col) => typeof queryResults[0]?.[col] === 'number');
    const valueCol = valueCols[0];

    if (!labelCol || !valueCol) return [];

    return queryResults.slice(0, 50).map((row) => ({
      label: String(row[labelCol] ?? ''),
      value: Number(row[valueCol] ?? 0),
    }));
  }, [queryResults, queryColumns]);

  const maxChartValue = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);

  const hasData = queryResults.length > 0;
  const isRunning = queryStatus === 'running';
  const hasSchema = schemaTables.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Query Bar */}
      <div className="border-b border-border-default px-6 py-4">
        <div className="query-bar flex items-center gap-3 rounded-xl px-4 py-3">
          <Sparkles className="h-5 w-5 shrink-0 text-primary-light" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            placeholder={hasSchema ? 'Ask your data a question...' : 'Load a CSV or SQLite file first...'}
          />
          <button
            onClick={handleLoadFile}
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
          >
            <Upload className="h-3.5 w-3.5" /> Load File
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || !queryInput.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium text-white',
              isRunning ? 'bg-primary-DEFAULT/50 cursor-wait' : 'bg-primary-DEFAULT hover:bg-primary-light',
            )}
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Empty state */}
        {!hasData && queryStatus === 'idle' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle">
              <Sparkles className="h-8 w-8 text-primary-light" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">Ask your data a question</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              {hasSchema
                ? `${schemaTables.length} table${schemaTables.length > 1 ? 's' : ''} loaded. Type a natural language question and press Run.`
                : 'Load a CSV or SQLite file to get started. Click "Load File" above.'}
            </p>
            {hasSchema && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Show all rows', 'What columns are available?', 'Count rows per category'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQueryInput(q); }}
                    className="rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-primary-DEFAULT hover:text-primary-light"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {queryError && (
          <div className="rounded-lg border border-status-error/30 bg-status-error/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-status-error" />
              <span className="text-xs font-medium text-status-error">Query Error</span>
            </div>
            <p className="text-sm text-text-secondary font-mono">{queryError}</p>
          </div>
        )}

        {/* KPI Cards */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-lg border border-border-default bg-bg-surface p-4">
                <div className="mb-1 text-[10px] text-text-tertiary">{k.label}</div>
                <div className="flex items-end justify-between">
                  <span className="kpi-value text-2xl text-text-primary">{k.value}</span>
                  <span className={cn('flex items-center gap-0.5 text-xs font-medium', k.good ? 'text-status-success' : 'text-status-error')}>
                    {k.good ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {k.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Area */}
        {(hasData || currentSQL) && (
          <div className="rounded-lg border border-border-default bg-bg-surface">
            {/* View Toggle */}
            <div className="flex items-center justify-between border-b border-border-default px-4 py-2">
              <div className="flex items-center gap-1">
                {[
                  { mode: 'chart' as const, icon: BarChart3, label: 'Chart' },
                  { mode: 'table' as const, icon: Table, label: 'Table' },
                  { mode: 'sql' as const, icon: Copy, label: 'SQL' },
                ].map((v) => (
                  <button
                    key={v.mode}
                    onClick={() => setViewMode(v.mode)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors',
                      viewMode === v.mode ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    <v.icon className="h-3.5 w-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleBookmark}
                  className={cn('rounded-md p-1.5', isBookmarked ? 'text-chart-amber' : 'text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary')}
                >
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleCopySQL}
                  className="rounded-md p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chart View */}
            {viewMode === 'chart' && chartData.length > 0 && (
              <div className="p-6">
                <h3 className="mb-4 text-sm font-medium text-text-primary">
                  {currentQuery || 'Query Results'}
                </h3>
                <div className="flex items-end gap-2" style={{ height: 240 }}>
                  {chartData.map((d, i) => {
                    const height = (d.value / maxChartValue) * 100;
                    return (
                      <div key={`${d.label}-${i}`} className="group flex flex-1 flex-col items-center gap-1">
                        <div className="relative w-full flex items-end justify-center" style={{ height: 200 }}>
                          <div
                            className="w-full max-w-8 rounded-t bg-primary-DEFAULT transition-all group-hover:bg-primary-light"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute -top-6 hidden rounded bg-bg-surface-overlay px-2 py-1 text-[10px] text-text-primary group-hover:block whitespace-nowrap">
                            {formatNumber(d.value)}
                          </div>
                        </div>
                        <span className="text-[10px] text-text-tertiary truncate max-w-full">{d.label.length > 10 ? `${d.label.slice(0, 10)}…` : d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chart empty state */}
            {viewMode === 'chart' && chartData.length === 0 && hasData && (
              <div className="p-6 text-center text-sm text-text-tertiary">
                No numeric data to chart. Switch to Table view.
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && hasData && (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr className="border-b border-border-default">
                      {queryColumns.map((col) => (
                        <th key={col} className="px-4 py-2 text-left">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.slice(0, 200).map((row, i) => (
                      <tr key={i} className="border-b border-border-subtle hover:bg-bg-surface-raised">
                        {queryColumns.map((col) => (
                          <td key={col} className="px-4 py-2 text-text-primary">
                            {row[col] === null ? <span className="text-text-tertiary italic">null</span> : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queryResults.length > 200 && (
                  <div className="px-4 py-2 text-xs text-text-tertiary">
                    Showing 200 of {queryResults.length} rows
                  </div>
                )}
              </div>
            )}

            {/* SQL View */}
            {viewMode === 'sql' && currentSQL && (
              <div className="p-4">
                <pre className="sql-code rounded-lg bg-bg-root p-4 overflow-x-auto">
                  <code className="text-text-primary">{currentSQL}</code>
                </pre>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-text-tertiary">
                  <span>Execution time: {formatDuration(executionTimeMs)}</span>
                  <span>Rows: {queryResults.length}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Running indicator */}
        {isRunning && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary-light" />
              <span className="text-sm text-text-secondary">Generating SQL and executing query...</span>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsight && queryStatus === 'success' && (
          <div className="rounded-lg border border-primary-muted bg-primary-subtle p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-light" />
              <span className="text-xs font-medium text-primary-light">AI Insight</span>
            </div>
            <p className="text-sm text-text-secondary">{aiInsight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
