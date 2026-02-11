import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { naturalLanguageToSQL, generateInsight } from '@/lib/nl-to-sql';
import { saveQuery, generateId } from '@/lib/storage';
import type { QueryRecord } from '@/types/database';

/**
 * Hook that provides the full query pipeline:
 * 1. NL → SQL (OpenAI)
 * 2. SQL → Execute (Electron IPC → SQLite)
 * 3. Results → Display + AI Insight
 */
export function useQueryEngine() {
  const store = useAppStore();

  const runQuery = useCallback(async (question: string) => {
    const {
      openaiApiKey, schemaTables,
      setQueryStatus, setCurrentQuery, setCurrentSQL,
      setQueryResults, setQueryColumns, setQueryError,
      setExecutionTimeMs, setAiInsight, setChartType,
      activeDataSourceId,
    } = useAppStore.getState();

    if (!question.trim()) return;

    setCurrentQuery(question);
    setQueryStatus('running');
    setQueryError(null);
    setAiInsight(null);
    setQueryResults([]);
    setQueryColumns([]);

    try {
      // Step 1: Convert NL to SQL
      const { sql, chartType, insight } = await naturalLanguageToSQL(
        question,
        schemaTables,
        openaiApiKey,
      );

      setCurrentSQL(sql);
      setChartType(chartType);
      setAiInsight(insight);

      // Step 2: Execute SQL via Electron IPC
      if (!window.electronAPI?.executeSQL) {
        throw new Error('Database service not available. Run in Electron to execute queries.');
      }

      const result = await window.electronAPI.executeSQL(sql);
      setQueryResults(result.rows);
      setQueryColumns(result.columns);
      setExecutionTimeMs(result.executionTimeMs);
      setQueryStatus('success');

      // Step 3: Save to history
      const queryRecord: QueryRecord = {
        id: generateId(),
        natural_language: question,
        generated_sql: sql,
        chart_type: chartType,
        status: 'success',
        rows_returned: result.rowCount,
        execution_time_ms: result.executionTimeMs,
        created_at: new Date().toISOString(),
        bookmarked: false,
        tags: [],
        data_source_id: activeDataSourceId || 'local',
      };
      saveQuery(queryRecord);

      // Step 4: Generate deeper insight from actual results (non-blocking)
      if (openaiApiKey && result.rows.length > 0) {
        generateInsight(question, sql, result.rows, openaiApiKey)
          .then((deepInsight) => {
            if (deepInsight) {
              useAppStore.getState().setAiInsight(deepInsight);
            }
          })
          .catch(() => {
            // Keep the initial insight from NL-to-SQL
          });
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setQueryError(message);
      setQueryStatus('error');

      // Save failed query to history
      const failedRecord: QueryRecord = {
        id: generateId(),
        natural_language: question,
        generated_sql: useAppStore.getState().currentSQL || '',
        chart_type: 'table',
        status: 'error',
        rows_returned: 0,
        execution_time_ms: 0,
        created_at: new Date().toISOString(),
        bookmarked: false,
        tags: [],
        data_source_id: activeDataSourceId || 'local',
      };
      saveQuery(failedRecord);
    }
  }, []);

  const runSQL = useCallback(async (sql: string) => {
    const {
      setQueryStatus, setCurrentSQL,
      setQueryResults, setQueryColumns, setQueryError,
      setExecutionTimeMs, activeDataSourceId,
    } = useAppStore.getState();

    setCurrentSQL(sql);
    setQueryStatus('running');
    setQueryError(null);
    setQueryResults([]);
    setQueryColumns([]);

    try {
      if (!window.electronAPI?.executeSQL) {
        throw new Error('Database service not available. Run in Electron to execute queries.');
      }

      const result = await window.electronAPI.executeSQL(sql);
      setQueryResults(result.rows);
      setQueryColumns(result.columns);
      setExecutionTimeMs(result.executionTimeMs);
      setQueryStatus('success');

      // Save to history
      const queryRecord: QueryRecord = {
        id: generateId(),
        natural_language: `[Direct SQL] ${sql.slice(0, 80)}...`,
        generated_sql: sql,
        chart_type: 'table',
        status: 'success',
        rows_returned: result.rowCount,
        execution_time_ms: result.executionTimeMs,
        created_at: new Date().toISOString(),
        bookmarked: false,
        tags: ['direct-sql'],
        data_source_id: activeDataSourceId || 'local',
      };
      saveQuery(queryRecord);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setQueryError(message);
      setQueryStatus('error');
    }
  }, []);

  const loadFile = useCallback(async () => {
    if (!window.electronAPI?.openFile) return;

    const filePath = await window.electronAPI.openFile();
    if (!filePath) return;

    const ext = filePath.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'csv') {
        if (!window.electronAPI.loadCSV) return;
        const result = await window.electronAPI.loadCSV(filePath);
        if (result) {
          // Refresh schema
          await refreshSchema();
          return result;
        }
      } else if (ext === 'db' || ext === 'sqlite' || ext === 'sqlite3') {
        if (!window.electronAPI.loadSQLite) return;
        const result = await window.electronAPI.loadSQLite(filePath);
        if (result) {
          await refreshSchema();
          return result;
        }
      }
    } catch (err) {
      console.error('File load error:', err);
    }
    return null;
  }, []);

  const refreshSchema = useCallback(async () => {
    if (!window.electronAPI?.getSchema) return;

    const tables = await window.electronAPI.getSchema();
    const schemaTables = tables.map((t) => ({
      name: t.name,
      schema: 'main',
      columns: t.columns.map((c) => ({
        name: c.name,
        type: c.type,
        nullable: c.nullable,
        primary_key: c.pk,
      })),
      row_count: t.rowCount,
      size_bytes: 0,
    }));

    useAppStore.getState().setSchemaTables(schemaTables);
    return schemaTables;
  }, []);

  return { runQuery, runSQL, loadFile, refreshSchema };
}
