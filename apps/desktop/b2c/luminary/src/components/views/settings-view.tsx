import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Settings, Music, Cpu, Key, Palette, Check } from 'lucide-react';

const sections = [
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'ai', label: 'AI Engine', icon: Cpu },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsView() {
  const { openaiApiKey, setOpenaiApiKey, theme, setTheme } = useAppStore();

  const [activeSection, setActiveSection] = useState('audio');
  const [sampleRate, setSampleRate] = useState(44100);
  const [bufferSize, setBufferSize] = useState(512);
  const [defaultGenre, setDefaultGenre] = useState('pop');
  const [creativityLevel, setCreativityLevel] = useState(65);
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [localApiKey, setLocalApiKey] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const s = getSettings();
    setSampleRate(s.sampleRate);
    setBufferSize(s.bufferSize);
    setDefaultGenre(s.defaultGenre);
    setCreativityLevel(s.creativityLevel);
    setAutoSuggest(s.autoSuggest);
    setLocalApiKey(s.openaiApiKey);
  }, []);

  const showSave = useCallback((msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2000);
  }, []);

  const handleSaveApiKey = useCallback(() => {
    setOpenaiApiKey(localApiKey);
    saveSettings({ openaiApiKey: localApiKey });
    showSave('API key saved');
  }, [localApiKey, setOpenaiApiKey, showSave]);

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
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-accent-DEFAULT px-3 py-2 text-xs font-medium text-white">
            <Check className="h-3.5 w-3.5" /> {saveMsg}
          </div>
        )}

        {activeSection === 'audio' && (
          <section>
            <h3 className="music-heading mb-4 text-sm text-text-primary">Audio Settings</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Sample Rate</label>
                <select
                  value={sampleRate}
                  onChange={(e) => { const v = Number(e.target.value); setSampleRate(v); saveSettings({ sampleRate: v }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value={44100}>44100 Hz</option>
                  <option value={48000}>48000 Hz</option>
                  <option value={96000}>96000 Hz</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Buffer Size</label>
                <select
                  value={bufferSize}
                  onChange={(e) => { const v = Number(e.target.value); setBufferSize(v); saveSettings({ bufferSize: v }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value={128}>128 samples (low latency)</option>
                  <option value={256}>256 samples</option>
                  <option value={512}>512 samples (recommended)</option>
                  <option value={1024}>1024 samples</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'ai' && (
          <section>
            <h3 className="music-heading mb-4 text-sm text-text-primary">AI Engine</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Default Genre</label>
                <select
                  value={defaultGenre}
                  onChange={(e) => { setDefaultGenre(e.target.value); saveSettings({ defaultGenre: e.target.value as any }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                  <option value="hiphop">Hip Hop</option>
                  <option value="lofi">Lo-Fi</option>
                  <option value="rnb">R&B</option>
                  <option value="classical">Classical</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Creativity Level ({creativityLevel}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={creativityLevel}
                  onChange={(e) => { const v = Number(e.target.value); setCreativityLevel(v); saveSettings({ creativityLevel: v }); }}
                  className="w-full accent-primary-DEFAULT"
                />
                <div className="flex justify-between text-[10px] text-text-tertiary">
                  <span>Conservative</span>
                  <span>Experimental</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">Auto-suggest</div>
                  <div className="text-[10px] text-text-tertiary">Show AI suggestions while composing</div>
                </div>
                <button
                  onClick={() => { const v = !autoSuggest; setAutoSuggest(v); saveSettings({ autoSuggest: v }); }}
                  className={cn('h-5 w-9 rounded-full p-0.5 transition-colors', autoSuggest ? 'bg-primary-DEFAULT' : 'bg-border-default')}
                >
                  <div className={cn('h-4 w-4 rounded-full bg-white transition-transform', autoSuggest ? 'translate-x-4' : 'translate-x-0')} />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'api' && (
          <section>
            <h3 className="music-heading mb-4 text-sm text-text-primary">API Keys</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-DEFAULT focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-text-tertiary">Used for AI chord suggestions, melody generation, and mixing tips.</p>
              </div>
              <button onClick={handleSaveApiKey} className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                Save API Key
              </button>
            </div>
          </section>
        )}

        {activeSection === 'appearance' && (
          <section>
            <h3 className="music-heading mb-4 text-sm text-text-primary">Appearance</h3>
            <div className="max-w-lg rounded-lg border border-border-default bg-bg-surface p-5">
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
          </section>
        )}
      </div>
    </div>
  );
}
