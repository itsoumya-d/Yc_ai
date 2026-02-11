import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { getSettings, saveSettings, type AppSettings } from '@/lib/storage';
import type { BlockingMode } from '@/types/database';
import { Settings, Timer, Shield, Bell, Palette, Volume2, Key, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'blocking', label: 'Blocking', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

const blockingModes: { mode: BlockingMode; label: string; description: string }[] = [
  { mode: 'strict', label: 'Strict', description: 'Block all non-essential apps and sites' },
  { mode: 'moderate', label: 'Moderate', description: 'Block social media and entertainment' },
  { mode: 'light', label: 'Light', description: 'Block only the most distracting apps' },
];

export function SettingsView() {
  const {
    blockingMode, setBlockingMode,
    focusMinutes, setFocusMinutes,
    breakMinutes, setBreakMinutes,
    longBreakMinutes, setLongBreakMinutes,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());

  // Load settings on mount
  useEffect(() => {
    const saved = getSettings();
    setSettingsState(saved);
    setFocusMinutes(saved.focusMinutes);
    setBreakMinutes(saved.breakMinutes);
    setLongBreakMinutes(saved.longBreakMinutes);
    setBlockingMode(saved.blockingMode);
  }, [setFocusMinutes, setBreakMinutes, setLongBreakMinutes, setBlockingMode]);

  function updateFocusMinutes(val: number) {
    setFocusMinutes(val);
    saveSettings({ focusMinutes: val });
    setSettingsState((s) => ({ ...s, focusMinutes: val }));
  }

  function updateBreakMinutes(val: number) {
    setBreakMinutes(val);
    saveSettings({ breakMinutes: val });
    setSettingsState((s) => ({ ...s, breakMinutes: val }));
  }

  function updateLongBreakMinutes(val: number) {
    setLongBreakMinutes(val);
    saveSettings({ longBreakMinutes: val });
    setSettingsState((s) => ({ ...s, longBreakMinutes: val }));
  }

  function updateBlockingMode(mode: BlockingMode) {
    setBlockingMode(mode);
    saveSettings({ blockingMode: mode });
    setSettingsState((s) => ({ ...s, blockingMode: mode }));
  }

  function updateTheme(theme: 'dark' | 'light' | 'system') {
    saveSettings({ theme });
    setSettingsState((s) => ({ ...s, theme }));
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleNotification(key: keyof AppSettings['notifications']) {
    const updated = { ...settings.notifications, [key]: !settings.notifications[key] };
    saveSettings({ notifications: updated });
    setSettingsState((s) => ({ ...s, notifications: updated }));
  }

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div className="w-52 border-r border-border-default bg-bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-sage-DEFAULT" />
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
                  ? 'bg-sage-muted text-sage-DEFAULT'
                  : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
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
        {/* Timer */}
        <section>
          <h3 className="focus-heading mb-4 text-sm text-text-primary">Timer</h3>
          <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
            <div>
              <label className="mb-1 block text-xs text-text-tertiary">Default Focus Duration</label>
              <select
                value={focusMinutes}
                onChange={(e) => updateFocusMinutes(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-sage-DEFAULT focus:outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-tertiary">Default Break Duration</label>
              <select
                value={breakMinutes}
                onChange={(e) => updateBreakMinutes(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-sage-DEFAULT focus:outline-none"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-tertiary">Long Break (after 4 sessions)</label>
              <select
                value={longBreakMinutes}
                onChange={(e) => updateLongBreakMinutes(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-sage-DEFAULT focus:outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        </section>

        {/* Blocking */}
        <section>
          <h3 className="focus-heading mb-4 text-sm text-text-primary">Distraction Blocking</h3>
          <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
            <div className="space-y-3">
              {blockingModes.map((b) => (
                <button
                  key={b.mode}
                  onClick={() => updateBlockingMode(b.mode)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                    blockingMode === b.mode
                      ? 'border-sage-DEFAULT bg-sage-muted'
                      : 'border-border-default hover:border-primary-DEFAULT',
                  )}
                >
                  <Shield className={cn('h-5 w-5', blockingMode === b.mode ? 'text-sage-DEFAULT' : 'text-text-tertiary')} />
                  <div>
                    <div className={cn('text-sm font-medium', blockingMode === b.mode ? 'text-sage-DEFAULT' : 'text-text-primary')}>{b.label}</div>
                    <div className="text-[11px] text-text-tertiary">{b.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="focus-heading mb-4 text-sm text-text-primary">Notifications</h3>
          <div className="max-w-lg space-y-3 rounded-lg border border-border-default bg-bg-surface p-5">
            {([
              { key: 'sessionEnd' as const, label: 'Session end chime', desc: 'Play a sound when session completes' },
              { key: 'breakReminder' as const, label: 'Break reminders', desc: 'Remind to take breaks between sessions' },
              { key: 'dailySummary' as const, label: 'Daily summary', desc: 'End-of-day focus report notification' },
              { key: 'streakAlert' as const, label: 'Streak alerts', desc: 'Notify when streak is at risk' },
            ]).map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">{n.label}</div>
                  <div className="text-[10px] text-text-tertiary">{n.desc}</div>
                </div>
                <button
                  onClick={() => toggleNotification(n.key)}
                  className={cn('h-5 w-9 rounded-full transition-colors', settings.notifications[n.key] ? 'bg-sage-DEFAULT' : 'bg-border-default')}
                >
                  <div className={cn('h-4 w-4 rounded-full bg-white transition-transform', settings.notifications[n.key] ? 'translate-x-4.5' : 'translate-x-0.5')} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section>
          <h3 className="focus-heading mb-4 text-sm text-text-primary">API Keys</h3>
          <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
            <div>
              <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
              <div className="flex gap-2">
                <input type="password" placeholder="sk-..." className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-sage-DEFAULT focus:outline-none" />
                <button className="rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">Test</button>
              </div>
            </div>
            <button className="rounded-md bg-sage-DEFAULT px-4 py-2 text-sm font-medium text-bg-root hover:bg-sage-light">
              Save API Keys
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h3 className="focus-heading mb-4 text-sm text-text-primary">Appearance</h3>
          <div className="max-w-lg rounded-lg border border-border-default bg-bg-surface p-5">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Theme</div>
                <div className="flex gap-2">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateTheme(t)}
                      className={cn(
                        'rounded-md px-4 py-2 text-xs capitalize',
                        settings.theme === t ? 'bg-sage-muted text-sage-DEFAULT' : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Timer Size</div>
                <select className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-sage-DEFAULT focus:outline-none">
                  <option>Compact</option>
                  <option>Default</option>
                  <option>Large</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
