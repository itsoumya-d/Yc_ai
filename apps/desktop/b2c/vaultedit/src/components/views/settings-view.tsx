import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Settings, FolderOpen, Cpu, Subtitles, Palette, Key, Check, AlertCircle } from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'performance', label: 'Performance', icon: Cpu },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
];

export function SettingsView() {
  const { openaiApiKey, setOpenaiApiKey, theme, setTheme } = useAppStore();

  const [activeSection, setActiveSection] = useState('general');
  const [whisperKey, setWhisperKey] = useState('');
  const [hwAccel, setHwAccel] = useState<'auto' | 'gpu' | 'cpu'>('auto');
  const [proxyEditing, setProxyEditing] = useState<'off' | '720p' | '480p'>('off');
  const [previewQuality, setPreviewQuality] = useState<'full' | 'half' | 'quarter'>('half');
  const [timelineHeight, setTimelineHeight] = useState<'compact' | 'default' | 'expanded'>('default');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const s = getSettings();
    setWhisperKey(s.whisperApiKey);
    setHwAccel(s.hwAcceleration);
    setProxyEditing(s.proxyEditing);
    setPreviewQuality(s.previewQuality);
    setTimelineHeight(s.timelineHeight);
  }, []);

  const showSave = useCallback((msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2000);
  }, []);

  const handleSaveApiKeys = useCallback(() => {
    saveSettings({ openaiApiKey, whisperApiKey: whisperKey });
    showSave('API keys saved');
  }, [openaiApiKey, whisperKey, showSave]);

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
    <div className="flex h-full">
      <div className="w-52 border-r border-border-default bg-bg-surface p-4">
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
                  : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {saveMsg && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-waveform px-3 py-2 text-xs font-medium text-white">
            <Check className="h-3.5 w-3.5" /> {saveMsg}
          </div>
        )}

        {activeSection === 'general' && (
          <section>
            <h3 className="edit-heading mb-4 text-sm text-text-primary">General</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Default Project Location</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue="~/Videos/VaultEdit" className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none" />
                  <button className="rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
                    <FolderOpen className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Auto-Save Interval</label>
                <select
                  defaultValue="120"
                  onChange={(e) => saveSettings({ autoSaveInterval: Number(e.target.value) })}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                >
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every minute</option>
                  <option value="120">Every 2 minutes</option>
                  <option value="300">Every 5 minutes</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Undo History Limit</label>
                <select
                  defaultValue="100"
                  onChange={(e) => saveSettings({ undoLimit: Number(e.target.value) })}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                >
                  <option value="50">50 steps</option>
                  <option value="100">100 steps</option>
                  <option value="200">200 steps</option>
                  <option value="999">Unlimited</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'performance' && (
          <section>
            <h3 className="edit-heading mb-4 text-sm text-text-primary">Performance</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Hardware Acceleration</div>
                <div className="flex gap-2">
                  {(['auto', 'gpu', 'cpu'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setHwAccel(opt); saveSettings({ hwAcceleration: opt }); }}
                      className={cn(
                        'rounded-md px-4 py-2 text-xs capitalize',
                        hwAccel === opt
                          ? 'bg-primary-muted text-primary-light'
                          : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      {opt === 'cpu' ? 'CPU Only' : opt === 'gpu' ? 'GPU' : 'Auto'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Proxy Editing</div>
                <div className="flex gap-2">
                  {(['off', '720p', '480p'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setProxyEditing(opt); saveSettings({ proxyEditing: opt }); }}
                      className={cn(
                        'rounded-md px-4 py-2 text-xs capitalize',
                        proxyEditing === opt
                          ? 'bg-primary-muted text-primary-light'
                          : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      {opt === 'off' ? 'Off' : opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Preview Quality</label>
                <select
                  value={previewQuality}
                  onChange={(e) => { const v = e.target.value as 'full' | 'half' | 'quarter'; setPreviewQuality(v); saveSettings({ previewQuality: v }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                >
                  <option value="full">Full</option>
                  <option value="half">Half</option>
                  <option value="quarter">Quarter</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'appearance' && (
          <section>
            <h3 className="edit-heading mb-4 text-sm text-text-primary">Appearance</h3>
            <div className="max-w-lg rounded-lg border border-border-default bg-bg-surface p-5 space-y-4">
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
                          : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Timeline Height</div>
                <select
                  value={timelineHeight}
                  onChange={(e) => { const v = e.target.value as 'compact' | 'default' | 'expanded'; setTimelineHeight(v); saveSettings({ timelineHeight: v }); }}
                  className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none"
                >
                  <option value="compact">Compact</option>
                  <option value="default">Default</option>
                  <option value="expanded">Expanded</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'api' && (
          <section>
            <h3 className="edit-heading mb-4 text-sm text-text-primary">API Keys</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-text-tertiary">Used for AI-powered editing suggestions and auto-captions.</p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Whisper API Key</label>
                <input
                  type="password"
                  value={whisperKey}
                  onChange={(e) => setWhisperKey(e.target.value)}
                  placeholder="Enter Whisper API key"
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-text-tertiary">Used for audio transcription and filler word detection.</p>
              </div>
              <button onClick={handleSaveApiKeys} className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                Save API Keys
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
