import { useState, useEffect, useCallback } from 'react';
import { cn, getConnectionStatusDot, getConnectionLabel, getConnectionIcon } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings, getConnections, saveConnection, removeConnection, generateId } from '@/lib/storage';
import { useQueryEngine } from '@/hooks/useQueryEngine';
import type { ConnectionType, DataSource } from '@/types/database';
import { Settings, Database, Key, Palette, Plus, TestTube, Trash2, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';

const settingSections = [
  { id: 'connections', label: 'Connections', icon: Database },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsView() {
  const {
    connections: storeConnections, setConnections,
    openaiApiKey, setOpenaiApiKey,
    theme, setTheme,
    sqlFontSize, setSqlFontSize,
  } = useAppStore();

  const { loadFile, refreshSchema } = useQueryEngine();
  const [activeSection, setActiveSection] = useState('connections');
  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey);
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [showNewConn, setShowNewConn] = useState(false);
  const [newConnName, setNewConnName] = useState('');
  const [newConnType, setNewConnType] = useState<ConnectionType>('csv');

  // Load settings on mount
  useEffect(() => {
    const settings = getSettings();
    setOpenaiApiKey(settings.openaiApiKey);
    setTheme(settings.theme);
    setSqlFontSize(settings.sqlFontSize);
    setApiKeyInput(settings.openaiApiKey);

    const conns = getConnections();
    setConnections(conns);
  }, [setOpenaiApiKey, setTheme, setSqlFontSize, setConnections]);

  const handleSaveApiKey = useCallback(() => {
    setOpenaiApiKey(apiKeyInput);
    saveSettings({ openaiApiKey: apiKeyInput });
    setApiKeyStatus(apiKeyInput.startsWith('sk-') ? 'valid' : apiKeyInput ? 'invalid' : 'idle');
  }, [apiKeyInput, setOpenaiApiKey]);

  const handleThemeChange = useCallback((t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    saveSettings({ theme: t });
    if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [setTheme]);

  const handleFontSizeChange = useCallback((size: number) => {
    setSqlFontSize(size);
    saveSettings({ sqlFontSize: size });
  }, [setSqlFontSize]);

  const handleLoadFile = useCallback(async () => {
    const result = await loadFile();
    if (result) {
      // Create a connection record for the loaded file
      const conn: DataSource = {
        id: generateId(),
        name: 'tableName' in result ? (result as { tableName: string }).tableName : 'imported_data',
        type: 'csv',
        status: 'connected',
        tables: 1,
        last_synced: new Date().toISOString(),
      };
      saveConnection(conn);
      setConnections(getConnections());
      await refreshSchema();
    }
  }, [loadFile, refreshSchema, setConnections]);

  const handleRemoveConnection = useCallback(async (id: string) => {
    removeConnection(id);
    setConnections(getConnections());
  }, [setConnections]);

  return (
    <div className="flex h-full">
      {/* Settings Nav */}
      <div className="w-56 border-r border-border-default bg-bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary-light" />
          <h2 className="text-sm font-medium text-text-primary">Settings</h2>
        </div>
        <nav className="space-y-0.5">
          {settingSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
                activeSection === s.id ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Connections */}
        {activeSection === 'connections' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="data-heading text-sm text-text-primary">Data Connections</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadFile}
                  className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-light"
                >
                  <Upload className="h-3.5 w-3.5" /> Load File
                </button>
              </div>
            </div>

            {storeConnections.length === 0 ? (
              <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
                <Database className="mx-auto mb-3 h-8 w-8 text-text-tertiary" />
                <p className="text-sm text-text-secondary">No connections yet</p>
                <p className="mt-1 text-xs text-text-tertiary">Load a CSV or SQLite file to create your first connection.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {storeConnections.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border-default bg-bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-raised text-lg">
                          {getConnectionIcon(c.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{c.name}</span>
                            <div className={cn('h-2 w-2 rounded-full', getConnectionStatusDot(c.status))} />
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {getConnectionLabel(c.type)}
                            {c.host ? ` — ${c.host}:${c.port}` : ''} — {c.tables} table{c.tables > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-tertiary">
                          {c.last_synced ? new Date(c.last_synced).toLocaleString() : '—'}
                        </span>
                        <button
                          onClick={() => handleRemoveConnection(c.id)}
                          className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-status-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* API Keys */}
        {activeSection === 'api' && (
          <section>
            <h3 className="data-heading mb-4 text-sm text-text-primary">API Keys</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => { setApiKeyInput(e.target.value); setApiKeyStatus('idle'); }}
                    placeholder="sk-..."
                    className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                  />
                  {apiKeyStatus === 'valid' && (
                    <div className="flex items-center gap-1 rounded-md border border-status-success px-3 py-1.5 text-xs text-status-success">
                      <CheckCircle className="h-3 w-3" /> Saved
                    </div>
                  )}
                  {apiKeyStatus === 'invalid' && (
                    <div className="flex items-center gap-1 rounded-md border border-status-error px-3 py-1.5 text-xs text-status-error">
                      <XCircle className="h-3 w-3" /> Invalid
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-text-tertiary">Used for NL-to-SQL, chart recommendations, and AI insights</p>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
              >
                Save API Keys
              </button>
            </div>
          </section>
        )}

        {/* Appearance */}
        {activeSection === 'appearance' && (
          <section>
            <h3 className="data-heading mb-4 text-sm text-text-primary">Appearance</h3>
            <div className="max-w-lg rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-medium text-text-primary">Theme</div>
                  <div className="flex gap-2">
                    {(['dark', 'light', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        className={cn(
                          'rounded-md px-4 py-2 text-xs capitalize',
                          theme === t ? 'bg-primary-muted text-primary-light' : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium text-text-primary">SQL Font Size</div>
                  <select
                    value={sqlFontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                  >
                    <option value={12}>12px</option>
                    <option value={13}>13px</option>
                    <option value={14}>14px</option>
                    <option value={15}>15px</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
