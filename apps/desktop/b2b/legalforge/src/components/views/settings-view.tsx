import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Settings, User, Shield, Palette, Key, Globe, Check, AlertCircle } from 'lucide-react';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

type Theme = 'dark' | 'light' | 'system';

export function SettingsView() {
  const {
    openaiApiKey, setOpenaiApiKey,
    theme, setTheme,
    editorFontSize, setEditorFontSize,
    contractFont, setContractFont,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState('profile');
  const [docusignKey, setDocusignKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    const settings = getSettings();
    setDocusignKey(settings.docusignApiKey);
  }, []);

  const showSaveMessage = useCallback((msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2000);
  }, []);

  const handleSaveApiKeys = useCallback(() => {
    saveSettings({ openaiApiKey, docusignApiKey: docusignKey });
    showSaveMessage('API keys saved');
  }, [openaiApiKey, docusignKey, showSaveMessage]);

  const handleTestApiKey = useCallback(async () => {
    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      setApiKeyStatus('invalid');
      return;
    }
    setApiKeyStatus('testing');
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${openaiApiKey}` },
      });
      setApiKeyStatus(res.ok ? 'valid' : 'invalid');
    } catch {
      setApiKeyStatus('invalid');
    }
  }, [openaiApiKey]);

  const handleThemeChange = useCallback((t: Theme) => {
    setTheme(t);
    saveSettings({ theme: t });
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    showSaveMessage('Theme updated');
  }, [setTheme, showSaveMessage]);

  const handleFontSizeChange = useCallback((size: number) => {
    setEditorFontSize(size);
    saveSettings({ editorFontSize: size });
    showSaveMessage('Font size updated');
  }, [setEditorFontSize, showSaveMessage]);

  const handleContractFontChange = useCallback((font: string) => {
    setContractFont(font);
    saveSettings({ contractFont: font });
    showSaveMessage('Contract font updated');
  }, [setContractFont, showSaveMessage]);

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div className="w-56 border-r border-border-default bg-bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary-light" />
          <h2 className="text-sm font-medium text-text-primary">Settings</h2>
        </div>
        <nav className="space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
                activeSection === s.id
                  ? 'bg-primary-muted text-primary-light'
                  : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary'
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
        {/* Save toast */}
        {saveMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-safe-green px-3 py-2 text-xs font-medium text-white shadow-2">
            <Check className="h-3.5 w-3.5" /> {saveMessage}
          </div>
        )}

        {/* Profile */}
        {activeSection === 'profile' && (
          <section>
            <h3 className="legal-heading mb-4 text-sm text-text-primary">Profile</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-lg font-medium text-primary-light">
                  VA
                </div>
                <div>
                  <button className="text-xs text-primary-light hover:underline">Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-text-tertiary">First Name</label>
                  <input type="text" defaultValue="Victoria" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-tertiary">Last Name</label>
                  <input type="text" defaultValue="Ashworth" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Email</label>
                <input type="email" defaultValue="v.ashworth@firm.com" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Organization</label>
                <input type="text" defaultValue="Ashworth & Partners LLP" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none" />
              </div>
              <button className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                Save Changes
              </button>
            </div>
          </section>
        )}

        {/* API Keys */}
        {activeSection === 'api' && (
          <section>
            <h3 className="legal-heading mb-4 text-sm text-text-primary">API Keys</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => { setOpenaiApiKey(e.target.value); setApiKeyStatus('idle'); }}
                    placeholder="sk-..."
                    className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
                  />
                  <button
                    onClick={handleTestApiKey}
                    disabled={apiKeyStatus === 'testing'}
                    className="rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised disabled:opacity-50"
                  >
                    {apiKeyStatus === 'testing' ? 'Testing...' : 'Test'}
                  </button>
                </div>
                {apiKeyStatus === 'valid' && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-safe-green">
                    <Check className="h-3 w-3" /> API key is valid
                  </div>
                )}
                {apiKeyStatus === 'invalid' && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-risk-red">
                    <AlertCircle className="h-3 w-3" /> Invalid API key
                  </div>
                )}
                <p className="mt-1 text-[10px] text-text-tertiary">Required for AI contract analysis, clause generation, and Q&A.</p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">DocuSign API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={docusignKey}
                    onChange={(e) => setDocusignKey(e.target.value)}
                    placeholder="Enter DocuSign API key"
                    className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[10px] text-text-tertiary">Optional. Used for e-signature integration.</p>
              </div>
              <button
                onClick={handleSaveApiKeys}
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
            <h3 className="legal-heading mb-4 text-sm text-text-primary">Appearance</h3>
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
                          theme === t
                            ? 'bg-primary-muted text-primary-light'
                            : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium text-text-primary">Editor Font Size</div>
                  <select
                    value={editorFontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                  >
                    <option value={12}>12px</option>
                    <option value={13}>13px</option>
                    <option value={14}>14px</option>
                    <option value={15}>15px</option>
                    <option value={16}>16px</option>
                  </select>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium text-text-primary">Contract Body Font</div>
                  <select
                    value={contractFont}
                    onChange={(e) => handleContractFontChange(e.target.value)}
                    className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                  >
                    <option value="Source Serif 4">Source Serif 4</option>
                    <option value="Inter">Inter</option>
                    <option value="Libre Baskerville">Libre Baskerville</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Security */}
        {activeSection === 'security' && (
          <section>
            <h3 className="legal-heading mb-4 text-sm text-text-primary">Security</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">Two-Factor Authentication</div>
                  <div className="text-[11px] text-text-tertiary">Add an extra layer of security</div>
                </div>
                <button className="rounded-md border border-safe-green px-3 py-1.5 text-xs text-safe-green">Enabled</button>
              </div>
              <div className="border-t border-border-default pt-4">
                <div className="text-xs font-medium text-text-primary">Change Password</div>
                <div className="mt-2 space-y-3">
                  <input type="password" placeholder="Current password" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none" />
                  <input type="password" placeholder="New password" className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none" />
                  <button className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                    Update Password
                  </button>
                </div>
              </div>
              <div className="border-t border-border-default pt-4">
                <div className="text-xs font-medium text-text-primary">Active Sessions</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-bg-surface-raised p-3">
                    <div>
                      <div className="text-xs text-text-primary">Desktop App — Electron</div>
                      <div className="text-[10px] text-text-tertiary">Current session</div>
                    </div>
                    <span className="text-[10px] text-safe-green">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Integrations */}
        {activeSection === 'integrations' && (
          <section>
            <h3 className="legal-heading mb-4 text-sm text-text-primary">Integrations</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">DocuSign</div>
                  <div className="text-[11px] text-text-tertiary">E-signature integration for contract execution</div>
                </div>
                <span className={cn('rounded-md px-3 py-1.5 text-xs', docusignKey ? 'border border-safe-green text-safe-green' : 'border border-border-default text-text-tertiary')}>
                  {docusignKey ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border-default pt-4">
                <div>
                  <div className="text-xs font-medium text-text-primary">Microsoft Word</div>
                  <div className="text-[11px] text-text-tertiary">DOCX import and export support</div>
                </div>
                <span className="rounded-md border border-safe-green px-3 py-1.5 text-xs text-safe-green">Built-in</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-default pt-4">
                <div>
                  <div className="text-xs font-medium text-text-primary">Salesforce CRM</div>
                  <div className="text-[11px] text-text-tertiary">Sync contracts with CRM opportunities</div>
                </div>
                <span className="rounded-md border border-border-default px-3 py-1.5 text-xs text-text-tertiary">Coming Soon</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
