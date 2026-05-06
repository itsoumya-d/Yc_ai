import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  getSettings, saveSettings, getProviderConfigs, saveProviderApiKey, getProviderApiKey,
} from '@/lib/storage';
import type { LLMProvider } from '@/types/database';
import {
  Settings,
  Brain,
  Users,
  Code,
  Rocket,
  Keyboard,
  Shield,
  Info,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';

type SettingsSection = 'general' | 'providers' | 'team' | 'editor' | 'deployment' | 'keyboard' | 'privacy' | 'about';

const settingsNav: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'providers', label: 'LLM Providers', icon: Brain },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'editor', label: 'Editor', icon: Code },
  { id: 'deployment', label: 'Deployment', icon: Rocket },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
];

const PROVIDER_LABELS: Record<LLMProvider, { name: string; logo: string }> = {
  openai: { name: 'OpenAI', logo: 'OAI' },
  anthropic: { name: 'Anthropic', logo: 'ANT' },
  google: { name: 'Google AI', logo: 'GEM' },
  ollama: { name: 'Ollama (Local)', logo: 'OLL' },
};

export function SettingsView() {
  const { providerConfigs, setProviderConfigs, theme, setTheme, editorFontSize, setEditorFontSize } = useAppStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('providers');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testStatuses, setTestStatuses] = useState<Record<string, 'idle' | 'testing' | 'valid' | 'invalid'>>({});
  const [saveMsg, setSaveMsg] = useState('');

  // Load stored API keys
  useEffect(() => {
    const keys: Record<string, string> = {};
    for (const cfg of providerConfigs) {
      keys[cfg.provider] = getProviderApiKey(cfg.provider);
    }
    setApiKeys(keys);
  }, [providerConfigs]);

  const showSave = useCallback((msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2000);
  }, []);

  const toggleKeyVisibility = (name: string) => {
    setShowKeys((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveApiKey = useCallback((provider: LLMProvider) => {
    const key = apiKeys[provider] || '';
    saveProviderApiKey(provider, key);
    // Refresh configs in store
    setProviderConfigs(getProviderConfigs());
    showSave(`${PROVIDER_LABELS[provider].name} key saved`);
  }, [apiKeys, setProviderConfigs, showSave]);

  const handleTestApiKey = useCallback(async (provider: LLMProvider) => {
    const key = apiKeys[provider] || '';
    if (!key) {
      setTestStatuses((prev) => ({ ...prev, [provider]: 'invalid' }));
      return;
    }
    setTestStatuses((prev) => ({ ...prev, [provider]: 'testing' }));

    try {
      let url = '';
      const headers: Record<string, string> = {};

      if (provider === 'openai') {
        url = 'https://api.openai.com/v1/models';
        headers.Authorization = `Bearer ${key}`;
      } else if (provider === 'anthropic') {
        url = 'https://api.anthropic.com/v1/models';
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      } else {
        // For Google/Ollama, just validate key non-empty
        setTestStatuses((prev) => ({ ...prev, [provider]: key ? 'valid' : 'invalid' }));
        return;
      }

      const res = await fetch(url, { headers });
      setTestStatuses((prev) => ({ ...prev, [provider]: res.ok ? 'valid' : 'invalid' }));
    } catch {
      setTestStatuses((prev) => ({ ...prev, [provider]: 'invalid' }));
    }
  }, [apiKeys]);

  const handleThemeChange = useCallback((t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    saveSettings({ theme: t });
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    showSave('Theme updated');
  }, [setTheme, showSave]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
        <Settings className="h-4 w-4 text-primary" />
        <h2 className="font-heading text-sm font-semibold text-text-primary">Settings</h2>
      </div>

      {/* Save toast */}
      {saveMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-success px-3 py-2 text-xs font-medium text-white shadow-2">
          <Check className="h-3.5 w-3.5" /> {saveMsg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <div className="flex w-48 flex-col border-r border-border-default bg-bg-surface p-2">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors',
                  activeSection === item.id
                    ? 'bg-bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:bg-bg-surface-hover/50 hover:text-text-primary'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === 'providers' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="mb-1 font-heading text-base font-semibold text-text-primary">LLM Providers</h3>
                <p className="text-xs text-text-secondary">Configure API keys and default models for each provider.</p>
              </div>

              <div className="space-y-4">
                {providerConfigs.map((config) => {
                  const label = PROVIDER_LABELS[config.provider] || { name: config.provider, logo: '?' };
                  const testStatus = testStatuses[config.provider] || 'idle';

                  return (
                    <div key={config.provider} className="rounded-lg border border-border-default bg-bg-surface p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                            {label.logo}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">{label.name}</div>
                            {config.last_checked && (
                              <div className="text-[10px] text-text-tertiary">Last checked: {new Date(config.last_checked).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {config.status === 'connected' && (
                            <span className="flex items-center gap-1 text-[11px] text-success">
                              <Check className="h-3 w-3" /> Connected
                            </span>
                          )}
                          {config.status === 'disconnected' && (
                            <span className="text-[11px] text-text-tertiary">Not configured</span>
                          )}
                          {config.status === 'error' && (
                            <span className="flex items-center gap-1 text-[11px] text-error">
                              <AlertTriangle className="h-3 w-3" /> Error
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-[11px] text-text-secondary">API Key</label>
                          <div className="flex items-center gap-2">
                            <input
                              type={showKeys[config.provider] ? 'text' : 'password'}
                              value={apiKeys[config.provider] || ''}
                              onChange={(e) => setApiKeys((prev) => ({ ...prev, [config.provider]: e.target.value }))}
                              placeholder="Enter API key..."
                              className="h-8 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-2.5 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                            />
                            <button
                              onClick={() => toggleKeyVisibility(config.provider)}
                              className="rounded-md border border-border-default p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary"
                            >
                              {showKeys[config.provider] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => handleTestApiKey(config.provider)}
                              disabled={testStatus === 'testing'}
                              className="rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover disabled:opacity-50"
                            >
                              {testStatus === 'testing' ? 'Testing...' : 'Test'}
                            </button>
                            <button
                              onClick={() => handleSaveApiKey(config.provider)}
                              className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-text-on-color hover:bg-primary-active"
                            >
                              Save
                            </button>
                          </div>
                          {testStatus === 'valid' && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-success"><Check className="h-3 w-3" /> Key verified</div>
                          )}
                          {testStatus === 'invalid' && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-error"><AlertTriangle className="h-3 w-3" /> Invalid key</div>
                          )}
                        </div>

                        {config.api_key_set && config.models.length > 0 && (
                          <div>
                            <label className="mb-1 block text-[11px] text-text-secondary">Default Model</label>
                            <div className="flex h-8 items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-2.5 text-xs text-text-primary">
                              <span>{config.default_model}</span>
                            </div>
                            {config.models.length > 1 && (
                              <div className="mt-1 text-[10px] text-text-tertiary">
                                Available: {config.models.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button className="flex items-center gap-2 rounded-lg border border-dashed border-border-default px-4 py-3 text-xs text-text-tertiary transition-colors hover:border-border-emphasis hover:text-text-secondary">
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Provider
                </button>
              </div>
            </div>
          )}

          {activeSection === 'general' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="mb-1 font-heading text-base font-semibold text-text-primary">General</h3>
                <p className="text-xs text-text-secondary">Application preferences and behavior settings.</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-3">
                  <div>
                    <div className="mb-2 text-xs font-medium text-text-primary">Theme</div>
                    <div className="flex gap-2">
                      {(['dark', 'light', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleThemeChange(t)}
                          className={cn(
                            'rounded-md px-4 py-2 text-xs capitalize',
                            theme === t
                              ? 'bg-primary text-text-on-color'
                              : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-default pt-3">
                    <div>
                      <div className="text-xs font-medium text-text-primary">Auto-save</div>
                      <div className="text-[11px] text-text-tertiary">Automatically save agent changes</div>
                    </div>
                    <div className="flex h-5 w-9 items-center rounded-full bg-primary px-0.5">
                      <div className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-text-primary">Telemetry</div>
                      <div className="text-[11px] text-text-tertiary">Send anonymous usage data</div>
                    </div>
                    <div className="flex h-5 w-9 items-center rounded-full bg-border-default px-0.5">
                      <div className="h-4 w-4 rounded-full bg-text-tertiary transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'editor' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="mb-1 font-heading text-base font-semibold text-text-primary">Editor Preferences</h3>
                <p className="text-xs text-text-secondary">Configure the visual editor and code editor behavior.</p>
              </div>
              <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-text-primary">Grid Snap</div>
                    <div className="text-[11px] text-text-tertiary">Snap nodes to grid when dragging</div>
                  </div>
                  <div className="flex h-5 w-9 items-center rounded-full bg-primary px-0.5">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-text-primary">Show Minimap</div>
                    <div className="text-[11px] text-text-tertiary">Display minimap in the editor canvas</div>
                  </div>
                  <div className="flex h-5 w-9 items-center rounded-full bg-primary px-0.5">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-text-primary">Font Size (Code)</div>
                    <div className="text-[11px] text-text-tertiary">Font size in prompt and code editors</div>
                  </div>
                  <select
                    value={editorFontSize}
                    onChange={(e) => { const s = Number(e.target.value); setEditorFontSize(s); saveSettings({ editorFontSize: s }); }}
                    className="h-7 w-20 rounded-md border border-border-default bg-bg-surface-raised px-2 text-right font-mono text-xs text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value={11}>11</option>
                    <option value={12}>12</option>
                    <option value={13}>13</option>
                    <option value={14}>14</option>
                    <option value={15}>15</option>
                    <option value={16}>16</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-text-primary">Word Wrap</div>
                    <div className="text-[11px] text-text-tertiary">Wrap long lines in editors</div>
                  </div>
                  <div className="flex h-5 w-9 items-center rounded-full bg-primary px-0.5">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="mb-1 font-heading text-base font-semibold text-text-primary">About AgentForge</h3>
                <p className="text-xs text-text-secondary">Visual AI Agent IDE</p>
              </div>
              <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Version</span>
                  <span className="font-mono text-text-primary">0.1.0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Electron</span>
                  <span className="font-mono text-text-primary">34.2.0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">React</span>
                  <span className="font-mono text-text-primary">19.2.3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Node.js</span>
                  <span className="font-mono text-text-primary">20.x</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Platform</span>
                  <span className="font-mono text-text-primary">macOS (darwin)</span>
                </div>
              </div>
              <div className="rounded-lg border border-border-default bg-bg-surface p-4">
                <p className="text-xs text-text-secondary">
                  AgentForge is a desktop IDE for building, testing, and deploying AI agents using a visual node-based editor.
                  Built with Electron, React, and React Flow.
                </p>
              </div>
            </div>
          )}

          {/* Other sections render placeholder */}
          {!['providers', 'general', 'about', 'editor'].includes(activeSection) && (
            <div className="max-w-2xl">
              <h3 className="mb-1 font-heading text-base font-semibold capitalize text-text-primary">{activeSection}</h3>
              <p className="text-xs text-text-secondary">Configure {activeSection} settings for AgentForge.</p>
              <div className="mt-4 rounded-lg border border-dashed border-border-default p-8 text-center text-xs text-text-tertiary">
                Settings content for {activeSection} will appear here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
