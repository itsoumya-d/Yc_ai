import { useState, useEffect, useCallback } from 'react';
import { cn, formatNumber, formatBytes } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useQueryEngine } from '@/hooks/useQueryEngine';
import { Database, Table, Key, ChevronRight, ChevronDown, Search, Hash, Type, Calendar, ToggleLeft, Upload, RefreshCw, Trash2 } from 'lucide-react';

function getTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('int') || t.includes('decimal') || t.includes('numeric') || t.includes('real') || t.includes('float')) return Hash;
  if (t.includes('timestamp') || t.includes('date') || t.includes('time')) return Calendar;
  if (t.includes('bool')) return ToggleLeft;
  return Type;
}

export function SchemaView() {
  const { schemaTables } = useAppStore();
  const { refreshSchema, loadFile } = useQueryEngine();

  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh schema on mount
  useEffect(() => {
    refreshSchema();
  }, [refreshSchema]);

  // Auto-expand first table
  useEffect(() => {
    if (schemaTables.length > 0 && !expandedTable && schemaTables[0]) {
      setExpandedTable(schemaTables[0].name);
    }
  }, [schemaTables, expandedTable]);

  const handleDropTable = useCallback(async (tableName: string) => {
    if (!window.electronAPI?.dropTable) return;
    await window.electronAPI.dropTable(tableName);
    await refreshSchema();
    if (expandedTable === tableName) setExpandedTable(null);
  }, [expandedTable, refreshSchema]);

  const handleLoadFile = useCallback(async () => {
    await loadFile();
  }, [loadFile]);

  const filtered = schemaTables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.columns.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const schemas = [...new Set(filtered.map((t) => t.schema))];
  const totalRows = schemaTables.reduce((a, t) => a + t.row_count, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="data-heading text-lg text-text-primary">Schema Explorer</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {schemaTables.length} table{schemaTables.length !== 1 ? 's' : ''} — {formatNumber(totalRows)} total rows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables & columns..."
              className="h-9 w-64 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
            />
          </div>
          <button
            onClick={() => refreshSchema()}
            className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={handleLoadFile}
            className="flex items-center gap-1.5 rounded-md bg-primary-DEFAULT px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-light"
          >
            <Upload className="h-3.5 w-3.5" /> Load File
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {schemaTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-raised">
              <Database className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No tables loaded</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Load a CSV or SQLite file to explore its schema. Click "Load File" above to get started.
            </p>
          </div>
        ) : (
          schemas.map((schema) => (
            <div key={schema} className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary-light" />
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{schema}</span>
              </div>
              <div className="space-y-2">
                {filtered.filter((t) => t.schema === schema).map((table) => {
                  const isExpanded = expandedTable === table.name;
                  return (
                    <div key={table.name} className="rounded-lg border border-border-default bg-bg-surface overflow-hidden">
                      <button
                        onClick={() => setExpandedTable(isExpanded ? null : table.name)}
                        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-bg-surface-raised"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-text-tertiary" /> : <ChevronRight className="h-4 w-4 text-text-tertiary" />}
                        <Table className="h-4 w-4 text-primary-light" />
                        <span className="flex-1 text-left text-sm font-medium text-text-primary">{table.name}</span>
                        <span className="text-xs text-text-tertiary">{table.columns.length} cols</span>
                        <span className="text-xs text-text-tertiary">{formatNumber(table.row_count)} rows</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDropTable(table.name); }}
                          className="rounded p-1 text-text-tertiary hover:text-status-error hover:bg-bg-surface-raised"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border-default">
                          <table className="data-table w-full">
                            <thead>
                              <tr className="border-b border-border-default bg-bg-root">
                                <th className="px-4 py-2 text-left">Column</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-center">Nullable</th>
                                <th className="px-4 py-2 text-center">PK</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((col) => {
                                const TypeIcon = getTypeIcon(col.type);
                                return (
                                  <tr key={col.name} className="border-b border-border-subtle hover:bg-bg-surface-raised">
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-2">
                                        {col.primary_key && <Key className="h-3 w-3 text-chart-amber" />}
                                        <span className={cn('text-xs', col.primary_key ? 'font-medium text-text-primary' : 'text-text-secondary')}>
                                          {col.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-1.5">
                                        <TypeIcon className="h-3 w-3 text-text-tertiary" />
                                        <span className="font-mono text-xs text-chart-cyan">{col.type}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-center text-xs text-text-tertiary">
                                      {col.nullable ? 'yes' : 'no'}
                                    </td>
                                    <td className="px-4 py-2 text-center text-xs text-text-tertiary">
                                      {col.primary_key ? '✓' : ''}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
